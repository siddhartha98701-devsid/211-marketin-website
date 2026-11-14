/**
 * 211 Marketing — Subtle Motion & Scroll Enhancement Engine
 * 
 * Calm, minimalistic, and lightweight (< 1.5 KB).
 * Zero external libraries, zero layout shift, strictly WCAG 2.2 AA and CSP compliant.
 */

// 1. Progressive Enhancement Handshake: Mark JS as active
document.documentElement.classList.add('js');

function initMotion(): void {
  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // 2. Scroll Reveal IntersectionObserver
  const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]');
  
  if (revealTargets.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
      }
    );

    revealTargets.forEach((target) => {
      revealObserver.observe(target);
    });
  }

  // 3. Header Scroll Elevation & Reading Progress Tracker
  const header = document.querySelector<HTMLElement>('header.site-header') || document.querySelector<HTMLElement>('header');
  const progressBar = document.getElementById('reading-progress');

  if (header || progressBar) {
    let ticking = false;

    const onScroll = (): void => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Header elevation after 24px scroll
          if (header) {
            header.classList.toggle('header-scrolled', scrollY > 24);
          }

          // Reading progress line (for long-form guides)
          if (progressBar) {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollTotal > 0 ? Math.min(1, Math.max(0, scrollY / scrollTotal)) : 0;
            progressBar.style.transform = `scaleX(${progress})`;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load to catch pages that load scrolled
    onScroll();
  }
}

// Execute on DOMContentLoaded or immediately if already interactive
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion);
} else {
  initMotion();
}
