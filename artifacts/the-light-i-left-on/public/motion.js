// Device back-facing normal transformed by intrinsic Z-X-Y orientation angles.
export const wrap = angle => Math.atan2(Math.sin(angle),Math.cos(angle));
export function orientationView({alpha,beta,gamma},previousYaw=0) {
  if(![alpha,beta,gamma].every(Number.isFinite))return null;
  const a=alpha*Math.PI/180,b=beta*Math.PI/180,g=gamma*Math.PI/180;
  const x=-Math.cos(a)*Math.sin(g)-Math.sin(a)*Math.sin(b)*Math.cos(g);
  const y=-Math.sin(a)*Math.sin(g)+Math.cos(a)*Math.sin(b)*Math.cos(g);
  const z=-Math.cos(b)*Math.cos(g);
  return {yaw:Math.hypot(x,y)<.04?previousYaw:Math.atan2(x,y),pitch:Math.asin(Math.max(-1,Math.min(1,z)))};
}
export class PhoneMotion {
  constructor(viewer,button,status,center){
    this.viewer=viewer;this.button=button;this.status=status;this.center=center;this.enabled=false;this.last=null;this.offset=null;this.frame=0;this.dragging=false;
    this.read=e=>this.onOrientation(e);
    button.addEventListener('click',()=>this.toggle());
    center.addEventListener('click',()=>{viewer.pitch=0;this.rebase();viewer.draw();});
    viewer.canvas.addEventListener('pointerdown',()=>{this.dragging=true;});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])viewer.canvas.addEventListener(name,()=>{this.dragging=false;this.rebase();});
    viewer.onManualMove=()=>this.rebase();
    this.visibility=()=>{if(document.hidden){clearTimeout(this.timer);this.last=null;this.offset=null;cancelAnimationFrame(this.frame);this.frame=0;}else if(this.enabled)this.waitForSensor();};
    document.addEventListener('visibilitychange',this.visibility);
  }
  message(text){this.status.textContent=text;this.status.hidden=!text;if(text){const close=document.createElement('button');close.type='button';close.className='motion-dismiss';close.textContent='Dismiss';close.setAttribute('aria-label','Dismiss motion message');close.addEventListener('click',()=>this.message(''));this.status.append(close);}}
  rebase(){this.offset=this.last?{yaw:wrap(this.viewer.yaw-this.last.yaw),pitch:this.viewer.pitch-this.last.pitch}:null;}
  waitForSensor(){clearTimeout(this.timer);this.timer=setTimeout(()=>{if(this.enabled&&!this.last){this.stop();this.message('No motion data. Open this link in Safari or your phone browser, then tap Enable motion. You can still drag.');}},4500);}
  async toggle(){
    if(this.enabled){this.stop();this.message('Motion off. Drag to look around.');return;}
    if(!window.isSecureContext||!window.DeviceOrientationEvent){this.message('Phone motion is unavailable here. Open this link in your phone browser, or drag to look around.');return;}
    this.button.disabled=true;
    try{
      // Called directly from the button click: retain iPhone transient user activation.
      const permission=typeof window.DeviceOrientationEvent.requestPermission==='function'?await window.DeviceOrientationEvent.requestPermission():'granted';
      if(permission!=='granted'){this.message('Motion permission was not allowed here. Open this site in Safari, then tap Enable motion and allow access. Dragging still works.');return;}
      this.enabled=true;this.last=null;this.offset=null;this.button.textContent='Motion on';this.button.setAttribute('aria-pressed','true');this.center.hidden=false;
      window.addEventListener('deviceorientation',this.read);this.message('Move your phone to look around.');this.waitForSensor();
    }catch{this.message('Motion could not start. Open this link in Safari or your phone browser and try again. Drag still works.');}
    finally{this.button.disabled=false;}
  }
  onOrientation(event){
    if(!this.enabled||document.hidden)return;
    const next=orientationView(event,this.last?.yaw);if(!next)return;
    const first=!this.last;this.last=next;clearTimeout(this.timer);
    if(!this.offset||this.dragging)this.rebase();
    if(first){this.message('');}
    if(!this.frame&&!this.dragging)this.frame=requestAnimationFrame(()=>this.render());
  }
  render(){
    this.frame=0;if(!this.enabled||!this.last||!this.offset||this.dragging||document.hidden)return;
    const targetYaw=wrap(this.last.yaw+this.offset.yaw),targetPitch=Math.max(-1.47,Math.min(1.47,this.last.pitch+this.offset.pitch));
    const dy=wrap(targetYaw-this.viewer.yaw),dp=targetPitch-this.viewer.pitch;
    this.viewer.yaw+=dy*.35;this.viewer.pitch+=dp*.35;this.viewer.draw();
    if(Math.abs(dy)+Math.abs(dp)>.0005)this.frame=requestAnimationFrame(()=>this.render());
  }
  stop(){this.enabled=false;window.removeEventListener('deviceorientation',this.read);cancelAnimationFrame(this.frame);this.frame=0;clearTimeout(this.timer);this.last=null;this.offset=null;this.button.textContent='Enable motion';this.button.setAttribute('aria-pressed','false');this.center.hidden=true;}
  destroy(){this.stop();document.removeEventListener('visibilitychange',this.visibility);this.button.hidden=true;this.message('');}
}
