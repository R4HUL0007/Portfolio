// Modern polish: magnetic buttons + count-up stat tiles.

/** Buttons subtly pull toward the cursor (desktop only). */
export function initMagnetic() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const els = document.querySelectorAll(
        ".hero__actions .btn, .project-card__actions .btn, .projects__all, .theme-toggle"
    );
    els.forEach((el) => {
        el.addEventListener("pointermove", (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            el.style.transform = `translate(${(dx * 0.25).toFixed(1)}px, ${(dy * 0.4).toFixed(1)}px)`;
        });
        el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
}

/** Stat numbers count up when scrolled into view. */
export function initCountUp({ reducedMotion }) {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;

    const run = (el) => {
        const target = Number(el.dataset.count) || 0;
        const suffix = el.dataset.suffix || "";
        if (reducedMotion) { el.textContent = target + suffix; return; }
        const dur = 1200;
        const start = performance.now();
        const step = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach((el) => obs.observe(el));
}
