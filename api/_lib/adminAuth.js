// Real session-based admin gate — replaces the old shared-password
// header/query check. See api/_lib/auth.js for the underlying
// bcrypt + signed-cookie implementation. Every route that already
// calls isAdminAuthorized(req) is now protected by a real login
// session automatically, with no changes needed to those routes.

const { verifySessionCookie } = require('./auth');

function isAdminAuthorized(req) {
  return Boolean(verifySessionCookie(req));
}

module.exports = { isAdminAuthorized };
