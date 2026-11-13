// Event-driven motion: no idle animation loop.
(()=>{
const reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08});
document.querySelectorAll('.editorial-project').forEach(card=>{
observer.observe(card);let raf=0;const visual=card.querySelector('.project-visual');
const reset=()=>{cancelAnimationFrame(raf);card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y')};
visual?.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const r=visual.getBoundingClientRect();card.style.setProperty('--tilt-x',((e.clientX-r.left)/r.width-.5)*5+'deg');card.style.setProperty('--tilt-y',(.5-(e.clientY-r.top)/r.height)*4+'deg')})});
visual?.addEventListener('pointerleave',reset);reduced.addEventListener('change',reset);window.addEventListener('pagehide',reset);
});
document.querySelectorAll('.case-link').forEach(link=>{
const frame=document.createElement('span');frame.className='case-frame';frame.setAttribute('aria-hidden','true');frame.innerHTML='<b></b>'.repeat(8)+'<em>VIEW WORK</em><small></small>';link.append(frame);
const measure=()=>{frame.querySelector('small').textContent=Math.round(link.offsetWidth)+' × '+Math.round(link.offsetHeight)};
new ResizeObserver(measure).observe(link);measure();
link.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches)return;const r=link.getBoundingClientRect();link.style.setProperty('--frame-x',((e.clientX-r.left)/r.width-.5)*6+'px');link.style.setProperty('--frame-y',((e.clientY-r.top)/r.height-.5)*4+'px')});
link.addEventListener('pointerleave',()=>{link.style.removeProperty('--frame-x');link.style.removeProperty('--frame-y')});
});
})();
