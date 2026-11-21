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
  const groupName=isTencent&&item?(exploratory?'Explore Requirements':'Business Requirements'):category?.name;
  const labels={'about.html':'About','resume.html':'Resume','review.html':'素材库','model-credits.html':'3D credits'};
  const makeLink=(name,href,current=false)=>{const a=document.createElement('a');a.href=href;a.textContent=name;if(current)a.setAttribute('aria-current','page');return a};
  let global=document.querySelector('.v2-global');
  if(!global){global=document.createElement('nav');global.className='v2-global';document.body.prepend(global)}
  global.setAttribute('role','navigation');global.setAttribute('aria-label','网站主导航');global.replaceChildren();
  const brand=makeLink('KiranZhang','index.html#home');brand.className='v2-brand';global.append(brand);
  for(const [name,href]of [['Home','index.html#home'],['Projects','index.html#projects'],['About','about.html'],['Resume','resume.html'],['Contact','index.html#contact']])global.append(makeLink(name,href,name==='Projects'?!!category:href===file));
  // Move live tab buttons so existing tab state and keyboard handlers survive.
  const tabs=isIndex?[...document.querySelectorAll('[data-grid-tab]')]:[];
  const context=document.createElement('div');context.className='inner-context';
  const row=document.createElement('div');row.className='inner-context-row';
  const crumbs=document.createElement('nav');crumbs.className='inner-breadcrumb';crumbs.setAttribute('aria-label','当前位置');
  const addCrumb=(name,href)=>{if(crumbs.children.length){const separator=document.createElement('span');separator.className='inner-crumb-separator';separator.textContent='/';separator.setAttribute('aria-hidden','true');crumbs.append(separator)}if(href)crumbs.append(makeLink(name,href));else{const current=document.createElement('span');current.className='inner-current';current.setAttribute('aria-current','page');current.textContent=name;crumbs.append(current)}};
  const categoryListHref=category?.href+(item&&category.href==='tencent-news.html'?(category.items.indexOf(item)>7?'#explore':'#business'):'');
  if(category){addCrumb('Projects','index.html#projects');addCrumb(category.name,item?category.href:undefined);if(item){if(isTencent)addCrumb(groupName,categoryListHref);addCrumb(item[0])}}
  else{addCrumb('Home','index.html#home');addCrumb(labels[file]||document.title.split('—')[0].trim())}
  row.append(crumbs);
  if(category){
    const picker=document.createElement('details');picker.className='inner-picker';
    const summary=document.createElement('summary');summary.textContent=isIndex?'切换分类':'切换同组项目';
    const indicator=document.createElement('span');indicator.className='inner-picker-symbol';indicator.setAttribute('aria-hidden','true');summary.append(indicator);picker.append(summary);
    const menu=document.createElement('nav');menu.className='inner-picker-menu';menu.setAttribute('aria-label',isIndex?'作品分类':groupName+' 项目');
    const items=isIndex?categories.map(c=>[c.name,c.href]):siblings;
    items.forEach(([name,href])=>menu.append(makeLink(name,href,href===file)));
    picker.append(menu);row.append(picker);
    picker.addEventListener('keydown',event=>{if(event.key==='Escape'){picker.open=false;summary.focus()}});
    document.addEventListener('pointerdown',event=>{if(!picker.contains(event.target))picker.open=false});
    picker.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!picker.contains(document.activeElement))picker.open=false}));
  }
  context.append(row);
  if(tabs.length){const tabbar=document.createElement('nav');tabbar.className='inner-tabs';tabbar.setAttribute('role','tablist');tabbar.setAttribute('aria-label','腾讯实习内容分组');tabs.forEach(tab=>{tab.className='inner-tab'+(tab.getAttribute('aria-selected')==='true'?' is-active':'');tab.removeAttribute('data-index');tabbar.append(tab)});context.append(tabbar)}
  document.querySelectorAll('.unified-navigation,.case-header,.multimedia-navigation,.case-switcher-wrap,body>.category-nav').forEach(el=>el.remove());
  global.after(context);document.body.classList.add('inner-navigation-ready');
  const measure=()=>{const globalHeight=global.getBoundingClientRect().height;document.documentElement.style.setProperty('--inner-global-height',globalHeight+'px');document.documentElement.style.setProperty('--inner-nav-height',(globalHeight+context.getBoundingClientRect().height)+'px')};
  if('ResizeObserver'in window){const observer=new ResizeObserver(measure);observer.observe(global);observer.observe(context)}measure();
  // Page hierarchy lives in the header; keep artwork endings free of extra navigation.
  document.querySelectorAll('.project-back,.project-sequence,.reading-footer,.project-next,.project-sibling-nav,.academic-footer,.case-footer,.collection-back,.work-two-back').forEach(el=>el.remove());
})();
