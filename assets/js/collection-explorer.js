(() => {
'use strict';
const main=document.querySelector('.project-index');if(!main)return;
const panels=[...main.querySelectorAll('.project-grid')];if(!panels.length)return;
document.body.classList.add('collection-index-page');
const heading=main.querySelector('h1');if(heading){heading.className='collection-title';if(location.pathname.endsWith('aigc.html'))heading.textContent='Other Works';}
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
panels.forEach(panel=>{
 panel.classList.remove('project-grid');panel.classList.add('collection-gallery');
 [...panel.querySelectorAll('.grid-card')].forEach((card,i)=>{
  const link=card.querySelector('a');if(link.getAttribute('href').includes('loom-model')){card.remove();return;}
  card.className='collection-card';
  card.querySelectorAll('.grid-selection,.dn-index-label').forEach(el=>el.remove());
  const cover=card.querySelector('.grid-cover');cover.className='collection-art';
  const images=[...cover.querySelectorAll('img')];
  if(images.length>1)cover.classList.add('collection-art--pair');
  else {const img=images[0],ratio=Number(img?.getAttribute('width'))/Number(img?.getAttribute('height'));card.dataset.format=ratio<1.1?'portrait':'landscape';}
  images.forEach(img=>{img.style.cssText='';img.loading=i<2?'eager':'lazy';img.decoding='async'});
  const caption=card.querySelector('.grid-caption');caption.className='collection-caption';
  const arrow=caption.querySelector('.grid-arrow');if(arrow)arrow.textContent='↗';
  card.classList.add('is-visible');
 });
 // Preserve real tab panels; animate only the newly selected collection as one group.
 new MutationObserver(()=>{if(!panel.hidden&&!reduced.matches)panel.animate([{opacity:.35,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.16,1,.3,1)'})}).observe(panel,{attributes:true,attributeFilter:['hidden']});
});
})();
