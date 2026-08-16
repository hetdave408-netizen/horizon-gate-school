const { verifyPassword, createSessionToken, setSessionCookie } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const expectedEmail = process.env.ADMIN_EMAIL;
    if (!expectedEmail) {
      console.error('/api/auth/login: ADMIN_EMAIL is not set.');
      return res.status(500).json({ error: 'Admin login is not configured on the server yet.' });
    }
    if (email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()) {
      // Same generic message as a wrong password — don't reveal which part was wrong.
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordOk = await verifyPassword(password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createSessionToken(expectedEmail);
    setSessionCookie(res, token, req);
    return res.status(200).json({ ok: true, email: expectedEmail });
  } catch (err) {
    console.error('/api/auth/login error:', err.message);
    return res.status(500).json({ error: 'Admin login is not configured correctly on the server. Check ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and SESSION_SECRET.' });
  }
};
