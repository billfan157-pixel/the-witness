import fs from 'node:fs';import path from 'node:path';import * as T from 'three';import {build} from 'esbuild';
const here=import.meta.dirname,root=path.resolve(here,'../..');
const shim=path.join(here,'three-shim.generated.mjs');fs.writeFileSync(shim,Object.keys(T).map(k=>`export const ${k}=globalThis.__WitnessKitThree.${k};`).join('\n'));
const resolve=relative=>path.join(here,'node_modules',relative).replaceAll('\\','/');
const entry=`export {GLTFLoader} from ${JSON.stringify(resolve('three/examples/jsm/loaders/GLTFLoader.js'))};
 export {KTX2Loader} from ${JSON.stringify(resolve('three/examples/jsm/loaders/KTX2Loader.js'))};
 export {MeshoptDecoder} from ${JSON.stringify(resolve('meshoptimizer/meshopt_decoder.module.js'))};
 export {createKit} from './runtime.mjs';`;
// meshoptimizer publishes a decoder module under its package export; resolve it rather than guessing filenames.
const decoder=import.meta.resolve('meshoptimizer/decoder');
const contents=entry.replace(resolve('meshoptimizer/meshopt_decoder.module.js'),new URL(decoder).pathname.replace(/^\/(\w:)/,'$1'));
const result=await build({stdin:{contents,resolveDir:here},bundle:true,format:'iife',globalName:'WitnessKitAddon',alias:{three:shim},minify:true,write:false,
 plugins:[{name:'explicit-basis-path',setup(b){b.onLoad({filter:/KTX2Loader\.js$/},async args=>({loader:'js',resolveDir:path.dirname(args.path),contents:fs.readFileSync(args.path,'utf8')
  .replace(/const WASM_BIN_URL =[^;]+;/,"const WASM_BIN_URL = './vendor/basis/basis_transcoder.wasm';")
  .replace(/const WASM_JS_URL =[^;]+;/,"const WASM_JS_URL = './vendor/basis/basis_transcoder.js';")}));}}]});
const wrapper=`// Three r187 GLTF/KTX2 + meshoptimizer. Licenses: assets/THREE-LICENSE.txt, vendor/basis/LICENSE, vendor/basis/MESHOPT-LICENSE.\n
globalThis.WitnessKit=(()=>{let current,core;
 function create(T,renderer,options){if(T.REVISION!=='187')throw Error('WitnessKit requires Three r187');
  globalThis.__WitnessKitThree=T;try{${result.outputFiles[0].text}\nreturn WitnessKitAddon.createKit(T,renderer,WitnessKitAddon,options);}finally{delete globalThis.__WitnessKitThree;}}
 function init(T,renderer){if(core&&core!==T)throw Error('WitnessKit requires the engine Three instance');if(!current){core=T;current=create(T,renderer);}return current;}
 const api={create,init,dispose(){current?.dispose();current=null;core=null;}};
 for(const method of ['load','loadPack','acquire','instances','createScope','snapshot','whenIdle'])api[method]=(...args)=>{if(!current)throw Error('Call WitnessKit.init(T,renderer) first');return current[method](...args);};return api;
})();\n`;
fs.writeFileSync(path.join(root,'vendor/witness-loaders.js'),wrapper);console.log('Bundled shared-core GLTF + KTX2 + Meshopt loader',Buffer.byteLength(wrapper));
