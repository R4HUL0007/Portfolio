// Spider system (pure SVG, vanilla JS — no image assets, no GSAP).
//  • createSpider()      → detailed vector spider (stand-in for a real spidey.png later)
//  • initSpiderCursor()  → the spider becomes the cursor; silk to nearby nodes; web-shoot on click
//  • initJourney()       → a spider travels down the silk spine as you scroll; markers light up
//  • mountHangSpider()   → the swinging hero spider

let uid = 0;
const NS = "http://www.w3.org/2000/svg";

function legPath(points, halfWidths) {
    const n = points.length;
    const normals = points.map((p, i) => {
        const prev = points[Math.max(0, i - 1)];
        const next = points[Math.min(n - 1, i + 1)];
        const dx = next[0] - prev[0], dy = next[1] - prev[1];
        const len = Math.hypot(dx, dy) || 1;
        return [-dy / len, dx / len];
    });
    const L = points.map((p, i) => [p[0] + normals[i][0] * halfWidths[i], p[1] + normals[i][1] * halfWidths[i]]);
    const Rt = points.map((p, i) => [p[0] - normals[i][0] * halfWidths[i], p[1] - normals[i][1] * halfWidths[i]]);
    let d = `M${L[0][0].toFixed(1)},${L[0][1].toFixed(1)}`;
    for (let i = 1; i < n; i++) d += ` L${L[i][0].toFixed(1)},${L[i][1].toFixed(1)}`;
    for (let i = n - 1; i >= 0; i--) d += ` L${Rt[i][0].toFixed(1)},${Rt[i][1].toFixed(1)}`;
    return d + " Z";
}

const LEFT_LEGS = [
    { pts: [[48, 52], [22, 32], [5, 39]],   w: [3.4, 2.0, 0] },
    { pts: [[48, 58], [18, 49], [1, 55]],   w: [3.6, 2.1, 0] },
    { pts: [[49, 66], [19, 71], [3, 85]],   w: [3.6, 2.1, 0] },
    { pts: [[51, 74], [26, 90], [12, 107]], w: [3.4, 2.0, 0] },
];

export function createSpider({ size = 120 } = {}) {
    const id = `sp${uid++}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 140");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size * (140 / 120));
    svg.classList.add("spider-svg");
    svg.setAttribute("aria-hidden", "true");

    const legs = LEFT_LEGS.map((l) => {
        const left = legPath(l.pts, l.w);
        const right = legPath(l.pts.map(([x, y]) => [120 - x, y]), l.w);
        return `<path class="leg" d="${left}"/><path class="leg" d="${right}"/>`;
    }).join("");

    svg.innerHTML = `
        <defs>
            <radialGradient id="${id}-abd" cx="42%" cy="32%" r="75%">
                <stop offset="0%" stop-color="#282d38"/><stop offset="45%" stop-color="#12141a"/><stop offset="100%" stop-color="#040405"/>
            </radialGradient>
            <radialGradient id="${id}-head" cx="45%" cy="35%" r="80%">
                <stop offset="0%" stop-color="#2e343f"/><stop offset="100%" stop-color="#0a0c11"/>
            </radialGradient>
            <linearGradient id="${id}-leg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#333a47"/><stop offset="100%" stop-color="#07080b"/>
            </linearGradient>
            <radialGradient id="${id}-eye" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#d6fbff"/><stop offset="45%" stop-color="#38e2ff"/><stop offset="100%" stop-color="#0891b2"/>
            </radialGradient>
        </defs>
        <g class="spider-legs" fill="url(#${id}-leg)" stroke="#05060a" stroke-width="0.5" stroke-linejoin="round">${legs}</g>
        <ellipse class="spider-abdomen" cx="60" cy="92" rx="20" ry="26" fill="url(#${id}-abd)" stroke="#2a2f3a" stroke-width="0.7"/>
        <ellipse cx="53" cy="80" rx="8" ry="11" fill="#ffffff" opacity="0.05"/>
        <ellipse class="spider-head" cx="60" cy="58" rx="13" ry="15" fill="url(#${id}-head)" stroke="#333947" stroke-width="0.7"/>
        <g class="spider-eyes" fill="url(#${id}-eye)">
            <circle cx="54.5" cy="49" r="2.6"/><circle cx="65.5" cy="49" r="2.6"/>
            <circle cx="50" cy="53" r="1.4"/><circle cx="70" cy="53" r="1.4"/>
            <circle cx="57" cy="45" r="1.1"/><circle cx="63" cy="45" r="1.1"/>
        </g>
    `;
    return svg;
}

export function mountHangSpider(mount) {
    if (mount) mount.appendChild(createSpider({ size: 118 }));
}

/** Vanilla web-shoot: strand draws to the click point, spark expands, both fade. */
function shoot(ax, ay, tx, ty, layer) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("class", "web-shot");
    p.setAttribute("d", `M${ax},${ay} L${tx},${ty}`);
    layer.appendChild(p);
    const len = Math.hypot(tx - ax, ty - ay) || 1;
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;

    const c = document.createElementNS(NS, "circle");
    c.setAttribute("class", "web-shot-spark");
    c.setAttribute("cx", tx); c.setAttribute("cy", ty); c.setAttribute("r", 2);
    layer.appendChild(c);

    let t = 0;
    const step = () => {
        t += 1;
        const k = Math.min(1, t / 22);
        p.style.strokeDashoffset = (len * (1 - Math.min(1, k * 2.2))).toFixed(1);
        c.setAttribute("r", (2 + k * 15).toFixed(1));
        c.setAttribute("opacity", (1 - k).toFixed(2));
        if (k > 0.5) p.setAttribute("opacity", (1 - (k - 0.5) * 2).toFixed(2));
        if (k < 1) requestAnimationFrame(step);
        else { p.remove(); c.remove(); }
    };
    requestAnimationFrame(step);
}

export function initSpiderCursor() {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return; // touch devices keep the native cursor

    document.documentElement.classList.add("spider-active");

    const layer = document.createElementNS(NS, "svg");
    layer.setAttribute("class", "web-line-layer");
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const cursor = document.createElement("div");
    cursor.className = "spider-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.appendChild(createSpider({ size: 44 }));
    document.body.appendChild(cursor);

    const nodes = [...document.querySelectorAll(
        ".nav-link, .btn, .chip, .project-card, .sidebar__social a, .footer__social a, .projects__all, " +
        ".section-title, .hero__name, .kick, .timeline__item, .field, .footer__note, .theme-toggle, .cap"
    )];
    const lines = nodes.map(() => {
        const p = document.createElementNS(NS, "path");
        p.setAttribute("class", "web-line");
        p.style.opacity = 0;
        layer.appendChild(p);
        return p;
    });

    let centers = [];
    const measure = () => {
        centers = nodes.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.bottom > 0 && r.top < innerHeight };
        });
    };
    measure();
    let scheduled = false;
    const remeasure = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; measure(); }); } };
    addEventListener("scroll", remeasure, { passive: true });
    addEventListener("resize", remeasure);

    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, prev = mx, ang = 0;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    addEventListener("pointerdown", (e) => {
        if (e.target.closest("input, textarea")) return;
        shoot(cx, cy, e.clientX, e.clientY, layer);
    }, { passive: true });

    const R = 340;
    const loop = () => {
        if (!document.hidden) {
            cx += (mx - cx) * 0.35;
            cy += (my - cy) * 0.35;
            const dir = cx - prev; prev = cx;
            ang += (dir * 1.3 - ang) * 0.12;
            ang = Math.max(-26, Math.min(26, ang));
            cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) rotate(${ang}deg)`;

            const t = Date.now();
            for (let i = 0; i < centers.length; i++) {
                const c = centers[i], line = lines[i];
                if (!c.vis) { if (line.style.opacity !== "0") line.style.opacity = 0; nodes[i].classList.remove("web-hot"); continue; }
                const d = Math.hypot(c.x - cx, c.y - cy);
                if (d < R) {
                    const op = (1 - d / R) * 0.6;
                    const mxp = (cx + c.x) / 2, myp = (cy + c.y) / 2 + Math.sin(t / 320 + i) * 5;
                    line.setAttribute("d", `M${cx.toFixed(1)},${cy.toFixed(1)} Q${mxp.toFixed(1)},${myp.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`);
                    line.style.opacity = op.toFixed(2);
                    nodes[i].classList.add("web-hot");
                } else {
                    if (line.style.opacity !== "0") line.style.opacity = 0;
                    nodes[i].classList.remove("web-hot");
                }
            }
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

export function initJourney({ reducedMotion }) {
    if (reducedMotion) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;

    const spine = document.createElement("div");
    spine.id = "journeySpine";
    spine.setAttribute("aria-hidden", "true");
    document.body.appendChild(spine);

    const traveler = createSpider({ size: 62 });
    traveler.id = "journeyTraveler";
    document.body.appendChild(traveler);

    const secs = [...document.querySelectorAll("[data-sec]")];
    const markers = secs.map(() => {
        const m = document.createElement("div");
        m.className = "journey-marker";
        m.setAttribute("aria-hidden", "true");
        document.body.appendChild(m);
        return m;
    });

    const loop = () => {
        if (!document.hidden) {
            const top = innerHeight * 0.14, bot = innerHeight * 0.86;
            const max = document.documentElement.scrollHeight - innerHeight;
            const prog = max > 0 ? Math.min(1, scrollY / max) : 0;
            const y = top + (bot - top) * prog;
            const sw = Math.sin(Date.now() / 1400) * 12;
            traveler.style.transform = `translate(-50%, -50%) translate(${sw}px, ${y}px) rotate(${sw / 2.5}deg)`;

            for (let i = 0; i < secs.length; i++) {
                const r = secs[i].getBoundingClientRect();
                const cyy = Math.max(top, Math.min(bot, r.top + r.height / 2));
                markers[i].style.top = cyy + "px";
                markers[i].classList.toggle("on", Math.abs(cyy - y) < 50);
            }
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}
