// Navigation utility
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '../index.html';
  }
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

// Initialize
function init() {
  // Back button
  document.getElementById('backBtn').addEventListener('click', goBack);
  
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
  
  // Navigation buttons
  prevBtn.addEventListener('click', showPrevious);
  nextBtn.addEventListener('click', showNext);
  
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

// Create navigation dots
function createDots() {
  dotsContainer.innerHTML = '';
  messages.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToMessage(index));
    dotsContainer.appendChild(dot);
  });
}

// Update card positions
function updateCardPositions(animate = true) {
  const cards = messageStack.querySelectorAll('.message-card');
  
  cards.forEach((card, index) => {
    // Remove all state classes
    card.classList.remove('active', 'fade-in', 'fade-out');
    
    if (index === currentIndex) {
      card.classList.add('active');
      if (animate) {
        card.classList.add('fade-in');
      }
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
      activeCard.classList.add('fade-out');
      
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
