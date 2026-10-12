/**
 * Gentifi waitlist: receives the site's form and adds a row to this sheet.
 *
 * Set up (once):
 *   1. Create a Google Sheet, then Extensions > Apps Script. Paste this file in, replacing everything.
 *      If Extensions > Apps Script won't open (common with several Google accounts signed in), create
 *      a new project at script.google.com instead, and put the sheet's ID in SHEET_ID below.
 *   2. Deploy > New deployment > type "Web app".
 *      Execute as: Me. Who has access: Anyone. Deploy, and allow access when asked.
 *   3. Copy the web app URL (it ends in /exec) into the site's WaitlistForm.astro.
 * After editing this script, use Deploy > Manage deployments > Edit > New version, so the URL stays the same.
 */

// Only needed for a standalone script: the long ID in the sheet's address, between /d/ and /edit
const SHEET_ID = '';
const SHEET_NAME = 'Waitlist';
const HEADERS = ['Received', 'Name', 'Email', 'Role', 'Business', 'Postcode area', 'Page'];
const ROLES = ['business', 'farm', 'developer', 'customer', 'organiser'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Bots fill in the hidden "website" field; tell them it worked and keep nothing
  if (p.website) return json({ ok: true });

  const name = clean(p.name, 100);
  const email = String(p.email || '').trim().toLowerCase().slice(0, 200);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'Please give your name and a valid email address.' });
  }
  const role = ROLES.indexOf(p.role) >= 0 ? p.role : 'business';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const rows = sheet.getLastRow() - 1;
    const known = rows > 0 ? sheet.getRange(2, 3, rows, 1).getValues().map((r) => String(r[0]).toLowerCase()) : [];
    if (known.indexOf(email) < 0) {
      sheet.appendRow([new Date(), name, email, role, clean(p.business, 120), clean(p.postcode, 8).toUpperCase(), clean(p.page, 200)]);
    }
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

function doGet() {
  return ContentService.createTextOutput('The Gentifi waitlist is working. Sign up at gentifi.com.');
}

/** Plain text only: no line breaks, and nothing a spreadsheet would run as a formula. */
function clean(value, max) {
  const text = String(value || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function getSheet() {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
