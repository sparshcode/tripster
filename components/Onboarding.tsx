"use client";

import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { TripsterLogo } from "./TripsterLogo";
import type { AuthMethod } from "@/lib/auth-store";

type Mode = "signin" | "signup";

export function Onboarding({
  onSignIn,
}: {
  onSignIn: (info: { method: AuthMethod; email?: string }) => void;
}) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [busy, setBusy] = useState<AuthMethod | null>(null);

  const passwordOk = password.length >= 6;
  const emailOk = /.+@.+\..+/.test(email);
  const canSignIn = emailOk && passwordOk;
  const canSignUp =
    name.trim().length > 1 &&
    emailOk &&
    passwordOk &&
    password === confirmPassword &&
    agreeTerms;

  async function submit(method: AuthMethod) {
    if (busy) return;
    if (method === "password" && mode === "signup" && !canSignUp) return;
    if (method === "password" && mode === "signin" && !canSignIn) return;
    setBusy(method);
    await new Promise((r) => setTimeout(r, 350));
    onSignIn({ method, email: email.trim() || undefined });
  }

  return (
    <div className="no-scrollbar relative flex flex-1 flex-col overflow-y-auto bg-white px-6 pb-8 pt-14">
      <div className="flex flex-col items-center">
        <TripsterLogo size={64} className="drop-shadow-lg" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Tripster{" "}
          <span className="bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {mode === "signin"
            ? "Welcome back. Sign in to your trips."
            : "Create an account to start planning."}
        </p>
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-xs grid-cols-2 gap-1 rounded-full bg-slate-100 p-1">
        {(["signin", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={clsx(
              "rounded-full py-2 text-sm font-semibold transition",
              mode === m
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit("password");
        }}
        className="mx-auto mt-5 w-full max-w-xs space-y-3"
      >
        {mode === "signup" && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Riya Sharma"
              autoComplete="name"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="password">
            Password
          </label>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-indigo-500">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mode === "signup" && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="confirm">
              Confirm Password
            </label>
            <input
              id="confirm"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-[11px] text-rose-600">Passwords don&apos;t match.</p>
            )}
          </div>
        )}

        {mode === "signin" ? (
          <div className="text-right">
            <button
              type="button"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </button>
          </div>
        ) : (
          <label className="flex items-start gap-2 text-[11px] leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600"
            />
            <span>
              I agree to Tripster&apos;s{" "}
              <a className="font-semibold text-indigo-600 hover:text-indigo-700">Terms</a>{" "}
              and{" "}
              <a className="font-semibold text-indigo-600 hover:text-indigo-700">Privacy Policy</a>.
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={busy !== null || (mode === "signin" ? !canSignIn : !canSignUp)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === "password" && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <div className="flex items-center gap-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          or continue with
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => submit("google")}
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleGlyph className="h-4 w-4" />}
          Continue with Google
        </button>
      </form>

      <p className="mx-auto mt-5 max-w-xs text-center text-xs text-slate-500">
        {mode === "signin" ? (
          <>
            New to Tripster?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mx-auto mt-4 max-w-xs text-center text-[10px] leading-4 text-slate-400">
        Demo build — auth is client-side only. Your data stays on this device.
      </p>
    </div>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
