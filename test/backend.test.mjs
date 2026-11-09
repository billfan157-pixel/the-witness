import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';
import Model from '../witness-model.js';

test('production Worker and D1: authorization, durable saves, conflict and recovery',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'witness-backend-test-')),scriptPath=path.join(dir,'worker.mjs');
  await build({entryPoints:['server/worker.mjs'],outfile:scriptPath,bundle:true,format:'esm',platform:'browser',target:'es2022'});
  const config={modules:true,scriptPath,modulesRoot:dir,compatibilityDate:'2026-07-30',d1Databases:['DB'],d1Persist:path.join(dir,'d1')};
  let mf=new Miniflare(config);
  try{
    const db=await mf.getD1Database('DB');
    for(const name of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){
      const parts=fs.readFileSync(path.join('drizzle',name),'utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
      await db.batch(parts.map(s=>db.prepare(s)));
    }
    const send=async(path,{user='player_A',method='GET',data,headers={}}={})=>{
      const response=await mf.dispatchFetch('https://game.example'+path,{method,headers:{...(user?{'oai-authenticated-user-id':user,'x-witness-account':user}:{}),
        ...(data?{'content-type':'application/json','origin':'https://game.example','x-witness-client':'1'}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})});
      return {status:response.status,headers:response.headers,data:await response.json()};
    };
    const payload=(state=Model.fresh(),baseRevision=0,mutationId=crypto.randomUUID())=>({state,baseRevision,clientId:'test-device-A',mutationId});
    let first;
    await t.test('anonymous players can inspect session but cannot read or write progress',async()=>{
      assert.equal((await send('/api/session',{user:null})).data.authenticated,false);
      assert.equal((await send('/api/health',{user:null})).data.status,'ok');
      assert.equal((await send('/api/saves/1',{user:null})).status,401);
      assert.equal((await send('/api/saves/1',{user:null,method:'PUT',data:payload()})).status,401);
    });
    await t.test('same-origin protection rejects absent, cross-origin and unmarked writes',async()=>{
      for(const headers of [{origin:''},{origin:'https://evil.example'},{'x-witness-client':''},{'sec-fetch-site':'cross-site'}]){
        assert.equal((await send('/api/saves/1',{method:'PUT',data:payload(),headers})).status,403);
      }
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM players').first()).n,0);
    });
    await t.test('save roundtrip keeps choices, drafts and exact checkpoints and acknowledges a digest',async()=>{
      const state=Model.fresh({name:'Người Chơi A'});state.positions.Q01=[3.5,-2];state.flags.testCheckpoint='kept';
      const p=payload(state);first=await send('/api/saves/1',{method:'PUT',data:p});
      assert.equal(first.status,200);assert.equal(first.data.save.revision,1);assert.match(first.data.save.hash,/^[a-f0-9]{64}$/);
      const saved=(await send('/api/saves/1')).data.save;assert.equal(saved.state.profile.name,'Người Chơi A');assert.equal(saved.state.flags.testCheckpoint,'kept');assert.deepEqual(saved.state.positions.Q01,[3.5,-2]);
      assert.equal(first.headers.get('cache-control'),'private, no-store');assert(first.headers.get('x-request-id'));
      const retry=await send('/api/saves/1',{method:'PUT',data:p});assert.equal(retry.data.save.revision,1);assert.equal(retry.data.replayed,true);
      p.state.flags.changed=true;assert.equal((await send('/api/saves/1',{method:'PUT',data:p})).status,409);
    });
    await t.test('account isolation ignores a caller-supplied owner in the payload or query string',async()=>{
      assert.equal((await send('/api/saves/1',{user:'player_B'})).data.save,null);
      const other=payload(Model.fresh({name:'Người Chơi B'}));other.userId='player_A';
      assert.equal((await send('/api/saves/1?userId=player_A',{user:'player_B',method:'PUT',data:other})).status,200);
      assert.equal((await send('/api/saves/1')).data.save.state.profile.name,'Người Chơi A');
      assert.equal((await send('/api/saves/1/history/1',{user:'player_B'})).data.save.state.profile.name,'Người Chơi B');
      const exp=(await send('/api/account/export',{user:'player_B'})).data;assert.equal(exp.saves.length,1);assert.equal(exp.saves[0].state.profile.name,'Người Chơi B');
    });
    await t.test('two simultaneous devices get exactly one successful CAS; stale device cannot overwrite',async()=>{
      const a=Model.fresh();a.flags.device='A';const b=Model.fresh();b.flags.device='B';
      const results=await Promise.all([send('/api/saves/1',{method:'PUT',data:payload(a,1)}),send('/api/saves/1',{method:'PUT',data:payload(b,1)})]);
      assert.deepEqual(results.map(x=>x.status).sort(),[200,409]);
      const winner=results.find(x=>x.status===200).data.save;
      assert.equal((await send('/api/saves/1')).data.save.state.flags.device,winner.state.flags.device);
      assert.equal((await send('/api/saves/1/history')).data.revisions.length,2);
      assert.equal((await send('/api/saves/2',{method:'PUT',data:payload(a,7)})).status,409);
    });
    await t.test('server validates save schema, size, dangerous keys and slot bounds',async()=>{
      assert.equal((await send('/api/saves/1',{method:'PUT',data:payload(),headers:{'x-witness-account':'another-account'}})).data.error.code,'ACCOUNT_CHANGED');
      assert.equal((await send('/api/saves/2',{method:'PUT',data:payload({schema:99})})).status,422);
      const bad=Model.fresh();bad.resources.food=-1;assert.equal((await send('/api/saves/2',{method:'PUT',data:payload(bad)})).status,422);
      const unsafe=JSON.parse(JSON.stringify(Model.fresh()).replace('"flags":{}','"flags":{"__proto__":{"polluted":true}}'));
      assert.equal((await send('/api/saves/2',{method:'PUT',data:payload(unsafe)})).status,422);assert.equal({}.polluted,undefined);
      const big=Model.fresh();big.flags.large='a'.repeat(530000);assert.equal((await send('/api/saves/2',{method:'PUT',data:payload(big)})).status,413);
      assert.equal((await send('/api/saves/4',{method:'PUT',data:payload()})).status,404);
    });
    await t.test('history is bounded, deletion uses a tombstone and old history restores as a new revision',async()=>{
      for(let n=0;n<12;n++){const state=Model.fresh();state.flags.iteration=n;assert.equal((await send('/api/saves/2',{method:'PUT',data:payload(state,n)})).status,200);}
      const history=(await send('/api/saves/2/history')).data.revisions;assert.equal(history.length,10);assert.equal(history[0].revision,12);assert.equal(history.at(-1).revision,3);
      const older=(await send('/api/saves/2/history/3')).data.save;
      assert.equal((await send('/api/saves/2',{method:'DELETE',data:payload(null,12)})).data.save.deleted,true);
      assert.equal((await send('/api/saves/2',{method:'PUT',data:payload(older.state,12)})).status,409);
      const restored=await send('/api/saves/2',{method:'PUT',data:payload(older.state,13)});assert.equal(restored.data.save.revision,14);assert.equal(restored.data.save.state.flags.iteration,2);
    });
    await t.test('corrupt stored data is detected and a valid historic snapshot remains available',async()=>{
      await db.prepare("UPDATE game_saves SET data_json='{}' WHERE user_id=? AND slot=1").bind('player_A').run();
      assert.equal((await send('/api/saves/1')).data.error.code,'SAVE_INTEGRITY');
      assert.equal((await send('/api/saves/1/history/1')).data.save.state.profile.name,'Người Chơi A');
    });
    await t.test('a prior-day backup survives beyond the ten recent autosaves',async()=>{
      const first=payload(Model.fresh({name:'Yesterday'}));await send('/api/saves/3',{method:'PUT',data:first});
      const yesterday=new Date(Date.now()-86400000).toISOString();
      await db.prepare('UPDATE save_revisions SET created_at=? WHERE user_id=? AND slot=3 AND revision=1').bind(yesterday,'player_A').run();
      for(let n=1;n<=12;n++)assert.equal((await send('/api/saves/3',{method:'PUT',data:payload(Model.fresh(),n)})).status,200);
      const rows=(await send('/api/saves/3/history')).data.revisions;assert.equal(rows.length,11);assert.equal(rows.at(-1).revision,1);
      assert.equal((await send('/api/saves/3/history/1')).data.save.state.profile.name,'Yesterday');
    });
    await t.test('write throttling persists in the database and returns Retry-After',async()=>{
      for(let n=0;n<90;n++)assert.equal((await send('/api/account',{user:'limited',method:'PUT',data:{displayName:'Test'}})).status,200);
      const limited=await send('/api/account',{user:'limited',method:'PUT',data:{displayName:'Test'}});assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'60');
      assert.equal((await send('/api/account',{user:'limited'})).status,200);
    });
    await t.test('account erasure cascades to saves, history, audit and limits for that account only',async()=>{
      assert.equal((await send('/api/account',{user:'player_B',method:'DELETE',data:{confirm:'no'}})).status,422);
      assert.equal((await send('/api/account',{user:'player_B',method:'DELETE',data:{confirm:'XOA'}})).status,200);
      for(const table of ['players','game_saves','save_revisions','save_audit','write_limits'])assert.equal((await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE user_id=?`).bind('player_B').first()).n,0);
      assert((await db.prepare('SELECT COUNT(*) AS n FROM game_saves WHERE user_id=?').bind('player_A').first()).n>0);
    });
    await t.test('D1 data survives destroying and restarting the Worker runtime',async()=>{
      await mf.dispose();mf=new Miniflare(config);
      const response=await send('/api/saves/2');assert.equal(response.status,200);assert.equal(response.data.save.revision,14);assert.equal(response.data.save.state.flags.iteration,2);
    });
  }finally{await mf.dispose();fs.rmSync(dir,{recursive:true,force:true});}
});
