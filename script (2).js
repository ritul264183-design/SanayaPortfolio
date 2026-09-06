const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   Loader
   ========================================================================== */

const loader = document.getElementById('loader');
const loaderLines = document.getElementById('loaderLines');

const bootLines = [
  '> SANAYA.SINGH',
  '> Initializing portfolio...',
  '> Loading projects...',
  '> Loading skills...',
  '> Ready.'
];

function runLoader() {
  if (!loader || !loaderLines) return;

  if (prefersReducedMotion) {
    loader.classList.add('hidden');
    return;
  }

  let text = '';
  let lineIndex = 0;

  function typeLine() {
    if (lineIndex >= bootLines.length) {
      setTimeout(() => loader.classList.add('hidden'), 250);
      return;
    }
    const line = bootLines[lineIndex];
    let charIndex = 0;

    function typeChar() {
      if (charIndex <= line.length) {
        text = bootLines.slice(0, lineIndex).join('\n') + (lineIndex > 0 ? '\n' : '') + line.slice(0, charIndex);
        loaderLines.textContent = text;
        charIndex++;
        setTimeout(typeChar, 12);
      } else {
        lineIndex++;
        setTimeout(typeLine, 90);
      }
    }
    typeChar();
  }

  typeLine();

  // Hard cap so nobody waits more than ~1.6s regardless of typing speed
  setTimeout(() => loader.classList.add('hidden'), 1600);
}

runLoader();

/* ==========================================================================
   Theme toggle
   ========================================================================== */

const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  localStorage.setItem('theme', theme);
}

applyTheme(localStorage.getItem('theme') || 'dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

/* ==========================================================================
   Header scroll state + mobile nav
   ========================================================================== */

const siteHeader = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   Active nav link + sliding indicator
   ========================================================================== */

const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
const navIndicator = document.getElementById('navIndicator');
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function moveIndicator(link) {
  if (!navIndicator || !link || window.innerWidth <= 760) return;
  navIndicator.style.left = `${link.offsetLeft}px`;
  navIndicator.style.width = `${link.offsetWidth}px`;
  navIndicator.style.opacity = '1';
}

function setActiveLink(id) {
  navLinks.forEach(link => {
    const match = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', match);
    if (match) moveIndicator(link);
  });
}

if ('IntersectionObserver' in window && sections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => navObserver.observe(section));
}

/* ==========================================================================
   Scroll reveal
   ========================================================================== */

const revealTargets = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in-view'));
}

/* ==========================================================================
   Hero code window typewriter
   ========================================================================== */

const typedCode = document.getElementById('typedCode');
const codeCaret = document.getElementById('codeCaret');

const codeSnippet = `const developer = {
  name: "Sanaya Singh",
  role: "Web Developer"
};`;

function typeCode() {
  if (!typedCode) return;

  if (prefersReducedMotion) {
    typedCode.textContent = codeSnippet;
    return;
  }

  let i = 0;
  function step() {
    typedCode.textContent = codeSnippet.slice(0, i);
    i++;
    if (i <= codeSnippet.length) {
      setTimeout(step, 28);
    } else if (codeCaret) {
      codeCaret.style.animation = 'blink 1s step-end infinite';
    }
  }
  step();
}

setTimeout(typeCode, prefersReducedMotion ? 0 : 900);

/* ==========================================================================
   Journey timeline fill (scroll progress)
   ========================================================================== */

const timelineWrap = document.getElementById('journeyTimeline');
const timelineFill = document.getElementById('timelineFill');

function updateTimelineFill() {
  if (!timelineWrap || !timelineFill) return;
  const rect = timelineWrap.getBoundingClientRect();
  const viewportH = window.innerHeight;

  const total = rect.height;
  const visible = Math.min(Math.max(viewportH * 0.75 - rect.top, 0), total);
  const percent = total > 0 ? (visible / total) * 100 : 0;

  timelineFill.style.height = `${percent}%`;
}

window.addEventListener('scroll', updateTimelineFill, { passive: true });
window.addEventListener('resize', updateTimelineFill);
updateTimelineFill();

/* ==========================================================================
   Education rings — count up + stroke animation
   ========================================================================== */

const eduCards = document.querySelectorAll('.edu-card');

function animateRing(card) {
  const circle = card.querySelector('.edu-ring-progress');
  const valueEl = card.querySelector('.edu-ring-value');
  if (!circle || !valueEl) return;

  const target = parseFloat(circle.getAttribute('data-target'));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${circumference}`;

  requestAnimationFrame(() => {
    circle.style.strokeDashoffset = `${circumference - (target / 100) * circumference}`;
  });

  if (prefersReducedMotion) {
    valueEl.textContent = `${target}%`;
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const current = (progress * target).toFixed(target % 1 !== 0 ? 1 : 0);
    valueEl.textContent = `${current}%`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window && eduCards.length) {
  const eduObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.querySelector('.edu-ring-progress')) {
        animateRing(entry.target);
        eduObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  eduCards.forEach(card => eduObserver.observe(card));
}

/* ==========================================================================
   Skills tabs
   ========================================================================== */

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    tabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', String(t === tab));
    });

    panels.forEach(panel => {
      panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
    });
  });
});

/* ==========================================================================
   Project modal
   ========================================================================== */

document.querySelectorAll('[data-modal-target]').forEach(trigger => {
  const modal = document.getElementById(trigger.getAttribute('data-modal-target'));
  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    trigger.focus();
  }

  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
});

/* ==========================================================================
   Career statement reveal (word-by-word, driven by scroll reveal class)
   ========================================================================== */

const careerStatement = document.getElementById('careerStatement');

if (careerStatement && 'IntersectionObserver' in window) {
  const careerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        careerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  careerObserver.observe(careerStatement);
}

/* ==========================================================================
   Custom cursor (pointer devices only)
   ========================================================================== */

const cursorDot = document.getElementById('cursorDot');
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (cursorDot && isFinePointer && !prefersReducedMotion) {
  document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    cursorDot.classList.add('active');
  });

  document.addEventListener('mouseleave', () => cursorDot.classList.remove('active'));

  document.querySelectorAll('a, button, .project-card, .tab').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('grow'));
  });
} else if (cursorDot) {
  cursorDot.style.display = 'none';
}

/* ==========================================================================
   Footer year
   ========================================================================== */

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
