/**
 * PI & QA Non-MMB RR Audit — Web App
 *
 * Deploy as: Web App
 *   Execute as: Me
 *   Who has access: Anyone within [your org]
 *
 * On first submission a Google Sheet is created in your Drive to store responses.
 */

var SHEET_NAME = "Audit Responses";

// ─── WEB APP ENTRY ────────────────────────────────────────────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("PI & QA Non-MMB RR Audit")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── FORM SUBMISSION ──────────────────────────────────────────────────────────

function processForm(data) {
  try {
    var ss = _getOrCreateSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Write headers if this is the first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(_getHeaders());
      sheet.getRange(1, 1, 1, _getHeaders().length)
        .setFontWeight("bold")
        .setBackground("#4a4a8a")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    var row = _buildRow(data);
    sheet.appendRow(row);

    return {
      success: true,
      sheetUrl: ss.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function _getOrCreateSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty("RESPONSE_SHEET_ID");

  if (ssId) {
    try { return SpreadsheetApp.openById(ssId); } catch (e) { /* stale id */ }
  }

  var ss = SpreadsheetApp.create("PI & QA Audit Responses");
  props.setProperty("RESPONSE_SHEET_ID", ss.getId());
  return ss;
}

function _getHeaders() {
  return [
    "Submitted At",
    // Record Details
    "RR ID", "Wallet ID", "Member User ID", "Alegeus ID", "Client", "ORG ID",
    "Wallet Type", "Claim Amount", "Total Paid Amount", "Correct Paid Amount",
    "Total Errored Dollars", "Over/Under", "Population Month", "Audit Month",
    "Admin Link", "Auditor", "Audit Date",
    // Classification
    "Audit Type", "Feedback Only",
    // Step 1
    "S1-Q1 Wallet Green", "S1-Q2 Member Active", "S1-Q3 Service Date Eligible",
    "S1-Q4 Run-Out Period", "S1 Overall", "S1 Error Codes",
    // Step 2
    "S2-Q1 Claimant Eligible", "S2-Q2 Alegeus Dependents Check", "S2-Q3 Name Match",
    "S2 Overall", "S2 Error Codes",
    // Step 3
    "S3-Q1 DOS Legible", "S3-Q1b DOS Submission Window", "S3-Q2 Provider Name",
    "S3-Q2b Access to Care INN", "S3-Q3 Patient Name", "S3-Q4 Service Description",
    "S3-Q5 Amount Match", "S3-Q6 Proof of Payment", "S3-Q7 Non-HSA/FSA Source",
    "S3-Q8 Alegeus Doc Match", "S3 Overall", "S3 Error Codes",
    // Step 4
    "S4-Q1 LMN Required", "S4-Q2 LMN Attached", "S4-Q3 LMN Patient Signature",
    "S4-Q4 LMN Diagnosis", "S4-Q5 LMN Treatment Description", "S4-Q6 LMN Itemization",
    "S4-Q7 LMN Treatment Dates", "S4-Q8 LMN Alleviation Description",
    "S4-Q9 LMN License Number", "S4-Q10 LMN Provider Signed", "S4 Overall", "S4 Error Codes",
    // Step 5
    "S5-Q1 Surrogacy Docs", "S5-Q2 Adoption Docs", "S5-Q3 Donor Docs",
    "S5-Q4 Legal Doc Both Systems", "S5 Overall", "S5 Error Codes",
    // Step 6
    "S6-Q1 HDHP Account", "S6-Q2 Annual Election Amount", "S6-Q3 Deductible Standing",
    "S6-Q4 Approved Amount Match", "S6-Q5 Sub-State DTR", "S6 Overall", "S6 Error Codes",
    // Step 7
    "S7-Q1 Storage Claim", "S7-Q2 Storage Type", "S7-Q3 Storage Start Date",
    "S7-Q4 Pro-Rate Applied", "S7 Overall", "S7 Error Codes",
    // Step 8
    "S8-Q1 Expense Eligible", "S8-Q2 Account Bucket", "S8-Q3 Wallet Amounts",
    "S8-Q4 SCC Code", "S8-Q5 International USD Conversion", "S8 Overall", "S8 Error Codes",
    // Step 9
    "S9-Q1 Approval/Denial Accurate", "S9 Total Paid Amount", "S9 Correct Paid Amount",
    "S9 Total Errored Dollars", "S9 Over/Under", "S9-Q2 Denial Code Accurate",
    "S9 Overall", "S9 Error Codes",
    // Step 10
    "S10-Q1 Sub-State Match", "S10-Q2 Reimbursed to Member", "S10 Overall", "S10 Error Codes",
    // Step 11
    "S11-Q1 Reimbursement Method", "S11-Q2 Method Correct Both Systems", "S11 Overall", "S11 Error Codes",
    // Outcome
    "Failed Steps", "Failed Questions", "Error Codes Summary", "Total Errored Dollars (Outcome)",
    "Defect Type", "Overall Verdict",
    // Comments
    "What Was Wrong", "What It Should Be", "Where to Find Support", "Additional Notes"
  ];
}

function _buildRow(d) {
  return [
    new Date(),
    d.rrId, d.walletId, d.memberUserId, d.alegeusId, d.client, d.orgId,
    d.walletType, d.claimAmount, d.totalPaidAmount, d.correctPaidAmount,
    d.totalErroredDollars, d.overUnder, d.populationMonth, d.auditMonth,
    d.adminLink, d.auditor, d.auditDate,
    d.auditType, d.feedbackOnly,
    d.s1q1, d.s1q2, d.s1q3, d.s1q4, d.s1Overall, _join(d.s1ErrorCodes),
    d.s2q1, d.s2q2, d.s2q3, d.s2Overall, _join(d.s2ErrorCodes),
    d.s3q1, d.s3q1b, d.s3q2, d.s3q2b, d.s3q3, d.s3q4, d.s3q5, d.s3q6, d.s3q7,
    d.s3q8, d.s3Overall, _join(d.s3ErrorCodes),
    d.s4q1, d.s4q2, d.s4q3, d.s4q4, d.s4q5, d.s4q6, d.s4q7, d.s4q8, d.s4q9,
    d.s4q10, d.s4Overall, _join(d.s4ErrorCodes),
    d.s5q1, d.s5q2, d.s5q3, d.s5q4, d.s5Overall, _join(d.s5ErrorCodes),
    d.s6q1, d.s6q2, d.s6q3, d.s6q4, d.s6q5, d.s6Overall, _join(d.s6ErrorCodes),
    d.s7q1, d.s7q2, d.s7q3, d.s7q4, d.s7Overall, _join(d.s7ErrorCodes),
    d.s8q1, d.s8q2, d.s8q3, d.s8q4, d.s8q5, d.s8Overall, _join(d.s8ErrorCodes),
    d.s9q1, d.s9TotalPaid, d.s9CorrectPaid, d.s9TotalErrored, d.s9OverUnder,
    d.s9q2, d.s9Overall, _join(d.s9ErrorCodes),
    d.s10q1, d.s10q2, d.s10Overall, _join(d.s10ErrorCodes),
    d.s11q1, d.s11q2, d.s11Overall, _join(d.s11ErrorCodes),
    d.failedSteps, d.failedQuestions, d.errorCodesSummary, d.outcomeErroredDollars,
    _join(d.defectType), d.overallVerdict,
    d.whatWasWrong, d.whatItShouldBe, d.whereToFindSupport, d.additionalNotes
  ];
}

function _join(val) {
  if (!val) return "";
  if (Array.isArray(val)) return val.join(", ");
  return val;
}
