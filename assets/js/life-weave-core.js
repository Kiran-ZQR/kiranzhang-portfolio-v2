/* Pure B3/S23 simulation. Colours encode the five elements, 0 means empty. */
(function(root){
  function step(cells,w,h){
    const next=new Uint8Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      let n=0;const votes=[0,0,0,0,0,0];
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;
        const xx=x+dx,yy=y+dy;
        if(xx<0||xx>=w||yy<0||yy>=h)continue;
        const v=cells[yy*w+xx];if(v){n++;votes[v]++;}
      }
      const i=y*w+x;
      if(cells[i]&&(n===2||n===3))next[i]=cells[i];
      else if(!cells[i]&&n===3){let best=1;for(let j=2;j<=5;j++)if(votes[j]>votes[best])best=j;next[i]=best;}
    }return next;
  }
  // Five recognisable Life seeds; no random injection during evolution.
  const seeds=[[[0,-1],[1,0],[-1,1],[0,1],[1,1]],[[0,-1],[1,-1],[-1,0],[0,0],[0,1]],[[-1,-1],[0,-1],[-1,0],[0,0],[1,1],[2,1],[1,2],[2,2]],[[-1,0],[0,0],[1,0]],[[0,-1],[1,-1],[2,-1],[-1,0],[0,0],[1,0]]];
  function plant(cells,w,h,x,y,element){for(const [dx,dy] of seeds[element]){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h)cells[yy*w+xx]=element+1;}return cells;}
  root.LifeWeaveCore={step,plant,seeds};
  if(typeof module!=='undefined')module.exports=root.LifeWeaveCore;
})(typeof window!=='undefined'?window:globalThis);
