(() => {
  'use strict';
  const links = [...document.querySelectorAll('[data-ec-toc]')];
  const sections = [...document.querySelectorAll('.ec-chapter')];
  let frame = 0;
  function markChapter() {
    frame = 0;
    let current = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= innerHeight * .4) current = section;
    links.forEach(link => {
      const active = link.hash === '#' + current?.id;
      if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(markChapter);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);markChapter();
  // Keep sibling navigation on the English route, including links made by the shared header.
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    const file = url.pathname.split('/').pop();
    if (url.origin !== location.origin || url.searchParams.get('lang') === 'zh' || /\/en\//.test(url.pathname)) return;
    if (window.PortfolioI18n?.casePages.includes(file)) {
      url.pathname = url.pathname.replace(/[^/]+$/,'en/' + file);
      link.href = url.pathname + url.search + url.hash;
    }
  });
  const dialog = document.querySelector('#ec-dialog');
  const image = dialog.querySelector('img');
  const imageStage = dialog.querySelector('.ec-dialog-image');
  let opener = null, overflow = '';
  document.querySelectorAll('[data-ec-image]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    const caption = button.dataset.ecCaption;
    image.src = button.dataset.ecImage; image.alt = caption;
    const crop = button.querySelector('.ec-crop');
    imageStage.replaceChildren(crop ? crop.cloneNode(true) : image);
    document.querySelector('#ec-dialog-title').textContent = caption;
    overflow = document.body.style.overflow;document.body.style.overflow='hidden';
    dialog.showModal();dialog.querySelector('button').focus();
  }));
  dialog.querySelector('[data-ec-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;opener?.focus({preventScroll:true});imageStage.replaceChildren(image);image.removeAttribute('src');});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  const form = document.querySelector('#ec-fuel');
  if(form){
    const distance=form.elements.distance,volume=form.elements.volume;
    const output=form.querySelector('#ec-output'),status=form.querySelector('[data-fuel-status]'),formula=form.querySelector('[data-fuel-formula]'),basis=form.querySelector('[data-fuel-basis]'),announcement=form.querySelector('[data-fuel-announcement]');
    const fields=[{input:distance,error:form.querySelector('#ec-distance-error'),name:'Distance'},{input:volume,error:form.querySelector('#ec-volume-error'),name:'Fuel consumed'}];
    const pending=()=>{output.value='—';status.textContent='Recalculation needed';formula.textContent='Inputs changed. Calculate again to update the result.';basis.textContent='The previous result no longer applies.';announcement.textContent='';};
    const calculate=event=>{
      event?.preventDefault();let invalid=null;
      fields.forEach(field=>{
        const number=field.input.valueAsNumber;
        const message=!field.input.value&&!field.input.validity.badInput?'Enter '+field.name.toLowerCase()+'.':!Number.isFinite(number)||number<=0?field.name+' must be a valid number greater than 0.':'';
        field.error.textContent=message;
        if(message){field.input.setAttribute('aria-invalid','true');invalid??=field.input;}else field.input.removeAttribute('aria-invalid');
      });
      if(invalid){pending();status.textContent='Check your inputs';announcement.textContent=fields.map(f=>f.error.textContent).filter(Boolean).join(' ');invalid.focus();return;}
      const value=volume.valueAsNumber/distance.valueAsNumber*100;
      if(!Number.isFinite(value)||value<=0){pending();status.textContent='Check your inputs';fields[0].error.textContent='These values cannot be calculated. Check distance and fuel consumed.';distance.setAttribute('aria-invalid','true');distance.focus();return;}
      const result=value.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2});output.value=result;
      status.textContent='Calculated from current inputs';formula.textContent=volume.value+' ÷ '+distance.value+' × 100 = '+result;
      basis.textContent='Based on '+distance.value+' km travelled and '+volume.value+' L consumed';
      announcement.textContent='Estimated consumption: '+result+' litres per 100 km. '+basis.textContent;
    };
    form.addEventListener('submit',calculate);
    fields.forEach(field=>field.input.addEventListener('input',()=>{field.error.textContent='';field.input.removeAttribute('aria-invalid');pending();}));
    form.querySelector('[data-fuel-reset]').addEventListener('click',()=>{distance.value='420';volume.value='31.5';calculate();status.textContent='Example result';});
  }
  const scene = document.querySelector('#ec-scene');
  if(scene){
    const panes=[...document.querySelectorAll('.ec-theme-scroll')];let syncing=false;
    panes.forEach((pane,index)=>pane.addEventListener('scroll',()=>{
      if(syncing)return;syncing=true;
      const other=panes[1-index],max=pane.scrollHeight-pane.clientHeight;
      other.scrollTop=max>0?pane.scrollTop/max*(other.scrollHeight-other.clientHeight):0;
      requestAnimationFrame(()=>{syncing=false;});
    },{passive:true}));
    scene.addEventListener('change',()=>{
      const label=scene.selectedOptions[0].textContent;
      document.querySelectorAll('[data-ec-theme]').forEach(img=>{
        const mode=img.dataset.ecTheme;img.src='assets/daynight/'+scene.value+'-'+mode+'-900.webp';img.alt=label+' in '+mode+' mode';
      });panes.forEach(p=>p.scrollTop=0);
    });
  }
})();

