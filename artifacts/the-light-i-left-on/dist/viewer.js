export class Panorama {
  constructor(canvas,onMove) {
    this.canvas=canvas;this.onMove=onMove;this.yaw=2.35;this.pitch=0;this.fov=70;this.gl=canvas.getContext('webgl',{alpha:false,antialias:false});
    if(!this.gl) throw new Error('WebGL unavailable');
    const gl=this.gl;
    const vertex='attribute vec2 a; varying vec2 q; void main(){q=a;gl_Position=vec4(a,0.,1.);}';
    // Authored north calibrated to the shelter lamp at source u≈.435.
    const fragment='precision highp float; varying vec2 q; uniform sampler2D tex; uniform float aspect,yaw,pitch,fov; void main(){vec3 r=normalize(vec3(q.x*aspect*tan(fov/2.),q.y*tan(fov/2.),1.)); float cp=cos(pitch),sp=sin(pitch),cy=cos(yaw),sy=sin(yaw);vec3 p=vec3(r.x,r.y*cp+r.z*sp,r.z*cp-r.y*sp);vec3 d=vec3(p.x*cy+p.z*sy,p.y,p.z*cy-p.x*sy);vec2 uv=vec2(fract(.435+atan(d.x,d.z)/6.2831853),.5-asin(clamp(d.y,-1.,1.))/3.14159265);gl_FragColor=texture2D(tex,uv);}';
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
    this.program=gl.createProgram();gl.attachShader(this.program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error('Panorama shader failed');gl.useProgram(this.program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(this.program,'a');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
    this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    this.uniforms=Object.fromEntries(['aspect','yaw','pitch','fov'].map(n=>[n,gl.getUniformLocation(this.program,n)]));
    let drag=null;
    canvas.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;this.yaw-=(e.clientX-drag.x)*.004;this.pitch+=(e.clientY-drag.y)*.004;drag.x=e.clientX;drag.y=e.clientY;this.draw();});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null);
    canvas.addEventListener('wheel',e=>{e.preventDefault();this.fov+=e.deltaY*.04;this.draw();},{passive:false});
    canvas.addEventListener('keydown',e=>{const commands={ArrowLeft:()=>this.yaw-=.12,ArrowRight:()=>this.yaw+=.12,ArrowUp:()=>this.pitch+=.12,ArrowDown:()=>this.pitch-=.12,'+':()=>this.fov-=5,'=':()=>this.fov-=5,'-':()=>this.fov+=5,n:()=>{this.yaw=0;this.pitch=0;},d:()=>{this.yaw=.16;this.pitch=-1.15;}};if(commands[e.key]){e.preventDefault();commands[e.key]();this.draw();}});
    window.addEventListener('resize',()=>this.draw());canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();window.dispatchEvent(new Event('panorama-lost'));});
  }
  async load(url) {const img=new Image();img.src=url;await img.decode();if(img.width!==img.height*2)throw new Error('Panorama must be 2:1');const gl=this.gl;if(img.width>gl.getParameter(gl.MAX_TEXTURE_SIZE))throw new Error('Panorama exceeds device capability');gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);this.ready=true;this.draw();}
  draw(){this.pitch=Math.max(-1.47,Math.min(1.47,this.pitch));this.fov=Math.max(40,Math.min(95,this.fov));this.yaw=((this.yaw+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;if(!this.ready)return;const c=this.canvas,gl=this.gl,dpr=Math.min(devicePixelRatio||1,2);c.width=Math.round(c.clientWidth*dpr);c.height=Math.round(c.clientHeight*dpr);gl.viewport(0,0,c.width,c.height);gl.useProgram(this.program);for(const [n,v] of Object.entries({aspect:c.width/c.height,yaw:this.yaw,pitch:this.pitch,fov:this.fov*Math.PI/180}))gl.uniform1f(this.uniforms[n],v);gl.drawArrays(gl.TRIANGLES,0,3);this.onMove?.();}
  project(yaw,pitch){const x=Math.cos(pitch)*Math.sin(yaw),y=Math.sin(pitch),z=Math.cos(pitch)*Math.cos(yaw),cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);const px=x*cy-z*sy,pz=x*sy+z*cy,py=y*cp-pz*sp,depth=y*sp+pz*cp,t=Math.tan(this.fov*Math.PI/360),aspect=this.canvas.clientWidth/this.canvas.clientHeight;if(depth<=0)return null;const nx=px/depth/t/aspect,ny=py/depth/t;if(Math.abs(nx)>.85||Math.abs(ny)>.8)return null;return {x:(nx+1)*this.canvas.clientWidth/2,y:(1-ny)*this.canvas.clientHeight/2};}
}
