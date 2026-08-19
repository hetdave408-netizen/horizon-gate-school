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

  /* ---------- Nav dropdowns: explicit toggle button ----------
     The nav label (e.g. "Admissions") is a plain <a> that always
     navigates — no ambiguity on any device. The small chevron button
     next to it is a separate, dedicated target that only opens/closes
     the submenu panel, works identically with mouse or touch, and
     never blocks the label's own click from going through. */
  document.querySelectorAll('[data-dropdown]').forEach(wrap => {
    const toggle = wrap.querySelector('[data-dropdown-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !wrap.classList.contains('dropdown-open');
      document.querySelectorAll('[data-dropdown].dropdown-open').forEach(w => {
        w.classList.remove('dropdown-open');
        const t = w.querySelector('[data-dropdown-toggle]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        wrap.classList.add('dropdown-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-dropdown]')) {
      document.querySelectorAll('[data-dropdown].dropdown-open').forEach(w => {
        w.classList.remove('dropdown-open');
        const t = w.querySelector('[data-dropdown-toggle]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

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
     gallery items injected later by cms.js once the CMS API responds.
     Tracks position within whatever's currently visible (respecting
     the active filter), so prev/next, arrow keys, and swipe all stay
     in sync with what filter the user has selected. */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('[data-lb-caption]');
    const prevBtn = lightbox.querySelector('[data-lb-prev]');
    const nextBtn = lightbox.querySelector('[data-lb-next]');
    let currentIndex = -1;

    function visibleItems() {
      return [...document.querySelectorAll('[data-gallery-item]')].filter(el => el.offsetParent !== null);
    }
    function showIndex(i) {
      const items = visibleItems();
      if (!items.length) return;
      currentIndex = (i + items.length) % items.length;
      const item = items[currentIndex];
      const img = item.querySelector('img');
      lbImg.src = item.dataset.full || (img ? img.src : '');
      lbImg.alt = img ? img.alt : '';
      if (lbCaption) lbCaption.textContent = item.dataset.caption || '';
      const showArrows = items.length > 1;
      if (prevBtn) prevBtn.classList.toggle('hidden', !showArrows);
      if (nextBtn) nextBtn.classList.toggle('hidden', !showArrows);
    }

    document.addEventListener('click', (e) => {
      const item = e.target.closest('[data-gallery-item]');
      if (!item) return;
      const items = visibleItems();
      showIndex(items.indexOf(item));
      lightbox.classList.add('open');
    });
    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currentIndex - 1); });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currentIndex + 1); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.closest('[data-lb-close]')) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') lightbox.classList.remove('open');
      if (e.key === 'ArrowLeft') showIndex(currentIndex - 1);
      if (e.key === 'ArrowRight') showIndex(currentIndex + 1);
    });

    // Mobile swipe: left = next, right = previous.
    let touchStartX = null;
    lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) showIndex(currentIndex + (dx < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
  }

  /* ---------- Horizontal-scroll sliders (Faculty, etc.) ----------
     Generic: [data-slider-prev="#id"] / [data-slider-next="#id"] scroll
     the element with that id by roughly one card-width. Native touch
     scrolling (with scroll-snap) already handles mobile for free. */
  document.querySelectorAll('[data-slider-prev], [data-slider-next]').forEach(btn => {
    const targetSel = btn.dataset.sliderPrev || btn.dataset.sliderNext;
    const target = document.querySelector(targetSel);
    if (!target) return;
    const dir = btn.hasAttribute('data-slider-prev') ? -1 : 1;
    btn.addEventListener('click', () => {
      const card = target.querySelector(':scope > *');
      const step = card ? card.getBoundingClientRect().width + 24 : 300; // + gap-6
      target.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
    });
  });

  /* ---------- Info modal (Academics program cards, etc.) ----------
     Generic: any element with data-open-modal="id" opens #info-modal
     populated from that same element's other data-modal-* attributes.
     data-modal-highlights takes a "|"-separated list. */
  const infoModal = document.getElementById('info-modal');
  if (infoModal) {
    const elImg = infoModal.querySelector('[data-modal-image]');
    const elEyebrow = infoModal.querySelector('[data-modal-eyebrow]');
    const elTitle = infoModal.querySelector('[data-modal-title]');
    const elBody = infoModal.querySelector('[data-modal-body]');
    const elHighlights = infoModal.querySelector('[data-modal-highlights]');

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-modal]');
      if (!trigger) return;
      elImg.src = trigger.dataset.modalImage || '';
      elImg.alt = trigger.dataset.modalTitle || '';
      elEyebrow.textContent = trigger.dataset.modalEyebrow || '';
      elTitle.textContent = trigger.dataset.modalTitle || '';
      elBody.textContent = trigger.dataset.modalBody || '';
      const highlights = (trigger.dataset.modalHighlights || '').split('|').map(s => s.trim()).filter(Boolean);
      elHighlights.innerHTML = highlights.map(h => `<li class="flex gap-3 text-sm text-ink/70"><span class="text-gold mt-0.5">&#9670;</span>${h}</li>`).join('');
      infoModal.classList.remove('hidden');
      infoModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });
    infoModal.querySelectorAll('[data-modal-close], [data-modal-backdrop]').forEach(el => {
      el.addEventListener('click', () => {
        infoModal.classList.add('hidden');
        infoModal.classList.remove('flex');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !infoModal.classList.contains('hidden')) {
        infoModal.classList.add('hidden');
        infoModal.classList.remove('flex');
        document.body.style.overflow = '';
      }
    });
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

      // Compose a hidden field from several visible ones before validating
      // (e.g. "First / Middle / Surname" -> a single studentName value the
      // API actually expects). Declared as data-compose-name="src1,src2:target".
      if (form.dataset.composeName) {
        const [srcFields, targetField] = form.dataset.composeName.split(':');
        const parts = srcFields.split(',')
          .map(n => (form.querySelector(`[name="${n}"]`) || {}).value)
          .filter(v => v && v.trim());
        const targetInput = form.querySelector(`[name="${targetField}"]`);
        if (targetInput) targetInput.value = parts.join(' ').trim();
      }

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

  /* ---------- Calendar widget (Book Appointment for Campus Visit) ----------
     Small, self-contained month-view date picker. Not tied to any one
     form — reads/writes whatever hidden input + display element its
     data attributes point to, so it can be reused elsewhere later. */
  const MONTH_NAMES = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  document.querySelectorAll('[data-calendar]').forEach(cal => {
    const monthLabel = cal.querySelector('[data-cal-month]');
    const grid = cal.querySelector('[data-cal-grid]');
    const prevBtn = cal.querySelector('[data-cal-prev]');
    const nextBtn = cal.querySelector('[data-cal-next]');
    const hiddenInput = document.querySelector(cal.dataset.calTarget || '');
    const displayEl = document.querySelector(cal.dataset.calDisplay || '');
    if (!monthLabel || !grid) return;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = hiddenInput && hiddenInput.value ? new Date(hiddenInput.value) : null;

    function render() {
      monthLabel.textContent = `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
      grid.innerHTML = '';
      const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
      const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
      const daysInPrevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();

      const cells = [];
      for (let i = startOffset; i > 0; i--) cells.push({ day: daysInPrevMonth - i + 1, muted: true });
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        cells.push({ day: d, date, disabled: date < today });
      }
      let nextDay = 1;
      while (cells.length < 42) cells.push({ day: nextDay++, muted: true });

      cells.forEach(cell => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = cell.day;
        const classes = ['cal-day'];
        if (cell.muted) classes.push('cal-day-muted', 'cal-day-disabled');
        if (cell.disabled) classes.push('cal-day-disabled');
        if (cell.date && cell.date.getTime() === today.getTime()) classes.push('cal-day-today');
        if (cell.date && selectedDate && cell.date.toDateString() === selectedDate.toDateString()) classes.push('cal-day-selected');
        btn.className = classes.join(' ');
        if (cell.date && !cell.disabled) {
          btn.addEventListener('click', () => {
            selectedDate = cell.date;
            render();
            const iso = cell.date.toISOString().slice(0, 10);
            if (hiddenInput) { hiddenInput.value = iso; hiddenInput.dispatchEvent(new Event('change', { bubbles: true })); }
            if (displayEl) displayEl.textContent = cell.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
          });
        }
        grid.appendChild(btn);
      });

      if (prevBtn) prevBtn.disabled = (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth());
    }

    prevBtn?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); render(); });
    nextBtn?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); render(); });
    render();
  });

  /* ---------- Enquire Now / Book an Appointment toggle ----------
     When "Book an Appointment" is selected, a calendar date becomes
     required; for "Enquire Now" it's optional. */
  document.querySelectorAll('[data-intent-toggle]').forEach(wrap => {
    const radios = wrap.querySelectorAll('input[type="radio"]');
    const calendarBlock = document.querySelector(wrap.dataset.calendarBlock || '');
    const dateInput = calendarBlock ? calendarBlock.querySelector('input[type="hidden"]') : null;
    function sync() {
      const checked = wrap.querySelector('input[type="radio"]:checked');
      const isAppointment = checked && checked.value === 'appointment';
      if (calendarBlock) calendarBlock.classList.toggle('opacity-50', !isAppointment);
      if (dateInput) dateInput.required = Boolean(isAppointment);
    }
    radios.forEach(r => r.addEventListener('change', sync));
    sync();
  });

});
