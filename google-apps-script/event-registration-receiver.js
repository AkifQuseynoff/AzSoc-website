// Paste this code into Extensions → Apps Script from the Google Sheet that
// should receive registrations. Set the same secret in Script Properties as
// WEBHOOK_SECRET, then deploy it as a Web App.

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');

  if (!secret || payload.secret !== secret) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Event', 'Event Date', 'Location', 'Name', 'Email', 'Registered At']);
  }
  sheet.appendRow([
    payload.event.title,
    payload.event.date,
    payload.event.location || '',
    payload.registration.name,
    payload.registration.email,
    payload.registration.registered_at,
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
