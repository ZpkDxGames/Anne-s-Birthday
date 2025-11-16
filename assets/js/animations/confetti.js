/**
 * Confetti Animation
 * Joyful particle burst effect for celebrations
 */

/**
 * Confetti from top of screen with multiple bursts
 * Creates cascading confetti effect falling from above viewport
 */
window.confettiFromTop = function () {
  // Soft, desaturated color palette - elegant and calm
  const colors = [
    'rgba(139, 92, 246, 0.4)',   // Soft deep purple
    'rgba(167, 139, 250, 0.5)',  // Soft light purple
    'rgba(59, 130, 246, 0.4)',   // Soft blue
    'rgba(96, 165, 250, 0.5)',   // Soft sky blue
    'rgba(236, 72, 153, 0.4)',   // Soft pink
    'rgba(203, 166, 247, 0.5)',  // Soft lavender
    'rgba(147, 197, 253, 0.4)',  // Soft light blue
    'rgba(244, 114, 182, 0.5)',  // Soft rose
    'rgba(196, 181, 253, 0.4)',  // Soft violet
    'rgba(165, 180, 252, 0.5)'   // Soft periwinkle
  ];

  function burstConfetti() {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    const particleCount = 30; // More particles for continuous rain effect
    const duration = 1500; // 1.5 seconds
    const particles = [];

    // Spread particles across the width
    for (let i = 0; i < particleCount; i++) {
      const element = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4; // Slightly smaller, more delicate
      const shape = Math.random();

      // More elegant shapes
      let borderRadius;
      if (shape < 0.4) {
        borderRadius = '50%'; // Circle
      } else if (shape < 0.7) {
        borderRadius = '2px'; // Small rounded square
      } else {
        borderRadius = `${Math.random() * 50}%`; // Organic shapes
      }

      // Random starting position across screen width
      const startX = Math.random() * window.innerWidth;
      const startY = -50 - Math.random() * 100; // Stagger entry timing

      // Gentle floating motion
      const lateralDrift = (Math.random() - 0.5) * 2; // Very subtle left/right drift
      const fallSpeed = Math.random() * 2 + 1.5; // Slow, calm descent

      element.style.cssText = `
        position:absolute;
        width:${size}px;
        height:${size}px;
        background:${color};
        border-radius:${borderRadius};
        left:${startX}px;
        top:${startY}px;
        pointer-events:none;
        box-shadow: 0 0 ${size * 2}px ${color};
        backdrop-filter: blur(1px);
      `;

      particles.push({
        element,
        x: startX,
        y: startY,
        vx: lateralDrift,
        vy: fallSpeed,
        alpha: 1,
        wobble: Math.random() * Math.PI * 2, // For gentle sway
        wobbleSpeed: (Math.random() - 0.5) * 0.02
      });

      container.appendChild(element);
    }

    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        container.remove();
        return;
      }

      particles.forEach(particle => {
        // Gentle swaying motion
        particle.wobble += particle.wobbleSpeed;
        const sway = Math.sin(particle.wobble) * 1.5;

        // Update position with subtle drift
        particle.x += particle.vx + sway;
        particle.y += particle.vy;

        // Fade based on vertical position (fade near bottom)
        const fadeThreshold = window.innerHeight * 0.7;
        if (particle.y > fadeThreshold) {
          const fadeProgress = (particle.y - fadeThreshold) / (window.innerHeight * 0.3);
          particle.alpha = Math.max(0, 1 - fadeProgress);
        }

        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';
        particle.element.style.opacity = particle.alpha;
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Create gentle, continuous rain over 1.5 seconds
  burstConfetti();
  const burstInterval = setInterval(burstConfetti, 400); // Slower interval for calm effect
  setTimeout(() => clearInterval(burstInterval), 1500);
};
