// KINETIQ landing — nav scroll state, stat count-up (marquee runs on pure CSS animation)
(function () {
  const nav = document.querySelector('.nav');
  if (nav) {
    let ticking = false;
    const setScrolled = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    };
    setScrolled();
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(setScrolled);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const counters = document.querySelectorAll('.count[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const statsEl = document.querySelector('.stats__grid');
    if (statsEl) {
      const countObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              counters.forEach(animateCount);
              obs.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      countObserver.observe(statsEl);
    }
  }
})();
