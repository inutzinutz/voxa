import {nameArtwork,tagSTL,tagHeight,eyeX,eyeRadius} from './tag-mesh.js';
const palettes=[
  {name:'หยก–ครีม',base:'#186b55',ink:'#fff0ce',edge:'#0b4838',relief:'#c9bd9e'},
  {name:'ม่วง–ครีม',base:'#9b79ca',ink:'#fff1d6',edge:'#70548d',relief:'#d2c4a9'},
  {name:'ไลม์–เขียว',base:'#c9e872',ink:'#205c48',edge:'#849e4a',relief:'#154235'}
];
const id=s=>document.getElementById(s);
const dialog=id('tag-studio'), input=id('tag-name'),preview=id('tag-preview');
let choice=0,art=null,name='',revision=0,applied=null;
const selectedPalette=()=>palettes[choice];
function message(value) {
  if(!value)return 'ใส่ชื่อเพื่อสร้างแบบของคุณ';
  if(!/^[A-Za-z0-9\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59 -]+$/u.test(value)||!/[A-Za-z0-9\u0e01-\u0e2e\u0e50-\u0e59]/u.test(value))return 'ใช้ชื่อภาษาไทย อังกฤษ หรือตัวเลข';
  const count=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('th').segment(value)].length:[...value].filter(ch=>!/[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]/.test(ch)).length;
  return count<=16?'':'กรุณาย่อชื่อให้เหลือไม่เกิน 16 ตัวอักษร';
}
function paint(){
  const g=preview.getContext('2d'),{width:w,canvas}=art,p=selectedPalette(),h=tagHeight;
  g.clearRect(0,0,preview.width,preview.height);
  const backdrop=g.createLinearGradient(0,0,800,510);backdrop.addColorStop(0,'#f0f3e9');backdrop.addColorStop(1,'#c7d4c3');
  g.fillStyle=backdrop;g.fillRect(0,0,800,510);
  const scale=Math.min(14,620/w);
  g.save();g.translate(400,246);g.rotate(-.12);g.scale(scale,.86*scale);g.translate(-w/2,-h/2);
  const shape=new Path2D();shape.moveTo(h/2,0);shape.lineTo(w-h/2,0);shape.arc(w-h/2,h/2,h/2,-Math.PI/2,Math.PI/2);shape.lineTo(h/2,h);shape.arc(h/2,h/2,h/2,Math.PI/2,1.5*Math.PI);shape.closePath();
  shape.moveTo(eyeX+eyeRadius,h/2);shape.arc(eyeX,h/2,eyeRadius,0,2*Math.PI);
  g.save();g.translate(.3,1.9);g.fillStyle=p.edge;g.shadowColor='#1b302b70';g.shadowBlur=20;g.shadowOffsetY=12;g.fill(shape,'evenodd');g.restore();
  for(let j=10;j>=0;j--){g.save();g.translate(0,j*.17);g.fillStyle=j?p.edge:p.base;g.fill(shape,'evenodd');g.restore()}
  const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const ink=layer.getContext('2d');
  ink.drawImage(canvas,0,0);ink.globalCompositeOperation='source-in';
  for(const [color,offset] of [[p.relief,.34],[p.ink,-.14]]){
    ink.fillStyle=color;ink.fillRect(0,0,layer.width,layer.height);g.drawImage(layer,0,offset,w,h);
  }
  g.restore();preview.setAttribute('aria-label','แบบพวงกุญแจ '+name+' สี'+p.name);
  id('tag-size').textContent=w+' × 17 × 3.7 มม.';
}
async function update() {
  const version=++revision;
  name=input.value.trim().normalize('NFC');
  const error=message(name);
  art=null;id('tag-error').textContent=error;input.setAttribute('aria-invalid',String(Boolean(error)));
  id('tag-download').disabled=id('tag-apply').disabled=true;
  if(error){preview.getContext('2d').clearRect(0,0,800,510);id('tag-size').textContent='';return}
  await Promise.allSettled([document.fonts.load('700 118px Poppins',name),document.fonts.load('700 118px Prompt',name)]);
  if(version!==revision)return;
  art=nameArtwork(name);paint();id('tag-download').disabled=id('tag-apply').disabled=false;
}
function openStudio(){
  input.value=applied?.name??'MILO';choice=applied?.choice??0;
  updateColors();dialog.showModal();update();input.focus();input.select();
}
function updateColors(){
  [...id('tag-palettes').querySelectorAll('button')].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===choice)));
}
palettes.forEach((p,i)=>{
  const b=document.createElement('button');b.type='button';b.className='palette-choice';
  const dot=document.createElement('span');dot.className='swatch';dot.style.background='linear-gradient(130deg,'+p.base+' 55%,'+p.ink+' 55%)';b.append(dot,p.name);
  b.onclick=()=>{choice=i;updateColors();if(art)paint()};id('tag-palettes').append(b);
});
function download(artwork,label) {
  const url=URL.createObjectURL(new Blob([tagSTL(artwork)],{type:'application/octet-stream'}));
  const a=document.createElement('a');a.href=url;a.download='VOXA-'+label.replaceAll(' ','-')+'.stl';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
id('tag-download').onclick=()=>{if(art)download(art,name)};
id('tag-apply').onclick=()=>{
  if(!art)return;
  applied={name,choice,palette:selectedPalette().name,artwork:art,image:preview.toDataURL('image/webp',.9)};
  document.dispatchEvent(new Event('tag-applied'));dialog.close();id('estimate').scrollIntoView({block:'start'});
};
id('tag-close').onclick=()=>dialog.close();
input.addEventListener('input',update);
export {openStudio,applied,download};
