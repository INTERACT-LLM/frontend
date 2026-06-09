# Environment Setup
The frontend reads a few environment variables. All have fallbacks or are only required when the password gate is enabled. 

-> Create a `.env.local` in the project root if needed

## Backend URL
You can optionally set this if you wish to serve from somewhere else:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```
> If omitted, `lib/api.js` falls back to `http://localhost:8000`, which works automatically when the frontend and backend are deployed on the same server. Override this only when the backend lives elsewhere.

> Note: `NEXT_PUBLIC_*` variables are set `npm run build` time, not read at runtime. Rebuild after changing the value.

## Prototype Access Gate
The app sits behind a password gate (see `lib/gate-token.js` and the login flow). Two variables are required for the gate to work:

```ini
PROTOTYPE_PASSWORD=your-shared-password
GATE_SECRET=your-long-random-secret
```

> `PROTOTYPE_PASSWORD` is the shared password users enter on the login page. `GATE_SECRET` signs the 48-hour JWT issued after a successful login. Both are server-side only and never exposed to the browser. Pick a long, random `GATE_SECRET` and keep it stable across restarts!
