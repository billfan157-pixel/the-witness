import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import outputTools from './build-output.cjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist'),client=path.join(dist,'client'),server=path.join(dist,'server');
const hosting=JSON.parse(fs.readFileSync(path.join(root,'.openai/hosting.json'),'utf8'));
if(hosting.static||hosting.d1!=='DB')throw Error('Cloud build requires the DB binding and Worker hosting.');
for(const name of ['dist/client','dist/server','dist/.openai'])outputTools.prepareOutput(root,name);
// The existing static/offline builder remains usable independently.
for(const entry of fs.readdirSync(dist,{withFileTypes:true})){
  if(['client','server','.openai'].includes(entry.name))continue;
  fs.cpSync(path.join(dist,entry.name),path.join(client,entry.name),{recursive:true});
}
await build({entryPoints:[path.join(root,'server/worker.mjs')],outfile:path.join(server,'index.js'),
  bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'none'});
fs.mkdirSync(path.join(dist,'.openai'),{recursive:true});
fs.copyFileSync(path.join(root,'.openai/hosting.json'),path.join(dist,'.openai/hosting.json'));
fs.cpSync(path.join(root,'drizzle'),path.join(dist,'.openai/drizzle'),{recursive:true});
fs.writeFileSync(path.join(server,'wrangler.json'),JSON.stringify({name:'witness-cloud',main:'index.js',
  compatibility_date:'2026-07-30',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true},
  d1_databases:[{binding:'DB',database_name:'witness-cloud',database_id:'00000000-0000-4000-8000-000000000000'}],
  observability:{enabled:true}},null,2));
console.log(JSON.stringify({worker:'dist/server/index.js',assets:'dist/client',database:'DB',apiVersion:1}));
