/**
 * PaisaTrack — Google Sheets data API
 * Spreadsheet: 1IQwbDOfB_Ffu89w16mv_Xl4MIvpRD2V8_li8XJuFcRg
 * Setup: paste into Extensions > Apps Script, save, Deploy > New deployment > Web app.
 * Run as: Me. Restrict access to the smallest audience Google offers for your use.
 * IMPORTANT: This endpoint has no user authentication. Public access means anyone
 * who obtains the deployment URL can read/write the ledger. Prefer an authenticated
 * backend for private financial data; never put API secrets in the frontend.
 */
const SPREADSHEET_ID = '1IQwbDOfB_Ffu89w16mv_Xl4MIvpRD2V8_li8XJuFcRg';
const SHEET_NAME = 'Transactions';
const HEADERS = ['id','date','item','amount','type','person','category','paidBy','notes','createdAt','updatedAt'];

function doGet() { return output_({ok:true,service:'PaisaTrack Sheets API',spreadsheetId:SPREADSHEET_ID,actions:['ping','list','upsert','delete']}); }
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const payload = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : '{}');
    const action = String(payload.action || 'ping');
    if (action === 'ping') return output_({ok:true,message:'PaisaTrack is connected to Google Sheets.'});
    const sheet = sheet_();
    if (action === 'list') return output_({ok:true,expenses:read_(sheet)});
    if (action === 'upsert') {
      const item = payload.expense;
      if (!item || !item.id) throw new Error('An expense id is required.');
      validate_(item); upsert_(sheet,item);
      return output_({ok:true,message:'Expense saved.',id:String(item.id)});
    }
    if (action === 'delete') {
      if (!payload.id) throw new Error('A record id is required.');
      remove_(sheet,String(payload.id));
      return output_({ok:true,message:'Expense deleted.'});
    }
    throw new Error('Unsupported action.');
  } catch (err) {
    return output_({ok:false,error:String(err && err.message ? err.message : err)});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
function sheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]); sh.setFrozenRows(1); sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#7864e9').setFontColor('#ffffff'); }
  else {
    const existing = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
    HEADERS.forEach((h,i)=>{ if (existing[i] !== h) throw new Error('Unexpected Transactions sheet columns. Keep the header row unchanged or use a new tab.'); });
  }
  return sh;
}
function read_(sh) {
  const values = sh.getDataRange().getValues(); if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(r=>r[0] !== '').map(r=>{
    const obj={}; headers.forEach((h,i)=>{ const v=r[i]; obj[h]=v instanceof Date?Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd'):v; });
    obj.id=String(obj.id); obj.amount=Number(obj.amount)||0; return obj;
  });
}
function validate_(x) {
  const amount=Number(x.amount);
  if (!String(x.item||'').trim()) throw new Error('Item name cannot be empty.');
  if (!isFinite(amount) || amount <= 0 || amount > 1000000000) throw new Error('Amount is invalid.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(x.date||''))) throw new Error('Date must use YYYY-MM-DD format.');
}
function upsert_(sh,x) {
  const last=sh.getLastRow(), ids=last>1?sh.getRange(2,1,last-1,1).getDisplayValues().flat():[];
  const i=ids.findIndex(id=>String(id)===String(x.id));
  const row=HEADERS.map(h=>h==='amount'?Number(x[h]||0):(x[h]===undefined?'':x[h]));
  if(i>=0) sh.getRange(i+2,1,1,HEADERS.length).setValues([row]); else sh.appendRow(row);
}
function remove_(sh,id) {
  const last=sh.getLastRow(); if(last<2)return;
  const ids=sh.getRange(2,1,last-1,1).getDisplayValues().flat();
  for(let i=ids.length-1;i>=0;i--) if(String(ids[i])===id) sh.deleteRow(i+2);
}
function output_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
