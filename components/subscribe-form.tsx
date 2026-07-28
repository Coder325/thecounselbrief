"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setMessage("You’re subscribed.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Unable to subscribe right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="email" className="block text-sm font-medium text-stone-700">
        Email address
      </label>

      <input
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-red-500"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>

      {message && (
        <p className={`text-sm ${status === "success" ? "text-green-700" : "text-red-700"}`}>
          {message}
        </p>
      )}
    </form>
  );
}