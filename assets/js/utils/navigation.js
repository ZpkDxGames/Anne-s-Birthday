/**
 * Navigation Utilities
 * Smooth page transitions with fade effects
 */

/**
 * Navigate to another page with smooth transition
 * @param {string} url - Target page URL
 * @param {number} delay - Delay before navigation (ms)
 */
export function navigateTo(url, delay = 600) {
  // Create overlay element if it doesn't exist
  let overlay = document.querySelector('.page-transition-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
  }
  
  // Trigger fade out
  overlay.classList.add('active');
  
  // Navigate after delay
  setTimeout(() => {
    window.location.href = url;
  }, delay);
}

/**
 * Fade in page on load
 */
export function fadeInPage() {
  const overlay = document.querySelector('.page-transition-overlay');
  
  if (overlay) {
    // Remove active class to fade out overlay
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 100);
  }
}

/**
 * Initialize navigation for all links with data-transition attribute
 */
export function initSmoothNavigation() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-transition]');
    
    if (link && link.href) {
      e.preventDefault();
      navigateTo(link.href);
    }
  });
  
  // Fade in on page load
  fadeInPage();
}

/**
 * Go back to previous page with transition
 */
export function goBack() {
  const overlay = document.querySelector('.page-transition-overlay');
  
  if (overlay) {
    overlay.classList.add('active');
  }
  
  setTimeout(() => {
    window.history.back();
  }, 600);
}

/**
 * Preload images for smoother experience
 * @param {string[]} imageUrls - Array of image URLs to preload
 */
export function preloadImages(imageUrls) {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}
