// Runs a group of scripted checks in order, without a shell chain.
// npm's script runner spawns cmd.exe for && chains and stalls on some Windows hosts; running
// each step from Node keeps one failing step from hiding the rest and gives a real exit code.
'use strict';
const {spawnSync}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const groups={
  test:[
    'test/campaign.cjs','test/q01-state.cjs','test/q01-campaign.cjs','test/q01-audio.cjs','test/vieneu-pipeline.cjs','test/spine.cjs','test/charset.cjs','test/scene-plan.cjs',
    'test/v31-systems.cjs','test/depth.cjs','test/craft.cjs','test/architecture.cjs','test/q01-env.cjs',
    'test/q01-geometry.cjs','test/q01-greybox.cjs','test/ci-workflow.cjs'
  ],
  build:[
    'tools/bake-q01-gi.cjs --check','tools/environment-kit/build-engine.cjs','test/architecture.cjs',
    'test/kit-budget.cjs','tools/build.cjs','tools/build-cloud.mjs'
  ],
  browser:[
    'test/browser.mjs','test/scene.mjs','test/spine-browser.mjs','test/depth-browser.mjs','test/craft-browser.mjs'
  ],
  'craft-details':[
    'test/craft-details-browser.mjs','test/field-keyboard-browser.mjs'
  ],
  kit:[
    'tools/environment-kit/build-kit.cjs','tools/environment-kit/build-references.cjs','tools/environment-kit/build-board.cjs'
  ]
};
const which=process.argv[2]||'test';
const steps=groups[which];
if(!steps){console.error('Unknown check group: '+which+'. Known groups: '+Object.keys(groups).join(', '));process.exit(2);}
let failed=0;
for(const step of steps){
  const [script,...args]=step.split(' ');
  const started=Date.now();
  const result=spawnSync(process.execPath,[path.join(root,script),...args],{cwd:root,stdio:'inherit'});
  const code=result.status===null?1:result.status;
  console.log((code===0?'PASS ':'FAIL ')+step+' ('+((Date.now()-started)/1000).toFixed(1)+'s)');
  if(code!==0){failed=code;break;}
}
if(failed)process.exit(failed);
console.log('All '+steps.length+' '+which+' steps passed');
