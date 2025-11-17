// Navigation utility with smooth transition
function goBack() {
  const overlay = document.querySelector('.page-transition-overlay');
  if (overlay) {
    overlay.classList.add('active');
  }
  setTimeout(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../index.html';
    }
  }, 400);
}

// Global state
let currentIndex = 0;
let messages = [];
let isAnimating = false;

// Elements
const messageStack = document.getElementById('messageStack');
const currentMessageEl = document.getElementById('currentMessage');
const totalMessagesEl = document.getElementById('totalMessages');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('messageDots');

// Smooth page fade in with RAF for perfect timing
function fadeInPage() {
  const overlay = document.querySelector('.page-transition-overlay');
  if (overlay) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.remove('active');
      });
    });
  }
}

// Animate navigation buttons entrance
function animateControlsEntrance() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn, index) => {
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0.8)';
    setTimeout(() => {
      btn.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    }, 800 + (index * 100));
  });
}

// Initialize
function init() {
  // Back button
  document.getElementById('backBtn').addEventListener('click', goBack);
  
  // Fade in page
  fadeInPage();
  
  // Animate controls
  animateControlsEntrance();
  
  // Load messages
  if (typeof MESSAGES_DATA === 'undefined') {
    messageStack.innerHTML = `
      <div class="message-card active">
        <div class="message-icon">⚠️</div>
        <div class="message-title">Unable to load messages</div>
        <div class="message-content">Please make sure messages.js is loaded.</div>
      </div>
    `;
    return;
  }
  
  messages = MESSAGES_DATA;
  totalMessagesEl.textContent = messages.length;
  
  // Create all message cards
  createAllCards();
  
  // Create navigation dots
  createDots();
  
  // Update UI
  updateUI();
  
  // Navigation buttons with smooth feedback
  prevBtn.addEventListener('click', (e) => {
    e.currentTarget.style.transform = 'scale(0.9)';
    setTimeout(() => {
      e.currentTarget.style.transform = '';
    }, 100);
    showPrevious();
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.currentTarget.style.transform = 'scale(0.9)';
    setTimeout(() => {
      e.currentTarget.style.transform = '';
    }, 100);
    showNext();
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showPrevious();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape') goBack();
  });
  
  // Swipe support for touch devices
  let touchStartX = 0;
  let touchEndX = 0;
  
  messageStack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  messageStack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - next
      showNext();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - previous
      showPrevious();
    }
  }
}

// Create all message cards
function createAllCards() {
  messageStack.innerHTML = '';
  
  messages.forEach((message, index) => {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.dataset.index = index;
    
    // Add entrance animation for first card (without transform override)
    if (index === 0) {
      card.style.opacity = '0';
      setTimeout(() => {
        card.style.transition = 'opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.opacity = '1';
      }, 600);
    }
    
    card.innerHTML = `
      <div class="message-icon">${message.icon}</div>
      <div class="message-title">${message.title}</div>
      ${message.date ? `<div class="message-date">${message.date}</div>` : ''}
      <div class="message-content">${message.content}</div>
      ${message.signature ? `<div class="message-signature">${message.signature}</div>` : ''}
    `;
    
    // Click card to go to next
    card.addEventListener('click', () => {
      if (parseInt(card.dataset.index) === currentIndex && currentIndex < messages.length - 1) {
        showNext();
      }
    });
    
    messageStack.appendChild(card);
  });
  
  updateCardPositions(false);
}

// Create navigation dots with entrance animation
function createDots() {
  dotsContainer.innerHTML = '';
  messages.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (index === 0) dot.classList.add('active');
    
    // Entrance animation
    dot.style.opacity = '0';
    dot.style.transform = 'scale(0)';
    setTimeout(() => {
      dot.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease';
      dot.style.opacity = '1';
      dot.style.transform = 'scale(1)';
    }, 1000 + (index * 50));
    
    // Click with feedback
    dot.addEventListener('click', () => {
      dot.style.transform = 'scale(1.5)';
      setTimeout(() => {
        dot.style.transform = 'scale(1)';
        goToMessage(index);
      }, 150);
    });
    
    dotsContainer.appendChild(dot);
  });
}

// Update card positions - only show current card, remove others
function updateCardPositions(animate = true) {
  const cards = messageStack.querySelectorAll('.message-card');
  
  cards.forEach((card, index) => {
    // Remove all state classes
    card.classList.remove('active', 'fade-in', 'fade-out');
    
    if (index === currentIndex) {
      // Show current card
      card.classList.add('active');
      card.style.display = '';
      if (animate) {
        card.classList.add('fade-in');
      }
    } else {
      // Completely hide other cards to prevent stacking
      card.style.display = 'none';
    }
  });
}

// Update UI elements
function updateUI() {
  // Update counter
  currentMessageEl.textContent = currentIndex + 1;
  
  // Update navigation buttons
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === messages.length - 1;
  
  // Update dots
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

// Navigation functions
function showPrevious() {
  if (currentIndex > 0 && !isAnimating) {
    const activeCard = messageStack.querySelector('.message-card.active');
    if (activeCard) {
      isAnimating = true;
      activeCard.classList.add('fade-out');
      
      setTimeout(() => {
        currentIndex--;
        updateCardPositions(true);
        updateUI();
        isAnimating = false;
      }, 400);
    }
  }
}

function showNext() {
  if (currentIndex < messages.length - 1 && !isAnimating) {
    const activeCard = messageStack.querySelector('.message-card.active');
    if (activeCard) {
      isAnimating = true;
      
      // Add subtle scale effect before transition
      activeCard.style.transform = 'translate(-50%, -50%) scale(0.98)';
      setTimeout(() => {
        activeCard.classList.add('fade-out');
      }, 100);
      
      setTimeout(() => {
        currentIndex++;
        updateCardPositions(true);
        updateUI();
        isAnimating = false;
      }, 400);
    }
  }
}

function goToMessage(index) {
  if (index === currentIndex || isAnimating) return;
  
  const activeCard = messageStack.querySelector('.message-card.active');
  
  if (activeCard) {
    isAnimating = true;
    activeCard.classList.add('fade-out');
    
    setTimeout(() => {
      currentIndex = index;
      updateCardPositions(true);
      updateUI();
      isAnimating = false;
    }, 400);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
