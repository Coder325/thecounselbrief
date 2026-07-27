import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from("subscribers").insert({
      email,
    });

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ error: "This email is already subscribed." }, { status: 400 });
      }

      return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}