(() => {
  const get = id => document.getElementById(id);
  const stage = document.querySelector('.product-stage');
  const viewer = document.querySelector('.viewer');
  const toolButtons = [...stage.querySelectorAll('[data-tool]')];
  const inkButtons = [...stage.querySelectorAll('[data-ink]')];
  const tools = [...stage.querySelectorAll('.toolbit')];
  const target = stage.querySelector('.tool-target');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = [
    ['ม่วง', '#aa77fb', '#533797', '#e4ceff'],
    ['ส้ม', '#ff9950', '#9c4124', '#ffe5ab'],
    ['ฟ้า', '#6be0f1', '#216a83', '#d4ffff'],
    ['เขียว', '#b1e763', '#54832d', '#edffd0']
  ];
  let model = 'k3';
  let index = 0;
  let playing = !motion.matches;
  let onscreen = false;
  let timer;

  function paint() {
    const k3 = model === 'k3';
    get('tool-lab').hidden = !k3;
    get('ink-lab').hidden = k3;
    const buttons = k3 ? toolButtons : inkButtons;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', i === index));
    if (k3) {
      tools.forEach((bit, i) => bit.classList.toggle('active', i === index));
      target.style.transform = 'translateX(' + index * 54 + 'px)';
      get('lab-reading').textContent = 'หัวฉีด 0' + (index + 1) + ' / 04';
    } else {
      const [name, tone, deep, light] = palette[index];
      stage.style.setProperty('--tone', tone);
      stage.style.setProperty('--tone-deep', deep);
      stage.style.setProperty('--tone-light', light);
      get('lab-reading').textContent = 'ชิ้นงานสี' + name;
    }
    const label = playing ? 'พักการสาธิต' : 'เล่นการสาธิต';
    get('lab-play').textContent = label;
    get('lab-play').setAttribute('aria-label', label);
    stage.classList.toggle('paused', !playing);
  }

  function schedule() {
    clearInterval(timer);
    if (playing && onscreen && !document.hidden && viewer.classList.contains('is-product') && !get('detail').open) {
      timer = setInterval(() => { index = (index + 1) % 4; paint(); }, 2200);
    }
  }

  function pick(i) {
    index = i;
    playing = false;
    paint();
    schedule();
  }
  toolButtons.forEach((button, i) => button.addEventListener('click', () => pick(i)));
  inkButtons.forEach((button, i) => button.addEventListener('click', () => pick(i)));
  get('lab-play').addEventListener('click', () => { playing = !playing; paint(); schedule(); });
  document.querySelectorAll('[data-showcase]').forEach(button => button.addEventListener('click', () => {
    if (model !== button.dataset.showcase) {
      model = button.dataset.showcase;
      index = 0;
      paint();
    }
    schedule();
  }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', schedule));
  motion.addEventListener('change', () => { playing = !motion.matches; paint(); schedule(); });
  new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; schedule(); }).observe(stage);
  new MutationObserver(schedule).observe(get('detail'), {attributes:true, attributeFilter:['open']});
  document.addEventListener('visibilitychange', schedule);
  paint();
})();
