"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldAlert, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const benefits = [
  "Report civic issues in seconds",
  "Track progress from submission to resolution",
  "Help communities turn feedback into action",
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const message = mode === "login"
      ? await signIn(email, password)
      : await register(name, email, password);
    setIsSubmitting(false);

    if (message) {
      setError(message);
      return;
    }
    router.push("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    const message = await signInWithGoogle();
    setIsSubmitting(false);
    if (message) {
      setError(message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f7fb] dark:bg-slate-950 px-4 py-10 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[#102a43] dark:bg-slate-950 px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-14 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[28px] border-cyan-300/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[36px] border-amber-300/10" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-400 p-2.5 text-[#102a43] shadow-md shadow-cyan-400/20"><ShieldAlert className="h-6 w-6" /></div>
              <span className="text-xl font-bold tracking-tight">JanSetu<span className="text-cyan-300">AI</span></span>
            </div>
            <div className="mt-20 max-w-md lg:mt-auto">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" /> Your voice matters
              </div>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Better streets begin with one report.</h1>
              <p className="mt-5 text-base leading-7 text-slate-300">Join a growing civic network that makes everyday infrastructure issues visible, organized, and easier to resolve.</p>
              <div className="mt-9 space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" /> {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-md">
            <div className="mb-9">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">Welcome to JanSetu AI</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{mode === "login" ? "Sign in to continue" : "Create your account"}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{mode === "login" ? "Keep your reports and community updates in one place." : "Start helping your community get heard today."}</p>
            </div>

            <div className="mb-8 grid grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Full name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={2}
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3.5 font-normal text-slate-900 dark:text-white outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-700/80 focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="Your name"
                  />
                </label>
              )}
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email address
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3.5 font-normal text-slate-900 dark:text-white outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-700/80 focus:ring-4 focus:ring-cyan-500/10"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
                <span className="relative mt-2 block">
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3.5 pr-12 font-normal text-slate-900 dark:text-white outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-700/80 focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </span>
              </label>

              {error && (
                <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                  {error}
                </p>
              )}
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60 active:scale-[0.99]"
              >
                {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span>or</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <span className="text-base font-black text-[#4285F4]">G</span>
              Continue with Google
            </button>
            <p className="mt-8 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">By continuing, you agree to use JanSetu AI responsibly and provide accurate civic information.</p>
            <Link href="/" className="mt-5 block text-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400">
              Back to JanSetu AI
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
