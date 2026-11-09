import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Miniflare } from 'miniflare';
import { handleApi } from '../server/api.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=Number(process.env.PORT||8035);
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("local");}}',
  compatibilityDate:'2026-07-30',d1Databases:['DB'],d1Persist:path.join(root,'.witness-runtime/d1')});
const db=await mf.getD1Database('DB');
await db.exec('CREATE TABLE IF NOT EXISTS _local_migrations(name TEXT PRIMARY KEY)');
for(const name of fs.readdirSync(path.join(root,'drizzle')).filter(f=>f.endsWith('.sql')).sort()){
  if(await db.prepare('SELECT name FROM _local_migrations WHERE name=?').bind(name).first())continue;
  const sql=fs.readFileSync(path.join(root,'drizzle',name),'utf8');
  const statements=sql.split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean);
  await db.batch([...statements.map(x=>db.prepare(x)),db.prepare('INSERT INTO _local_migrations(name) VALUES(?)').bind(name)]);
}
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.wasm':'application/wasm','.glb':'model/gltf-binary','.ktx2':'image/ktx2'};
const server=http.createServer(async(req,res)=>{
  try{
    const authority=new URL('http://'+req.headers.host),url=new URL(req.url,authority);
    if(!['127.0.0.1','localhost'].includes(authority.hostname)||!['127.0.0.1','::ffff:127.0.0.1','::1'].includes(req.socket.remoteAddress)||authority.origin!==url.origin){res.writeHead(403);res.end();return;}
    const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__witness_local_user='));
    const user=cookie?.split('=')[1];
    if(['/signin-with-chatgpt','/signout-with-chatgpt'].includes(url.pathname)){
      if(req.method!=='GET'||req.headers.origin&&req.headers.origin!==url.origin||req.headers['sec-fetch-site']==='cross-site'&&req.headers['sec-fetch-mode']!=='navigate'){res.writeHead(403);res.end();return;}
      const signIn=url.pathname==='/signin-with-chatgpt';
      // Deliberately local-only demo identity. No hosted routes/cookies are implemented by the game.
      const localUser=['local_player_one','local_player_two'].includes(url.searchParams.get('local_user'))?url.searchParams.get('local_user'):'local_player_one';
      const target=url.searchParams.get('return_to');
      res.writeHead(302,{'Location':target?.startsWith('/')&&!target.startsWith('//')&&!target.includes('\\')?target:'/',
        'Cache-Control':'no-store','Set-Cookie':`__witness_local_user=${signIn?localUser:''}; Path=/; HttpOnly; SameSite=Lax${signIn?'':'; Max-Age=0'}`});res.end();return;
    }
    if(url.pathname.startsWith('/api/')){
      const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value&&!key.startsWith('oai-authenticated-user-'))headers.set(key,Array.isArray(value)?value.join(','):value);
      if(['local_player_one','local_player_two'].includes(user))headers.set('oai-authenticated-user-id',user);
      const request=new Request(url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
      const response=await handleApi(request,{DB:db});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    const name=decodeURIComponent(url.pathname);
    if(name.split('/').some(p=>p.startsWith('.'))||/^\/(server|db|drizzle|tools|test|node_modules|outputs)(\/|$)/.test(name))throw Error('Not found');
    const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(root+path.sep)||!fs.statSync(file).isFile())throw Error('Not found');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
  }catch{if(!res.headersSent)res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/\nCloud preview uses local D1 and local demo sign-in only.`));
async function stop(){server.close();await mf.dispose();process.exit(0);}process.on('SIGINT',stop);process.on('SIGTERM',stop);
