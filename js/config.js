/**
 * Configuration file for M&H Advocates website
 * Contains API keys and environment settings
 */

const CONFIG = {
    // Firebase Configuration
    firebase: {
        apiKey: "AIzaSyCDcHEvIB3pbgrQNZZJIKAfLzJ2mgDoBTU",
        authDomain: "lawfirmauth-16bd4.firebaseapp.com",
        projectId: "lawfirmauth-16bd4",
        storageBucket: "lawfirmauth-16bd4.firebasestorage.app",
        messagingSenderId: "288192077960",
        appId: "1:288192077960:web:4bbe1be11366af56117f3d",
        measurementId: "G-7484K80JFZ"
    },

    // Supabase Configuration
    supabase: {
        url: "https://vhypouyzjxeklzcygqyi.supabase.co",
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeXBvdXl6anhla2x6Y3lncXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODc0NzEsImV4cCI6MjA2OTg2MzQ3MX0.JjQjb5p6mb6MzHE85pUPwVXA084VM-wTR3Gj8ImkrVA"
    },

    // Form Configuration
    forms: {
        // Service form table mappings
        serviceTypes: {
            'criminal-defense': 'service_requests',
            'estate-planning': 'service_requests',
            'family-law': 'service_requests',
            'employment-law': 'service_requests',
            'tax': 'service_requests',
            'contract-law': 'service_requests',
            'business-law': 'service_requests',
            'civil-litigation': 'service_requests',
            'constitutional-law': 'service_requests',
            'aviation-law': 'service_requests',
            'adr': 'service_requests'
        },

        // Contact form endpoint
        contactEndpoint: "https://formspree.io/f/your-form-id", // Replace with actual Formspree endpoint

        // Validation settings
        validation: {
            minPasswordLength: 6,
            minNameLength: 2,
            phoneMinLength: 10,
            phoneMaxLength: 15
        }
    },

    // UI Configuration
    ui: {
        snackbarDuration: 3000,
        redirectDelay: 1500,
        loaderColor: '#c8aa6e',
        primaryColor: '#c8aa6e',
        errorColor: '#c0392b',
        successColor: '#28a745',
        warningColor: '#f39c12'
    },

    // Development settings
    development: {
        enableConsoleLogging: true,
        enableFormValidation: true,
        enableEmailVerification: true
    }
};

// Make config globally available
window.CONFIG = CONFIG;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}