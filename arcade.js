const SAVE = 'rice-cosmos-save';
const BEST = 'rice-serpent-best';

document.body.className = 'arcade-body';
document.title = 'Rice Arcade | Games, chat, and leaderboards';
document.body.innerHTML = `
<header class="arcade-header"><a class="wordmark" href="#home" aria-label="Rice's Site home"><img class="site-logo" src="site-logo.svg" alt=""><span class="site-title">Rice's Site</span></a><nav class="site-tabs" aria-label="Site sections" role="tablist"><button type="button" class="site-tab active" data-page="games" role="tab" aria-selected="true">Games</button><button type="button" class="site-tab" data-page="clients" role="tab" aria-selected="false">Eaglercraft Clients</button><button type="button" class="site-tab" data-page="chat" role="tab" aria-selected="false">Chat</button><button type="button" class="site-tab" data-page="leaderboards" role="tab" aria-selected="false">Leaderboards</button><button type="button" class="site-tab" data-page="about" role="tab" aria-selected="false">About me</button></nav><label class="theme-picker"><span>THEME</span><select id="themePicker" aria-label="Choose site theme"><option value="violet">Violet glow</option><option value="electric">Electric blue</option><option value="sunset">Sunset pop</option><option value="mint">Mint arcade</option></select></label><small>A LITTLE TIME WELL SPENT</small></header>
<main class="arcade-main">
<section id="launcher" class="launcher-view"><div class="eyebrow">THE ARCADE <i></i> 2 GAMES READY</div><div class="launcher-heading"><h1>Pick your next<br><em>small obsession.</em></h1><p>Two ways to unwind.<br>One is rhythm. One is focus.</p></div>
<div class="game-list">
<button class="launch-card serpent-card" data-open="snake"><span class="launch-art serpent-art"><i></i><b></b><small></small></span><span class="launch-copy"><small>01 / FOCUS</small><strong>Serpent</strong><span>Find a rhythm. Keep your cool.</span></span><span class="launch-arrow">↗</span></button>
<button class="launch-card cosmos-card" data-open="clicker"><span class="launch-art cosmos-art"><i></i><b></b><small></small></span><span class="launch-copy"><small>02 / BUILD</small><strong>Little Cosmos</strong><span>Tap, grow, and begin again stronger.</span></span><span class="launch-arrow">↗</span></button></div><footer>MADE FOR THE IN-BETWEEN <span>TAKE YOUR TIME</span></footer></section>
<section id="snakeView" class="game-view" hidden><div class="game-toolbar"><button data-back class="back-button">← All games</button><span>01 / FOCUS</span><button data-fullscreen class="full-button" title="Toggle fullscreen" aria-label="Toggle fullscreen">⛶</button></div><div class="snake-layout"><div class="snake-copy"><small class="eyebrow">A CALMER KIND OF ARCADE</small><h1>Serpent<span>.</span></h1><p>Stay in flow. Gather the light. Try not to meet yourself along the way.</p><div class="snake-stats"><div><small>SCORE</small><strong id="snakeScore">0</strong></div><div><small>PERSONAL BEST</small><strong id="snakeBest">0</strong></div></div><div class="snake-actions"><button id="snakeStart" class="primary-button">Start a run</button><button id="snakePause" class="secondary-button" disabled>Pause</button></div><small class="control-hint">ARROWS OR WASD <i>·</i> SWIPE ON TOUCH</small></div><div class="snake-board-wrap"><div class="board-frame"><canvas id="snakeCanvas" width="480" height="480" aria-label="Serpent game board"></canvas><div id="snakeOverlay" class="board-overlay"><strong id="overlayTitle">Ready when you are</strong><span id="overlayText">Press start to begin</span></div></div><div class="touch-controls"><button data-dir="up" aria-label="Up">↑</button><div><button data-dir="left" aria-label="Left">←</button><button data-dir="down" aria-label="Down">↓</button><button data-dir="right" aria-label="Right">→</button></div></div></div></div></section>
<section id="clickerView" class="game-view" hidden><div class="game-toolbar"><button data-back class="back-button">← All games</button><span>02 / BUILD</span><button data-fullscreen class="full-button" title="Toggle fullscreen" aria-label="Toggle fullscreen">⛶</button></div><div class="cosmos-layout"><div class="cosmos-main"><small class="eyebrow">A TINY UNIVERSE, YOURS TO GROW</small><h1>Little Cosmos<span>.</span></h1><div class="dust-display"><small>STARDUST</small><strong id="dust">0</strong><span id="rate">0 per second</span></div><button id="core" class="core-button" aria-label="Gather stardust"><i></i><b></b><span>GATHER</span></button><div class="rebirth-panel"><div><small class="eyebrow">COSMIC RESET</small><strong id="rebirthLabel">No stars gathered</strong><p id="rebirthHint">Reach 1,500 stardust to earn your first star.</p></div><button id="rebirth" class="rebirth-button" disabled>Ascend <span id="rebirthCost">1,500 ✦</span></button></div></div><aside class="upgrade-panel"><header><div><small class="eyebrow">GROW YOUR ORBIT</small><h2>Upgrades</h2></div><span id="ownedCount">0 owned</span></header><div id="upgrades"></div><p>Progress saves automatically on this device.</p></aside></div></section>
</main>`;
document.querySelector('.site-logo').src = 'site-logo.jpg';
const themeKey = 'rice-site-theme-v1';
const themePicker = document.getElementById('themePicker');
themePicker.add(new Option('Classroom of the Elite', 'classroom'));
const savedTheme = localStorage.getItem(themeKey);
document.body.dataset.theme = ['violet', 'electric', 'sunset', 'mint', 'classroom'].includes(savedTheme) ? savedTheme : 'violet';
themePicker.value = document.body.dataset.theme;
themePicker.addEventListener('change', () => {
    document.body.dataset.theme = themePicker.value;
    localStorage.setItem(themeKey, themePicker.value);
});
document.querySelector('.arcade-main').insertAdjacentHTML('beforeend', `
<section id="chatView" class="site-page" hidden><div class="page-heading"><div><small class="eyebrow">THE SIDE QUEST</small><h1>Chat room<span>.</span></h1><p>Say hi to anyone else in the arcade. Use a nickname; keep personal details private.</p></div><span class="local-label">LIVE ROOM</span></div><div class="chat-panel"><div class="chat-status"><i></i><span id="chatConnection">Connecting to the room...</span><span class="chat-cap">LAST 80 MESSAGES</span></div><div id="chatLog" class="chat-log" aria-live="polite"></div><form id="chatForm" class="chat-form"><label><span>Your name</span><input id="chatName" maxlength="20" autocomplete="nickname" placeholder="Player name" required></label><label class="message-field"><span>Message</span><input id="chatMessage" maxlength="240" placeholder="Say something nice..." required></label><button type="submit">Send ↗</button></form></div></section>
<section id="leaderboardView" class="site-page" hidden><div class="page-heading"><div><small class="eyebrow">ARCADE HIGH SCORES</small><h1>Leaderboards<span>.</span></h1><p>Shared scores from everyone playing this site. Scores are not verified.</p></div><span class="local-label">ONLINE</span></div><label class="player-name-setting">YOUR PLAYER NAME<input id="playerName" maxlength="20" autocomplete="nickname" placeholder="Player name"></label><div class="leaderboard-panel"><div class="leaderboard-tabs"><button type="button" class="leaderboard-tab active" data-board="snake">Serpent</button><button type="button" class="leaderboard-tab" data-board="cosmos">Little Cosmos</button></div><div id="leaderboardList" class="leaderboard-list"></div></div></section>
<section id="aboutView" class="site-page about-page" hidden><small class="eyebrow">A NOTE FROM THE CREATOR</small><h1>About me<span>.</span></h1><div class="about-note"><span class="about-sticker">GRADE 10<br>✦ PLAYER 1</span><p>Hey, I’m a 10th grader and I used about 99% AI to make this site (with a little help from me keeping the ideas coming).</p><p>My school has Content Keeper, which blocks a lot of stuff, so I made this little corner with a couple games for when you’re bored and need a quick break.</p><span class="about-signoff">have fun & be cool ✌</span></div></section>`);

const launcher = document.getElementById('launcher');
const snakeView = document.getElementById('snakeView');
const clickerView = document.getElementById('clickerView');
const clientsView = document.createElement('section');
clientsView.id = 'clientsView';
clientsView.className = 'site-page clients-page';
clientsView.hidden = true;
document.querySelector('.arcade-main').append(clientsView);
const siteTabs = document.querySelectorAll('[data-page]');
const sitePages = { games: launcher, clients: clientsView, chat: document.getElementById('chatView'), leaderboards: document.getElementById('leaderboardView'), about: document.getElementById('aboutView') };
let activeBoard = 'snake';
let activeGame = '';
let snakeRunning = false;
let snakeTimer = 0;
siteTabs.forEach((button) => button.addEventListener('click', () => showPage(button.dataset.page)));
document.querySelector('.wordmark').addEventListener('click', (event) => {
    event.preventDefault();
    showPage('games');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
function showPage(name) {
    window.closeExtraGame?.();
    window.closeWebGame?.();
    if (snakeRunning) pauseSnake();
    activeGame = '';
    snakeView.hidden = true;
    clickerView.hidden = true;
    Object.entries(sitePages).forEach(([key, page]) => { page.hidden = key !== name; });
    siteTabs.forEach((tab) => { const selected = tab.dataset.page === name; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)); });
    document.querySelector('.site-tabs').hidden = false;
    if (name === 'leaderboards') renderLeaderboard(activeBoard);
    setCosmosTimer();
}
document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('page-hidden', document.hidden);
    if (document.hidden && snakeRunning) pauseSnake();
    setCosmosTimer();
});
function getBackendOrigin() {
    if (window.ARCADE_SERVER_URL) return new URL(window.ARCADE_SERVER_URL, location.origin).origin;
    const url = new URL(location.href);
    if (url.hostname.endsWith('.app.github.dev')) {
        url.hostname = url.hostname.replace(/-\d+\.app\.github\.dev$/, '-3000.app.github.dev');
    } else if (['localhost', '127.0.0.1'].includes(url.hostname) && url.port && url.port !== '3000') {
        url.port = '3000';
    }
    return url.origin;
}
const backendOrigin = getBackendOrigin();
const backendWsOrigin = backendOrigin.replace(/^http/, 'ws');
const chatNameInput = document.getElementById('chatName');
const chatMessageInput = document.getElementById('chatMessage');
const chatLog = document.getElementById('chatLog');
const chatConnection = document.getElementById('chatConnection');
const playerNameInput = document.getElementById('playerName');
const playerNameKey = 'rice-arcade-player-name';
let playerName = localStorage.getItem(playerNameKey) || `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
localStorage.setItem(playerNameKey, playerName);
chatNameInput.value = playerName;
playerNameInput.value = playerName;
let chatMessages = [];
let chatSocket;
let reconnectTimer;
function renderChat() {
    chatLog.replaceChildren();
    if (!chatMessages.length) {
        const empty = document.createElement('p');
        empty.className = 'chat-empty';
        empty.textContent = 'It’s quiet in here. Drop the first hello.';
        chatLog.append(empty);
        return;
    }
    chatMessages.forEach((message) => {
        const row = document.createElement('article');
        row.className = 'chat-message';
        const header = document.createElement('header');
        const name = document.createElement('strong');
        const time = document.createElement('time');
        const text = document.createElement('p');
        name.textContent = message.player;
        time.textContent = new Date(message.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        text.textContent = message.message;
        header.append(name, time);
        row.append(header, text);
        chatLog.append(row);
    });
    chatLog.scrollTop = chatLog.scrollHeight;
}
function connectChat() {
    chatSocket = new WebSocket(`${backendWsOrigin}/ws`);
    chatSocket.addEventListener('open', () => {
        chatConnection.textContent = 'Connected · messages are live';
        document.querySelector('.chat-status > i').classList.add('connected');
    });
    chatSocket.addEventListener('message', (event) => {
        let payload;
        try { payload = JSON.parse(event.data); } catch { return; }
        if (payload.type === 'history') chatMessages = payload.messages;
        if (payload.type === 'chat' && !chatMessages.some((message) => message.id === payload.message.id)) chatMessages.push(payload.message);
        chatMessages = chatMessages.slice(-80);
        renderChat();
    });
    chatSocket.addEventListener('close', () => {
        chatConnection.textContent = 'Disconnected · reconnecting…';
        document.querySelector('.chat-status > i').classList.remove('connected');
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectChat, 2500);
    });
    chatSocket.addEventListener('error', () => chatSocket.close());
}
connectChat();
document.getElementById('chatForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = chatNameInput.value.trim().slice(0, 20);
    const text = chatMessageInput.value.trim().slice(0, 240);
    if (!name || !text) return;
    if (chatSocket?.readyState !== WebSocket.OPEN) {
        chatConnection.textContent = 'Offline · message was not sent';
        return;
    }
    playerName = name;
    playerNameInput.value = name;
    localStorage.setItem(playerNameKey, name);
    chatSocket.send(JSON.stringify({ player: name, message: text }));
    chatMessageInput.value = '';
});
playerNameInput.addEventListener('input', () => {
    playerName = playerNameInput.value.trim().slice(0, 20);
    chatNameInput.value = playerName;
    localStorage.setItem(playerNameKey, playerName);
});
chatNameInput.addEventListener('input', () => {
    playerName = chatNameInput.value.trim().slice(0, 20);
    playerNameInput.value = playerName;
    localStorage.setItem(playerNameKey, playerName);
});

async function renderLeaderboard(board) {
    activeBoard = board;
    document.querySelectorAll('[data-board]').forEach((button) => button.classList.toggle('active', button.dataset.board === board));
    const list = document.getElementById('leaderboardList');
    list.replaceChildren();
    try {
        const response = await fetch(`${backendOrigin}/api/leaderboard?game=${encodeURIComponent(board)}`);
        if (!response.ok) throw new Error('Leaderboard unavailable');
        const { rows } = await response.json();
        if (!rows.length) {
            const empty = document.createElement('p');
            empty.className = 'leaderboard-empty';
            empty.textContent = 'No scores yet. Be the first on the board!';
            list.append(empty);
            return;
        }
        rows.forEach((record, index) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        const rank = document.createElement('span');
        const label = document.createElement('strong');
        const value = document.createElement('b');
        rank.textContent = `0${index + 1}`;
        label.textContent = record.player;
        value.textContent = board === 'snake'
            ? `${Number(record.score).toLocaleString()} pts`
            : `${Number(record.score).toLocaleString()} ✦ · ${Number(record.rebirths).toLocaleString()} rebirths`;
        row.append(rank, label, value);
        list.append(row);
        });
    } catch {
        const offline = document.createElement('p');
        offline.className = 'leaderboard-empty';
        offline.textContent = 'Can’t reach the arcade server right now.';
        list.append(offline);
    }
}
document.querySelectorAll('[data-board]').forEach((button) => button.addEventListener('click', () => renderLeaderboard(button.dataset.board)));
async function submitScore(game, score, rebirths = 0) {
    const player = playerNameInput.value.trim().slice(0, 20);
    if (!player || !Number.isSafeInteger(Math.floor(score))) return;
    try {
        const response = await fetch(`${backendOrigin}/api/scores`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ game, player, score: Math.floor(score), rebirths }) });
        if (response.ok && activeBoard === game) renderLeaderboard(game);
    } catch { /* Scores will retry on a later update. */ }
}
document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
    activeGame = button.dataset.open;
    launcher.hidden = true;
    document.querySelector('.site-tabs').hidden = true;
    snakeView.hidden = activeGame !== 'snake';
    clickerView.hidden = activeGame !== 'clicker';
    setCosmosTimer();
    if (activeGame === 'snake') drawSnake();
}));
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    showPage('games');
}));
document.querySelectorAll('[data-fullscreen]').forEach((button) => button.addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await button.closest('.game-view').requestFullscreen(); } catch { button.title = 'Fullscreen unavailable'; }
}));

const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const cells = 24;
const tile = canvas.width / cells;
const scoreNode = document.getElementById('snakeScore');
const bestNode = document.getElementById('snakeBest');
const overlay = document.getElementById('snakeOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const pauseButton = document.getElementById('snakePause');
let snake = [];
let direction = { x: 1, y: 0 };
let queued = { ...direction };
let fruit = { x: 17, y: 12 };
let score = 0;
let best = Number(localStorage.getItem(BEST)) || 0;
bestNode.textContent = best;
function overlayMessage(title, text, show) { overlayTitle.textContent = title; overlayText.textContent = text; overlay.hidden = !show; }
function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 480, 480); bg.addColorStop(0, '#172623'); bg.addColorStop(1, '#101c1b'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 480, 480);
    ctx.strokeStyle = 'rgba(177,229,207,.045)'; ctx.lineWidth = 1;
    for (let i = 1; i < cells; i++) { ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, 480); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(480, i * tile); ctx.stroke(); }
    ctx.shadowColor = '#f6a66f'; ctx.shadowBlur = 20; ctx.fillStyle = '#ffc18c'; ctx.beginPath(); ctx.arc((fruit.x + .5) * tile, (fruit.y + .5) * tile, tile * .25, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    if (!snake.length) return;
    ctx.beginPath(); snake.forEach((part, i) => { const x = (part.x + .5) * tile, y = (part.y + .5) * tile; if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = tile * .64; const body = ctx.createLinearGradient(50, 480, 440, 0); body.addColorStop(0, '#83cfaa'); body.addColorStop(1, '#d7e7a1'); ctx.strokeStyle = body; ctx.shadowColor = 'rgba(143,225,175,.4)'; ctx.shadowBlur = 18; ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#f4f4cf'; ctx.beginPath(); ctx.arc((snake[0].x + .5) * tile, (snake[0].y + .5) * tile, tile * .25, 0, Math.PI * 2); ctx.fill();
}
function startSnake() {
    clearInterval(snakeTimer); snake = [{ x: 7, y: 12 }, { x: 6, y: 12 }, { x: 5, y: 12 }, { x: 4, y: 12 }]; direction = { x: 1, y: 0 }; queued = { ...direction }; fruit = { x: 17, y: 12 }; score = 0; scoreNode.textContent = '0'; snakeRunning = true; pauseButton.disabled = false; pauseButton.textContent = 'Pause'; overlayMessage('', '', false); drawSnake(); snakeTimer = setInterval(moveSnake, 105);
}
function pauseSnake() { if (!snakeRunning) return; snakeRunning = false; clearInterval(snakeTimer); pauseButton.textContent = 'Resume'; overlayMessage('A moment to breathe', 'Press resume when you are ready', true); }
function endSnake() { snakeRunning = false; clearInterval(snakeTimer); pauseButton.disabled = true; best = Math.max(best, score); localStorage.setItem(BEST, best); bestNode.textContent = best; submitScore('snake', best); if (activeBoard === 'snake') renderLeaderboard('snake'); overlayMessage('Run complete', `You gathered ${score} light. Start another?`, true); }
function moveSnake() {
    direction = queued; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells) return endSnake();
    const eating = head.x === fruit.x && head.y === fruit.y; const check = eating ? snake : snake.slice(0, -1);
    if (check.some((part) => part.x === head.x && part.y === head.y)) return endSnake();
    snake.unshift(head);
    if (eating) { score += 10; scoreNode.textContent = score; do { fruit = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) }; } while (snake.some((part) => part.x === fruit.x && part.y === fruit.y)); } else snake.pop();
    drawSnake();
}
function steer(which) { const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }; const [x, y] = dirs[which]; if (x !== -direction.x || y !== -direction.y) queued = { x, y }; }
document.getElementById('snakeStart').addEventListener('click', startSnake);
pauseButton.addEventListener('click', () => { if (snakeRunning) pauseSnake(); else if (snake.length) { snakeRunning = true; pauseButton.textContent = 'Pause'; overlayMessage('', '', false); snakeTimer = setInterval(moveSnake, 105); } });
document.querySelectorAll('[data-dir]').forEach((button) => button.addEventListener('click', () => steer(button.dataset.dir)));
document.addEventListener('keydown', (event) => {
    if (activeGame !== 'snake') return;
    const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
    if (keys[event.key]) { event.preventDefault(); steer(keys[event.key]); }
    if (event.key === ' ' && snake.length) { event.preventDefault(); snakeRunning ? pauseSnake() : pauseButton.click(); }
});
let swipe = null;
canvas.addEventListener('pointerdown', (event) => { swipe = [event.clientX, event.clientY]; });
canvas.addEventListener('pointerup', (event) => { if (!swipe) return; const dx = event.clientX - swipe[0], dy = event.clientY - swipe[1]; if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); swipe = null; });
drawSnake();

const upgrades = [
    { id: 'motes', name: 'Gathering Motes', detail: '+1 stardust per second', cost: 25, rate: 1, mark: '01' },
    { id: 'comet', name: 'Comet Foundry', detail: '+6 stardust per second', cost: 140, rate: 6, mark: '02' },
    { id: 'garden', name: 'Star Garden', detail: '+32 stardust per second', cost: 720, rate: 32, mark: '03' },
    { id: 'engine', name: 'Gravity Engine', detail: '+180 stardust per second', cost: 3600, rate: 180, mark: '04' }
];
const research = [
    { id: 'click', name: 'Focused Light', detail: '+1 stardust per click per level', costs: [1, 2, 3, 5, 8], mark: '✦' },
    { id: 'production', name: 'Stellar Engines', detail: '+25% production per level', costs: [1, 2, 3, 5, 8], mark: '↗' },
    { id: 'discount', name: 'Frugal Orbits', detail: '−5% upgrade costs per level', costs: [1, 2, 3, 5, 8], mark: '◇' }
];
let saved = {};
try { saved = JSON.parse(localStorage.getItem(SAVE)) || {}; } catch { saved = {}; }
const cosmic = {
    dust: Number(saved.dust) || 0,
    lifetime: Number(saved.lifetime) || Number(saved.dust) || 0,
    rebirths: Number(saved.rebirths) || 0,
    essence: Math.max(0, Math.floor(Number(saved.essence) || 0)),
    owned: Object.fromEntries(upgrades.map((u) => [u.id, Number(saved.owned?.[u.id]) || 0])),
    research: Object.fromEntries(research.map((item) => [item.id, Math.min(item.costs.length, Math.max(0, Math.floor(Number(saved.research?.[item.id]) || 0)))]))
};
const dustNode = document.getElementById('dust');
const rateNode = document.getElementById('rate');
const upgradeList = document.getElementById('upgrades');
const rebirthButton = document.getElementById('rebirth');
upgradeList.insertAdjacentHTML('afterend', '<section class="prestige-research" aria-labelledby="researchTitle"><header><div><small class="eyebrow">PERMANENT BONUSES</small><h3 id="researchTitle">Cosmic research</h3></div><span id="essenceBalance">0 essence</span></header><div id="researchList" class="research-list"></div></section>');
const researchList = document.getElementById('researchList');
let cosmosTimer = 0;
const compact = (n) => n < 1000000 ? Math.floor(n).toLocaleString() : `${(n / 1e6).toFixed(2)}m`;
const multiplier = () => 1 + cosmic.rebirths * .5;
const clickGain = () => 1 + cosmic.rebirths + cosmic.research.click;
const production = () => upgrades.reduce((sum, u) => sum + cosmic.owned[u.id] * u.rate, 0) * multiplier() * (1 + cosmic.research.production * .25);
const costFor = (u) => Math.max(1, Math.floor(u.cost * Math.pow(1.17, cosmic.owned[u.id]) * (1 - cosmic.research.discount * .05)));
const rebirthCost = () => Math.floor(1500 * Math.pow(2.15, cosmic.rebirths));
const essenceForAscension = () => 1 + Math.floor(Math.log2(cosmic.dust / rebirthCost()));
function saveCosmos() { try { localStorage.setItem(SAVE, JSON.stringify(cosmic)); } catch {} }
function setCosmosTimer() {
    clearInterval(cosmosTimer);
    cosmosTimer = 0;
    if (document.hidden || activeGame !== 'clicker' || clickerView.hidden) return;
    cosmosTimer = setInterval(() => {
        const gain = production();
        if (!gain) return;
        cosmic.dust += gain;
        cosmic.lifetime += gain;
        renderCosmos();
        saveCosmos();
        syncCosmosRecord();
    }, 1000);
}
let lastCosmosSubmission = 0;
function syncCosmosRecord() {
    if (!cosmic.lifetime) return;
    if (Date.now() - lastCosmosSubmission < 15_000) return;
    lastCosmosSubmission = Date.now();
    submitScore('cosmos', cosmic.lifetime, cosmic.rebirths);
}
function renderCosmos() {
    dustNode.textContent = compact(cosmic.dust); rateNode.textContent = `${compact(production())} per second`;
    document.getElementById('rebirthLabel').textContent = cosmic.rebirths ? `${cosmic.rebirths} ${cosmic.rebirths === 1 ? 'star' : 'stars'} gathered` : 'No stars gathered';
    document.getElementById('rebirthCost').textContent = `${compact(rebirthCost())} ✦`;
    document.getElementById('rebirthHint').textContent = `Reset stardust and upgrades for ${essenceForAscension()} essence. Research and its bonuses stay forever.`;
    rebirthButton.disabled = cosmic.dust < rebirthCost();
    document.getElementById('ownedCount').textContent = `${Object.values(cosmic.owned).reduce((a, b) => a + b, 0)} owned`;
    upgradeList.innerHTML = upgrades.map((u) => { const price = costFor(u); return `<button class="upgrade-row" data-upgrade="${u.id}" ${cosmic.dust < price ? 'disabled' : ''}><span class="upgrade-mark">${u.mark}</span><span class="upgrade-copy"><strong>${u.name}</strong><small>${u.detail} · ${cosmic.owned[u.id]} owned</small></span><span class="upgrade-price">${compact(price)} <i>✦</i></span></button>`; }).join('');
    upgradeList.querySelectorAll('[data-upgrade]').forEach((button) => button.addEventListener('click', () => { const u = upgrades.find((item) => item.id === button.dataset.upgrade); const price = costFor(u); if (cosmic.dust < price) return; cosmic.dust -= price; cosmic.owned[u.id] += 1; renderCosmos(); saveCosmos(); }));
    document.getElementById('essenceBalance').textContent = `${compact(cosmic.essence)} essence`;
    researchList.innerHTML = research.map((item) => {
        const level = cosmic.research[item.id];
        const cost = item.costs[level];
        return `<button class="research-row" data-research="${item.id}" ${cost === undefined || cosmic.essence < cost ? 'disabled' : ''}><span class="research-mark">${item.mark}</span><span class="upgrade-copy"><strong>${item.name}</strong><small>${item.detail} · ${level}/${item.costs.length}</small></span><span class="upgrade-price">${cost === undefined ? 'MAX' : `${cost} essence`}</span></button>`;
    }).join('');
    researchList.querySelectorAll('[data-research]').forEach((button) => button.addEventListener('click', () => {
        const item = research.find((entry) => entry.id === button.dataset.research);
        const level = cosmic.research[item.id];
        const cost = item.costs[level];
        if (cost === undefined || cosmic.essence < cost) return;
        cosmic.essence -= cost;
        cosmic.research[item.id] += 1;
        renderCosmos();
        saveCosmos();
    }));
}
document.getElementById('core').addEventListener('click', (event) => {
    const gain = clickGain(); cosmic.dust += gain; cosmic.lifetime += gain;
    const pop = document.createElement('i'); pop.className = 'click-pop'; pop.textContent = `+${gain}`; pop.style.left = `${event.offsetX}px`; pop.style.top = `${event.offsetY}px`; event.currentTarget.append(pop); setTimeout(() => pop.remove(), 700);
    renderCosmos(); saveCosmos(); syncCosmosRecord();
});
rebirthButton.addEventListener('click', () => {
    if (cosmic.dust < rebirthCost()) return;
    cosmic.essence += essenceForAscension();
    cosmic.dust = 0;
    cosmic.rebirths += 1;
    cosmic.owned = Object.fromEntries(upgrades.map((u) => [u.id, 0]));
    renderCosmos();
    saveCosmos();
    syncCosmosRecord();
});
renderCosmos();
renderLeaderboard(activeBoard);
syncCosmosRecord();
import('./arcade-games.js')
    .then(() => import('./web-games.js'))
    .catch((error) => console.error('Arcade modules failed to load', error));
