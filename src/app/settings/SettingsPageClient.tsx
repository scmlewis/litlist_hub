"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Trash2,
  AlertTriangle,
  Download,
  X,
  User,
  Shield,
} from "lucide-react";

interface SettingsPageClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account</p>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white border border-border rounded-xl shadow-elevation-1 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Account Info</h2>
          </div>
          <div className="flex items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={64}
                height={64}
                className="rounded-full ring-2 ring-primary/20"
              />
            )}
            <div>
              <p className="text-lg font-medium text-foreground">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Data Management Card */}
        <div className="bg-white border border-border rounded-xl shadow-elevation-1 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Export your reading lists and data before making any account changes.
          </p>
          <Link
            href="/export"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Your Data
          </Link>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-destructive/30 rounded-xl shadow-elevation-1 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your reading
            lists, books, and reading goals will be permanently deleted.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white border border-border rounded-xl shadow-elevation-1 rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-destructive/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Delete Account</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <p className="text-destructive text-sm">
                  <strong>Warning:</strong> This action is permanent and cannot be
                  undone. All your data will be deleted including:
                </p>
                <ul className="mt-2 text-sm text-destructive/80 list-disc list-inside space-y-1">
                  <li>All reading lists and saved books</li>
                  <li>Reading goals and progress</li>
                  <li>Account information</li>
                </ul>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-foreground text-sm mb-2">
                  Before deleting, consider{" "}
                  <Link
                    href="/export"
                    className="text-primary hover:text-primary underline"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    exporting your data
                  </Link>
                  .
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type <span className="text-destructive font-mono">DELETE</span> to
                  confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-destructive"
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== "DELETE" || isDeleting}
                  className="flex-1 px-4 py-3 bg-destructive hover:bg-destructive disabled:bg-destructive/50 disabled:text-destructive/50 text-white rounded-xl font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}