import { handleApi } from './api.mjs';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env);
    if (/^\/(?:server|\.openai|db|drizzle|test|tools)(?:\/|$)/.test(url.pathname)) return new Response('Not found', { status: 404 });
    if (!env.ASSETS) return new Response('Assets unavailable', { status: 503 });
    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    headers.set('x-content-type-options', 'nosniff');
    headers.set('referrer-policy', 'same-origin');
    if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('.js')) headers.set('cache-control', 'no-cache');
    return new Response(asset.body, { status: asset.status, headers });
  },
};
