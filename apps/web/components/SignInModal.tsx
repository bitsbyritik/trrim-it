"use client";

import { useEffect, useState } from "react";
import { X, Scissors } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@repo/auth/client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SignInModal({ open, onClose }: Props) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleGoogleSignIn = async () => {
    setIsPending(true);
    toast.loading("Signing you in…", { id: "signin" });
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      toast.error("Sign in failed. Please try again.", { id: "signin" });
      setIsPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.09] bg-[#111111] shadow-[0_0_80px_-20px_hsl(217_91%_60%/0.3)] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.06] transition-all"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight">
              trrim<span className="text-primary">.it</span>
            </span>
          </div>

          <h2 className="text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-7">
            Sign in to start trimming videos instantly.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-white/[0.1] bg-white hover:bg-white/90 active:scale-[0.99] text-[#1a1a1a] font-semibold text-sm transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isPending ? (
              <svg className="w-4 h-4 animate-spin text-[#1a1a1a]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {isPending ? "Signing in…" : "Continue with Google"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.07]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#111111] text-xs text-muted-foreground/40">or</span>
            </div>
          </div>

          <button
            disabled
            className="w-full h-11 rounded-xl border border-white/[0.07] bg-white/[0.02] text-sm text-muted-foreground/40 cursor-not-allowed"
          >
            Continue with Email — coming soon
          </button>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/35 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-muted-foreground/60 transition-colors">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-muted-foreground/60 transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
