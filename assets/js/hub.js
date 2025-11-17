// Navigation utilities (inline)
    function goBack() {
      // Close modal first to prevent black screen
      const hubModal = document.getElementById('hubModal');
      if (hubModal) {
        hubModal.classList.remove('active');
      }
      
      const overlay = document.querySelector('.page-transition-overlay');
      if (overlay) {
        overlay.classList.add('active');
      }
      setTimeout(() => {
        window.location.href = '../../index.html';
      }, 300);
    }
    
    function navigateTo(path) {
      // Close modal first to prevent black screen
      const hubModal = document.getElementById('hubModal');
      if (hubModal) {
        hubModal.classList.remove('active');
      }
      
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
    }
    
    // Close modal
    function closeModal() {
      hubModal.classList.remove('active');
    }
    
    // Fade in page on load with RAF for perfect timing
    window.addEventListener('DOMContentLoaded', () => {
      const overlay = document.querySelector('.page-transition-overlay');
      if (overlay) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            overlay.classList.remove('active');
          });
        });
      }
    });
    
    // Event listeners
    openMenuButton.addEventListener('click', openModal);
    closeMenuButton.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Add floating animation to main button after initial animation with RAF
    setTimeout(() => {
      requestAnimationFrame(() => {
        openMenuButton.classList.add('floating');
      });
    }, 1800);
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hubModal.classList.contains('active')) {
        closeModal();
      }
    });
