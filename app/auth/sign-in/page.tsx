import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signIn(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/auth/sign-in?error=invalid_credentials");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?error=no_user");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && ["admin", "editor"].includes(profile.role)) {
    redirect("/dashboard");
  }

  redirect("/unauthorized");
}

async function signUp(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect("/auth/sign-in?error=signup_failed");
  }

  redirect("/auth/sign-in?message=account_created");
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  const errorMessage =
    params.error === "invalid_credentials"
      ? "Invalid email or password."
      : params.error === "no_user"
      ? "Could not load your user session."
      : params.error === "signup_failed"
      ? "Could not create account."
      : null;

  const successMessage =
    params.message === "account_created"
      ? "Account created. You can sign in now."
      : null;

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-3xl font-semibold text-stone-950">Sign in</h1>
      <p className="mt-3 text-stone-600">
        Access the editorial dashboard or create a new account.
      </p>

      <div className="mt-8 grid gap-8">
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-950">Sign in</h2>

          {errorMessage && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}

          <form action={signIn} className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="signin-email"
                className="block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="signin-email"
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="signin-password"
                className="block text-sm font-medium text-stone-700"
              >
                Password
              </label>
              <input
                id="signin-password"
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Sign in
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-950">Create account</h2>

          <form action={signUp} className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="signup-full-name"
                className="block text-sm font-medium text-stone-700"
              >
                Full name
              </label>
              <input
                id="signup-full-name"
                name="full_name"
                type="text"
                required
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-stone-700"
              >
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-red-300 hover:text-red-700"
            >
              Create account
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}