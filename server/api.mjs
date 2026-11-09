import Model from '../witness-model.js';

export const LIMITS = Object.freeze({ slots: 3, history: 10, dailyBackups: 14, saveBytes: 524288, writesPerMinute: 90 });
const encoder = new TextEncoder();
const idPattern = /^[a-zA-Z0-9_-]{8,100}$/;
class ApiError extends Error {
  constructor(status, code, message, extra = {}) { super(message); Object.assign(this, { status, code, extra }); }
}
const fail = (status, code, message, extra) => { throw new ApiError(status, code, message, extra); };
const statement = (db, sql, ...values) => db.prepare(sql).bind(...values);
export async function digest(text) {
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
}
function metadata(row) {
  return row && { slot: row.slot, revision: row.revision, hash: row.sha256, chapter: row.chapter,
    characterName: row.character_name, updatedAt: row.updated_at || row.created_at,
    clientId: row.client_id, deleted: !!row.deleted };
}
async function unpack(row) {
  if (!row) return null;
  if (row.deleted) return { ...metadata(row), state: null };
  if (await digest(row.data_json) !== row.sha256) fail(500, 'SAVE_INTEGRITY', 'Bản lưu không qua kiểm tra toàn vẹn. Hãy chọn một phiên bản trong lịch sử.');
  return { ...metadata(row), state: JSON.parse(row.data_json) };
}
function method(request, allowed) {
  if (!allowed.includes(request.method)) fail(405, 'METHOD_NOT_ALLOWED', 'Thao tác không được hỗ trợ.', { allow: allowed.join(', ') });
}
async function body(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) fail(415, 'JSON_REQUIRED', 'Yêu cầu dữ liệu JSON.');
  const max = LIMITS.saveBytes + 4096;
  if (Number(request.headers.get('content-length')) > max) fail(413, 'SAVE_TOO_LARGE', 'Bản lưu vượt giới hạn dung lượng.');
  const reader = request.body?.getReader();
  if (!reader) fail(400, 'INVALID_JSON', 'Thiếu dữ liệu.');
  let size = 0; const chunks = [];
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength;
      if (size > max) { await reader.cancel(); fail(413, 'SAVE_TOO_LARGE', 'Bản lưu vượt giới hạn dung lượng.'); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error();
    return data;
  } catch (error) { if (error instanceof ApiError) throw error; fail(400, 'INVALID_JSON', 'Dữ liệu JSON không hợp lệ.'); }
}
function safeTree(value, depth = 0, count = { n: 0 }) {
  if (++count.n > 60000 || depth > 32) fail(422, 'INVALID_SAVE', 'Cấu trúc bản lưu vượt giới hạn.');
  if (value && typeof value === 'object') for (const key of Object.keys(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) fail(422, 'INVALID_SAVE', 'Bản lưu có khóa không hợp lệ.');
    safeTree(value[key], depth + 1, count);
  }
}
function canonicalState(raw) {
  safeTree(raw);
  let state;
  try { state = Model.restore(raw); } catch { fail(422, 'INVALID_SAVE', 'Bản lưu không tương thích hoặc tiến trình không hợp lệ.'); }
  const data = JSON.stringify(state);
  if (encoder.encode(data).byteLength > LIMITS.saveBytes) fail(413, 'SAVE_TOO_LARGE', 'Bản lưu vượt giới hạn 512 KiB. Bản trên máy vẫn được giữ.');
  return { state, data };
}
function identity(request) {
  const userId = request.headers.get('oai-authenticated-user-id');
  if (!userId || userId.length > 256) return null;
  // Only the Sites dispatch gateway injects these headers. Never accept user IDs from a body/query/cookie.
  return { id: userId };
}
function writeGuard(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site')
    fail(403, 'ORIGIN_REQUIRED', 'Thao tác phải được thực hiện từ trang game.');
  if (request.headers.get('x-witness-client') !== '1') fail(403, 'CLIENT_REQUIRED', 'Thiếu thông tin xác thực thao tác.');
}
async function ensurePlayer(db, userId) {
  const now = new Date().toISOString();
  await statement(db, 'INSERT INTO players(user_id,display_name,created_at,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO NOTHING', userId, 'Người Chứng', now, now).run();
  return statement(db, 'SELECT display_name,created_at FROM players WHERE user_id=?', userId).first();
}
async function rateLimit(db, userId) {
  const window = Math.floor(Date.now() / 60000);
  const row = await statement(db, `INSERT INTO write_limits(user_id,window_start,request_count) VALUES(?,?,1)
    ON CONFLICT(user_id) DO UPDATE SET window_start=excluded.window_start,
    request_count=CASE WHEN write_limits.window_start=excluded.window_start THEN write_limits.request_count+1 ELSE 1 END
    RETURNING request_count`, userId, window).first();
  if (row.request_count > LIMITS.writesPerMinute) fail(429, 'RATE_LIMITED', 'Đang lưu quá nhiều lần. Hệ thống sẽ thử lại sau một phút.');
}
async function current(db, userId, slot) { return statement(db, 'SELECT * FROM game_saves WHERE user_id=? AND slot=?', userId, slot).first(); }
async function writeSave(db, userId, slot, input, deleted = false) {
  const { baseRevision, clientId, mutationId } = input;
  if (!Number.isSafeInteger(baseRevision) || baseRevision < 0 || baseRevision >= 2147483647 ||
      !idPattern.test(clientId || '') || !idPattern.test(mutationId || '')) fail(422, 'INVALID_VERSION', 'Thông tin phiên bản lưu không hợp lệ.');
  const { state, data } = deleted ? { state: null, data: null } : canonicalState(input.state);
  const hash = data === null ? null : await digest(data);
  const previous = await statement(db, 'SELECT * FROM save_revisions WHERE user_id=? AND mutation_id=?', userId, mutationId).first();
  if (previous) {
    if (previous.slot !== slot || previous.sha256 !== hash || !!previous.deleted !== deleted) fail(409, 'MUTATION_REUSED', 'Mã lần lưu đã được dùng cho dữ liệu khác.');
    return { save: await unpack(previous), replayed: true };
  }
  const time = new Date().toISOString(), revision = baseRevision + 1;
  // CAS and history run in one D1 transaction. A stale device cannot overwrite another device's commit.
  const values = [userId, slot, revision, data, hash, state?.chapter ?? null, state?.profile.name ?? null, clientId, mutationId, time, +deleted];
  const results = await db.batch([
    statement(db, `INSERT INTO game_saves(user_id,slot,revision,data_json,sha256,chapter,character_name,client_id,mutation_id,updated_at,deleted)
      SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM game_saves WHERE user_id=? AND slot=?)
      ON CONFLICT(user_id,slot) DO UPDATE SET revision=excluded.revision,data_json=excluded.data_json,sha256=excluded.sha256,
      chapter=excluded.chapter,character_name=excluded.character_name,client_id=excluded.client_id,mutation_id=excluded.mutation_id,
      updated_at=excluded.updated_at,deleted=excluded.deleted WHERE game_saves.revision=?`, ...values, baseRevision, userId, slot, baseRevision),
    statement(db, `INSERT INTO save_revisions(user_id,slot,revision,data_json,sha256,chapter,character_name,client_id,mutation_id,created_at,deleted)
      SELECT user_id,slot,revision,data_json,sha256,chapter,character_name,client_id,mutation_id,updated_at,deleted FROM game_saves
      WHERE user_id=? AND slot=? AND mutation_id=? ON CONFLICT DO NOTHING`, userId, slot, mutationId),
    statement(db, `INSERT INTO save_audit(id,user_id,action,slot,revision,created_at) SELECT ?,?,?,?,?,?
      WHERE EXISTS(SELECT 1 FROM game_saves WHERE user_id=? AND slot=? AND mutation_id=?) ON CONFLICT DO NOTHING`,
    mutationId, userId, deleted ? 'delete' : 'save', slot, revision, time, userId, slot, mutationId),
    statement(db, `DELETE FROM save_revisions WHERE user_id=? AND slot=? AND revision NOT IN
      (SELECT revision FROM save_revisions WHERE user_id=? AND slot=? ORDER BY revision DESC LIMIT ?)
      AND revision NOT IN (SELECT MAX(revision) FROM save_revisions WHERE user_id=? AND slot=? AND created_at>=? GROUP BY substr(created_at,1,10))`,
    userId, slot, userId, slot, LIMITS.history, userId, slot, new Date(Date.now()-13*86400000).toISOString().slice(0,10)),
    statement(db, `DELETE FROM save_audit WHERE user_id=? AND id NOT IN (SELECT id FROM save_audit WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT 200)`, userId, userId),
    statement(db, 'SELECT * FROM save_revisions WHERE user_id=? AND slot=? AND mutation_id=?', userId, slot, mutationId),
  ]);
  const saved = results[5].results[0];
  if (!saved) fail(409, 'SAVE_CONFLICT', 'Một thiết bị khác đã lưu trước. Hãy chọn bản cần tiếp tục.', { remote: metadata(await current(db, userId, slot)) });
  return { save: await unpack(saved), replayed: false };
}
export async function handleApi(request, env) {
  const requestId = crypto.randomUUID(); const start = Date.now();
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff', 'referrer-policy': 'same-origin', 'vary': 'Cookie, oai-authenticated-user-id', 'x-request-id': requestId };
  const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  const path = new URL(request.url).pathname;
  try {
    if (path === '/api/health') {
      method(request, ['GET']);
      if (!env.DB) fail(503, 'DATABASE_UNAVAILABLE', 'Dịch vụ lưu đám mây chưa sẵn sàng.');
      await env.DB.prepare('SELECT user_id FROM players LIMIT 0').all();
      return reply({ status: 'ok', service: 'witness-cloud', apiVersion: 1 });
    }
    const user = identity(request);
    if (path === '/api/session') {
      method(request, ['GET']);
      return reply({ authenticated: !!user, user, limits: LIMITS, signIn: '/signin-with-chatgpt?return_to=%2F', signOut: '/signout-with-chatgpt?return_to=%2F' });
    }
    if (!user) fail(401, 'SIGN_IN_REQUIRED', 'Đăng nhập để sử dụng bản lưu đám mây.');
    if (request.headers.get('x-witness-account') !== user.id) fail(401, 'ACCOUNT_CHANGED', 'Tài khoản đã thay đổi. Hãy kết nối lại trước khi đồng bộ.');
    if (!env.DB) fail(503, 'DATABASE_UNAVAILABLE', 'Dịch vụ lưu đám mây đang tạm gián đoạn. Bản trên máy vẫn được giữ.');
    const db = env.DB;
    if (!['GET', 'HEAD'].includes(request.method)) writeGuard(request);
    if (path === '/api/account' && request.method === 'DELETE') {
      const input = await body(request);
      if (input.confirm !== 'XOA') fail(422, 'CONFIRM_REQUIRED', 'Nhập XOA để xác nhận xóa dữ liệu đám mây.');
      await statement(db, 'DELETE FROM players WHERE user_id=?', user.id).run();
      return reply({ deleted: true });
    }
    // Read requests do not allocate database records for every anonymous/public visitor.
    if (!['GET', 'HEAD'].includes(request.method)) { await ensurePlayer(db, user.id); await rateLimit(db, user.id); }
    if (path === '/api/account') {
      method(request, ['GET', 'PUT']);
      if (request.method === 'PUT') {
        const input = await body(request);
        if (typeof input.displayName !== 'string' || input.displayName.trim().length < 1 || input.displayName.trim().length > 40 || /[\u0000-\u001f]/.test(input.displayName)) fail(422, 'INVALID_NAME', 'Tên hiển thị cần từ 1 đến 40 ký tự.');
        await statement(db, 'UPDATE players SET display_name=?,updated_at=? WHERE user_id=?', input.displayName.trim(), new Date().toISOString(), user.id).run();
      }
      const player = await statement(db, 'SELECT display_name,created_at,updated_at FROM players WHERE user_id=?', user.id).first();
      const slots = (await statement(db, 'SELECT slot,revision,sha256,chapter,character_name,client_id,updated_at,deleted FROM game_saves WHERE user_id=? ORDER BY slot', user.id).all()).results.map(metadata);
      return reply({ user, profile: player || { display_name: 'Người Chứng' }, slots, limits: LIMITS });
    }
    if (path === '/api/account/export') {
      method(request, ['GET']);
      const profile = await statement(db, 'SELECT display_name,created_at,updated_at FROM players WHERE user_id=?', user.id).first();
      const saves = (await statement(db, 'SELECT * FROM game_saves WHERE user_id=? ORDER BY slot', user.id).all()).results;
      const revisions = (await statement(db, 'SELECT * FROM save_revisions WHERE user_id=? ORDER BY slot,revision', user.id).all()).results;
      return reply({ format: 'witness-account-export-v1', exportedAt: new Date().toISOString(), profile,
        saves: await Promise.all(saves.map(unpack)), revisions: await Promise.all(revisions.map(unpack)) });
    }
    const match = /^\/api\/saves\/([1-3])(?:\/history(?:\/([1-9][0-9]{0,9}))?)?$/.exec(path);
    if (match) {
      const slot = Number(match[1]), historical = path.includes('/history');
      if (historical) {
        method(request, ['GET']);
        if (match[2]) {
          const row = await statement(db, 'SELECT * FROM save_revisions WHERE user_id=? AND slot=? AND revision=?', user.id, slot, Number(match[2])).first();
          if (!row) fail(404, 'SAVE_NOT_FOUND', 'Phiên bản này không còn trong lịch sử.');
          return reply({ save: await unpack(row) });
        }
        const rows = (await statement(db, 'SELECT slot,revision,sha256,chapter,character_name,client_id,created_at,deleted FROM save_revisions WHERE user_id=? AND slot=? ORDER BY revision DESC LIMIT ?', user.id, slot, LIMITS.history+LIMITS.dailyBackups).all()).results;
        return reply({ revisions: rows.map(metadata) });
      }
      method(request, ['GET', 'PUT', 'DELETE']);
      if (request.method === 'GET') return reply({ save: await unpack(await current(db, user.id, slot)) });
      return reply(await writeSave(db, user.id, slot, await body(request), request.method === 'DELETE'));
    }
    fail(404, 'NOT_FOUND', 'Không tìm thấy chức năng này.');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) headers['retry-after'] = '60';
      if (error.status === 405) headers.allow = error.extra.allow;
      return reply({ error: { code: error.code, message: error.message, ...error.extra }, requestId }, error.status);
    }
    // Request IDs connect reports to logs; no account IDs, payloads, tokens or SQL are logged.
    console.error(JSON.stringify({ event: 'api_failure', requestId, path, durationMs: Date.now() - start, type: error?.name || 'Error' }));
    return reply({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Chưa kết nối được dịch vụ lưu. Bản trên máy vẫn được giữ.' }, requestId }, 503);
  }
}
