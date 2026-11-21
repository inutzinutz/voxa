const projects = {
  'name-tag': {
    name:'พวงกุญแจชื่อ', alt:'พวงกุญแจ MILO ตัวอักษรนูนในสามคู่สี',
    pitch:'เปิดรับสั่งชื่อล่วงหน้าเป็นของขวัญวันเกิด ของทีม หรือของชำร่วย ลูกค้าเลือกชื่อและคู่สีได้ในออเดอร์เดียว',
    note:'ไฟล์ตัวอย่างเป็นชื่อ MILO ยาวประมาณ 46 มม. เปลี่ยนชื่อใน OpenSCAD และเพิ่มห่วงโลหะหลังพิมพ์ เปลี่ยนสีเส้นเมื่อเริ่มชั้นตัวอักษรนูน',
    grams:3, hours:.25, price:59, extras:15, quantity:20
  },
  'twist-vase': {
    name:'แจกันเกลียว', alt:'แจกันทรงเกลียวสีเขียวเซลาดอนสำหรับใส่ดอกไม้แห้ง',
    pitch:'จัดเป็นชุดแจกันกับดอกไม้แห้งสำหรับร้านดอกไม้ หรือเปิดให้ลูกค้าเลือกสีเข้ากับโต๊ะทำงาน ของชิ้นเดียวกันจึงทำเป็นคอลเลกชันได้',
    note:'ไฟล์แจกันสูง 92 มม. พิมพ์ตั้งบนฐาน ออกแบบสำหรับดอกไม้แห้ง ดอกไม้ในภาพเป็นของจัดประกอบ',
    grams:55, hours:3, price:229, extras:52, quantity:5
  },
  'table-stand': {
    name:'ฐานป้ายตั้งโต๊ะ', alt:'ฐานป้ายพิมพ์สามมิติดินเผาพร้อมการ์ดหมายเลขโต๊ะ 07',
    pitch:'เสนอร้านคาเฟ่เป็นชุดตามจำนวนโต๊ะ เลือกสีฐานให้เข้ากับร้าน แล้วเปลี่ยนการ์ดระหว่างเลขโต๊ะ เมนูพิเศษ หรือ QR ของร้านได้',
    note:'ไฟล์ฐานกว้าง 76 มม. มีร่องกว้าง 1.4 มม. การ์ดกระดาษเป็นชิ้นส่วนแยก ควรลองความหนาของการ์ดก่อนพิมพ์ยกชุด',
    grams:22, hours:1.2, price:119, extras:24, quantity:10
  }
};
const byId=id=>document.getElementById(id);
const form=byId('cost-form');
const formatMoney=new Intl.NumberFormat('th-TH',{style:'currency',currency:'THB',maximumFractionDigits:2,minimumFractionDigits:0});
const drafts=new Map();
let current;
function calculate() {
  const values=Object.fromEntries(new FormData(form));
  drafts.set(current,values);
  const valid=form.checkValidity();
  const n=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,Number(value)]));
  const unitCost=n.grams*n.filament/1000+n.hours*n.machine+n.extras+n.price*n.fees/100;
  const total=n.quantity*n.price;
  const cost=n.quantity*unitCost;
  for(const [id,amount] of Object.entries({sales:total,cost,balance:total-cost})){
    byId(id).textContent=valid?formatMoney.format(amount):'—';
  }
  byId('balance').classList.toggle('loss',valid&&cost>total);
  byId('estimate-note').textContent=valid?'คิดจากการขายครบ '+n.quantity.toLocaleString('th-TH')+' ชิ้น รวมค่าธรรมเนียมตามที่กรอก ค่าจัดส่งและงานเสียเพิ่มได้ในค่าใช้จ่ายอื่น':'กรุณากรอกตัวเลขให้ครบ และใส่จำนวนขายเป็นจำนวนเต็มตั้งแต่ 1 ชิ้น';
  const msg='สนใจพิมพ์'+projects[current].name+' ขาย'+(valid?' จำนวน '+n.quantity+' ชิ้น':'')+' รบกวนแนะนำระหว่าง K3 กับ i8 Combo พร้อมราคาเครื่องและวัสดุครับ';
  byId('idea-quote').href='https://line.me/R/oaMessage/%40dji13store/?'+encodeURIComponent(msg);
}
function select(id) {
  current=id;
  const project=projects[id],base='assets/prints/'+id;
  byId('idea-photo').src=base+'.webp';byId('idea-photo').alt=project.alt;
  byId('idea-name').textContent=project.name;
  byId('pitch').textContent=project.pitch;byId('build-note').textContent=project.note;
  byId('print-file').href=base+'.stl';byId('edit-file').href=base+'.scad';
  const values=drafts.get(id)||{...project,filament:450,machine:5,fees:5};
  for(const field of form.elements){if(field.name)field.value=values[field.name]}
  document.querySelectorAll('[data-print]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.print===id)));
  calculate();
}
form.addEventListener('input',calculate);form.addEventListener('submit',event=>event.preventDefault());
document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.print)));
select('name-tag');
