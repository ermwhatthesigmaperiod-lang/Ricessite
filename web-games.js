const clientEntries = [
    { name: 'Granny 2', version: 'GAME', category: 'games', url: 'https://granny-games.com/embed/granny-2?pub_id=ca-pub-5636557392151555&preroll=0', cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRALX-sKIN4NgdS7FmdtWT5cdmdPGMPuZND1P1WmtZteQ&s' },
    { name: 'FNAF 1', version: 'GAME', category: 'games', url: 'https://dorukyum.github.io/FNAF-Web/', cover: 'https://dorukyum.github.io/FNAF-Web/icon-512x512.png' },
    { name: 'Granny 1', version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/granny.html', cover: '/assets/game-covers/granny-1.png' },
    { name: 'FNAF 2', version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/fnaf2.html', cover: '/assets/game-covers/fnaf-2.jpg' },
    { name: 'FNAF 3', version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/fnaf3.html', cover: '/assets/game-covers/fnaf-3.jpg' },
    { name: 'FNAF 4', version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/fnaf4.html', cover: '/assets/game-covers/fnaf-4.jpg' },
    { name: 'FNAF: Sister Location', version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/fnafsl.html', cover: '/assets/game-covers/fnaf-sister-location.jpg' },
    { name: 'FNAF UCN', version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/fnafucn.html', cover: '/assets/game-covers/fnaf-ucn.jpg' },
    { name: "That's Not My Neighbor", version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/notmyneighbour.html', cover: '/assets/game-covers/thats-not-my-neighbor.jpg' },
    { name: 'Bendy and the Ink Machine', version: 'GAME', category: 'games', url: 'https://harshulmoon.github.io/iframes/batim.html', cover: '/assets/game-covers/bendy.jpg' },
    { name: 'Eaglercraft 26.3 Music', version: '26.3', category: 'newer', url: 'https://dicestack88.github.io/files/eaglercraft-26.2-r46-music.html' },
    { name: 'Eaglercraft 26.2', version: '26.2', category: 'newer', url: 'https://dicestack88.github.io/files/26.2.html' },
    { name: 'Eaglercraft 1.21.11 WASM', version: '1.21.11', category: 'newer', url: 'https://dicestack88.github.io/files/1.21.11-wasm.html' },
    { name: 'Eaglercraft 1.20.6 WASM', version: '1.20.6', category: 'newer', url: 'https://dicestack88.github.io/files/1.20.6-wasm.html' },
    { name: 'EaglercraftX 1.16 WASM-GC', version: '1.16', category: 'newer', url: 'https://dicestack88.github.io/files/EaglercraftX_1.16_WASM-GC_Offline_Download.html' },
    { name: 'Eaglercraft 1.14.4 WASM-GC', version: '1.14', category: 'newer', url: 'https://dicestack88.github.io/files/Eaglercraft_1.14.4_WASM-GC_Offline_Download.html' },
    { name: 'Chromium Client', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/ChromiumClient/ChromiumLauncher.html' },
    { name: 'EB Client', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/EBClient' },
    { name: 'Reflex 1.8 WASM-GC', version: '1.8', category: 'clients', url: 'https://dicestack88.github.io/files/Reflex-0.0.2-1.8_WASM-GC_Offline_Download.html' },
    { name: 'Modern Client', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/modernclient' },
    { name: 'Stratus U2', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/files/Stratus_U2.html' },
    { name: 'Tuff Client', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/Tuffclient' },
    { name: 'Resent Client', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/Resentclient' },
    { name: 'Aero Client', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/AeroClient' },
    { name: 'Precision Offline', version: 'CLIENT', category: 'clients', url: 'https://dicestack88.github.io/PrecisionOffline.html' },
    { name: 'Eaglercraft Launcher', version: 'LAUNCHER', category: 'launchers', url: 'https://dicestack88.github.io/files/launcher.html' },
    { name: 'Voltan Launcher', version: 'LAUNCHER', category: 'launchers', url: 'https://dicestack88.github.io/files/voltan-launcher.html' }
];

const clientGroups = [
    {
        id: 'newer',
        title: 'Newer version clients (26.3, 26.2, 1.21.11, 1.20.6, 1.16, 1.14)',
        description: 'Special clients (maybe buggy) that run on newer versions. Proceed with caution.'
    },
    { id: 'clients', title: 'Other clients', description: 'More browser clients from the links you sent.' },
    { id: 'launchers', title: 'Launchers', description: 'Browser-based launch pages.' }
];

const clientsView = document.getElementById('clientsView');
clientsView.innerHTML = `
    <div class="page-heading clients-heading"><div><small class="eyebrow">EAGLERCRAFT CLIENTS</small><h1>Eaglercraft Clients<span>.</span></h1><p>Choose a link to open it in an embedded window.</p></div><span class="local-label">${clientEntries.filter((entry) => entry.category !== 'games').length} LINKS</span></div>
    <div class="client-groups">${clientGroups.map((group) => `<section class="client-group" aria-labelledby="group-${group.id}"><header><div><h2 id="group-${group.id}">${group.title}</h2><p>${group.description}</p></div></header><div class="client-grid">${clientEntries.filter((entry) => entry.category === group.id).map((entry) => { const index = clientEntries.indexOf(entry); return `<button type="button" class="client-card" data-client="${index}"><span class="client-version">${entry.version}</span><strong>${entry.name}</strong><small>Open embedded window <b>↗</b></small></button>`; }).join('')}</div></section>`).join('')}</div>`;

const externalGameCards = [
    { index: 2, number: '11', mark: 'G1', note: 'Find a way out. Do not get caught.', tag: 'HORROR' },
    { index: 0, number: '12', mark: 'G2', note: 'Escape the house. Avoid Granny and Grandpa.', tag: 'HORROR' },
    { index: 1, number: '13', mark: 'F1', note: 'Make it through five nights.', tag: 'HORROR' },
    { index: 3, number: '14', mark: 'F2', note: 'Watch the halls. Keep the music box wound.', tag: 'HORROR' },
    { index: 4, number: '15', mark: 'F3', note: 'Monitor the vents. Keep Springtrap at bay.', tag: 'HORROR' },
    { index: 5, number: '16', mark: 'F4', note: 'Listen carefully. Survive the night.', tag: 'HORROR' },
    { index: 6, number: '17', mark: 'SL', note: 'Follow instructions. Stay alert.', tag: 'HORROR' },
    { index: 7, number: '18', mark: 'UCN', note: 'Survive the night. Customize your challenge.', tag: 'HORROR' },
    { index: 8, number: '19', mark: 'TN', note: 'Check their papers. Spot the impostor.', tag: 'HORROR' },
    { index: 9, number: '20', mark: 'BATIM', note: 'Solve puzzles. Escape the ink.', tag: 'HORROR' }
];
document.querySelector('.arcade-game-grid').insertAdjacentHTML('beforeend', externalGameCards.map(({ index, number, mark, note, tag }, cardIndex) => {
    const game = clientEntries[index];
    return `<button type="button" class="arcade-game-card external-game-card full-color-${cardIndex + 8}" data-client="${index}" data-client-return="games"><span class="mini-card-top"><i>${number}</i><b>${mark}</b></span><img class="game-preview game-cover" src="${game.cover}" alt="" loading="lazy"><strong>${game.name}</strong><span class="mini-note">${note}</span><small>${tag}</small><span class="game-best">EXTERNAL GAME</span></button>`;
}).join(''));

document.querySelector('.arcade-main').insertAdjacentHTML('beforeend', `
    <section id="webGameView" class="web-game-view" hidden>
        <div class="game-toolbar"><button id="webGameBack" class="back-button" type="button">← Eaglercraft Clients</button><span id="webGameCategory">CLIENT WINDOW</span><button id="webGameFullscreen" class="full-button" type="button" title="Fullscreen" aria-label="Fullscreen">⛶</button></div>
        <div class="web-game-heading"><div><small id="webGameType">EXTERNAL CLIENT</small><h1 id="webGameTitle"></h1></div><a id="webGameNewTab" href="#" target="_blank" rel="noopener noreferrer">Open in new tab ↗</a></div>
        <div class="web-window"><div class="web-window-bar"><span class="window-lights"><i></i><i></i><i></i></span><span id="webGameAddress"></span><span class="window-mark">RICE ARCADE</span></div><iframe id="webGameFrame" title="External client" allow="fullscreen; gamepad; pointer-lock" allowfullscreen loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"></iframe></div>
        <p id="webGameNote" class="web-game-note">External site. If it stays blank, that site may block embedding; use “Open in new tab”.</p>
    </section>`);

const webView = document.getElementById('webGameView');
const webFrame = document.getElementById('webGameFrame');
let activeClient = null;
let activeReturnPage = 'clients';
function closeWebGame() {
    if (!activeClient) return;
    if (document.fullscreenElement) document.exitFullscreen();
    webFrame.src = 'about:blank';
    webView.hidden = true;
    activeClient = null;
}
function openWebGame(index, returnPage = 'clients') {
    window.closeExtraGame?.();
    closeWebGame();
    const client = clientEntries[index];
    if (!client) return;
    activeClient = client;
    activeReturnPage = returnPage;
    document.querySelectorAll('.arcade-main > section').forEach((section) => { section.hidden = section.id !== 'webGameView'; });
    document.querySelector('.site-tabs').hidden = true;
    document.getElementById('webGameTitle').textContent = client.name;
    document.getElementById('webGameCategory').textContent = client.category === 'games' ? 'BROWSER GAME' : `CLIENT / ${client.version}`;
    document.getElementById('webGameType').textContent = client.category === 'games' ? 'EXTERNAL GAME' : 'EXTERNAL CLIENT';
    document.getElementById('webGameBack').textContent = `← ${returnPage === 'games' ? 'Games' : 'Eaglercraft Clients'}`;
    document.getElementById('webGameAddress').textContent = new URL(client.url).host;
    document.getElementById('webGameNewTab').href = client.url;
    document.getElementById('webGameNote').textContent = 'External site. If it stays blank, that site may block embedding; use “Open in new tab”.';
    webView.hidden = false;
    webFrame.src = client.url;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.closeWebGame = closeWebGame;
document.querySelectorAll('[data-client]').forEach((button) => button.addEventListener('click', () => openWebGame(Number(button.dataset.client), button.dataset.clientReturn || 'clients')));
document.getElementById('webGameBack').addEventListener('click', () => {
    const returnPage = activeReturnPage;
    closeWebGame();
    document.querySelector(`.site-tabs [data-page="${returnPage}"]`).click();
});
document.getElementById('webGameFullscreen').addEventListener('click', async () => {
    try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await webFrame.requestFullscreen();
    } catch {
        document.getElementById('webGameNote').textContent = 'Fullscreen is not available here. Try opening the client in a new tab.';
    }
});
