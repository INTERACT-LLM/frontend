`app/` is organised with route groups to separate authenticated and unauthenticated areas:

| 📁 Folder | Purpose |
| --- | --- |
| `(app)` | Authenticated routes: the main application surface (lessons, free chat, lesson preview, completion). |
| `(auth)` | Authentication routes: login flow and gate token exchange. |
| `api` | Server-side route handlers (Next.js API routes). Primarily the connection to the FastAPI backend; endpoint URLs are defined in [`../lib/api.js`](../lib/api.js). |
| `login` | The login page entry point (beyond prototype gate) |
| `layout.js` | Root layout. Wraps the app in providers (theme, user, LLM config). |
| `globals.css` | Global styles and the CSS design-token system (theme variables, dark mode). |

