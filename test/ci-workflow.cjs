// Structural check for the GitHub Actions workflows.
// GitHub Actions cannot run in this environment, so the workflows are guarded locally:
// every file must stay parseable in the style used here, every npm script it calls must
// exist, every local path it runs must exist, no step may swallow a failure, and the
// gates the release depends on must be present.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const workflowDir=path.join(root,'.github/workflows');
assert(fs.existsSync(workflowDir),'Missing workflow directory: .github/workflows');
const workflowFiles=fs.readdirSync(workflowDir).filter(f=>f.endsWith('.yml')||f.endsWith('.yaml'));
assert(workflowFiles.length>0,'No workflow file found');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));

function parseWorkflow(file){
  const raw=fs.readFileSync(path.join(workflowDir,file),'utf8');
  assert(!raw.includes('\t'),'Workflow must not contain tab characters: '+file);
  const lines=raw.split('\n');
  const indentOf=line=>line.length-line.trimStart().length;
  const jobs=[];
  let inJobs=false,currentJob=null,currentStep=null,blockKey=null;
  for(let index=0;index<lines.length;index++){
    const line=lines[index];
    if(!line.trim()||line.trim().startsWith('#'))continue;
    const indent=indentOf(line);
    assert.equal(indent%2,0,'Odd indentation on line '+(index+1)+' of '+file+': '+line);
    const trimmed=line.trim();
    if(indent===0){inJobs=trimmed==='jobs:';currentJob=null;currentStep=null;continue;}
    if(!inJobs)continue;
    const jobHeader=/^([A-Za-z0-9_-]+):\s*$/.exec(trimmed);
    if(indent===2&&jobHeader){currentJob={id:jobHeader[1],steps:[]};jobs.push(currentJob);currentStep=null;continue;}
    if(!currentJob)continue;
    const stepHeader=/^- (name|run|uses|id):\s*(.*)$/.exec(trimmed);
    if(stepHeader){
      currentStep={kind:stepHeader[1],value:stepHeader[2],name:stepHeader[1]==='name'?stepHeader[2]:'',lines:[]};
      currentJob.steps.push(currentStep);
      blockKey=null;
      continue;
    }
    const continuation=/^(name|run|uses|id):\s*(.*)$/.exec(trimmed);
    if(continuation&&currentStep&&indent>=6){
      if(currentStep.kind==='name'&&continuation[1]==='run'){currentStep.kind='run';currentStep.value=continuation[2];}
      else if(currentStep.kind==='name'&&continuation[1]==='uses'){currentStep.kind='uses';currentStep.value=continuation[2];}
      blockKey=/\|/.test(continuation[2])?continuation[1]:null;
      continue;
    }
    if(currentStep&&indent>=6&&/^env:\s*$/.test(trimmed)){currentStep.env={};blockKey='env';continue;}
    if(currentStep&&blockKey==='env'&&indent>=8){
      const envEntry=/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(trimmed);
      if(envEntry)currentStep.env[envEntry[1]]=envEntry[2].replace(/^'|'$/g,'');
      continue;
    }
    if(currentStep&&blockKey&&indent>=8){currentStep.value+='\n'+trimmed;currentStep.lines.push(trimmed);continue;}
    if(/^runs-on:/.test(trimmed))currentJob.runsOn=trimmed.slice('runs-on:'.length).trim();
    if(/^timeout-minutes:/.test(trimmed))currentJob.timeout=trimmed.slice('timeout-minutes:'.length).trim();
  }
  return {file,raw,jobs};
}

const workflows=workflowFiles.map(parseWorkflow);
const allSteps=[];
for(const workflow of workflows){
  assert(workflow.jobs.length>=1,'Workflow must declare a job: '+workflow.file);
  for(const job of workflow.jobs){
    assert(job.runsOn,'Job '+job.id+' in '+workflow.file+' has no runs-on');
    assert(job.timeout,'Job '+job.id+' in '+workflow.file+' has no timeout-minutes');
    assert(job.steps.length>0,'Job '+job.id+' in '+workflow.file+' has no steps');
    for(const step of job.steps){
      assert(step.kind!=='run'||step.value.trim().length>0,'Empty run step in job '+job.id+' of '+workflow.file);
      if(step.kind!=='run')continue;
      assert(!/continue-on-error:\s*true/.test(step.value),'A gate step may not continue on error in '+workflow.file+': '+step.value.slice(0,60));
      const npmCalls=[...step.value.matchAll(/\bnpm (?:run )?([A-Za-z0-9:_-]+)/g)].map(m=>m[1]).filter(s=>!['ci','install','i'].includes(s));
      for(const script of npmCalls)assert(pkg.scripts[script],'Workflow calls missing npm script in '+workflow.file+': '+script);
      const localPaths=[...step.value.matchAll(/\b((?:tools|test|docs|scripts|dist)\/[A-Za-z0-9_.\/-]+)/g)].map(m=>m[1]);
      for(const rel of localPaths)assert(fs.existsSync(path.join(root,rel)),'Workflow runs a missing path in '+workflow.file+': '+rel);
      allSteps.push({workflow:workflow.file,job:job.id,value:step.value,env:step.env||{}});
    }
  }
}

const called=script=>allSteps.some(s=>s.value.includes('npm run '+script)||s.value.includes('npm '+script+' '));
const requiredScripts=['test','test:agents','test:backend','check:agents','build','test:build-output','test:graphics','test:q01-greybox-browser','test:architecture-browser'];
for(const script of requiredScripts)assert(called(script),'No workflow runs '+script);
const softwareSteps=allSteps.filter(s=>s.env.WITNESS_QA_HARDWARE==='0');
assert(softwareSteps.length>=2,'The browser gates must force software rendering on a runner without a GPU');
assert(softwareSteps.some(s=>/test:graphics/.test(s.value)),'The graphics gate must run on the software rasteriser');
assert(allSteps.some(s=>s.env.WITNESS_GREYBOX_SMOKE==='1'),'The greybox gate in CI must run the smoke case');
console.log(JSON.stringify({status:'passed',workflows:workflowFiles,steps:allSteps.length,requiredScripts:requiredScripts.length,softwareSteps:softwareSteps.length}));
