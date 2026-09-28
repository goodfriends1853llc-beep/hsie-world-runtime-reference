const params=new URLSearchParams(location.search);
const originalPath=location.pathname.toLowerCase();
const mode=originalPath.endsWith('/book/')?'book':originalPath.endsWith('/contact/')?'message':(params.get('mode')||'message').toLowerCase();
const modeLabel=document.getElementById('modeLabel'),pageTitle=document.getElementById('pageTitle'),pageCopy=document.getElementById('pageCopy'),service=document.getElementById('service'),requestTypeField=document.getElementById('requestTypeField'),subjectField=document.getElementById('subjectField'),nextField=document.getElementById('nextField'),form=document.getElementById('requestForm'),submitButton=document.getElementById('submitButton');
const presets={
 founding:{label:'FOUNDING BUSINESSES',title:'PUT YOUR BUSINESS IN THE WORLD.',copy:'Tell me what you do, how you want to be represented, and what visitors should be able to do when they reach you.',service:'Founding Business / Spatial World',subject:'Explore Brevard 360 — New Founding Business Lead',button:'SEND FOUNDING REQUEST'},
 book:{label:'BOOK / REQUEST APPOINTMENT',title:'START WITH THE PROBLEM.',copy:'Choose what you need and tell me what you are trying to build, fix, or clarify. I will respond with the next step.',service:'Custom Architecture Session',subject:'Explore Brevard 360 — New Booking Request',button:'REQUEST A SESSION'},
 message:{label:'MESSAGE / INQUIRY',title:'SEND IT STRAIGHT TO ME.',copy:'Business, collaboration, question, or idea — leave the details below. Your message comes directly to me by email.',service:'General Inquiry',subject:'Explore Brevard 360 — New Message',button:'SEND MESSAGE'}
};
const p=presets[mode]||presets.message;
modeLabel.textContent=p.label;pageTitle.textContent=p.title;pageCopy.textContent=p.copy;service.value=p.service;requestTypeField.value=p.label;subjectField.value=p.subject;submitButton.textContent=p.button;
if(originalPath.includes('/tommie/contact.html')){const u=new URL(mode==='book'?'../book/':'../contact/',location.href);history.replaceState(null,'',u.pathname);}
nextField.value=new URL('../thanks/?mode='+mode,location.href).href;
const urlField=form.querySelector('input[name="_url"]');if(urlField)urlField.value=location.href;
form.addEventListener('submit',()=>{submitButton.disabled=true;submitButton.textContent='SENDING…';});