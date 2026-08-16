// ============================================================
// Horizon Gate School — shared interactivity
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Sticky nav + scroll progress ---------- */
  const nav = document.getElementById('site-nav');
  const progress = document.getElementById('scroll-progress');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    if (progress) {
      const h = document.documentElement;
      const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      progress.style.width = pct + '%';
    }
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) backToTop.classList.toggle('opacity-0', window.scrollY < 500);
    if (backToTop) backToTop.classList.toggle('pointer-events-none', window.scrollY < 500);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Nav dropdowns: tap-to-open on touch devices ----------
     CSS :hover already handles this fine with a mouse. On a touchscreen
     laptop/tablet, :hover never fires, so a tap on "About"/"Campus"/etc
     would just navigate straight through without ever showing the
     submenu. This makes the first tap open the panel instead, and a
     second tap (or tapping an item inside it) follows the link. */
  const supportsHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  if (!supportsHover) {
    document.querySelectorAll('[data-dropdown]').forEach(wrap => {
      const trigger = wrap.querySelector('[data-dropdown-trigger]');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        if (!wrap.classList.contains('dropdown-open')) {
          e.preventDefault();
          document.querySelectorAll('[data-dropdown].dropdown-open').forEach(w => { if (w !== wrap) w.classList.remove('dropdown-open'); });
          wrap.classList.add('dropdown-open');
        }
        // else: already open, let this tap follow the link normally
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        document.querySelectorAll('[data-dropdown].dropdown-open').forEach(w => w.classList.remove('dropdown-open'));
      }
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('flex');
      mobileMenu.classList.toggle('hidden');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
    }));
  }

  /* ---------- Social links (from assets/js/config.js) ---------- */
  const socialLinks = window.SOCIAL_LINKS || {};
  document.querySelectorAll('[data-social]').forEach(a => {
    const url = socialLinks[a.dataset.social];
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      a.title = 'Not set yet — add it in assets/js/config.js';
      a.classList.add('opacity-40', 'cursor-not-allowed');
      a.addEventListener('click', (e) => e.preventDefault());
    }
  });

  /* ---------- Google Maps (optional, from config.js) ----------
     Falls back to the OpenStreetMap embed already in the page if no
     key is set — see assets/js/config.js for exactly how to switch. */
  const mapFrame = document.getElementById('school-map-embed');
  if (mapFrame && window.GOOGLE_MAPS_API_KEY) {
    const query = window.SCHOOL_MAP_QUERY || '';
    mapFrame.src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(window.GOOGLE_MAPS_API_KEY)}&q=${query}`;
    const badge = document.getElementById('school-map-badge');
    if (badge) badge.textContent = 'PLACEHOLDER PIN — UPDATE THE ADDRESS IN CONFIG.JS';
    const attribution = document.getElementById('school-map-attribution');
    if (attribution) attribution.textContent = 'Placeholder pin — update the address in assets/js/config.js to your real campus location.';
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Admissions-open pop-up notice ----------
     Shows once per browser session (sessionStorage), a beat after load
     so it doesn't fight the hero animation for attention. */
  const notice = document.getElementById('admission-notice');
  if (notice) {
    const DISMISS_KEY = 'hg_admission_notice_dismissed';
    if (!sessionStorage.getItem(DISMISS_KEY)) {
      setTimeout(() => {
        notice.classList.remove('translate-y-[140%]', 'opacity-0');
      }, 1400);
    } else {
      notice.remove();
    }
    const closeBtn = document.getElementById('admission-notice-close');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      notice.classList.add('translate-y-[140%]', 'opacity-0');
      sessionStorage.setItem(DISMISS_KEY, '1');
      setTimeout(() => notice.remove(), 500);
    });
  }

  /* ---------- Reveal on scroll (fallback for elements not using AOS) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (target % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Testimonial / story slider ---------- */
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const slides = slider.querySelectorAll('.slide');
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    const dotsWrap = slider.querySelector('[data-dots]');
    let idx = 0;
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'w-2 h-2 rounded-full bg-current opacity-30 transition-opacity';
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => show(i));
        dotsWrap.appendChild(dot);
      });
    }
    const show = (i) => {
      slides[idx].classList.remove('active');
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('active');
      if (dotsWrap) [...dotsWrap.children].forEach((d, di) => d.classList.toggle('opacity-30', di !== idx) || d.classList.toggle('opacity-100', di === idx));
    };
    if (slides.length) show(0);
    if (prev) prev.addEventListener('click', () => show(idx - 1));
    if (next) next.addEventListener('click', () => show(idx + 1));
    let auto = setInterval(() => show(idx + 1), 6000);
    slider.addEventListener('mouseenter', () => clearInterval(auto));
    slider.addEventListener('mouseleave', () => { auto = setInterval(() => show(idx + 1), 6000); });
  });

  /* ---------- Gallery lightbox ----------
     Delegated on document (not bound per-item) so it still works for
     gallery items injected later by cms.js once the CMS API responds. */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('[data-lb-caption]');
    document.addEventListener('click', (e) => {
      const item = e.target.closest('[data-gallery-item]');
      if (!item) return;
      const img = item.querySelector('img');
      lbImg.src = item.dataset.full || (img ? img.src : '');
      lbImg.alt = img ? img.alt : '';
      if (lbCaption) lbCaption.textContent = item.dataset.caption || '';
      lightbox.classList.add('open');
    });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.closest('[data-lb-close]')) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });
  }

  /* ---------- Gallery filters ---------- */
  const filterBtns = document.querySelectorAll('[data-filter]');
  if (filterBtns.length) {
    filterBtns.forEach(btn => btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('bg-[var(--navy)]', 'text-white'));
      btn.classList.add('bg-[var(--navy)]', 'text-white');
      const cat = btn.dataset.filter;
      document.querySelectorAll('[data-gallery-item]').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.category === cat) ? '' : 'none';
      });
    }));
  }

  /* ---------- Forms: inquiry + book-a-visit (client-side demo) ---------- */
  document.querySelectorAll('form[data-async-form]').forEach(form => {
    const successBox = document.querySelector(form.dataset.successTarget || '');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const errorEl = field.parentElement.querySelector('.field-error');
        const isEmpty = !field.value.trim();
        const isBadEmail = field.type === 'email' && field.value && !/^\S+@\S+\.\S+$/.test(field.value);
        const isBadPhone = field.type === 'tel' && field.value && field.value.replace(/\D/g, '').length < 10;
        const bad = isEmpty || isBadEmail || isBadPhone;
        field.classList.toggle('border-red-400', bad);
        if (errorEl) errorEl.classList.toggle('hidden', !bad);
        if (bad) valid = false;
      });
      if (!valid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';

      // NOTE: this posts to the bundled Express backend (see /backend) when deployed together.
      // In a static-only preview, it falls back to a local success simulation.
      const endpoint = form.dataset.endpoint;
      const finish = () => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        form.classList.add('hidden');
        if (successBox) successBox.classList.remove('hidden');
      };
      if (endpoint) {
        const data = Object.fromEntries(new FormData(form).entries());
        const base = window.HORIZON_API_BASE || '';
        fetch(base + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(() => finish())
          .catch(() => finish()); // demo: still show success locally if backend isn't running
      } else {
        setTimeout(finish, 700);
      }
    });
  });

});
