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

/* ------------------------------------------------------------------------ */
/* 5. 3D depth: paper-card tilt, hero photo, settling panels, services deck  */
/* ------------------------------------------------------------------------ */
const finePointer = (): boolean => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function initTilt(): void {
  if (prefersReduced() || !finePointer()) return;
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    const max = parseFloat(el.dataset.tilt || "") || 4; // degrees
    let frame = 0;
    const onMove = (e: PointerEvent): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 .. 0.5
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
        el.style.setProperty("--sx", `${(-x * 16).toFixed(1)}`);
        el.style.setProperty("--sy", `${(-y * 10).toFixed(1)}`);
      });
    };
    el.addEventListener("pointerenter", () => el.classList.add("is-tilting"));
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      el.classList.remove("is-tilting");
      ["--rx", "--ry", "--sx", "--sy"].forEach((v) => el.style.removeProperty(v));
    });
  });
}

function initHero3D(): void {
  if (prefersReduced() || !finePointer()) return;
  document.querySelectorAll<HTMLElement>("[data-hero-3d]").forEach((hero) => {
    const target = hero.querySelector<HTMLElement>("[data-parallax]");
    if (!target) return;
    let frame = 0;
    hero.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        target.style.setProperty("--hy", `${(x * 5).toFixed(2)}deg`);
        target.style.setProperty("--hx", `${(-y * 4).toFixed(2)}deg`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      target.style.setProperty("--hy", "0deg");
      target.style.setProperty("--hx", "0deg");
    });
  });
}

function initDepthAndStack(): void {
  const depth = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
  const decks = Array.from(document.querySelectorAll<HTMLElement>("[data-stack]"));
  if (prefersReduced()) {
    depth.forEach((el) => el.style.setProperty("--settle", "0"));
    return;
  }
  if (!depth.length && !decks.length) return;

  const deckCards = decks.map((deck) => {
    const cards = Array.from(deck.querySelectorAll<HTMLElement>(":scope > article"));
    cards.forEach((c, i) => c.style.setProperty("--i", String(i)));
    return cards;
  });
  const stackQuery = window.matchMedia("(min-width: 1024px) and (min-height: 680px)");

  let ticking = false;
  const update = (): void => {
    ticking = false;
    const vh = window.innerHeight;

    // Panels settle flat between entering the viewport and reaching ~65% height
    depth.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (top - vh * 0.65) / (vh * 0.35)));
      el.style.setProperty("--settle", p.toFixed(3));
    });

    // Services deck: a card recedes as the next one slides over it
    deckCards.forEach((cards) => {
      cards.forEach((card, i) => {
        if (!stackQuery.matches) {
          card.style.removeProperty("--stack");
          return;
        }
        const next = cards[i + 1];
        if (!next) {
          card.style.setProperty("--stack", "0");
          return;
        }
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const covered = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height));
        card.style.setProperty("--stack", covered.toFixed(3));
      });
    });
  };
  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

/* ---------- Loading animations ---------- */
function initSplitHeadlines(): void {
  if (prefersReduced()) return;
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((h) => {
    if (h.classList.contains("is-split")) return;
    // only split plain-text headlines; keep any inline markup untouched
    if (h.children.length > 0) return;
    const words = (h.textContent ?? "").trim().split(/\s+/);
    if (!words.length) return;
    h.setAttribute("aria-label", words.join(" "));
    h.textContent = "";
    words.forEach((word, i) => {
      const outer = document.createElement("span");
      outer.className = "w";
      outer.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.style.setProperty("--i", String(i));
      inner.textContent = word;
      outer.appendChild(inner);
      h.appendChild(outer);
      if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
    });
    h.classList.add("is-split");
  });
}

function initLoadBar(): void {
  if (prefersReduced()) return;
  const bar = document.createElement("div");
  bar.id = "load-bar";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  const start = () => { bar.classList.remove("is-done"); void bar.offsetWidth; bar.classList.add("is-going"); };
  const done = () => { bar.classList.remove("is-going"); bar.classList.add("is-done"); };
  // initial page load
  start();
  if (document.readyState === "complete") requestAnimationFrame(done);
  else window.addEventListener("load", done, { once: true });
  // leaving for another page on this site
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same-page / hash
    start();
  });
  // back/forward cache restores
  window.addEventListener("pageshow", (e) => { if ((e as PageTransitionEvent).persisted) done(); });
}

function initMediaLoading(): void {
  if (prefersReduced()) return;
  const media = document.querySelectorAll<HTMLImageElement | HTMLIFrameElement>("main img, main iframe, footer iframe");
  media.forEach((el) => {
    if (el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0) return;
    if (el.closest("[data-intro-img]")) return; // hero image has its own unveil
    const holder = el.parentElement;
    el.classList.add("img-pending", "img-fade");
    holder?.classList.add("is-loading-media");
    const finish = () => {
      el.classList.remove("img-pending");
      holder?.classList.remove("is-loading-media");
    };
    el.addEventListener("load", finish, { once: true });
    el.addEventListener("error", finish, { once: true });
    window.setTimeout(finish, 8000); // never leave anything hidden
  });
}

function init(): void {
  initSplitHeadlines();
  initLoadBar();
  initMediaLoading();
  initReveal();
  initCountUp();
  initSwipeRows();
  initScrollLinked();
  initTilt();
  initHero3D();
  initDepthAndStack();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
