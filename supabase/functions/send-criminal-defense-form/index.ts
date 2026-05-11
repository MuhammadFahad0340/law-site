import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

// --- Environment Variables (set in Supabase dashboard) ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Debug (optional - remove in production)
console.log("Supabase URL loaded:", SUPABASE_URL);
console.log("Supabase key loaded:", !!SUPABASE_ANON_KEY);
console.log("Resend key loaded:", !!RESEND_API_KEY);

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Resend client
const resend = new Resend(RESEND_API_KEY);

// Officer email (destination for submissions)
const OFFICER_EMAIL = "champgoku0340@gmail.com";

serve(async (req) => {
  // --- CORS headers ---
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Change to your domain in production
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing form ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch form submission from Supabase
    const { data, error } = await supabase
      .from("criminal_defence_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // --- Email content ---
    const htmlBody = `
      <h2>New Criminal Defence Request</h2>
      <p><strong>First Name:</strong> ${data.firstName || "N/A"}</p>
      <p><strong>Last Name:</strong> ${data.lastName || "N/A"}</p>
      <p><strong>Email:</strong> ${data.email || "N/A"}</p>
      <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
      <p><strong>Address:</strong> ${data.address || "N/A"}</p>
      <p><strong>Case Type:</strong> ${data.caseType || "N/A"}</p>
      <p><strong>Urgency:</strong> ${data.urgency || "N/A"}</p>
      <p><strong>Services Needed:</strong> ${(data.servicesNeeded || []).join(", ") || "N/A"}</p>
      <p><strong>Case Details:</strong> ${data.caseDetails || "N/A"}</p>
      <p><strong>Court Date:</strong> ${data.courtDate || "N/A"}</p>
      <p><strong>Current Attorney:</strong> ${data.currentAttorney || "N/A"}</p>
      <p><strong>Case Circumstances:</strong> ${(data.caseCircumstances || []).join(", ") || "N/A"}</p>
      <p><strong>Prior Record:</strong> ${data.priorRecord || "N/A"}</p>
      <p><strong>Questions:</strong> ${data.questions || "N/A"}</p>
      <p><small>Submitted on: ${new Date(data.created_at).toLocaleString()}</small></p>
    `;

    // --- Send emails ---
    // Officer copy
    await resend.emails.send({
      from: "no-reply@onresend.com",
      to: OFFICER_EMAIL,
      subject: "New Criminal Defence Form Submission",
      html: htmlBody,
    });

    // Client copy
    if (data.email) {
      await resend.emails.send({
        from: "no-reply@onresend.com",
        to: data.email,
        subject: "Copy of Your Criminal Defence Form Submission",
        html: htmlBody,
      });
    }

    // Success response
    return new Response(
      JSON.stringify({ status: "Emails sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );

  } catch (err) {
    console.error("Error sending emails:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
