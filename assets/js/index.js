// Navigation utilities
function navigateTo(path) {
  const overlay = document.querySelector('.page-transition-overlay');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      window.location.href = path;
    }, 300);
  } else {
    window.location.href = path;
  }
}

// Storage utilities
const STORAGE_PREFIX = 'birthday_';

function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_PREFIX + 'preferences', JSON.stringify(prefs));
    return true;
  } catch (e) {
    console.warn('Could not save preferences');
    return false;
  }
}

function loadPreferences() {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + 'preferences');
    return item ? JSON.parse(item) : {
      hasVisitedSplash: false,
      preferredCharacter: null,
      chatHistory: {},
      viewedMessages: [],
      viewedPuns: []
    };
  } catch (e) {
    return {
      hasVisitedSplash: false,
      preferredCharacter: null,
      chatHistory: {},
      viewedMessages: [],
      viewedPuns: []
    };
  }
}

// Helper utilities
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random sparkles in background
function createSparkles() {
  const container = document.getElementById('sparklesContainer');
  const sparkleCount = 30;
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${randomInRange(0, 100)}%`;
    sparkle.style.top = `${randomInRange(0, 100)}%`;
    sparkle.style.animationDelay = `${randomInRange(0, 3)}s`;
    sparkle.style.animationDuration = `${randomInRange(2, 4)}s`;
    container.appendChild(sparkle);
  }
}

// Add button click handler
function initButton() {
  const button = document.getElementById('enterButton');
  
  // Navigate to hub on click
  button.addEventListener('click', (e) => {
    // Add ripple effect
    button.classList.add('ripple');
    setTimeout(() => button.classList.remove('ripple'), 600);
    
    // Save that user has visited splash
    const prefs = loadPreferences();
    prefs.hasVisitedSplash = true;
    savePreferences(prefs);
    
    // Navigate to hub (fixed path) with slight delay for effect
    setTimeout(() => {
      navigateTo('assets/html/hub.html');
    }, 300);
  });
}

// Handle missing image gracefully
function handleImageError() {
  const img = document.getElementById('profileImage');
  img.addEventListener('error', () => {
    // Create placeholder with gradient
    img.style.display = 'none';
    const frame = document.querySelector('.photo-frame');
    frame.style.background = 'linear-gradient(135deg, var(--color-accent-love), var(--color-accent-hope))';
    frame.style.display = 'flex';
    frame.style.alignItems = 'center';
    frame.style.justifyContent = 'center';
    frame.innerHTML = '<span style="font-size: 4rem;">🎂</span>';
  });
}

// Start loading sequence
function startLoadingSequence() {
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBar = document.getElementById('loadingBar');
  const vignette = document.querySelector('.vignette');
  const photoFrame = document.querySelector('.photo-frame');
  const button = document.getElementById('enterButton');
  
  console.log('🎂 Starting loading sequence...');
  
  // Start the progress bar animation after a tiny delay to ensure CSS is loaded
  setTimeout(() => {
    console.log('📊 Starting progress bar animation');
    loadingBar.classList.add('filling');
  }, 100);
  
  // After 10 seconds, hide loading screen and show content
  setTimeout(() => {
    console.log('✅ Loading complete! Revealing content...');
    loadingScreen.classList.add('hidden');
    
    // Start the reveal animations
    setTimeout(() => {
      console.log('🎭 Starting vignette, photo, and button animations');
      vignette.classList.add('animate');
      photoFrame.classList.add('animate');
      button.classList.add('animate');
      
      // After button animation completes, add floating animation
      setTimeout(() => {
        button.classList.add('revealed');
        console.log('✨ Button now floating');
      }, 1500);
    }, 200);
    
    setTimeout(() => {
      loadingScreen.remove();
      console.log('🗑️ Loading screen removed');
    }, 700);
  }, 10100); // 10 seconds + tiny buffer for the animation
}

// Initialize everything
function init() {
  console.log('🚀 Initializing birthday surprise...');
  createSparkles();
  initButton();
  handleImageError();
  startLoadingSequence();
  
  // Check if user has visited before
  const prefs = loadPreferences();
  if (prefs.hasVisitedSplash) {
    console.log('Welcome back! 🎉');
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
