/* ============================================
   Chegada d'Ideias — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // --- Mobile menu ---
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  const updateActiveNav = () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navItems.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', updateActiveNav);

  // --- Service tabs ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  // --- Network constellation animation ---
  const canvas = document.getElementById('networkCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let W, H;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = {
      red: '#C4192A',
      blue: '#1A5CAB',
      green: '#2E8B57'
    };

    const clusters = [
      { label: 'Empresarial', color: colors.red,   cx: 0.22, cy: 0.28 },
      { label: 'Urbana',      color: colors.blue,  cx: 0.72, cy: 0.22 },
      { label: 'Social',      color: colors.green,  cx: 0.48, cy: 0.75 }
    ];

    // Central hub
    const hub = { x: 0.47, y: 0.45, r: 6 };

    // Generate nodes for each cluster
    const nodes = [];
    const clusterRadius = 0.16;

    clusters.forEach((cl, ci) => {
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const dist = clusterRadius * (0.3 + Math.random() * 0.7);
        nodes.push({
          baseX: cl.cx + Math.cos(angle) * dist,
          baseY: cl.cy + Math.sin(angle) * dist,
          x: 0, y: 0,
          r: 2.5 + Math.random() * 2.5,
          color: cl.color,
          cluster: ci,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.4,
          amplitude: 3 + Math.random() * 5
        });
      }
    });

    // Hub node
    nodes.push({
      baseX: hub.x, baseY: hub.y, x: 0, y: 0,
      r: hub.r, color: colors.red, cluster: -1,
      phase: 0, speed: 0.2, amplitude: 2
    });
    const hubIndex = nodes.length - 1;

    // Find connections: within cluster + to hub
    const connections = [];
    nodes.forEach((n, i) => {
      if (i === hubIndex) return;
      // Connect to hub
      connections.push({ from: i, to: hubIndex, opacity: 0.08 });
      // Connect to nearby nodes in same cluster
      nodes.forEach((m, j) => {
        if (j <= i || j === hubIndex) return;
        if (n.cluster === m.cluster) {
          const dx = n.baseX - m.baseX;
          const dy = n.baseY - m.baseY;
          if (Math.sqrt(dx * dx + dy * dy) < clusterRadius * 1.2) {
            connections.push({ from: i, to: j, opacity: 0.12 });
          }
        }
      });
    });

    // Cross-cluster connections (a few)
    clusters.forEach((_, ci) => {
      clusters.forEach((_, cj) => {
        if (cj <= ci) return;
        const fromNodes = nodes.filter(n => n.cluster === ci);
        const toNodes = nodes.filter(n => n.cluster === cj);
        if (fromNodes.length && toNodes.length) {
          const fi = nodes.indexOf(fromNodes[0]);
          const ti = nodes.indexOf(toNodes[0]);
          connections.push({ from: fi, to: ti, opacity: 0.06, dashed: true });
        }
      });
    });

    // Animated data particles travelling along connections
    const particles = [];
    function spawnParticle() {
      const conn = connections[Math.floor(Math.random() * connections.length)];
      particles.push({
        conn,
        t: 0,
        speed: 0.003 + Math.random() * 0.004,
        color: nodes[conn.from].color,
        r: 1.5 + Math.random()
      });
    }
    // Initial batch
    for (let i = 0; i < 8; i++) spawnParticle();

    let time = 0;

    function draw() {
      time += 0.016;
      ctx.clearRect(0, 0, W, H);

      // Update node positions
      nodes.forEach(n => {
        n.x = n.baseX * W + Math.sin(time * n.speed + n.phase) * n.amplitude;
        n.y = n.baseY * H + Math.cos(time * n.speed * 0.7 + n.phase) * n.amplitude;
      });

      // Draw connections
      connections.forEach(c => {
        const a = nodes[c.from];
        const b = nodes[c.to];
        ctx.beginPath();
        if (c.dashed) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.moveTo(a.x, a.y);
        // Slight curve
        const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.1;
        const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.1;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = a.color;
        ctx.globalAlpha = c.opacity;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Draw cluster glow backgrounds
      clusters.forEach(cl => {
        const grd = ctx.createRadialGradient(
          cl.cx * W, cl.cy * H, 0,
          cl.cx * W, cl.cy * H, clusterRadius * W * 0.9
        );
        grd.addColorStop(0, cl.color + '0A');
        grd.addColorStop(1, cl.color + '00');
        ctx.beginPath();
        ctx.arc(cl.cx * W, cl.cy * H, clusterRadius * W * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((n, i) => {
        // Pulse glow
        const pulse = Math.sin(time * 1.5 + n.phase) * 0.3 + 0.7;

        // Outer glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '10';
        ctx.fill();

        // Main dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = i === hubIndex ? 1 : 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Hub extra ring
      const hubN = nodes[hubIndex];
      const ringPulse = Math.sin(time * 0.8) * 4 + 16;
      ctx.beginPath();
      ctx.arc(hubN.x, hubN.y, ringPulse, 0, Math.PI * 2);
      ctx.strokeStyle = colors.red + '20';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed;
        if (p.t > 1) {
          particles.splice(i, 1);
          spawnParticle();
          continue;
        }
        const a = nodes[p.conn.from];
        const b = nodes[p.conn.to];
        const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.1;
        const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.1;
        const t = p.t;
        const it = 1 - t;
        const px = it * it * a.x + 2 * it * t * mx + t * t * b.x;
        const py = it * it * a.y + 2 * it * t * my + t * t * b.y;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw cluster labels
      clusters.forEach(cl => {
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = cl.color;
        ctx.globalAlpha = 0.85;
        const labelY = cl.cy < 0.5 ? cl.cy * H - clusterRadius * H * 0.7 : cl.cy * H + clusterRadius * H * 0.85;
        ctx.fillText(cl.label, cl.cx * W, labelY);
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  // --- Scroll reveal ---
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => revealObserver.observe(el));

});
