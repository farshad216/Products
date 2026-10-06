# Sniper 1v1

Tiny first-person 1v1 sniper prototype. One Node process, one HTML page, no game engine, no `node_modules`, no downloaded assets.

## Run

```bash
node server.js
```

Or `npm start`. Then open http://localhost:8080 in two browser tabs.

1. Tab A: **Host Game** and read the room code.
2. Tab B: enter that code and **Join Game**.

A third player is rejected. Set `PORT` to change the listen port (default `8080`).

## Controls

Click the view to capture the mouse. WASD move, mouse look, left click shoot, right click hold to scope, R reload, Space jump.

## Rules

100 HP. 5 rounds, reload about 1.2s (no firing while reloading). Headshot kills, body shot deals 50. Respawn at your spawn after 3s with full HP and a full magazine. Match lasts 5 minutes. One kill is one point. Highest score wins; equal scores draw. The server decides hits, damage, kills, respawn, and the clock.

## Size

Browser WebGL (one flat-color shader) and a WebSocket handshake written with Node's `http` and `crypto` modules. Source is a handful of small files and stays well under 200 KB.
