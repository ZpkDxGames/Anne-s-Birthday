// Custom Notification System

let notificationOverlay = null;

function initNotifications() {
  if (notificationOverlay) return;
  
  notificationOverlay = document.createElement('div');
  notificationOverlay.className = 'notification-overlay';
  notificationOverlay.innerHTML = `
    <div class="notification-box">
      <div class="notification-icon"></div>
      <div class="notification-title"></div>
      <div class="notification-message"></div>
      <div class="notification-actions"></div>
    </div>
  `;
  document.body.appendChild(notificationOverlay);
  
  // Close on backdrop click
  notificationOverlay.addEventListener('click', (e) => {
    if (e.target === notificationOverlay) {
      closeNotification();
    }
  });
}

function closeNotification() {
  if (notificationOverlay) {
    notificationOverlay.classList.remove('active');
  }
}

// Alert replacement
function showAlert(message, icon = '✨', title = '') {
  initNotifications();
  
  return new Promise((resolve) => {
    const iconEl = notificationOverlay.querySelector('.notification-icon');
    const titleEl = notificationOverlay.querySelector('.notification-title');
    const messageEl = notificationOverlay.querySelector('.notification-message');
    const actionsEl = notificationOverlay.querySelector('.notification-actions');
    
    iconEl.textContent = icon;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    actionsEl.innerHTML = `
      <button class="notification-btn primary" id="alertOkBtn">OK</button>
    `;
    
    notificationOverlay.classList.add('active');
    
    const okBtn = document.getElementById('alertOkBtn');
    okBtn.onclick = () => {
      closeNotification();
      resolve(true);
    };
    
    okBtn.focus();
  });
}

// Confirm replacement
function showConfirm(message, icon = '❓', title = 'Confirm') {
  initNotifications();
  
  return new Promise((resolve) => {
    const iconEl = notificationOverlay.querySelector('.notification-icon');
    const titleEl = notificationOverlay.querySelector('.notification-title');
    const messageEl = notificationOverlay.querySelector('.notification-message');
    const actionsEl = notificationOverlay.querySelector('.notification-actions');
    
    iconEl.textContent = icon;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    actionsEl.innerHTML = `
      <button class="notification-btn secondary" id="confirmCancelBtn">Cancel</button>
      <button class="notification-btn primary" id="confirmOkBtn">Confirm</button>
    `;
    
    notificationOverlay.classList.add('active');
    
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    
    okBtn.onclick = () => {
      closeNotification();
      resolve(true);
    };
    
    cancelBtn.onclick = () => {
      closeNotification();
      resolve(false);
    };
    
    okBtn.focus();
  });
}

// Danger confirm (for destructive actions)
function showDangerConfirm(message, icon = '⚠️', title = 'Are you sure?') {
  initNotifications();
  
  return new Promise((resolve) => {
    const iconEl = notificationOverlay.querySelector('.notification-icon');
    const titleEl = notificationOverlay.querySelector('.notification-title');
    const messageEl = notificationOverlay.querySelector('.notification-message');
    const actionsEl = notificationOverlay.querySelector('.notification-actions');
    
    iconEl.textContent = icon;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    actionsEl.innerHTML = `
      <button class="notification-btn secondary" id="dangerCancelBtn">Cancel</button>
      <button class="notification-btn danger" id="dangerOkBtn">Delete</button>
    `;
    
    notificationOverlay.classList.add('active');
    
    const okBtn = document.getElementById('dangerOkBtn');
    const cancelBtn = document.getElementById('dangerCancelBtn');
    
    okBtn.onclick = () => {
      closeNotification();
      resolve(true);
    };
    
    cancelBtn.onclick = () => {
      closeNotification();
      resolve(false);
    };
    
    cancelBtn.focus();
  });
}

// Success message
function showSuccess(message, icon = '✅', title = 'Success!') {
  return showAlert(message, icon, title);
}

// Error message
function showError(message, icon = '❌', title = 'Error') {
  return showAlert(message, icon, title);
}
