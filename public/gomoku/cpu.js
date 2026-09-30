(function cpuFactory(root){
  'use strict';
  const G=root.Gomoku;
  function candidates(b){
    const set=new Set(); b.forEach((c,p)=>{if(!c)return;const x=p%15,y=Math.floor(p/15);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(G.inside(x+dx,y+dy)){const q=(y+dy)*15+x+dx;if(!b[q])set.add(q);}}});
    return set.size?[...set]:[112];
  }
  function strength(b,p,c){
    b[p]=c; let score=0;
    for(const [dx,dy] of G.DIRS){
      const x=p%15,y=Math.floor(p/15);let count=1,open=0;
      for(const s of [-1,1])for(let k=1;k<15;k++){const xx=x+dx*k*s,yy=y+dy*k*s;if(!G.inside(xx,yy))break;const v=b[yy*15+xx];if(v!==c){if(!v)open++;break;}count++;}
      score+=count>=5?1000000:([0,2,30,500,15000][count]||0)*(open===2?3:open===1?1:0);
      // Windows also reward broken threes and fours.
      for(let start=-4;start<=0;start++){let own=0,blocked=false;for(let k=start;k<start+5;k++){const xx=x+dx*k,yy=y+dy*k;if(!G.inside(xx,yy)||b[yy*15+xx]===3-c){blocked=true;break;}if(b[yy*15+xx]===c)own++;}if(!blocked)score+=[0,1,12,100,2000,100000][own];}
    }
    b[p]=0;return score;
  }
  function choose(b,color,level){
    const deadline=Date.now()+[0,100,180,500,700,1400][level];
    // A missed check can allow a plausible but illegal move at low levels.
    const checkFoul=Math.random()>[0,.65,.25,.06,0,0][level];
    function ranked(c,limit,strict=true){return candidates(b).map(p=>({p,score:strength(b,p,c)+strength(b,p,3-c)*1.15})).sort((a,z)=>z.score-a.score).filter(({p})=>{if(c!==1||!strict)return true;b[p]=1;const f=G.forbidden(b,p);b[p]=0;return !f;}).slice(0,limit);}
    const moves=ranked(color,level===5?14:10,color!==1||checkFoul);
    if(!moves.length)return candidates(b)[0];
    // Intermediate levels handle urgent tactics before adding variety.
    if(level===2 || level===3){
      function wins(p,c){
        b[p]=c;
        try{return G.outcome(b,p)?.winner===c;}finally{b[p]=0;}
      }
      const win=moves.find(m=>wins(m.p,color));
      if(win)return win.p;
      const block=moves.find(m=>wins(m.p,3-color));
      if(block)return block.p;
    }
    if(level===1 && Math.random()<.65)return moves[Math.floor(Math.random()*moves.length)].p;
    if(level===2 && Math.random()<.08)return moves[Math.floor(Math.random()*Math.min(2,moves.length))].p;
    function search(c,depth,alpha,beta){
      if(Date.now()>deadline)throw new Error('timeout');
      const ms=ranked(c,depth?6:4);if(!ms.length)return 0;
      if(!depth)return (ms[0].score)*(c===color?1:-1);
      let best=c===color?-Infinity:Infinity;
      for(const m of ms){b[m.p]=c;const end=G.outcome(b,m.p);let value;
        try{value=end?(end.winner===0?0:end.winner===color?1e8+depth:-1e8-depth):search(3-c,depth-1,alpha,beta);}finally{b[m.p]=0;}
        if(c===color){best=Math.max(best,value);alpha=Math.max(alpha,best);}else{best=Math.min(best,value);beta=Math.min(beta,best);}if(beta<=alpha)break;
      }return best;
    }
    let best=moves[0].p;
    for(let depth=0;depth<([0,1,1,3,3,4][level]);depth++){
      let next=best,value=-Infinity;
      try{for(const m of moves){if(Date.now()>deadline)throw new Error('timeout');b[m.p]=color;let v;try{let end=G.outcome(b,m.p);if(end?.foul&&!checkFoul)end=null;v=end?(end.winner===color?1e9:end.winner===0?0:-1e9):depth?search(3-color,depth,-Infinity,Infinity):m.score;}finally{b[m.p]=0;}if(v>value){value=v;next=m.p;}}best=next;}catch(e){if(e.message!=='timeout')throw e;break;}
    }
    return best;
  }
  root.GomokuCPUFactory=cpuFactory; root.GomokuCPU={choose};if(typeof module!=='undefined')module.exports=root.GomokuCPU;
})(typeof globalThis!=='undefined'?globalThis:this);
