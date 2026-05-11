/**
 * Centralized Form Handler for M&H Advocates
 * Handles all form submissions with proper validation and error handling
 */

class FormHandler {
    constructor() {
        this.supabaseUrl = "https://vhypouyzjxeklzcygqyi.supabase.co";
        this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeXBvdXl6anhla2x6Y3lncXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODc0NzEsImV4cCI6MjA2OTg2MzQ3MX0.JjQjb5p6mb6MzHE85pUPwVXA084VM-wTR3Gj8ImkrVA";
        this.supabaseClient = null;
        this.emailService = null;
        this.init();
    }

    init() {
        // Initialize Supabase client
        if (typeof supabase !== 'undefined') {
            this.supabaseClient = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        }
        
        // Initialize Email service
        this.emailService = new EmailService();
        
        // Bind form handlers
        this.bindFormHandlers();
    }

    bindFormHandlers() {
        // Handle all service forms
        const serviceForms = document.querySelectorAll('form[data-service-type]');
        serviceForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleServiceForm(e));
        });

        // Handle contact forms
        const contactForms = document.querySelectorAll('form[data-form-type="contact"]');
        contactForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleContactForm(e));
        });
    }

    async handleServiceForm(event) {
        event.preventDefault();
        
        const form = event.target;
        const serviceType = form.getAttribute('data-service-type');
        
        // Show loading state
        this.showLoader(true);
        
        try {
            // Validate form
            if (!this.validateForm(form)) {
                this.showLoader(false);
                return;
            }

            // Collect form data
            const formData = this.collectFormData(form);
            
            // Add metadata
            formData.service_type = serviceType;
            formData.submitted_at = new Date().toISOString();
            formData.status = 'pending';

            // Submit to Supabase
            const { data, error } = await this.supabaseClient
                .from('service_requests')
                .insert([formData])
                .select();

            if (error) {
                throw error;
            }

            // Send emails after successful database save
            const submissionId = data[0]?.id;
            await this.sendFormEmails(formData, serviceType, submissionId);

            // Show success message
            this.showSnackbar('Form submitted successfully! Confirmation email sent. We will contact you within 24 hours.', 'success');
            form.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            this.showSnackbar('Error submitting form. Please try again or contact us directly.', 'error');
        } finally {
            this.showLoader(false);
        }
    }

    async handleContactForm(event) {
        event.preventDefault();
        
        const form = event.target;
        
        // Show loading state
        this.showLoader(true);
        
        try {
            // Validate form
            if (!this.validateForm(form)) {
                this.showLoader(false);
                return;
            }

            // Collect form data
            const formData = this.collectFormData(form);
            
            // Submit via Formspree (existing contact form endpoint)
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Show success message
            this.showSnackbar('Message sent successfully! We will get back to you soon.', 'success');
            form.reset();

        } catch (error) {
            console.error('Contact form submission error:', error);
            this.showSnackbar('Error sending message. Please try again or call us directly.', 'error');
        } finally {
            this.showLoader(false);
        }
    }

    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};

        // Handle regular fields
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Handle checkbox arrays specifically
        const checkboxGroups = form.querySelectorAll('input[type="checkbox"][name$="[]"]');
        const groupNames = new Set();
        
        checkboxGroups.forEach(checkbox => {
            const name = checkbox.name.replace('[]', '');
            groupNames.add(name);
        });

        groupNames.forEach(groupName => {
            const checkedBoxes = form.querySelectorAll(`input[name="${groupName}[]"]:checked`);
            data[groupName] = Array.from(checkedBoxes).map(cb => cb.value);
        });

        return data;
    }

    validateForm(form) {
        let isValid = true;
        const errors = [];

        // Clear previous error messages
        this.clearErrorMessages(form);

        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.showFieldError(field, 'This field is required');
                errors.push(`${field.name || field.id} is required`);
            }
        });

        // Validate email fields
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                isValid = false;
                this.showFieldError(field, 'Please enter a valid email address');
                errors.push('Invalid email format');
            }
        });

        // Validate phone fields
        const phoneFields = form.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
            if (field.value && !this.isValidPhone(field.value)) {
                isValid = false;
                this.showFieldError(field, 'Please enter a valid phone number');
                errors.push('Invalid phone format');
            }
        });

        // Validate date fields (court dates should be in future)
        const dateFields = form.querySelectorAll('input[type="date"]');
        dateFields.forEach(field => {
            if (field.value && field.name === 'courtDate') {
                const selectedDate = new Date(field.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    isValid = false;
                    this.showFieldError(field, 'Court date should be in the future');
                    errors.push('Invalid court date');
                }
            }
        });

        if (!isValid) {
            this.showSnackbar('Please correct the errors in the form', 'error');
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        // Check if it's 10-15 digits (international format)
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }

    showFieldError(field, message) {
        // Remove existing error
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#c0392b';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#c0392b';
    }

    clearErrorMessages(form) {
        // Remove all error messages
        const errorMessages = form.querySelectorAll('.field-error');
        errorMessages.forEach(error => error.remove());

        // Reset field border colors
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.style.borderColor = '';
        });
    }

    showSnackbar(message, type = 'info') {
        let snackbar = document.getElementById('snackbar');
        
        if (!snackbar) {
            snackbar = document.createElement('div');
            snackbar.id = 'snackbar';
            document.body.appendChild(snackbar);
        }

        // Set message and style based on type
        snackbar.textContent = message;
        snackbar.className = `snackbar-${type}`;
        
        // Apply styles
        Object.assign(snackbar.style, {
            visibility: 'visible',
            minWidth: '250px',
            backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#c0392b' : '#007bff',
            color: 'white',
            textAlign: 'center',
            padding: '12px',
            position: 'fixed',
            zIndex: '999',
            left: '50%',
            bottom: '30px',
            transform: 'translateX(-50%)',
            borderRadius: '4px',
            fontSize: '16px',
            animation: 'fadein 0.5s, fadeout 0.5s 2.5s'
        });

        // Hide after 3 seconds
        setTimeout(() => {
            snackbar.style.visibility = 'hidden';
        }, 3000);
    }

    showLoader(show) {
        let loader = document.getElementById('loader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loader';
            document.body.appendChild(loader);
            
            // Apply loader styles
            Object.assign(loader.style, {
                position: 'fixed',
                left: '50%',
                top: '50%',
                zIndex: '1000',
                transform: 'translate(-50%, -50%)',
                border: '6px solid #f3f3f3',
                borderTop: '6px solid #c8aa6e',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 0.8s linear infinite'
            });
        }
        
        loader.style.display = show ? 'block' : 'none';
    }

    async sendFormEmails(formData, serviceType, submissionId) {
        try {
            // Use EmailService to send emails
            await this.emailService.sendFormEmails(formData, serviceType, submissionId);
            console.log('Emails sent successfully');

        } catch (error) {
            console.error('Email service error:', error);
            // Don't throw error - form was saved successfully
            this.showSnackbar('Form saved successfully! Email notification may be delayed.', 'warning');
        }
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

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormHandler();
});

// Add CSS animations if not already present
if (!document.querySelector('#form-handler-styles')) {
    const style = document.createElement('style');
    style.id = 'form-handler-styles';
    style.textContent = `
        @keyframes fadein {
            from { bottom: 0; opacity: 0; } 
            to { bottom: 30px; opacity: 1; }
        }

        @keyframes fadeout {
            from { bottom: 30px; opacity: 1; }
            to { bottom: 0; opacity: 0; }
        }

        @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .field-error {
            color: #c0392b !important;
            font-size: 12px !important;
            margin-top: 5px !important;
        }
    `;
    document.head.appendChild(style);
}