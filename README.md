# Frontend
React frontend (built with [Next.js](https://nextjs.org)) for the [InteractLLM backend](https://github.com/INTERACT-LLM/backend). Together, they make up the InteractLLM proof-of-concept:

  <img src="docs/screenshots/lessons-page.png" alt="chat" width="1000" />

## 🌟 Overview

The application code lives under `src/`. Top-level folders:

| 📁 Folder | Description | More Info |
| --- | --- | --- |
| `app` | Next.js App Router entry. Route groups, layouts, server-side API handlers, and global styles. | [README](/src/app/README.md) |
| `components` | All React UI components: chat panes, lesson grids, modals, banners, headers, and so on. | [README](/src/components/README.md) |
| `context` | React Context providers for cross-cutting state (LLM config, user profile). | |
| `hooks` | Custom React hooks for streaming chat, auto-scroll, auto-resize, and game logic (Tabú, 20 Questions). | |
| `lib` | Client utilities: API endpoint definitions (`api.js`) & JWT gate-token helpers (`gate-token.js`). | |

`proxy.js` (at the project root) handles request forwarding to the backend during local development.

## 🛠️ Technical Requirements

Developed against Node.js 20+. Built with Next.js (App Router, `src/` directory) and React 19.

### Project Setup

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

The frontend expects the backend to be running and reachable at the URL configured in `.env.local` (see below).

### Environment Configuration

The frontend reads a few environment variables. All have fallbacks or are only required when the password gate is enabled. Create a `.env.local` in the project root if you need to override anything.

#### Backend URL
You can optionally set this if you wish to serve from somewhere else:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```
> If omitted, `lib/api.js` falls back to `http://localhost:8000`, which works automatically when the frontend and backend are deployed on the same server. Override this only when the backend lives elsewhere.

> Note: `NEXT_PUBLIC_*` variables are set `npm run build` time, not read at runtime. Rebuild after changing the value.

#### Prototype Access Gate
The app sits behind a password gate (see `lib/gate-token.js` and the login flow). Two variables are required for the gate to work:

```ini
PROTOTYPE_PASSWORD=your-shared-password
GATE_SECRET=your-long-random-secret
```

> `PROTOTYPE_PASSWORD` is the shared password users enter on the login page. `GATE_SECRET` signs the 48-hour JWT issued after a successful login. Both are server-side only and never exposed to the browser. Pick a long, random `GATE_SECRET` and keep it stable across restarts; rotating it invalidates all existing gate tokens.

## 🚀 Build and Deploy

```bash
npm run build
npm run start
```

The production build is deployed alongside the backend on a Linux server, managed by PM2. See the deploy scripts in the server (not pushed here).