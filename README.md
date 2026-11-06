# Rice Arcade

## Run locally

Requires Node.js 24.

```sh
npm install
npm start
```

Open `http://localhost:3000`. The Node server serves the site, live chat, and score API. SQLite data is stored in `data/arcade.sqlite` by default; set `DATA_DIRECTORY` to change the database directory.
VS Code labels the forwarded port `Rice Arcade`. Codespaces generates the hostname; this project can’t rename the `petrifying-haunting` portion. A permanent public URL requires deploying the Node service to a host.

## Deploy for other players

Deploy this repository as a Node.js 24 web service, not as static files. The host must allow WebSocket upgrades and provide a persistent disk. Mount that disk as `DATA_DIRECTORY` so chat and scores survive restarts. The app listens on the host-provided `PORT`.

Chat and leaderboards are shared by everyone connected to the same deployed service. Chat keeps the most recent 80 messages. Use a nickname and do not post personal information. Score submissions are rate-limited and validated, but they are not authenticated or cheat-proof.

SQLite is intended for one running server instance. Multiple server replicas need a shared database such as PostgreSQL before scaling out.
For local previews, open `http://localhost:3000`; VS Code labels the forwarded port `Rice Arcade`.
Game best scores and play counts are saved in this browser under a stable, versioned storage key, so adding or updating site files does not reset them. Clearing this browser's site data will remove local progress.
Use the same browser profile to keep seeing your saved records.

