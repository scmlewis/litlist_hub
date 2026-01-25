import { signIn } from "@/lib/auth";
import { TestLoginForm } from "./TestLoginForm";
import { BookOpen, FlaskConical, Github, Sparkles } from "lucide-react";

const isDev = process.env.NODE_ENV === "development";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-black/30">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg">
              <BookOpen className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 text-center">
          Welcome back
        </h1>
        <p className="text-stone-400 text-center mb-8">
          Sign in to continue your reading journey
        </p>

        {/* GitHub OAuth */}
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-stone-900 rounded-2xl font-semibold hover:bg-stone-100 shadow-lg shadow-white/10 transition-all duration-200 cursor-pointer"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
            <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>

        {/* Test Account Login - Only in development */}
        {isDev && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--card-bg)] text-stone-500 font-medium">or use test account</span>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-primary-900/40 to-primary-800/30 border border-primary-700/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary-500 rounded-lg">
                  <FlaskConical className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-primary-200 font-semibold">
                  Test Account (Dev Only)
                </p>
              </div>
              <TestLoginForm />
              <p className="text-xs text-primary-400 mt-3 text-center">
                test@example.com / test123
              </p>
            </div>
          </>
        )}

        <p className="mt-8 text-xs text-stone-400 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
