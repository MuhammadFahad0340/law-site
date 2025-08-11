document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainMenu = document.querySelector('.main-navigation .menu');
  const mobileNav = document.querySelector('.mobile-navigation');

  if (menuToggle && mobileNav && mainMenu) {
    // Clone main menu to mobile navigation
    mobileNav.innerHTML = '';
    const clonedMenu = mainMenu.cloneNode(true);
    mobileNav.appendChild(clonedMenu);

    menuToggle.addEventListener('click', function () {
      if (mobileNav.style.display === 'block') {
        mobileNav.style.display = 'none';
      } else {
        mobileNav.style.display = 'block';
      }
    });
  }
});
