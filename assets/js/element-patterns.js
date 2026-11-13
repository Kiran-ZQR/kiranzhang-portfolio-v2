/* Supplied artwork unchanged; SVG viewports isolate its five element panels. */
window.ElementPatternImages=[[69,319,179,224],[284,320,176,222],[497,319,179,224],[283,65,179,224],[497,65,179,224]].map(([x,y,w,h])=>{
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><image width="735" height="589" href="${window.ElementReferenceSource}"/></svg>`;
 const image=new Image();image.onload=()=>window.dispatchEvent(new Event('element-pattern-ready'));
 image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);return image;
});
