// Friendly rule-based chatbot — canned answers about Rahul. No real AI:
// it matches keywords and replies from a fixed script.

const REPLIES = {
    about: "Rahul Mehta is a full-stack web developer and B.Tech CSE graduate. He builds fast, scalable, and visually exceptional web experiences. 🕸<br>See his <a href='#projects' data-jump>projects</a> or <a href='#skills' data-jump>skills</a>.",
    skills: "His stack: React, Node.js, Express, MongoDB (MERN), Python, Flask, SQL, HTML &amp; CSS.<br>Languages: C, Java, Python, JavaScript.<br><a href='#skills' data-jump>Jump to Tech Stack →</a>",
    projects: "Two featured missions:<br>• <a href='https://github.com/R4HUL0007/Atulya-Yatra' target='_blank' rel='noopener'>Atulya Yatra ↗</a> — a Flask tourism app.<br>• <a href='https://ridexshare.online' target='_blank' rel='noopener'>RideXShare ↗</a> — MERN ride-sharing (<a href='https://github.com/R4HUL0007/RideShare' target='_blank' rel='noopener'>GitHub ↗</a>).<br><a href='#projects' data-jump>See all →</a>",
    experience: "Currently an AI/ML Intern @ <a href='https://myonsitehealthcare.com/' target='_blank' rel='noopener'>MyOnsite Healthcare ↗</a>.<br>Previously a Full-Stack Developer intern @ <a href='https://www.shadowfox.in/' target='_blank' rel='noopener'>ShadowFox ↗</a>.<br><a href='#experience' data-jump>See timeline →</a>",
    education: "B.Tech in Computer Science &amp; Engineering — completed. 🎓",
    contact: "Reach him via the <a href='#contact' data-jump>contact form</a>, or on <a href='https://github.com/R4HUL0007' target='_blank' rel='noopener'>GitHub ↗</a>, <a href='https://www.linkedin.com/in/rahul-mehta-616a5b212' target='_blank' rel='noopener'>LinkedIn ↗</a>, or <a href='https://x.com/RahulMe91416413' target='_blank' rel='noopener'>X ↗</a>.",
    resume: "Grab his <a href='Rahul_Mehta1.pdf' target='_blank' rel='noopener'>resume (PDF) ↗</a> 📄, or use the Download CV button in the sidebar.",
    hire: "He's open to opportunities! Drop a message via the <a href='#contact' data-jump>contact form</a> and he'll swing back to you soon.",
    greeting: "Hey there! 👋 I'm WebBot. Ask me about Rahul's skills, projects, experience, or how to reach him.",
    identity: "I'm WebBot 🕸 — Rahul's friendly assistant. I can tell you about his skills, projects, experience, and how to reach him.",
    thanks: "Anytime! 🕷 Happy to help. Ask me anything else about Rahul.",
    bye: "Catch you later! 👋 Thanks for swinging by — come back anytime.",
    howareyou: "I'm doing great, thanks for asking! 🕸 Ready to tell you all about Rahul. What would you like to know?",
    fun: "Fun fact: this whole site is spider-themed — the cursor is a spider that shoots webs, and a little spider rides down as you scroll. 🕸",
    abuse: "Whoa, let's keep it friendly 🕸 I'm just here to chat about Rahul's work — ask me about his skills or projects!",
    fallback: "I'm a friendly web-bot with canned answers 🕸 — try asking about his skills, projects, experience, education, or contact.",
};

const PROFANITY = ["fuck", "fuk", "fck", "shit", "bitch", "asshole", "bastard", "dick", "cunt", "slut", "whore", "motherf", "bullshit", "stfu", "screw you", "idiot", "stupid", "loser", "hate you", "you suck", "shut up"];

const INTENTS = [
    { key: "greeting", words: ["hi", "hii", "hey", "hello", "yo", "sup", "namaste", "hola", "good morning", "good evening", "greetings"] },
    { key: "howareyou", words: ["how are you", "how r u", "how are u", "how's it going", "whats up", "what's up"] },
    { key: "identity", words: ["who are you", "your name", "what are you", "webbot", "are you a bot", "are you ai", "are you real"] },
    { key: "bye", words: ["bye", "goodbye", "see ya", "see you", "cya", "gtg", "take care", "good night"] },
    { key: "about", words: ["about", "who is rahul", "yourself", "rahul", "intro", "tell me about"] },
    { key: "skills", words: ["skill", "tech", "stack", "language", "tools", "know", "framework"] },
    { key: "projects", words: ["project", "work", "build", "atulya", "ridex", "portfolio", "made", "app"] },
    { key: "experience", words: ["experience", "intern", "job", "shadowfox", "myonsite", "company", "working"] },
    { key: "education", words: ["education", "degree", "college", "btech", "study", "graduate", "cse", "university"] },
    { key: "contact", words: ["contact", "reach", "email", "connect", "linkedin", "github", "twitter", "message"] },
    { key: "resume", words: ["resume", "cv", "download"] },
    { key: "hire", words: ["hire", "opportunit", "available", "freelance", "open to", "work with", "recruit"] },
    { key: "thanks", words: ["thanks", "thank", "thx", "cool", "nice", "awesome", "great", "amazing"] },
    { key: "fun", words: ["fun", "spider", "theme", "easter", "secret", "joke"] },
];

const QUICK = [
    ["About", "about"], ["Skills", "skills"], ["Projects", "projects"],
    ["Experience", "experience"], ["Contact", "contact"], ["Resume", "resume"],
];

function match(text) {
    const t = text.toLowerCase();
    if (PROFANITY.some((w) => t.includes(w))) return REPLIES.abuse;
    for (const intent of INTENTS) {
        if (intent.words.some((w) => t.includes(w))) return REPLIES[intent.key];
    }
    return REPLIES.fallback;
}

export function initChatbot() {
    const toggle = document.getElementById("chatToggle");
    const panel = document.getElementById("chatPanel");
    const closeBtn = document.getElementById("chatClose");
    const clearBtn = document.getElementById("chatClear");
    const body = document.getElementById("chatBody");
    const quick = document.getElementById("chatQuick");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    if (!toggle || !panel) return;

    let greeted = false;

    const scroll = () => { body.scrollTop = body.scrollHeight; };

    const addMsg = (text, who) => {
        const el = document.createElement("div");
        el.className = `msg msg--${who}`;
        // Bot text is our own trusted, link-rich HTML; user text is escaped.
        if (who === "bot") el.innerHTML = text; else el.textContent = text;
        body.appendChild(el);
        scroll();
        return el;
    };

    const botReply = (text) => {
        const typing = document.createElement("div");
        typing.className = "msg msg--bot msg--typing";
        typing.textContent = "typing…";
        body.appendChild(typing);
        scroll();
        setTimeout(() => {
            typing.remove();
            addMsg(text, "bot");
        }, 500 + Math.random() * 400);
    };

    toggle.classList.add("pinging");

    const open = () => {
        panel.hidden = false;
        toggle.classList.add("is-open");
        toggle.classList.remove("pinging");
        toggle.setAttribute("aria-expanded", "true");
        if (!greeted) {
            greeted = true;
            addMsg(REPLIES.greeting, "bot");
        }
        input.focus();
    };
    const close = () => {
        panel.hidden = true;
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    // Let the native cursor take over inside the chatbot (hide the spider cursor).
    const chatbot = document.getElementById("chatbot");
    chatbot.addEventListener("pointerenter", () => document.documentElement.classList.add("over-ui"));
    chatbot.addEventListener("pointerleave", () => document.documentElement.classList.remove("over-ui"));

    toggle.addEventListener("click", () => (panel.hidden ? open() : close()));
    closeBtn.addEventListener("click", close);
    clearBtn.addEventListener("click", () => {
        body.innerHTML = "";
        addMsg(REPLIES.greeting, "bot");
        input.focus();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });

    // Clicking a "jump to section" link closes the chat so the section is visible.
    body.addEventListener("click", (e) => {
        if (e.target.closest("a[data-jump]")) close();
    });

    // Quick-reply chips
    QUICK.forEach(([label, key]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chatbot__chip";
        b.textContent = label;
        b.addEventListener("click", () => {
            addMsg(label, "user");
            botReply(REPLIES[key]);
        });
        quick.appendChild(b);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        addMsg(text, "user");
        input.value = "";
        botReply(match(text));
    });
}
