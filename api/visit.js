const { connectToDatabase } = require('./_lib/db');
const VisitBooking = require('./_lib/models/VisitBooking');
const { isAdminAuthorized } = require('./_lib/adminAuth');
const { sendVisitEmails } = require('./_lib/mail');

const EMAIL_RE = /^\S+@\S+\.\S+$/;

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { parentName, studentName, grade, mobile, email, visitDate, timeSlot, visitors, remarks } = req.body || {};

      if (!parentName || !studentName || !grade || !mobile || !email || !visitDate || !timeSlot) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
      const parsedDate = new Date(visitDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Please provide a valid visit date.' });
      }

      const booking = await VisitBooking.create({
        parentName: String(parentName).slice(0, 120),
        studentName: String(studentName).slice(0, 120),
        grade: String(grade).slice(0, 40),
        mobile: String(mobile).slice(0, 20),
        email: String(email).slice(0, 160),
        visitDate: parsedDate,
        timeSlot: String(timeSlot).slice(0, 40),
        visitors: Math.min(Math.max(parseInt(visitors, 10) || 2, 1), 6),
        remarks: remarks ? String(remarks).slice(0, 2000) : undefined,
      });

      sendVisitEmails({ parentName: booking.parentName, studentName: booking.studentName, email: booking.email, visitDate: booking.visitDate, timeSlot: booking.timeSlot }).catch(() => {});

      return res.status(201).json({ ok: true, id: booking._id });
    }

    if (req.method === 'GET') {
      if (!isAdminAuthorized(req)) return res.status(401).json({ error: 'Invalid admin password.' });
      const items = await VisitBooking.find().sort({ visitDate: 1 }).limit(200);
      return res.status(200).json(items);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('/api/visit error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
