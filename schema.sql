-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  github_id INTEGER UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  author TEXT,
  status TEXT CHECK(status IN ('want', 'reading', 'done')) DEFAULT 'want',
  notes TEXT,
  goodreads_id TEXT,
  cover_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
