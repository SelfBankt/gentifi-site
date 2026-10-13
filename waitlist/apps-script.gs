/**
 * Gentifi waitlist and business sign-ups: receives the site's forms and adds a row to this sheet.
 * The waitlist goes to the "Waitlist" tab; the business sign-up form (gentifi.com/join) goes to
 * "Sign-ups", and emails you each time someone signs up.
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

const SIGNUPS_NAME = 'Sign-ups';
const SIGNUP_HEADERS = ['Received', 'Business', 'Kind', 'Contact name', 'Email', 'Phone', 'Website', 'Street', 'Town', 'Postcode',
  'Opening hours', 'Orders', 'Orders go to', 'Product list link', 'Products', 'Notes', 'Page'];
const ORDER_METHODS = {
  email: 'Customers email to reserve or order',
  phone: 'Customers phone to reserve or order',
  shop: 'Online shop',
  booking: 'Booking system',
  none: 'No orders ahead: customers visit',
};
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
// Who gets an email for each sign-up: blank means the account that deployed this script
const NOTIFY = '';

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Bots fill in the hidden "trap" or "website" field; tell them it worked and keep nothing
  if (p.trap || (p.form !== 'signup' && p.website)) return json({ ok: true });
  if (p.form === 'signup') return signUp(p);

  const name = clean(p.name, 100);
  const email = String(p.email || '').trim().toLowerCase().slice(0, 200);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'Please give your name and a valid email address.' });
  }
  const role = ROLES.indexOf(p.role) >= 0 ? p.role : 'business';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet(SHEET_NAME, HEADERS);
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

/** A business signing up at gentifi.com/join. */
function signUp(p) {
  const business = clean(p.business, 120);
  const name = clean(p.name, 100);
  const email = String(p.email || '').trim().toLowerCase().slice(0, 200);
  const postcode = clean(p.postcode, 8).toUpperCase();
  const productsLink = cleanUrl(p.products_link);
  const products = cleanBlock(p.products, 20000);
  if (!business || !name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !postcode) {
    return json({ ok: false, error: 'Please give your business name, your name, a valid email address and your postcode.' });
  }
  if (!productsLink && !products) {
    return json({ ok: false, error: 'Please share your product list: a link, or paste it in.' });
  }
  if (p.consent !== 'yes') return json({ ok: false, error: 'Please tick the box to say we can use these details.' });
  const method = ORDER_METHODS[p.orders] ? p.orders : 'none';
  const ordersTo = method === 'email' ? clean(p.orders_email, 200) : method === 'phone' ? clean(p.orders_phone || p.phone, 40)
    : method === 'shop' || method === 'booking' ? cleanUrl(p.orders_url) : '';
  const row = [new Date(), business, clean(p.kind, 60), name, email, clean(p.phone, 40), cleanUrl(p.site_url), clean(p.street, 120),
    clean(p.town, 80), postcode, hours(p), ORDER_METHODS[method], ordersTo, productsLink, products, cleanBlock(p.notes, 2000), clean(p.page, 200)];

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet(SIGNUPS_NAME, SIGNUP_HEADERS).appendRow(row);
  } finally {
    lock.releaseLock();
  }
  try {
    MailApp.sendEmail(NOTIFY || Session.getEffectiveUser().getEmail(), 'New Gentifi sign-up: ' + business,
      SIGNUP_HEADERS.map((h, i) => h + ': ' + row[i]).join('\n'));
  } catch (err) {
    // The row is saved even if the email can't be sent
  }
  return json({ ok: true });
}

/** Opening hours in the toolkit's form, grouping days with the same times: "Tu-Sa 09:00-17:00; Su 10:00-14:00". */
function hours(p) {
  const time = (t) => (/^\d{2}:\d{2}$/.test(String(t || '')) ? t : '');
  const spans = [];
  DAYS.forEach((d, i) => {
    const open = time(p[d + '_open']);
    const close = time(p[d + '_close']);
    const slot = p[d + '_closed'] || !open || !close ? '' : open + '-' + close;
    const last = spans[spans.length - 1];
    if (slot && last && last.slot === slot && last.to === i - 1) last.to = i;
    else if (slot) spans.push({ from: i, to: i, slot: slot });
  });
  return spans.map((s) => DAYS[s.from] + (s.to > s.from ? '-' + DAYS[s.to] : '') + ' ' + s.slot).join('; ');
}

/** Several lines kept as they are, but nothing a spreadsheet would run as a formula. */
function cleanBlock(value, max) {
  const text = String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function cleanUrl(value) {
  const url = String(value || '').trim().slice(0, 500);
  return /^https?:\/\/\S+$/i.test(url) ? url : '';
}

/**
 * Run this once from the editor (choose it in the function list, then Run) to grant the email
 * permission and send yourself a test alert. Sign-up alerts only work after that.
 */
function sendTestEmail() {
  const to = NOTIFY || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, 'Gentifi sign-up alerts work', 'You will get an email like this each time a business signs up at gentifi.com/join.');
  Logger.log('Sent a test email to ' + to);
}

function doGet() {
  return ContentService.createTextOutput('The Gentifi waitlist is working. Sign up at gentifi.com.');
}

/** Plain text only: no line breaks, and nothing a spreadsheet would run as a formula. */
function clean(value, max) {
  const text = String(value || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function getSheet(name, headers) {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
