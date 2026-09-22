/* ═══════════════════════════════════════════════════
   BOAZ 360 — script.js
   Navbar scroll, mobile menu, counters, form, animations
   ═══════════════════════════════════════════════════ */

'use strict';

// ── DOM ELEMENTS ──────────────────────────────────────────
const navbar      = document.getElementById('navbar');
const navHamburger = document.getElementById('navHamburger');
const navLinks    = document.getElementById('navLinks');
const backToTop   = document.getElementById('backToTop');
const contatoForm = document.getElementById('contatoForm');
const formFeedback = document.getElementById('formFeedback');
const statNumbers = document.querySelectorAll('.stat-number');

// ── NAVBAR SCROLL ─────────────────────────────────────────
function handleScroll() {
  const scrolled = window.scrollY > 60;
  navbar.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('visible', scrolled);
}

window.addEventListener('scroll', handleScroll, { passive: true });

// ── MOBILE MENU ───────────────────────────────────────────
navHamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navHamburger.classList.toggle('active', isOpen);
  navHamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navHamburger.classList.remove('active');
  });
});

// ── SMOOTH SCROLL FOR ALL ANCHOR LINKS ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});

// ── BACK TO TOP ───────────────────────────────────────────
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── ANIMATED COUNTERS ─────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const steps = 60;
  const stepTime = duration / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += target / steps;
    if (current >= target) {
      el.textContent = target.toLocaleString('pt-BR');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current).toLocaleString('pt-BR');
    }
  }, stepTime);
}

// Use IntersectionObserver for counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

// ── INTERSECTION OBSERVER — FADE IN CARDS ────────────────
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.sobre-card, .servico-card, .sistema-card, .info-card, .diferencial-item').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s, border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease`;
  fadeObserver.observe(el);
});

// ── ACTIVE NAV LINK ON SCROLL ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        const isActive = a.getAttribute('href') === `#${id}`;
        a.style.color = isActive ? 'var(--teal)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── CONTACT FORM ──────────────────────────────────────────
if (contatoForm) {
  contatoForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    // Basic validation
    if (!nome || !email || !mensagem) {
      showFeedback('Por favor, preencha os campos obrigatórios: Nome, E-mail e Mensagem.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback('Por favor, informe um e-mail válido.', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    try {
      // Build WhatsApp fallback message
      const assunto = document.getElementById('assunto').value || 'Contato via site';
      const telefone = document.getElementById('telefone').value.trim();
      const empresa = document.getElementById('empresa_c').value.trim();

      const waMsg = encodeURIComponent(
        `*Mensagem via boaz360.com*\n\n` +
        `*Nome:* ${nome}\n` +
        `*E-mail:* ${email}\n` +
        `${telefone ? `*Telefone:* ${telefone}\n` : ''}` +
        `${empresa ? `*Empresa:* ${empresa}\n` : ''}` +
        `*Assunto:* ${assunto}\n\n` +
        `*Mensagem:*\n${mensagem}`
      );

      // For now (static site) — redirect to WhatsApp with pre-filled message
      // Replace 5500000000000 with the real number when deploying
      const waUrl = `https://wa.me/5521964454332?text=${waMsg}`;

      showFeedback('✅ Mensagem preparada! Você será redirecionado para o WhatsApp para envio.', 'success');

      // Dispara evento de conversão para o Google Ads
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'Contato',
          event_label: assunto
        });
      }

      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        contatoForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Mensagem';
        setTimeout(() => { formFeedback.style.display = 'none'; }, 5000);
      }, 1500);

    } catch (err) {
      showFeedback('Ocorreu um erro. Tente nos contatar diretamente pelo WhatsApp.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Mensagem';
    }
  });
}

function showFeedback(msg, type) {
  formFeedback.textContent = msg;
  formFeedback.className = `form-feedback ${type}`;
  formFeedback.style.display = 'block';
  formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── HERO ORBIT — pause on hover ──────────────────────────
document.querySelectorAll('.orbit-ring').forEach(ring => {
  ring.addEventListener('mouseenter', () => {
    ring.style.animationPlayState = 'paused';
  });
  ring.addEventListener('mouseleave', () => {
    ring.style.animationPlayState = 'running';
  });
});

// ── TRACKING WHATSAPP CLICKS ──────────────────────────────
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'contact', {
        event_category: 'WhatsApp',
        event_label: 'Clique no WhatsApp'
      });
    }
  });
});

// ── INIT ──────────────────────────────────────────────────
handleScroll();

