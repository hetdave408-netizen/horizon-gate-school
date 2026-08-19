// ============================================================
// Horizon Gate School — CMS content loader
// If /api/news or /api/gallery is reachable and returns data, this
// swaps in live content. If the backend isn't deployed yet (e.g. a
// static-only preview), it does nothing and the static HTML already
// in the page — written by build.py/pages.py — stays exactly as-is.
// ============================================================

(function () {
  const API_BASE = window.HORIZON_API_BASE || '';

  function esc(s) {
    return (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function newsCardHTML(n) {
    const cat = (n.category || 'News').toLowerCase();
    const date = new Date(n.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const img = n.imageUrl || 'https://picsum.photos/seed/hg-news-fallback/600/380';
    return `
      <article data-gallery-item data-category="${esc(cat)}" class="group border border-navy/10 rounded-sm overflow-hidden">
        <div class="aspect-[16/10] overflow-hidden"><img src="${esc(img)}" alt="${esc(n.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"></div>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-[10px] font-data tracking-widest text-gold uppercase">${esc(n.category)}</span>
            <span class="text-[10px] font-data tracking-widest text-ink/35">${esc(date)}</span>
          </div>
          <h3 class="font-display text-lg text-navy leading-snug">${esc(n.title)}</h3>
          ${n.excerpt ? `<p class="text-sm text-ink/55 mt-2">${esc(n.excerpt)}</p>` : ''}
        </div>
      </article>`;
  }

  function eventCardHTML(n) {
    const d = new Date(n.date);
    const day = d.toLocaleDateString('en-IN', { day: '2-digit' });
    const mon = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
    return `
      <div class="bg-warmWhite border border-navy/10 rounded-sm p-6">
        <div class="flex items-baseline gap-2 mb-4">
          <span class="font-display text-3xl text-navy">${day}</span>
          <span class="font-data text-xs text-gold tracking-widest">${mon}</span>
        </div>
        <h3 class="font-display text-base text-navy mb-2">${esc(n.title)}</h3>
        <p class="text-xs text-ink/55 leading-relaxed">${esc(n.excerpt || '')}</p>
      </div>`;
  }

  function galleryItemHTML(g, i) {
    const sizes = ['aspect-square', 'aspect-[4/5]', 'aspect-square', 'aspect-[4/3]'];
    const full = g.fullImageUrl || g.imageUrl;
    return `
      <button data-gallery-item data-category="${esc(g.category)}" data-full="${esc(full)}" data-caption="${esc(g.caption)}" class="group relative ${sizes[i % sizes.length]} overflow-hidden rounded-sm">
        <img src="${esc(g.imageUrl)}" alt="${esc(g.caption)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        <span class="absolute inset-0 bg-navy/0 group-hover:bg-navy/25 transition"></span>
        <span class="absolute bottom-3 left-3 text-warmWhite text-xs font-data opacity-0 group-hover:opacity-100 transition">${esc(g.caption)}</span>
      </button>`;
  }

  function teacherCardHTML(t) {
    const img = t.photoUrl || 'https://picsum.photos/seed/hg-teacher-fallback/360/440';
    return `
      <div class="shrink-0 w-52 snap-start text-center">
        <img src="${esc(img)}" alt="${esc(t.name)}" loading="lazy" class="rounded-sm w-full aspect-[4/5] object-cover mb-4">
        <p class="font-display text-warmWhite text-sm">${esc(t.name)}</p>
        <p class="text-xs text-goldBright mt-1">${esc(t.role)}</p>
        ${t.qualifications ? `<p class="text-xs text-warmWhite/45 mt-1">${esc(t.qualifications)}</p>` : ''}
      </div>`;
  }

  async function fetchJSON(path) {
    const res = await fetch(API_BASE + path, { signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined });
    if (!res.ok) throw new Error('bad response');
    return res.json();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    // --- News & Events page ---
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) {
      try {
        const items = await fetchJSON('/api/news');
        if (items.length) newsGrid.innerHTML = items.map(newsCardHTML).join('');
      } catch { /* keep static fallback already in the page */ }
    }

    // --- Home: upcoming events strip ---
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid) {
      try {
        const items = await fetchJSON('/api/news?category=Event');
        const upcoming = items
          .filter(n => new Date(n.date) >= new Date(new Date().toDateString()))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 4);
        if (upcoming.length) eventsGrid.innerHTML = upcoming.map(eventCardHTML).join('');
      } catch { /* keep static fallback */ }
    }

    // --- About: faculty section ---
    const facultyGrid = document.getElementById('faculty-grid');
    if (facultyGrid) {
      try {
        const items = await fetchJSON('/api/teachers');
        if (items.length) facultyGrid.innerHTML = items.map(teacherCardHTML).join('');
      } catch { /* keep static fallback */ }
    }

    // --- Gallery page (and gallery preview on Home) ---
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
      try {
        const items = await fetchJSON('/api/gallery');
        if (items.length) {
          galleryGrid.innerHTML = items.map(galleryItemHTML).join('');
        }
      } catch { /* keep static fallback */ }
    }

    const galleryPreview = document.getElementById('gallery-preview-grid');
    if (galleryPreview) {
      try {
        const items = await fetchJSON('/api/gallery');
        if (items.length) {
          galleryPreview.innerHTML = items.slice(0, 4).map((g) => `
            <button data-gallery-item data-full="${esc(g.fullImageUrl || g.imageUrl)}" data-caption="${esc(g.caption)}" class="group relative aspect-square overflow-hidden rounded-sm">
              <img src="${esc(g.imageUrl)}" alt="${esc(g.caption)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
              <span class="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition"></span>
            </button>`).join('');
        }
      } catch { /* keep static fallback */ }
    }
  });
})();
