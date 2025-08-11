import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const COMPANY_EMAIL = "champgoku0340@gmail.com"; // Replace with your company email

serve(async (req: Request) => {
  try {
    // Create Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { 
        global: { 
          headers: { 
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
            'Content-Type': 'application/json'
          } 
        } 
      }
    )

    // Get form data from request
    const { form_data, form_id } = await req.json()
    const clientEmail = form_data.email

    // Validate required fields
    if (!clientEmail || !form_data.firstName || !form_data.lastName) {
      throw new Error('Missing required form fields')
    }

    // Email to Company
    const companyEmail = {
      to: COMPANY_EMAIL,
      from: 'noreply@mhadvocates.com', // Add a sender email
      subject: `New Criminal Defense Form Submission - ${form_data.firstName} ${form_data.lastName}`,
      html: `
        <h2>New Criminal Defense Case Submission</h2>
        <p><strong>Name:</strong> ${form_data.firstName} ${form_data.lastName}</p>
        <p><strong>Email:</strong> ${form_data.email}</p>
        <p><strong>Phone:</strong> ${form_data.phone || 'Not provided'}</p>
        <p><strong>Case Type:</strong> ${form_data.caseType || 'Not specified'}</p>
        <p><strong>Urgency:</strong> ${form_data.urgency || 'Not specified'}</p>
        <p><strong>Case Details:</strong></p>
        <pre>${form_data.caseDetails || 'No details provided'}</pre>
        <p><a href="https://app.supabase.com/project/${Deno.env.get('SUPABASE_PROJECT_REF')}/editor/table/criminal_defence_requests?id=${form_id}">View Full Submission in Supabase</a></p>
      `
    }

    // Email to Client (Confirmation)
    const clientConfirmation = {
      to: clientEmail,
      from: 'noreply@mhadvocates.com', // Add a sender email
      subject: "Your Criminal Defense Submission - M&H Advocates",
      html: `
        <h2>Thank You for Your Submission</h2>
        <p>Dear ${form_data.firstName},</p>
        <p>We've received your criminal defense case details and will review them shortly.</p>
        <p><strong>Case Reference:</strong> ${form_id}</p>
        <p>Our team will contact you within 24 hours. For urgent matters, please call (123) 456-7890.</p>
        <p>Sincerely,<br>The M&H Advocates Team</p>
      `
    }

    // Send emails using the 'email' table (ensure this table exists)
    const { error: companyError } = await supabaseClient
      .from('emails')
      .insert([companyEmail])

    const { error: clientError } = await supabaseClient
      .from('emails')
      .insert([clientConfirmation])

    if (companyError || clientError) {
      console.error('Email sending errors:', { companyError, clientError })
      throw companyError || clientError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Emails sent successfully' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process form submission'
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})