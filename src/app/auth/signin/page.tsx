import { signIn } from "@/lib/auth";
import { TestLoginForm } from "./TestLoginForm";
import { BookOpen, FlaskConical, Github, Sparkles } from "lucide-react";

const isDev = process.env.NODE_ENV === "development";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <div className="bg-white border border-border rounded-3xl p-8 shadow-elevation-2">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary rounded-2xl shadow-elevation-1">
            <BookOpen className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3 text-center">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-center mb-8">
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
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:shadow-elevation-2 shadow-elevation-1 transition-all duration-200 cursor-pointer"
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
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted-foreground font-medium">or use test account</span>
              </div>
            </div>

            <div className="p-5 bg-primary/10 border border-border rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary rounded-lg">
                  <FlaskConical className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <p className="text-sm text-primary font-semibold">
                  Test Account (Dev Only)
                </p>
              </div>
              <TestLoginForm />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                test@example.com / test123
              </p>
            </div>
          </>
        )}

        <p className="mt-8 text-xs text-muted-foreground text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
