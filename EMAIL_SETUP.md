# Email Setup Instructions for M&H Advocates Website

## 📧 EmailJS Setup (Recommended - Free & Easy)

EmailJS is a free service that allows sending emails directly from the frontend
without a backend server.

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - **Yahoo**
   - **Custom SMTP**
4. Follow the setup instructions for your provider
5. Note down your **Service ID** (e.g., `service_mh_advocates`)

### Step 3: Create Email Templates

Create two templates in EmailJS:

#### Template 1: Client Confirmation (`template_client_confirmation`)

**Subject:** `Confirmation: Your {{service_type}} Application - M&H Advocates`

**Content:**

```html
Dear {{client_name}}, Thank you for submitting your {{service_type}} application
to M&H Advocates & Corporate Consultants. Application Details: - Reference ID:
{{submission_id}} - Service Type: {{service_type}} - Submitted:
{{submission_date}} at {{submission_time}} What Happens Next? 1. Our legal team
will review your application within 24 hours 2. We will contact you to schedule
a consultation 3. Initial consultation to discuss your case in detail 4. If you
choose to proceed, we'll begin working on your case Need immediate assistance?
📞 Call us at: (123) 456-7890 📧 Email us at: info@mhadvocates.com Please keep
this email for your records. Best regards, M&H Advocates & Corporate Consultants
Delivering expert legal services across diverse sectors
```

#### Template 2: Firm Notification (`template_firm_notification`)

**Subject:** `New {{service_type}} Application - {{client_name}}`

**Content:**

```html
{{#if urgency}} 🚨 URGENCY: {{urgency}} {{/if}} New {{service_type}} application
received. Client Information: - Name: {{client_name}} - Email: {{client_email}}
- Phone: {{client_phone}} - Urgency: {{urgency}} Application Details:
{{form_details}} Reference ID: {{submission_id}} Submitted: {{submission_date}}
at {{submission_time}} Required Actions: - Review application details - Contact
client within 24 hours - Schedule initial consultation - Update case management
system Quick Contact: {{client_email}}
```

### Step 4: Update Configuration

1. In `js/email-service.js`, update the EmailJS configuration:

```javascript
this.emailJSConfig = {
    serviceId: "your_service_id_here", // From Step 2
    userId: "your_user_id_here", // From EmailJS dashboard
};
```

2. Update the firm email address:

```javascript
this.firmEmail = "your-firm-email@domain.com";
```

### Step 5: Test the Setup

1. Submit a test form on your website
2. Check both client and firm email addresses
3. Verify emails are received and formatted correctly

---

## 🔧 Alternative: Supabase Edge Functions (Advanced)

If you prefer a more robust solution, you can use Supabase Edge Functions with a
proper SMTP service.

### Step 1: Deploy Edge Function

1. Install Supabase CLI
2. Deploy the edge function:

```bash
supabase functions deploy send-form-emails
```

### Step 2: Set Environment Variables

In your Supabase dashboard, set these environment variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FIRM_EMAIL=info@mhadvocates.com
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_USER_ID=your_user_id
```

### Step 3: Update Form Handler

Uncomment the Supabase Edge Function code in `js/form-handler.js`:

```javascript
// Use this instead of EmailService
const { data, error } = await this.supabaseClient.functions.invoke(
    "send-form-emails",
    {
        body: emailData,
    },
);
```

---

## 📋 Database Schema Update

Add email tracking columns to your Supabase `service_requests` table:

```sql
ALTER TABLE service_requests 
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN email_sent_at TIMESTAMP,
ADD COLUMN email_error TEXT;
```

---

## 🧪 Testing Checklist

- [ ] Client receives confirmation email
- [ ] Firm receives notification email
- [ ] Emails contain correct information
- [ ] Urgent cases are flagged properly
- [ ] Email templates are properly formatted
- [ ] Form submission works without email (graceful degradation)
- [ ] Error handling works when email service is down

---

## 🔒 Security Considerations

1. **API Keys**: EmailJS keys are safe to expose in frontend code
2. **Rate Limiting**: EmailJS has built-in rate limiting
3. **Spam Protection**: Consider adding reCAPTCHA to forms
4. **Email Validation**: Always validate email addresses
5. **Content Filtering**: Sanitize form data before sending emails

---

## 📞 Support

If you need help with email setup:

1. **EmailJS Documentation**: [docs.emailjs.com](https://www.emailjs.com/docs/)
2. **Supabase Edge Functions**:
   [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
3. **Contact Support**: Create an issue in the project repository

---

## 🚀 Production Recommendations

For production use, consider:

1. **Professional Email Service**: SendGrid, Mailgun, or AWS SES
2. **Email Templates**: Use a template engine for better formatting
3. **Email Analytics**: Track open rates and delivery status
4. **Backup Email Service**: Fallback service in case primary fails
5. **Email Queue**: For high-volume applications
