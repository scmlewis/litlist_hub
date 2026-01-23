# BookShelf Vibe - Project Spec for VS Code Cursor Agent

**Overview**: Build a full-stack book list app using Cloudflare Pages + D1 database + OAuth. Users can add books from Goodreads API, mark status (reading/want-to-read/done), and share lists. Target: Deployable MVP in 1-2 days for Vibe Coding Step 3.

## Tech Stack
- Frontend: React/Next.js (via Cloudflare Pages)
- Backend: Cloudflare Workers/Pages Functions
- Database: Cloudflare D1 (SQLite)
- Auth: GitHub/Google OAuth
- External API: Goodreads API (for book search/add)
- Storage: Optional R2 for book covers [developers.cloudflare](https://developers.cloudflare.com/d1/platform/pricing/)

## Data Model (D1 Schema)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  github_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  author TEXT,
  status TEXT CHECK(status IN ('want', 'reading', 'done')),
  notes TEXT,
  goodreads_id TEXT,
  cover_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
Simple CRUD on books per user. [developers.cloudflare](https://developers.cloudflare.com/d1/platform/pricing/)

## Core Features
1. **Auth**: GitHub login button → redirect to dashboard. Store user in D1.
2. **Dashboard**: List user's books in table (title, author, status, notes). Add/Edit/Delete buttons.
3. **Add Book**: Search bar calls Goodreads API → select book → auto-fill title/author/cover → save to D1 with status dropdown.
4. **Edit/View**: Click book → modal to update status/notes/cover URL.
5. **Share**: Public link to user's book list (read-only, no auth). [stingtao](https://stingtao.info/posts/%E5%AD%B8-vibe-coding%EF%BC%8C%E8%A6%81%E9%81%B8%E4%BB%80%E9%BA%BC%E9%A1%8C%E7%9B%AE%E9%96%8B%E5%A7%8B-1/)
6. **Responsive UI**: Mobile-friendly, clean design (use Tailwind CSS).

## API Endpoints (Workers/Pages Functions)
- `POST /api/auth`: Handle OAuth callback, insert user.
- `GET /api/books`: Fetch user's books (query by user_id).
- `POST /api/books`: Add new book.
- `PUT /api/books/:id`: Update book.
- `DELETE /api/books/:id`: Delete.
- `GET /api/public/:user_id`: Public book list. [developers.cloudflare](https://developers.cloudflare.com/d1/platform/pricing/)

## Deployment Steps
1. Init Next.js app in VS Code.
2. Bind D1 database in Cloudflare dashboard (wrangler.toml).
3. Add OAuth env vars.
4. Deploy to Cloudflare Pages via GitHub.
5. Test: Login → Add book → Share link. [developers.cloudflare](https://developers.cloudflare.com/pages/functions/pricing/)

## Prompt for Cursor Agent
"Follow this spec exactly: Build BookShelf Vibe app. Start with Next.js setup, add D1 schema, implement auth with GitHub OAuth, Goodreads search, CRUD books. Use Tailwind. Deploy-ready for Cloudflare. Generate all code step-by-step." [stingtao](https://stingtao.info/posts/%E5%AD%B8-vibe-coding%EF%BC%8C%E8%A6%81%E9%81%B8%E4%BB%80%E9%BA%BC%E9%A1%8C%E7%9B%AE%E9%96%8B%E5%A7%8B-1/)

Copy-paste this spec directly to Cursor in VS Code for generation. Iterate by pasting errors or "add feature X".