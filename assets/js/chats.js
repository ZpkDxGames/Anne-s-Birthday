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

// Animate header buttons entrance
function animateHeaderButtons() {
  const headerButtons = document.querySelectorAll('.icon-btn');
  headerButtons.forEach((btn, index) => {
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0) rotate(180deg)';
    setTimeout(() => {
      btn.style.transition = 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1) rotate(0deg)';
    }, 600 + (index * 100));
  });
}

// Animate input area entrance
function animateInputEntrance() {
  const inputArea = document.querySelector('.input-area');
  if (inputArea && inputArea.classList.contains('active')) {
    inputArea.style.transform = 'translateY(100%)';
    setTimeout(() => {
      inputArea.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      inputArea.style.transform = 'translateY(0)';
    }, 800);
  }
}

// Send chat message to Groq API
// Wrapper function to use imported Groq API with character params
async function sendChatMessage(userMessage, conversationHistory, character) {
  try {
    // Calculate dynamic max_tokens based on user input length
    const userWordCount = userMessage.trim().split(/\s+/).length;
    let dynamicMaxTokens;
    
    if (userWordCount <= 3) {
      // Very short input (1-3 words) - extremely brief response
      dynamicMaxTokens = 80;
    } else if (userWordCount <= 8) {
      // Short input (4-8 words) - keep it concise
      dynamicMaxTokens = 150;
    } else if (userWordCount <= 20) {
      // Medium input (9-20 words) - moderate response
      dynamicMaxTokens = 250;
    } else if (userWordCount <= 40) {
      // Longer input (21-40 words) - fuller response
      dynamicMaxTokens = 400;
    } else {
      // Very long input (40+ words) - match their energy
      dynamicMaxTokens = Math.min(600, character.params.max_tokens);
    }
    
    // Create dynamic params
    const dynamicParams = {
      ...character.params,
      max_tokens: dynamicMaxTokens
    };
    
    // Build comprehensive context with conversation flow analysis
    let sessionContext = '';
    
    if (conversationHistory.length > 0) {
      // Get last few messages to check for topic continuity
      const recentMessages = conversationHistory.slice(-3);
      const topics = new Set();
      recentMessages.forEach(msg => {
        if (msg.role === 'user' && msg.content) {
          topics.add(msg.content.toLowerCase());
        }
      });
      
      // Check if current message is exploring the same topic vs actually repeating
      const isNewAngle = userWordCount > 5 || userMessage.includes('?') || 
                        userMessage.toLowerCase().includes('but') || 
                        userMessage.toLowerCase().includes('what about');
      
      sessionContext = `\n\n[CONVERSATION CONTEXT:\n- This is an ongoing chat with ${conversationHistory.length} previous messages\n- The conversation is flowing naturally - they're building on topics, not repeating themselves\n- If they mention something similar to before, they're likely exploring it from a new angle or continuing the thread\n- DO NOT ask if they're repeating themselves or say things like "didn't you just say that?" - assume good faith\n- Reference earlier points only when directly relevant, don't call out similarities\n- Match their energy: ${userWordCount <= 3 ? 'VERY brief reply (1 sentence max)' : userWordCount <= 8 ? 'short response (1-2 sentences)' : userWordCount <= 20 ? 'moderate reply (2-3 sentences)' : 'you can elaborate more'}]`;
    } else {
      sessionContext = `\n\n[CONVERSATION CONTEXT: This is the start of a new conversation. Be welcoming and ${userWordCount <= 3 ? 'very brief (1 sentence)' : 'concise (2-3 sentences)'}.]`;
    }
    
    const enhancedPrompt = character.systemPrompt + sessionContext;
    
    const response = await window.GroqAPI.sendChatMessage(
      userMessage,
      conversationHistory,
      enhancedPrompt,
      character.model,
      dynamicParams,
      character.id
    );
    return response;
  } catch (error) {
    console.error('Chat error:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again.";
  }
}

// Global state
let currentCharacter = null;
let conversationHistory = {}; // Legacy format
let chatSessions = {}; // { characterId: { sessions: { sessionId: {name, messages, created} }, activeSession: sessionId } }
let isProcessing = false;
let typingTimeout = null;

// Elements - will be initialized in init()
let messagesArea;
let messageInput;
let sendBtn;
let typingIndicator;
let userTypingIndicator;
let characterModal;
let headerTitle;

// Initialize
function init() {
  // Fade in page
  fadeInPage();
  
  // Get DOM elements
  messagesArea = document.getElementById('messagesArea');
  messageInput = document.getElementById('messageInput');
  sendBtn = document.getElementById('sendBtn');
  typingIndicator = document.getElementById('typingIndicator');
  userTypingIndicator = document.getElementById('userTypingIndicator');
  characterModal = document.getElementById('characterModal');
  headerTitle = document.getElementById('headerTitle');
  
  // Animate header buttons
  animateHeaderButtons();
  
  // Back button
  document.getElementById('backBtn').addEventListener('click', () => {
    saveAllConversations();
    goBack();
  });

  // Character button
  document.getElementById('characterBtn').addEventListener('click', () => {
    openCharacterModal();
  });

  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    openSettingsModal();
  });
  
  // Modal actions
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearCurrentHistory);

  const backToListBtn = document.getElementById('backToListBtn');
  if (backToListBtn) {
    backToListBtn.addEventListener('click', showSessionListView);
  }

  // Character selection
  document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
      const charId = card.dataset.character;
      selectCharacter(charId);
      closeCharacterModal();
    });
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeCharacterModal();
        closeSettingsModal();
      }
    });
  });

  // Send button
  sendBtn.addEventListener('click', sendMessage);

  // Enter to send (Shift+Enter for new line)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    if (messageInput.value === '') {
      // Reset to initial state when empty
      messageInput.style.height = '44px';
      messageInput.style.overflow = 'hidden';
    } else {
      // Reset height to get accurate scrollHeight
      messageInput.style.height = 'auto';
      messageInput.style.overflow = 'hidden';
      
      // Calculate new height
      const newHeight = Math.min(Math.max(messageInput.scrollHeight, 44), 120);
      messageInput.style.height = newHeight + 'px';
      
      // Show scrollbar only if content exceeds max height
      if (messageInput.scrollHeight > 120) {
        messageInput.style.overflow = 'auto';
      }
    }
    
    // Show user typing indicator
    showUserTyping();
  });

  // Load conversation history (migrate from legacy if needed)
  conversationHistory = loadFromStorage('chat_history', {});
  chatSessions = loadFromStorage('chat_sessions', {});
  migrateLegacyHistory();
}

// Migrate legacy history to sessions format
function migrateLegacyHistory() {
  Object.keys(conversationHistory).forEach(charId => {
    if (!chatSessions[charId] && conversationHistory[charId].length > 0) {
      const sessionId = generateSessionId();
      chatSessions[charId] = {
        sessions: {
          [sessionId]: {
            name: 'Main Chat',
            messages: conversationHistory[charId],
            created: Date.now()
          }
        },
        activeSession: sessionId
      };
    }
  });
  if (Object.keys(chatSessions).length > 0) {
    saveToStorage('chat_sessions', chatSessions);
  }
}

// Generate unique session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create session for character
function getOrCreateSession(charId) {
  if (!chatSessions[charId]) {
    const sessionId = generateSessionId();
    chatSessions[charId] = {
      sessions: {
        [sessionId]: {
          name: 'Main Chat',
          messages: [],
          created: Date.now()
        }
      },
      activeSession: sessionId
    };
    saveToStorage('chat_sessions', chatSessions);
  }
  return chatSessions[charId];
}

// Get active session messages
function getActiveSessionMessages(charId) {
  const charSessions = getOrCreateSession(charId);
  const activeId = charSessions.activeSession;
  return charSessions.sessions[activeId]?.messages || [];
}

// Save message to active session
function saveMessageToSession(charId, message) {
  const charSessions = getOrCreateSession(charId);
  const activeId = charSessions.activeSession;
  if (!charSessions.sessions[activeId].messages) {
    charSessions.sessions[activeId].messages = [];
  }
  charSessions.sessions[activeId].messages.push(message);
  saveToStorage('chat_sessions', chatSessions);
}

// Show user typing indicator
function showUserTyping() {
  userTypingIndicator.classList.add('active');
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    userTypingIndicator.classList.remove('active');
  }, 1000);
}

// Open character modal
function openCharacterModal() {
  characterModal.classList.add('active');
  
  // Update active state
  document.querySelectorAll('.character-card').forEach(card => {
    card.classList.toggle('active', card.dataset.character === currentCharacter);
  });
}

// Close character modal
function closeCharacterModal() {
  characterModal.classList.remove('active');
}

// Select character
async function selectCharacter(characterId) {
  currentCharacter = characterId;
  const character = window.Characters.getCharacterById(characterId);
  
  // Update header to show only session (character name now in messages)
  headerTitle.textContent = '';
  
  // Show input area with animation
  const inputArea = document.querySelector('.input-area');
  if (inputArea) {
    inputArea.classList.add('active');
    // Animate entrance
    animateInputEntrance();
  }
  
  // Load conversation
  await loadConversation(characterId);
}

// Load conversation
async function loadConversation(characterId) {
  const character = window.Characters.getCharacterById(characterId);
  messagesArea.innerHTML = '';
  
  // Get active session history
  const history = getActiveSessionMessages(characterId);
  
  if (history.length === 0) {
    // Show typing indicator while generating greeting
    typingIndicator.setAttribute('data-character', characterId);
    typingIndicator.classList.add('active');
    
    try {
      // Generate AI greeting
      const greeting = await window.Characters.generateCharacterGreeting(character);
      typingIndicator.classList.remove('active');
      
      // Show greeting
      addMessage(greeting, 'ai', character.avatar, false);
      
      // Save greeting to session
      saveMessageToSession(characterId, { role: 'assistant', content: greeting });
    } catch (error) {
      console.error('Error generating greeting:', error);
      typingIndicator.classList.remove('active');
      // Fallback to default greeting
      addMessage(character.greeting, 'ai', character.avatar, false);
    }
  } else {
    // Restore history
    history.forEach(msg => {
      const avatarSrc = msg.role === 'user' ? '../images/characters/anne.webp' : character.avatar;
      addMessage(msg.content, msg.role, avatarSrc, false);
    });
  }
  
  updateSessionIndicator();
  scrollToBottom();
}

// Update session indicator as floating notification
function updateSessionIndicator() {
  const headerTitle = document.getElementById('headerTitle');
  
  if (!currentCharacter) {
    // No character selected - show default text
    headerTitle.textContent = 'Select Character';
    return;
  }
  
  const charSessions = chatSessions[currentCharacter];
  if (!charSessions) return;
  
  const activeSession = charSessions.sessions[charSessions.activeSession];
  const sessionName = activeSession?.name || 'Main Chat';
  
  // Show session name as main header content
  headerTitle.textContent = `📝 ${sessionName}`;
}

// Session Management Functions
// Settings modal for session management
function openSettingsModal() {
  if (!currentCharacter) {
    showError('Please select a character first!', '⚠️', 'No Character');
    return;
  }
  
  const modal = document.getElementById('settingsModal');
  showSessionListView();
  modal.classList.add('active');
}

function closeSettingsModal() {
  const modal = document.getElementById('settingsModal');
  modal.classList.remove('active');
}

function showSessionListView() {
  const listView = document.getElementById('characterListView');
  const detailView = document.getElementById('characterDetailView');
  const historyList = document.getElementById('historyList');
  
  listView.style.display = 'flex';
  detailView.style.display = 'none';
  
  historyList.innerHTML = '';
  
  const character = window.Characters.getCharacterById(currentCharacter);
  const charSessions = chatSessions[currentCharacter];
  
  if (!charSessions || Object.keys(charSessions.sessions).length === 0) {
    historyList.innerHTML = '<div class="history-empty">No chat sessions yet. Start a conversation!</div>';
    return;
  }
  
  // Add "New Session" button
  const newSessionBtn = document.createElement('div');
  newSessionBtn.className = 'history-item new-session-btn';
  newSessionBtn.innerHTML = `
    <div class="history-item-header">
      <span class="history-character">➕ Create New Session</span>
    </div>
  `;
  newSessionBtn.onclick = () => createNewSession();
  historyList.appendChild(newSessionBtn);
  
  // List all sessions
  Object.entries(charSessions.sessions).forEach(([sessionId, session]) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    if (sessionId === charSessions.activeSession) {
      item.classList.add('active-session');
    }
    
    const messageCount = session.messages?.length || 0;
    const lastMessage = messageCount > 0 ? session.messages[messageCount - 1].content : 'No messages yet';
    const preview = lastMessage.substring(0, 60) + (lastMessage.length > 60 ? '...' : '');
    
    item.innerHTML = `
      <div class="history-item-header">
        <span class="history-character">${session.name}</span>
        <span class="history-count">${messageCount} messages</span>
      </div>
      <div class="history-preview">${preview}</div>
      <div class="session-actions">
        <button class="session-action-btn" onclick="event.stopPropagation(); renameSession('${sessionId}')">✏️ Rename</button>
        <button class="session-action-btn danger" onclick="event.stopPropagation(); deleteSession('${sessionId}')">🗑️ Delete</button>
      </div>
    `;
    
    // Click on item to switch to that session
    item.onclick = () => {
      if (sessionId !== charSessions.activeSession) {
        switchToSession(sessionId);
      }
    };
    historyList.appendChild(item);
  });
}

function showSessionDetailView(sessionId) {
  const listView = document.getElementById('characterListView');
  const detailView = document.getElementById('characterDetailView');
  const headerEl = document.getElementById('selectedCharacterHeader');
  const previewListEl = document.getElementById('messagePreviewList');
  
  const char = window.Characters.getCharacterById(currentCharacter);
  const session = chatSessions[currentCharacter].sessions[sessionId];
  const messages = session.messages || [];
  
  listView.style.display = 'none';
  detailView.style.display = 'flex';
  
  headerEl.innerHTML = `
    <div class="character-emoji">${char.emoji}</div>
    <div class="character-name">${session.name}</div>
    <div class="message-count">${messages.length} messages</div>
  `;
  
  previewListEl.innerHTML = '';
  if (messages.length === 0) {
    previewListEl.innerHTML = '<div class="history-empty">No messages yet</div>';
  } else {
    messages.forEach(msg => {
      const preview = document.createElement('div');
      preview.className = `message-preview-item ${msg.role}`;
      preview.innerHTML = `
        <div class="message-preview-role">${msg.role === 'user' ? 'You' : char.name}</div>
        <div class="message-preview-text">${msg.content}</div>
      `;
      previewListEl.appendChild(preview);
    });
    previewListEl.scrollTop = previewListEl.scrollHeight;
  }
}

async function createNewSession() {
  const sessionName = await showPrompt('Enter a name for the new session:', 'New Session', 'Untitled Chat');
  if (!sessionName) return;
  
  const sessionId = generateSessionId();
  const charSessions = getOrCreateSession(currentCharacter);
  
  charSessions.sessions[sessionId] = {
    name: sessionName,
    messages: [],
    created: Date.now()
  };
  
  saveToStorage('chat_sessions', chatSessions);
  showSessionListView();
  showSuccess(`Session "${sessionName}" created!`, '✅');
}

async function switchToSession(sessionId) {
  chatSessions[currentCharacter].activeSession = sessionId;
  saveToStorage('chat_sessions', chatSessions);
  loadConversation(currentCharacter);
  closeSettingsModal();
  showSuccess('Session switched!', '📂');
}

async function renameSession(sessionId) {
  const session = chatSessions[currentCharacter].sessions[sessionId];
  const newName = await showPrompt('Enter new name for this session:', 'Rename Session', session.name);
  if (!newName) return;
  
  session.name = newName;
  saveToStorage('chat_sessions', chatSessions);
  showSessionListView();
  updateSessionIndicator();
  showSuccess('Session renamed!', '✏️');
}

async function deleteSession(sessionId) {
  const session = chatSessions[currentCharacter].sessions[sessionId];
  const confirmed = await showDangerConfirm(
    `Are you sure you want to delete "${session.name}"? This cannot be undone.`,
    '🗑️',
    'Delete Session?'
  );
  
  if (!confirmed) return;
  
  const charSessions = chatSessions[currentCharacter];
  delete charSessions.sessions[sessionId];
  
  // If deleted session was active, switch to first available
  if (charSessions.activeSession === sessionId) {
    const remaining = Object.keys(charSessions.sessions);
    if (remaining.length > 0) {
      charSessions.activeSession = remaining[0];
      loadConversation(currentCharacter);
    } else {
      // Create new session if none left
      const newId = generateSessionId();
      charSessions.sessions[newId] = {
        name: 'Main Chat',
        messages: [],
        created: Date.now()
      };
      charSessions.activeSession = newId;
      loadConversation(currentCharacter);
    }
  }
  
  saveToStorage('chat_sessions', chatSessions);
  showSessionListView();
  showSuccess('Session deleted!', '🗑️');
}

// Prompt utility for text input
async function showPrompt(message, title = 'Input', defaultValue = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'notification-modal';
    
    modal.innerHTML = `
      <div class="notification-icon">💬</div>
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
      <input type="text" class="notification-input" value="${defaultValue}" placeholder="Enter text...">
      <div class="notification-actions">
        <button class="notification-btn secondary" data-action="cancel">Cancel</button>
        <button class="notification-btn primary" data-action="confirm">OK</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const input = modal.querySelector('.notification-input');
    input.focus();
    input.select();
    
    const handleAction = (action) => {
      overlay.remove();
      resolve(action === 'confirm' ? input.value.trim() : null);
    };
    
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.action));
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAction('confirm');
      if (e.key === 'Escape') handleAction('cancel');
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleAction('cancel');
    });
    
    setTimeout(() => overlay.classList.add('active'), 10);
  });
}

// Add message to UI
function addMessage(text, role, avatarSrc, animate = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  // Add character data attribute for AI messages
  if ((role === 'ai' || role === 'assistant') && currentCharacter) {
    messageDiv.setAttribute('data-character', currentCharacter);
  }
  
  // Create header with avatar and name
  const header = document.createElement('div');
  header.className = 'message-header';
  
  // Create avatar
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  
  // Check if avatarSrc is an image path or emoji
  if (avatarSrc && (avatarSrc.includes('/') || avatarSrc.includes('.'))) {
    // It's an image path
    const img = document.createElement('img');
    img.src = avatarSrc;
    img.alt = 'Avatar';
    img.onerror = function() {
      // Fallback to emoji if image fails to load
      this.style.display = 'none';
      avatar.textContent = role === 'user' ? '👤' : '🤖';
    };
    avatar.appendChild(img);
  } else {
    // It's an emoji
    avatar.textContent = avatarSrc;
  }
  
  // Create name label
  const nameLabel = document.createElement('div');
  nameLabel.className = 'message-name';
  
  if (role === 'user') {
    nameLabel.textContent = 'Anne';
  } else if ((role === 'ai' || role === 'assistant') && currentCharacter) {
    const character = window.Characters.getCharacterById(currentCharacter);
    nameLabel.textContent = character.name;
  }
  
  header.appendChild(avatar);
  header.appendChild(nameLabel);
  
  // Create divider line
  const divider = document.createElement('div');
  divider.className = 'message-divider';
  
  // Create content
  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;
  
  messageDiv.appendChild(header);
  messageDiv.appendChild(divider);
  messageDiv.appendChild(content);
  
  if (!animate) {
    messageDiv.style.animation = 'none';
  }
  
  messagesArea.appendChild(messageDiv);
  scrollToBottom();
}

// Send message
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || isProcessing || !currentCharacter) return;
  
  // Disable input
  isProcessing = true;
  sendBtn.disabled = true;
  messageInput.disabled = true;
  userTypingIndicator.classList.remove('active');
  
  // Add user message
  addMessage(text, 'user', '../images/characters/anne.webp');
  messageInput.value = '';
  messageInput.style.height = '44px';
  
  // Save to session
  saveMessageToSession(currentCharacter, { role: 'user', content: text });
  
  // Show typing indicator with character color
  typingIndicator.setAttribute('data-character', currentCharacter);
  typingIndicator.classList.add('active');
  await wait(500);
  
  try {
    // Get character
    const character = window.Characters.getCharacterById(currentCharacter);
    const history = getActiveSessionMessages(currentCharacter);
    
    // Send to API with full character object
    const response = await sendChatMessage(
      text,
      history,
      character
    );
    
    // Hide typing indicator
    typingIndicator.classList.remove('active');
    
    // Add AI response
    addMessage(response, 'ai', character.avatar);
    
    // Save response to session
    saveMessageToSession(currentCharacter, { role: 'assistant', content: response });
    
  } catch (error) {
    console.error('Error:', error);
    typingIndicator.classList.remove('active');
    addMessage("Sorry, something went wrong. Please try again.", 'ai', '⚠️');
  }
  
  // Re-enable input
  isProcessing = false;
  sendBtn.disabled = false;
  messageInput.disabled = false;
  messageInput.focus();
}

// Scroll to bottom
function scrollToBottom() {
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Save all conversations
function saveAllConversations() {
  saveToStorage('chat_history', conversationHistory); // Legacy support
  saveToStorage('chat_sessions', chatSessions);
}

// Save on page unload
window.addEventListener('beforeunload', saveAllConversations);

// History modal state
let selectedHistoryCharacter = null;

// History modal functions
function openHistoryModal() {
  const modal = document.getElementById('historyModal');
  
  // If user has a current character selected, show their detail view directly
  if (currentCharacter && conversationHistory[currentCharacter] && conversationHistory[currentCharacter].length > 0) {
    showCharacterDetailView(currentCharacter);
  } else {
    showCharacterListView();
  }
  
  modal.classList.add('active');
}

function showCharacterListView() {
  const listView = document.getElementById('characterListView');
  const detailView = document.getElementById('characterDetailView');
  const historyList = document.getElementById('historyList');
  
  // Show list view, hide detail view
  listView.style.display = 'flex';
  detailView.style.display = 'none';
  selectedHistoryCharacter = null;
  
  // Clear and populate character list
  historyList.innerHTML = '';
  
  if (Object.keys(conversationHistory).length === 0) {
    historyList.innerHTML = '<div class="history-empty">No chat history yet. Start a conversation!</div>';
  } else {
    Object.keys(conversationHistory).forEach(charId => {
      const char = window.Characters.getCharacterById(charId);
      const history = conversationHistory[charId];
      
      if (history && history.length > 0) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.onclick = () => showCharacterDetailView(charId);
        
        const lastMessage = history[history.length - 1];
        const preview = lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '');
        
        item.innerHTML = `
          <div class="history-item-header">
            <span class="history-character">${char.emoji} ${char.name}</span>
            <span class="history-count">${history.length} messages</span>
          </div>
          <div class="history-preview">${preview}</div>
        `;
        
        historyList.appendChild(item);
      }
    });
  }
}

function showCharacterDetailView(charId) {
  const listView = document.getElementById('characterListView');
  const detailView = document.getElementById('characterDetailView');
  const headerEl = document.getElementById('selectedCharacterHeader');
  const previewListEl = document.getElementById('messagePreviewList');
  
  selectedHistoryCharacter = charId;
  const char = window.Characters.getCharacterById(charId);
  const history = conversationHistory[charId] || [];
  
  // Show detail view, hide list view
  listView.style.display = 'none';
  detailView.style.display = 'flex';
  
  // Populate character header
  headerEl.innerHTML = `
    <div class="character-emoji">${char.emoji}</div>
    <div class="character-name">${char.name}</div>
    <div class="message-count">${history.length} messages</div>
  `;
  
  // Populate message previews
  previewListEl.innerHTML = '';
  if (history.length === 0) {
    previewListEl.innerHTML = '<div class="history-empty">No messages yet</div>';
  } else {
    history.forEach(msg => {
      const preview = document.createElement('div');
      preview.className = `message-preview-item ${msg.role}`;
      preview.innerHTML = `
        <div class="message-preview-role">${msg.role === 'user' ? 'You' : char.name}</div>
        <div class="message-preview-text">${msg.content}</div>
      `;
      previewListEl.appendChild(preview);
    });
    // Scroll to bottom
    previewListEl.scrollTop = previewListEl.scrollHeight;
  }
}

async function clearCurrentHistory() {
  if (!currentCharacter) {
    showError('Please select a character first!', '⚠️', 'No Selection');
    return;
  }
  
  const char = window.Characters.getCharacterById(currentCharacter);
  const charSessions = chatSessions[currentCharacter];
  
  if (!charSessions || Object.keys(charSessions.sessions).length === 0) {
    showError('No sessions to clear!', '⚠️', 'No Sessions');
    return;
  }
  
  const confirmed = await showDangerConfirm(
    `Are you sure you want to clear ALL sessions for ${char.name}? This cannot be undone.`,
    '🗑️',
    'Clear All Sessions?'
  );
  
  if (confirmed) {
    // Create fresh main session
    const newId = generateSessionId();
    chatSessions[currentCharacter] = {
      sessions: {
        [newId]: {
          name: 'Main Chat',
          messages: [],
          created: Date.now()
        }
      },
      activeSession: newId
    };
    saveToStorage('chat_sessions', chatSessions);
    loadConversation(currentCharacter);
    closeSettingsModal();
    
    showSuccess(`All sessions cleared for ${char.name}!`, '✅');
  }
}

// Expose functions globally for inline onclick handlers
window.createNewSession = createNewSession;
window.renameSession = renameSession;
window.deleteSession = deleteSession;
window.switchToSession = switchToSession;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
