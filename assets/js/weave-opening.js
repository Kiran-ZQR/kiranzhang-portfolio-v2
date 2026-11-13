/* User-supplied artwork, displayed at its original aspect ratio without recoloring. */
(() => {
 const overlay=document.createElement('div');overlay.className='thread-opening';
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','五行编织 — 进入');
 overlay.innerHTML=`<div class="opening-poster"><img class="opening-artwork" src="assets/life-weave/five-elements-opening-v2.webp" width="1926" height="817" fetchpriority="high" alt="Five elements. One living weave. Made by you. 彩色像素编织绳结海报"><button class="poster-enter" type="button" aria-label="进入五行编织"><span>进入编织 ↗</span></button></div><button class="poster-mobile-enter" type="button">进入编织 ↗</button>`;
 document.body.append(overlay);
 const content=[...document.body.children].filter(el=>el!==overlay&&el.tagName!=='SCRIPT');content.forEach(el=>el.inert=true);
 function close(){overlay.remove();content.forEach(el=>el.inert=false);document.body.classList.remove('intro-pending');document.body.classList.add('skip-intro');document.querySelector('#handle-zone')?.focus({preventScroll:true});}
 overlay.querySelectorAll('button').forEach(button=>button.onclick=close);
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 overlay.querySelector(matchMedia('(max-width:600px) and (min-height:501px)').matches?'.poster-mobile-enter':'.poster-enter').focus({preventScroll:true});
})();
