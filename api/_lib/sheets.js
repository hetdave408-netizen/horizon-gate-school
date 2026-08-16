// ============================================================
// Google Sheets storage for admission registrations.
//
// This runs ONLY on the server (Vercel serverless function). The
// service account credentials below are read from environment
// variables and are never sent to, or reachable from, the browser —
// there is no client-side code path that touches these values.
//
// Required env vars (set in Vercel → Project → Settings →
// Environment Variables):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL   e.g. horizon-gate@your-project.iam.gserviceaccount.com
//   GOOGLE_PRIVATE_KEY              the service account's private key (see README for
//                                    the exact copy-paste steps — newlines need escaping)
//   GOOGLE_SHEET_ID                 the ID from your Sheet's URL:
//                                    docs.google.com/spreadsheets/d/<THIS_PART>/edit
//
// Setup (see root README for full walkthrough):
//   1. Create a Google Cloud project, enable the Google Sheets API.
//   2. Create a service account, generate a JSON key.
//   3. Create a Google Sheet, share it with the service account's
//      email (the one in the JSON key) as an Editor.
//   4. Copy the three values above into Vercel's env vars.
// ============================================================

const { google } = require('googleapis');

const SHEET_TAB = 'Admission Registrations';
const HEADER_ROW = [
  'Submitted At', 'Parent Name', 'Student Name', 'Student Grade', 'Mobile',
  'Email', 'Preferred Visit Date', 'Time Slot', 'Number of Visitors', 'Questions / Remarks',
];

function isConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEET_ID
  );
}

function getAuthClient() {
  // Private keys stored in env vars often have their real newlines
  // collapsed into literal "\n" — this restores them.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function ensureHeaderRow(sheets, spreadsheetId) {
  // Best-effort: if the tab is empty, write a header row first.
  // If this fails (e.g. tab doesn't exist yet under that exact name),
  // we let the append call below surface the real error.
  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_TAB}!A1:J1`,
    });
    if (!existing.data.values || existing.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_TAB}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADER_ROW] },
      });
    }
  } catch (err) {
    // Non-fatal — the append below will throw a clearer error if the
    // tab genuinely doesn't exist, which is the actionable case.
    console.warn('[sheets] could not verify header row:', err.message);
  }
}

async function appendRegistrationRow(fields) {
  if (!isConfigured()) {
    const err = new Error('Google Sheets is not configured (missing GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, or GOOGLE_SHEET_ID).');
    err.code = 'SHEETS_NOT_CONFIGURED';
    throw err;
  }

  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  await ensureHeaderRow(sheets, spreadsheetId);

  const row = [
    new Date().toISOString(),
    fields.parentName, fields.studentName, fields.grade, fields.mobile,
    fields.email, fields.visitDate, fields.timeSlot, fields.visitors, fields.remarks || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_TAB}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

module.exports = { appendRegistrationRow, isConfigured };
