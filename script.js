/* ================================================
   GAJAPATHY DASARATHAN — IMMERSIVE PORTFOLIO JS
   FPS Bird View · Neon Scenes · Liquid Cursor
   ================================================ */

'use strict';

// ================================================
// UTILITIES
// ================================================
const PI2 = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ================================================
// 1. LIQUID WATER CURSOR + RIPPLE EFFECT
// ================================================
const cursorOuter = document.getElementById('cursor-outer');
const cursorInner = document.getElementById('cursor-inner');
const rippleCanvas = document.getElementById('rippleCanvas');
const rippleCtx = rippleCanvas ? rippleCanvas.getContext('2d') : null;

let mouseX = -200, mouseY = -200;
let outerX = -200, outerY = -200;
const ripples = [];

// Resize ripple canvas
function resizeRipple() {
  if (!rippleCanvas) return;
  rippleCanvas.width  = window.innerWidth;
  rippleCanvas.height = window.innerHeight;
}
resizeRipple();
window.addEventListener('resize', resizeRipple);

// Track mouse/touch
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorInner) {
    cursorInner.style.left = mouseX + 'px';
    cursorInner.style.top  = mouseY + 'px';
  }
});

document.addEventListener('click', e => spawnRipple(e.clientX, e.clientY));
document.addEventListener('touchstart', e => {
  const t = e.touches[0];
  spawnRipple(t.clientX, t.clientY);
}, { passive: true });
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  spawnRipple(t.clientX, t.clientY, 0.3);
}, { passive: true });

function spawnRipple(x, y, strength = 1.0) {
  ripples.push({ x, y, r: 4, maxR: 80 + rand(0, 60), alpha: 0.55 * strength, speed: 2.5 + rand(0, 2) });
  // Spawn a few secondary rings
  for (let i = 0; i < 2; i++) {
    ripples.push({ x: x + rand(-8, 8), y: y + rand(-8, 8), r: 2, maxR: 40 + rand(0, 30), alpha: 0.25 * strength, speed: 1.8 + rand(0, 1.5) });
  }
}

function animateCursor() {
  // Outer cursor lags behind (rubber band)
  outerX = lerp(outerX, mouseX, 0.12);
  outerY = lerp(outerY, mouseY, 0.12);
  if (cursorOuter) {
    cursorOuter.style.left = outerX + 'px';
    cursorOuter.style.top  = outerY + 'px';
    // Squash & stretch based on movement speed
    const dx = mouseX - outerX;
    const dy = mouseY - outerY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const scaleX = 1 + clamp(speed * 0.012, 0, 0.4);
    const scaleY = 1 - clamp(speed * 0.006, 0, 0.2);
    const angle  = Math.atan2(dy, dx) * (180 / Math.PI);
    cursorOuter.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(${scaleX}) scaleY(${scaleY})`;
  }

  // Draw ripples on canvas
  if (rippleCtx) {
    rippleCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r     += rp.speed;
      rp.alpha -= 0.012;
      if (rp.alpha <= 0 || rp.r >= rp.maxR) { ripples.splice(i, 1); continue; }

      const prog = rp.r / rp.maxR;
      // Multiple wave rings per ripple
      for (let ring = 0; ring < 3; ring++) {
        const rr = rp.r - ring * 10;
        if (rr <= 0) continue;
        const a = rp.alpha * (1 - ring * 0.3) * (1 - prog * 0.7);
        rippleCtx.beginPath();
        rippleCtx.arc(rp.x, rp.y, rr, 0, PI2);
        rippleCtx.strokeStyle = `rgba(0,255,231,${a.toFixed(3)})`;
        rippleCtx.lineWidth = clamp(1.5 - ring * 0.4, 0.3, 1.5);
        rippleCtx.stroke();
      }
      // Soft glow at ripple center on first frame
      if (rp.r < 20) {
        const grd = rippleCtx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, 20);
        grd.addColorStop(0, `rgba(0,255,231,${(rp.alpha * 0.4).toFixed(3)})`);
        grd.addColorStop(1, 'rgba(0,255,231,0)');
        rippleCtx.fillStyle = grd;
        rippleCtx.beginPath();
        rippleCtx.arc(rp.x, rp.y, 20, 0, PI2);
        rippleCtx.fill();
      }
    }
  }
  requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);


// ================================================
// 2. FPS BIRD-VIEW BACKGROUND CANVAS
//    3D parallax depth layers + colored neon trails
//    like flying through forest canopy at speed
// ================================================
(function () {
  const canvas = document.getElementById('birdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio, 2);
    W   = window.innerWidth;
    H   = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Scroll progress 0..1
  let scrollT = 0;
  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollT = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  });

  // Color themes per scroll progress
  const THEMES = [
    // Forest
    { r1:[30,120,30],  r2:[0,200,150],  r3:[57,255,20],  r4:[0,255,180]  },
    // Waterfall
    { r1:[0,100,200],  r2:[0,200,255],  r3:[100,220,255], r4:[200,255,255]},
    // Ocean Coral Reef
    { r1:[0,60,180],   r2:[0,200,200],  r3:[255,100,100], r4:[255,200,0]  },
    // Mountain Sunset
    { r1:[80,0,120],   r2:[200,60,200], r3:[255,140,0],   r4:[255,200,50] },
    // Beach
    { r1:[255,180,0],  r2:[255,120,0],  r3:[0,200,200],   r4:[100,220,255]},
    // Cityscape Night
    { r1:[10,10,60],   r2:[60,60,200],  r3:[255,60,120],  r4:[255,220,0]  },
    // Sunrise
    { r1:[255,80,0],   r2:[255,180,0],  r3:[255,100,100], r4:[200,100,255]},
  ];

  function getThemeColor(scrollT) {
    const idx   = scrollT * (THEMES.length - 1);
    const lo    = Math.floor(idx);
    const hi    = Math.min(lo + 1, THEMES.length - 1);
    const t     = idx - lo;
    const A     = THEMES[lo];
    const B     = THEMES[hi];
    return {
      r1: A.r1.map((v, i) => lerp(v, B.r1[i], t)),
      r2: A.r2.map((v, i) => lerp(v, B.r2[i], t)),
      r3: A.r3.map((v, i) => lerp(v, B.r3[i], t)),
      r4: A.r4.map((v, i) => lerp(v, B.r4[i], t)),
    };
  }

  // 3D depth particles — flying-through-forest feel
  const PARTICLE_COUNT = 180;
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => createParticle(i));

  function createParticle(i, reset = false) {
    return {
      x:     rand(-1, 1),      // screen space -1..1
      y:     rand(-1, 1),
      z:     reset ? 1.0 : rand(0.05, 1.0),  // depth 0=near, 1=far
      vz:    rand(0.003, 0.009),  // flying toward camera
      layer: i % 4,
      trail: [],
      maxTrail: 12 + Math.floor(rand(0, 18)),
      size:  rand(1, 3),
    };
  }

  // Subtle mouse parallax
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 0.04;
    my = (e.clientY / window.innerHeight - 0.5) * 0.04;
  });

  function project(x, y, z) {
    // Simple perspective projection
    const fov  = 0.8;
    const inv  = 1 / Math.max(z, 0.01);
    const sx   = W * 0.5 + (x + mx) * W * fov * inv;
    const sy   = H * 0.5 + (y + my) * H * fov * inv;
    const size = inv * 4;
    return { sx, sy, size };
  }

  // Very slow fade — lets trails linger like light streaks
  const FADE = 'rgba(13,17,23,0.025)';

  function frame(ts) {
    const theme = getThemeColor(scrollT);
    const cols  = [theme.r1, theme.r2, theme.r3, theme.r4];

    ctx.fillStyle = FADE;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      // Move toward camera (decreasing z)
      p.z -= p.vz * (0.5 + scrollT * 0.6);

      // FPS parallax — particles near edges drift outward
      const speed = (1 - p.z) * 0.003;
      p.x += p.x * speed + mx * 0.01;
      p.y += p.y * speed + my * 0.01;

      const pos = project(p.x, p.y, p.z);
      p.trail.push({ x: pos.sx, y: pos.sy, z: p.z });
      if (p.trail.length > p.maxTrail) p.trail.shift();

      // Reset when particle exits screen or comes too close
      if (p.z < 0.02 || pos.sx < -100 || pos.sx > W + 100 || pos.sy < -100 || pos.sy > H + 100) {
        Object.assign(p, createParticle(0, true));
        p.x = rand(-0.3, 0.3);
        p.y = rand(-0.3, 0.3);
        p.trail = [];
        return;
      }

      if (p.trail.length < 2) return;

      const col = cols[p.layer];
      // Draw trail — tapers from faint far end to bright near end
      for (let i = 1; i < p.trail.length; i++) {
        const tp  = (i - 1) / (p.trail.length - 1);
        const a   = tp * tp * 0.7;
        const lw  = tp * pos.size * (2 + p.layer * 0.5);
        ctx.beginPath();
        ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
        ctx.lineTo(p.trail[i].x,     p.trail[i].y);
        ctx.strokeStyle = `rgba(${col[0]|0},${col[1]|0},${col[2]|0},${a.toFixed(3)})`;
        ctx.lineWidth   = lw;
        ctx.lineCap     = 'round';
        ctx.globalCompositeOperation = 'screen';
        ctx.stroke();
      }

      // Bright glow at head
      const head = p.trail[p.trail.length - 1];
      const grd  = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, pos.size * 8);
      grd.addColorStop(0, `rgba(${col[0]|0},${col[1]|0},${col[2]|0},0.6)`);
      grd.addColorStop(1, `rgba(${col[0]|0},${col[1]|0},${col[2]|0},0)`);
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(head.x, head.y, pos.size * 8, 0, PI2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


// ================================================
// 3. PER-SECTION SCENE CANVASES
//    Each section gets its own atmospheric canvas
//    Forest / Waterfall / Ocean / Mountain / Beach / City / Sunrise
// ================================================
const SCENE_CONFIGS = [
  {
    // 0 — Neon Forest
    id: 'hero',
    draw(ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      // Dark forest ground gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   'rgba(0,20,0,0.92)');
      bg.addColorStop(0.6, 'rgba(0,40,10,0.7)');
      bg.addColorStop(1,   'rgba(0,80,20,0.4)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Tree silhouettes
      const treeCount = 12;
      for (let i = 0; i < treeCount; i++) {
        const tx = (i / treeCount) * W * 1.1 - 0.05 * W;
        const th = H * (0.4 + 0.3 * Math.sin(i * 2.3));
        const tw = 60 + i * 15;
        const sway = Math.sin(t * 0.0005 + i * 1.3) * 5;
        ctx.save();
        ctx.translate(tx + sway, H);
        // Trunk
        const trunkGrd = ctx.createLinearGradient(0, 0, 0, -th);
        trunkGrd.addColorStop(0, 'rgba(0,80,20,0.8)');
        trunkGrd.addColorStop(1, 'rgba(57,255,20,0.15)');
        // Tree triangle
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-tw / 2, -th * 0.5);
        ctx.lineTo(-tw / 3, -th * 0.5);
        ctx.lineTo(-tw * 0.4, -th * 0.75);
        ctx.lineTo(-tw * 0.2, -th * 0.75);
        ctx.lineTo(0, -th);
        ctx.lineTo(tw * 0.2, -th * 0.75);
        ctx.lineTo(tw * 0.4, -th * 0.75);
        ctx.lineTo(tw / 3, -th * 0.5);
        ctx.lineTo(tw / 2, -th * 0.5);
        ctx.closePath();
        ctx.fillStyle = trunkGrd;
        ctx.fill();

        // Neon edge glow on tree
        ctx.strokeStyle = `rgba(57,255,20,${0.06 + 0.04 * Math.sin(t * 0.001 + i)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Ground mist
      const mistGrd = ctx.createLinearGradient(0, H * 0.7, 0, H);
      mistGrd.addColorStop(0, 'rgba(0,255,100,0)');
      mistGrd.addColorStop(1, 'rgba(0,255,100,0.08)');
      ctx.fillStyle = mistGrd;
      ctx.fillRect(0, H * 0.7, W, H * 0.3);

      // Neon firefly dots
      for (let i = 0; i < 30; i++) {
        const fx = (Math.sin(t * 0.0003 + i * 2.1) * 0.5 + 0.5) * W;
        const fy = H * 0.3 + (Math.cos(t * 0.0002 + i * 1.7) * 0.5 + 0.5) * H * 0.5;
        const fa = 0.3 + 0.3 * Math.sin(t * 0.001 * (i % 3 + 1) + i);
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, PI2);
        ctx.fillStyle = `rgba(57,255,20,${fa.toFixed(2)})`;
        ctx.fill();
        // Glow
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
        fg.addColorStop(0, `rgba(57,255,20,${(fa * 0.4).toFixed(2)})`);
        fg.addColorStop(1, 'rgba(57,255,20,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(fx, fy, 12, 0, PI2);
        ctx.fill();
      }
    }
  },
  {
    // 1 — Waterfall
    id: 'profile',
    draw(ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgba(0,30,60,0.9)');
      bg.addColorStop(1, 'rgba(0,80,100,0.6)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Waterfall streams — vertical
      const streams = 8;
      for (let s = 0; s < streams; s++) {
        const sx     = W * 0.4 + (s / streams) * W * 0.6;
        const speed  = 0.001 + s * 0.0003;
        const offset = (t * speed + s * 0.5) % 1.0;
        const alpha  = 0.12 + 0.08 * Math.sin(t * 0.0008 + s);
        const width  = 8 + s * 6;

        const grd = ctx.createLinearGradient(sx, 0, sx + width, 0);
        grd.addColorStop(0,   'rgba(0,200,255,0)');
        grd.addColorStop(0.3, `rgba(0,220,255,${alpha})`);
        grd.addColorStop(0.7, `rgba(100,240,255,${alpha * 0.7})`);
        grd.addColorStop(1,   'rgba(0,200,255,0)');
        ctx.fillStyle = grd;

        // Segmented stream with gaps
        for (let seg = 0; seg < 5; seg++) {
          const segY = ((offset + seg * 0.2) % 1.0) * H;
          const segH = H * (0.08 + 0.04 * Math.sin(t * 0.001 + seg + s));
          ctx.fillRect(sx, segY - segH, width, segH);
        }
      }

      // Mist at bottom
      const mist = ctx.createLinearGradient(0, H * 0.75, 0, H);
      mist.addColorStop(0, 'rgba(150,240,255,0)');
      mist.addColorStop(1, 'rgba(150,240,255,0.12)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, H * 0.75, W, H * 0.25);

      // Splash droplets
      for (let i = 0; i < 20; i++) {
        const dx = W * 0.35 + Math.sin(t * 0.0004 + i * 1.9) * W * 0.3;
        const dy = H * 0.8 + Math.cos(t * 0.0006 + i * 2.3) * H * 0.15;
        const da = 0.2 + 0.15 * Math.sin(t * 0.0015 + i);
        ctx.beginPath();
        ctx.arc(dx, dy, 2, 0, PI2);
        ctx.fillStyle = `rgba(0,220,255,${da.toFixed(2)})`;
        ctx.fill();
      }
    }
  },
  {
    // 2 — Ocean Coral Reef
    id: 'skills',
    draw(ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgba(0,10,60,0.92)');
      bg.addColorStop(0.6, 'rgba(0,40,100,0.75)');
      bg.addColorStop(1, 'rgba(0,80,60,0.6)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Caustic light pattern — ocean light on seafloor
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 12; i++) {
        const cx   = W * (0.1 + i * 0.08) + Math.sin(t * 0.0004 + i * 1.2) * 30;
        const cy   = H * (0.1 + (i % 4) * 0.2) + Math.cos(t * 0.0003 + i * 0.8) * 20;
        const size = 40 + 30 * Math.sin(t * 0.0006 + i);
        const a    = 0.04 + 0.03 * Math.sin(t * 0.0008 + i);
        const grd  = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        grd.addColorStop(0, `rgba(0,200,255,${a})`);
        grd.addColorStop(1, 'rgba(0,150,200,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, PI2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Coral shapes at bottom
      const coralColors = ['255,80,80', '255,140,0', '200,80,200', '80,255,150'];
      for (let c = 0; c < 10; c++) {
        const cx   = (c / 10) * W * 1.1;
        const ch   = H * (0.08 + 0.06 * Math.sin(c * 2.1));
        const sway = Math.sin(t * 0.0004 + c * 1.5) * 4;
        const col  = coralColors[c % coralColors.length];
        ctx.save();
        ctx.translate(cx + sway, H);
        ctx.strokeStyle = `rgba(${col},${0.35 + 0.15 * Math.sin(t * 0.0005 + c)})`;
        ctx.lineWidth = 2 + c % 3;
        ctx.lineCap = 'round';
        // Branch
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let seg = 0; seg < 5; seg++) {
          ctx.lineTo(Math.sin(seg * 0.8 + c) * ch * 0.3, -ch * (seg + 1) / 5);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Bubbles
      for (let i = 0; i < 25; i++) {
        const bx = (Math.sin(t * 0.0002 * (i + 1) + i * 3) * 0.5 + 0.5) * W;
        const by = H - ((t * 0.05 * (0.5 + i * 0.03) + i * H * 0.1) % (H * 1.2));
        const br = 2 + (i % 4);
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, PI2);
        ctx.strokeStyle = `rgba(150,240,255,0.25)`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    }
  },
  {
    // 3 — Mountain Sunset
    id: 'experience',
    draw(ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);

      // Sky gradient — purple to orange sunset
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0,   'rgba(20,0,50,0.95)');
      sky.addColorStop(0.4, 'rgba(80,0,100,0.8)');
      sky.addColorStop(0.7, 'rgba(180,60,0,0.6)');
      sky.addColorStop(1,   'rgba(0,0,20,0.95)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Sun glow
      const sunY  = H * 0.55;
      const sunX  = W * 0.75;
      const sunGrd = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 200);
      sunGrd.addColorStop(0, 'rgba(255,180,50,0.35)');
      sunGrd.addColorStop(0.3, 'rgba(255,100,0,0.15)');
      sunGrd.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = sunGrd;
      ctx.fillRect(0, 0, W, H);

      // Mountain silhouettes
      const ranges = [
        { peaks: 5, heightMult: 0.55, col: 'rgba(30,0,60,0.95)',  yBase: 1.0 },
        { peaks: 7, heightMult: 0.40, col: 'rgba(60,10,80,0.85)', yBase: 1.0 },
        { peaks: 9, heightMult: 0.28, col: 'rgba(120,30,30,0.6)', yBase: 1.0 },
      ];
      ranges.forEach(range => {
        ctx.beginPath();
        ctx.moveTo(0, H * range.yBase);
        const step = W / range.peaks;
        for (let i = 0; i <= range.peaks; i++) {
          const px  = i * step;
          const ph  = H * range.heightMult * (0.7 + 0.3 * Math.sin(i * 2.5 + range.peaks));
          const mid = (i - 0.5) * step;
          ctx.lineTo(mid, H - ph);
          ctx.lineTo(px, H * range.yBase);
        }
        ctx.closePath();
        ctx.fillStyle = range.col;
        ctx.fill();
      });

      // Stars
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5) % W);
        const sy = ((i * 73.1) % H * 0.5);
        const sa = 0.3 + 0.3 * Math.sin(t * 0.001 * ((i % 3) + 1) + i);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, PI2);
        ctx.fillStyle = `rgba(255,255,200,${sa.toFixed(2)})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Neon mountain-top glow lines
      ctx.strokeStyle = 'rgba(255,80,200,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const step = W / 9;
      for (let i = 0; i <= 9; i++) {
        const px = i * step;
        const ph = H * 0.28 * (0.7 + 0.3 * Math.sin(i * 2.5 + 9));
        i === 0 ? ctx.moveTo(0, H - ph) : ctx.lineTo(px, H - ph);
      }
      ctx.stroke();
    }
  },
  {
    // 4 — Beach / Waves
    id: 'certifications',
    draw(ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgba(10,30,80,0.9)');
      bg.addColorStop(0.5, 'rgba(0,60,80,0.7)');
      bg.addColorStop(1, 'rgba(200,160,80,0.5)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Ocean waves
      const waves = 5;
      for (let w = 0; w < waves; w++) {
        const yBase  = H * (0.45 + w * 0.1);
        const speed  = 0.0006 - w * 0.0001;
        const amp    = 15 + w * 8;
        const freq   = 0.008 - w * 0.001;
        const alpha  = 0.08 + w * 0.03;

        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const y = yBase + Math.sin(x * freq + t * speed) * amp
                          + Math.sin(x * freq * 2.3 + t * speed * 1.7) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();

        const wGrd = ctx.createLinearGradient(0, yBase - amp, 0, H);
        wGrd.addColorStop(0, `rgba(0,180,255,${alpha})`);
        wGrd.addColorStop(1, `rgba(0,100,150,${alpha * 0.4})`);
        ctx.fillStyle = wGrd;
        ctx.fill();

        // Wave crest highlight
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = yBase + Math.sin(x * freq + t * speed) * amp
                          + Math.sin(x * freq * 2.3 + t * speed * 1.7) * amp * 0.4;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(150,240,255,${alpha * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Sandy beach
      const sand = ctx.createLinearGradient(0, H * 0.85, 0, H);
      sand.addColorStop(0, 'rgba(220,180,100,0)');
      sand.addColorStop(1, 'rgba(220,180,100,0.4)');
      ctx.fillStyle = sand;
      ctx.fillRect(0, H * 0.85, W, H * 0.15);

      // Sun reflection on water
      ctx.globalCompositeOperation = 'screen';
      const refGrd = ctx.createLinearGradient(W * 0.6, H * 0.4, W * 0.6, H * 0.85);
      refGrd.addColorStop(0, 'rgba(255,200,50,0.15)');
      refGrd.addColorStop(1, 'rgba(255,200,50,0)');
      ctx.fillStyle = refGrd;
      ctx.fillRect(W * 0.4, H * 0.4, W * 0.4, H * 0.45);
      ctx.globalCompositeOperation = 'source-over';
    }
  },
  {
    // 5 — Cityscape Night
    id: 'education',
    draw(ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgba(0,0,20,0.97)');
      bg.addColorStop(0.6, 'rgba(10,10,50,0.85)');
      bg.addColorStop(1, 'rgba(20,20,80,0.6)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Building silhouettes
      const buildings = 18;
      for (let b = 0; b < buildings; b++) {
        const bx = (b / buildings) * W;
        const bw = W / buildings * (0.6 + 0.4 * Math.sin(b * 3.1));
        const bh = H * (0.2 + 0.35 * Math.sin(b * 1.7 + 1));
        const by = H - bh;

        // Building body
        ctx.fillStyle = `rgba(5,5,${20 + b * 3},0.9)`;
        ctx.fillRect(bx, by, bw, bh);

        // Neon roof outline
        const roofCol = b % 3 === 0 ? '0,180,255' : b % 3 === 1 ? '255,60,120' : '255,200,0';
        ctx.strokeStyle = `rgba(${roofCol},0.4)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        // Windows
        const winCols = 3;
        const winRows = Math.floor(bh / 18);
        for (let wr = 0; wr < winRows; wr++) {
          for (let wc = 0; wc < winCols; wc++) {
            // Flicker effect
            const on = Math.sin(t * 0.0004 + b * 5.3 + wr * 7.1 + wc * 3.3) > 0;
            if (!on) continue;
            const wx = bx + (wc + 0.5) * (bw / (winCols + 1)) - 2;
            const wy = by + (wr + 0.5) * (bh / (winRows + 1)) - 2;
            ctx.fillStyle = `rgba(255,220,100,0.4)`;
            ctx.fillRect(wx, wy, 4, 5);
          }
        }
      }

      // Ground reflection
      const refl = ctx.createLinearGradient(0, H * 0.85, 0, H);
      refl.addColorStop(0, 'rgba(0,100,200,0.1)');
      refl.addColorStop(1, 'rgba(0,50,100,0.3)');
      ctx.fillStyle = refl;
      ctx.fillRect(0, H * 0.85, W, H * 0.15);

      // Street lights / neon signs glow
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 8; i++) {
        const lx  = (i / 8) * W + rand(-20, 20);
        const ly  = H * 0.55 + rand(-50, 50);
        const col = i % 2 === 0 ? '0,180,255' : '255,60,120';
        const a   = 0.06 + 0.04 * Math.sin(t * 0.001 + i);
        const grd = ctx.createRadialGradient(lx, ly, 0, lx, ly, 80);
        grd.addColorStop(0, `rgba(${col},${a})`);
        grd.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(lx - 80, ly - 80, 160, 160);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  },
  {
    // 6 — Sunrise
    id: 'contact',
    draw(ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      const sunrise = t * 0.00003;
      const sunY    = H * (0.6 - 0.1 * Math.sin(sunrise));
      const sunX    = W * 0.5;

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, 'rgba(10,5,30,0.95)');
      sky.addColorStop(0.35, 'rgba(80,20,80,0.85)');
      sky.addColorStop(0.55, 'rgba(200,80,0,0.75)');
      sky.addColorStop(0.75, 'rgba(255,160,50,0.6)');
      sky.addColorStop(1, 'rgba(255,100,20,0.5)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Sun disc
      const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 120);
      sun.addColorStop(0,    'rgba(255,220,100,0.9)');
      sun.addColorStop(0.15, 'rgba(255,160,50,0.6)');
      sun.addColorStop(0.5,  'rgba(255,80,0,0.2)');
      sun.addColorStop(1,    'rgba(255,50,0,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, H);

      // Lens flare spokes
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * PI2 + t * 0.0001;
        const len   = 200 + 100 * Math.sin(t * 0.0003 + i);
        const a     = 0.08 + 0.04 * Math.sin(t * 0.0005 + i * 2);
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(angle) * len, sunY + Math.sin(angle) * len);
        ctx.strokeStyle = `rgba(255,200,100,${a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Horizon water reflection
      for (let x = 0; x <= W; x += 4) {
        const wy = H * 0.65 + Math.sin(x * 0.02 + t * 0.0005) * 8;
        const a  = 0.3 + 0.15 * Math.abs(Math.sin(x * 0.01));
        ctx.fillStyle = `rgba(255,150,50,${a * 0.1})`;
        ctx.fillRect(x, wy, 4, H - wy);
      }

      // Birds V-formation silhouette (tiny)
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const birdBaseX = W * 0.5 + Math.sin(t * 0.0002) * 100;
      const birdBaseY = H * 0.3 + Math.sin(t * 0.0003) * 20;
      for (let i = 0; i < 5; i++) {
        const bx = birdBaseX + (i - 2) * 30;
        const by = birdBaseY + Math.abs(i - 2) * 10;
        ctx.beginPath();
        ctx.arc(bx,     by,     2, Math.PI, PI2);
        ctx.arc(bx + 8, by + 2, 2, Math.PI, PI2);
        ctx.fill();
      }
    }
  }
];

// Inject scene canvas elements and start their animation loops
SCENE_CONFIGS.forEach(cfg => {
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
  const obs = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.01 });
  obs.observe(section);

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


// ================================================
// 5. SCROLL REVEAL
// ================================================
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i % 5) * 0.1 + 's';
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


// ================================================
// 6. STAT COUNTER ANIMATION
// ================================================
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target.querySelector('.stat-num[data-target]');
    if (!el) return;
    const target = parseInt(el.dataset.target);
    const dur    = 1600;
    let start    = null;
    const step   = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
    statObs.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card').forEach(c => statObs.observe(c));


// ================================================
// 7. ACTIVE NAV ON SCROLL
// ================================================
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
const secObs    = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => {
        l.style.color = '';
        if (l.getAttribute('href') === '#' + e.target.id) l.style.color = 'var(--teal-neon)';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => secObs.observe(s));


// ================================================
// 8. AI PORTFOLIO CHATBOT
// ================================================
const KNOWLEDGE = {
  greetings:      ['hi','hello','hey','good morning','good afternoon'],
  name:           ['name','who are you','who is','gajapathy','dasarathan'],
  role:           ['role','job','current','work','position','working','empower'],
  experience:     ['experience','years','career','work history','state street','intern','chartered'],
  skills:         ['skill','skills','know','expertise','competency','tools','technology'],
  ai:             ['ai','artificial intelligence','gpt','chatgpt','automation','custom gpt','automate'],
  gaap:           ['gaap','ifrs','accounting standard','us gaap'],
  platforms:      ['platform','evestment','wilshire','callan','broadridge','confluence','informa','nasdaq'],
  certifications: ['certification','certificate','course','linkedin','anthropic','derivatives','excel chatgpt','credential'],
  education:      ['education','study','college','degree','bcom','cma','vaishnav','cost accountant'],
  languages:      ['language','speak','english','tamil','telugu','typewriting'],
  contact:        ['contact','email','reach','location','address','connect','linkedin'],
  achievement:    ['achievement','award','recognition','appreciate','director','md','managing'],
};

const RESPONSES = {
  greetings:      "Hello! I'm the portfolio assistant for Gajapathy Dasarathan. Ask me about his experience, skills, certifications, or how to reach him! 👋",
  name:           "I represent **Gajapathy Dasarathan** — an Investment Reporting and Financial Reporting professional with 4+ years of experience, based in Chennai, India.",
  role:           "Gajapathy is currently an **Investment Reporting Analyst at Empower** (Bengaluru, since May 2025). He prepares and reviews Mutual Fund financial statements under US GAAP, automates processes using Custom GPT tools, and works with platforms like Nasdaq eVestment, Broadridge, and Confluence.",
  experience:     "Gajapathy has 4+ years across 3 employers:\n\n• **Empower** — Investment Reporting Analyst (May 2025–Present), Bengaluru\n• **State Street** — Associate 2 (Oct 2022–Apr 2025), Chennai\n• **Rajesh & Ganesh CA** — Intern (Aug 2021–Feb 2022), Chennai",
  skills:         "Core skills include:\n\n• **Reporting:** PE, Hedge Funds, Mutual Funds, CLO, REITs\n• **Standards:** US GAAP & IFRS\n• **AI:** Custom GPT Development, Process Automation, ChatGPT\n• **Tools:** Excel, SQL, MS Access, Power BI, SAP\n• **Platforms:** eVestment, Wilshire, Callan, Broadridge, Confluence",
  ai:             "Gajapathy built a **Custom GPT in ChatGPT** at Empower to automate fund fact review — improving accuracy, speed, and earning appreciation from senior leadership and the Director. He also holds a LinkedIn cert in 'Excel and ChatGPT: Data Analysis Power Tips'.",
  gaap:           "Experienced in both **US GAAP** (Mutual Funds at Empower) and **IFRS** (PE, CLO, REITs, Hedge Funds at State Street). Produced balance sheets, income statements, capital statements, footnotes, and cash flow statements.",
  platforms:      "Hands-on with: **Nasdaq eVestment**, Wilshire, Callan, Informa, Broadridge, and Confluence (IMGD).",
  certifications: "Three certifications:\n\n• **AI Fluency for Students** — Anthropic (Mar 2026, ID: f95vi7jgs7p4)\n• **Derivatives Fundamentals** — LinkedIn Learning (Jun 2025)\n• **Excel and ChatGPT: Data Analysis Power Tips** — LinkedIn Learning (Aug 2025)",
  education:      "Education:\n\n• **CMA Intermediate** — ICAI (2020, 64%)\n• **B.Com** — DG Vaishnav College (2021, 86%)",
  languages:      "Languages: **English** (Fluent · Advanced), **Tamil** (Native), **Telugu** (Beginner), **Typewriting** (Intermediate).",
  contact:        "Reach Gajapathy at:\n\n✉️ gajapathy165@gmail.com\n📍 Chennai, Tamil Nadu, India\n🔗 linkedin.com/in/trulygaja",
  achievement:    "Recognition received from:\n• **Director & Senior Leadership at Empower** — for Custom GPT and AI integration\n• **Managing Director at State Street** — for quality and process improvements",
  fallback:       "Great question! For the most detailed answer, reach out directly at **gajapathy165@gmail.com** or via LinkedIn. Anything else about skills, experience, or certifications I can help with?",
};

function classifyQuery(text) {
  const lower = text.toLowerCase();
  for (const [key, patterns] of Object.entries(KNOWLEDGE)) {
    if (patterns.some(p => lower.includes(p))) return key;
  }
  return 'fallback';
}

function formatMsg(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');

function appendMsg(text, type) {
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  const p = document.createElement('p');
  p.innerHTML = formatMsg(text);
  div.appendChild(p);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChat() {
  const val = (chatInput.value || '').trim();
  if (!val) return;
  appendMsg(val, 'user');
  chatInput.value = '';
  const sugg = document.getElementById('chatSugg');
  if (sugg) sugg.style.display = 'none';
  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'msg typing';
  typing.id = 'typingDot';
  typing.innerHTML = '<p>Thinking…</p>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  setTimeout(() => {
    const t = document.getElementById('typingDot');
    if (t) t.remove();
    appendMsg(RESPONSES[classifyQuery(val)] || RESPONSES.fallback, 'bot');
  }, 600 + Math.random() * 500);
}

function askSugg(btn) {
  if (chatInput) chatInput.value = btn.textContent;
  sendChat();
}

if (chatInput) {
  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
}
