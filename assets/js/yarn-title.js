/* Editable letter skeletons, not a bitmap: each yarn strand is drawn by arc length. */
(() => {
  const glyphs={
    W:'M8 4 C-5 70 14 171 30 158 C44 145 28 48 46 53 C66 59 59 173 79 164 C100 148 88 37 104 0',
    H:'M10 164 C4 110 6 14 18 2 C38 -8 20 147 14 158 M6 87 C38 70 77 83 91 58 M88 0 C71 48 91 133 80 168',
    E:'M89 8 C58 -9 20 1 16 17 C7 55 21 142 12 158 C34 176 74 156 90 145 M13 87 C99 39 93 105 18 84',
    L:'M20 0 C-9 24 39 132 14 154 C-3 177 73 170 98 150',
    I:'M29 1 C-1 -7 18 108 20 147 C26 191 48 156 29 139 C17 97 40 31 29 1',
    F:'M19 165 C6 119 14 65 10 19 C14 -12 68 16 94 8 M13 89 C45 51 97 65 76 77 C51 90 37 81 13 89'
  };
  const placements=[['W',145,75,1.7,0],['H',338,60,1.6,1],['E',510,80,1.5,0],['E',680,50,1.65,1],['L',855,65,1.6,0],['L',515,375,1.25,2],['I',661,356,1.35,2],['F',751,380,1.2,3],['E',885,362,1.4,2]];
  const palette=['#f25523','#e82078','#149fae','#08707d','#e9bb24'];
  const samples=placements.map(([char,x,y,s,c])=>{const points=[];glyphs[char].split(/(?=M)/).filter(Boolean).forEach(d=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);const len=path.getTotalLength();for(let i=0;i<=Math.ceil(len/1.5);i++){const p=path.getPointAtLength(Math.min(len,i*1.5));points.push({x:p.x,y:p.y,move:i===0});}});return{x,y,s,c,points};});
  function draw(ctx,w,h,progress=1){const scale=Math.min(w/1200,h/660),ox=(w-1200*scale)/2,oy=(h-660*scale)/2;
    ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
    samples.forEach((g,index)=>{const p=Math.max(0,Math.min(1,(progress-index*.043)/.58));if(!p)return;const n=Math.max(2,Math.ceil(g.points.length*p));
      for(let strand=0;strand<5;strand++){ctx.beginPath();ctx.strokeStyle=palette[(strand===4?4:g.c)];ctx.lineWidth=strand===4?.7:1.5;
        for(let i=0;i<n;i++){const q=g.points[i],x=g.x+q.x*g.s+(strand-2)*1.6+Math.sin(i*.13+strand)*1.1,y=g.y+q.y*g.s+Math.cos(i*.16+strand)*1.3;if(q.move)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
      }
      const tip=g.points[n-1];if(p<1){ctx.fillStyle=palette[g.c];ctx.beginPath();ctx.arc(g.x+tip.x*g.s,g.y+tip.y*g.s,2.2,0,Math.PI*2);ctx.fill();}
    });
    ctx.fillStyle='#145b60';ctx.font='italic 37px Georgia';ctx.globalAlpha=Math.min(1,progress*3);ctx.fillText('the',95,72);ctx.fillText('of',404,452);
    ctx.restore();
  }
  window.YarnTitle={draw};
})();
