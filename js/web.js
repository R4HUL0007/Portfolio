// Procedurally-generated spider web (pure SVG geometry — no image assets).

const NS = "http://www.w3.org/2000/svg";

function line(x1, y1, x2, y2, cls) {
    const l = document.createElementNS(NS, "path");
    l.setAttribute("d", `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`);
    if (cls) l.setAttribute("class", cls);
    return l;
}

/** Draw a clean radial web into `svg`, brighter near the hub and fading outward. */
export function buildWeb(svg, { cx, cy, radius, spokes = 30, rings = 14, sag = 0.14 }) {
    // Soft light burst at the hub so the rays feel like they emanate from it.
    svg.insertAdjacentHTML("beforeend", `
        <defs>
            <radialGradient id="webHubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
                <stop offset="35%" stop-color="#ffffff" stop-opacity="0.1"/>
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${radius * 0.55}" fill="url(#webHubGlow)" opacity="0.55"/>
    `);

    const g = document.createElementNS(NS, "g");

    // Radial spokes (the rays) — full circle, dense.
    for (let i = 0; i < spokes; i++) {
        const a = (Math.PI * 2 * i) / spokes;
        const p = line(cx, cy, cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, "web-spoke");
        p.setAttribute("stroke-opacity", "0.9");
        g.appendChild(p);
    }

    // Concave capture threads, ring by ring, closing cleanly back to the start.
    for (let r = 1; r <= rings; r++) {
        const rr = radius * Math.pow(r / rings, 1.2);
        const fade = 1 - (r / rings) * 0.6;
        for (let i = 0; i < spokes; i++) {
            const A = (Math.PI * 2 * i) / spokes;
            const B = (Math.PI * 2 * (i + 1)) / spokes;
            const ax = cx + Math.cos(A) * rr, ay = cy + Math.sin(A) * rr;
            const bx = cx + Math.cos(B) * rr, by = cy + Math.sin(B) * rr;
            const m = (A + B) / 2;
            const dip = rr * (1 - sag);
            const mxp = cx + Math.cos(m) * dip, myp = cy + Math.sin(m) * dip;
            const p = document.createElementNS(NS, "path");
            p.setAttribute("d", `M${ax.toFixed(1)},${ay.toFixed(1)} Q${mxp.toFixed(1)},${myp.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`);
            p.setAttribute("class", "web-thread");
            p.setAttribute("stroke-opacity", fade.toFixed(2));
            g.appendChild(p);
        }
    }

    svg.appendChild(g);
    return g;
}
