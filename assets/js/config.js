// ------------------------------------------------------------------
// Point this at your deployed backend's base URL once /backend is live
// (e.g. Render, Railway, Fly.io). Leave it as '' to call same-origin
// relative paths — that only works if the frontend and backend are
// served from the same domain (e.g. behind one reverse proxy).
//
// Example once deployed:
//   window.HORIZON_API_BASE = 'https://api.horizongate.edu';
// ------------------------------------------------------------------
window.HORIZON_API_BASE = '';

// ------------------------------------------------------------------
// Social media — the site ships with these unset (no invented URLs).
// Fill in the ones you actually have; leave the rest as ''. Icons for
// empty entries are shown but not clickable, with a small "not set"
// tooltip, rather than silently linking to "#".
// ------------------------------------------------------------------
window.SOCIAL_LINKS = {
  instagram: '',
  youtube: '',
  linkedin: '',
  facebook: '',
};

// ------------------------------------------------------------------
// Google Maps (optional). Get a key at console.cloud.google.com,
// enable the "Maps Embed API", and — importantly — restrict the key
// under "API restrictions" to the Maps Embed API only, and under
// "Application restrictions" to your website's domain(s) (HTTP
// referrers). Embed-API keys are meant to be used client-side like
// this; the domain restriction is what keeps it from being misused
// if someone copies it, not secrecy.
//
// Leave this blank and the Contact page shows a working OpenStreetMap
// embed instead (no key required, but not literally "Google Maps").
// ------------------------------------------------------------------
window.GOOGLE_MAPS_API_KEY = '';
window.SCHOOL_MAP_QUERY = '42+Meridian+Hill+Road,+Ahmedabad,+Gujarat+380015'; // update to your real address
