import { createServer } from 'node:http';
import { createReadStream, mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';

const root = fileURLToPath(new URL('.', import.meta.url));
const dataDirectory = process.env.DATA_DIRECTORY || join(root, 'data');
mkdirSync(dataDirectory, { recursive: true });
const database = new DatabaseSync(join(dataDirectory, 'arcade.sqlite'));
database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scores (
        game TEXT NOT NULL,
        player TEXT NOT NULL COLLATE NOCASE,
        score INTEGER NOT NULL,
        rebirths INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (game, player)
    );
`);

const server = createServer(handleRequest);
const sockets = new WebSocketServer({ noServer: true, maxPayload: 2048 });
const requestBuckets = new Map();
const chatBuckets = new Map();
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' };
const configuredOrigins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean));

function originAllowed(origin, requestHost) {
    try {
        const page = new URL(origin);
        const backend = new URL(`http://${requestHost}`).hostname;
        if (page.host === requestHost || configuredOrigins.has(page.origin)) return true;
        if (['localhost', '127.0.0.1'].includes(page.hostname) && page.hostname === backend) return true;
        return page.hostname.endsWith('.app.github.dev')
            && page.hostname.replace(/-\d+\.app\.github\.dev$/, '-3000.app.github.dev') === backend;
    } catch {
        return false;
    }
}

function clientAddress(request) {
    return request.headers['x-forwarded-for']?.split(',')[0].trim() || request.socket.remoteAddress || 'unknown';
}

function checkRate(map, key, limit, windowMs) {
    const now = Date.now();
    const recent = (map.get(key) || []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) return false;
    recent.push(now);
    map.set(key, recent);
    return true;
}

function cleanText(value, maxLength) {
    return typeof value === 'string'
        ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
        : '';
}

function sendJson(response, status, value) {
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify(value));
}

async function readJson(request) {
    let body = '';
    for await (const chunk of request) {
        body += chunk;
        if (body.length > 4096) throw new Error('Request body too large');
    }
    return JSON.parse(body || '{}');
}

async function handleRequest(request, response) {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const address = clientAddress(request);
    const origin = request.headers.origin;

    if (origin && originAllowed(origin, request.headers.host || 'localhost')) {
        response.setHeader('access-control-allow-origin', origin);
        response.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
        response.setHeader('access-control-allow-headers', 'content-type');
        response.setHeader('vary', 'Origin');
    }
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
        if (!origin || !originAllowed(origin, request.headers.host || 'localhost')) return sendJson(response, 403, { error: 'Origin not allowed.' });
        response.writeHead(204);
        response.end();
        return;
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
        return sendJson(response, 200, { ok: true });
    }
    if (url.pathname === '/api/chat' && request.method === 'GET') {
        const messages = database.prepare('SELECT id, player, message, created_at AS time FROM chat_messages ORDER BY id DESC LIMIT 80').all().reverse();
        return sendJson(response, 200, { messages });
    }
    if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
        const game = url.searchParams.get('game');
        if (!['snake', 'cosmos'].includes(game)) return sendJson(response, 400, { error: 'Choose snake or cosmos.' });
        const rows = database.prepare('SELECT player, score, rebirths, updated_at FROM scores WHERE game = ? ORDER BY score DESC, updated_at ASC LIMIT 25').all(game);
        return sendJson(response, 200, { game, rows });
    }
    if (url.pathname === '/api/chat' && request.method === 'POST') {
        if (!checkRate(requestBuckets, `${address}:chat`, 8, 10_000)) return sendJson(response, 429, { error: 'Slow down a little before sending another message.' });
        let body;
        try { body = await readJson(request); } catch { return sendJson(response, 400, { error: 'Invalid message.' }); }
        const player = cleanText(body.player, 20);
        const message = cleanText(body.message, 240);
        if (!player || !message) return sendJson(response, 400, { error: 'Add a name and a message.' });
        const createdAt = Date.now();
        const result = database.prepare('INSERT INTO chat_messages (player, message, created_at) VALUES (?, ?, ?)').run(player, message, createdAt);
        database.prepare('DELETE FROM chat_messages WHERE id NOT IN (SELECT id FROM chat_messages ORDER BY id DESC LIMIT 80)').run();
        const savedMessage = { id: Number(result.lastInsertRowid), player, message, time: createdAt };
        broadcast({ type: 'chat', message: savedMessage });
        return sendJson(response, 201, { message: savedMessage });
    }
    if (url.pathname === '/api/scores' && request.method === 'POST') {
        if (!checkRate(requestBuckets, `${address}:scores`, 12, 60_000)) return sendJson(response, 429, { error: 'Too many score updates. Try again shortly.' });
        let body;
        try { body = await readJson(request); } catch { return sendJson(response, 400, { error: 'Invalid score.' }); }
        const game = body.game;
        const player = cleanText(body.player, 20);
        const score = Number(body.score);
        const rebirths = Number(body.rebirths) || 0;
        if (!['snake', 'cosmos'].includes(game) || !player || !Number.isSafeInteger(score) || score < 0 || score > 1_000_000_000_000 || !Number.isSafeInteger(rebirths) || rebirths < 0 || rebirths > 1_000_000) {
            return sendJson(response, 400, { error: 'Score details are not valid.' });
        }
        database.prepare(`INSERT INTO scores (game, player, score, rebirths, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (game, player) DO UPDATE SET
                score = MAX(scores.score, excluded.score),
                rebirths = MAX(scores.rebirths, excluded.rebirths),
                updated_at = excluded.updated_at`).run(game, player, score, rebirths, Date.now());
        const row = database.prepare('SELECT player, score, rebirths, updated_at FROM scores WHERE game = ? AND player = ?').get(game, player);
        return sendJson(response, 200, { row });
    }
    if (url.pathname.startsWith('/api/')) return sendJson(response, 404, { error: 'Not found.' });

    const staticFiles = new Map([
        ['/', 'index.html'],
        ['/index.html', 'index.html'],
        ['/arcade.css', 'arcade.css'],
        ['/arcade.js', 'arcade.js'],
        ['/arcade-games.js', 'arcade-games.js'],
        ['/web-games.js', 'web-games.js'],
        ['/site-logo.svg', 'site-logo.svg'],
        ['/site-logo.jpg', 'site-logo.jpg'],
        ['/classroom-background.jpg', 'classroom-background.jpg'],
        ['/assets/game-covers/granny-1.png', 'assets/game-covers/granny-1.png'],
        ['/assets/game-covers/fnaf-2.jpg', 'assets/game-covers/fnaf-2.jpg'],
        ['/assets/game-covers/fnaf-3.jpg', 'assets/game-covers/fnaf-3.jpg'],
        ['/assets/game-covers/fnaf-4.jpg', 'assets/game-covers/fnaf-4.jpg'],
        ['/assets/game-covers/fnaf-sister-location.jpg', 'assets/game-covers/fnaf-sister-location.jpg'],
        ['/assets/game-covers/fnaf-ucn.jpg', 'assets/game-covers/fnaf-ucn.jpg'],
        ['/assets/game-covers/thats-not-my-neighbor.jpg', 'assets/game-covers/thats-not-my-neighbor.jpg'],
        ['/assets/game-covers/bendy.jpg', 'assets/game-covers/bendy.jpg']
    ]);
    const file = staticFiles.get(url.pathname);
    if (!file || request.method !== 'GET') {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
    }
    const filePath = resolve(root, file);
    response.writeHead(200, { 'content-type': mimeTypes[extname(filePath)], 'x-content-type-options': 'nosniff', 'cache-control': 'no-store' });
    createReadStream(filePath).pipe(response);
}

function broadcast(payload) {
    const serialized = JSON.stringify(payload);
    sockets.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(serialized);
    });
}

server.on('upgrade', (request, socket, head) => {
    const origin = request.headers.origin;
    const host = request.headers.host;
    if (request.url !== '/ws' || (origin && !originAllowed(origin, host))) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }
    sockets.handleUpgrade(request, socket, head, (client) => sockets.emit('connection', client, request));
});

sockets.on('connection', (client, request) => {
    const address = clientAddress(request);
    const messages = database.prepare('SELECT id, player, message, created_at AS time FROM chat_messages ORDER BY id DESC LIMIT 80').all().reverse();
    client.send(JSON.stringify({ type: 'history', messages }));
    client.on('message', (raw, isBinary) => {
        if (isBinary || !checkRate(chatBuckets, address, 6, 10_000)) return;
        let body;
        try { body = JSON.parse(raw.toString()); } catch { return; }
        const player = cleanText(body.player, 20);
        const message = cleanText(body.message, 240);
        if (!player || !message) return;
        const createdAt = Date.now();
        const result = database.prepare('INSERT INTO chat_messages (player, message, created_at) VALUES (?, ?, ?)').run(player, message, createdAt);
        database.prepare('DELETE FROM chat_messages WHERE id NOT IN (SELECT id FROM chat_messages ORDER BY id DESC LIMIT 80)').run();
        broadcast({ type: 'chat', message: { id: Number(result.lastInsertRowid), player, message, time: createdAt } });
    });
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => console.log(`Rice Arcade listening on port ${port}`));