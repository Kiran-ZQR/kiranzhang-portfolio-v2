/* Continuous irregular color fields; the overlay is the actual B3/S23 simulation. */
(()=>{
 const palettes=[['#4d7075','#fff252','#eee9d5'],['#c9302b','#440d09','#fff252'],['#ac8b40','#fff252','#440d09'],['#c83c9d','#eee9d5','#440d09'],['#91d6df','#440d09','#eee9d5']];
 let cachedKey='',base,owners,baseColors;
 window.drawLifeTextile=(ctx,w,h,grid,options={})=>{
  ctx.fillStyle='#eee9d5';ctx.fillRect(0,0,w,h);
  const parts=(options.segments||[]).slice(-5);if(!grid||!parts.length)return;
  const key=w+':'+h+':'+parts.map(p=>p.element).join(',');
  if(key!==cachedKey){
   cachedKey=key;base=document.createElement('canvas');base.width=w;base.height=h;owners=new Uint8Array(6000);baseColors=[];
   const p=base.getContext('2d'),cw=w/60,ch=h/100;
   // Unequal, interlocking domains share one coordinate field, never horizontal strips.
   // Element positions are anchored to a shared two-dimensional field, never turn order.
   // Adding a thread introduces islands across the cloth instead of another horizontal band.
   const elements=[...new Set(parts.map(part=>part.element))];
   const seeds=elements.flatMap(element=>[0,1,2].map(j=>{const a=element*2.399963+j*2.094;return {x:.5+.43*Math.cos(a),y:.5+.46*Math.sin(a+element*.31),element};}));
   for(let y=0;y<100;y++)for(let x=0;x<60;x++){
    const u=x/60,v=y/100,wx=u+.17*Math.sin(v*8+u*3)+.07*Math.cos(v*19-u*7),wy=v+.16*Math.sin(u*9-v*3)+.05*Math.cos(u*17+v*11);
    let best=Infinity,owner=seeds[0].element;
    for(const s of seeds){const d=(wx-s.x)**2*.58+(wy-s.y)**2;if(d<best){best=d;owner=s.element;}}
    owners[y*60+x]=owner;
    const palette=palettes[owner],flow=Math.sin(wx*7-wy*9)+.55*Math.cos(wx*15+wy*6);
    let color=flow>.08?palette[0]:'#eee9d5';
    // Sparse structural grid inside selected curved regions, not scattered decorations.
    if(flow<-.85)color='#440d09';
    if(flow<-.55&&flow>-.95&&((Math.floor(x/3)+Math.floor(y/3))%3===0))color='#fff252';
    baseColors[y*60+x]=color;p.fillStyle=color;p.fillRect(x*cw,y*ch,Math.ceil(cw),Math.ceil(ch));
   }
  }
  ctx.imageSmoothingEnabled=false;ctx.drawImage(base,0,0,w,h);
  const cw=w/60,ch=h/100;
  for(let y=0;y<100;y++)for(let x=0;x<60;x++){
   const value=grid[x*100+y];if(!value)continue;
   const palette=palettes[owners[y*60+x]];
   ctx.fillStyle=baseColors[y*60+x]===palette[2]?palette[1]:palette[2];
   ctx.fillRect(x*cw,y*ch,Math.ceil(cw),Math.ceil(ch));
  }
 };
})();
