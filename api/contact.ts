import { NextResponse } from "next/server";

export default async function handler(req: any) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error("Resend API key not configured");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    // Send email using Resend API
    const emailPayload = {
      from: "onboarding@resend.dev",
      to: "support.quickswap24@gmail.com",
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Reply to: ${email}</p>
      `,
    };

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend API error:", result);
      return NextResponse.json(
        { error: "Failed to send email", details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (err: any) {
    console.error("API error:", err.message);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
