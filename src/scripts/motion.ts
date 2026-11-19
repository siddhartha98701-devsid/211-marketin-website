/**
 * 211 Marketing - scroll effects and progressive enhancement.
 *
 * Motion follows the Brand Guidelines (p. 11): slow, deliberate and minimal.
 * No libraries, CSP-safe (bundled, no inline handlers), and every effect is
 * skipped for visitors who prefer reduced motion. Content is always visible
 * without JS: hidden states only apply once <html> has the `js` class.
 */

document.documentElement.classList.add("js");

const prefersReduced = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------------ */
/* 1. Reveal on scroll: text, staggered groups, images (wipe), drawn rules   */
/* ------------------------------------------------------------------------ */
function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>(
    "[data-reveal], [data-reveal-stagger], [data-reveal-img], [data-rule]"
  );
  if (!targets.length) return;

  if (prefersReduced() || !("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  // Items inside a horizontal swipe row are revealed together when the row
  // itself scrolls into view, so off-screen cards are never left hidden.
  const groups = new Map<Element, HTMLElement[]>();
  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        groups.get(entry.target)?.forEach((m) => m.classList.add("is-visible"));
        if ((entry.target as HTMLElement).matches("[data-reveal], [data-reveal-stagger], [data-reveal-img], [data-rule]")) {
          entry.target.classList.add("is-visible");
        }
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  targets.forEach((t) => {
    const row = t.closest(".swipe-row");
    if (row && row !== t) {
      if (!groups.has(row)) {
        groups.set(row, []);
        io.observe(row);
      }
      groups.get(row)!.push(t);
    } else {
      io.observe(t);
    }
  });
}

/* ------------------------------------------------------------------------ */
/* 2. Count-up for key figures (8, 15, 48, 9) as they come into view         */
/* ------------------------------------------------------------------------ */
function initCountUp(): void {
  const nums = document.querySelectorAll<HTMLElement>("[data-count]");
  if (!nums.length || prefersReduced() || !("IntersectionObserver" in window)) return;

  const run = (el: HTMLElement): void => {
    const end = parseInt(el.dataset.count || "0", 10);
    if (!end) return;
    const duration = 1400;
    const start = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(end * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = "0";
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((n) => io.observe(n));
}

/* ------------------------------------------------------------------------ */
/* 3. Swipe rows: keyboard access, labels and a position track               */
/* ------------------------------------------------------------------------ */
function initSwipeRows(): void {
  const rows = Array.from(document.querySelectorAll<HTMLElement>(".swipe-row:not(.swipe-chips)"));
  if (!rows.length) return;

  const labelFor = (row: HTMLElement): string => {
    if (row.dataset.swipeLabel) return row.dataset.swipeLabel;
    const section = row.closest("section");
    const heading = section?.querySelector("h2, h1");
    const text = heading?.textContent?.trim() || section?.getAttribute("aria-label")?.trim();
    return text ? `${text} (scroll sideways for more)` : "Scroll sideways for more";
  };

  rows.forEach((row) => {
    const track = document.createElement("div");
    track.className = "swipe-track";
    track.setAttribute("aria-hidden", "true");
    const thumb = document.createElement("span");
    track.appendChild(thumb);
    row.insertAdjacentElement("afterend", track);

    const update = (): void => {
      const scrollable = row.scrollWidth > row.clientWidth + 2;
      if (scrollable) {
        // Make the scroll region reachable and named for keyboard / screen reader users
        row.setAttribute("tabindex", "0");
        // Lists keep their list semantics; other containers become a named region
        if (!/^(UL|OL)$/.test(row.tagName)) row.setAttribute("role", "region");
        row.setAttribute("aria-label", labelFor(row));
        track.style.display = "";
        const ratio = row.clientWidth / row.scrollWidth;
        const max = row.scrollWidth - row.clientWidth;
        const progress = max > 0 ? row.scrollLeft / max : 0;
        track.style.setProperty("--thumb-w", `${Math.max(12, ratio * 100)}%`);
        track.style.setProperty("--thumb-x", `${progress * ((1 / ratio) - 1) * 100}%`);
      } else {
        row.removeAttribute("tabindex");
        if (!/^(UL|OL)$/.test(row.tagName)) row.removeAttribute("role");
        row.removeAttribute("aria-label");
        track.style.display = "none";
      }
    };

    row.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", () => requestAnimationFrame(update), { passive: true });
    update();
  });
}

/* ------------------------------------------------------------------------ */
/* 4. Scroll-linked: header condense, reading progress, hero parallax        */
/* ------------------------------------------------------------------------ */
function initScrollLinked(): void {
  const header = document.querySelector<HTMLElement>("header.site-header");
  const progressBar = document.getElementById("reading-progress");
  const parallax = prefersReduced() ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));

  let ticking = false;
  const onScroll = (): void => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header?.classList.toggle("header-scrolled", y > 24);

      if (progressBar) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, y / total)) : 0})`;
      }

      const vh = window.innerHeight;
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        // -1 (entering from below) .. 1 (leaving at top), max ±18px of travel
        const p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        el.style.setProperty("--parallax", `${(p * 18).toFixed(1)}px`);
      });

      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
}

function init(): void {
  initReveal();
  initCountUp();
  initSwipeRows();
  initScrollLinked();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
