/* One bounded particle braid, driven by the opening's existing animation loop. */
window.createPixelBlast=function(container){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');container.append(canvas);
 let w=1,h=1,disposed=false;const ripples=[],colors=['#c83c9d','#4d7075','#ac8b40','#91d6df','#440d09'];
 function resize(){w=container.clientWidth;h=container.clientHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0)}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 function click(e){const r=canvas.getBoundingClientRect();ripples.push({x:e.clientX-r.left,y:e.clientY-r.top,time:performance.now()});if(ripples.length>4)ripples.shift()}
 container.addEventListener('pointerdown',click);
 return {render(t){if(disposed)return;ctx.clearRect(0,0,w,h);const unit=Math.min(w,h),now=performance.now();
  for(let strand=0;strand<5;strand++)for(let row=0;row<140;row++){
   const u=row/139,phase=u*Math.PI*2.4+t*.28+strand*1.256;
   const cx=w*(.08+.84*u)+Math.sin(phase)*unit*.11,cy=h*.5+Math.cos(u*6.28+t*.18)*h*.19+Math.cos(phase)*unit*.16;
   for(let col=0;col<13;col++){
    const a=col/13*Math.PI*2+u*5,depth=Math.sin(a),radius=unit*.075;
    let x=cx+Math.cos(a)*radius,y=cy+depth*radius*.75;
    for(const r of ripples){const age=(now-r.time)/1000;if(age>2)continue;const dx=x-r.x,dy=y-r.y,dist=Math.hypot(dx,dy),wave=Math.exp(-Math.pow((dist-age*240)/45,2))*8*(1-age/2);x+=dx/(dist||1)*wave;y+=dy/(dist||1)*wave}
    const size=Math.max(1.8,unit*.0045)*(depth*.2+1);ctx.globalAlpha=.55+.4*(depth+1)/2;ctx.fillStyle=colors[strand];ctx.fillRect(x,y,size,size);
   }
  }ctx.globalAlpha=1;
 },dispose(){disposed=true;observer.disconnect();container.removeEventListener('pointerdown',click);canvas.remove();ripples.length=0}};
};
