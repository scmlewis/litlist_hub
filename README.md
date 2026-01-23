# BookShelf Vibe

A full-stack book tracking application built with Next.js, Cloudflare Pages, D1 Database, and GitHub OAuth. Track your reading journey, organize your books by status, and share your collection with others.

## Features

- 📚 **Book Management**: Add, edit, and delete books in your personal library
- 🔍 **Book Search**: Search and add books using Google Books API with automatic cover images
- 📊 **Reading Status**: Track books as "Want to Read", "Reading", or "Done"
- 📝 **Notes**: Add personal notes to each book
- 🔐 **GitHub Authentication**: Secure login with GitHub OAuth
- 🔗 **Public Sharing**: Generate shareable links to your book collection
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- ⚡ **Edge Runtime**: Fast, globally distributed with Cloudflare Pages Functions

## Tech Stack

- **Frontend**: Next.js (Pages Router), React, Tailwind CSS
- **Backend**: Cloudflare Pages Functions (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: GitHub OAuth with JWT sessions
- **API**: Google Books API for book search
- **Deployment**: Cloudflare Pages

## Prerequisites

- Node.js 18+ installed
- Cloudflare account
- GitHub account
- Wrangler CLI installed globally: `npm install -g wrangler`

## Local Development Setup

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd LitList_Hub
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in the values:

- **GITHUB_CLIENT_ID** & **GITHUB_CLIENT_SECRET**: 
  1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
  2. Create a new OAuth App
  3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback`
  4. Copy the Client ID and generate a Client Secret

- **JWT_SECRET**: Generate a random secret:
  \`\`\`bash
  openssl rand -base64 32
  \`\`\`

- **NEXT_PUBLIC_BASE_URL**: Set to `http://localhost:3000` for local development

### 4. Create D1 Database

\`\`\`bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create bookshelf-vibe-db
\`\`\`

Copy the database ID from the output and update `wrangler.toml`:

\`\`\`toml
[[d1_databases]]
binding = "DB"
database_name = "bookshelf-vibe-db"
database_id = "your-database-id-here"
\`\`\`

### 5. Run Database Migration

\`\`\`bash
wrangler d1 execute bookshelf-vibe-db --file=schema.sql
\`\`\`

### 6. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## Production Deployment

### 1. Create Production D1 Database

\`\`\`bash
# Create production database in Cloudflare dashboard or via CLI
wrangler d1 create bookshelf-vibe-db-prod

# Run migration on production database
wrangler d1 execute bookshelf-vibe-db-prod --file=schema.sql --remote
\`\`\`

### 2. Deploy to Cloudflare Pages

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`

### 3. Configure Environment Variables

In Cloudflare Pages project settings → Environment Variables, add:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`
- `NEXT_PUBLIC_BASE_URL` (your production URL)

### 4. Bind D1 Database

In your Cloudflare Pages project:
1. Go to Settings → Functions → D1 Database Bindings
2. Add binding: Variable name `DB`, D1 database: select your production database

### 5. Update GitHub OAuth Callback

Add your production URL to GitHub OAuth App settings:
- Callback URL: `https://your-domain.pages.dev/api/auth/callback`

## Project Structure

\`\`\`
├── components/          # React components
│   ├── BookList.tsx    # Book display (table/cards)
│   ├── BookModal.tsx   # Add/edit book form
│   ├── BookSearch.tsx  # Google Books search
│   └── DashboardLayout.tsx
├── functions/          # Cloudflare Pages Functions
│   └── api/
│       ├── auth/       # OAuth endpoints
│       ├── books/      # CRUD operations
│       ├── search.ts   # Book search proxy
│       └── public/     # Public list endpoint
├── lib/                # Utilities
│   ├── auth.ts        # JWT & session management
│   ├── db.ts          # D1 database helpers
│   └── middleware.ts  # Auth middleware
├── pages/             # Next.js pages
│   ├── index.tsx      # Landing page
│   ├── dashboard.tsx  # Main app dashboard
│   └── public/[user_id].tsx  # Public book list
├── schema.sql         # Database schema
├── wrangler.toml      # Cloudflare configuration
└── package.json
\`\`\`

## API Endpoints

### Authentication
- `GET /api/auth/login` - Redirect to GitHub OAuth
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/logout` - Clear session

### Books (Protected)
- `GET /api/books` - Get user's books
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Search
- `GET /api/search?q={query}` - Search books via Google Books

### Public
- `GET /api/public/:user_id` - Get public book list

## Database Schema

### Users Table
- `id` - User ID (TEXT PRIMARY KEY)
- `email` - Email address (TEXT UNIQUE)
- `github_id` - GitHub user ID (INTEGER)
- `created_at` - Timestamp

### Books Table
- `id` - Book ID (INTEGER AUTO INCREMENT)
- `user_id` - Foreign key to users
- `title` - Book title (TEXT, required)
- `author` - Author name (TEXT)
- `status` - Reading status: want/reading/done
- `notes` - Personal notes (TEXT)
- `goodreads_id` - Google Books ID (TEXT)
- `cover_url` - Cover image URL (TEXT)
- `created_at` - Timestamp

## Troubleshooting

### Wrangler D1 Authentication Error

If you encounter OAuth errors with `wrangler d1 create`:
- Create the database through Cloudflare Dashboard instead
- Go to Workers & Pages → D1 → Create Database
- Copy the database ID to `wrangler.toml`

### Next.js Build Errors

Ensure you're using compatible versions:
\`\`\`bash
npm install next@latest react@latest react-dom@latest
\`\`\`

### Missing Environment Variables

Check that all required environment variables are set in:
- `.env.local` (local development)
- Cloudflare Pages settings (production)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

ISC

## Acknowledgments

- Built following Vibe Coding principles
- Inspired by Goodreads and book tracking apps
- Uses Google Books API for book data
