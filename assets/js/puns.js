// Navigation utility
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '../index.html';
  }
}

// Wait utility
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Storage utilities
const STORAGE_PREFIX = 'birthday_';
function saveToStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}
function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}



// Elements
const punCard = document.getElementById('punCard');
const punIcon = document.getElementById('punIcon');
const punText = document.getElementById('punText');
const punAnswer = document.getElementById('punAnswer');
const punCategory = document.getElementById('punCategory');
const punButton = document.getElementById('punButton');
const revealButton = document.getElementById('revealButton');
const punCounter = document.getElementById('punCounter');

// State
let puns = [];
let shuffledPuns = [];
let currentIndex = -1;
let viewedCount = 0;
let isAnimating = false;
let isAnswerRevealed = false;

// Icons for different categories
const categoryIcons = {
  food: '🍕',
  animal: '🐶',
  science: '🔬',
  general: '😄',
  dad: '👨',
  music: '🎵',
  tech: '💻'
};

// Shuffle array utility
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Initialize
function init() {
  // Back button
  document.getElementById('backBtn').addEventListener('click', () => {
    saveProgress();
    goBack();
  });
  
  // Pun button
  punButton.addEventListener('click', showNextPun);
  
  // Reveal button
  revealButton.addEventListener('click', revealAnswer);
  
  // Load puns from global PUNS_DATA
  if (typeof PUNS_DATA !== 'undefined') {
    puns = PUNS_DATA;
    shuffledPuns = shuffleArray(puns);
    console.log(`✅ Loaded ${puns.length} puns`);
  } else {
    console.error('❌ PUNS_DATA not found!');
  }
  
  // Load progress
  viewedCount = loadFromStorage('puns_viewed_count', 0);
  updateCounter();
}

// Show next pun
async function showNextPun() {
  if (isAnimating || puns.length === 0) return;
  
  isAnimating = true;
  isAnswerRevealed = false;
  punButton.classList.add('loading');
  
  // Get next pun first
  currentIndex = (currentIndex + 1) % shuffledPuns.length;
  
  // Reshuffle when reaching the end
  if (currentIndex === 0 && viewedCount > 0) {
    shuffledPuns = shuffleArray(puns);
  }
  
  const pun = shuffledPuns[currentIndex];
  
  // If card is showing, do smooth transition
  if (punCard.style.display !== 'none') {
    // Fade out
    punCard.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    punCard.style.opacity = '0';
    punCard.style.transform = 'scale(0.95)';
    
    await wait(250);
    
    // Update content while hidden
    punText.textContent = pun.question;
    punAnswer.textContent = pun.answer;
    punAnswer.style.display = 'none';
    punAnswer.classList.remove('active');
    punCategory.textContent = pun.category || 'general';
    punIcon.textContent = categoryIcons[pun.category] || categoryIcons.general;
    
    // Reset reveal button
    revealButton.style.display = 'inline-block';
    revealButton.style.opacity = '1';
    revealButton.style.transform = 'scale(1)';
    
    // Fade in with new content
    punCard.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
    punCard.style.transform = 'scale(1)';
    punCard.style.opacity = '1';
    
  } else {
    // First time showing - just display
    punText.textContent = pun.question;
    punAnswer.textContent = pun.answer;
    punAnswer.style.display = 'none';
    punAnswer.classList.remove('active');
    punCategory.textContent = pun.category || 'general';
    punIcon.textContent = categoryIcons[pun.category] || categoryIcons.general;
    
    punCard.style.display = 'block';
    punCard.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
    punCard.style.opacity = '0';
    punCard.style.transform = 'scale(0.9)';
    revealButton.style.display = 'inline-block';
    revealButton.style.opacity = '1';
    revealButton.style.transform = 'scale(1)';
    
    await wait(50);
    punCard.style.opacity = '1';
    punCard.style.transform = 'scale(1)';
  }
  
  // Update counter
  viewedCount++;
  updateCounter();
  saveProgress();
  
  // Re-enable button
  punButton.classList.remove('loading');
  punButton.textContent = 'Give Me Another! 🎉';
  isAnimating = false;
}

// Reveal answer
async function revealAnswer() {
  if (isAnswerRevealed || isAnimating) return;
  
  isAnswerRevealed = true;
  
  // Trigger confetti from top
  window.confettiFromTop();
  
  // Hide reveal button
  revealButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  revealButton.style.opacity = '0';
  revealButton.style.transform = 'scale(0.5)';
  
  await wait(200);
  revealButton.style.display = 'none';
  
  // Show answer overlay
  punAnswer.style.display = 'flex';
  await wait(50);
  punAnswer.classList.add('active');
}

// Update counter
function updateCounter() {
  punCounter.textContent = `You've enjoyed ${viewedCount} pun${viewedCount !== 1 ? 's' : ''} so far...`;
}

// Save progress
function saveProgress() {
  saveToStorage('puns_viewed_count', viewedCount);
}

// Save on page unload
window.addEventListener('beforeunload', saveProgress);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
