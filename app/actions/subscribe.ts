"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { error: "This email is already subscribed." };
    }

    return { error: "Could not subscribe right now." };
  }

  return { success: "Subscribed successfully." };
}