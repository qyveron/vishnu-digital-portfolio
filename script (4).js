(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Mobile menu
  const burger = $('.burger'), menu = $('#menu');
  const setMenu = o => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  // Nav state + active link
  const nav = $('.nav');
  const links = $$('nav a[href^="#"]', menu);
  addEventListener('scroll', () => nav.classList.toggle('stuck', scrollY > 30), { passive: true });
  const secs = $$('main section[id]');
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' }).observe && secs.forEach(s => new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + s.id));
  }), { rootMargin: '-45% 0px -50% 0px' }).observe(s));

  // Scroll reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

  if (!reduce && fine) {
    // Hero 3D: mouse-responsive tilt (rAF-throttled)
    const stage = $('[data-tilt]'), hero = $('.hero');
    let tx = 0, ty = 0, raf = 0;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      ty = ((e.clientX - r.left) / r.width - .5) * 22;
      tx = -((e.clientY - r.top) / r.height - .5) * 16;
      if (!raf) raf = requestAnimationFrame(() => { stage.style.setProperty('--ry', ty + 'deg'); stage.style.setProperty('--rx', tx + 'deg'); raf = 0; });
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg'); });

    // Project device tilt + glare
    $$('[data-tilt-card]').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ty', (x - .5) * 14 + 'deg'); c.style.setProperty('--tx', -(y - .5) * 10 + 'deg');
        c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--ty', '0deg'); c.style.setProperty('--tx', '0deg'); });
    });

    // Subtle parallax on scroll
    const par = $('.scene');
    let tick = false;
    addEventListener('scroll', () => {
      if (tick || scrollY > innerHeight * 1.2) return; tick = true;
      requestAnimationFrame(() => { par.style.transform = `translateY(${scrollY * .08}px)`; tick = false; });
    }, { passive: true });
  }

  // Pause heavy 3D animation when hero is off-screen
  new IntersectionObserver(([e]) => document.body.classList.toggle('hero-off', !e.isIntersecting)).observe($('.hero'));

  // Copy email
  const copy = $('#copy');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('vis830066@gmail.com'); copy.textContent = 'Copied ✓'; }
    catch { copy.textContent = 'vis830066@gmail.com'; }
    setTimeout(() => copy.textContent = 'Copy email', 2000);
  });
  $('#yr').textContent = new Date().getFullYear();
})();
