(() => {
  'use strict';
  const root = document.documentElement;
  const site = document.getElementById('site');
  const loader = document.getElementById('loader');
  const skip = loader.querySelector('.loader-skip');
  const replay = document.getElementById('replay');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const store = { get(key) { try { return sessionStorage.getItem(key); } catch { return null; } }, set(key, value) { try { sessionStorage.setItem(key, value); } catch {} } };
  const progress = loader.querySelector('.loader-progress');
  let active = false, sequence = 0, timers = [], animations = [], previousFocus, previousOverflow;
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const animate = (el, frames, options) => { const a = el.animate(frames, options); animations.push(a); return a; };
  const setProgress = value => { progress.textContent = `${value}%`; loader.querySelector('.loader-track span').style.width = `${value}%`; };

  function dismiss({ focus = false, reveal = true } = {}) {
    if (!active) return;
    active = false;
    sequence++;
    timers.forEach(clearTimeout); timers = [];
    animations.forEach(a => a.cancel()); animations = [];
    loader.hidden = true;
    loader.classList.remove('is-leaving');
    site.inert = false;
    document.body.style.overflow = previousOverflow;
    store.set('kiran-v2-intro', 'seen');
    if (reveal && !motion.matches) {
      document.querySelectorAll('.glyph').forEach((glyph, i) => {
        glyph.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 850, delay: i * 35, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    }
    if (focus) (previousFocus?.isConnected && previousFocus !== document.body ? previousFocus : document.getElementById('main')).focus({ preventScroll: true });
  }

  async function start({ manual = false } = {}) {
    if (active || motion.matches) return;
    const run = ++sequence;
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    active = true;
    loader.hidden = false;
    loader.classList.remove('is-leaving');
    site.inert = true;
    document.body.style.overflow = 'hidden';
    setProgress(0);
    loader.querySelector('.loader-word').textContent = 'Empathetic.';
    skip.focus({ preventScroll: true });
    if (manual) window.scrollTo({ top: 0, behavior: 'instant' });
    const word = loader.querySelector('.loader-word');
    animate(word, [{ opacity: 0, transform: 'translateY(70%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    ['Inventive.', 'Analytical.'].forEach((text, i) => later(() => {
      word.textContent = text;
      animate(word, [{ opacity: 0, transform: 'translateY(35%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    }, 600 * (i + 1)));
    // The percentage tracks actual critical resources, never an invented download timer.
    const img = document.querySelector('.project-media img');
    const tasks = [document.fonts.ready, img.decode().catch(() => {})];
    let ready = 0;
    const resources = Promise.allSettled(tasks.map(promise => promise.finally(() => {
      if (run === sequence && active) setProgress(Math.round(++ready / tasks.length * 100));
    })));
    later(() => dismiss({ focus: true }), 6000);
    await Promise.all([resources, new Promise(resolve => later(resolve, 1750))]);
    if (!active || run !== sequence) return;
    document.getElementById('loading-status').textContent = '作品集已准备好';
    loader.classList.add('is-leaving');
    later(() => dismiss({ focus: true }), 650);
  }

  skip.addEventListener('click', () => dismiss({ focus: true }));
  replay.addEventListener('click', () => start({ manual: true }));
  loader.addEventListener('keydown', event => {
    if (event.key === 'Escape') dismiss({ focus: true });
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  motion.addEventListener('change', () => {
    replay.hidden = motion.matches;
    if (motion.matches) { dismiss({ focus: true, reveal: false }); document.querySelectorAll('.media-pending').forEach(el => el.classList.remove('media-pending')); }
  });
  replay.hidden = motion.matches;
  if (!store.get('kiran-v2-intro') && !location.hash && !motion.matches) start();

  const toggles = document.querySelectorAll('[data-theme-toggle]');
  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    toggles.forEach(button => button.setAttribute('aria-pressed', String(dark)));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#101010' : '#efefef';
  }
  toggles.forEach(button => button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('kiran-v2-theme', root.dataset.theme); } catch {}
    syncTheme();
  }));
  syncTheme();

  if ('IntersectionObserver' in window && !motion.matches) {
    const mediaObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.querySelector('.project-media').classList.add('media-visible'); mediaObserver.unobserve(entry.target); }
    }), { threshold: 0.05 });
    document.querySelectorAll('.project-media').forEach(el => { el.classList.add('media-pending'); mediaObserver.observe(el.closest('.project')); });
  }
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const y = window.scrollY;
    if (!motion.matches) document.querySelector('.hero-intro').style.setProperty('--diagonal-shift', `${Math.min(y * .1, 80)}px`);
    let section = 'home';
    if (document.getElementById('projects').getBoundingClientRect().top <= 140) section = 'projects';
    if (document.getElementById('contact').getBoundingClientRect().top <= innerHeight * .5) section = 'contact';
    document.querySelectorAll('[data-section]').forEach(a => a.dataset.section === section ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  addEventListener('pageshow', () => { if (!active) { loader.hidden = true; site.inert = false; } updateScroll(); });
  updateScroll();
})();
