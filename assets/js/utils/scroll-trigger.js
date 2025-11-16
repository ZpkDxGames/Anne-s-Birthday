/**
 * Scroll Trigger Utility
 * Uses Intersection Observer for scroll-based animations
 */

/**
 * Initialize scroll reveal animations
 * @param {string} selector - CSS selector for elements to reveal
 * @param {Object} options - Configuration options
 */
export function initScrollReveal(selector = '.scroll-reveal', options = {}) {
  const {
    threshold = 0.2,
    rootMargin = '0px 0px -50px 0px',
    once = true,
    stagger = 0,
    onReveal = null
  } = options;
  
  const elements = document.querySelectorAll(selector);
  
  if (!elements.length) return;
  
  // Check for Intersection Observer support
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all elements immediately
    elements.forEach(el => {
      el.classList.add('is-visible');
      if (onReveal) onReveal(el);
    });
    return;
  }
  
  // Create observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Apply stagger delay
        const delay = stagger * index;
        
        if (delay > 0) {
          setTimeout(() => {
            entry.target.classList.add('is-visible');
            if (onReveal) onReveal(entry.target);
          }, delay);
        } else {
          entry.target.classList.add('is-visible');
          if (onReveal) onReveal(entry.target);
        }
        
        // Stop observing if once is true
        if (once) {
          observer.unobserve(entry.target);
        }
      } else if (!once) {
        // Allow hiding again if once is false
        entry.target.classList.remove('is-visible');
      }
    });
  }, {
    threshold,
    rootMargin
  });
  
  // Observe all elements
  elements.forEach(element => {
    observer.observe(element);
  });
  
  return observer;
}

/**
 * Create a custom scroll trigger for specific element
 * @param {HTMLElement} element - Element to observe
 * @param {Function} callback - Callback when element is visible
 * @param {Object} options - Observer options
 */
export function createScrollTrigger(element, callback, options = {}) {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    once = false
  } = options;
  
  if (!('IntersectionObserver' in window)) {
    callback(true, element);
    return null;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      callback(entry.isIntersecting, entry.target);
      
      if (entry.isIntersecting && once) {
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold,
    rootMargin
  });
  
  observer.observe(element);
  return observer;
}

/**
 * Trigger callback when element enters viewport
 * @param {string} selector - CSS selector
 * @param {Function} callback - Callback function
 */
export function onEnterViewport(selector, callback) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    createScrollTrigger(element, (isVisible) => {
      if (isVisible) callback(element);
    }, { once: true });
  });
}

/**
 * Parallax scroll effect
 * @param {HTMLElement} element - Element to apply parallax
 * @param {number} speed - Parallax speed (0.1 - 2.0)
 */
export function createParallax(element, speed = 0.5) {
  if (!element) return;
  
  let ticking = false;
  
  function updateParallax() {
    const rect = element.getBoundingClientRect();
    const scrolled = window.pageYOffset || document.documentElement.scrollTop;
    const elementTop = rect.top + scrolled;
    const elementVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (elementVisible) {
      const offset = (scrolled - elementTop) * speed;
      element.style.transform = `translateY(${offset}px)`;
    }
    
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick, { passive: true });
  updateParallax(); // Initial call
}

/**
 * Progress bar that fills on scroll
 * @param {HTMLElement} progressBar - Progress bar element
 */
export function createScrollProgress(progressBar) {
  if (!progressBar) return;
  
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrolled / documentHeight) * 100;
    
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }
  
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress(); // Initial call
}
