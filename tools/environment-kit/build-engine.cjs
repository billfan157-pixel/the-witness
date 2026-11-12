const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),file=path.join(root,'vendor/adventure-3d.js'),s=fs.readFileSync(file,'utf8');
const start=s.indexOf('function hS('),end=s.lastIndexOf('globalThis.Adventure3D=');
if(start<0||end<start)throw Error('Pinned engine boundaries changed');
const prefix=s.slice(0,start);
if(crypto.createHash('sha256').update(prefix.replace(/\r\n/g,'\n')).digest('hex')!=='35c3238a6ff745561b540fed408c9baeaa79d2185a7e1eca4c30aa4ae3b1e0ed')throw Error('Pinned Three/core prefix changed; review before rebuilding');
fs.writeFileSync(file,prefix+fs.readFileSync(path.join(__dirname,'engine-runtime.js'),'utf8')+'\n'+s.slice(end));
console.log('Built readable player runtime into shared Three r187 vendor engine');
