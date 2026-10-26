// Google Apps Script for the optional leaderboard.
// 1. Create a Google Sheet. 2. Extensions > Apps Script, paste this file in.
// 3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
// 4. Put the web app URL into LEADERBOARD_URL in src/game.js and rebuild.
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Scores') || ss.insertSheet('Scores');
  const p = (e && e.parameter) || {};
  if (p.action === 'submit') {
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      sh.appendRow([new Date(), String(p.name || '').slice(0, 20), String(p.character || '').slice(0, 20),
        Math.max(0, Math.min(1000, Number(p.score) || 0)), Number(p.max) || 0, Number(p.mins) || 0]);
    } finally { lock.releaseLock(); }
  }
  const rows = sh.getDataRange().getValues().filter(r => r[0] instanceof Date && r[1] !== '');
  rows.sort((a, b) => b[3] - a[3]);
  const top = rows.slice(0, 10).map(r => ({ name: r[1], character: r[2], score: r[3], max: r[4], mins: r[5] }));
  return ContentService.createTextOutput(JSON.stringify({ top })).setMimeType(ContentService.MimeType.JSON);
}
