(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const mission = document.querySelector('.ab-mission');
  // Keep a single readable heading for assistive technology; animate only its visual copy.
  const text = mission.textContent;
  mission.setAttribute('aria-label', text);
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const words = /[\u4e00-\u9fff]/.test(text) ? Array.from(text) : text.split(/(\s+)/);
  const spans = words.map(word => {
    if (/^\s+$/.test(word)) return document.createTextNode(word);
    const span = document.createElement('span');
    span.className = 'ab-word'; span.textContent = word; return span;
  });
  visual.append(...spans); mission.replaceChildren(visual);
  const letters = spans.filter(node => node.nodeType === 1);
  let scheduled = false;
  const paint = () => {
    scheduled = false;
    const rect = mission.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * .4 - rect.top) / (rect.height + innerHeight * .18)));
    letters.forEach((letter, i) => letter.classList.toggle('is-lit', i / letters.length <= progress));
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', schedule, {passive: true}); addEventListener('resize', schedule);
  const sections = document.querySelectorAll('.ab-reveal');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, {threshold: 0, rootMargin: '0px 0px -40px 0px'});
  sections.forEach(section => observer.observe(section));
  document.documentElement.classList.add('ab-motion');
  paint();
})();

