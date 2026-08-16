const { appendRegistrationRow, isConfigured } = require('./_lib/sheets');
const { sendMail } = require('./_lib/mail');

const EMAIL_RE = /^\S+@\S+\.\S+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { parentName, studentName, grade, mobile, email, visitDate, timeSlot, visitors, remarks } = req.body || {};

    if (!parentName || !studentName || !grade || !mobile || !email || !visitDate || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    const parsedDate = new Date(visitDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Please provide a valid date.' });
    }

    if (!isConfigured()) {
      // Fail clearly rather than silently pretending the registration was
      // stored somewhere. See README for the exact env vars to set.
      console.error('/api/admission-registration: Google Sheets is not configured.');
      return res.status(503).json({
        error: 'Admission registration isn\'t fully set up yet on the server (Google Sheets isn\'t connected). Please try again shortly, or contact the admissions office directly.',
      });
    }

    const fields = {
      parentName: String(parentName).slice(0, 120),
      studentName: String(studentName).slice(0, 120),
      grade: String(grade).slice(0, 40),
      mobile: String(mobile).slice(0, 20),
      email: String(email).slice(0, 160),
      visitDate: parsedDate.toISOString().slice(0, 10),
      timeSlot: String(timeSlot).slice(0, 40),
      visitors: Math.min(Math.max(parseInt(visitors, 10) || 1, 1), 20),
      remarks: remarks ? String(remarks).slice(0, 2000) : '',
    };

    await appendRegistrationRow(fields);

    // Best-effort confirmation email — never blocks the response.
    sendMail({
      to: fields.email,
      subject: 'Your admission registration is received — Horizon Gate School',
      html: `<p>Hi ${fields.parentName},</p><p>We've received your admission registration for <b>${fields.studentName}</b> (${fields.grade}). Our admissions office will be in touch shortly.</p><p>&mdash; Horizon Gate Admissions</p>`,
    }).catch(() => {});

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('/api/admission-registration error:', err.message);
    if (err.code === 'SHEETS_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Admission registration storage is not configured yet. Please contact the admissions office directly.' });
    }
    return res.status(502).json({ error: 'We could not reach the registration system just now. Please try again in a moment, or contact the admissions office directly.' });
  }
};
