(() => {
  'use strict';
  const file=location.pathname.split('/').pop()||'index.html';if(file==='index.html')return;
  const categories=[
    {name:'Tencent News Internship',href:'tencent-news.html',items:[['主客态体验','tencent-news-details.html'],['下拉刷新','tencent-news-refresh.html'],['上滑引导','tencent-news-guide.html'],['直播置顶','tencent-news-live.html'],['推广海报','tencent-news-promotion.html'],['日夜间适配','tencent-news-daynight.html'],['评论互动','tencent-news-comments.html'],['AI 定制早报','tencent-news-ai-briefing.html'],['AI 海报裁切','tencent-news-crop.html'],['AI 精品工具','tencent-news-ai-tools.html']]},
    {name:'Academic Projects',href:'academic-projects.html',items:[['SADRA','academic-sadra.html'],['FurSure','academic-fursure.html'],['PROFILED','academic-profiled.html'],['Star Farm','academic-star-farm.html'],['Lead Me','academic-lead-me.html']]},
    {name:'Multimedia Design',href:'multimedia-projects.html',items:[['五元编织','life-weave.html'],['SentAIment','sentaiment.html']]},
    {name:'Other Works',href:'aigc.html',items:[['The Fortress','aigc-fortress.html'],['The Rococo','aigc-rococo.html'],['角色场景','aigc-worlds.html'],['视觉实验','aigc-experiments.html']]}
  ];
  const category=categories.find(c=>c.href===file||c.items.some(i=>i[1]===file)),item=category?.items.find(i=>i[1]===file),isIndex=category?.href===file;
  const isTencent=category?.href==='tencent-news.html',exploratory=isTencent&&item&&category.items.indexOf(item)>7;
  const siblings=category?(isTencent&&item?category.items.slice(exploratory?8:0,exploratory?10:8):category.items):[];
  const makeLink=(name,href,current=false)=>{const a=document.createElement('a');a.href=href;a.textContent=name;if(current)a.setAttribute('aria-current','page');return a};
  let global=document.querySelector('.v2-global');
  if(!global){global=document.createElement('nav');global.className='v2-global';document.body.prepend(global)}
  global.setAttribute('role','navigation');global.setAttribute('aria-label','网站主导航');global.replaceChildren();
  const brand=makeLink('KiranZhang','index.html#home');brand.className='v2-brand';global.append(brand);
  if(!category)for(const [name,href]of [['Home','index.html#home'],['Projects','index.html#projects'],['About','about.html'],['Resume','resume.html'],['Contact','index.html#contact']])global.append(makeLink(name,href,href===file));
  // Move live tab buttons so existing tab state and keyboard handlers survive.
  const tabs=isIndex?[...document.querySelectorAll('[data-grid-tab]')]:[];
  if(category){
    global.classList.add('project-nav');
    const group=makeLink(category.name,category.href,isIndex);group.className='inner-group-home';global.append(group);
    const local=document.createElement('nav');local.className='inner-local';local.setAttribute('aria-label',isTencent?'腾讯实习需求分组':'当前分类项目');
    if(isTencent){
      if(tabs.length){local.setAttribute('role','tablist');tabs.forEach(tab=>{tab.className='inner-tab';tab.textContent=tab.dataset.gridTab==='business'?'迭代需求':'探索需求';tab.removeAttribute('data-index');local.append(tab)})}
      else for(const [name,hash] of [['迭代需求','business'],['探索需求','explore']])local.append(makeLink(name,category.href+'#'+hash,(hash==='explore')===!!exploratory));
    }else category.items.forEach(([name,href])=>local.append(makeLink(name,href,href===file)));
    global.append(local);
  }
  document.querySelectorAll('.unified-navigation,.case-header,.multimedia-navigation,.case-switcher-wrap,body>.category-nav,.inner-context,.ec-toc').forEach(el=>el.remove());
  document.body.classList.add('inner-navigation-ready');
  const measure=()=>{const height=global.getBoundingClientRect().height;document.documentElement.style.setProperty('--inner-global-height',height+'px');document.documentElement.style.setProperty('--inner-nav-height',height+'px')};
  if('ResizeObserver'in window)new ResizeObserver(measure).observe(global);measure();
  // One local header and one forward route at the end of each case.
  document.querySelectorAll('.project-back,.project-sequence,.reading-footer,.project-next,.project-sibling-nav,.academic-footer,.case-footer,.collection-back,.work-two-back').forEach(el=>el.remove());
  const categoryListHref=category?.href+(isTencent?(exploratory?"#explore":"#business"):"");
  if(item){
    const next=siblings[siblings.findIndex(entry=>entry[1]===file)+1];
    const footer=document.createElement('footer');footer.className='case-forward';
    const list=makeLink('返回 '+category.name,categoryListHref);list.className='case-forward-back';footer.append(list);
    const forward=makeLink('',next?next[1]:categoryListHref);forward.className='case-forward-link';
    const label=document.createElement('span');label.className='case-forward-label';label.textContent=next?'下一个项目':'浏览本类项目';
    const title=document.createElement('span');title.className='case-forward-title';title.textContent=next?next[0]:category.name;
    const arrow=document.createElement('span');arrow.className='case-forward-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');forward.append(label,title,arrow);footer.append(forward);
    const main=document.querySelector('main');if(main)main.after(footer);else document.body.append(footer);
  }
})();
