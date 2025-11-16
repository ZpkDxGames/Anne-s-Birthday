// Navigation utilities (inline)
    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '../index.html';
      }
    }
    
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
    
    // Initialize smooth navigation for all links with data-transition
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('a[data-transition]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigateTo(link.href);
        });
      });
    });
    
    // Elements
    const openMenuButton = document.getElementById('openMenuButton');
    const closeMenuButton = document.getElementById('closeMenuButton');
    const hubModal = document.getElementById('hubModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    // Back button handler
    document.getElementById('backBtn').addEventListener('click', () => {
      goBack();
    });
    
    // Open modal
    function openModal() {
      hubModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeModal() {
      hubModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Event listeners
    openMenuButton.addEventListener('click', openModal);
    closeMenuButton.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hubModal.classList.contains('active')) {
        closeModal();
      }
    });
