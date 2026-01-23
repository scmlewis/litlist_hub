import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            BookShelf <span className="text-primary-600">Vibe</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your reading journey. Share your literary vibe with the world.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Organize your books, track what you're reading, and share your personal
            book collection with friends and fellow readers.
          </p>

          {/* Login Form */}
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg mb-12">
            <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors duration-200"
              >
                {loading ? 'Logging in...' : 'Continue with Email'}
              </button>
            </form>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Organize Books</h3>
              <p className="text-gray-600">
                Keep track of what you want to read, what you're reading, and what
                you've finished.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Search & Add</h3>
              <p className="text-gray-600">
                Easily find and add books from Google Books with automatic details
                and cover images.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Share Lists</h3>
              <p className="text-gray-600">
                Generate a public link to share your book collection with anyone.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 text-gray-500 text-sm">
            <p>
              Built with Next.js, Cloudflare Pages, and D1 Database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
