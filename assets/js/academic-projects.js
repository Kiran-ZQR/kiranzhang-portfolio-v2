const cards=[...document.querySelectorAll('.work-card')];
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  }),{threshold:0,rootMargin:'0px 0px -8%'});
  cards.forEach(card=>observer.observe(card));
}else cards.forEach(card=>card.classList.add('is-visible'));

const title=document.querySelector('.track-title');
if(title){
  const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);
  const textNodes=[];
  while(walker.nextNode()) textNodes.push(walker.currentNode);
  let letterIndex=0;
  textNodes.forEach(node=>{
    const fragment=document.createDocumentFragment();
    [...node.nodeValue].forEach(character=>{
      if(/\s/.test(character)){fragment.append(character);return}
      const letter=document.createElement('span');
      letter.className='track-letter';
      letter.dataset.code=String(letterIndex+1).padStart(2,'0');
      letter.textContent=character;
      fragment.append(letter);
      letterIndex+=1;
    });
    node.replaceWith(fragment);
  });
}

const dialog=document.querySelector('.board-dialog');
const dialogImage=dialog?.querySelector('.dialog-stage img');
const dialogTitle=dialog?.querySelector('.dialog-title');
const zoomValue=dialog?.querySelector('.zoom-value');
let zoom=1;

function setZoom(nextZoom){
  zoom=Math.min(2.5,Math.max(.65,nextZoom));
  dialog.style.setProperty('--dialog-zoom',zoom);
  zoomValue.textContent=`${Math.round(zoom*100)}%`;
}

document.querySelectorAll('[data-full]').forEach(trigger=>trigger.addEventListener('click',()=>{
  if(!dialog||!dialogImage)return;
  dialogImage.src=trigger.dataset.full;
  dialogImage.alt=trigger.querySelector('img')?.alt||'';
  dialogTitle.textContent=trigger.dataset.title||'';
  setZoom(1);
  dialog.showModal();
  dialog.querySelector('.dialog-stage').scrollTo(0,0);
}));

dialog?.querySelector('.dialog-close')?.addEventListener('click',()=>dialog.close());
dialog?.querySelector('.zoom-in')?.addEventListener('click',()=>setZoom(zoom+.25));
dialog?.querySelector('.zoom-out')?.addEventListener('click',()=>setZoom(zoom-.25));
dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
dialog?.addEventListener('wheel',event=>{
  if(!event.ctrlKey)return;
  event.preventDefault();
  setZoom(zoom+(event.deltaY<0?.15:-.15));
},{passive:false});
