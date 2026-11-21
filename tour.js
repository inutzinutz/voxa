import {casing, galleryFloor, lightGallery, grainTexture} from './finishes.js';
import {canvasRenderer} from './canvas-room.js';
import * as T from './assets/vendor/three.module.min.js';

// Distances are in showroom metres. The machines are illustrative scale models.
export function createTour(container, inspect, lost) {
  const surface=document.createElement('canvas');
  const options={antialias:true,powerPreference:'low-power'};
  const context=surface.getContext('webgl2',options)||surface.getContext('webgl',options);
  const renderer=context?new T.WebGLRenderer({canvas:surface,context,...options}):canvasRenderer();
  const canvas=renderer.domElement; container.replaceChildren(canvas);
  canvas.tabIndex=0; canvas.setAttribute('aria-label','โชว์รูม 3D ลากเพื่อมองรอบห้อง ใช้ปุ่มลูกศรเดินและหันมอง');
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene();scene.background=new T.Color(0xe6dfcd);
  const camera=new T.PerspectiveCamera(54,1,.04,80);
  const palette={ivory:0xeeeae1, silver:0xc2c6bd, ash:0x343936,black:0x131c1a, sage:0xc1db4d,stone:0xc8bfb0};
  const metalGrain=context?grainTexture(true):null;
  const mats=new Map();
  function material(color) {
    if(!mats.has(color)){
      const metal=color===palette.silver, enamel=color===palette.ivory;
      const surface=new T.MeshStandardMaterial({color,roughness:metal?.31:enamel?.32:.63,metalness:metal?.77:enamel?.1:.035});
      if(metal&&metalGrain){surface.bumpMap=metalGrain;surface.bumpScale=.00042}
      if(color===0xffe7a3||color===0xffedbb){surface.emissive.setHex(color);surface.emissiveIntensity=1.6}
      mats.set(color,surface);
    }
    return mats.get(color);
  }
  const cube=new T.BoxGeometry(1,1,1);
  function mesh(parent,geo,mat,x,y,z) {
    const obj=new T.Mesh(geo,typeof mat==='number'?material(mat):mat);
    obj.position.set(x,y,z);obj.receiveShadow=true;obj.castShadow=geo.type!=='PlaneGeometry';parent.add(obj);return obj;
  }
  function box(parent,x,y,z,w,h,d,c){const o=mesh(parent,cube,c,x,y,z);o.scale.set(w,h,d);return o}
  function cyl(parent,x,y,z,rt,rb,h,c,segments=32){return mesh(parent,new T.CylinderGeometry(rt,rb,h,segments),c,x,y,z)}
  function group(x,y,z,parent=scene){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g}
  function tube(parent,points,r,c){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));return mesh(parent,new T.TubeGeometry(curve,22,r,5,false),c,0,0,0)}
  function signage(parent,txt,x,y,z,w,h,fg,bg) {
    const c=document.createElement('canvas');c.width=768;c.height=Math.round(768*h/w);const ctx=c.getContext('2d');
    if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height)}
    ctx.font='bold '+Math.min(c.height*.79,c.width*1.45/txt.length)+'px Poppins, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fg;ctx.fillText(txt,c.width/2,c.height*.53);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
    return mesh(parent,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}),x,y,z);
  }
  const {ivory,silver,ash,black,sage,stone}=palette;
  lightGallery(scene,renderer);
  const floor=galleryFloor();
  if(context){floor.material.bumpMap=grainTexture(false);floor.material.bumpScale=.0015}
  scene.add(floor);
  function rounded(p,x,y,z,w,h,d,r,c){return mesh(p,casing(w,h,d,r),c,x,y,z)}
  box(scene,0,1.8,-5.4,8.6,3.6,.18,ivory);
  box(scene,-4.25,1.8,0,.14,3.6,11,ivory);box(scene,4.25,1.8,0,.14,3.6,11,ivory);
  box(scene,0,3.65,0,8.6,.12,11,ash);box(scene,0,1.8,5.5,8.6,3.6,.1,0xb3b6a6);
  for(let i=-4;i<=4;i++)box(scene,i,.005,0,.003,.003,10.8,0xb4ab9b);
  for(let z=-5;z<=5;z++)box(scene,0,.005,z,8.5,.003,.003,0xb4ab9b);
  for(const x of [-2.6,0,2.6]){
    box(scene,x,3.53,0,.08,.08,10.5,black);
    for(const z of [-3,-.8,1.4,3.6]){cyl(scene,x,3.4,z,.09,.12,.2,ash);cyl(scene,x,3.29,z,.102,.102,.015,0xffedbb)}
  }
  for(let i=0;i<25;i++)box(scene,2+i*.088,1.6,-5.22,.045,3.1,.09,0x919f83);
  signage(scene,'voxa',-.35,2.48,-5.28,3.65,1.05,'#182017');
  signage(scene,'by 13 Store',.5,1.88,-5.27,1.15,.24,'#283024');
  function vessel(p,x,y,z,height,r,color){
    const pts=[];for(let i=0;i<=40;i++){const a=i/40;pts.push(new T.Vector2(r*(.62+.3*Math.sin(2.6*Math.PI*a)+.055*Math.cos(i*Math.PI)),a*height))}
    return mesh(p,new T.LatheGeometry(pts,24),color,x,y,z);
  }
  for(const y of [.8,1.53,2.26]){
    box(scene,-3.94,y,-.85,.64,.07,6.5,silver);
    box(scene,-3.67,y-.032,-.85,.025,.023,6.4,0xffe7a3);
    for(let i=0;i<6;i++)vessel(scene,-3.92,y+.04,-3.48+i*1.06,.36+(i%3)*.08,.16,[ivory,sage,ash,0xf4c169][(i+Math.round(y*4))%4]);
  }
  box(scene,2.65,.49,-3.72,2.45,.98,.82,silver);box(scene,2.65,1,-3.72,2.55,.06,.9,ivory);
  box(scene,2.7,1.28,-3.73,.53,.33,.035,black);box(scene,2.7,1.09,-3.73,.11,.13,.1,ash);
  for(const x of [2.1,3.18]){cyl(scene,x,.47,-2.78,.29,.23,.12,ash);cyl(scene,x,.22,-2.78,.05,.12,.44,silver)}
  const picks=[];const positions={k3:-1.29,i8:1.29};
  function spool(g,x,y,z,c){const s=group(x,y,z,g);s.rotation.z=Math.PI/2;
    cyl(s,0,0,0,.097,.097,.079,c);
    for(const v of [-.043,.043]){
      cyl(s,0,v,0,.104,.104,.007,c);cyl(s,0,v*1.13,0,.027,.027,.006,ash);
      for(let j=0;j<5;j++){const angle=j*Math.PI*2/5;
        const notch=box(s,.065*Math.sin(angle),v*1.09,.065*Math.cos(angle),.012,.003,.041,ash);notch.rotation.y=angle;
      }
    }}
  for(const [id,x] of Object.entries(positions)){
    const stand=group(x,0,-.1);stand.userData.model=id;picks.push(stand);
    box(stand,0,.057,0,1.42,.1,1.99,ash);
    rounded(stand,0,.518,0,1.55,.85,2.15,.048,silver);
    rounded(stand,0,.963,0,1.58,.052,2.18,.018,ivory);
    box(stand,0,.942,0,1.53,.012,2.14,black);
    for(let j=0;j<4;j++)box(stand,0,.1+j*.026,1.078,1.45,.008,.008,0xf6e6b7);
    signage(stand,id==='k3'?'K3':'i8 Combo',0,.66,1.079,1.25,.29,'#19201c');
    const g=group(.02,.99,-.32,stand);g.scale.setScalar(1.28);
    if(id==='k3'){
      rounded(g,0,.033,0,.52,.066,.48,.012,ivory);
      rounded(g,0,.602,0,.52,.08,.48,.014,ivory);
      box(g,0,.31,-.226,.50,.51,.023,ash);
      for(const side of [-1,1]){
        rounded(g,side*.244,.318,0,.033,.54,.48,.008,ivory);
        cyl(g,side*.18,.315,-.14,.006,.006,.46,silver,12);
        box(g,side*.205,.49,-.025,.017,.02,.36,silver);
      }
      box(g,0,.13,-.014,.39,.021,.34,ash);box(g,0,.145,-.014,.38,.006,.33,black);
      box(g,0,.484,-.04,.415,.024,.025,silver);
      rounded(g,.059,.448,-.04,.079,.069,.064,.007,silver);
      cyl(g,.059,.402,-.04,.013,.004,.021,0xb6a16a,12);
      const door=new T.MeshPhysicalMaterial({color:0x819797,metalness:.12,roughness:.13,clearcoat:1,transparent:true,opacity:.24,depthWrite:false});
      const pane=box(g,0,.313,.242,.464,.50,.005,door);pane.castShadow=false;
      for(const side of [-1,1])box(g,side*.23,.314,.246,.012,.506,.009,black);
      for(const y of [.063,.561])box(g,0,y,.245,.47,.012,.011,black);
      rounded(g,.211,.307,.255,.015,.092,.018,.005,ash);
      rounded(g,.141,.603,.248,.147,.067,.017,.006,black);
      signage(g,'CREALITY',-.14,.606,.242,.112,.024,'#505b5c');
      signage(g,'▰  K3',.14,.604,.258,.112,.032,'#c7e493','#202927');
      spool(g,.289,.41,.02,0x59a6cf);spool(g,.289,.17,.015,0x8cc98a);
      for(let i=0;i<4;i++)tube(g,[[.27,.51,i*.038-.09],[.2,.77+i*.022,i*.025-.1],[.02,.81+i*.025,.005],[.015,.64,.06+i*.015]],.004,silver);
    }else{
      rounded(g,0,.036,0,.6,.072,.5,.018,ivory);box(g,0,.08,.018,.44,.022,.38,ash);
      for(const x of [-.225,.225]){
        rounded(g,x,.325,-.04,.048,.52,.065,.006,silver);
        box(g,x,.325,-.004,.014,.49,.007,ash);
        cyl(g,x+.011,.32,.001,.003,.003,.49,silver,10);
      }
      rounded(g,0,.59,-.04,.51,.055,.085,.012,ivory);box(g,0,.34,-.008,.48,.025,.038,ash);
      rounded(g,.029,.31,.013,.085,.09,.071,.01,ivory);
      box(g,.029,.316,.051,.021,.026,.005,0x648567);
      for(let i=0;i<4;i++)box(g,.029,.294-i*.004,.051,.045,.002,.002,ash);
      for(const x of [-.16,.16])cyl(g,x,.057,0,.009,.009,.35,silver,12).rotation.x=Math.PI/2;
      box(g,0,.083,.018,.421,.006,.36,0xab9176);
      signage(g,'SPARKX',0,.592,.004,.108,.023,'#35403c');
      cyl(g,.03,.253,.017,.02,.007,.027,ash);
      for(const [i,c] of [0xffa998,0xadd6d9,0xe4ad54,0xf1dfad].entries())spool(g,i<2?-.298:.298,i%2?.17:.45,0,c);
      for(let i=0;i<3;i++)tube(g,[[i%2?.285:-.285,.43,-.04],[i%2?.22:-.23,.73,-.03],[.04,.76+i*.025,-.04],[.03,.36,-.002]],.005,ash);
    }
    for(const x of [-.185,.185])for(const z of [-.16,.16])cyl(g,x,.006,z,.029,.029,.015,ash,12);
    vessel(stand,-.28,.99,.66,.33,.15,id==='k3'?0x67afaf:sage);
  }
  // Exterior shell receives light without cutting off the gallery key.
  scene.children.forEach(o=>{if(o.isMesh&&(o.scale.y>=3.5||o.position.y>3.55))o.castShadow=false});
  const stops={front:[0,1.68,4.65,0,-.09],k3:[-.62,1.65,1.75,-.35,-.13],i8:[.62,1.65,1.75,.35,-.13]};
  let orbit=null;
  let yaw=0,pitch=0,visible=false,frame=0,flight=null,drag=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function orient(){camera.rotation.order='YXZ';camera.rotation.set(pitch,-yaw,0,'YXZ')}
  function render(now){
    frame=0;if(!visible)return;
    if(flight){const a=Math.min(1,(now-flight.start)/650),t=1-(1-a)**3;
      camera.position.lerpVectors(flight.from,flight.to,t);yaw=flight.y0+(flight.y1-flight.y0)*t;pitch=flight.p0+(flight.p1-flight.p0)*t;if(a>=1)flight=null;
    }
    orient();renderer.render(scene,camera);if(flight)refresh();
  }
  function refresh(){if(visible&&!frame)frame=requestAnimationFrame(render)}
  function resize(){if(!visible)return;const {width,height}=container.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width<height?67:54;camera.updateProjectionMatrix();refresh()}
  const observer=new ResizeObserver(resize);observer.observe(container);
  camera.position.set(...stops.front.slice(0,3));
  function orbitPose(){
    const offset=new T.Vector3().setFromSphericalCoords(orbit.radius,orbit.polar,orbit.angle);
    return {position:orbit.center.clone().add(offset),heading:Math.atan2(-offset.x,offset.z),tilt:-Math.asin(offset.y/orbit.radius)};
  }
  function setOrbitCamera(){
    flight=null;const pose=orbitPose();camera.position.copy(pose.position);yaw=pose.heading;pitch=pose.tilt;refresh();
  }
  function go(id){
    visible=true;resize();let [x,y,z,a,b]=stops[id];
    orbit=id==='front'?null:{center:new T.Vector3(positions[id]+.02,1.39,-.4),radius:camera.aspect<1?1.88:1.52,angle:.39,polar:1.29};
    if(orbit){const pose=orbitPose();[x,y,z]=pose.position.toArray();a=pose.heading;b=pose.tilt}
    a=yaw+Math.atan2(Math.sin(a-yaw),Math.cos(a-yaw));
    if(reduced.matches){flight=null;camera.position.set(x,y,z);yaw=a;pitch=b}
    else flight={start:performance.now(),from:camera.position.clone(),to:new T.Vector3(x,y,z),y0:yaw,y1:a,p0:pitch,p1:b};
    refresh();canvas.focus({preventScroll:true});
  }
  function walk(amount){
    if(orbit){orbit.radius=T.MathUtils.clamp(orbit.radius-amount*.48,1.02,2.45);setOrbitCamera();return}
    flight=null;const nx=T.MathUtils.clamp(camera.position.x+Math.sin(yaw)*amount,-3.2,3.45),nz=T.MathUtils.clamp(camera.position.z-Math.cos(yaw)*amount,-2.8,4.95);
    if(!Object.values(positions).some(x=>Math.abs(x-nx)<.95&&Math.abs(nz+.1)<1.25)){camera.position.x=nx;camera.position.z=nz}refresh();
  }
  canvas.addEventListener('pointerdown',e=>{if(drag)return;flight=null;canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false}});
  canvas.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>5)drag.moved=true;
    if(orbit){orbit.angle-=dx*.006;orbit.polar=T.MathUtils.clamp(orbit.polar-dy*.005,.52,1.64);setOrbitCamera()}
    else {yaw-=dx*.004;pitch=T.MathUtils.clamp(pitch+dy*.003,-.77,.64)}drag.x=e.clientX;drag.y=e.clientY;refresh()});
  canvas.addEventListener('wheel',e=>{if(!orbit)return;e.preventDefault();walk(T.MathUtils.clamp(-e.deltaY*.004,-.35,.35))},{passive:false});
  const ray=new T.Raycaster();
  canvas.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;if(!drag.moved){
    const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);
    let hit=ray.intersectObjects(picks,true)[0]?.object;while(hit&&!hit.userData.model)hit=hit.parent;if(hit)inspect(hit.userData.model);
    }drag=null});
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','s','a','d'].includes(e.key))return;e.preventDefault();flight=null;
    if(['ArrowUp','w','ArrowDown','s'].includes(e.key))walk(['ArrowUp','w'].includes(e.key)?.21:-.21);else if(orbit){orbit.angle+=['ArrowLeft','a'].includes(e.key)?-.09:.09;setOrbitCamera()}else yaw+=['ArrowLeft','a'].includes(e.key)?-.09:.09;refresh()});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();observer.disconnect();visible=false;lost()},{once:true});
  return {go,walk,pause(){visible=false;flight=null;drag=null;cancelAnimationFrame(frame);frame=0}};
}
