'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const G=require('./engine.js'),CPU=require('./cpu.js');
const pos=(x,y)=>y*15+x;
function board(coords,color=1){const b=G.empty();for(const [x,y] of coords)b[pos(x,y)]=color;return b;}
const cases=[
 ['五連',[[5,7],[6,7],[7,7],[8,7],[9,7]],null],
 ['長連',[[4,7],[5,7],[6,7],[7,7],[8,7],[9,7]],'長連'],
 ['三三',[[6,7],[7,7],[8,7],[7,6],[7,8]],'三三'],
 ['四四',[[5,7],[6,7],[7,7],[8,7],[7,5],[7,6],[7,8]],'四四'],
 ['両端のある四は一つ',[[5,7],[6,7],[7,7],[8,7]],null],
 ['飛び三',[[6,7],[7,7],[9,7],[7,6],[7,8]],'三三'],
 ['五連は三三より優先',[[5,7],[6,7],[7,7],[8,7],[9,7],[7,6],[7,8]],null],
 ['長連は五連より優先',[[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[7,5],[7,6],[7,8],[7,9]],'長連']
];
for(const [name,coords,foul]of cases){const b=board(coords),copy=b.slice();assert.equal(G.forbidden(b,112),foul,name);assert.deepEqual(b,copy,name+' board unchanged');}
let b=board([[6,7],[7,7],[8,7],[7,6],[7,8]]);b[pos(5,7)]=2;b[pos(9,7)]=2;assert.equal(G.forbidden(b,112),null,'blocked three');
b=board([[4,7],[5,7],[6,7],[7,7],[8,7],[9,7]],2);assert.equal(G.outcome(b,112).winner,2,'white overline');
assert.equal(G.outcome(board([[6,7],[7,7],[8,7],[7,6],[7,8]]),112).winner,2,'black foul loses');
for(let level=1;level<=5;level++){b=G.empty();b[112]=1;const copy=b.slice(),p=CPU.choose(b,2,level);assert.equal(b[p],0);assert.deepEqual(b,copy);}
for(const level of [4,5]){b=board([[5,7],[6,7],[7,7],[8,7]]);const p=CPU.choose(b,1,level);b[p]=1;assert.equal(G.outcome(b,p)?.winner,1,'CPU takes immediate win');assert.equal(G.forbidden(b,p),null);}
// Force the random branch: urgent moves must still take precedence at LV2/3.
const originalRandom=Math.random;
try{
  Math.random=()=>0;
  for(const level of [2,3])for(const color of [1,2]){
    b=board([[5,7],[6,7],[7,7],[8,7]],color);
    // Both sides threaten a win; take our win rather than defend.
    for(const x of [5,6,7,8])b[pos(x,10)]=3-color;
    let copy=b.slice(),p=CPU.choose(b,color,level);
    assert.deepEqual(b,copy);b[p]=color;
    assert.equal(G.outcome(b,p)?.winner,color,`LV${level} takes its win first`);
    // One winning end is blocked, so there is exactly one saving move.
    b=board([[5,7],[6,7],[7,7],[8,7]],3-color);b[pos(4,7)]=color;
    copy=b.slice();p=CPU.choose(b,color,level);
    assert.equal(p,pos(9,7),`LV${level} prevents opponent's five`);
    assert.deepEqual(b,copy);
    // Also defend against a four with a gap.
    b=board([[5,7],[6,7],[8,7],[9,7]],3-color);
    assert.equal(CPU.choose(b,color,level),pos(7,7),`LV${level} blocks broken four`);
  }
}finally{Math.random=originalRandom;}
// Exercise UI state without a browser: selection, undo during CPU thinking,
// stale worker responses, settings, and a foul ending the game.
const elements={};const context=new Proxy({}, {get:(target,key)=>target[key]||(()=>{})});
for(const id of ['board','status','count','place','undo','side','level','players','restart'])elements[id]={value:id==='side'?'1':'3',listeners:{},addEventListener(k,f){this.listeners[k]=f;},getContext(){return context;},getBoundingClientRect(){return {left:0,top:0,width:750,height:750};}};
context.createRadialGradient=()=>({addColorStop(){}});
let workers=[];class WorkerMock{constructor(){workers.push(this);}postMessage(p){this.payload=p;}terminate(){this.terminated=true;}}
const sandbox={Gomoku:G,GomokuCPU:CPU,GomokuEngineFactory:global.GomokuEngineFactory,GomokuCPUFactory:global.GomokuCPUFactory,document:{getElementById:id=>elements[id]},Worker:WorkerMock,Blob,URL};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('app.js','utf8'),sandbox);
function evaluate(s){return vm.runInContext(s,sandbox);}
const clickBoard=(x,y)=>elements.board.listeners.click({clientX:35+x*680/14,clientY:35+y*680/14});
clickBoard(7,7);assert.equal(evaluate('selected'),112);assert.equal(evaluate('history.length'),0,'first click only selects');
clickBoard(8,7);assert.equal(evaluate('selected'),113);assert.equal(evaluate('history.length'),0,'different intersection changes selection');
clickBoard(8,7);assert.equal(evaluate('history.length'),1,'second click places stone');assert.equal(evaluate('board[113]'),1);assert.equal(evaluate('thinking'),true);
clickBoard(9,7);clickBoard(9,7);assert.equal(evaluate('history.length'),1,'clicks during CPU thinking are ignored');
const old=workers.at(-1);elements.undo.onclick();assert.equal(evaluate('history.length'),0);old.onmessage({data:{p:111}});assert.equal(evaluate('history.length'),0,'stale response ignored');
clickBoard(7,7);elements.place.onclick();assert.equal(evaluate('history.length'),1,'place button still works');
elements.side.value='2';elements.restart.onclick();assert.equal(evaluate('thinking'),true);workers.at(-1).onmessage({data:{p:112}});assert.equal(evaluate('turn'),2);assert.equal(evaluate('history.length'),1);clickBoard(7,7);clickBoard(7,7);assert.equal(evaluate('history.length'),1,'occupied intersection is ignored');
elements.side.value='1';elements.restart.onclick();sandbox.foulBoard=board([[6,7],[8,7],[7,6],[7,8]]);evaluate('board=foulBoard;move(112)');assert.equal(evaluate('result.foul'),'三三');assert.equal(elements.place.disabled,true);assert.match(elements.status.textContent,/白の勝ち/);clickBoard(9,9);clickBoard(9,9);assert.equal(evaluate('history.length'),1,'clicks after game over are ignored');
console.log('All rule, CPU, and UI state checks passed.');
