(() => {
  'use strict';
  const main=document.querySelector('.project-index');if(!main)return;
  const panels=[...main.querySelectorAll('.project-grid')];if(!panels.length)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const heading=main.querySelector('h1');if(heading){heading.textContent=location.pathname.endsWith('aigc.html')?'Other Works':heading.textContent;heading.className='collection-title';const header=document.createElement('header');header.className='collection-header';heading.replaceWith(header);header.append(heading)}
  document.body.classList.add('collection-index-page');
  const create=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el};
  const arrow=()=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('aria-hidden','true');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 16h22M18 7l9 9-9 9');svg.append(path);return svg};
  panels.forEach((panel,panelIndex)=>{
    const projects=[...panel.querySelectorAll('.grid-card')].map(card=>({href:card.querySelector('a').getAttribute('href'),title:card.querySelector('h2').textContent.trim(),summary:card.querySelector('.grid-caption p')?.textContent.trim()||'',cover:card.querySelector('.grid-cover').cloneNode(true)})).filter(p=>!p.href.includes('loom-model'));
    if(!projects.length)return;
    const layout=create('div','collection-layout'),feature=create('div','collection-feature'),visual=create('a','collection-visual');visual.href=projects[0].href;visual.setAttribute('aria-label','查看 '+projects[0].title);
    const meta=create('div','collection-feature-meta'),position=create('span','collection-position'),total=create('span','collection-total',String(projects.length).padStart(2,'0')+' projects');meta.append(position,total);
    const title=create('h2','collection-feature-title'),summary=create('p','collection-feature-summary'),open=create('a','collection-open','查看项目');open.append(arrow());
    feature.append(visual,meta,title,summary,open);
    const index=create('nav','collection-index');index.setAttribute('aria-label','项目索引');
    const links=projects.map((project,i)=>{
      const link=create('a','collection-index-link');link.href=project.href;
      const number=create('span','collection-index-number',String(i+1).padStart(2,'0')),name=create('span','collection-index-name',project.title);
      const thumb=project.cover.querySelector('img')?.cloneNode(true);if(thumb){thumb.className='collection-thumb';thumb.alt='';thumb.loading='lazy';link.append(thumb)}
      link.append(number,name,arrow());index.append(link);return link;
    });
    let active=-1,revision=0;
    function makeSlide(project){const slide=create('div','collection-slide'),cover=project.cover.cloneNode(true);cover.querySelectorAll('.grid-selection,.dn-index-label').forEach(el=>el.remove());cover.querySelectorAll('img').forEach(img=>{img.loading='eager';img.decoding='async';img.style.cssText=''});slide.append(cover);return slide}
    function show(i,immediate=false){
      if(i===active)return;active=i;const token=++revision,project=projects[i],slide=makeSlide(project);
      // Decode before revealing: quick pointer sweeps cannot flash blank or stale covers.
      const ready=Promise.allSettled([...slide.querySelectorAll('img')].map(img=>img.decode()));
      const commit=()=>{
        if(token!==revision)return;
        links.forEach((link,j)=>{link.dataset.previewActive=String(i===j)});
        position.textContent=String(i+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0');
        title.textContent=project.title;summary.textContent=project.summary;open.href=visual.href=project.href;visual.setAttribute('aria-label','查看 '+project.title);
        const old=[...visual.children];visual.append(slide);
        if(immediate||reduced.matches){old.forEach(el=>el.remove());return}
        const motion=slide.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:750,easing:'cubic-bezier(.16,1,.3,1)'});
        motion.finished.then(()=>old.forEach(el=>el.remove())).catch(()=>{});
        title.animate([{opacity:.4,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:550,easing:'cubic-bezier(.16,1,.3,1)'});
      };
      if(immediate)commit();else ready.then(commit);
    }
    links.forEach((link,i)=>{
      link.addEventListener('pointerenter',event=>{if(fine.matches&&event.pointerType==='mouse')show(i)});
      link.addEventListener('focus',()=>show(i));
      link.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?links.length-1:Math.max(0,Math.min(links.length-1,i+(event.key==='ArrowDown'?1:-1)));links[next].focus()});
    });
    panel.classList.remove('project-grid');panel.classList.add('collection-panel');panel.replaceChildren(layout);layout.append(feature,index);show(0,true);
    const observer=new MutationObserver(()=>{if(!panel.hidden){visual.querySelectorAll('img').forEach(img=>{img.loading='eager'})}});observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
  });
})();
