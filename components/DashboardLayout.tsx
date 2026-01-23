import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail: string;
  userId: string;
  onShare?: () => void;
}

export default function DashboardLayout({ children, userEmail, userId, onShare }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                BookShelf <span className="text-primary-600">Vibe</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {onShare && (
                <button
                  onClick={onShare}
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share My List
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
                <a
                  href="/api/auth/logout"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
