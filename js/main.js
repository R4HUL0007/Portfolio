// Entry point: theme, nav scroll-spy, scroll reveals, and the spider system
// (cursor + scroll journey + hero web). Everything degrades gracefully and
// respects prefers-reduced-motion.

import { initSpiderCursor, initJourney } from "./spider.js";
import { buildWeb } from "./web.js";

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------------- Theme ---------------- */
function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const icon = toggle?.querySelector(".theme-toggle__icon");
    const stored = localStorage.getItem("theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = stored || (prefersLight ? "light" : "dark");

    const apply = (t) => {
        document.documentElement.setAttribute("data-theme", t);
        if (icon) icon.textContent = t === "light" ? "☾" : "☀";
        toggle?.setAttribute("aria-label", `Switch to ${t === "light" ? "dark" : "light"} theme`);
    };
    apply(theme);

    toggle?.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        localStorage.setItem("theme", next);
        apply(next);
    });
}

/* ---------------- Nav scroll-spy ---------------- */
function initScrollSpy() {
    const links = [...document.querySelectorAll("[data-nav]")];
    const secs = links
        .map((link) => ({ link, el: document.querySelector(link.getAttribute("href")) }))
        .filter((s) => s.el);
    if (!secs.length) return;

    const setActive = (link) => links.forEach((l) => l.classList.toggle("is-active", l === link));

    const update = () => {
        const doc = document.documentElement;
        // At the bottom of the page, force the last section active (short footers
        // can never reach the mid-screen line otherwise).
        if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
            setActive(secs[secs.length - 1].link);
            return;
        }
        const line = window.scrollY + window.innerHeight * 0.35;
        let current = secs[0];
        for (const s of secs) {
            const top = s.el.getBoundingClientRect().top + window.scrollY;
            if (top <= line) current = s;
        }
        setActive(current.link);
    };

    let scheduled = false;
    addEventListener("scroll", () => {
        if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; update(); }); }
    }, { passive: true });
    addEventListener("resize", update);
    update();
}

/* ---------------- Scroll reveals ---------------- */
function initReveals() {
    const items = document.querySelectorAll(".reveal");
    if (motionQuery.matches || !("IntersectionObserver" in window)) {
        items.forEach((i) => i.classList.add("is-in"));
        return;
    }
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add("is-in"); o.unobserve(e.target); }
        });
    }, { threshold: 0.12 });
    items.forEach((i) => obs.observe(i));
}

/* ---------------- Spider system ---------------- */
function initSpiderSystem() {
    const reducedMotion = motionQuery.matches;

    const webSvg = document.getElementById("heroWeb");
    if (webSvg) buildWeb(webSvg, { cx: 560, cy: 185, radius: 760, spokes: 30, rings: 16, sag: 0.15 });

    initSpiderCursor();
    initJourney({ reducedMotion });
}

/* ---------------- Boot ---------------- */
function boot() {
    initTheme();
    initScrollSpy();
    initReveals();
    initSpiderSystem();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
