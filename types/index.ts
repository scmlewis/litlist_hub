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

export interface User {
  userId: string;
  email: string;
  githubId: number;
}
