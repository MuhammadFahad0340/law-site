/**
 * Centralized Authentication Handler for M&H Advocates
 * Handles login, signup, password reset, and Google authentication
 */

class AuthHandler {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyCDcHEvIB3pbgrQNZZJIKAfLzJ2mgDoBTU",
            authDomain: "lawfirmauth-16bd4.firebaseapp.com",
            projectId: "lawfirmauth-16bd4",
            storageBucket: "lawfirmauth-16bd4.firebasestorage.app",
            messagingSenderId: "288192077960",
            appId: "1:288192077960:web:4bbe1be11366af56117f3d",
            measurementId: "G-7484K80JFZ"
        };
        
        this.app = null;
        this.auth = null;
        this.init();
    }

    async init() {
        try {
            // Initialize Firebase
            if (typeof firebase !== 'undefined') {
                this.app = firebase.initializeApp(this.firebaseConfig);
                this.auth = firebase.auth();
                
                // Monitor auth state
                this.auth.onAuthStateChanged((user) => this.handleAuthStateChange(user));
            }
            
            // Bind event handlers
            this.bindEventHandlers();
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }

    bindEventHandlers() {
        // Bind form handlers
        document.addEventListener('DOMContentLoaded', () => {
            // Login form
            const loginForm = document.querySelector('form[onsubmit*="handleLogin"]');
            if (loginForm) {
                loginForm.removeAttribute('onsubmit');
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            }

            // Signup form
            const signupForm = document.querySelector('form[onsubmit*="handleSignup"]');
            if (signupForm) {
                signupForm.removeAttribute('onsubmit');
                signupForm.addEventListener('submit', (e) => this.handleSignup(e));
            }

            // Reset password form
            const resetForm = document.querySelector('form[onsubmit*="handleResetPassword"]');
            if (resetForm) {
                resetForm.removeAttribute('onsubmit');
                resetForm.addEventListener('submit', (e) => this.handleResetPassword(e));
            }

            // Google login button
            const googleBtn = document.getElementById('google-signin-btn');
            if (googleBtn) {
                googleBtn.removeAttribute('onclick');
                googleBtn.addEventListener('click', () => this.handleGoogleLogin());
            }
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!this.validateLoginForm(email, password)) {
            return;
        }

        this.showLoader(true);

        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                this.showSnackbar('Please verify your email before logging in. Check your inbox.', 'warning');
                await this.auth.signOut();
                return;
            }

            // Store user info
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userName', user.displayName || user.email);

            this.showSnackbar('Login successful! Redirecting...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            this.showSnackbar(this.getAuthErrorMessage(error.code), 'error');
        } finally {
            this.showLoader(false);
        }
    }

    async handleSignup(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const fullname = formData.get('fullname');
        const email = formData.get('email');
        const password = formData.get('password');

        if (!this.validateSignupForm(fullname, email, password)) {
            return;
        }

        this.showLoader(true);

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update user profile
            await user.updateProfile({
                displayName: fullname
            });

            // Send email verification
            await user.sendEmailVerification();

            this.showSnackbar('Account created! Please check your email to verify your account.', 'success');
            
            // Redirect to login after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Signup error:', error);
            this.showSnackbar(this.getAuthErrorMessage(error.code), 'error');
        } finally {
            this.showLoader(false);
        }
    }

    async handleResetPassword(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email');

        if (!this.validateEmail(email)) {
            this.showSnackbar('Please enter a valid email address', 'error');
            return;
        }

        this.showLoader(true);

        try {
            await this.auth.sendPasswordResetEmail(email);
            this.showSnackbar('Password reset email sent! Check your inbox.', 'success');
            form.reset();

        } catch (error) {
            console.error('Password reset error:', error);
            this.showSnackbar(this.getAuthErrorMessage(error.code), 'error');
        } finally {
            this.showLoader(false);
        }
    }

    async handleGoogleLogin() {
        this.showLoader(true);

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;

            // Store user info
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userName', user.displayName || user.email);

            this.showSnackbar('Google login successful! Redirecting...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Google login error:', error);
            this.showSnackbar(this.getAuthErrorMessage(error.code), 'error');
        } finally {
            this.showLoader(false);
        }
    }

    async handleLogout() {
        this.showLoader(true);

        try {
            await this.auth.signOut();
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userName');

            this.showSnackbar('Logged out successfully', 'success');
            
            // Redirect to home
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Logout error:', error);
            this.showSnackbar('Error logging out', 'error');
        } finally {
            this.showLoader(false);
        }
    }

    handleAuthStateChange(user) {
        const loginBtn = document.querySelector('.login-btn');
        const signupBtn = document.querySelector('.signup-btn');
        const logoutBtn = document.querySelector('.logout-btn');
        const authBtns = document.querySelector('.auth-buttons');

        if (user && user.emailVerified !== false) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userName', user.displayName || user.email);
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (signupBtn) signupBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userName');
        }

        if (authBtns) authBtns.classList.add('visible');
    }

    validateLoginForm(email, password) {
        if (!email || !password) {
            this.showSnackbar('Please fill in all fields', 'error');
            return false;
        }

        if (!this.validateEmail(email)) {
            this.showSnackbar('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    }

    validateSignupForm(fullname, email, password) {
        if (!fullname || !email || !password) {
            this.showSnackbar('Please fill in all fields', 'error');
            return false;
        }

        if (fullname.length < 2) {
            this.showSnackbar('Full name must be at least 2 characters', 'error');
            return false;
        }

        if (!this.validateEmail(email)) {
            this.showSnackbar('Please enter a valid email address', 'error');
            return false;
        }

        if (password.length < 6) {
            this.showSnackbar('Password must be at least 6 characters', 'error');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password is too weak',
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/popup-closed-by-user': 'Google sign-in was cancelled',
            'auth/cancelled-popup-request': 'Google sign-in was cancelled'
        };

        return errorMessages[errorCode] || 'An error occurred. Please try again.';
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
        const colors = {
            success: '#28a745',
            error: '#c0392b',
            warning: '#f39c12',
            info: '#007bff'
        };

        Object.assign(snackbar.style, {
            visibility: 'visible',
            minWidth: '250px',
            backgroundColor: colors[type] || colors.info,
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
}

// Make logout function globally available
window.logoutUser = function() {
    if (window.authHandler) {
        window.authHandler.handleLogout();
    }
};

// Initialize auth handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authHandler = new AuthHandler();
});

// Add CSS animations if not already present
if (!document.querySelector('#auth-handler-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-handler-styles';
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
    `;
    document.head.appendChild(style);
}