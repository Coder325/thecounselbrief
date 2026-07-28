import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim();
    const excerpt = String(body.excerpt || "").trim();

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Missing article title or slug." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("active", true);

    if (subscribersError) {
      return NextResponse.json(
        { error: subscribersError.message },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const emails = subscribers
      .map((subscriber) => subscriber.email)
      .filter(Boolean);

    const subject = `New article: ${title}`;
    const articleUrl = `${siteUrl}/articles/${slug}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: emails,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h1 style="font-size: 24px; margin-bottom: 12px;">The Counsel Brief</h1>
          <p style="margin-bottom: 16px;">A new article has just been published.</p>
          <h2 style="font-size: 20px; margin-bottom: 8px;">${title}</h2>
          <p style="margin-bottom: 16px;">${excerpt || "Read the latest legal update on our site."}</p>
          <p>
            <a
              href="${articleUrl}"
              style="display: inline-block; padding: 12px 18px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px;"
            >
              Read the article
            </a>
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Email send failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sent: emails.length,
      data,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to send article update emails." },
      { status: 500 }
    );
  }
}