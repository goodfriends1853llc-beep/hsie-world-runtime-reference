import {readFile,writeFile,mkdir,cp,rm,stat,mkdtemp,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createManifest} from './manifest.mjs';
import {verify} from './verify.mjs';
import {validateRelease,isUtcTimestamp} from '../public/state.js';

// Field validation is not human authentication. This tool records supplied owner evidence.
export async function prepareRelease(record,projectRoot=process.cwd(),now=Date.now()) {
  if(record.authority!=='Tommie Bellamy'||record.decision!=='AUTHORIZE_DEPARTURE_RELEASE'||record.visualReview!=='ACCEPTED'||record.mobileReview!=='ACCEPTED'||!record.northDestination||!record.northVerification) throw new Error('Incomplete owner release record');
  if(!isUtcTimestamp(record.departureOccurredAt)||Date.parse(record.departureOccurredAt)>now)throw new Error('Departure must be a recorded past/present UTC event');
  if(!isUtcTimestamp(record.recordedAt)||Date.parse(record.recordedAt)>now||Date.parse(record.recordedAt)<Date.parse(record.departureOccurredAt))throw new Error('Invalid owner record time');
  const source=resolve(projectRoot,'public');
  await verify(source);
  const config=JSON.parse(await readFile(resolve(source,'release.json'),'utf8'));
  config.version='1.0.0';config.status='SEALED';config.sealedAt=new Date(now).toISOString();
  config.departureEvent={eventId:record.departureEventId||'TLILO-EV-DEPARTURE-001',occurredAt:record.departureOccurredAt,recordedAt:record.recordedAt,authority:record.authority,basis:'HUMAN_CONFIRMED'};
  config.reviewAccepted=true;config.north={...config.north,status:'READY',destination:record.northDestination,verification:record.northVerification};
  validateRelease(config);
  if(config.north.destination==='north/north.mp4'&&!(await stat(resolve(source,'north/north.mp4'))).size)throw new Error('Missing NORTH film');
  const parent=resolve(projectRoot,'releases'),root=resolve(parent,'v1.0.0');
  await mkdir(parent,{recursive:true});
  const lock=resolve(parent,'.departure-preparation-lock');
  await mkdir(lock);
  let staging;
  try {
    try{await stat(root);throw new Error('Release output already exists; use an explicit successor, never overwrite.');}catch(e){if(e.code!=='ENOENT')throw e;}
    staging=await mkdtemp(resolve(parent,'.departure-staging-'));
    await cp(source,staging,{recursive:true});await rm(resolve(staging,'review.html'),{force:true});
    await writeFile(resolve(staging,'release.json'),JSON.stringify(config,null,2)+'\n');
    await createManifest(staging);
    const result=await verify(staging);
    await rename(staging,root);staging=null;
    return {root,...result,next:'Commit this exact release, publish it, and retain the deployment receipt and independently retained manifest digest. SEALED is a release policy, not storage write protection.'};
  } finally {if(staging)await rm(staging,{recursive:true,force:true});await rm(lock,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const path=process.argv[2];if(!path)throw new Error('Pass an owner departure record JSON. No event is inferred.');
  console.log(JSON.stringify(await prepareRelease(JSON.parse(await readFile(path,'utf8'))),null,2));
}
