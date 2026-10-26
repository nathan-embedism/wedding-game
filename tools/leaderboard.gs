// Google Apps Script for the optional leaderboard.
// Works as a standalone project (script.google.com > New project), so no spreadsheet setup is needed:
// it creates its own "Vows Please scores" sheet in your Drive on the first request.
// Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
// Put the web app URL into LEADERBOARD_URL in src/game.js and rebuild.
function scoresSheet() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('sheetId');
  let ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('Vows Please scores');
    props.setProperty('sheetId', ss.getId());
  }
  return ss.getSheetByName('Scores') || ss.insertSheet('Scores');
}
function doGet(e) {
  const sh = scoresSheet();
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
