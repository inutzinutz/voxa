(() => {
  const $ = selector => document.querySelector(selector);
  const models = items.filter(p => p.id === 'k3' || p.id === 'i8');
  const names = {front:'มุมโชว์รูมเสมือน',k3:'แท่น K3',i8:'แท่น SPARKX i8 Combo'};
  const modal = $('#sheet'), pan = $('#pan'), viewport = $('#viewport'), world = $('#world');
  let tour, place = 'front', noticeTimer, entering = false;
  const quote = p => 'https://line.me/R/oaMessage/%40dji13store/?' + encodeURIComponent('สนใจ '+p.name+' จากโชว์รูม VOXA ขอสอบถามราคาและการสั่งซื้อครับ');
  function redirectCatalog() {
    if (['#products','#catalog','#ink-lab','#tool-lab'].includes(location.hash)) location.replace('catalog.html'+location.search+location.hash);
  }
  redirectCatalog();
  addEventListener('hashchange',redirectCatalog);
  function notify(message) {
    clearTimeout(noticeTimer); $('#status').textContent = message;
    noticeTimer = setTimeout(() => $('#status').textContent = '',5500);
  }
  function showModel(id) {
    const p = models.find(p => p.id === id);
    $('#details').innerHTML = '<h2 id="sheet-title">'+p.name+'</h2><img class="spec-photo" src="assets/'+id+'-hero.png" alt="'+p.name+'"><p>'+p.note+'</p><table><tbody>'+Object.entries(p.specs).map(([k,v]) => '<tr><th scope="row">'+k+'</th><td>'+v+'</td></tr>').join('')+'<tr><th scope="row">การรับประกัน</th><td>1 ปี ตามข้อมูลสินค้า</td></tr></tbody></table><div class="actions"><a target="_blank" rel="noopener" href="'+quote(p)+'">สอบถามราคาทาง LINE</a><a href="tel:0656946155">โทร 13 Store</a></div>';
    if (!modal.open) modal.showModal();
  }
  function compare() {
    const [a,b] = models;
    $('#details').innerHTML = '<h2 id="sheet-title">เทียบ K3 กับ i8 Combo</h2><table><thead><tr><th>ข้อมูล</th><th>K3</th><th>i8 Combo</th></tr></thead><tbody>'+[...Object.keys(a.specs),'จุดเด่น'].map(k=>'<tr><th scope="row">'+k+'</th><td>'+(a.specs[k]||a.note)+'</td><td>'+(b.specs[k]||b.note)+'</td></tr>').join('')+'</tbody></table><div class="actions"><a target="_blank" rel="noopener" href="https://line.me/R/ti/p/%40dji13store">ปรึกษา 13 Store</a></div>';
    modal.showModal();
  }
  function station(id) {
    place=id;
    $('#view-title').textContent=names[id];
    document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===id);b.setAttribute('aria-pressed',String(b.dataset.view===id))});
  }
  function framePhoto() {
    viewport.style.setProperty('--vh',viewport.clientHeight+'px');
    pan.scrollLeft=(pan.scrollWidth-pan.clientWidth)/2;
  }
  new ResizeObserver(framePhoto).observe(viewport);
  async function enter(id) {
    if (entering) return;
    entering=true;
    const btn=$('#enter');
    try {
      if(!tour){
        btn.disabled=true;btn.lastElementChild.textContent='กำลังเปิดห้อง…';
        const {createTour}=await import('./tour.js');
        tour=createTour(world,showModel,()=>{leave();notify('การแสดงผล 3D หยุดชั่วคราว ดูเครื่องผ่านจุดบนภาพได้ครับ');tour=null;world.replaceChildren()});
      }
      world.hidden=false; pan.hidden=true; $('#walk').hidden=false;
      tour.go(id);station(id);btn.lastElementChild.textContent='กลับภาพโชว์รูม';
      $('#view-hint').textContent=id==='front'?'ลากเพื่อหันมอง · แตะเครื่องเพื่อดูสเปก':'ลากหมุนรอบเครื่อง 360° · กด + หรือ − เพื่อซูม';
      const labels=id==='front'?['เดินถอยหลัง','เดินไปข้างหน้า']:['ซูมออก','ซูมเข้า'];
      document.querySelectorAll('[data-walk]').forEach((button,i)=>button.setAttribute('aria-label',labels[i]));
    } catch(err) {
      console.error(err);leave();
      if(id!=='front')showModel(id);
      notify('อุปกรณ์นี้เปิดห้อง 3D ไม่ได้ เลือกดูเครื่องจากจุดบนภาพได้');
    } finally {btn.disabled=false;entering=false}
  }
  function leave() {
    tour?.pause();world.hidden=true;pan.hidden=false;$('#walk').hidden=true;station('front');
    $('#enter').lastElementChild.textContent='เดินชมแบบ 3D';$('#view-hint').textContent='เลือกจุดบนเครื่องเพื่อดูรายละเอียด';framePhoto();
  }
  $('#enter').onclick=()=>world.hidden?enter('front'):leave();
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.view;
    if(id==='front'&&world.hidden){station(id);framePhoto();return}
    enter(id);
  });
  document.querySelectorAll('[data-walk]').forEach(b=>b.onclick=()=>tour?.walk(Number(b.dataset.walk)*.6));
  $('#cards').innerHTML=models.map(p=>'<button class="product" data-model="'+p.id+'"><img src="assets/'+p.id+'-hero.png" loading="lazy" alt=""><span><span class="eng">'+p.series+'</span><strong>'+p.name+'</strong><small>'+p.specs['พื้นที่พิมพ์']+'</small><span class="detail-link">ดูรายละเอียดรุ่น</span></span></button>').join('');
  document.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>showModel(b.dataset.model));
  $('#compare-btn').onclick=compare;$('#close').onclick=()=>modal.close();
  modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()});
})();
