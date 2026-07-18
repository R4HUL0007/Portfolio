// Web Catch — a tiny, simple mini-game. Flies pop up in the play area;
// tap them to web 'em before they escape. 30-second rounds, best score saved.

export function initGame() {
    const root = document.getElementById("game");
    const openBtn = document.getElementById("gameOpen");
    const closeBtn = document.getElementById("gameClose");
    const backdrop = document.getElementById("gameBackdrop");
    const area = document.getElementById("gameArea");
    const overlay = document.getElementById("gameOverlay");
    const msg = document.getElementById("gameMsg");
    const startBtn = document.getElementById("gameStart");
    const scoreEl = document.getElementById("gameScore");
    const timeEl = document.getElementById("gameTime");
    const bestEl = document.getElementById("gameBest");
    if (!root || !openBtn) return;

    const BUGS = ["🪰", "🐛", "🦗", "🐜"];
    let score = 0, time = 0, running = false;
    let spawnTimer = null, tickTimer = null;
    let best = Number(localStorage.getItem("webcatch-best") || 0);
    bestEl.textContent = best;

    const open = () => {
        root.hidden = false;
        document.documentElement.classList.add("over-ui");
    };
    const close = () => {
        stop();
        root.hidden = true;
        document.documentElement.classList.remove("over-ui");
    };

    const clearFlies = () => area.querySelectorAll(".fly").forEach((f) => f.remove());

    const spawnFly = () => {
        const fly = document.createElement("div");
        fly.className = "fly";
        fly.textContent = BUGS[Math.floor(Math.random() * BUGS.length)];
        const pad = 10;
        fly.style.left = pad + Math.random() * (area.clientWidth - pad * 2) + "px";
        fly.style.top = 46 + Math.random() * (area.clientHeight - 92) + "px";
        fly.addEventListener("pointerdown", () => {
            if (!running || fly.classList.contains("caught")) return;
            fly.classList.add("caught");
            score += 1;
            scoreEl.textContent = score;
            setTimeout(() => fly.remove(), 240);
        });
        area.appendChild(fly);
        // escape after a short window
        setTimeout(() => { if (!fly.classList.contains("caught")) fly.remove(); }, 1100 + Math.random() * 700);
    };

    const start = () => {
        score = 0; time = 30; running = true;
        scoreEl.textContent = "0";
        timeEl.textContent = "30";
        overlay.hidden = true;
        clearFlies();

        spawnTimer = setInterval(spawnFly, 620);
        spawnFly();
        tickTimer = setInterval(() => {
            time -= 1;
            timeEl.textContent = time;
            if (time <= 0) end();
        }, 1000);
    };

    const stop = () => {
        running = false;
        clearInterval(spawnTimer);
        clearInterval(tickTimer);
    };

    const end = () => {
        stop();
        clearFlies();
        if (score > best) {
            best = score;
            localStorage.setItem("webcatch-best", best);
            bestEl.textContent = best;
        }
        msg.innerHTML = `Time's up! You webbed <b>${score}</b> ${score === 1 ? "bug" : "bugs"}. 🕸`;
        startBtn.textContent = "Play again";
        overlay.hidden = false;
    };

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    startBtn.addEventListener("click", start);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) close(); });
}
