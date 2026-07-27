import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-stone-200 bg-stone-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-sm font-semibold text-red-700">
            CB
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              Legal publication
            </p>
            <p className="text-lg font-semibold tracking-tight text-stone-950">
              The Counsel Brief
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-stone-700">
          <Link href="/" className="hover:text-red-700">
            Home
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-stone-300 px-4 py-2 text-stone-950 transition hover:border-red-300 hover:text-red-700"
          >
            Dashboard
          </Link>

          {user ? (
            <SignOutButton />
          ) : (
            <Link href="/auth/sign-in" className="hover:text-red-700">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}