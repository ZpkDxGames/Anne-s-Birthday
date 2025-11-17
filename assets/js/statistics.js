// Navigation utility (inline)
    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '../index.html';
      }
    }
    
    // Easing utility (inline)
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    
    // Initialize
    function init() {
      // Back button
      document.getElementById('backBtn').addEventListener('click', () => {
        goBack();
      });
      
      // Set up Intersection Observer for counters
      observeCounters();
    }
    
    // Observe counters and animate when visible
    function observeCounters() {
      const statsGrid = document.querySelector('.stats-grid');
      const statCards = document.querySelectorAll('.stat-card');
      
      if (!statsGrid) return;
      
      // Set days since November 10, 2007
      const daysSinceCounter = document.getElementById('daysSinceCounter');
      if (daysSinceCounter) {
        const daysSince = calculateDaysSince();
        daysSinceCounter.dataset.countTo = daysSince;
      }
      
      // Observe individual stat cards
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const counter = card.querySelector('[data-count-to]');
            const progressRing = card.querySelector('.progress-ring-fill');
            const progressBar = card.querySelector('.progress-bar');
            
            if (counter && !counter.dataset.animated) {
              const target = parseInt(counter.dataset.countTo);
              animateValue(counter, 0, target, 2000);
              counter.dataset.animated = 'true';
            }
            
            if (progressRing && !progressRing.dataset.animated) {
              animateProgressRing();
              progressRing.dataset.animated = 'true';
            }
            
            if (progressBar && !progressBar.dataset.animated) {
              animateProgressBar(progressBar);
              progressBar.dataset.animated = 'true';
            }
          }
        });
      }, { threshold: 0.6 });
      
      // Observe each stat card individually
      statCards.forEach(card => cardObserver.observe(card));
      
      // Observe charts when they become 60% visible
      const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            
            if (entry.target.id === 'happinessChart') {
              setTimeout(() => createHappinessChart(), 100);
            } else if (entry.target.id === 'timeChart') {
              setTimeout(() => createTimeChart(), 100);
            }
            
            chartObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      
      const happinessChart = document.getElementById('happinessChart');
      const timeChart = document.getElementById('timeChart');
      
      if (happinessChart) chartObserver.observe(happinessChart);
      if (timeChart) chartObserver.observe(timeChart);
    }
    
    // Animate counter numbers
    function animateCounters() {
      const counters = document.querySelectorAll('[data-count-to]');
      
      counters.forEach((counter, index) => {
        const target = parseInt(counter.dataset.countTo);
        const duration = 2000;
        const delay = index * 200;
        
        setTimeout(() => {
          animateValue(counter, 0, target, duration);
        }, delay);
      });
      
      // Animate progress ring for % Awesome
      setTimeout(() => {
        animateProgressRing();
      }, 2 * 200); // Same delay as the % Awesome counter
    }
    
    // Animate progress ring
    function animateProgressRing() {
      const circle = document.getElementById('awesomeProgress');
      if (!circle) return;
      
      const radius = 65;
      const circumference = 2 * Math.PI * radius;
      const targetPercent = 100;
      const offset = circumference - (targetPercent / 100) * circumference;
      
      circle.style.strokeDashoffset = offset;
    }
    
    // Animate progress bar
    function animateProgressBar(progressBar) {
      const displayNumber = parseInt(progressBar.dataset.progress || 100);
      const fill = progressBar.querySelector('.progress-bar-fill');
      const text = progressBar.querySelector('.progress-bar-text');
      
      if (!fill || !text) return;
      
      // Always animate fill to 100%
      setTimeout(() => {
        fill.style.width = '100%';
      }, 100);
      
      // Animate the percentage text to the display number
      const startTime = Date.now();
      const duration = 2000;
      
      function updateText() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.floor(displayNumber * eased);
        
        text.textContent = current.toLocaleString() + '%';
        
        if (progress < 1) {
          requestAnimationFrame(updateText);
        }
      }
      
      updateText();
    }
    
    // Calculate days since November 10, 2007
    function calculateDaysSince() {
      const startDate = new Date('2007-11-10');
      const today = new Date();
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    
    // Animate a single value
    function animateValue(element, start, end, duration) {
      const startTime = Date.now();
      
      function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.floor(start + (end - start) * eased);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      
      update();
    }
    
    // Create happiness distribution chart
    function createHappinessChart() {
      const ctx = document.getElementById('happinessChart');
      
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Depression', 'Sex', 'Love', 'Minecraft', 'Genshin & Honkai'],
          datasets: [{
            data: [5, 0, 50, 25, 20],
            backgroundColor: [
              'rgba(0, 10, 102, 0.8)',
              'rgba(255, 107, 107, 0.8)',
              'rgba(165, 31, 206, 0.8)',
              'rgba(78, 205, 84, 0.8)',
              'rgba(78, 205, 196, 0.8)'
            ],
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#f8f8f8',
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              titleColor: '#f8f8f8',
              bodyColor: '#b8b8d0',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  return ` ${context.label}: ${context.parsed}%`;
                }
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1500,
            easing: 'easeInOutQuart'
          }
        }
      });
    }
    
    // Create time spent chart
    function createTimeChart() {
      const ctx = document.getElementById('timeChart');
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Crying', 'Swearing', 'Gossiping', 'Wishing to Die'],
          datasets: [{
            label: 'Hours per week',
            data: [634, 4365, 2398, 1853],
            backgroundColor: [
              'rgba(61, 152, 255, 0.6)',
              'rgba(78, 25, 175, 0.6)',
              'rgba(162, 155, 254, 0.6)',
              'rgba(255, 116, 116, 0.6)'
            ],
            borderColor: [
              'rgba(61, 152, 255, 1)',
              'rgba(105, 33, 201, 1)',
              'rgba(162, 155, 254, 1)',
              'rgba(255, 132, 132, 1)'
            ],
            borderWidth: 2,
            borderRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#b8b8d0',
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#b8b8d0',
                font: {
                  size: 11
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              titleColor: '#f8f8f8',
              bodyColor: '#b8b8d0',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return ` ${context.parsed.y} hours`;
                }
              }
            }
          },
          animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
            delay: (context) => {
              return context.dataIndex * 100;
            }
          }
        }
      });
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
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        init();
        fadeInPage();
      });
    } else {
      init();
      fadeInPage();
    }
