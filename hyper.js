// VOXA hyper motion layer. Decorative SVG effects only: nothing here changes
// content or behaviour, and it all stays off under prefers-reduced-motion.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const NS = 'http://www.w3.org/2000/svg';
  const q = (s, r = document) => r.querySelector(s);
  const svgEl = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const rnd = (i, m) => (i * 7919 + 13) % m; // cheap deterministic scatter
  document.documentElement.classList.add('hx');

  // One shared frame loop; each job only runs while its element is on screen.
  const jobs = [];
  let last = performance.now();
  requestAnimationFrame(function loop(now) {
    const dt = Math.min(now - last, 64); last = now;
    for (const j of jobs) if (j.live()) j.run(dt);
    requestAnimationFrame(loop);
  });
  const watch = el => { const s = { on: false }; new IntersectionObserver(([e]) => { s.on = e.isIntersecting; }).observe(el); return s; };

  /* ---- energy pulses along the existing wave lines ---- */
  function pulses(svg, every) {
    if (!svg) return;
    const paths = [...svg.querySelectorAll('path')];
    if (!paths.length) return;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'hx-pulses');
    paths.forEach((p, i) => {
      if (i % every) return;
      const c = p.cloneNode();
      c.setAttribute('pathLength', '100');
      c.setAttribute('class', 'hx-p');
      c.style.setProperty('--d', (2.4 + rnd(i, 17) / 5).toFixed(2) + 's');
      c.style.setProperty('--w', (-rnd(i, 29) / 4).toFixed(2) + 's');
      g.appendChild(c);
    });
    paths[0].parentNode.appendChild(g);
  }
  pulses(q('.light-field'), 2);
  pulses(q('.catalogwave'), 3);

  /* ---- HUD around the hero machine ---- */
  const stage = q('.product-stage'), frame = q('.machine-frame');
  if (stage && frame) {
    const sparks = Array.from({ length: 12 }, (_, i) =>
      `<circle class="hx-spark" cx="${90 + rnd(i, 220)}" cy="352" r="${1 + rnd(i, 3) * .5}" style="--d:${2.2 + rnd(i, 9) / 4}s;--w:${-rnd(i, 13) / 3}s;--x:${rnd(i, 60) - 30}px"/>`).join('');
    frame.append(svgEl(`<svg class="hx-hud hx-back" viewBox="0 0 400 400" aria-hidden="true"><g class="hx-par">
      <g transform="rotate(-16 200 205)"><ellipse class="hx-ring" cx="200" cy="205" rx="190" ry="60" pathLength="100"/><ellipse class="hx-comet" style="--d:4.6s" cx="200" cy="205" rx="190" ry="60" pathLength="100"/></g>
      <g transform="rotate(18 200 200)"><ellipse class="hx-ring rev" cx="200" cy="200" rx="168" ry="104" pathLength="100"/><ellipse class="hx-comet rev" style="--d:7s" cx="200" cy="200" rx="168" ry="104" pathLength="100"/></g>
      <g transform="rotate(64 200 200)"><ellipse class="hx-ring" cx="200" cy="200" rx="176" ry="46" pathLength="100"/><ellipse class="hx-comet" style="--d:3.4s" cx="200" cy="200" rx="176" ry="46" pathLength="100"/></g>
      <g class="hx-radar"><ellipse cx="200" cy="354" rx="150" ry="20"/><ellipse style="--w:1.2s" cx="200" cy="354" rx="150" ry="20"/><ellipse style="--w:2.4s" cx="200" cy="354" rx="150" ry="20"/></g>
      ${sparks}</g></svg>`));
    const ticks = Array.from({ length: 21 }, (_, i) => `<line x1="${i % 5 ? 20 : 14}" x2="26" y1="${40 + i * 16}" y2="${40 + i * 16}"/>`).join('');
    const front = svgEl(`<svg class="hx-hud hx-front" viewBox="0 0 400 400" aria-hidden="true">
      <defs><linearGradient id="hxbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3f150" stop-opacity="0"/><stop offset="1" stop-color="#c3f150" stop-opacity=".3"/></linearGradient></defs>
      <g class="hx-par2">
      <g class="hx-br"><path d="M36 76V36h40" pathLength="1"/><path d="M324 36h40v40" pathLength="1"/><path d="M364 324v40h-40" pathLength="1"/><path d="M76 364H36v-40" pathLength="1"/></g>
      <g class="hx-ticks">${ticks}</g>
      <g class="hx-beam"><rect x="36" y="-46" width="328" height="46" fill="url(#hxbeam)"/><path d="M28 0H372"/><path class="hx-mark" d="M6 -5l10 5-10 5z"/><text x="364" y="-7" text-anchor="end"></text></g>
      <circle class="hx-burst" cx="200" cy="200" r="160"/></g></svg>`);
    frame.append(front);
    const beam = q('.hx-beam', front), read = q('text', front), metric = q('#mainmetric');
    const seen = watch(stage);
    let clock = 0;
    jobs.push({
      live: () => seen.on && !stage.classList.contains('paused'),
      run(dt) {
        clock += dt / 1000;
        const p = (1 - Math.cos(clock * 2 * Math.PI / 5.2)) / 2; // 0 at the top, 1 at the bed
        beam.setAttribute('transform', 'translate(0 ' + (44 + p * 312).toFixed(1) + ')');
        const nums = metric ? metric.textContent.match(/\d+/g) : null;
        const zmax = nums ? Number(nums[nums.length - 1]) : 0;
        read.textContent = zmax ? 'Z ' + String(Math.round((1 - p) * zmax)).padStart(3, '0') + ' mm' : '';
      }
    });
    // re-scan burst whenever another model is picked
    document.querySelectorAll('[data-showcase]').forEach(b => b.addEventListener('click', () => {
      frame.classList.remove('hx-flash'); void frame.offsetWidth; frame.classList.add('hx-flash'); clock = 0;
    }));
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      stage.style.setProperty('--px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      stage.style.setProperty('--py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
    });
    stage.addEventListener('pointerleave', () => { stage.style.setProperty('--px', 0); stage.style.setProperty('--py', 0); });
  }

  /* ---- product cards: staggered rise + border trace ---- */
  const grid = q('#productgrid');
  if (grid) {
    const enter = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('hx-in'); enter.unobserve(e.target); }
    }), { rootMargin: '0px 0px -40px 0px' });
    const dress = () => grid.querySelectorAll('.card:not(.hx-c)').forEach((card, i) => {
      card.classList.add('hx-c');
      card.style.setProperty('--i', i % 4);
      card.insertAdjacentHTML('beforeend', '<svg class="hx-trace" aria-hidden="true"><rect width="100%" height="100%" rx="14" pathLength="100"/></svg>');
      enter.observe(card);
    });
    new MutationObserver(dress).observe(grid, { childList: true });
    dress();
  }

  /* ---- scroll extruder ---- */
  {
    let d = 'M10 0';
    for (let y = 6, k = 0; y <= 1000; y += 6, k++) d += 'L' + (k % 2 ? 6.5 : 13.5) + ' ' + y;
    const rail = svgEl(`<div class="hx-rail" aria-hidden="true">
      <svg class="track" viewBox="0 0 20 1000" preserveAspectRatio="none"><path class="ghost" d="M10 0V1000"/><path class="fil" d="${d}"/></svg>
      <svg class="head" viewBox="0 0 20 26"><path d="M3 0h14v10H3z" fill="#2c4030"/><path d="M4 3h12M4 6h12" stroke="#7d927c" stroke-width="1"/><path d="M5 10h10l-2.5 8h-5z" fill="#4e5c4e"/><path d="M7.5 18h5L10.6 24h-1.2z" fill="#b99b54"/><circle class="tip" cx="10" cy="25" r="1.6" fill="#c3f150"/></svg></div>`);
    document.body.append(rail);
    const set = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      rail.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    };
    addEventListener('scroll', set, { passive: true });
    addEventListener('resize', set);
    set();
  }

  /* ---- voxel field ---- */
  const main = q('main');
  if (main) {
    const W = 720, H = 220, HW = 30, HH = 15, AMP = 17;
    const band = svgEl('<div class="hx-voxel" aria-hidden="true"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice"></svg></div>');
    const svg = band.firstChild, cubes = [];
    let html = '';
    for (let r = 0; r * HH <= H + 20; r++) {
      for (let c = 0; c * HW * 2 <= W + HW * 2; c++) {
        const x = c * HW * 2 + (r % 2) * HW, y = 46 + r * HH;
        cubes.push({ x, y, u: x / HW / 2, v: y / HH / 2 });
        html += `<g><path d="M-${HW} 0 0 ${HH} 0 ${HH + 70} -${HW} 70Z" fill="#1c2e20"/><path d="M${HW} 0 0 ${HH} 0 ${HH + 70} ${HW} 70Z" fill="#132017"/><path d="M0 -${HH} ${HW} 0 0 ${HH} -${HW} 0Z" stroke="#0f1b13" stroke-width=".6"/></g>`;
      }
    }
    svg.innerHTML = html;
    [...svg.children].forEach((g, i) => { cubes[i].g = g; cubes[i].top = g.lastChild; });
    main.append(band);
    const seen = watch(band);
    let t = 0, acc = 0, focus = null;
    band.addEventListener('pointermove', e => {
      const m = svg.getScreenCTM(); if (!m) return;
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      focus = { u: pt.x / HW / 2, v: pt.y / HH / 2 };
    });
    band.addEventListener('pointerleave', () => { focus = null; });
    jobs.push({
      live: () => seen.on,
      run(dt) {
        t += dt / 1000; acc += dt;
        if (acc < 30) return; acc = 0;
        const fu = focus ? focus.u : 6 + Math.sin(t * .5) * 4.5, fv = focus ? focus.v : 5 + Math.cos(t * .37) * 2.5;
        for (const k of cubes) {
          const dist = Math.hypot(k.u - fu, k.v - fv);
          const h = Math.sin(dist * 1.15 - t * 3) * AMP * Math.max(.18, 1 - dist / 9) + Math.sin(k.u * .9 + t) * 3;
          const n = Math.min(1, Math.max(0, (h / AMP + 1) / 2));
          k.g.setAttribute('transform', 'translate(' + k.x + ' ' + (k.y - h).toFixed(1) + ')');
          k.top.setAttribute('fill', 'rgb(' + Math.round(38 + n * 157) + ',' + Math.round(62 + n * 179) + ',' + Math.round(44 + n * 36) + ')');
        }
      }
    });
  }
})();
