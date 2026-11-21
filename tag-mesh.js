// XY coordinates and Z heights are in millimetres. Both the preview and the
// export use the same text mask, including shaped Thai vowels and tone marks.
export const tagHeight=17, baseHeight=2.8, reliefHeight=.9, eyeX=5.2, eyeRadius=2.2;

export function nameArtwork(name) {
  const ppm=12, canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const font='700 118px Poppins, Prompt, sans-serif';
  ctx.font=font;
  const m=ctx.measureText(name);
  const inkWidth=Math.max(1,m.actualBoundingBoxLeft+m.actualBoundingBoxRight);
  const inkHeight=Math.max(1,m.actualBoundingBoxAscent+m.actualBoundingBoxDescent);
  const scale=Math.min(1,11*ppm/inkHeight,79*ppm/inkWidth);
  const width=Math.max(38,Math.ceil(inkWidth*scale/ppm+15));
  canvas.width=width*ppm;canvas.height=tagHeight*ppm;
  ctx.font=font;
  const left=10+(width-14-inkWidth*scale/ppm)/2;
  ctx.translate(left*ppm,(canvas.height-inkHeight*scale)/2);
  ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.fillText(name,m.actualBoundingBoxLeft,m.actualBoundingBoxAscent);
  return {width,canvas,ppm,rgba:ctx.getImageData(0,0,canvas.width,canvas.height).data};
}

export function tagSTL({width,ppm,rgba}) {
  const step=.22, cols=Math.ceil(width/step)+3,rows=Math.ceil(tagHeight/step)+3;
  const samples=[], radius=tagHeight/2, imageWidth=width*ppm;
  const maxFaces=(cols-1)*(rows-1)*10;
  const bytes=new ArrayBuffer(84+50*maxFaces),out=new DataView(bytes);
  let faces=0;
  function heightAt(x,y) {
    const px=Math.round(x*ppm),py=Math.round((tagHeight-y)*ppm);
    if(px<0||px>=imageWidth||py<0||py>=tagHeight*ppm)return baseHeight;
    return baseHeight+reliefHeight*rgba[(py*imageWidth+px)*4+3]/255;
  }
  // Slightly offset the lattice so it doesn't coincide with the long flat edges.
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const x=(i-1.133)*step,y=(j-1.237)*step;
    const axisX=Math.min(width-radius,Math.max(radius,x));
    const inside=Math.min(radius-Math.hypot(x-axisX,y-radius),Math.hypot(x-eyeX,y-radius)-eyeRadius);
    samples.push({x,y,z:heightAt(x,y),d:inside,id:samples.length});
  }
  function cut(p,q) {
    if(p.id>q.id)[p,q]=[q,p];
    const t=p.d/(p.d-q.d);
    return {x:p.x+t*(q.x-p.x),y:p.y+t*(q.y-p.y),z:baseHeight,edge:true};
  }
  function face(a,az,b,bz,c,cz) {
    const ux=b.x-a.x,uy=b.y-a.y,uz=bz-az,vx=c.x-a.x,vy=c.y-a.y,vz=cz-az;
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    const mag=Math.hypot(nx,ny,nz);if(!mag)return;
    const start=84+50*faces++;
    const values=[nx/mag,ny/mag,nz/mag,a.x, a.y,az,b.x,b.y,bz,c.x,c.y,cz];
    for(let i=0;i<12;i++)out.setFloat32(start+4*i,values[i],true);
  }
  function surface(a,b,c) {
    if(a.d<0&&b.d<0&&c.d<0)return;
    if(a.d>0&&b.d>0&&c.d>0){face(a,a.z,b,b.z,c,c.z);face(a,0,c,0,b,0);return}
    const polygon=[];let prev=c;
    for(const point of [a,b,c]){
      if((prev.d>=0)!==(point.d>=0))polygon.push(cut(prev,point));
      if(point.d>=0)polygon.push(point);
      prev=point;
    }
    for(let i=1;i+1<polygon.length;i++){
      const [p,q,r]=[polygon[0],polygon[i],polygon[i+1]];
      face(p,p.z,q,q.z,r,r.z);face(p,0,r,0,q,0);
    }
    for(let i=0;i<polygon.length;i++){
      const p=polygon[i],q=polygon[(i+1)%polygon.length];
      if(p.edge&&q.edge){face(p,0,q,0,q,q.z);face(p,0,q,q.z,p,p.z)}
    }
  }
  for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
    const k=j*cols+i;
    surface(samples[k],samples[k+1],samples[k+cols+1]);
    surface(samples[k],samples[k+cols+1],samples[k+cols]);
  }
  out.setUint32(80,faces,true);
  return bytes.slice(0,84+faces*50);
}
