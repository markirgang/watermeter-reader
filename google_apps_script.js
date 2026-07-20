/**
 * Google Apps Script - AquaMeter Manager Sync Backend
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new blank spreadsheet).
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code and paste this script.
 * 4. Change SECRET_TOKEN below to a secure, private string.
 * 5. Click Deploy > New deployment.
 * 6. Select type "Web app".
 * 7. Set:
 *    - Description: AquaMeter Sync Backend
 *    - Execute as: Me (your email)
 *    - Who has access: Anyone
 * 8. Click Deploy, authorize permissions, and copy the "Web app URL".
 * 9. Paste this URL and token into the AquaMeter App Cloud Sync Settings modal.
 */

// CHANGE THIS TOKEN to a unique, secret password.
const SECRET_TOKEN = "Herc@5100";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Auth Check
    if (!payload.token || payload.token !== SECRET_TOKEN) {
      return createJsonResponse({ success: false, error: "Unauthorized access. Invalid security token." }, 401);
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ensure Sheets exist
    let tenantsSheet = spreadsheet.getSheetByName("Tenants");
    if (!tenantsSheet) {
      tenantsSheet = spreadsheet.insertSheet("Tenants");
      // Set headers
      tenantsSheet.appendRow(["id", "building", "buildingId", "name", "company", "address", "submeter", "unitType", "rate", "initialReading", "initialDate", "currentReading", "currentDate"]);
    } else {
      const lastCol = tenantsSheet.getLastColumn();
      if (lastCol === 0) {
        tenantsSheet.appendRow(["id", "building", "buildingId", "name", "company", "address", "submeter", "unitType", "rate", "initialReading", "initialDate", "currentReading", "currentDate"]);
      } else {
        const range = tenantsSheet.getRange(1, 1, 1, lastCol);
        const headers = range.getValues()[0].map(function(h) { return h.toString().trim().toLowerCase(); });
        
        if (headers.indexOf("company") === -1) {
          const nameIndex = tenantsSheet.getRange(1, 1, 1, tenantsSheet.getLastColumn()).getValues()[0].map(function(h) { return h.toString().trim().toLowerCase(); }).indexOf("name");
          if (nameIndex !== -1) {
            tenantsSheet.insertColumnAfter(nameIndex + 1);
            tenantsSheet.getRange(1, nameIndex + 2).setValue("company");
          } else {
            tenantsSheet.getRange(1, tenantsSheet.getLastColumn() + 1).setValue("company");
          }
        }
        
        const headersUpdated = tenantsSheet.getRange(1, 1, 1, tenantsSheet.getLastColumn()).getValues()[0].map(function(h) { return h.toString().trim().toLowerCase(); });
        if (headersUpdated.indexOf("buildingid") === -1) {
          const buildingIndex = headersUpdated.indexOf("building");
          if (buildingIndex !== -1) {
            tenantsSheet.insertColumnAfter(buildingIndex + 1);
            tenantsSheet.getRange(1, buildingIndex + 2).setValue("buildingId");
          } else {
            tenantsSheet.getRange(1, tenantsSheet.getLastColumn() + 1).setValue("buildingId");
          }
        }
      }
    }
    
    let readingsSheet = spreadsheet.getSheetByName("Readings");
    if (!readingsSheet) {
      readingsSheet = spreadsheet.insertSheet("Readings");
      // Set headers
      readingsSheet.appendRow(["id", "tenantId", "date", "unitType", "prevReading", "currReading", "consumed", "rate", "cost", "comments"]);
    }
    
    // Handle Deletions
    if (payload.deletedIds && payload.deletedIds.length > 0) {
      const deletedSet = new Set(payload.deletedIds);
      deleteRowsById(tenantsSheet, deletedSet);
      deleteRowsById(readingsSheet, deletedSet);
    }
    
    // Sync Tenants
    if (payload.tenants && payload.tenants.length > 0) {
      syncRecords(tenantsSheet, payload.tenants, [
        "id", "building", "buildingId", "name", "company", "address", "submeter", "unitType", "rate", "initialReading", "initialDate", "currentReading", "currentDate"
      ]);
    }
    
    // Sync Readings
    if (payload.readings && payload.readings.length > 0) {
      syncRecords(readingsSheet, payload.readings, [
        "id", "tenantId", "date", "unitType", "prevReading", "currReading", "consumed", "rate", "cost", "comments"
      ]);
    }
    
    // Read and return all data
    const allTenants = readAllRecords(tenantsSheet);
    const allReadings = readAllRecords(readingsSheet);
    
    return createJsonResponse({
      success: true,
      tenants: allTenants,
      readings: allReadings
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() }, 500);
  }
}

function doGet(e) {
  try {
    const token = e.parameter.token;
    if (!token || token !== SECRET_TOKEN) {
      return createJsonResponse({ success: false, error: "Unauthorized access." }, 401);
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const tenantsSheet = spreadsheet.getSheetByName("Tenants");
    const readingsSheet = spreadsheet.getSheetByName("Readings");
    
    const allTenants = tenantsSheet ? readAllRecords(tenantsSheet) : [];
    const allReadings = readingsSheet ? readAllRecords(readingsSheet) : [];
    
    return createJsonResponse({
      success: true,
      tenants: allTenants,
      readings: allReadings
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() }, 500);
  }
}

function deleteRowsById(sheet, deletedSet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  
  // Iterate backwards to not mess up row index while deleting
  for (let i = values.length - 1; i >= 0; i--) {
    const id = values[i][0];
    if (deletedSet.has(id)) {
      sheet.deleteRow(i + 2); // 1-indexed, +2 since we started at row 2
    }
  }
}

function syncRecords(sheet, records, headers) {
  const lastRow = sheet.getLastRow();
  let existingIds = {};
  
  if (lastRow >= 2) {
    const range = sheet.getRange(2, 1, lastRow - 1, 1);
    const values = range.getValues();
    values.forEach((val, index) => {
      existingIds[val[0]] = index + 2; // store row index (2-based)
    });
  }
  
  records.forEach(rec => {
    const rowData = headers.map(h => rec[h] !== undefined ? rec[h] : "");
    const rowIdx = existingIds[rec.id];
    
    if (rowIdx) {
      // Update existing row
      sheet.getRange(rowIdx, 1, 1, headers.length).setValues([rowData]);
    } else {
      // Append new row
      sheet.appendRow(rowData);
    }
  });
}

function readAllRecords(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  return values.map(row => {
    const obj = {};
    headers.forEach((h, index) => {
      let val = row[index];
      // Convert dates to ISO strings if they are Date objects
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      // Parse numbers
      if (h === 'rate' || h === 'initialReading' || h === 'currentReading' || h === 'prevReading' || h === 'currReading' || h === 'consumed' || h === 'cost') {
        val = parseFloat(val) || 0;
      }
      obj[h] = val;
    });
    return obj;
  });
}

function createJsonResponse(data, status = 200) {
  const jsonStr = JSON.stringify(data);
  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}
