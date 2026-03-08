/* ============================================
   GAJAPATHY DASARATHAN — PORTFOLIO SCRIPT
   ============================================ */

// ============================================================
// STRIPE-STYLE FLOWING WAVE CANVAS ANIMATION
// ============================================================
(function () {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Color palette inspired by Stripe's gradient mesh
  const COLORS = [
    { r: 255, g: 140, b: 50 },   // warm orange
    { r: 255, g: 90,  b: 140 },  // coral pink
    { r: 160, g: 80,  b: 220 },  // violet
    { r: 80,  g: 140, b: 255 },  // sky blue
    { r: 50,  g: 200, b: 180 },  // teal
    { r: 201, g: 168, b: 76  },  // gold (brand accent)
  ];

  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  }
  resize();
  window.addEventListener('resize', resize);

  // Each "ribbon" is a flowing bezier stripe
  const RIBBON_COUNT = 7;
  const ribbons = Array.from({ length: RIBBON_COUNT }, (_, i) => ({
    colorA: COLORS[i % COLORS.length],
    colorB: COLORS[(i + 2) % COLORS.length],
    speed:  0.00025 + i * 0.00008,
    phase:  (i / RIBBON_COUNT) * Math.PI * 2,
    amp:    0.18 + (i % 3) * 0.09,   // amplitude as fraction of H
    freq:   1.2  + (i % 4) * 0.35,   // wave frequency
    yBase:  (i + 0.5) / RIBBON_COUNT, // base y as fraction
    width:  0.22 + (i % 3) * 0.07,   // ribbon thickness as fraction of H
    alpha:  0.55 + (i % 3) * 0.12,
  }));

  let t = 0;

  function lerp(a, b, f) { return a + (b - a) * f; }

  function drawRibbon(r) {
    const phase = r.phase + t * r.speed * Math.PI * 2000;
    const amp   = r.amp   * H;
    const yBase = r.yBase * H;
    const thick = r.width * H;

    // Build path along width of canvas
    const STEPS = 80;
    const grad  = ctx.createLinearGradient(0, 0, W, 0);

    grad.addColorStop(0,   `rgba(${r.colorA.r},${r.colorA.g},${r.colorA.b},0)`);
    grad.addColorStop(0.2, `rgba(${r.colorA.r},${r.colorA.g},${r.colorA.b},${r.alpha})`);
    grad.addColorStop(0.7, `rgba(${r.colorB.r},${r.colorB.g},${r.colorB.b},${r.alpha})`);
    grad.addColorStop(1,   `rgba(${r.colorB.r},${r.colorB.g},${r.colorB.b},0)`);

    // Top edge
    ctx.beginPath();
    for (let s = 0; s <= STEPS; s++) {
      const px = (s / STEPS) * W;
      const wave = Math.sin(s / STEPS * Math.PI * 2 * r.freq + phase)
                 + 0.4 * Math.sin(s / STEPS * Math.PI * 4 * r.freq + phase * 1.3);
      const py = yBase + wave * amp - thick / 2;
      s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    // Bottom edge (reverse)
    for (let s = STEPS; s >= 0; s--) {
      const px = (s / STEPS) * W;
      const wave = Math.sin(s / STEPS * Math.PI * 2 * r.freq + phase)
                 + 0.4 * Math.sin(s / STEPS * Math.PI * 4 * r.freq + phase * 1.3);
      const py = yBase + wave * amp + thick / 2;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function frame(ts) {
    t = ts;
    ctx.clearRect(0, 0, W, H);

    // Soft dark base so waves pop
    ctx.fillStyle = 'rgba(10,12,16,0.15)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'screen';
    ribbons.forEach(r => drawRibbon(r));
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// ============================================================
// ANIMATED TICKER — "X% of finance professionals using AI"
// Counts up from 0 → 68.4% like Stripe's live GDP counter
// ============================================================
(function () {
  const el = document.getElementById('tickerValue');
  if (!el) return;

  const TARGET   = 68.4;
  const DURATION = 3200; // ms
  let   started  = false;
  let   startTs  = null;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function runTicker(ts) {
    if (!startTs) startTs = ts;
    const progress = Math.min((ts - startTs) / DURATION, 1);
    const value    = TARGET * easeOut(progress);
    el.textContent = value.toFixed(1) + '%';
    if (progress < 1) requestAnimationFrame(runTicker);
    else {
      // Keep incrementing slowly like Stripe's live counter
      let v = TARGET;
      setInterval(() => {
        v += Math.random() * 0.003;
        el.textContent = v.toFixed(5) + '%';
      }, 200);
    }
  }

  // Start when hero is visible
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      requestAnimationFrame(runTicker);
    }
  }, { threshold: 0.3 });
  const hero = document.getElementById('hero');
  if (hero) obs.observe(hero);
})();


const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- Mobile hamburger menu ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ---- Scroll reveal ----
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // Stagger children within the same parent
      const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
      let delay = 0;
      siblings.forEach(sib => {
        if (sib === entry.target) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
        }
      });
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ---- Smooth stagger on skill groups ----
const skillGroups = document.querySelectorAll('.skill-group');
skillGroups.forEach((group, i) => {
  group.style.transitionDelay = `${i * 0.07}s`;
});

// ---- Timeline items stagger ----
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach((item, i) => {
  const card = item.querySelector('.timeline-card');
  if (card) card.style.transitionDelay = `${i * 0.1}s`;
});

// ---- Parallax orbs on mouse move (subtle) ----
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  if (orb1) orb1.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
  if (orb2) orb2.style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
});

// ---- Animate stat numbers ----
function animateNumber(el, target, duration = 1200) {
  const isNum = !isNaN(parseInt(target));
  if (!isNum) return;
  const num = parseInt(target);
  const suffix = target.replace(num.toString(), '');
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * num) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEl = entry.target.querySelector('.stat-num');
      if (numEl) {
        const original = numEl.textContent;
        animateNumber(numEl, original);
      }
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => statObserver.observe(card));
