/* ═══════════════════════════════════════════
   GAJAPATHY DASARATHAN — PORTFOLIO SCRIPT
   Bird-flight canvas · Liquid scroll · Chatbot
   ═══════════════════════════════════════════ */

// ─────────────────────────────────────────────
// 1. BIRD-FLIGHT CANVAS
//    Invisible bird path traced as flowing
//    blue-green color ribbons (FFS boid-like)
// ─────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('birdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth  * Math.min(window.devicePixelRatio, 2);
    H = canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  // Nature-themed palette: blue → green → forest → teal
  const PALETTE = [
    [135, 206, 235],  // sky blue
    [64,  196, 156],  // ocean teal
    [100, 200, 120],  // leaf green
    [46,  125,  50],  // deep forest
    [0,   172, 193],  // cyan
    [129, 199, 132],  // light green
    [77,  208, 225],  // aqua
    [255, 204,  0 ],  // gold/sunlight
  ];

  // Invisible "birds" — each is a point following a parametric path
  const BIRDS = 18;
  const birds = Array.from({ length: BIRDS }, (_, i) => ({
    t:        Math.random() * 1000,
    speed:    0.00018 + Math.random() * 0.00025,
    amp:      0.1 + Math.random() * 0.22,
    freq:     0.6 + Math.random() * 1.4,
    freqY:    0.4 + Math.random() * 0.9,
    phase:    Math.random() * Math.PI * 2,
    phaseY:   Math.random() * Math.PI * 2,
    colorIdx: i % PALETTE.length,
    alpha:    0.06 + Math.random() * 0.12,
    size:     3 + Math.random() * 5,
    history:  [],
    maxHist:  55 + Math.floor(Math.random() * 60),
  }));

  // Trail fade layer — key to the FFS / watercolor look
  let trailCanvas = document.createElement('canvas');
  let trailCtx;
  function resizeTrail() {
    trailCanvas.width  = W;
    trailCanvas.height = H;
    trailCtx = trailCanvas.getContext('2d');
  }
  resizeTrail();
  window.addEventListener('resize', () => { resize(); resizeTrail(); });

  function getBirdPos(b, ts) {
    // Lissajous-like path across full screen
    const x = (0.5 + b.amp * Math.sin(b.freq  * ts * b.speed + b.phase )) * W;
    const y = (0.5 + b.amp * Math.sin(b.freqY * ts * b.speed + b.phaseY)) * H;
    return { x, y };
  }

  let lastTs = 0;
  function frame(ts) {
    // Very slow fade so trails linger — apple liquid feel
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // Draw fade overlay
    ctx.fillStyle = 'rgba(255,255,255,0.018)';
    ctx.fillRect(0, 0, W, H);

    birds.forEach(b => {
      b.t = ts;
      const pos = getBirdPos(b, ts);
      b.history.push(pos);
      if (b.history.length > b.maxHist) b.history.shift();

      if (b.history.length < 3) return;

      const col = PALETTE[b.colorIdx];

      // Draw ribbon trail as gradient stroke
      for (let i = 1; i < b.history.length; i++) {
        const p0 = b.history[i - 1];
        const p1 = b.history[i];
        const t  = i / b.history.length;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);

        const alpha = t * b.alpha;
        const width = t * b.size;
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha.toFixed(3)})`;
        ctx.lineWidth   = width;
        ctx.lineCap     = 'round';
        ctx.globalCompositeOperation = 'multiply';
        ctx.stroke();
      }

      // Soft glow at head
      const head = b.history[b.history.length - 1];
      const grd  = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, b.size * 6);
      grd.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${b.alpha * 0.7})`);
      grd.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(head.x, head.y, b.size * 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


// ─────────────────────────────────────────────
// 2. NAVBAR
// ─────────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mob-link').forEach(l =>
  l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  })
);


// ─────────────────────────────────────────────
// 3. SCROLL REVEAL
// ─────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i % 6) * 0.08 + 's';
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


// ─────────────────────────────────────────────
// 4. STAT NUMBER COUNTER ANIMATION
// ─────────────────────────────────────────────
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target.querySelector('.stat-num[data-target]');
    if (!el) return;
    const target = parseInt(el.dataset.target);
    const dur    = 1400;
    let start    = null;
    const step   = ts => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.floor(ease * target);
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
    statObs.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card').forEach(c => statObs.observe(c));


// ─────────────────────────────────────────────
// 5. ACTIVE NAV LINK ON SCROLL
// ─────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => {
        l.style.color = '';
        if (l.getAttribute('href') === '#' + e.target.id) {
          l.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => secObs.observe(s));


// ─────────────────────────────────────────────
// 6. AI PORTFOLIO CHATBOT
//    Knowledge base from resume content
// ─────────────────────────────────────────────
const KNOWLEDGE = {
  greetings: ['hi','hello','hey','good morning','good afternoon'],
  name: ['name','who are you','who is','gajapathy','dasarathan'],
  role: ['role','job','current','work','position','working','empower'],
  experience: ['experience','years','career','work history','state street','intern','chartered'],
  skills: ['skill','skills','know','expertise','competency','competencies','technology','tools'],
  ai: ['ai','artificial intelligence','gpt','chatgpt','automation','custom gpt','automate'],
  gaap: ['gaap','ifrs','accounting standard','us gaap'],
  platforms: ['platform','evestment','wilshire','callan','broadridge','confluence','informa','nasdaq'],
  certifications: ['certification','certificate','course','linkedin','anthropic','derivatives','excel chatgpt','credential'],
  education: ['education','study','college','degree','bcom','cma','vaishnav','cost accountant','b.com'],
  languages: ['language','speak','english','tamil','telugu','typewriting'],
  contact: ['contact','email','reach','location','address','connect'],
  achievement: ['achievement','award','recognition','appreciate','director','md','managing'],
};

const RESPONSES = {
  greetings: "Hello! I'm the portfolio assistant for Gajapathy Dasarathan. Feel free to ask me about his experience, skills, certifications, or how to get in touch! 👋",
  name: "I represent **Gajapathy Dasarathan** — an Investment Reporting & Financial Reporting professional based in Chennai, India with 4+ years of experience.",
  role: "Gajapathy is currently an **Investment Reporting Analyst at Empower** (Bengaluru), since May 2025. He prepares and reviews Mutual Fund financial statements under US GAAP, automates processes using Custom GPT, and works with platforms like Nasdaq eVestment, Broadridge, and Confluence.",
  experience: "Gajapathy has 4+ years of experience across:\n\n• **Empower** (May 2025–Present) — Investment Reporting Analyst, Bengaluru\n• **State Street** (Oct 2022–Apr 2025) — Associate 2, Chennai\n• **Rajesh & Ganesh CA** (Aug 2021–Feb 2022) — Intern, Chennai",
  skills: "Gajapathy's core skills include:\n\n• Financial Reporting (PE, Hedge Funds, Mutual Funds, CLO, REITs)\n• Accounting: US GAAP & IFRS\n• AI & Automation: Custom GPT, ChatGPT, Workflow Optimization\n• Tools: MS Excel, SQL, MS Access, Power BI, SAP\n• Platforms: eVestment, Wilshire, Callan, Broadridge, Confluence",
  ai: "One of Gajapathy's standout achievements is building a **Custom GPT in ChatGPT** to automate fund fact review processes at Empower. This AI integration improved accuracy and efficiency and earned him appreciation from senior leadership and the Director. He also has a certified course in 'Excel and ChatGPT: Data Analysis Power Tips' from LinkedIn Learning.",
  gaap: "Gajapathy is experienced in both **US GAAP and IFRS** financial statements. At Empower, he works under US GAAP for Mutual Funds. At State Street, he worked under both US GAAP and IFRS for PE, CLO, REITs, Hedge Funds, and Fund of Funds.",
  platforms: "Gajapathy has hands-on experience with: **Nasdaq eVestment**, Wilshire, Callan, Informa, Broadridge, and Confluence (IMGD). These are all major investment data and reporting platforms.",
  certifications: "Gajapathy holds 3 certifications:\n\n• **AI Fluency for Students** — Anthropic (Mar 2026)\n• **Derivatives Fundamentals** — LinkedIn Learning (Jun 2025)\n• **Excel and ChatGPT: Data Analysis Power Tips** — LinkedIn Learning (Aug 2025)",
  education: "Gajapathy's educational background:\n\n• **CMA Intermediate** — Institute of Cost Accountants of India (2020, 64%)\n• **B.Com** — DG Vaishnav College (2021, 86%)",
  languages: "Gajapathy speaks:\n• **English** — Fluent (Advanced)\n• **Tamil** — Native\n• **Telugu** — Beginner\n• **Typewriting** — Intermediate",
  contact: "You can reach Gajapathy at:\n\n📧 gajapathy165@gmail.com\n📍 Chennai, Tamil Nadu, India\n🔗 linkedin.com/in/trulygaja",
  achievement: "Gajapathy has received recognition from:\n• **Senior Leadership & Director at Empower** — for building Custom GPT and driving AI integration\n• **Managing Director at State Street** — for quality and process improvements in financial reporting",
  fallback: "That's a great question! For the best answer, I'd suggest reaching out to Gajapathy directly at **gajapathy165@gmail.com** or via LinkedIn. Is there anything else about his experience, skills, or certifications I can help with?",
};

function classifyQuery(text) {
  const lower = text.toLowerCase();
  for (const [key, patterns] of Object.entries(KNOWLEDGE)) {
    if (patterns.some(p => lower.includes(p))) return key;
  }
  return 'fallback';
}

function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');

function appendMsg(text, type) {
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  const p = document.createElement('p');
  p.innerHTML = formatResponse(text);
  div.appendChild(p);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg typing';
  div.id = 'typingIndicator';
  const p = document.createElement('p');
  p.textContent = 'Thinking…';
  div.appendChild(p);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function sendChat() {
  const val = chatInput.value.trim();
  if (!val) return;
  appendMsg(val, 'user');
  chatInput.value = '';

  // Hide suggestions after first use
  const suggBox = document.getElementById('chatSugg');
  if (suggBox) suggBox.style.display = 'none';

  showTyping();
  setTimeout(() => {
    removeTyping();
    const key = classifyQuery(val);
    appendMsg(RESPONSES[key] || RESPONSES.fallback, 'bot');
  }, 700 + Math.random() * 500);
}

function askSugg(btn) {
  chatInput.value = btn.textContent;
  sendChat();
}

// Enter key to send
if (chatInput) {
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
  });
}
