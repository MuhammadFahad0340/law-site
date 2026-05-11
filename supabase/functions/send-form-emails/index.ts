import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FormData {
  submissionId: string;
  serviceType: string;
  clientData: any;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { submissionId, serviceType, clientData, timestamp }: FormData = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Email configuration
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const SMTP_USER = Deno.env.get('SMTP_USER') // Your email
    const SMTP_PASS = Deno.env.get('SMTP_PASS') // Your app password
    const FIRM_EMAIL = Deno.env.get('FIRM_EMAIL') || 'info@mhadvocates.com'

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured')
    }

    // Generate email content
    const serviceDisplayName = getServiceDisplayName(serviceType)
    const clientName = `${clientData.firstName || clientData.first_name || ''} ${clientData.lastName || clientData.last_name || ''}`.trim()
    const clientEmail = clientData.email

    // Client confirmation email
    const clientEmailContent = generateClientEmail(clientName, serviceDisplayName, submissionId, clientData)
    
    // Firm notification email
    const firmEmailContent = generateFirmEmail(clientName, serviceDisplayName, submissionId, clientData)

    // Send emails using fetch to a mail service
    const emailResults = await Promise.allSettled([
      sendEmail({
        to: clientEmail,
        subject: `Confirmation: Your ${serviceDisplayName} Application - M&H Advocates`,
        html: clientEmailContent,
        smtpConfig: { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS }
      }),
      sendEmail({
        to: FIRM_EMAIL,
        subject: `New ${serviceDisplayName} Application - ${clientName}`,
        html: firmEmailContent,
        smtpConfig: { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS }
      })
    ])

    // Log email results
    console.log('Email results:', emailResults)

    // Update submission status
    await supabase
      .from('service_requests')
      .update({ 
        status: 'submitted',
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully',
        submissionId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending emails:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function getServiceDisplayName(serviceType: string): string {
  const serviceNames: { [key: string]: string } = {
    'criminal-defense': 'Criminal Defense',
    'estate-planning': 'Estate Planning',
    'family-law': 'Family Law',
    'employment-law': 'Employment Law',
    'tax': 'Tax Law',
    'contract-law': 'Contract Law',
    'business-law': 'Business Law',
    'civil-litigation': 'Civil Litigation',
    'constitutional-law': 'Constitutional Law',
    'aviation-law': 'Aviation Law',
    'adr': 'Alternative Dispute Resolution'
  }
  
  return serviceNames[serviceType] || serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function generateClientEmail(clientName: string, serviceType: string, submissionId: string, formData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Confirmation - M&H Advocates</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #c8aa6e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #111113; color: #c8aa6e; padding: 15px; text-align: center; }
        .highlight { color: #c8aa6e; font-weight: bold; }
        .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #c8aa6e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>M&H Advocates & Corporate Consultants</h1>
          <p>Application Confirmation</p>
        </div>
        
        <div class="content">
          <h2>Dear ${clientName},</h2>
          
          <p>Thank you for submitting your <span class="highlight">${serviceType}</span> application. We have received your request and our legal team will review it promptly.</p>
          
          <div class="details">
            <h3>Application Details:</h3>
            <p><strong>Reference ID:</strong> ${submissionId}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
          </div>
          
          <h3>What Happens Next?</h3>
          <ul>
            <li><strong>Review:</strong> Our legal team will review your application within 24 hours</li>
            <li><strong>Contact:</strong> We will contact you to schedule a consultation</li>
            <li><strong>Consultation:</strong> Initial consultation to discuss your case in detail</li>
            <li><strong>Representation:</strong> If you choose to proceed, we'll begin working on your case</li>
          </ul>
          
          <p><strong>Need immediate assistance?</strong><br>
          📞 Call us at: <span class="highlight">(123) 456-7890</span><br>
          📧 Email us at: <span class="highlight">info@mhadvocates.com</span></p>
          
          <p>Please keep this email for your records. You can reference your application using ID: <strong>${submissionId}</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 M&H Advocates & Corporate Consultants. All Rights Reserved.</p>
          <p>Delivering expert legal services across diverse sectors</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateFirmEmail(clientName: string, serviceType: string, submissionId: string, formData: any): string {
  const formDetails = Object.entries(formData)
    .filter(([key, value]) => value && key !== 'service_type' && key !== 'submitted_at' && key !== 'status')
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      if (Array.isArray(value)) {
        return `<p><strong>${label}:</strong> ${value.join(', ')}</p>`
      }
      return `<p><strong>${label}:</strong> ${value}</p>`
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New ${serviceType} Application</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #c8aa6e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .urgent { background-color: #ff6b6b; color: white; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #c8aa6e; }
        .highlight { color: #c8aa6e; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New ${serviceType} Application</h1>
          <p>Client: ${clientName}</p>
        </div>
        
        <div class="content">
          ${formData.urgency === 'immediate' ? '<div class="urgent"><strong>⚠️ URGENT:</strong> Immediate attention required (Arrest/Warrant)</div>' : ''}
          ${formData.urgency === 'urgent' ? '<div class="urgent"><strong>⏰ URGENT:</strong> Court date approaching soon</div>' : ''}
          
          <div class="details">
            <h3>Application Summary:</h3>
            <p><strong>Reference ID:</strong> ${submissionId}</p>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
            ${formData.urgency ? `<p><strong>Urgency:</strong> ${formData.urgency}</p>` : ''}
          </div>
          
          <div class="details">
            <h3>Complete Application Details:</h3>
            ${formDetails}
          </div>
          
          <h3>Required Actions:</h3>
          <ul>
            <li>Review application details</li>
            <li>Contact client within 24 hours</li>
            <li>Schedule initial consultation</li>
            <li>Update case management system</li>
          </ul>
          
          <p><strong>Quick Contact:</strong><br>
          📧 Reply to: <span class="highlight">${formData.email}</span><br>
          📞 Call: <span class="highlight">${formData.phone || 'Not provided'}</span></p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendEmail(emailData: {
  to: string;
  subject: string;
  html: string;
  smtpConfig: any;
}): Promise<any> {
  // For this example, we'll use a simple HTTP service
  // In production, you might want to use SendGrid, Mailgun, or similar
  
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: Deno.env.get('EMAILJS_SERVICE_ID'),
      template_id: Deno.env.get('EMAILJS_TEMPLATE_ID'),
      user_id: Deno.env.get('EMAILJS_USER_ID'),
      template_params: {
        to_email: emailData.to,
        subject: emailData.subject,
        html_content: emailData.html,
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Email service error: ${response.statusText}`)
  }

  return response.json()
}