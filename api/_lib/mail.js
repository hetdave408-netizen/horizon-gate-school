// Best-effort email sending. If SMTP env vars aren't set, this quietly does
// nothing rather than failing the request — form submissions still succeed
// and get saved to the database either way.

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMail({ to, subject, html }) {
  if (!nodemailer || !isConfigured()) {
    console.log(`[mail] SMTP not configured — skipping email "${subject}" to ${to}`);
    return { sent: false };
  }
  try {
    const transport = getTransport();
    await transport.sendMail({
      from: process.env.NOTIFY_EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('[mail] send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

async function sendInquiryEmails({ parentName, email, grade, message }) {
  const adminTo = process.env.NOTIFY_EMAIL_TO;
  await Promise.all([
    sendMail({
      to: email,
      subject: 'We received your enquiry — Horizon Gate School',
      html: `<p>Hi ${parentName},</p><p>Thanks for reaching out to Horizon Gate School${grade ? ` about ${grade}` : ''}. An admissions coordinator will call you within one business day.</p><p>&mdash; Horizon Gate Admissions</p>`,
    }),
    adminTo ? sendMail({
      to: adminTo,
      subject: `New enquiry: ${parentName}`,
      html: `<p><b>${parentName}</b> (${email})${grade ? ` — interested in ${grade}` : ''}</p><p>${message || '(no message)'}</p>`,
    }) : Promise.resolve(),
  ]);
}

async function sendVisitEmails({ parentName, studentName, email, visitDate, timeSlot }) {
  const adminTo = process.env.NOTIFY_EMAIL_TO;
  const dateStr = new Date(visitDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  await Promise.all([
    sendMail({
      to: email,
      subject: 'Your campus visit is requested — Horizon Gate School',
      html: `<p>Hi ${parentName},</p><p>We've received your visit request for <b>${studentName}</b> on <b>${dateStr}</b>, ${timeSlot}. Our admissions office will call to confirm within 24 hours.</p><p>&mdash; Horizon Gate Admissions</p>`,
    }),
    adminTo ? sendMail({
      to: adminTo,
      subject: `New visit request: ${parentName} — ${dateStr}`,
      html: `<p><b>${parentName}</b> (${email}) requested a visit for <b>${studentName}</b> on ${dateStr}, ${timeSlot}.</p>`,
    }) : Promise.resolve(),
  ]);
}

module.exports = { sendMail, sendInquiryEmails, sendVisitEmails, isConfigured };
