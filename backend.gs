
/**
 * Syifamili Backend v21.0 - PERSISTENT DATA CLOUD
 * Simpan kode ini di menu "Extensions" -> "Apps Script" pada Spreadsheet Anda.
 */

const DRIVE_FOLDER_ID = '1Xy-mXJm0Xy-mXJm0Xy-mXJm0Xy-mXJm'; // Ganti dengan ID folder Google Drive Anda

const DATABASE_SCHEMA = {
  'members': ['id', 'name', 'relation', 'birthDate', 'bloodType', 'photoUrl', 'isElderly', 'isChild', 'nik', 'insuranceNumber', 'insuranceCardUrl', 'allergies'],
  'records': ['id', 'memberId', 'title', 'dateTime', 'type', 'description', 'diagnosis', 'saran', 'obat', 'doctorName', 'facility', 'files', 'temperature', 'systolic', 'diastolic', 'heartRate', 'oxygen'], 
  'appointments': ['id', 'memberId', 'title', 'dateTime', 'doctor', 'location', 'reminded'],
  'meds': ['id', 'memberId', 'name', 'dosage', 'frequency', 'instructions', 'nextTime', 'active', 'fileUrl', 'fileName'],
  'growthLogs': ['id', 'memberId', 'dateTime', 'weight', 'height', 'headCircumference'],
  'vitalLogs': ['id', 'memberId', 'dateTime', 'heartRate', 'systolic', 'diastolic', 'temperature', 'oxygen'],
  'homeCareLogs': ['id', 'memberId', 'title', 'active', 'entries'], 
  'notes': ['id', 'memberId', 'date', 'dateTime', 'text', 'type'],
  'contacts': ['id', 'name', 'type', 'phone', 'address', 'gmapsUrl']
};

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  
  Object.keys(DATABASE_SCHEMA).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result[sheetName] = [];
      return;
    }
    const values = sheet.getDataRange().getDisplayValues(); 
    if (values.length <= 1) {
      result[sheetName] = [];
      return;
    }
    const headers = values[0];
    result[sheetName] = values.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        let val = row[index];
        // Autodetect JSON strings
        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
          try { val = JSON.parse(val); } catch(err) { }
        }
        obj[header] = val;
      });
      return obj;
    });
  });
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (lock.tryLock(30000)) {
      const request = JSON.parse(e.postData.contents);
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      
      if (request.action === 'saveAll') {
        const payload = request.payload;
        Object.keys(DATABASE_SCHEMA).forEach(sheetName => {
          let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
          const headers = DATABASE_SCHEMA[sheetName];
          
          if (payload.hasOwnProperty(sheetName)) {
            const dataRows = payload[sheetName] || [];
            sheet.clearContents();
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            
            if (dataRows.length > 0) {
              const formattedRows = dataRows.map(item => headers.map(h => {
                let val = item[h];
                if (val === undefined || val === null) return '';
                let s = (typeof val === 'object') ? JSON.stringify(val) : val.toString();
                return "'" + s; // Force string to prevent auto-formatting errors
              }));
              sheet.getRange(2, 1, formattedRows.length, headers.length).setValues(formattedRows);
            }
          }
        });
        
        SpreadsheetApp.flush();
        return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      if (request.action === 'upload') {
        const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        const blob = Utilities.newBlob(Utilities.base64Decode(request.base64), request.mimeType, request.fileName);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'success', 
          url: 'https://lh3.googleusercontent.com/d/' + file.getId()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Sync lock error' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
