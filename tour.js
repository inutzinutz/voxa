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
  const mats=new Map();
  function material(color) {
    if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.6,metalness:.09}));
    return mats.get(color);
  }
  const cube=new T.BoxGeometry(1,1,1);
  function mesh(parent,geo,mat,x,y,z) {
    const obj=new T.Mesh(geo,typeof mat==='number'?material(mat):mat);
    obj.position.set(x,y,z);parent.add(obj);return obj;
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
  scene.add(new T.HemisphereLight(0xfffcf0,0xc1bbaa,2.5));
  const sun=new T.DirectionalLight(0xffedcc,2.2);sun.position.set(-3,6,4);scene.add(sun);
  box(scene,0,-.09,0,8.6,.18,11,stone);box(scene,0,1.8,-5.4,8.6,3.6,.18,ivory);
  box(scene,-4.25,1.8,0,.14,3.6,11,ivory);box(scene,4.25,1.8,0,.14,3.6,11,ivory);
  box(scene,0,3.65,0,8.6,.12,11,ash);box(scene,0,1.8,5.5,8.6,3.6,.1,0xb3b6a6);
  for(let i=-4;i<=4;i++)box(scene,i,.005,0,.009,.01,11,0xb6ad9f);
  for(let z=-5;z<=5;z++)box(scene,0,.005,z,8.5,.01,.009,0xb6ad9f);
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
    cyl(s,0,0,0,.097,.097,.079,c);for(const v of [-.043,.043])cyl(s,0,v,0,.106,.106,.012,ash);cyl(s,0,-.054,0,.035,.035,.015,silver)}
  for(const [id,x] of Object.entries(positions)){
    const stand=group(x,0,-.1);stand.userData.model=id;picks.push(stand);
    box(stand,0,.485,0,1.55,.93,2.15,silver);box(stand,0,.965,0,1.58,.045,2.18,ivory);
    for(let j=0;j<4;j++)box(stand,0,.1+j*.026,1.078,1.45,.008,.008,0xf6e6b7);
    signage(stand,id==='k3'?'K3':'i8 Combo',0,.66,1.079,1.25,.29,'#19201c');
    const g=group(.02,.99,-.32,stand);g.scale.setScalar(1.28);
    if(id==='k3'){
      box(g,0,.32,0,.52,.64,.48,ivory);box(g,0,.307,.248,.447,.525,.015,ash);
      box(g,0,.302,.26,.405,.471,.009,0x263233);box(g,0,.299,.269,.33,.38,.009,0x344548);
      box(g,0,.148,.28,.32,.025,.018,black);box(g,0,.406,.279,.31,.018,.014,silver);box(g,.045,.381,.285,.063,.06,.014,black);
      box(g,.147,.596,.252,.14,.07,.02,black);spool(g,.289,.41,.02,0x59a6cf);spool(g,.289,.17,.015,0x8cc98a);
      for(let i=0;i<4;i++)tube(g,[[.27,.51,i*.038-.09],[.2,.77+i*.022,i*.025-.1],[.02,.81+i*.025,.005],[.015,.64,.06+i*.015]],.004,silver);
    }else{
      box(g,0,.036,0,.6,.072,.5,ivory);box(g,0,.08,.018,.44,.022,.38,ash);
      for(const x of [-.225,.225])box(g,x,.325,-.04,.041,.52,.062,silver);
      box(g,0,.59,-.04,.51,.055,.085,ivory);box(g,0,.34,-.008,.48,.025,.038,ash);
      box(g,.029,.31,.013,.085,.09,.071,ivory);cyl(g,.03,.253,.017,.02,.007,.027,ash);
      for(const [i,c] of [0xffa998,0xadd6d9,0xe4ad54,0xf1dfad].entries())spool(g,i<2?-.298:.298,i%2?.17:.45,0,c);
      for(let i=0;i<3;i++)tube(g,[[i%2?.285:-.285,.43,-.04],[i%2?.22:-.23,.73,-.03],[.04,.76+i*.025,-.04],[.03,.36,-.002]],.005,ash);
    }
    vessel(stand,-.28,.99,.66,.33,.15,id==='k3'?0x67afaf:sage);
  }
  const stops={front:[0,1.68,4.65,0,-.09],k3:[-.62,1.65,1.75,-.35,-.13],i8:[.62,1.65,1.75,.35,-.13]};
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
  function go(id){
    visible=true;resize();const [x,y,z,a,b]=stops[id];
    if(reduced.matches){flight=null;camera.position.set(x,y,z);yaw=a;pitch=b}
    else flight={start:performance.now(),from:camera.position.clone(),to:new T.Vector3(x,y,z),y0:yaw,y1:a,p0:pitch,p1:b};
    refresh();canvas.focus({preventScroll:true});
  }
  function walk(amount){
    flight=null;const nx=T.MathUtils.clamp(camera.position.x+Math.sin(yaw)*amount,-3.2,3.45),nz=T.MathUtils.clamp(camera.position.z-Math.cos(yaw)*amount,-2.8,4.95);
    if(!Object.values(positions).some(x=>Math.abs(x-nx)<.95&&Math.abs(nz+.1)<1.25)){camera.position.x=nx;camera.position.z=nz}refresh();
  }
  canvas.addEventListener('pointerdown',e=>{if(drag)return;flight=null;canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false}});
  canvas.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>5)drag.moved=true;
    yaw-=dx*.004;pitch=T.MathUtils.clamp(pitch+dy*.003,-.77,.64);drag.x=e.clientX;drag.y=e.clientY;refresh()});
  const ray=new T.Raycaster();
  canvas.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;if(!drag.moved){
    const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);
    let hit=ray.intersectObjects(picks,true)[0]?.object;while(hit&&!hit.userData.model)hit=hit.parent;if(hit)inspect(hit.userData.model);
    }drag=null});
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','s','a','d'].includes(e.key))return;e.preventDefault();flight=null;
    if(['ArrowUp','w','ArrowDown','s'].includes(e.key))walk(['ArrowUp','w'].includes(e.key)?.21:-.21);else yaw+=['ArrowLeft','a'].includes(e.key)?-.09:.09;refresh()});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();observer.disconnect();visible=false;lost()},{once:true});
  return {go,walk,pause(){visible=false;flight=null;drag=null;cancelAnimationFrame(frame);frame=0}};
}
