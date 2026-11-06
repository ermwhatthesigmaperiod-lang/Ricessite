const arcadeGames = [
    ['tetris', 'Block Party', 'Stack clean lines. Keep the board from topping out.', '▦', 'PUZZLE'],
    ['mines', 'Minefield', 'Clear the field. Flag every mine.', '⚑', 'LOGIC'],
    ['2048', '2048', 'Slide tiles, combine numbers, chase the big one.', '2⁴', 'PUZZLE'],
    ['breakout', 'Brick by Brick', 'Keep the ball alive. Clear every row.', '▤', 'ARCADE'],
    ['invaders', 'Last Bell', 'Hold the line against the incoming fleet.', '✦', 'ACTION'],
    ['connect', 'Four in a Row', 'Take on the CPU. Connect four first.', '●', 'VERSUS'],
    ['pong', 'Orbit Pong', 'Read the bounce. Outplay the CPU.', '◒', 'SPORT'],
    ['asteroids', 'After Hours', 'Thread the field. Split rocks. Stay flying.', '✧', 'ARCADE']
];
const progressKey = 'rice-arcade-progress-v1';
let profile = {};
try { profile = JSON.parse(localStorage.getItem(progressKey)) || {}; } catch { profile = {}; }
profile.games ||= {};
const old2048Best = Number(localStorage.getItem('rice-2048-best')) || 0;
profile.games['2048'] ||= { best: old2048Best, plays: 0 };
profile.games['2048'].best = Math.max(profile.games['2048'].best || 0, old2048Best);
function saveProfile() { try { localStorage.setItem(progressKey, JSON.stringify(profile)); } catch { /* Keep the game playable if storage is unavailable. */ } }

const launcher = document.getElementById('launcher');
launcher.querySelector('footer').insertAdjacentHTML('beforebegin', `<section class="quick-arcade full-arcade"><header class="quick-heading"><div><span class="eyebrow">THE ARCADE FLOOR</span><h2>Full games. Pick your poison.</h2></div><span>18 FULL GAMES<br>NO DOWNLOADS</span></header><div class="arcade-game-grid">${arcadeGames.map(([id, name, note, mark, tag], index) => `<button class="arcade-game-card full-color-${index}" data-full-game="${id}" type="button"><span class="mini-card-top"><i>${String(index + 3).padStart(2, '0')}</i><b>${mark}</b></span><span class="game-preview preview-${id}" aria-hidden="true"><i></i><b></b><small></small><em></em></span><strong>${name}</strong><span class="mini-note">${note}</span><small>${tag}</small><span class="game-best" data-game-best="${id}">BEST ${profile.games[id]?.best || 0}</span></button>`).join('')}</div></section>`);
document.querySelector('.launcher-heading p').innerHTML = 'Pick a game. Stay for the rematch.<br>Twenty games, zero downloads.';
document.querySelector('#launcher .eyebrow').innerHTML = 'THE ARCADE <i></i> 20 GAMES READY';
document.querySelector('.arcade-main').insertAdjacentHTML('beforeend', `<section id="fullGameView" class="full-game-view" hidden><div class="mini-toolbar"><button id="fullBack" type="button">← All games</button><span id="fullCategory"></span><button id="fullScreen" type="button" title="Fullscreen" aria-label="Toggle fullscreen">⛶</button></div><div class="full-game-shell"><header class="full-game-heading"><div><small id="fullTag"></small><h1 id="fullTitle"></h1><p id="fullInstructions"></p></div><div class="mini-scorebox"><small id="fullScoreLabel">SCORE</small><strong id="fullScore">0</strong><span id="fullMeta"></span></div></header><div id="fullStage" class="full-stage"></div><footer class="full-game-footer"><span id="fullMessage" aria-live="polite">Ready?</span><button id="fullAgain" type="button">New game</button></footer></div></section>`);

const view = document.getElementById('fullGameView');
const stage = document.getElementById('fullStage');
const scoreNode = document.getElementById('fullScore');
const metaNode = document.getElementById('fullMeta');
const messageNode = document.getElementById('fullMessage');
let selected = null;
let state = {};
let tick = 0;
let animation = 0;
let timeouts = new Set();
let intervalCallback = null;
let intervalDelay = 0;
let resumeAnimation = null;
let deferredCallbacks = [];
let hiddenAt = 0;
const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
const nativeSetInterval = window.setInterval.bind(window);
const nativeClearInterval = window.clearInterval.bind(window);
function requestAnimationFrame(callback) {
    resumeAnimation = callback;
    if (document.hidden || view.hidden) return 0;
    animation = nativeRequestAnimationFrame(callback);
    return animation;
}
function setInterval(callback, delay) {
    intervalCallback = callback;
    intervalDelay = delay;
    if (document.hidden || view.hidden) return 0;
    tick = nativeSetInterval(callback, delay);
    return tick;
}
function clearInterval(id) {
    nativeClearInterval(id);
    if (!id || id === tick) { tick = 0; intervalCallback = null; intervalDelay = 0; }
}
function later(callback, ms) {
    const id = setTimeout(() => {
        timeouts.delete(id);
        if (document.hidden) deferredCallbacks.push(callback);
        else callback();
    }, ms);
    timeouts.add(id);
}
function clean() { clearInterval(tick); cancelAnimationFrame(animation); animation = 0; resumeAnimation = null; deferredCallbacks = []; hiddenAt = 0; timeouts.forEach(clearTimeout); timeouts.clear(); stage.onpointermove = null; stage.classList.remove('finished'); }
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        hiddenAt = Date.now();
        nativeClearInterval(tick);
        tick = 0;
        cancelAnimationFrame(animation);
        animation = 0;
        return;
    }
    if (view.hidden || !selected) return;
    if (selected[0] === 'mines' && hiddenAt) state.startedAt += Date.now() - hiddenAt;
    hiddenAt = 0;
    if (resumeAnimation && !state.over) animation = nativeRequestAnimationFrame(resumeAnimation);
    if (selected[0] === 'mines' && intervalCallback && !state.done) tick = nativeSetInterval(intervalCallback, intervalDelay);
    deferredCallbacks.splice(0).forEach((callback) => callback());
});
function score(value) {
    scoreNode.textContent = String(value);
    if (!selected || !Number.isFinite(Number(value))) return;
    const record = profile.games[selected[0]] ||= { best: 0, plays: 0 };
    record.lastScore = Number(value);
    record.best = Math.max(Number(record.best) || 0, Number(value));
    profile.updatedAt = new Date().toISOString();
    saveProfile();
    const badge = document.querySelector(`[data-game-best="${selected[0]}"]`);
    if (badge) badge.textContent = `BEST ${record.best}`;
}
function message(text) { messageNode.textContent = text; }
function setStageMarkup(markup) { stage.innerHTML = markup; }
function canvasBoard(width, height, label) { return `<canvas width="${width}" height="${height}" aria-label="${label}"></canvas>`; }
function beginGame() { clean(); state = { score: 0 }; const record = profile.games[selected[0]] ||= { best: 0, plays: 0 }; record.plays = (record.plays || 0) + 1; record.lastPlayed = new Date().toISOString(); saveProfile(); score(0); metaNode.textContent = ''; message(''); ({ tetris: startTetris, mines: startMines, '2048': start2048, breakout: startBreakout, invaders: startInvaders, connect: startConnect, pong: startPong, asteroids: startAsteroids })[selected[0]](); }
function openGame(id) {
    window.closeExtraGame?.();
    selected = arcadeGames.find(([key]) => key === id);
    view.hidden = false; launcher.hidden = true;
    document.querySelector('.site-tabs').hidden = true;
    document.getElementById('snakeView').hidden = true;
    document.getElementById('clickerView').hidden = true;
    document.getElementById('fullTitle').textContent = selected[1];
    document.getElementById('fullInstructions').textContent = selected[2];
    document.getElementById('fullTag').textContent = selected[4];
    document.getElementById('fullCategory').textContent = `ARCADE / ${selected[4]}`;
    beginGame();
}
function closeGame() { clean(); view.hidden = true; document.querySelector('.site-tabs').hidden = false; document.querySelector('.site-tab[data-page="games"]').click(); }
window.closeExtraGame = () => { clean(); view.hidden = true; };
document.querySelectorAll('[data-full-game]').forEach((button) => button.addEventListener('click', () => openGame(button.dataset.fullGame)));
document.getElementById('fullBack').addEventListener('click', closeGame);
document.getElementById('fullAgain').addEventListener('click', beginGame);
document.getElementById('fullScreen').addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await view.requestFullscreen(); } catch { message('Fullscreen is not available here.'); } });

const pieceShapes = [
    [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]]
];
const pieceColors = ['#78d8ef','#f3d16f','#b7a0ff','#7ee0aa','#ff8798','#f4a261','#68a9ff'];
function startTetris() {
    const cols = 10, rows = 20, cell = 30;
    setCanvasArea(300,600,'Tetris board','Rotate ↑ · Move ← → · Drop ↓ · Hard drop Space');
    const canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
    state.board = Array.from({length:rows},()=>Array(cols).fill(''));
    state.lines = 0; state.dropMs = 520; state.last = 0; state.over = false;
    const fresh = () => { const kind = Math.floor(Math.random()*pieceShapes.length); state.piece = { shape: pieceShapes[kind].map(row=>row.slice()), color: pieceColors[kind], x: 3, y: 0 }; if (collide(state.piece.x,state.piece.y,state.piece.shape)) end(); };
    const collide = (x,y,shape) => shape.some((row,dy)=>row.some((value,dx)=>value && (x+dx<0||x+dx>=cols||y+dy>=rows||(y+dy>=0&&state.board[y+dy][x+dx]))));
    const rotate = () => { const shape=state.piece.shape; const rotated=shape[0].map((_,i)=>shape.map(row=>row[i]).reverse()); for(const kick of [0,-1,1,-2,2]) if(!collide(state.piece.x+kick,state.piece.y,rotated)){state.piece.x+=kick;state.piece.shape=rotated;break;} };
    const lock = () => { state.piece.shape.forEach((row,dy)=>row.forEach((value,dx)=>{if(value&&state.piece.y+dy>=0)state.board[state.piece.y+dy][state.piece.x+dx]=state.piece.color;})); let cleared=0; state.board=state.board.filter(row=>{if(row.every(Boolean)){cleared+=1;return false;}return true;}); while(state.board.length<rows)state.board.unshift(Array(cols).fill('')); if(cleared){state.lines+=cleared;state.score += [0,100,300,500,800][cleared]||800;score(state.score);state.dropMs=Math.max(100,520-state.lines*18);message(`${state.lines} lines cleared.`);} fresh(); };
    const end = () => { state.over=true; score(state.score); stage.classList.add('finished'); message(`Stack topped out. ${state.lines} lines cleared.`); };
    const step = () => { if(!state.over){if(!collide(state.piece.x,state.piece.y+1,state.piece.shape))state.piece.y+=1;else lock();} };
    const draw = timestamp => { if(view.hidden||selected[0]!=='tetris')return; const elapsed=timestamp-(state.last||timestamp);state.last=timestamp;state.acc=(state.acc||0)+elapsed;if(state.acc>=state.dropMs){step();state.acc=0;}ctx.fillStyle='#0b1321';ctx.fillRect(0,0,300,600);ctx.strokeStyle='#ffffff0b';for(let x=0;x<=cols;x++){ctx.beginPath();ctx.moveTo(x*cell,0);ctx.lineTo(x*cell,600);ctx.stroke();}for(let y=0;y<=rows;y++){ctx.beginPath();ctx.moveTo(0,y*cell);ctx.lineTo(300,y*cell);ctx.stroke();}state.board.forEach((row,y)=>row.forEach((color,x)=>{if(color){ctx.fillStyle=color;ctx.fillRect(x*cell+1,y*cell+1,cell-2,cell-2);ctx.fillStyle='#ffffff38';ctx.fillRect(x*cell+3,y*cell+3,cell-6,3);}}));if(state.piece)state.piece.shape.forEach((row,y)=>row.forEach((on,x)=>{if(on){ctx.fillStyle=state.piece.color;ctx.fillRect((state.piece.x+x)*cell+1,(state.piece.y+y)*cell+1,cell-2,cell-2);}}));animation=requestAnimationFrame(draw);};
    fresh(); animation=requestAnimationFrame(draw);
    state.key = event => { if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const dx=event.key==='ArrowLeft'?-1:1;if(!collide(state.piece.x+dx,state.piece.y,state.piece.shape))state.piece.x+=dx;} else if(event.key==='ArrowDown'){event.preventDefault();step();} else if(event.key==='ArrowUp'){event.preventDefault();rotate();} else if(event.code==='Space'){event.preventDefault();while(!collide(state.piece.x,state.piece.y+1,state.piece.shape))state.piece.y+=1;lock();} };
    message('Clear rows. Four lines at once is a Tetris.');
}
function setCanvasArea(width,height,label,controls) { stage.innerHTML=`<div class="board-game"><div class="canvas-wrap">${canvasBoard(width,height,label)}</div><p class="board-controls">${controls}</p></div>`; }

function startMines() {
    const size=10,mineCount=15; state.mines=new Set();state.open=new Set();state.flags=new Set();state.started=false;state.done=false;state.flagsLeft=mineCount;
    setStageMarkup('<div class="mine-game"><div class="mine-stats"><span class="mine-left"></span><span class="mine-clock">00:00</span><button class="mine-reset">New field</button></div><div class="mine-board"></div><p class="mine-note">Left click reveal · Right click flag</p></div>');
    const board=stage.querySelector('.mine-board');
    const init=first=>{state.mines.clear();while(state.mines.size<mineCount){const n=Math.floor(Math.random()*size*size);if(n!==first)state.mines.add(n);}state.started=true;};
    const count=n=>[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].reduce((sum,[dx,dy])=>{const x=n%size+dx,y=Math.floor(n/size)+dy;return sum+(x>=0&&x<size&&y>=0&&y<size&&state.mines.has(y*size+x)?1:0);},0);
    const draw=()=>{board.innerHTML=Array.from({length:size*size},(_,i)=>{const isOpen=state.open.has(i),flag=state.flags.has(i),num=isOpen?count(i):0;return `<button type="button" class="mine-cell ${isOpen?'open':''} ${state.mines.has(i)&&isOpen?'mine-hit':''} n${num}" data-mine="${i}" aria-label="Cell ${i+1}${isOpen?num?`, ${num} nearby mines`: ', empty':flag?', flagged':', hidden'}">${flag?'⚑':isOpen?state.mines.has(i)?'✹':num||'':''}</button>`;}).join('');board.querySelectorAll('[data-mine]').forEach(button=>{button.addEventListener('contextmenu',event=>{event.preventDefault();if(state.done||state.open.has(Number(button.dataset.mine)))return;const n=Number(button.dataset.mine);state.flags.has(n)?state.flags.delete(n):state.flags.add(n);state.flagsLeft=mineCount-state.flags.size;stage.querySelector('.mine-left').textContent=`⚑ ${String(state.flagsLeft).padStart(2,'0')}`;draw();});button.addEventListener('click',()=>{if(state.done)return;const n=Number(button.dataset.mine);if(state.flags.has(n))return;if(!state.started)init(n);if(state.mines.has(n)){state.done=true;state.mines.forEach(m=>state.open.add(m));draw();stage.classList.add('finished');message('Boom. New field?');return;}const reveal=cell=>{if(cell<0||cell>=size*size||state.open.has(cell)||state.flags.has(cell))return;state.open.add(cell);if(count(cell)===0){const x=cell%size,y=Math.floor(cell/size);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<size&&ny>=0&&ny<size)reveal(ny*size+nx);}}};reveal(n);score(state.open.size);draw();if(state.open.size===size*size-mineCount){state.done=true;stage.classList.add('finished');message('Field cleared. Nice work.');}});});};
    stage.querySelector('.mine-reset').addEventListener('click',beginGame);stage.querySelector('.mine-left').textContent=`⚑ ${String(mineCount).padStart(2,'0')}`;draw();state.startedAt=Date.now();tick=setInterval(()=>{if(state.done)return;const seconds=Math.floor((Date.now()-state.startedAt)/1000);stage.querySelector('.mine-clock').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;},1000);message('First reveal is always safe. Find every clear square.');
}

function start2048() {
    state.grid=Array.from({length:4},()=>Array(4).fill(0));state.score=0;state.done=false;
    setStageMarkup('<div class="game-2048"><div class="game-2048-head"><span>JOIN THE TILES</span><span>BEST <b class="best-2048">0</b></span></div><div class="grid-2048"></div><div class="swipe-tip">ARROW KEYS · SWIPE TO MOVE</div></div>');
    const board=stage.querySelector('.grid-2048');const add=()=>{const spaces=[];state.grid.forEach((row,r)=>row.forEach((v,c)=>{if(!v)spaces.push([r,c]);}));if(spaces.length){const[r,c]=spaces[Math.floor(Math.random()*spaces.length)];state.grid[r][c]=Math.random()<.9?2:4;}};
    const draw=()=>{board.innerHTML=state.grid.flat().map(v=>`<div class="tile-2048 v${Math.min(v,2048)}">${v||''}</div>`).join('');stage.querySelector('.best-2048').textContent=localStorage.getItem('rice-2048-best')||'0';};
    const move=direction=>{if(state.done)return;const before=state.grid.map(row=>row.slice());for(let i=0;i<4;i++){let coords=direction==='left'||direction==='right'?[0,1,2,3].map(c=>[i,c]):[0,1,2,3].map(r=>[r,i]);if(direction==='right'||direction==='down')coords.reverse();let line=coords.map(([r,c])=>state.grid[r][c]).filter(Boolean),next=[];for(let j=0;j<line.length;j++){if(line[j]===line[j+1]){const value=line[j]*2;next.push(value);state.score+=value;j++;}else next.push(line[j]);}while(next.length<4)next.push(0);coords.forEach(([r,c],k)=>state.grid[r][c]=next[k]);}if(JSON.stringify(before)!==JSON.stringify(state.grid)){add();score(state.score);draw();if(state.score>Number(localStorage.getItem('rice-2048-best')||0))localStorage.setItem('rice-2048-best',state.score);if(!state.grid.flat().includes(0)&&!state.grid.some((row,r)=>row.some((v,c)=>v===row[c+1]||v===state.grid[r+1]?.[c]))){state.done=true;stage.classList.add('finished');message('No more moves. Start a fresh board.');}}};
    add();add();draw();state.move=move;message('Merge matching tiles. Make it to 2048.');
}

function startBreakout() {
    const width=520,height=600;setCanvasArea(width,height,'Brick by Brick court','← → OR A / D TO MOVE · MOUSE ALSO WORKS');const canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d');
    state.paddle=220;state.ball={x:260,y:500,vx:3,vy:-4};state.lives=3;state.bricks=Array.from({length:5},(_,r)=>Array.from({length:10},(_,c)=>({x:18+c*50,y:62+r*25,on:true,color:['#ff8296','#f3d16f','#83cfaa','#80cbe7','#bd9bfa'][r]})));state.over=false;
    const end=won=>{state.over=true;stage.classList.add('finished');message(won?'All clear. You made short work of it.':`Run over. ${state.score} points.`);};
    const draw=()=>{if(view.hidden||selected[0]!=='breakout'||state.over)return;ctx.clearRect(0,0,width,height);ctx.fillStyle='#0c1424';ctx.fillRect(0,0,width,height);state.bricks.flat().forEach(b=>{if(b.on){ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,42,15);}});ctx.fillStyle='#d3f27a';ctx.beginPath();ctx.roundRect(state.paddle,565,82,10,5);ctx.fill();ctx.beginPath();ctx.arc(state.ball.x,state.ball.y,8,0,Math.PI*2);ctx.fillStyle='#fff0c1';ctx.shadowColor='#fff0c1';ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;state.ball.x+=state.ball.vx;state.ball.y+=state.ball.vy;if(state.ball.x<8||state.ball.x>width-8)state.ball.vx*=-1;if(state.ball.y<8)state.ball.vy=Math.abs(state.ball.vy);if(state.ball.y>555&&state.ball.x>state.paddle-5&&state.ball.x<state.paddle+87){state.ball.vy=-Math.abs(state.ball.vy);state.ball.vx+=(state.ball.x-(state.paddle+41))*.06;}const brick=state.bricks.flat().find(b=>b.on&&state.ball.x>b.x-5&&state.ball.x<b.x+47&&state.ball.y>b.y-5&&state.ball.y<b.y+20);if(brick){brick.on=false;state.ball.vy*=-1;state.score+=10;score(state.score);if(state.bricks.flat().every(b=>!b.on))return end(true);}if(state.ball.y>height){state.lives-=1;metaNode.textContent=`${state.lives} LIVES`;if(!state.lives)return end(false);state.ball={x:260,y:500,vx:3,vy:-4};}animation=requestAnimationFrame(draw);};
    state.movePaddle=x=>state.paddle=Math.max(0,Math.min(width-82,x-41));stage.onpointermove=e=>{const rect=canvas.getBoundingClientRect();state.movePaddle((e.clientX-rect.left)*width/rect.width);};state.key=e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')state.paddle=Math.max(0,state.paddle-24);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')state.paddle=Math.min(width-82,state.paddle+24);};metaNode.textContent='3 LIVES';animation=requestAnimationFrame(draw);message('Break every brick. Keep the ball in play.');
}

function startInvaders() {
    const width=520,height=600;setCanvasArea(width,height,'Last Bell invasion','← → TO MOVE · SPACE TO FIRE');const canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d');
    state.player=260;state.shots=[];state.enemyShots=[];state.enemies=Array.from({length:4},(_,r)=>Array.from({length:8},(_,c)=>({x:58+c*54,y:72+r*42,on:true}))).flat();state.dir=1;state.lives=3;state.lastShot=0;state.over=false;
    const fire=()=>{if(Date.now()-state.lastShot<280||state.over)return;state.lastShot=Date.now();state.shots.push({x:state.player,y:530});};
    const end=win=>{state.over=true;stage.classList.add('finished');message(win?'Fleet cleared. Earth says thanks.':`The fleet got through. ${state.score} points.`);};
    const draw=()=>{if(view.hidden||selected[0]!=='invaders'||state.over)return;ctx.clearRect(0,0,width,height);ctx.fillStyle='#0c1424';ctx.fillRect(0,0,width,height);ctx.fillStyle='#a5e889';ctx.fillRect(state.player-22,555,44,16);ctx.fillRect(state.player-6,548,12,8);state.enemies.filter(e=>e.on).forEach((e,i)=>{ctx.fillStyle=['#a9a0ff','#72d8d1','#f3d16f','#ff8798'][Math.floor(i/8)];ctx.fillRect(e.x,e.y,28,18);ctx.fillRect(e.x+4,e.y-5,20,5);});ctx.fillStyle='#f9efa8';state.shots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,12));ctx.fillStyle='#ff8296';state.enemyShots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,10));state.shots.forEach(s=>s.y-=8);state.enemyShots.forEach(s=>s.y+=4);state.enemies.filter(e=>e.on).forEach(e=>{if(state.shots.some(s=>Math.abs(s.x-e.x-14)<18&&Math.abs(s.y-e.y)<15)){e.on=false;state.score+=10;score(state.score);}});state.shots=state.shots.filter(s=>s.y>0&&!state.enemies.some(e=>!e.on&&Math.abs(s.x-e.x-14)<18&&Math.abs(s.y-e.y)<15));if(state.enemies.some(e=>e.on)){const left=Math.min(...state.enemies.filter(e=>e.on).map(e=>e.x)),right=Math.max(...state.enemies.filter(e=>e.on).map(e=>e.x+28));if(left<12||right>width-12){state.dir*=-1;state.enemies.filter(e=>e.on).forEach(e=>e.y+=18);}state.enemies.filter(e=>e.on).forEach(e=>e.x+=state.dir*.7);if(Math.random()<.025){const alive=state.enemies.filter(e=>e.on);if(alive.length)state.enemyShots.push({x:alive[Math.floor(Math.random()*alive.length)].x+14,y:alive[0].y+18});}if(state.enemies.some(e=>e.on&&e.y>530))return end(false);state.enemyShots=state.enemyShots.filter(s=>{if(s.y>550&&Math.abs(s.x-state.player)<24){state.lives-=1;metaNode.textContent=`${state.lives} LIVES`;if(!state.lives){end(false);return false;}return false;}return s.y<height;});}else return end(true);animation=requestAnimationFrame(draw);};
    state.key=e=>{if(e.key==='ArrowLeft')state.player=Math.max(24,state.player-22);if(e.key==='ArrowRight')state.player=Math.min(width-24,state.player+22);if(e.code==='Space'){e.preventDefault();fire();}};metaNode.textContent='3 LIVES';animation=requestAnimationFrame(draw);message('Protect the bottom line. Clear the whole fleet.');
}

function startConnect() {
    const rows=6,cols=7,human=1,cpu=2;state.board=Array.from({length:rows},()=>Array(cols).fill(0));state.busy=false;state.done=false;
    setStageMarkup('<div class="connect-game"><div class="connect-status">YOUR TURN <span>●</span></div><div class="connect-board" role="grid" aria-label="Connect four board"></div></div>');const element=stage.querySelector('.connect-board');
    const wins=(board,p)=>{for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(board[r][c]!==p)continue;if(c<cols-3&&[0,1,2,3].every(n=>board[r][c+n]===p))return true;if(r<rows-3&&[0,1,2,3].every(n=>board[r+n][c]===p))return true;if(r<rows-3&&c<cols-3&&[0,1,2,3].every(n=>board[r+n][c+n]===p))return true;if(r<rows-3&&c>2&&[0,1,2,3].every(n=>board[r+n][c-n]===p))return true;}return false;};const open=b=>[3,2,4,1,5,0,6].filter(c=>b[0][c]===0);const drop=(b,c,p)=>{for(let r=rows-1;r>=0;r--)if(!b[r][c]){b[r][c]=p;return;}};
    const evaluate=b=>{let v=b.reduce((s,row)=>s+(row[3]===cpu?5:row[3]===human?-5:0),0),lines=[];for(let r=0;r<rows;r++)for(let c=0;c<cols-3;c++)lines.push([0,1,2,3].map(n=>b[r][c+n]));for(let c=0;c<cols;c++)for(let r=0;r<rows-3;r++)lines.push([0,1,2,3].map(n=>b[r+n][c]));for(let r=0;r<rows-3;r++)for(let c=0;c<cols-3;c++)lines.push([0,1,2,3].map(n=>b[r+n][c+n]));for(let r=3;r<rows;r++)for(let c=0;c<cols-3;c++)lines.push([0,1,2,3].map(n=>b[r-n][c+n]));for(const l of lines){const a=l.filter(x=>x===cpu).length,h=l.filter(x=>x===human).length,e=l.filter(x=>x===0).length;if(a===3&&e===1)v+=18;else if(a===2&&e===2)v+=4;if(h===3&&e===1)v-=24;}return v;};
    const search=(b,d,a,beta,max)=>{const moves=open(b);if(wins(b,cpu))return[1e5+d,null];if(wins(b,human))return[-1e5-d,null];if(!moves.length||!d)return[evaluate(b),null];let best=max?-Infinity:Infinity,choice=moves[0];for(const c of moves){const copy=b.map(row=>row.slice());drop(copy,c,max?cpu:human);const[v]=search(copy,d-1,a,beta,!max);if(max?v>best:v<best){best=v;choice=c;}if(max)a=Math.max(a,best);else beta=Math.min(beta,best);if(a>=beta)break;}return[best,choice];};
    const draw=()=>{element.innerHTML=state.board.flatMap((row,r)=>row.map((p,c)=>`<button role="gridcell" data-col="${c}" aria-label="Column ${c+1}, row ${r+1}" class="connect-cell ${p===human?'disc-human':p===cpu?'disc-cpu':''}"></button>`)).join('');element.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{if(state.busy||state.done)return;const col=Number(button.dataset.col);if(state.board[0][col])return;drop(state.board,col,human);if(wins(state.board,human)){state.done=true;score(1);message('Four connected. You got it.');stage.classList.add('finished');draw();return;}state.busy=true;stage.querySelector('.connect-status').textContent='CPU THINKING';draw();later(()=>{const[,colCpu]=search(state.board,4,-Infinity,Infinity,true);if(colCpu!==null)drop(state.board,colCpu,cpu);state.busy=false;if(wins(state.board,cpu)){state.done=true;message('CPU connected four. Rematch?');stage.classList.add('finished');}else stage.querySelector('.connect-status').textContent='YOUR TURN';draw();},220);}));};draw();message('You are coral. The CPU plays gold.');
}

function startPong() {
    const width=520,height=600;setCanvasArea(width,height,'Orbit Pong court','← → TO MOVE · MOUSE OR TOUCH ALSO WORK');const canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d');state.ball={x:260,y:300,vx:3.2,vy:4.2};state.player=222;state.cpu=222;state.lives=3;state.over=false;let previous=0;
    const serve=()=>{state.ball={x:260,y:300,vx:(Math.random()>.5?1:-1)*(2.6+Math.random()),vy:4.2};};
    const draw=t=>{if(view.hidden||selected[0]!=='pong'||state.over)return;const dt=Math.min(32,t-(previous||t));previous=t;ctx.fillStyle='#0c1424';ctx.fillRect(0,0,width,height);ctx.strokeStyle='#ffffff25';ctx.setLineDash([6,10]);ctx.beginPath();ctx.moveTo(20,300);ctx.lineTo(500,300);ctx.stroke();ctx.setLineDash([]);state.cpu+=(state.ball.x-(state.cpu+38))*Math.min(.1,dt/230);state.cpu=Math.max(12,Math.min(width-88,state.cpu));ctx.fillStyle='#d3f27a';ctx.beginPath();ctx.roundRect(state.cpu,35,76,11,5);ctx.fill();ctx.fillStyle='#ff8296';ctx.beginPath();ctx.roundRect(state.player,height-45,76,11,5);ctx.fill();ctx.beginPath();ctx.arc(state.ball.x,state.ball.y,9,0,7);ctx.fillStyle='#fff0bc';ctx.shadowBlur=16;ctx.shadowColor='#fff0bc';ctx.fill();ctx.shadowBlur=0;state.ball.x+=state.ball.vx*dt/16;state.ball.y+=state.ball.vy*dt/16;if(state.ball.x<9||state.ball.x>width-9)state.ball.vx*=-1;if(state.ball.vy>0&&state.ball.y>height-57&&state.ball.x>state.player-8&&state.ball.x<state.player+84){state.ball.vy=-Math.abs(state.ball.vy);state.ball.vx+=(state.ball.x-state.player-38)*.04;}if(state.ball.vy<0&&state.ball.y<48&&state.ball.x>state.cpu-8&&state.ball.x<state.cpu+84){state.ball.vy=Math.abs(state.ball.vy);state.ball.vx+=(state.ball.x-state.cpu-38)*.03;}if(state.ball.y<0){state.score+=1;score(state.score);serve();}if(state.ball.y>height){state.lives-=1;metaNode.textContent=`${state.lives} LIVES`;if(!state.lives){state.over=true;stage.classList.add('finished');message(`Rally over. ${state.score} points.`);return;}serve();}animation=requestAnimationFrame(draw);};
    state.move=x=>state.player=Math.max(8,Math.min(width-84,x-38));stage.onpointermove=e=>{const rect=canvas.getBoundingClientRect();state.move((e.clientX-rect.left)*width/rect.width);};state.key=e=>{if(e.key==='ArrowLeft')state.player=Math.max(8,state.player-24);if(e.key==='ArrowRight')state.player=Math.min(width-84,state.player+24);};metaNode.textContent='3 LIVES';animation=requestAnimationFrame(draw);message('Return the ball. A miss costs a life.');
}

function startAsteroids() {
    const width=560,height=640;setCanvasArea(width,height,'After Hours asteroid field','← → ROTATE · ↑ THRUST · SPACE FIRE · WRAP AROUND THE FIELD');const canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d');state.ship={x:width/2,y:height/2,a:-Math.PI/2,vx:0,vy:0};state.rocks=[];state.shots=[];state.keys={};state.over=false;for(let i=0;i<5;i++)state.rocks.push(makeRock(Math.random()*width,Math.random()*height,34));
    function makeRock(x,y,r){return{x,y,r,a:Math.random()*6.28,spin:(Math.random()-.5)*.02,vx:(Math.random()-.5)*1.6,vy:(Math.random()-.5)*1.6,shape:Array.from({length:10},()=>.72+Math.random()*.48)};}
    const drawRock=rock=>{ctx.beginPath();for(let i=0;i<rock.shape.length;i++){const a=rock.a+i/rock.shape.length*Math.PI*2,x=rock.x+Math.cos(a)*rock.r*rock.shape[i],y=rock.y+Math.sin(a)*rock.r*rock.shape[i];if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.strokeStyle='#aab8d4';ctx.lineWidth=2;ctx.stroke();};
    const draw=t=>{if(view.hidden||selected[0]!=='asteroids'||state.over)return;ctx.fillStyle='#0b1321';ctx.fillRect(0,0,width,height);ctx.fillStyle='#ffffffaa';for(let i=0;i<45;i++){const x=(i*127)%width,y=(i*241)%height;ctx.fillRect(x,y,2,2);}const s=state.ship;if(state.keys.ArrowLeft)s.a-=.065;if(state.keys.ArrowRight)s.a+=.065;if(state.keys.ArrowUp){s.vx+=Math.cos(s.a)*.12;s.vy+=Math.sin(s.a)*.12;ctx.strokeStyle='#f2b66f';ctx.beginPath();ctx.moveTo(s.x-Math.cos(s.a)*13,s.y-Math.sin(s.a)*13);ctx.lineTo(s.x-Math.cos(s.a)*27+(Math.random()-.5)*8,s.y-Math.sin(s.a)*27+(Math.random()-.5)*8);ctx.stroke();}s.x=(s.x+s.vx+width)%width;s.y=(s.y+s.vy+height)%height;s.vx*=.995;s.vy*=.995;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-13,-11);ctx.lineTo(-8,0);ctx.lineTo(-13,11);ctx.closePath();ctx.strokeStyle='#d3f27a';ctx.lineWidth=2;ctx.stroke();ctx.restore();state.rocks.forEach(rock=>{rock.x=(rock.x+rock.vx+width)%width;rock.y=(rock.y+rock.vy+height)%height;rock.a+=rock.spin;drawRock(rock);});state.shots=state.shots.filter(shot=>shot.life-->0);state.shots.forEach(shot=>{shot.x=(shot.x+shot.vx+width)%width;shot.y=(shot.y+shot.vy+height)%height;ctx.fillStyle='#ff8296';ctx.beginPath();ctx.arc(shot.x,shot.y,3,0,7);ctx.fill();});for(let i=state.rocks.length-1;i>=0;i--){const rock=state.rocks[i];const hit=state.shots.findIndex(shot=>Math.hypot(shot.x-rock.x,shot.y-rock.y)<rock.r);if(hit>=0){state.shots.splice(hit,1);state.rocks.splice(i,1);state.score+=rock.r<20?30:10;score(state.score);if(rock.r>17)for(let k=0;k<2;k++)state.rocks.push(makeRock(rock.x,rock.y,rock.r*.55));if(!state.rocks.length)for(let k=0;k<5;k++)state.rocks.push(makeRock(Math.random()*width,Math.random()*height,34));}}if(state.keys.Space&&Date.now()-(state.lastFire||0)>220){state.lastFire=Date.now();state.shots.push({x:s.x+Math.cos(s.a)*18,y:s.y+Math.sin(s.a)*18,vx:Math.cos(s.a)*7+s.vx,vy:Math.sin(s.a)*7+s.vy,life:55});}metaNode.textContent='KEEP MOVING';animation=requestAnimationFrame(draw);};
    state.keydown=e=>{state.keys[e.code==='Space'?'Space':e.key]=true;if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault();};state.keyup=e=>{state.keys[e.code==='Space'?'Space':e.key]=false;};animation=requestAnimationFrame(draw);message('No finish line. Clear rocks and keep moving.');
}

document.addEventListener('keydown',event=>{if(view.hidden)return;if(selected[0]==='tetris')state.key?.(event);if(selected[0]==='breakout')state.key?.(event);if(selected[0]==='invaders')state.key?.(event);if(selected[0]==='pong')state.key?.(event);if(selected[0]==='2048'){const moves={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(moves[event.key]){event.preventDefault();state.move?.(moves[event.key]);}}if(selected[0]==='asteroids')state.keydown?.(event);});
document.addEventListener('keyup',event=>{if(!view.hidden&&selected[0]==='asteroids')state.keyup?.(event);});
