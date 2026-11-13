/* Render the original PDF directly, including on browsers without a built-in PDF viewer. */
(async()=>{
 const status=document.querySelector('#cv-status'),viewer=document.querySelector('#cv-viewer');
 const open=document.querySelector('#cv-open');open.hidden=false;
 try{
  const pdfjs=await import('../vendor/pdfjs/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='assets/vendor/pdfjs/pdf.worker.mjs';
  const assetURL=relative=>new URL(relative,document.baseURI).href;
  const documentPDF=await pdfjs.getDocument({url:assetURL('assets/cv.pdf?v=20261028-1'),cMapUrl:assetURL('assets/vendor/pdfjs/cmaps/'),cMapPacked:true,standardFontDataUrl:assetURL('assets/vendor/pdfjs/standard_fonts/'),wasmUrl:assetURL('assets/vendor/pdfjs/wasm/')}).promise;
  for(let number=1;number<=documentPDF.numPages;number++){
   const page=await documentPDF.getPage(number),natural=page.getViewport({scale:1});
   const width=Math.min(1100,viewer.clientWidth-2),ratio=Math.min(devicePixelRatio||1,2);
   const viewport=page.getViewport({scale:width/natural.width*ratio});
   const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`CV 第 ${number} 页，共 ${documentPDF.numPages} 页；原始 PDF 可由上方链接打开`);
   await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
   viewer.append(canvas);
  }
  status.remove();viewer.dataset.loaded='true';
 }catch(error){status.textContent='内嵌 PDF 未能加载，请点击上方“打开 PDF”查看原文件。';console.error('CV rendering failed',error);}
})();
