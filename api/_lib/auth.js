// ============================================================
// Single-admin session authentication.
//
// Replaces the old "send ADMIN_PASSWORD in a header on every request"
// approach with: a login endpoint that checks a bcrypt-hashed password,
// then issues a signed, HttpOnly, SameSite=Strict session cookie. The
// browser sends that cookie automatically on same-origin requests —
// client-side JS never sees or stores the password or the raw token
// in a way it could leak (no localStorage, no reading the cookie value
// from JS, since HttpOnly blocks that by design).
//
// Required env vars (set in Vercel → Project → Settings → Environment
// Variables, never committed to the repo):
//   ADMIN_EMAIL          e.g. admin@horizongate.edu
//   ADMIN_PASSWORD_HASH  a bcrypt hash — generate with:
//                         node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
//   SESSION_SECRET        any long random string (e.g. `openssl rand -hex 32`)
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const COOKIE_NAME = 'hg_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set.');
  return secret;
}

async function verifyPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error('ADMIN_PASSWORD_HASH is not set.');
  return bcrypt.compare(password, hash);
}

function createSessionToken(email) {
  return jwt.sign({ sub: email, role: 'admin' }, getSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

function verifySessionToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null; // expired, tampered, or malformed — treat as logged out
  }
}

function isSecureContext(req) {
  // Vercel deployments are always HTTPS. Only relax the `Secure` cookie
  // flag for local `vercel dev` testing over plain http://localhost.
  const host = (req && req.headers && req.headers.host) || '';
  return !host.startsWith('localhost') && !host.startsWith('127.0.0.1');
}

function getSessionTokenFromRequest(req) {
  const header = req.headers && req.headers.cookie;
  if (!header) return null;
  const parsed = cookie.parse(header);
  return parsed[COOKIE_NAME] || null;
}

function verifySessionCookie(req) {
  const token = getSessionTokenFromRequest(req);
  if (!token) return null;
  return verifySessionToken(token);
}

function setSessionCookie(res, token, req) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureContext(req),
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }));
}

function clearSessionCookie(res, req) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecureContext(req),
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  }));
}

module.exports = {
  verifyPassword,
  createSessionToken,
  verifySessionCookie,
  setSessionCookie,
  clearSessionCookie,
};
