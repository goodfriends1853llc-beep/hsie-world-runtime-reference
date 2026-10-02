export const STATES = Object.freeze(['DEPARTURE','TRACE','WEATHERING','RECLAMATION','FOUNDATION','RECONSTRUCTION','DAWN']);
export function anniversary(start, months) {
  const d = new Date(start);
  if (!Number.isFinite(d.getTime())) throw new Error('Invalid timestamp');
  const year = d.getUTCFullYear(), month = d.getUTCMonth() + months;
  const maxDay = new Date(Date.UTC(year,month+1,0)).getUTCDate();
  return Date.UTC(year,month,Math.min(d.getUTCDate(),maxDay),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds(),d.getUTCMilliseconds());
}
export function validateRelease(config) {
  if (!config || config.artifactId !== 'TLILO-001') throw new Error('Unknown artifact');
  if (!['CANDIDATE','SEALED'].includes(config.status)) throw new Error('Invalid status');
  if (!Array.isArray(config.states) || config.states.length !== 7 || config.states.some((s,i)=>s.id!==`STATE-0${i}` || s.month!==i*2 || s.name!==STATES[i] || !/^360\/state-0[0-6]\.jpg$/.test(s.asset))) throw new Error('Invalid state schedule');
  if (config.returnEvent !== null) throw new Error('Departure artifact cannot represent return');
  if (config.departureEvent !== null && (!config.departureEvent.eventId || config.departureEvent.authority !== 'Tommie Bellamy' || config.departureEvent.basis !== 'HUMAN_CONFIRMED' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(config.departureEvent.occurredAt) || !Number.isFinite(Date.parse(config.departureEvent.occurredAt)))) throw new Error('Invalid departure evidence');
  if (config.status === 'SEALED' && (!config.departureEvent || !config.sealedAt || !config.north || config.north.status!=='READY' || !config.reviewAccepted)) throw new Error('Missing release preconditions');
  if (config.north?.status === 'READY' && !/^(https:\/\/[^\s]+|north\/north\.mp4)$/.test(config.north.destination||'')) throw new Error('Invalid NORTH destination');
  return config;
}
export function representedState(config, now = Date.now()) {
  validateRelease(config);
  if (!Number.isFinite(now)) return {index:0,id:'STATE-00',name:STATES[0],complete:false,clockStatus:'INVALID_CLOCK'};
  if (!config.departureEvent) return {index:0,id:'STATE-00',name:STATES[0],complete:false,clockStatus:'UNSTARTED'};
  const start=Date.parse(config.departureEvent.occurredAt);
  if (now<start) return {index:0,id:'STATE-00',name:STATES[0],complete:false,clockStatus:'BEFORE_DEPARTURE'};
  let index=0;
  for(let i=1;i<7;i++) if(now>=anniversary(start,i*2)) index=i;
  return {index,id:`STATE-0${index}`,name:STATES[index],complete:index===6,clockStatus:'DEVICE_CLOCK_UNVERIFIED'};
}
