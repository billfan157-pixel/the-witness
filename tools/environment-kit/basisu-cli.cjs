// Official Basis Universal v2.50 single-thread WASI CLI, no machine-wide install.
const {WASI}=require('node:wasi'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const wasi=new WASI({version:'preview1',args:['basisu',...process.argv.slice(2)],
 preopens:{'/work':root},returnOnExit:true});
const moduleBytes=fs.readFileSync(path.join(__dirname,'bin/basisu_st.wasm'));
const instance=new WebAssembly.Instance(new WebAssembly.Module(moduleBytes),wasi.getImportObject());
process.exitCode=wasi.start(instance)??0;
