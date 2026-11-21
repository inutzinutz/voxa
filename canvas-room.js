// Lightweight projected scene for browsers with GPU acceleration disabled.
// Geometry and camera are shared with the WebGL view so station picking still works.
import {Color, Matrix4, Vector3} from './assets/vendor/three.module.min.js';

export function canvasRenderer() {
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
  const cache=new WeakMap(),eye=new Matrix4(),v=new Vector3(),normal=new Vector3();
  const light=new Vector3(-.45,.78,.48).normalize();
  let w=1,h=1;
  function geometry(obj){
    let data=cache.get(obj);if(data)return data;
    const pos=obj.geometry.attributes.position,idx=obj.geometry.index;
    const vertices=Array.from({length:pos.count},(_,i)=>new Vector3().fromBufferAttribute(pos,i).applyMatrix4(obj.matrixWorld));
    const faces=[];
    for(let i=0;i<(idx?idx.count:pos.count);i+=3){
      const [a,b,c]=[0,1,2].map(j=>idx?idx.getX(i+j):i+j);
      normal.subVectors(vertices[b],vertices[a]).cross(v.subVectors(vertices[c],vertices[a])).normalize();
      const pt=vertices[a], focus=Math.exp(-.23*(pt.z+.48)**2);
      const key=Math.max(0,normal.dot(light));
      const shade=.45+.4*key+.23*focus+.09*Math.max(0,normal.y);
      const grain=obj.geometry.attributes.color;
      const tint=grain?new Color().fromBufferAttribute(grain,a):new Color(1,1,1);
      const fill=new Color().copy(obj.material.color).multiply(tint).multiplyScalar(shade).getStyle();
      faces.push({a,b,c,fill});
    }
    data={vertices,faces};cache.set(obj,data);return data;
  }
  function nearClip(points){
    const result=[];let a=points[points.length-1];
    for(const b of points){
      if((a.z<-.045)!==(b.z<-.045)){const t=(-.045-a.z)/(b.z-a.z);result.push({x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y),z:-.045})}
      if(b.z<-.045)result.push(b);a=b;
    }return result;
  }
  function render(scene,camera){
    scene.updateMatrixWorld();camera.updateMatrixWorld();eye.copy(camera.matrixWorldInverse);
    const scale=h/(2*Math.tan(camera.fov*Math.PI/360));
    const project=p=>[w/2-p.x*scale/p.z,h/2+p.y*scale/p.z];
    const draw=[];
    scene.traverseVisible(obj=>{
      if(!obj.isMesh)return;
      const geo=geometry(obj),verts=geo.vertices.map(p=>p.clone().applyMatrix4(eye));
      if(obj.geometry.type==='PlaneGeometry'&&obj.material.map?.image){
        if(verts.some(p=>p.z>=-.045))return;
        const [a,b,c]=verts.slice(0,3).map(project),img=obj.material.map.image;
        draw.push({z:verts[0].z+.008,paint:()=>{ctx.save();ctx.transform((b[0]-a[0])/img.width,(b[1]-a[1])/img.width,(c[0]-a[0])/img.height,(c[1]-a[1])/img.height,a[0],a[1]);ctx.drawImage(img,0,0);ctx.restore()}});
        return;
      }
      for(const {a,b,c,fill} of geo.faces){
        const p=verts[a],q=verts[b],r=verts[c];if(p.z>=-.045&&q.z>=-.045&&r.z>=-.045)continue;
        const clip=nearClip([p,q,r]);if(clip.length<3)continue;
        const pts=clip.map(project);
        if((pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0])>=0)continue;
        if(pts.every(p=>p[0]<0)||pts.every(p=>p[0]>w)||pts.every(p=>p[1]<0)||pts.every(p=>p[1]>h))continue;
        // Enclosing architecture must be painted behind all furniture.
        const shell=obj.userData.floor||obj.geometry.type==='BoxGeometry'&&(obj.scale.x>=8||obj.scale.z>=10.9);
        draw.push({z:(p.z+q.z+r.z)/3-(shell?100:0),pts,fill,alpha:obj.material.opacity});
      }
    });
    ctx.fillStyle='#dfd9ce';ctx.fillRect(0,0,w,h);draw.sort((a,b)=>a.z-b.z);
    for(const item of draw){if(item.paint){item.paint();continue}ctx.beginPath();item.pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.globalAlpha=item.alpha??1;ctx.fillStyle=item.fill;ctx.fill();ctx.strokeStyle=item.fill;ctx.lineWidth=.65;ctx.stroke();ctx.globalAlpha=1}
  }
  return {domElement:canvas,setPixelRatio(){},setSize(width,height){const factor=Math.min(1,1100/width);w=canvas.width=Math.round(width*factor);h=canvas.height=Math.round(height*factor)},render};
}
