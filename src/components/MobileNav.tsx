"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Upload, LogOut, Target, BarChart3, Download, MoreHorizontal, X, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMore, setShowMore] = useState(false);

  if (!session) return null;

  const mainNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/lists", icon: Library, label: "Lists" },
    { href: "/goals", icon: Target, label: "Goals" },
  ];

  const moreNavItems = [
    { href: "/stats", icon: BarChart3, label: "Statistics" },
    { href: "/import", icon: Upload, label: "Import" },
    { href: "/export", icon: Download, label: "Export" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isMoreActive = moreNavItems.some(item => isActive(item.href));

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMore(false)}
        >
          <div 
            className="absolute bottom-20 left-4 right-4 p-4 glass-card rounded-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">More Options</h3>
              <button 
                onClick={() => setShowMore(false)}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                      active
                        ? "text-primary-400 bg-primary-900/30"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowMore(false);
                signOut();
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-[var(--card-border)] bottom-nav">
        <div className="flex items-center justify-around py-2 px-4">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-all duration-200 ${
                  active
                    ? "text-primary-400 bg-primary-900/30"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-all duration-200 cursor-pointer ${
              showMore || isMoreActive
                ? "text-primary-400 bg-primary-900/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
