(() => {
  const find = id => document.getElementById(id);
  const scene = find('printScene');
  const layers = Array.from(scene.querySelectorAll('.shell-layer'));
  const slider = find('layerslider');
  const output = find('layercount');
  const toggle = find('motionToggle');
  const glyph = find('toggleGlyph');
  const trace = find('trace');
  const lip = find('lip');
  const nozzle = find('nozzle');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = layers.length;
  let position = 63.65;
  let activeLayer = -1;
  let length = 0;
  let playing = !motionPreference.matches;
  let visible = true;
  let frame = 0;
  let previousTime = null;
  let lastDraw = 0;
  let completedFor = 0;

  function draw() {
    const index = Math.min(total - 1, Math.floor(position));
    if (index !== activeLayer) {
      if (activeLayer < 0) {
        layers.forEach((layer, i) => { layer.style.display = i <= index ? '' : 'none'; });
      } else {
        for (let i = Math.min(index, activeLayer) + 1; i <= Math.max(index, activeLayer); i++) {
          layers[i].style.display = i <= index ? '' : 'none';
        }
      }
      const contour = layers[index].dataset.contour;
      lip.setAttribute('d', contour);
      trace.setAttribute('d', contour);
      length = trace.getTotalLength();
      slider.value = index + 1;
      slider.setAttribute('aria-valuetext', 'ชั้นที่ ' + (index + 1) + ' จาก ' + total);
      slider.style.setProperty('--progress', index / (total - 1) * 100 + '%');
      output.value = String(index + 1).padStart(2, '0') + ' / ' + total;
      activeLayer = index;
    }
    const traveled = Math.min(1, position - index) * length;
    trace.setAttribute('stroke-dasharray', traveled + ' ' + (length + 1));
    const point = trace.getPointAtLength(traveled);
    nozzle.setAttribute('transform', 'translate(' + point.x + ' ' + (point.y - 1) + ')');
  }

  function tick(now) {
    const elapsed = previousTime === null ? 0 : Math.min(now - previousTime, 100);
    previousTime = now;
    if (position >= total) {
      completedFor += elapsed;
      if (completedFor > 2200) { position = 0; completedFor = 0; }
    } else {
      position = Math.min(total, position + elapsed / 1050);
    }
    if (now - lastDraw >= 32) { draw(); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    previousTime = null;
    toggle.setAttribute('aria-label', playing ? 'พักการจำลอง' : 'เล่นการจำลอง');
    toggle.title = toggle.getAttribute('aria-label');
    glyph.setAttribute('d', playing ? 'M5 4h3v12H5zm7 0h3v12h-3z' : 'M5 3l12 7-12 7z');
    if (playing && visible && !document.hidden && !find('detail').open) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', () => { playing = !playing; sync(); });
  slider.addEventListener('input', () => {
    playing = false;
    completedFor = 0;
    position = Number(slider.value) - 0.05;
    draw();
    sync();
  });
  motionPreference.addEventListener('change', event => { playing = !event.matches; sync(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(scene);
  new MutationObserver(sync).observe(find('detail'), { attributes: true, attributeFilter: ['open'] });
  document.addEventListener('visibilitychange', sync);
  draw();
  sync();
})();
