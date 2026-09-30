'use strict';
const $=id=>document.getElementById(id),canvas=$('board'),ctx=canvas.getContext('2d');
let board,history,human,level,turn,selected=null,result=null,thinking=false,worker=null,generation=0,highlights=[];
const names={1:'黒',2:'白'},margin=35,step=680/14;
function draw(){
 ctx.clearRect(0,0,750,750);ctx.fillStyle='#dfbb7b';ctx.fillRect(0,0,750,750);ctx.strokeStyle='#83633c';ctx.lineWidth=1;
 for(let i=0;i<15;i++){let t=margin+i*step;ctx.beginPath();ctx.moveTo(margin,t);ctx.lineTo(715,t);ctx.moveTo(t,margin);ctx.lineTo(t,715);ctx.stroke();}
 for(const x of [3,7,11])for(const y of [3,7,11]){ctx.beginPath();ctx.arc(margin+x*step,margin+y*step,4,0,Math.PI*2);ctx.fillStyle='#83633c';ctx.fill();}
 board.forEach((c,p)=>{if(!c)return;const x=margin+(p%15)*step,y=margin+Math.floor(p/15)*step;const grad=ctx.createRadialGradient(x-7,y-9,1,x,y,21);grad.addColorStop(0,c===1?'#59615d':'#fff');grad.addColorStop(1,c===1?'#111915':'#d8ddd7');ctx.beginPath();ctx.arc(x,y,21,0,Math.PI*2);ctx.fillStyle=grad;ctx.shadowColor='#0004';ctx.shadowBlur=4;ctx.shadowOffsetY=2;ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;if(highlights.includes(p)){ctx.strokeStyle=result?.foul?'#c44335':'#499366';ctx.lineWidth=4;ctx.stroke();}});
 const last=history.at(-1);if(last){ctx.fillStyle='#ce7a41';ctx.beginPath();ctx.arc(margin+(last.p%15)*step,margin+Math.floor(last.p/15)*step,4,0,Math.PI*2);ctx.fill();}
 if(selected!==null&&!board[selected]&&!result){const x=margin+(selected%15)*step,y=margin+Math.floor(selected/15)*step;ctx.strokeStyle='#327258';ctx.lineWidth=3;ctx.strokeRect(x-19,y-19,38,38);}
 $('count').textContent=history.length+' 手';$('place').disabled=thinking||!!result||turn!==human||selected===null||!!board[selected];$('undo').disabled=!history.some(m=>m.color===human);
}
function status(){ $('status').textContent=result?(result.winner===0?'引き分けです':result.foul?`黒の禁じ手（${result.foul}）：白の勝ち`:`${names[result.winner]}の五連：${result.winner===human?'あなた':'CPU'}の勝ち`):thinking?'CPUが考えています…':`${names[turn]}・あなたの番です。交点を選んでください。`;draw();}
function move(p){if(board[p]||result)return;board[p]=turn;history.push({p,color:turn});selected=null;result=Gomoku.outcome(board,p);if(result){highlights=result.foul?foulStones(p):result.winner?Gomoku.winningStones(board,p):[];}else turn=3-turn;status();if(!result&&turn!==human)cpu();}
function foulStones(p){const set=new Set([p]);for(const [dx,dy] of Gomoku.DIRS)for(let k=-5;k<=5;k++){const x=p%15+dx*k,y=Math.floor(p/15)+dy*k;if(Gomoku.inside(x,y)&&board[y*15+x]===1)set.add(y*15+x);}return [...set];}
function stop(){generation++;if(worker)worker.terminate();worker=null;thinking=false;}
function cpu(){thinking=true;status();const id=++generation,payload={id,board:board.slice(),color:turn,level};
 function finish(p){if(id!==generation)return;thinking=false;if(worker)worker.terminate();worker=null;move(p);}
 function failed(){if(id!==generation)return;stop();$('status').textContent='CPUの起動に失敗しました。ブラウザを変更するか、再対局してください。';draw();}
 try{
  const source='('+GomokuEngineFactory.toString()+')(self);('+GomokuCPUFactory.toString()+')(self);onmessage=({data})=>{try{postMessage({id:data.id,p:GomokuCPU.choose(data.board,data.color,data.level)});}catch(e){postMessage({id:data.id,error:e.message});}};';
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  worker=new Worker(url);URL.revokeObjectURL(url);
  worker.onmessage=({data})=>{if(data.error)failed();else finish(data.p);};worker.onerror=failed;worker.postMessage(payload);
 }catch(e){failed();}
}
function start(){stop();board=Gomoku.empty();history=[];human=Number($('side').value);level=Number($('level').value);turn=1;selected=null;result=null;highlights=[];$('players').textContent=`あなた：${names[human]} ／ CPU：${names[3-human]}・LV${level}`;status();if(turn!==human)cpu();}
canvas.addEventListener('click',e=>{if(thinking||result||turn!==human)return;const r=canvas.getBoundingClientRect(),x=Math.round(((e.clientX-r.left)*750/r.width-margin)/step),y=Math.round(((e.clientY-r.top)*750/r.height-margin)/step);if(Gomoku.inside(x,y)&&!board[y*15+x]){const p=y*15+x;if(selected===p){move(p);}else{selected=p;draw();}}});
canvas.addEventListener('keydown',e=>{if(thinking||result||turn!==human)return;if(e.key==='Enter'){e.preventDefault();if(selected!==null&&!board[selected])move(selected);return;}const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;e.preventDefault();const p=selected??112;selected=Math.max(0,Math.min(14,p%15+delta[0]))+15*Math.max(0,Math.min(14,Math.floor(p/15)+delta[1]));draw();});
$('place').onclick=()=>{if(!thinking&&!result&&turn===human&&selected!==null&&!board[selected])move(selected);};
$('undo').onclick=()=>{const idx=history.findLastIndex(m=>m.color===human);if(idx<0)return;stop();for(const m of history.splice(idx))board[m.p]=0;turn=human;result=null;selected=null;highlights=[];status();};
$('restart').onclick=start;start();
