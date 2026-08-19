const { connectToDatabase } = require('./_lib/db');
const Inquiry = require('./_lib/models/Inquiry');
const { isAdminAuthorized } = require('./_lib/adminAuth');
const { sendInquiryEmails } = require('./_lib/mail');

const EMAIL_RE = /^\S+@\S+\.\S+$/;

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      // studentName comes from the redesigned admissions enquiry form;
      // parentName still comes from the Contact page form. Either one
      // identifies the submission — a form only needs to send whichever
      // one it actually collects.
      const { studentName, parentName, grade, mobile, email, message, referralSource, intent, preferredDate, source } = req.body || {};

      if ((!studentName && !parentName) || !mobile || !email) {
        return res.status(400).json({ error: 'A name, mobile number, and email are required.' });
      }
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
      if (intent && !['enquire', 'appointment'].includes(intent)) {
        return res.status(400).json({ error: 'Invalid intent value.' });
      }

      const inquiry = await Inquiry.create({
        studentName: studentName ? String(studentName).slice(0, 120) : undefined,
        parentName: parentName ? String(parentName).slice(0, 120) : undefined,
        grade: grade ? String(grade).slice(0, 40) : undefined,
        mobile: String(mobile).slice(0, 20),
        email: String(email).slice(0, 160),
        message: message ? String(message).slice(0, 2000) : undefined,
        referralSource: referralSource ? String(referralSource).slice(0, 60) : undefined,
        intent: intent || 'enquire',
        preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        source: source ? String(source).slice(0, 40) : 'website',
      });

      // Email is best-effort and never blocks the response — if SMTP isn't
      // configured yet, sendInquiryEmails() just logs and returns.
      sendInquiryEmails({
        parentName: inquiry.studentName || inquiry.parentName,
        email: inquiry.email,
        grade: inquiry.grade,
        message: inquiry.message,
      }).catch(() => {});

      return res.status(201).json({ ok: true, id: inquiry._id });
    }

    if (req.method === 'GET') {
      if (!isAdminAuthorized(req)) return res.status(401).json({ error: 'Invalid admin password.' });
      const items = await Inquiry.find().sort({ createdAt: -1 }).limit(200);
      return res.status(200).json(items);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('/api/inquiry error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
