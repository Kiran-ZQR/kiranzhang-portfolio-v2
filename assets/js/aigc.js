(() => {
 document.querySelectorAll('.aigc-sequence').forEach(el=>{const captions=window.AIGCCaptions?.[el.dataset.figmaNode];if(!captions)return;const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='prompt';details.className='aigc-notes';details.append(summary);captions.forEach(text=>{const p=document.createElement('p');p.textContent=text;details.append(p)});el.append(details)});
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('entered');observer.unobserve(e.target)}}),{rootMargin:'0px 0px 60px 0px'});
 document.querySelectorAll('.aigc-sequence').forEach(el=>{el.classList.add('motion-ready');observer.observe(el)});
})();
