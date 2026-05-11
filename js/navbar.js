/**
 * Floating Navbar – scroll behaviour + mobile menu
 * Include this script on every page that has a .site-header
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     1. Scroll → add/remove .scrolled on header
  ═══════════════════════════════════════════ */
  const header = document.querySelector('.site-header');
  if (header) {
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ═══════════════════════════════════════════
     2. Mobile menu toggle
  ═══════════════════════════════════════════ */
  function initMobileMenu() {
    const toggle    = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-navigation');
    const mainMenu  = document.querySelector('.main-navigation .menu');

    if (!toggle || !mobileNav) return;

    /* ── Populate nav links (clone from desktop menu) ── */
    if (mainMenu && !mobileNav.querySelector('ul')) {
      mobileNav.appendChild(mainMenu.cloneNode(true));
    }

    /* ── Build & inject auth buttons section ── */
    function buildMobileAuthSection() {
      // Remove old section if it exists (re-build on auth state change)
      const old = mobileNav.querySelector('.mobile-nav-auth');
      if (old) old.remove();

      const authDiv = document.createElement('div');
      authDiv.className = 'mobile-nav-auth';

      // Detect login state via localStorage flag set by Firebase auth handler
      const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

      if (isLoggedIn) {
        // Show logout button
        const logoutA = document.createElement('a');
        logoutA.href = '#';
        logoutA.className = 'mobile-logout-btn';
        logoutA.textContent = 'Logout';
        logoutA.addEventListener('click', function (e) {
          e.preventDefault();
          mobileNav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          // Call the global logoutUser if available (defined in each page's module script)
          if (typeof window.logoutUser === 'function') {
            window.logoutUser();
          } else {
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userName');
            window.location.href = 'index.html';
          }
        });
        authDiv.appendChild(logoutA);
      } else {
        // Show login + sign up buttons
        const loginA = document.createElement('a');
        loginA.href = 'login.html';
        loginA.className = 'mobile-login-btn';
        loginA.textContent = 'Login';

        const signupA = document.createElement('a');
        signupA.href = 'signup.html';
        signupA.className = 'mobile-signup-btn';
        signupA.textContent = 'Sign Up';

        authDiv.appendChild(loginA);
        authDiv.appendChild(signupA);
      }

      mobileNav.appendChild(authDiv);
    }

    buildMobileAuthSection();

    // Re-build auth section whenever localStorage changes (e.g. after login/logout in same tab)
    window.addEventListener('storage', buildMobileAuthSection);

    /* ── Hamburger click: toggle open/close ── */
    toggle.addEventListener('click', function (e) {
      e.stopPropagation(); // prevent document click from immediately closing it
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      // Rebuild auth section on each open in case state changed
      if (isOpen) buildMobileAuthSection();
    });

    /* ── Close menu when any nav link is tapped ── */
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && !e.target.classList.contains('mobile-logout-btn')) {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    /* ── Close menu on outside click ── */
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();
