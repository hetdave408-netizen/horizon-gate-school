const { verifySessionCookie } = require('../_lib/auth');

module.exports = async (req, res) => {
  const session = verifySessionCookie(req);
  if (!session) return res.status(401).json({ authenticated: false });
  return res.status(200).json({ authenticated: true, email: session.sub });
};
