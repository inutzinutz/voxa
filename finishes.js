import * as T from './assets/vendor/three.module.min.js';

// Sample the gallery's glazing, wall bounce and luminous ceiling strips into a
// linear HDR environment. PMREM convolves it for different surface roughnesses.
export function lightGallery(scene, renderer) {
  const gpu=renderer.isWebGLRenderer;
  if (gpu) {
    const width=256,height=128, pixels=new Float32Array(width*height*4);
    for(let row=0;row<height;row++)for(let col=0;col<width;col++){
      const lat=((row+.5)/height-.5)*Math.PI, lon=((col+.5)/width-.5)*2*Math.PI;
      const x=Math.cos(lat)*Math.cos(lon),y=Math.sin(lat),z=Math.cos(lat)*Math.sin(lon);
      const window=z>.6&&Math.abs(x)<.68&&y>-.16&&y<.61;
      const strip=y>.45&&Math.abs(Math.abs(x)-.44)<.065;
      const intensity=window?4.6:strip?7:y<0?.27:.49;
      const i=4*(row*width+col);
      pixels.set([intensity*(strip?1.12:1),intensity*(strip?.86:.97),intensity*(strip?.62:.92),1],i);
    }
    const hdr=new T.DataTexture(pixels,width,height,T.RGBAFormat,T.FloatType);
    hdr.mapping=T.EquirectangularReflectionMapping;hdr.needsUpdate=true;
    const filter=new T.PMREMGenerator(renderer),target=filter.fromEquirectangular(hdr);
    scene.environment=target.texture;hdr.dispose();filter.dispose();
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  }
  scene.add(new T.HemisphereLight(0xfff2dd,0xa49e8a,.76));
  const key=new T.DirectionalLight(0xfff1d6,2.35);
  key.position.set(-2.8,3.32,4.8);key.target.position.set(0,.5,-.9);
  key.castShadow=true;key.shadow.mapSize.set(1536,1536);
  Object.assign(key.shadow.camera,{left:-4.8,right:4.8,top:4.8,bottom:-4.8,near:.1,far:15});key.shadow.camera.updateProjectionMatrix();
  key.shadow.normalBias=.012;key.shadow.bias=-.00035;scene.add(key,key.target);
  for(const x of [-1.29,1.29]){
    const spot=new T.SpotLight(0xffe0ac,34,8,.64,.78,2);
    spot.position.set(x-.38,3.32,.55);spot.target.position.set(x,1,-.25);scene.add(spot,spot.target);
  }
}

// A subdivided die-cast enclosure, with flat planar faces and smooth fillets.
const castings=new Map();
export function casing(w,h,d,r) {
  const key=[w,h,d,r].join('/');
  if(castings.has(key))return castings.get(key);
  const geom=new T.BoxGeometry(1,1,1,7,7,7);
  const positions=geom.attributes.position,normals=geom.attributes.normal;
  const normal=new T.Vector3(),p=new T.Vector3();
  for(let i=0;i<positions.count;i++){
    p.fromBufferAttribute(positions,i);normal.copy(p).multiplyScalar(2);
    for(const axis of ['x','y','z']){
      const a=Math.abs(normal[axis]);
      normal[axis]=Math.sign(normal[axis])*Math.max(0,(a-.14)/.86);
    }
    normal.normalize();
    const half=[w/2,h/2,d/2];
    const coords=['x','y','z'].map((ax,j)=>Math.sign(p[ax])*(half[j]-r)+normal[ax]*r);
    positions.setXYZ(i,...coords);normals.setXYZ(i,normal.x,normal.y,normal.z);
  }
  castings.set(key,geom);return geom;
}

export function galleryFloor(){
  const geo=new T.PlaneGeometry(8.5,10.8,58,72);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position,v=new T.Vector3(),colors=[];
  const muted=new T.Color(0xc5b8a4);
  for(let i=0;i<pos.count;i++){
    v.fromBufferAttribute(pos,i);
    let light=.85+.14*Math.cos(v.z*.6);
    for(const x of [-1.29,1.29]){
      const dx=Math.max(Math.abs(v.x-x)-.74,0),dz=Math.max(Math.abs(v.z+.1)-1,0);
      light-=.51*Math.exp(-8*(dx*dx+dz*dz));
    }
    light+=.22*Math.exp(-.19*((v.x+2.4)**2+(v.z-3.6)**2));
    light-=.14*Math.exp(-3*(4.25-Math.abs(v.x)));
    colors.push(muted.r*light,muted.g*light,muted.b*light);
  }
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  const mat=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.7,metalness:.04});
  const floor=new T.Mesh(geo,mat);floor.receiveShadow=true;floor.userData.floor=true;return floor;
}

// A tileable scalar height field gives blasted aluminium a directional grain.
// The texture is shared across finishes and never fetched during a camera move.
export function grainTexture(brushed) {
  const size=128, data=new Uint8Array(size*size*4);
  let seed=39;
  const noise=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
  for(let y=0;y<size;y++){
    const stroke=noise();
    for(let x=0;x<size;x++){
      const level=Math.round(255*(brushed?.72*stroke+.28*noise():noise()));
      const i=(y*size+x)*4;data.set([level,level,level,255],i);
    }
  }
  const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;
  t.minFilter=T.LinearMipMapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.repeat.set(brushed?2:12,brushed?6:14);t.needsUpdate=true;return t;
}
