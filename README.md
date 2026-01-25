# 📚 LitList Hub

A modern booklist app to track your reading journey. Search for books, organize them into lists, mark your reading status, and share your lists with friends.

## Features

- **🔍 Search Books** - Search millions of books via Open Library API
- **📖 Track Status** - Mark books as "Want to Read", "Reading", or "Done"
- **📋 Organize Lists** - Create multiple lists to organize your books
- **🔗 Share Lists** - Generate shareable links for your public lists
- **🔐 GitHub Auth** - Secure authentication via GitHub OAuth

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Book API**: Open Library API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/litlist-hub.git
cd litlist-hub
npm install
```

### 2. Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: LitList Hub
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 3. Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database - SQLite for local development
DATABASE_URL="file:./dev.db"

# NextAuth.js - Generate a secret with: openssl rand -base64 32
AUTH_SECRET="your-random-secret-key"

# GitHub OAuth - From step 2
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

### 4. Initialize Database

```bash
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Railway

### 1. Create Railway Project

1. Go to [Railway](https://railway.app) and create a new project
2. Connect your GitHub repository

### 2. Add PostgreSQL Database

1. Click "+ New" → "Database" → "PostgreSQL"
2. Railway automatically provides `DATABASE_URL`

### 3. Update Prisma for PostgreSQL

For production, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite
  url      = env("DATABASE_URL")
}
```

Update field types:
- Change `authors String @default("[]")` to `authors String[]`
- Change `status String` to use enum `ReadingStatus`

### 4. Set Environment Variables

In Railway dashboard, add:

```
AUTH_SECRET=<generate with openssl rand -base64 32>
AUTH_GITHUB_ID=<your-github-client-id>
AUTH_GITHUB_SECRET=<your-github-client-secret>
```

Update your GitHub OAuth app callback URL to your Railway URL:
`https://your-app.railway.app/api/auth/callback/github`

### 5. Deploy

Railway auto-deploys on push to main. The `postinstall` script runs `prisma generate` automatically.

## Adding Google OAuth Later

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add to `.env.local`:

```env
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

4. Update `src/lib/auth.ts`:

```typescript
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Google],  // Add Google
  // ...
});
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth route handler
│   │   ├── books/search/         # Book search API
│   │   └── lists/                # Lists CRUD API
│   ├── auth/signin/              # Custom sign-in page
│   ├── lists/                    # My Lists page
│   ├── search/                   # Book search page
│   ├── share/[shareId]/          # Public shared list view
│   ├── layout.tsx
│   └── page.tsx                  # Home page
├── components/
│   ├── BookCard.tsx
│   ├── BookSearch.tsx
│   ├── Header.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   └── prisma.ts                 # Prisma client singleton
├── services/
│   └── openLibrary.ts            # Open Library API service
└── types/
    └── next-auth.d.ts            # NextAuth type augmentation

prisma/
└── schema.prisma                 # Database schema
```

## License

MIT
