import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, amount, need_type, have_type, requesterId } = await req.json();

    // Validate input
    if (!city || !amount || !need_type || !have_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Resend and Supabase credentials
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch all users in the same city (excluding the requester)
    const { data: usersInCity, error: fetchError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .ilike("city", `%${city}%`)
      .neq("user_id", requesterId);

    if (fetchError) {
      console.error("Error fetching users:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Filter out users without email
    const validEmails = (usersInCity || [])
      .filter((user: any) => user.email && user.email.trim())
      .map((user: any) => user.email);

    if (validEmails.length === 0) {
      console.log(`No users found in city: ${city}`);
      return new Response(
        JSON.stringify({ success: true, emailsSent: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare email content
    const emailSubject = "Someone nearby needs your help 💸";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 16px;">Someone in your area needs help!</h2>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Hi,<br><br>
          Someone in <strong>${city}</strong> has posted a request for urgent cash exchange.
        </p>
        
        <div style="background-color: #fff; padding: 16px; border-left: 4px solid #ec4899; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 8px 0; color: #333;"><strong>Amount needed:</strong> ₹${amount.toLocaleString("en-IN")}</p>
          <p style="margin: 8px 0; color: #333;"><strong>Type:</strong> Need ${need_type === "cash" ? "💵 Cash" : "📱 UPI"} → Have ${have_type === "cash" ? "💵 Cash" : "📱 UPI"}</p>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Check if you can help and connect instantly!
        </p>
        
        <div style="margin: 24px 0;">
          <a href="https://quickswapconnect.vercel.app" 
             style="display: inline-block; padding: 12px 32px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            View Details & Connect
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          – QuickSwap Cash Team<br>
          <em>Your trusted peer-to-peer cash exchange platform</em>
        </p>
      </div>
    `;

    // Send emails via Resend
    const emailPromises = validEmails.map((recipientEmail: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml,
          reply_to: "support.quickswap24@gmail.com",
        }),
      })
        .then((res) => res.json())
        .catch((err) => {
          console.error(`Failed to send email to ${recipientEmail}:`, err);
          return { error: err.message };
        })
    );

    const emailResults = await Promise.all(emailPromises);
    const successCount = emailResults.filter((r: any) => !r.error).length;
    const failCount = emailResults.filter((r: any) => r.error).length;

    console.log(
      `Email notification sent: ${successCount} success, ${failCount} failed out of ${validEmails.length} users`
    );

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: successCount,
        emailsFailed: failCount,
        totalUsers: validEmails.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Edge function error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
