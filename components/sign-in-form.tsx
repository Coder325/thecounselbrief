"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInForm() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sign-in-email" className="block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="sign-in-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-red-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="sign-in-password" className="block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="sign-in-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-red-500"
          placeholder="Your password"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>

      {message && <p className="text-sm text-red-700">{message}</p>}
    </form>
  );
}