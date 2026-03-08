'use strict';

const PI2  = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ================================================
// 1. LIQUID WATER CURSOR + RIPPLE
// ================================================
const cOuter  = document.getElementById('cursor-outer');
const cInner  = document.getElementById('cursor-inner');
const rCanvas = document.getElementById('rippleCanvas');
const rCtx    = rCanvas ? rCanvas.getContext('2d') : null;
let mx = -300, my = -300, ox = -300, oy = -300;
const ripples = [];

function resizeRipple() {
  if (!rCanvas) return;
  rCanvas.width  = window.innerWidth;
  rCanvas.height = window.innerHeight;
}
resizeRipple();
window.addEventListener('resize', resizeRipple);

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cInner) { cInner.style.left = mx + 'px'; cInner.style.top = my + 'px'; }
});
document.addEventListener('click',      e => spawnRipple(e.clientX, e.clientY, 1.0));
document.addEventListener('touchstart', e => { const t = e.touches[0]; spawnRipple(t.clientX, t.clientY, 1.0); }, { passive: true });
document.addEventListener('touchmove',  e => { const t = e.touches[0]; spawnRipple(t.clientX, t.clientY, 0.3); }, { passive: true });

function spawnRipple(x, y, strength) {
  ripples.push({ x, y, r: 3, maxR: 70 + rand(0, 50), alpha: 0.5 * strength, speed: 2.2 + rand(0, 2) });
  for (let i = 0; i < 2; i++) {
    ripples.push({ x: x + rand(-6, 6), y: y + rand(-6, 6), r: 2, maxR: 35 + rand(0, 25), alpha: 0.22 * strength, speed: 1.6 + rand(0, 1.2) });
  }
}

function tickCursor() {
  ox = lerp(ox, mx, 0.12);
  oy = lerp(oy, my, 0.12);
  if (cOuter) {
    cOuter.style.left = ox + 'px';
    cOuter.style.top  = oy + 'px';
    const dx = mx - ox, dy = my - oy;
    const sp = Math.sqrt(dx * dx + dy * dy);
    const sx = 1 + clamp(sp * 0.012, 0, 0.35);
    const sy = 1 - clamp(sp * 0.006, 0, 0.18);
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);
    cOuter.style.transform = `translate(-50%,-50%) rotate(${ang}deg) scaleX(${sx}) scaleY(${sy})`;
  }
  if (rCtx) {
    rCtx.clearRect(0, 0, rCanvas.width, rCanvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += rp.speed; rp.alpha -= 0.011;
      if (rp.alpha <= 0 || rp.r >= rp.maxR) { ripples.splice(i, 1); continue; }
      for (let ring = 0; ring < 3; ring++) {
        const rr = rp.r - ring * 9;
        if (rr <= 0) continue;
        const a = rp.alpha * (1 - ring * 0.3) * (1 - rp.r / rp.maxR * 0.65);
        rCtx.beginPath();
        rCtx.arc(rp.x, rp.y, rr, 0, PI2);
        rCtx.strokeStyle = `rgba(13,148,136,${a.toFixed(3)})`;
        rCtx.lineWidth = clamp(1.4 - ring * 0.35, 0.3, 1.4);
        rCtx.stroke();
      }
    }
  }
  requestAnimationFrame(tickCursor);
}
requestAnimationFrame(tickCursor);


// ================================================
// 2. BIRD-VIEW BACKGROUND — very light, white-safe
//    Uses multiply blend mode so it stays subtle
//    on white backgrounds (nearly invisible unless
//    you look for it — just a gentle shimmer)
// ================================================
(function () {
  const canvas = document.getElementById('birdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  let scrollT = 0;
  window.addEventListener('scroll', () => {
    const ms = document.body.scrollHeight - window.innerHeight;
    scrollT = ms > 0 ? window.scrollY / ms : 0;
  });

  // Color palette per scroll — soft nature colors on white
  const PALETTES = [
    [[34,139,34],  [0,180,120]],   // forest green
    [[0,120,200],  [0,200,220]],   // waterfall blue
    [[0,100,180],  [255,120,80]],  // ocean + coral
    [[120,50,180], [255,100,50]],  // mountain sunset
    [[255,165,0],  [0,180,200]],   // beach
    [[30,60,180],  [255,50,120]],  // city night
    [[255,100,0],  [220,80,180]],  // sunrise
  ];

  function getPalette(t) {
    const idx = t * (PALETTES.length - 1);
    const lo  = Math.floor(idx);
    const hi  = Math.min(lo + 1, PALETTES.length - 1);
    const f   = idx - lo;
    return PALETTES[lo].map((col, ci) => col.map((v, vi) => lerp(v, PALETTES[hi][ci][vi], f)));
  }

  const PARTICLES = 120;
  const pts = Array.from({ length: PARTICLES }, () => ({
    x: rand(-0.8, 0.8), y: rand(-0.8, 0.8), z: rand(0.1, 1),
    vz: rand(0.003, 0.008),
    layer: Math.floor(rand(0, 2)),
    trail: [], maxT: Math.floor(rand(20, 55)),
  }));

  let pmx = 0, pmy = 0;
  document.addEventListener('mousemove', e => {
    pmx = (e.clientX / window.innerWidth  - 0.5) * 0.03;
    pmy = (e.clientY / window.innerHeight - 0.5) * 0.03;
  });

  function proj(x, y, z) {
    const inv = 1 / Math.max(z, 0.01);
    return { sx: W * 0.5 + (x + pmx) * W * 0.7 * inv, sy: H * 0.5 + (y + pmy) * H * 0.7 * inv, sz: inv * 3 };
  }

  function frame(ts) {
    // Very faint white fade — keeps canvas almost clear on white bg
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 0, W, H);

    const pal = getPalette(scrollT);

    pts.forEach(p => {
      p.z -= p.vz * (0.4 + scrollT * 0.5);
      const sp = (1 - p.z) * 0.002;
      p.x += p.x * sp + pmx * 0.008;
      p.y += p.y * sp + pmy * 0.008;

      const pos = proj(p.x, p.y, p.z);
      p.trail.push({ x: pos.sx, y: pos.sy });
      if (p.trail.length > p.maxT) p.trail.shift();

      if (p.z < 0.02 || pos.sx < -80 || pos.sx > W + 80 || pos.sy < -80 || pos.sy > H + 80) {
        p.x = rand(-0.25, 0.25); p.y = rand(-0.25, 0.25);
        p.z = 1.0; p.trail = [];
        return;
      }
      if (p.trail.length < 2) return;

      const col = pal[p.layer];
      ctx.globalCompositeOperation = 'multiply';
      for (let i = 1; i < p.trail.length; i++) {
        const tp  = (i - 1) / (p.trail.length - 1);
        const a   = tp * tp * 0.25;   // very subtle
        const lw  = tp * pos.sz * 2;
        ctx.beginPath();
        ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y);
        ctx.lineTo(p.trail[i].x,   p.trail[i].y);
        ctx.strokeStyle = `rgba(${col[0]|0},${col[1]|0},${col[2]|0},${a.toFixed(3)})`;
        ctx.lineWidth   = lw;
        ctx.lineCap     = 'round';
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


// ================================================
// 3. SCENE CANVASES — subtle decorative overlays
//    Low opacity, nature-themed, white-safe
// ================================================
const SCENES = [
  {
    id: 'hero',
    draw(ctx, W, H, t) {
      // Neon Forest — subtle green shimmer at edges
      ctx.clearRect(0, 0, W, H);
      // Right edge tree silhouette
      for (let i = 0; i < 6; i++) {
        const tx = W * 0.72 + i * 60;
        const th = H * (0.3 + 0.2 * Math.sin(i * 2.1));
        const sway = Math.sin(t * 0.0004 + i * 1.4) * 4;
        ctx.save(); ctx.translate(tx + sway, H);
        const g = ctx.createLinearGradient(0, 0, 0, -th);
        g.addColorStop(0, 'rgba(22,101,52,0.3)');
        g.addColorStop(1, 'rgba(57,200,100,0.08)');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-(30 + i * 8), -th * 0.5);
        ctx.lineTo(-(20 + i * 5), -th * 0.7);
        ctx.lineTo(0, -th);
        ctx.lineTo((20 + i * 5), -th * 0.7);
        ctx.lineTo((30 + i * 8), -th * 0.5);
        ctx.closePath();
        ctx.fillStyle = g; ctx.fill();
        ctx.restore();
      }
      // Firefly dots
      for (let i = 0; i < 18; i++) {
        const fx = W * 0.6 + Math.sin(t * 0.0003 + i * 2) * W * 0.35;
        const fy = H * 0.2 + Math.cos(t * 0.0002 + i * 1.7) * H * 0.45;
        const fa = 0.25 + 0.2 * Math.sin(t * 0.001 * (i % 3 + 1) + i);
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 10);
        fg.addColorStop(0, `rgba(57,255,20,${fa.toFixed(2)})`);
        fg.addColorStop(1, 'rgba(57,255,20,0)');
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.arc(fx, fy, 10, 0, PI2); ctx.fill();
      }
    }
  },
  {
    id: 'profile',
    draw(ctx, W, H, t) {
      // Waterfall — right side streams
      ctx.clearRect(0, 0, W, H);
      for (let s = 0; s < 5; s++) {
        const sx = W * 0.62 + s * 40;
        const speed = 0.0008 + s * 0.0002;
        const offset = (t * speed + s * 0.2) % 1.0;
        for (let seg = 0; seg < 4; seg++) {
          const segY = ((offset + seg * 0.25) % 1.0) * H;
          const segH = H * 0.09;
          const g = ctx.createLinearGradient(sx, segY - segH, sx + 12, segY);
          g.addColorStop(0, `rgba(0,180,220,0)`);
          g.addColorStop(0.4, `rgba(0,200,240,0.18)`);
          g.addColorStop(1, `rgba(0,180,220,0)`);
          ctx.fillStyle = g;
          ctx.fillRect(sx, segY - segH, 12, segH);
        }
      }
    }
  },
  {
    id: 'skills',
    draw(ctx, W, H, t) {
      // Ocean — gentle wave at top right
      ctx.clearRect(0, 0, W, H);
      for (let w = 0; w < 3; w++) {
        const yBase = H * (0.1 + w * 0.06);
        const amp   = 8 + w * 4;
        const freq  = 0.01 - w * 0.001;
        ctx.beginPath();
        ctx.moveTo(W * 0.5, H);
        for (let x = W * 0.5; x <= W + 20; x += 4) {
          const y = yBase + Math.sin(x * freq + t * 0.0005) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W + 20, H); ctx.closePath();
        ctx.fillStyle = `rgba(0,150,200,${0.06 + w * 0.02})`;
        ctx.fill();
      }
      // Coral dots at bottom right
      for (let c = 0; c < 8; c++) {
        const cx = W * 0.6 + c * (W * 0.05);
        const cy = H * 0.88 + Math.sin(t * 0.0003 + c) * 6;
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, PI2);
        const cols = ['255,80,80','255,140,0','200,80,200'];
        ctx.fillStyle = `rgba(${cols[c % cols.length]},0.3)`;
        ctx.fill();
      }
    }
  },
  {
    id: 'experience',
    draw(ctx, W, H, t) {
      // Mountain — right side silhouette
      ctx.clearRect(0, 0, W, H);
      const ranges = [
        { peaks: 4, hm: 0.45, col: 'rgba(100,60,160,0.12)', xStart: 0.45 },
        { peaks: 5, hm: 0.32, col: 'rgba(150,80,50,0.1)',   xStart: 0.35 },
      ];
      ranges.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.xStart * W, H);
        const step = (W - r.xStart * W) / r.peaks;
        for (let i = 0; i <= r.peaks; i++) {
          const px = r.xStart * W + i * step;
          const ph = H * r.hm * (0.7 + 0.3 * Math.sin(i * 2.8 + r.peaks));
          ctx.lineTo(px - step / 2, H - ph);
          ctx.lineTo(px, H);
        }
        ctx.closePath(); ctx.fillStyle = r.col; ctx.fill();
      });
      // Stars at top right
      for (let i = 0; i < 20; i++) {
        const sx = W * 0.5 + (i * 137.5) % (W * 0.5);
        const sy = (i * 73.1) % (H * 0.35);
        const sa = 0.2 + 0.15 * Math.sin(t * 0.001 * (i % 3 + 1) + i);
        ctx.beginPath(); ctx.arc(sx, sy, 1, 0, PI2);
        ctx.fillStyle = `rgba(100,80,200,${sa.toFixed(2)})`; ctx.fill();
      }
    }
  },
  {
    id: 'certifications',
    draw(ctx, W, H, t) {
      // Beach — bottom wave
      ctx.clearRect(0, 0, W, H);
      for (let w = 0; w < 3; w++) {
        const yBase = H * (0.82 + w * 0.05);
        const amp   = 6 + w * 3;
        const freq  = 0.015;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const y = yBase + Math.sin(x * freq + t * 0.0004 + w) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H); ctx.closePath();
        ctx.fillStyle = `rgba(0,150,200,${0.07 + w * 0.02})`; ctx.fill();
      }
      // Sun glow top right
      const sg = ctx.createRadialGradient(W * 0.88, H * 0.08, 0, W * 0.88, H * 0.08, 120);
      sg.addColorStop(0, 'rgba(255,180,50,0.18)');
      sg.addColorStop(1, 'rgba(255,140,0,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(W * 0.6, 0, W * 0.4, H * 0.3);
    }
  },
  {
    id: 'education',
    draw(ctx, W, H, t) {
      // Cityscape — right side buildings
      ctx.clearRect(0, 0, W, H);
      for (let b = 0; b < 10; b++) {
        const bx = W * 0.55 + b * (W * 0.045);
        const bw = W * 0.035;
        const bh = H * (0.15 + 0.2 * Math.sin(b * 1.7 + 1));
        ctx.fillStyle = `rgba(30,40,80,${0.06 + (b % 3) * 0.02})`;
        ctx.fillRect(bx, H - bh, bw, bh);
        // Window lights
        for (let row = 0; row < 4; row++) {
          const on = Math.sin(t * 0.0003 + b * 5 + row * 7) > 0;
          if (!on) continue;
          ctx.fillStyle = 'rgba(255,200,80,0.25)';
          ctx.fillRect(bx + bw * 0.2, H - bh + bh * (row + 1) / 6, 4, 5);
          ctx.fillRect(bx + bw * 0.6, H - bh + bh * (row + 1) / 6, 4, 5);
        }
      }
    }
  },
  {
    id: 'contact',
    draw(ctx, W, H, t) {
      // Sunrise glow
      ctx.clearRect(0, 0, W, H);
      const sg = ctx.createRadialGradient(W * 0.5, H * 0.8, 0, W * 0.5, H * 0.8, H * 0.8);
      sg.addColorStop(0, `rgba(255,160,50,${0.12 + 0.04 * Math.sin(t * 0.0002)})`);
      sg.addColorStop(0.4, 'rgba(255,100,0,0.06)');
      sg.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      // Horizon line
      ctx.beginPath(); ctx.moveTo(0, H * 0.75); ctx.lineTo(W, H * 0.75);
      ctx.strokeStyle = 'rgba(255,140,50,0.15)'; ctx.lineWidth = 1; ctx.stroke();
      // Bird V-formation
      ctx.fillStyle = 'rgba(50,30,80,0.2)';
      const bx = W * 0.5 + Math.sin(t * 0.0002) * 80;
      const by = H * 0.25;
      for (let i = 0; i < 5; i++) {
        const bbx = bx + (i - 2) * 22;
        const bby = by + Math.abs(i - 2) * 7;
        ctx.beginPath();
        ctx.arc(bbx, bby, 2, Math.PI, PI2);
        ctx.arc(bbx + 6, bby + 2, 2, Math.PI, PI2);
        ctx.fill();
      }
    }
  }
];

SCENES.forEach(cfg => {
  const section = document.getElementById(cfg.id);
  if (!section) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'scene-canvas';
  section.insertBefore(canvas, section.firstChild);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  function resize() {
    W = canvas.width  = section.offsetWidth  || window.innerWidth;
    H = canvas.height = section.offsetHeight || window.innerHeight;
  }
  resize();
  new ResizeObserver(resize).observe(section);
  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(section);
  let lastTs = 0;
  function loop(ts) {
    if (visible) cfg.draw(ctx, W, H, ts);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});


// ================================================
// 4. NAVBAR
// ================================================
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 60); });
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', () => {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}));


// ================================================
// 5. SCROLL REVEAL
// ================================================
new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i % 5) * 0.1 + 's';
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
.observe && document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.1 }).observe(el);
});


// ================================================
// 6. STAT COUNTERS
// ================================================
document.querySelectorAll('.stat-card').forEach(card => {
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    const el = card.querySelector('.stat-num[data-target]');
    if (!el) return;
    const target = parseInt(el.dataset.target);
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }, { threshold: 0.5 }).observe(card);
});


// ================================================
// 7. ACTIVE NAV
// ================================================
document.querySelectorAll('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.nav-link').forEach(l => {
      l.style.color = '';
      if (l.getAttribute('href') === '#' + sec.id) l.style.color = 'var(--teal)';
    });
  }, { threshold: 0.4 }).observe(sec);
});


// ================================================
// 8. CHATBOT
// ================================================
const KB = {
  greetings:      ['hi','hello','hey'],
  name:           ['name','who','gajapathy','dasarathan'],
  role:           ['role','job','current','work','position','empower'],
  experience:     ['experience','years','career','state street','intern','chartered'],
  skills:         ['skill','know','expertise','tools','technology'],
  ai:             ['ai','artificial intelligence','gpt','chatgpt','automation'],
  gaap:           ['gaap','ifrs','accounting standard'],
  platforms:      ['platform','evestment','wilshire','callan','broadridge','confluence'],
  certifications: ['certification','certificate','course','linkedin','anthropic','derivatives'],
  education:      ['education','study','college','degree','bcom','cma','vaishnav'],
  languages:      ['language','speak','english','tamil','telugu'],
  contact:        ['contact','email','reach','location','linkedin'],
  achievement:    ['achievement','award','recognition','appreciate','director'],
};
const RS = {
  greetings:      "Hello! I'm Gajapathy's portfolio assistant. Ask me about his experience, skills, certifications, or how to reach him! 👋",
  name:           "I represent **Gajapathy Dasarathan** — Investment Reporting & Financial Reporting professional, 4+ years experience, Chennai, India.",
  role:           "Currently **Investment Reporting Analyst at Empower** (Bengaluru, May 2025–Present). Prepares Mutual Fund statements under US GAAP, automates processes via Custom GPT, works with Nasdaq eVestment, Broadridge, Confluence.",
  experience:     "4+ years across:\n\n• **Empower** — Investment Reporting Analyst (May 2025–Present)\n• **State Street** — Associate 2 (Oct 2022–Apr 2025)\n• **Rajesh & Ganesh CA** — Intern (Aug 2021–Feb 2022)",
  skills:         "Core skills:\n\n• **Reporting:** PE, Hedge Funds, Mutual Funds, CLO, REITs\n• **Standards:** US GAAP & IFRS\n• **AI:** Custom GPT, Process Automation, ChatGPT\n• **Tools:** Excel, SQL, MS Access, Power BI, SAP\n• **Platforms:** eVestment, Wilshire, Callan, Broadridge, Confluence",
  ai:             "Built a **Custom GPT in ChatGPT** at Empower to automate fund fact reviews — improved accuracy and earned recognition from the Director. Also certified in 'Excel and ChatGPT: Data Analysis Power Tips'.",
  gaap:           "Experienced in **US GAAP** (Mutual Funds at Empower) and **IFRS** (PE, CLO, REITs, Hedge Funds at State Street).",
  platforms:      "Worked with: **Nasdaq eVestment**, Wilshire, Callan, Informa, Broadridge, Confluence (IMGD).",
  certifications: "Three credentials:\n\n• **AI Fluency for Students** — Anthropic (Mar 2026)\n• **Derivatives Fundamentals** — LinkedIn (Jun 2025)\n• **Excel and ChatGPT: Data Analysis Power Tips** — LinkedIn (Aug 2025)",
  education:      "• **CMA Intermediate** — ICAI (2020, 64%)\n• **B.Com** — DG Vaishnav College (2021, 86%)",
  languages:      "**English** (Fluent), **Tamil** (Native), **Telugu** (Beginner), **Typewriting** (Intermediate).",
  contact:        "📧 gajapathy165@gmail.com\n📍 Chennai, Tamil Nadu, India\n🔗 linkedin.com/in/trulygaja",
  achievement:    "• **Director & Senior Leadership at Empower** — recognised for Custom GPT and AI integration\n• **Managing Director at State Street** — recognised for quality and process improvements",
  fallback:       "Great question! Reach Gajapathy directly at **gajapathy165@gmail.com** or LinkedIn. Anything else I can help with?",
};

function classify(text) {
  const l = text.toLowerCase();
  for (const [key, patterns] of Object.entries(KB)) {
    if (patterns.some(p => l.includes(p))) return key;
  }
  return 'fallback';
}
function fmt(t) {
  return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');

function appendMsg(text, type) {
  const d = document.createElement('div');
  d.className = 'msg ' + type;
  const p = document.createElement('p');
  p.innerHTML = fmt(text);
  d.appendChild(p);
  chatMessages.appendChild(d);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChat() {
  const val = (chatInput ? chatInput.value : '').trim();
  if (!val) return;
  appendMsg(val, 'user');
  chatInput.value = '';
  const sugg = document.getElementById('chatSugg');
  if (sugg) sugg.style.display = 'none';
  const typing = document.createElement('div');
  typing.className = 'msg typing'; typing.id = 'typingDot';
  typing.innerHTML = '<p>Thinking…</p>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  setTimeout(() => {
    const t = document.getElementById('typingDot');
    if (t) t.remove();
    appendMsg(RS[classify(val)] || RS.fallback, 'bot');
  }, 600 + Math.random() * 400);
}

function askSugg(btn) {
  if (chatInput) chatInput.value = btn.textContent;
  sendChat();
}

if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
