/* ─────────────────────────────────────────────
   script.js — HBox Website interactions
───────────────────────────────────────────── */

/* ── Navbar: add .scrolled class on scroll ── */
const navbar = document.getElementById('navbar');
function handleScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

/* ── FAQ accordion ── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const chevron = item.querySelector('.faq-chevron path');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-item--open');

      // Close all
      items.forEach(i => {
        i.classList.remove('faq-item--open');
        const b = i.querySelector('.faq-question');
        if (b) b.setAttribute('aria-expanded', 'false');
        const ch = i.querySelector('.faq-chevron path');
        if (ch) ch.setAttribute('d', 'M6 9L12 15L18 9');
        const stroke = i.querySelector('.faq-chevron path');
        if (stroke) stroke.setAttribute('stroke', 'rgba(255,255,255,0.6)');
      });

      // If it was closed, open it
      if (!isOpen) {
        item.classList.add('faq-item--open');
        btn.setAttribute('aria-expanded', 'true');
        if (chevron) {
          chevron.setAttribute('d', 'M6 15L12 9L18 15');
          chevron.setAttribute('stroke', 'white');
        }
      }
    });
  });
})();

/* ── Hamburger / mobile nav toggle ── */
const hamburger = document.getElementById('hamburger');
const navLinks   = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  // animate bars
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

/* ── Close mobile menu when a link is clicked ── */
navLinks.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  });
});

/* ── Scroll-reveal with IntersectionObserver ── */
function setupReveal() {
  const targets = document.querySelectorAll(
    '.trust-card, .why-bullet, .vid-card, .uc-card, .dev-card, ' +
    '.hero-left, .hero-right, .hero-image-wrap, ' +
    '.section-header, .dev-header, .why-heading-wrap, .why-bullets'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // stagger siblings inside the same parent
    const siblings = el.parentElement ? [...el.parentElement.children] : [];
    const idx = siblings.indexOf(el);
    if (idx > 0) {
      el.style.transitionDelay = `${idx * 0.1}s`;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}
setupReveal();

/* ── Native scroll carousels with dots and arrows ── */
function initNativeCarousel(trackId, dotsId, prevId, nextId, cardSelector, getVisibleCount) {
  const track = document.getElementById(trackId);
  const dotsContainer = document.getElementById(dotsId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  if (!track) return;

  const cards = track.querySelectorAll(cardSelector);
  if (cards.length === 0) return;

  function getPages() {
    const vis = getVisibleCount();
    return Math.ceil(cards.length / vis);
  }

  function setupDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const pages = getPages();
    
    if (pages <= 1) return;

    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        const cardIndex = Math.min(i * getVisibleCount(), cards.length - 1);
        if (cards[cardIndex]) {
          track.scrollTo({
            left: cards[cardIndex].offsetLeft - track.offsetLeft,
            behavior: 'smooth'
          });
        }
      });
      dotsContainer.appendChild(dot);
    }
    updateUI();
  }

  function updateUI() {
    let activeIndex = 0;
    let minDistance = Infinity;
    const trackScrollLeft = track.scrollLeft;
    cards.forEach((card, index) => {
      const cardLeft = card.offsetLeft - track.offsetLeft;
      const distance = Math.abs(cardLeft - trackScrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = index;
      }
    });

    const vis = getVisibleCount();
    const currentPage = Math.min(Math.round(activeIndex / vis), getPages() - 1);

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        if (index === currentPage) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    if (prevBtn && nextBtn) {
      prevBtn.style.opacity = activeIndex === 0 ? '0.3' : '1';
      const maxScroll = track.scrollWidth - track.clientWidth;
      nextBtn.style.opacity = trackScrollLeft >= maxScroll - 10 ? '0.3' : '1';
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const vis = getVisibleCount();
      let activeIndex = 0;
      let minDistance = Infinity;
      cards.forEach((card, index) => {
        const dist = Math.abs((card.offsetLeft - track.offsetLeft) - track.scrollLeft);
        if (dist < minDistance) { minDistance = dist; activeIndex = index; }
      });
      const targetIndex = Math.max(0, activeIndex - vis);
      track.scrollTo({ left: cards[targetIndex].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const vis = getVisibleCount();
      let activeIndex = 0;
      let minDistance = Infinity;
      cards.forEach((card, index) => {
        const dist = Math.abs((card.offsetLeft - track.offsetLeft) - track.scrollLeft);
        if (dist < minDistance) { minDistance = dist; activeIndex = index; }
      });
      const targetIndex = Math.min(cards.length - 1, activeIndex + vis);
      track.scrollTo({ left: cards[targetIndex].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    });
  }

  track.addEventListener('scroll', updateUI, { passive: true });
  window.addEventListener('resize', setupDots, { passive: true });
  setTimeout(setupDots, 50);
}

initNativeCarousel('video-track', 'vid-dots', 'vid-prev', 'vid-next', '.vid-card', () => {
  const w = window.innerWidth;
  if (w <= 820) return 1;
  if (w <= 1100) return 3;
  return 4;
});

initNativeCarousel('use-cases-grid', 'case-dots', 'case-prev', 'case-next', '.uc-card', () => {
  const w = window.innerWidth;
  return w <= 820 ? 1 : 2;
});

initNativeCarousel('dev-grid', 'dev-dots', 'dev-prev', 'dev-next', '.dev-card', () => {
  const w = window.innerWidth;
  if (w <= 820) return 1;
  if (w <= 1100) return 2;
  return 4;
});

/* ── Smooth-scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Hover parallax on hero image ── */
(function heroParallax() {
  const heroImg = document.getElementById('hero-img');
  if (!heroImg) return;
  const section = document.getElementById('hero');
  section.addEventListener('mousemove', (e) => {
    const rect   = section.getBoundingClientRect();
    const x      = (e.clientX - rect.left) / rect.width  - 0.5;
    const y      = (e.clientY - rect.top)  / rect.height - 0.5;
    heroImg.style.transform = `scale(1.015) translate(${x * 6}px, ${y * 4}px)`;
  });
  section.addEventListener('mouseleave', () => {
    heroImg.style.transform = '';
  });
})();

initNativeCarousel('dev-grid', 'dev-dots', '.dev-card');

/* ── Community Tabs Slider ── */
(function initCommunityTabs() {
  const tabs = document.querySelectorAll('.comm-tab');
  const sliderWrap = document.querySelector('.community-slider-wrap');
  const sliderTrack = document.querySelector('.community-slider');
  const cards = document.querySelectorAll('.comm-slide');
  const dots = document.querySelectorAll('#comm-dots .dot');
  
  if (!sliderWrap || !sliderTrack || cards.length === 0 || tabs.length === 0) return;

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // update active dot
      dots.forEach((d, i) => {
        if (i === index) d.classList.add('active');
        else d.classList.remove('active');
      });

      // scroll to the corresponding card
      if (cards[index]) {
        sliderWrap.scrollTo({
          left: cards[index].offsetLeft - sliderTrack.offsetLeft,
          behavior: 'smooth'
        });
      }
      
      // on mobile, scroll the tabs container so the active tab is visible
      const tabsContainer = document.querySelector('.community-tabs');
      if (tabsContainer && window.innerWidth <= 1100) {
        tabsContainer.scrollTo({
          left: tab.offsetLeft - 24,
          behavior: 'smooth'
        });
      }
    });
  });

  // add click listeners to dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (tabs[index]) tabs[index].click();
    });
  });
})();
