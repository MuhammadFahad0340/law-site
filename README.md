# M&H Advocates & Corporate Consultants Website

A professional law firm website with authentication, service forms, and client
management features.

## 🚀 Features

- **Responsive Design**: Mobile-first design with Bootstrap 5
- **Authentication System**: Firebase-powered login/signup with Google OAuth
- **Service Forms**: Comprehensive forms for different legal services
- **Email Notifications**: Automatic confirmation emails to clients and
  notifications to firm
- **Contact Management**: Integrated contact forms with Formspree
- **Database Integration**: Supabase for form data persistence
- **Modern UI**: Professional design with smooth animations

## 📁 Project Structure

```
├── index.html              # Homepage
├── about.html              # About page
├── service.html            # Services overview
├── contact.html            # Contact page
├── experience.html         # Experience page
├── login.html              # Login page
├── signup.html             # Signup page
├── reset-password.html     # Password reset
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── auth-handler.js    # Authentication logic
│   ├── form-handler.js    # Form submission logic
│   ├── email-service.js   # Email notification system
│   ├── config.js          # Configuration settings
│   ├── app.js             # Main application logic
│   └── plugins.js         # Third-party plugins
├── service-forms/         # Legal service forms
│   ├── criminal-defense-form.html
│   ├── estate-planning-form.html
│   ├── family-law-form.html
│   └── ... (other service forms)
├── images/                # Image assets
├── fonts/                 # Font files
└── dummy/                 # Placeholder images
```

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.x (for local development server)
- Modern web browser
- Internet connection (for CDN resources)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mh-advocates-website
   ```

2. **Start the development server**
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at
   [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google providers
3. Update Firebase config in `js/config.js`

### Supabase Setup

1. Create a Supabase project at [Supabase](https://supabase.com)
2. Create the required database tables (see Database Schema below)
3. Update Supabase config in `js/config.js`

### EmailJS Setup (for email notifications)

1. Create account at [EmailJS.com](https://www.emailjs.com/)
2. Set up email service and templates
3. Update configuration in `js/email-service.js`
4. See `EMAIL_SETUP.md` for detailed instructions

### Database Schema

Create these tables in your Supabase database:

```sql
-- Service requests table
CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    service_type VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    case_details TEXT,
    services_needed TEXT[],
    case_circumstances TEXT[],
    urgency VARCHAR(20),
    court_date DATE,
    current_attorney VARCHAR(20),
    prior_record TEXT,
    questions TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    email_error TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_service_requests_email ON service_requests(email);
CREATE INDEX idx_service_requests_service_type ON service_requests(service_type);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_email_sent ON service_requests(email_sent);
```

## 📝 Usage

### Authentication

- Users can sign up with email/password or Google OAuth
- Email verification is required for new accounts
- Password reset functionality available

### Service Forms

- 11 different legal service forms available
- Comprehensive validation and error handling
- Data stored in Supabase database
- Automatic email notifications (if configured)

### Contact System

- Main contact form integrated with Formspree
- Calendly integration for appointment scheduling
- Newsletter subscription (frontend only)

## 🎨 Customization

### Styling

- Main styles in `css/style.css`
- Authentication styles in `auth.css`
- Service form styles in `service-forms/style.css`
- Colors and branding can be updated in CSS variables

### Content

- Update firm information in HTML files
- Replace placeholder images in `dummy/` folder
- Modify service descriptions and forms as needed

### Configuration

- Update API keys and endpoints in `js/config.js`
- Modify form validation rules
- Customize UI colors and animations

## 🔒 Security

### Best Practices Implemented

- Client-side form validation
- Firebase Authentication security rules
- Supabase Row Level Security (RLS)
- Input sanitization
- HTTPS enforcement (in production)

### Security Considerations

- API keys are exposed in client-side code (normal for web apps)
- Implement rate limiting on server side
- Regular security audits recommended
- Keep dependencies updated

## 🚀 Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Netlify

1. Connect your Git repository
2. Set build command: `echo "Static site"`
3. Set publish directory: `/`
4. Deploy

### GitHub Pages

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (main/master)

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for
details.

## 📞 Support

For support and questions:

- Email: support@mhadvocates.com
- Phone: (123) 456-7890
- Website: [M&H Advocates](https://mhadvocates.com)

## 🔄 Changelog

### Version 1.0.0 (Current)

- Initial release
- Authentication system
- Service forms
- Contact management
- Responsive design
- Database integration

## 🛣️ Roadmap

- [ ] Admin dashboard for managing requests
- [ ] Client portal for case tracking
- [ ] Payment integration
- [ ] Document upload functionality
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Mobile app development
