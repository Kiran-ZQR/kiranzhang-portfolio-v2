(()=>{
 const groups=[{"list":"tencent-news.html#business","items":[["主客态体验","tencent-news-details.html"],["下拉刷新","tencent-news-refresh.html"],["上滑引导","tencent-news-guide.html"],["直播置顶","tencent-news-live.html"],["推广海报","tencent-news-promotion.html"],["日夜间适配","tencent-news-daynight.html"],["评论互动","tencent-news-comments.html"],["AI 定制早报","tencent-news-ai-briefing.html"]]},{"list":"tencent-news.html#explore","items":[["AI 海报裁切","tencent-news-crop.html"],["AI 精品工具","tencent-news-ai-tools.html"]]},{"list":"academic-projects.html","items":[["SADRA","academic-sadra.html"],["FurSure","academic-fursure.html"],["PROFILED","academic-profiled.html"],["Star Farm","academic-star-farm.html"],["Lead Me","academic-lead-me.html"]]},{"list":"multimedia-projects.html","items":[["五元编织","life-weave.html"],["SentAIment","sentaiment.html"]]},{"list":"aigc.html","items":[["The Fortress","aigc-fortress.html"],["The Rococo","aigc-rococo.html"],["角色场景","aigc-worlds.html"],["视觉实验","aigc-experiments.html"]]}];
 const file=location.pathname.split('/').pop()||'index.html';
 const indexes=['tencent-news.html','academic-projects.html','multimedia-projects.html','aigc.html','resume.html'];
 const header=document.querySelector('.unified-navigation');
 if(indexes.includes(file)){document.body.classList.add('category-index-page');if(file==='tencent-news.html'){document.body.classList.add('category-with-home');}else{header?.querySelector('.primary-island')?.remove();}return;}
 const group=groups.find(g=>g.items.some(x=>x[1]===file));if(!group)return;
 document.body.classList.add('project-detail-page');
 const index=group.items.findIndex(x=>x[1]===file);
 const switcher=header?.querySelector('.case-switcher');
 if(switcher){switcher.removeAttribute('role');switcher.setAttribute('aria-label','同类项目');switcher.replaceChildren();
 group.items.forEach(([name,href],i)=>{const a=document.createElement('a');a.className='case-tab'+(i===index?' is-active':'');a.href=href;a.textContent=name;if(i===index)a.setAttribute('aria-current','page');switcher.append(a)});switcher.style.setProperty('--tab-count',group.items.length);}
 // Long project groups use a disclosure instead of compressing every title into one row.
 if(switcher&&group.items.length>6){
  header.classList.add('has-project-picker');
  const panel=document.createElement('div');panel.className='project-picker-panel';panel.id='project-picker-panel';panel.hidden=true;
  const heading=document.createElement('p');heading.className='project-picker-heading';heading.textContent='腾讯实习 / 商业业务';panel.append(heading);
  const links=document.createElement('nav');links.className='project-picker-links';links.setAttribute('aria-label','腾讯实习商业项目');
  [...switcher.children].forEach((a,i)=>{a.className='project-picker-link';const number=document.createElement('span');number.className='project-picker-number';number.textContent=String(i+1).padStart(2,'0');a.prepend(number);if(i===index){const mark=document.createElement('span');mark.className='project-picker-check';mark.textContent='✓';mark.setAttribute('aria-hidden','true');a.append(mark)}links.append(a)});
  panel.append(links);const all=document.createElement('a');all.className='project-picker-all';all.href=group.list;all.textContent='查看全部商业项目 ↗';panel.append(all);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='project-picker-toggle';toggle.setAttribute('aria-controls',panel.id);toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','切换项目，当前：'+group.items[index][0]);
  const count=document.createElement('span');count.className='project-picker-count';count.textContent=String(index+1).padStart(2,'0')+' / '+String(group.items.length).padStart(2,'0');
  const title=document.createElement('span');title.className='project-picker-current';title.textContent=group.items[index][0];
  const hint=document.createElement('span');hint.className='project-picker-hint';hint.textContent='切换';
  const arrow=document.createElement('span');arrow.className='project-picker-arrow';arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');toggle.append(count,title,hint,arrow);switcher.replaceChildren(toggle);header.append(panel);
  const setOpen=open=>{panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));header.classList.toggle('project-picker-open',open)};
  toggle.addEventListener('click',()=>setOpen(panel.hidden));
  toggle.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);links.querySelector('[aria-current="page"]').focus()}});
  const escape=event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();setOpen(false);toggle.focus()}};
  panel.addEventListener('keydown',escape);toggle.addEventListener('keydown',escape);
  document.addEventListener('pointerdown',event=>{if(!panel.contains(event.target)&&!switcher.contains(event.target))setOpen(false)});
  header.querySelector('.primary-island')?.addEventListener('pointerenter',()=>setOpen(false));
  header.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!panel.contains(document.activeElement)&&!switcher.contains(document.activeElement))setOpen(false)}));
  links.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false)});
 }
 document.querySelectorAll('.project-next,.project-sibling-nav,.academic-footer,.case-footer,.collection-back,.work-two-back').forEach(el=>el.remove());
 const main=document.querySelector('main');const back=document.createElement('a');back.className='project-back sequence-link';back.href=group.list;back.innerHTML='<span class="sequence-label">ALL PROJECTS</span><span>返回项目列表</span><i aria-hidden="true">↗</i>';document.body.append(back);
 // Supplementary boards must precede the final navigation, not sit below it.
 document.querySelectorAll('body>.project-original-boards').forEach(board=>main?.append(board));
 // Keep the current project reachable in the scrollable mobile navigation.
 switcher?.querySelector('[aria-current="page"]')?.scrollIntoView({block:'nearest',inline:'nearest'});
 const previous=group.items[index-1],next=group.items[index+1];const footer=document.createElement('footer');footer.className='project-sequence';
 if(previous){const prev=document.createElement('a');prev.className='sequence-link';prev.href=previous[1];prev.innerHTML='<span class="sequence-label">PREVIOUS PROJECT</span><span>'+previous[0]+'</span><i aria-hidden="true">↖</i>';footer.append(prev);}
 const link=document.createElement('a');link.className='sequence-link';link.href=next?next[1]:group.list;
 link.innerHTML='<span class="sequence-label">'+(next?'NEXT PROJECT':'ALL PROJECTS')+'</span><span>'+(next?next[0]:'返回项目列表')+'</span><i aria-hidden="true">↗</i>';
 footer.append(link);
 if(file==='life-weave.html'){document.querySelector('#completion .result-actions')?.append(footer);back?.classList.add('weave-back');}else{main?.append(footer);}
})();

