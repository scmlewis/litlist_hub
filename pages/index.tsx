export default function Home() {
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

          {/* CTA Button */}
          <a
            href="/api/auth/login"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Login with GitHub
          </a>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
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
