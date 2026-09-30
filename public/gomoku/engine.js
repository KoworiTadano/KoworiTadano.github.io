(function engineFactory(root) {
  'use strict';
  const SIZE = 15, DIRS = [[1,0],[0,1],[1,1],[1,-1]];
  const inside = (x,y) => x>=0 && y>=0 && x<SIZE && y<SIZE;
  const empty = () => Array(SIZE*SIZE).fill(0);
  function line(b,p,d) {
    const x=p%SIZE,y=Math.floor(p/SIZE); let n=1;
    for(const sign of [-1,1]) for(let k=1;k<SIZE;k++) {
      const xx=x+d[0]*k*sign, yy=y+d[1]*k*sign;
      if(!inside(xx,yy)||b[yy*SIZE+xx]!==b[p]) break; n++;
    }
    return n;
  }
  // Each distinct set of four stones counts once, even with two winning ends.
  function fours(b,p,d) {
    const x=p%SIZE,y=Math.floor(p/SIZE), found=new Map();
    for(let start=-4;start<=0;start++) {
      const cells=[];
      for(let k=start;k<start+5;k++) {const xx=x+k*d[0],yy=y+k*d[1]; if(!inside(xx,yy)) break; cells.push(yy*SIZE+xx);}
      if(cells.length!==5) continue;
      const stones=cells.filter(q=>b[q]===1), gaps=cells.filter(q=>b[q]===0);
      if(stones.length!==4||gaps.length!==1||!stones.includes(p)) continue;
      const q=gaps[0]; b[q]=1;
      const valid=line(b,q,d)===5 && !DIRS.some(dir=>line(b,q,dir)>5);
      b[q]=0;
      if(valid) {const key=stones.slice().sort((a,c)=>a-c).join(','); if(!found.has(key)) found.set(key,{stones,ends:[]}); found.get(key).ends.push(q);}
    }
    return [...found.values()];
  }
  function forbidden(b,p,memo=new Map()) {
    const key=b.join('')+':'+p;
    if(memo.has(key)) return memo.get(key);
    const lengths=DIRS.map(d=>line(b,p,d));
    if(lengths.some(n=>n>5)) return '長連';
    if(lengths.includes(5)) return null;
    if(DIRS.reduce((n,d)=>n+fours(b,p,d).length,0)>=2) return '四四';
    let threes=0;
    for(const d of DIRS) {
      const groups=new Set(),x=p%SIZE,y=Math.floor(p/SIZE);
      for(let k=-4;k<=4;k++) {
        const xx=x+k*d[0],yy=y+k*d[1]; if(!inside(xx,yy)) continue;
        const q=yy*SIZE+xx; if(b[q]) continue;
        b[q]=1;
        const open=fours(b,p,d).filter(f=>f.ends.length===2 && f.stones.includes(q));
        if(open.length && !forbidden(b,q,memo)) for(const f of open) groups.add(f.stones.filter(s=>s!==q).sort((a,c)=>a-c).join(','));
        b[q]=0;
      }
      threes+=groups.size;
    }
    const result=threes>=2?'三三':null; memo.set(key,result); return result;
  }
  function outcome(b,p) {
    const color=b[p];
    if(color===1) {const foul=forbidden(b,p); if(foul) return {winner:2,foul};}
    if(DIRS.some(d=>line(b,p,d)>=5)) return {winner:color,foul:null};
    if(b.every(Boolean)) return {winner:0,foul:null};
    return null;
  }
  function winningStones(b,p) {
    const result=new Set([p]),x=p%SIZE,y=Math.floor(p/SIZE);
    for(const d of DIRS) if(line(b,p,d)>=5) for(const sign of [-1,1]) for(let k=1;k<SIZE;k++) {
      const xx=x+k*d[0]*sign,yy=y+k*d[1]*sign; if(!inside(xx,yy)||b[yy*SIZE+xx]!==b[p]) break; result.add(yy*SIZE+xx);
    }
    return [...result];
  }
  const api={SIZE,DIRS,inside,empty,line,fours,forbidden,outcome,winningStones};
  root.GomokuEngineFactory=engineFactory; root.Gomoku=api; if(typeof module!=='undefined') module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
