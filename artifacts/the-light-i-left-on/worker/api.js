const encoder=new TextEncoder();
export function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});}
export async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function validateNote(body,direction){
 if(typeof body!=='string'||typeof direction!=='string')throw new Error('Write a note first.');
 body=body.trim().normalize('NFC');
 if(body.length<3||body.length>240)throw new Error('Use 3–240 characters.');
 if(!['A note','Peace','Stability','Connection','Freedom','Purpose'].includes(direction))throw new Error('Choose a direction from the list.');
 if(/https?:|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\d\s().-]{6,}\d)|<\/?[a-z][^>]*>/i.test(body))throw new Error('Leave out links, contact details and markup.');
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u202a-\u202e\u2066-\u2069]/.test(body))throw new Error('Use plain text.');
 if(/\b(?:kill yourself|kys|n[i1]gg[e3]r|f[a4]gg[o0]t)\b/i.test(body))throw new Error('Please leave a respectful note.');
 return {body,direction};
}
async function actor(request,env){if(!env.WALL_HASH_SECRET)throw new Error('Wall configuration unavailable');const key=await crypto.subtle.importKey('raw',encoder.encode(env.WALL_HASH_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);const input=`${Math.floor(Date.now()/86400000)}:${request.headers.get('cf-connecting-ip')||'unknown'}`;return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(input)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function rateLimit(db,who,max=12){const hour=Math.floor(Date.now()/3600000);const r=await db.prepare('INSERT INTO wall_rate(actor,bucket,count) VALUES(?,?,1) ON CONFLICT(actor,bucket) DO UPDATE SET count=count+1 RETURNING count').bind(who,hour).first();return r.count<=max;}
async function bodyJSON(request){if(!request.headers.get('content-type')?.includes('application/json'))throw new Error('Use JSON');const text=await request.text();if(text.length>3000)throw new Error('Request is too large');return JSON.parse(text);}
const validId=id=>typeof id==='string'&&/^[0-9a-f-]{36}$/.test(id);
export async function api(request,env,ctx){
 const url=new URL(request.url);if(!env.DB)return json({error:'The wall is temporarily unavailable. Please try again later.'},503);
 try{
  if(url.pathname==='/api/notes'&&request.method==='GET'){
   const cursor=url.searchParams.get('before');let rows;
   if(cursor){let value;try{value=JSON.parse(atob(cursor));}catch{return json({error:'Invalid page'},400);}if(!Number.isSafeInteger(value.time)||!validId(value.id))return json({error:'Invalid page'},400);rows=await env.DB.prepare("SELECT id,body,direction,created_at FROM wall_notes WHERE status='visible' AND (created_at < ? OR (created_at = ? AND id < ?)) ORDER BY created_at DESC,id DESC LIMIT 9").bind(value.time,value.time,value.id).all();}
   else rows=await env.DB.prepare("SELECT id,body,direction,created_at FROM wall_notes WHERE status='visible' ORDER BY created_at DESC,id DESC LIMIT 9").all();
   const notes=rows.results.slice(0,8),last=notes.at(-1);return json({notes,next:rows.results.length>8?btoa(JSON.stringify({time:last.created_at,id:last.id})):null});
  }
  if(!['POST','DELETE'].includes(request.method))return json({error:'Not found'},404);
  if(request.headers.get('origin')!==url.origin)return json({error:'Open the wall to perform this action.'},403);
  const who=await actor(request,env);
  if(!await rateLimit(env.DB,who))return json({error:'Please give others room. Try again later.'},429);
  const data=await bodyJSON(request),now=Date.now();
  ctx?.waitUntil?.(env.DB.prepare('DELETE FROM wall_rate WHERE bucket < ?').bind(Math.floor(now/3600000)-48).run());
  if(url.pathname==='/api/notes'&&request.method==='POST'){
   if(data.publishConsent!==true)return json({error:'Confirm that this note will be shared publicly.'},400);
   const note=validateNote(data.body,data.direction);
   if(!validId(data.id)||typeof data.deleteToken!=='string'||!/^[0-9a-f]{64}$/.test(data.deleteToken))return json({error:'Could not prepare this note. Reload and try again.'},400);
   const hash=await digest(data.deleteToken),prior=await env.DB.prepare('SELECT id,delete_hash,status FROM wall_notes WHERE id=?').bind(data.id).first();
   if(prior){if(prior.delete_hash!==hash)return json({error:'Note identifier conflict'},409);return json({id:prior.id,status:prior.status,replayed:true});}
   await env.DB.prepare("INSERT INTO wall_notes(id,body,direction,created_at,status,delete_hash) VALUES(?,?,?,?,'visible',?)").bind(data.id,note.body,note.direction,now,hash).run();
   return json({id:data.id,status:'visible'},201);
  }
  const match=url.pathname.match(/^\/api\/notes\/([0-9a-f-]{36})(\/report)?$/);
  if(!match)return json({error:'Not found'},404);
  if(match[2]&&request.method==='POST'){
   if(!await env.DB.prepare("SELECT id FROM wall_notes WHERE id=? AND status='visible'").bind(match[1]).first())return json({error:'This note is no longer visible.'},404);
   await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO wall_reports(note_id,actor,created_at) VALUES(?,?,?)').bind(match[1],who,now),
    env.DB.prepare("UPDATE wall_notes SET status='hidden' WHERE id=? AND (SELECT COUNT(*) FROM wall_reports WHERE note_id=?) >= 3").bind(match[1],match[1])
   ]);return json({reported:true});
  }
  if(!match[2]&&request.method==='DELETE'){
   if(typeof data.deleteToken!=='string'||!/^[0-9a-f]{64}$/.test(data.deleteToken))return json({error:'Removal key required.'},403);
   const result=await env.DB.prepare("DELETE FROM wall_notes WHERE id=? AND delete_hash=?").bind(match[1],await digest(data.deleteToken)).run();
   if(!result.meta.changes)return json({error:'The note was already removed, or this browser has no removal key.'},404);
   await env.DB.prepare('DELETE FROM wall_reports WHERE note_id=?').bind(match[1]).run();return json({removed:true});
  }
  return json({error:'Not found'},404);
 }catch(error){if(error instanceof SyntaxError||/Write a note|characters|direction|Leave out|plain text|respectful|Use JSON|too large/.test(error.message))return json({error:error.message},400);console.error('Wall request failed',error.name);return json({error:'The wall is temporarily unavailable. Your draft has not been cleared.'},503);}
}
