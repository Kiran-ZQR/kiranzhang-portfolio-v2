(() => {
  'use strict';
  const viewport = document.querySelector('.definition-viewport');
  if (!viewport) return;
  const fit = () => viewport.style.setProperty('--definition-scale', String(viewport.getBoundingClientRect().width / 1440));
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(viewport);
  else addEventListener('resize', fit, {passive:true});
})();

