// Type definitions for D1 database
export interface User {
  id: string;
  email: string;
  github_id: number;
  created_at: string;
}

export interface Book {
  id: number;
  user_id: string;
  title: string;
  author: string | null;
  status: 'want' | 'reading' | 'done';
  notes: string | null;
  goodreads_id: string | null;
  cover_url: string | null;
  created_at: string;
}

// D1 Database interface
export interface Env {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

// Database helper class
export class DatabaseHelper {
  constructor(private db: D1Database) {}

  // User operations
  async getUserById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();
    return result || null;
  }

  async getUserByGithubId(githubId: number): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE github_id = ?')
      .bind(githubId)
      .first<User>();
    return result || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();
    return result || null;
  }

  async createUser(id: string, email: string, githubId: number): Promise<User> {
    await this.db
      .prepare('INSERT INTO users (id, email, github_id) VALUES (?, ?, ?)')
      .bind(id, email, githubId)
      .run();
    
    const user = await this.getUserById(id);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  // Book operations
  async getBooksByUserId(userId: string): Promise<Book[]> {
    const result = await this.db
      .prepare('SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<Book>();
    return result.results || [];
  }

  async getBookById(id: number): Promise<Book | null> {
    const result = await this.db
      .prepare('SELECT * FROM books WHERE id = ?')
      .bind(id)
      .first<Book>();
    return result || null;
  }

  async createBook(
    userId: string,
    title: string,
    author: string | null = null,
    status: 'want' | 'reading' | 'done' = 'want',
    notes: string | null = null,
    goodreadsId: string | null = null,
    coverUrl: string | null = null
  ): Promise<Book> {
    const result = await this.db
      .prepare(
        'INSERT INTO books (user_id, title, author, status, notes, goodreads_id, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *'
      )
      .bind(userId, title, author, status, notes, goodreadsId, coverUrl)
      .first<Book>();
    
    if (!result) throw new Error('Failed to create book');
    return result;
  }

  async updateBook(
    id: number,
    updates: Partial<Omit<Book, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Book> {
    const book = await this.getBookById(id);
    if (!book) throw new Error('Book not found');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return book;

    values.push(id);
    await this.db
      .prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await this.getBookById(id);
    if (!updated) throw new Error('Failed to update book');
    return updated;
  }

  async deleteBook(id: number): Promise<void> {
    await this.db
      .prepare('DELETE FROM books WHERE id = ?')
      .bind(id)
      .run();
  }

  async verifyBookOwnership(bookId: number, userId: string): Promise<boolean> {
    const book = await this.getBookById(bookId);
    return book?.user_id === userId;
  }
}

// Export convenience function
export function getDatabase(env: Env): DatabaseHelper {
  return new DatabaseHelper(env.DB);
}
