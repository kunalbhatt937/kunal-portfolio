document.addEventListener('DOMContentLoaded', () => {

  /* ============ 1. UTILITIES ============ */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ 2. LOADING SCREEN ============ */
  const loader = $('#loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loader--hidden');
      document.body.style.overflow = '';
    }, 900);
  });

  /* ============ 2A. AUTO-LOAD PROJECT IMAGE ============ */
  const projectImage = $('#projectImage');
  const projectImageLink = $('#projectImageLink');
  const projectImagePlaceholder = $('#projectImagePlaceholder');

  if (projectImage && projectImageLink && projectImagePlaceholder) {
    const candidates = [
      'assests/Screenshot 2026-07-31 110534.png',
      'assests/Screenshot 2026-07-31 110701.png',
      'assests/Screenshot 2026-07-31 110744.png',
      'uploads/project-photo.jpg',
      'uploads/project-photo.png',
      'uploads/project-photo.svg',
      'uploads/project.jpg',
      'uploads/project.png',
      'uploads/screenshot.jpg',
      'uploads/screenshot.png',
      'uploads/image.jpg',
      'uploads/image.png'
    ];

    const tryLoadImage = (index = 0) => {
      if (index >= candidates.length) {
        projectImagePlaceholder.style.display = 'flex';
        return;
      }

      const src = candidates[index];
      const testImage = new Image();
      testImage.onload = () => {
        projectImage.src = src;
        projectImageLink.href = src;
        projectImagePlaceholder.style.display = 'none';
      };
      testImage.onerror = () => tryLoadImage(index + 1);
      testImage.src = src;
    };

    tryLoadImage();
  }

  /* ============ 3. CUSTOM CURSOR ============ */
  const cursorDot = $('#cursorDot');
  const cursorRing = $('#cursorRing');

  if (!('ontouchstart' in window)) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smoothly trail the ring behind the dot
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactiveSelectors = 'a, button, input, textarea, .filter-btn, .timeline-tab, .skill-chip';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        cursorRing.classList.add('cursor-ring--active');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        cursorRing.classList.remove('cursor-ring--active');
      }
    });
  } else {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }

  /* ============ 4. PARTICLE BACKGROUND (hero only, CSS+JS canvas) ============ */
  const canvas = $('#particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let canvasWidth, canvasHeight;

  function resizeCanvas() {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = Math.min(window.innerHeight, 900);
  }
  resizeCanvas();

  function createParticles() {
    const count = Math.min(60, Math.floor(window.innerWidth / 22));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));
  }
  createParticles();

  function getAccentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#38bdf8';
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const color = getAccentColor();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvasWidth) p.vx *= -1;
      if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;

      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Connect nearby particles with faint lines
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 120) {
          ctx.globalAlpha = (1 - dist / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });

    if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
  }
  drawParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });

  /* ============ 5. NAVBAR ============ */
  const navbar = $('#navbar');
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav__link');

  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll);

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('nav__menu--active');
    navToggle.classList.toggle('nav__toggle--active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('nav__menu--active');
      navToggle.classList.remove('nav__toggle--active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight active nav link on scroll
  const sections = $$('main section[id]');
  function highlightActiveLink() {
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    let currentId = sections[0]?.id;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${currentId}`);
    });
  }
  window.addEventListener('scroll', highlightActiveLink);
  highlightActiveLink();

  /* ============ 6. THEME TOGGLE ============ */
  const themeToggle = $('#themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('portfolio-theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  /* ============ 7. TYPING ANIMATION ============ */
  const typedTextEl = $('#typedText');
  const roles = [
    'Frontend Developer',
    'Python Programmer',
    'Problem Solver'
  ];
  let roleIndex = 0, charIndex = 0, isDeleting = false;

  function typeLoop() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typedTextEl.textContent = currentRole.substring(0, charIndex);

    let delay = isDeleting ? 45 : 90;

    if (!isDeleting && charIndex === currentRole.length) {
      delay = 1400;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    setTimeout(typeLoop, delay);
  }
  typeLoop();

  /* ============ 8. SCROLL REVEAL (Intersection Observer) ============ */
  const revealEls = $$('.reveal');

  // Add stagger index within each parent grid for cascading effect
  const grids = $$('.services__grid, .projects__grid, .certificates__grid, .achievements__grid');
  grids.forEach(grid => {
    $$('.reveal', grid).forEach((el, i) => el.style.setProperty('--stagger', i));
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ 9. SKILL BAR ANIMATION ============ */
  const skillBars = $$('.skill-bar');

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const percent = bar.getAttribute('data-percent');
        const fill = $('.skill-bar__fill', bar);
        const percentLabel = $('.skill-bar__percent', bar);

        fill.style.width = `${percent}%`;

        // Animate the number counting up alongside the bar fill
        let current = 0;
        const target = parseInt(percent, 10);
        const step = Math.max(1, Math.round(target / 40));
        const countUp = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(countUp);
          }
          percentLabel.textContent = `${current}%`;
        }, 25);

        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  skillBars.forEach(bar => skillObserver.observe(bar));

  /* ============ 10. COUNTER ANIMATION ============ */
  const counters = $$('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-count'), 10);
        let current = 0;
        const step = Math.max(1, Math.round(target / 60));

        const update = () => {
          current += step;
          if (current >= target) {
            counter.textContent = target;
            return;
          }
          counter.textContent = current;
          requestAnimationFrame(update);
        };
        update();

        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  /* ============ 11. PROJECT FILTERING ============ */
  const filterBtns = $$('.filter-btn');
  const projectCards = $$('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const matches = filter === 'all' || card.getAttribute('data-category') === filter;

        if (matches) {
          card.hidden = false;
          card.classList.remove('filtering-out');
          card.classList.add('filtering-in');
        } else {
          card.classList.add('filtering-out');
          setTimeout(() => { card.hidden = true; }, 280);
        }
      });
    });
  });

  /* ============ 12. TIMELINE TABS ============ */
  const timelineTabs = $$('.timeline-tab');
  const timelinePanels = $$('.timeline[data-timeline-panel]');

  if (timelineTabs.length && timelinePanels.length) {
    timelineTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        timelineTabs.forEach(t => t.classList.remove('active-filter'));
        tab.classList.add('active-filter');

        const target = tab.getAttribute('data-timeline');
        timelinePanels.forEach(panel => {
          panel.hidden = panel.getAttribute('data-timeline-panel') !== target;
        });
      });
    });
  }

  /* ============ 13. TESTIMONIAL SLIDER ============ */
  const track = $('#testimonialTrack');
  const dotsContainer = $('#testimonialDots');
  let activeSlide = 0;
  let sliderInterval;

  if (track && dotsContainer) {
    const testimonialCards = $$('.testimonial-card', track);

    testimonialCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonial-dot');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active-dot');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
    const dots = $$('.testimonial-dot', dotsContainer);

    function goToSlide(index) {
      activeSlide = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active-dot', i === index));
    }

    function nextSlide() {
      goToSlide((activeSlide + 1) % testimonialCards.length);
    }

    function startSlider() {
      if (prefersReducedMotion) return;
      sliderInterval = setInterval(nextSlide, 5000);
    }
    function stopSlider() {
      clearInterval(sliderInterval);
    }
    startSlider();

    $('.testimonial-slider').addEventListener('mouseenter', stopSlider);
    $('.testimonial-slider').addEventListener('mouseleave', startSlider);
  }

  /* ============ 14. CONTACT FORM VALIDATION ============ */
  const form = $('#contactForm');
  const formSuccess = $('#formSuccess');

  const validators = {
    name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
    subject: (v) => v.trim().length >= 3 || 'Subject must be at least 3 characters.',
    message: (v) => v.trim().length >= 10 || 'Message must be at least 10 characters.'
  };

  function validateField(field) {
    const value = field.value;
    const rule = validators[field.name];
    const errorEl = $(`#${field.name}Error`);
    const group = field.closest('.form-group');

    if (!rule) return true;

    const result = rule(value);
    if (result === true) {
      group.classList.remove('has-error');
      errorEl.textContent = '';
      return true;
    } else {
      group.classList.add('has-error');
      errorEl.textContent = result;
      return false;
    }
  }

  $$('input, textarea', form).forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-group').classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = $$('input, textarea', form);
    const allValid = fields.map(validateField).every(Boolean);

    if (allValid) {
      const payload = {
        name: $('#name').value.trim(),
        email: $('#email').value.trim(),
        subject: $('#subject').value.trim(),
        message: $('#message').value.trim()
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Form delivery failed');
        }

        const drafts = JSON.parse(localStorage.getItem('portfolio-contact-drafts') || '[]');
        drafts.push({ ...payload, createdAt: new Date().toISOString() });
        localStorage.setItem('portfolio-contact-drafts', JSON.stringify(drafts));

        formSuccess.textContent = 'Thanks! Your message has been sent.';
        form.reset();
      } catch (error) {
        formSuccess.textContent = 'Unable to send the message right now.';
      }

      setTimeout(() => { formSuccess.textContent = ''; }, 5000);
    } else {
      formSuccess.textContent = '';
    }
  });

  /* ============ 15. RIPPLE BUTTON EFFECT ============ */
  $$('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      circle.classList.add('ripple-circle');
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });

  /* ============ 16. BACK TO TOP + SCROLL PROGRESS ============ */
  const backToTop = $('#backToTop');
  const scrollProgress = $('#scrollProgress');

  function handleScrollExtras() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    scrollProgress.style.width = `${progress}%`;
    backToTop.classList.toggle('back-to-top--visible', scrollTop > 500);
  }
  window.addEventListener('scroll', handleScrollExtras);
  handleScrollExtras();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ============ 17. FOOTER YEAR ============ */
  $('#year').textContent = new Date().getFullYear();

});
