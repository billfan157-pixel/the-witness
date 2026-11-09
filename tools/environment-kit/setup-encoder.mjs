import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const expected='b42d951b1bf146133578e8c7927ad4a4a857552846a46a3ee33b541b2a06bc7d';
const url='https://raw.githubusercontent.com/BinomialLLC/basis_universal/v2_50/bin/basisu_st.wasm';
const file=path.join(import.meta.dirname,'bin/basisu_st.wasm');fs.mkdirSync(path.dirname(file),{recursive:true});
let data=fs.existsSync(file)?fs.readFileSync(file):null;
if(!data){const response=await fetch(url);if(!response.ok)throw Error('Encoder download failed');data=Buffer.from(await response.arrayBuffer());}
if(crypto.createHash('sha256').update(data).digest('hex')!==expected)throw Error('Encoder checksum mismatch');
fs.writeFileSync(file,data);console.log('Verified pinned Basis Universal v2.50 WASI encoder');
