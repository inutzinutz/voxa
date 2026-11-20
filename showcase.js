(() => {
  const viewer = document.querySelector('.viewer');
  const machine = document.getElementById('stage-machine');
  const copies = {
    k3: 'เปลี่ยนหัวฉีดอัตโนมัติ 4 หัว สำหรับงานที่ต้องเลือกใช้เส้นต่างชนิด รองรับทั้ง TPU 95A และเส้นผสมคาร์บอนไฟเบอร์',
    i8: 'เปลี่ยนสีในเวลาไม่ถึง 1 วินาทีด้วย QuarTeks™ เหมาะกับโมเดลและฟิกเกอร์หลายสี รองรับชุด CFS Lite'
  };
  const choices = [...document.querySelectorAll('[data-showcase]')];
  const views = [...document.querySelectorAll('[data-view]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function showView(productView) {
    viewer.classList.toggle('is-product', productView);
    views.forEach(button => {
      button.setAttribute('aria-pressed', (button.dataset.view === 'product') === productView);
    });
  }
  function showProduct(id) {
    const product = items.find(item => item.id === id);
    document.getElementById('storyname').textContent = product.name;
    document.getElementById('storycopy').textContent = copies[id];
    document.getElementById('mainmetric').textContent = product.specs['พื้นที่พิมพ์'].split(' มม.')[0];
    document.getElementById('speedmetric').textContent = product.specs['ความเร็วสูงสุด'].split(' ')[0];
    document.getElementById('featuredDetail').dataset.detail = id;
    document.getElementById('stage-series').textContent = product.series;
    const quote = document.getElementById('featuredQuote');
    quote.href = inquiryUrl(product);
    quote.lastChild.textContent = 'สอบถามราคา ' + product.name;
    machine.src = 'assets/' + id + '-hero.png';
    machine.alt = product.name;
    choices.forEach(button => button.setAttribute('aria-pressed', button.dataset.showcase === id));
    showView(true);
    if (!reducedMotion.matches) {
      machine.animate([{opacity: .4, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 280});
    }
  }
  choices.forEach(button => button.addEventListener('click', () => showProduct(button.dataset.showcase)));
  views.forEach(button => button.addEventListener('click', () => showView(button.dataset.view === 'product')));
})();
