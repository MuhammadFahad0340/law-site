/**
 * Email Service for M&H Advocates
 * Handles sending confirmation and notification emails
 */

class EmailService {
    constructor() {
        // EmailJS configuration (free service, easy setup)
        this.emailJSConfig = {
            serviceId: 'service_mh_advocates', // Replace with your EmailJS service ID
            templateId: 'template_form_submission', // Replace with your EmailJS template ID
            userId: 'your_emailjs_user_id' // Replace with your EmailJS user ID
        };
        
        this.firmEmail = 'info@mhadvocates.com'; // Replace with actual firm email
        this.init();
    }

    init() {
        // Load EmailJS if not already loaded
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init(this.emailJSConfig.userId);
            };
            document.head.appendChild(script);
        }
    }

    async sendFormEmails(formData, serviceType, submissionId) {
        try {
            const clientName = `${formData.firstName || formData.first_name || ''} ${formData.lastName || formData.last_name || ''}`.trim();
            const serviceDisplayName = this.getServiceDisplayName(serviceType);

            // Prepare email data
            const emailData = {
                client_name: clientName,
                client_email: formData.email,
                service_type: serviceDisplayName,
                submission_id: submissionId,
                phone: formData.phone || 'Not provided',
                urgency: formData.urgency || 'Normal',
                case_details: formData.caseDetails || formData.case_details || 'Not provided',
                firm_email: this.firmEmail,
                submission_date: new Date().toLocaleDateString(),
                submission_time: new Date().toLocaleTimeString(),
                form_details: this.formatFormDetails(formData)
            };

            // Send client confirmation email
            await this.sendClientConfirmation(emailData);
            
            // Send firm notification email
            await this.sendFirmNotification(emailData);

            return { success: true, message: 'Emails sent successfully' };

        } catch (error) {
            console.error('Email service error:', error);
            throw error;
        }
    }

    async sendClientConfirmation(emailData) {
        const templateParams = {
            to_email: emailData.client_email,
            to_name: emailData.client_name,
            subject: `Confirmation: Your ${emailData.service_type} Application - M&H Advocates`,
            service_type: emailData.service_type,
            submission_id: emailData.submission_id,
            client_name: emailData.client_name,
            submission_date: emailData.submission_date,
            submission_time: emailData.submission_time,
            message: this.generateClientMessage(emailData)
        };

        return emailjs.send(
            this.emailJSConfig.serviceId,
            'template_client_confirmation', // Create this template in EmailJS
            templateParams
        );
    }

    async sendFirmNotification(emailData) {
        const templateParams = {
            to_email: emailData.firm_email,
            to_name: 'M&H Advocates Team',
            subject: `New ${emailData.service_type} Application - ${emailData.client_name}`,
            service_type: emailData.service_type,
            submission_id: emailData.submission_id,
            client_name: emailData.client_name,
            client_email: emailData.client_email,
            client_phone: emailData.phone,
            urgency: emailData.urgency,
            submission_date: emailData.submission_date,
            submission_time: emailData.submission_time,
            form_details: emailData.form_details,
            message: this.generateFirmMessage(emailData)
        };

        return emailjs.send(
            this.emailJSConfig.serviceId,
            'template_firm_notification', // Create this template in EmailJS
            templateParams
        );
    }

    generateClientMessage(emailData) {
        return `
Dear ${emailData.client_name},

Thank you for submitting your ${emailData.service_type} application to M&H Advocates & Corporate Consultants.

Application Details:
- Reference ID: ${emailData.submission_id}
- Service Type: ${emailData.service_type}
- Submitted: ${emailData.submission_date} at ${emailData.submission_time}

What Happens Next?
1. Our legal team will review your application within 24 hours
2. We will contact you to schedule a consultation
3. Initial consultation to discuss your case in detail
4. If you choose to proceed, we'll begin working on your case

Need immediate assistance?
📞 Call us at: (123) 456-7890
📧 Email us at: info@mhadvocates.com

Please keep this email for your records.

Best regards,
M&H Advocates & Corporate Consultants
Delivering expert legal services across diverse sectors
        `.trim();
    }

    generateFirmMessage(emailData) {
        const urgencyFlag = emailData.urgency === 'immediate' ? '🚨 URGENT - IMMEDIATE ATTENTION REQUIRED' : 
                           emailData.urgency === 'urgent' ? '⏰ URGENT - Court Date Soon' : '';

        return `
${urgencyFlag}

New ${emailData.service_type} application received.

Client Information:
- Name: ${emailData.client_name}
- Email: ${emailData.client_email}
- Phone: ${emailData.phone}
- Urgency: ${emailData.urgency}

Application Details:
${emailData.form_details}

Reference ID: ${emailData.submission_id}
Submitted: ${emailData.submission_date} at ${emailData.submission_time}

Required Actions:
- Review application details
- Contact client within 24 hours
- Schedule initial consultation
- Update case management system
        `.trim();
    }

    formatFormDetails(formData) {
        const excludeFields = ['service_type', 'submitted_at', 'status', 'firstName', 'lastName', 'email', 'phone'];
        
        return Object.entries(formData)
            .filter(([key, value]) => value && !excludeFields.includes(key))
            .map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                if (Array.isArray(value)) {
                    return `${label}: ${value.join(', ')}`;
                }
                return `${label}: ${value}`;
            })
            .join('\n');
    }

    getServiceDisplayName(serviceType) {
        const serviceNames = {
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
        };
        
        return serviceNames[serviceType] || serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

// Make EmailService globally available
window.EmailService = EmailService;