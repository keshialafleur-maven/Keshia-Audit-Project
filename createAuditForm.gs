/**
 * PI & QA Non-MMB RR Audit Form Generator
 * Based on Jira template PIQ-15
 *
 * Run createAuditForm() once to generate the Google Form in your Drive.
 * Run resetAndRecreateForm() to delete and rebuild from scratch.
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
var FORM_TITLE = "PI & QA Non-MMB RR Audit";
var FORM_DESCRIPTION =
  "Audit scorecard for PI & QA Non-MMB Reimbursement Requests. " +
  "Complete all applicable steps. Gated steps (🔒) = mark N/A if gate condition is not met. " +
  "Any single Fail = Overall Fail UNLESS it is explicitly a Feedback Only question.";

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────

function createAuditForm() {
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_DESCRIPTION);
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);
  form.setShowLinkToRespondAgain(true);

  _addAuditRecordDetails(form);
  _addAuditClassification(form);
  _addStep1(form);
  _addStep2(form);
  _addStep3(form);
  _addStep4(form);
  _addStep5(form);
  _addStep6(form);
  _addStep7(form);
  _addStep8(form);
  _addStep9(form);
  _addStep10(form);
  _addStep11(form);
  _addOutcomeSummary(form);
  _addComments(form);

  Logger.log("Form created: " + form.getPublishedUrl());
  Logger.log("Edit URL: " + form.getEditUrl());
  return form;
}

function resetAndRecreateForm() {
  createAuditForm();
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function _header(form, title) {
  form.addSectionHeaderItem().setTitle(title);
}

function _pageBreak(form, title) {
  form.addPageBreakItem().setTitle(title);
}

function _text(form, label, helpText, required) {
  var item = form.addTextItem().setTitle(label);
  if (helpText) item.setHelpText(helpText);
  if (required) item.setRequired(true);
  return item;
}

function _radio(form, label, choices, helpText, required) {
  var item = form.addMultipleChoiceItem().setTitle(label).setChoiceValues(choices);
  if (helpText) item.setHelpText(helpText);
  if (required) item.setRequired(true);
  return item;
}

function _checkbox(form, label, choices, helpText, required) {
  var item = form.addCheckboxItem().setTitle(label).setChoiceValues(choices);
  if (helpText) item.setHelpText(helpText);
  if (required) item.setRequired(required || false);
  return item;
}

function _paragraph(form, label, helpText) {
  var item = form.addParagraphTextItem().setTitle(label);
  if (helpText) item.setHelpText(helpText);
  return item;
}

var PFN = ["Pass", "Fail", "N/A"];
var PF  = ["Pass", "Fail"];

function _stepOverall(form, stepNum, choices) {
  return _radio(form, "Step " + stepNum + " Overall", choices || PFN);
}

function _errorCodes(form, codes) {
  _checkbox(form, "Error Code(s) — check all that apply", codes,
    "Select only if a defect was identified in this step.");
}

// ─── SECTION 1: AUDIT RECORD DETAILS ─────────────────────────────────────────

function _addAuditRecordDetails(form) {
  _header(form, "Audit Record Details");
  var fields = [
    ["RR ID", "", true],
    ["Wallet ID", "", true],
    ["Member User ID", "", true],
    ["Alegeus ID", "", false],
    ["Client", "", true],
    ["ORG ID", "", false],
    ["Wallet Type", "", true],
    ["Claim Amount", "Dollar value of the claim", false],
    ["Total Paid Amount", "", false],
    ["Correct Paid Amount", "", false],
    ["Total Errored Dollars", "", false],
    ["Over/Under", "Enter Over, Under, or N/A", false],
    ["Population Month", "e.g. January 2025", true],
    ["Audit Month", "e.g. February 2025", true],
    ["Admin Link", "URL to the claim in Admin", false],
    ["Auditor", "Full name of the auditor", true],
    ["Audit Date", "MM/DD/YYYY", true],
  ];
  fields.forEach(function(f) { _text(form, f[0], f[1], f[2]); });
}

// ─── SECTION 2: AUDIT CLASSIFICATION ─────────────────────────────────────────

function _addAuditClassification(form) {
  _pageBreak(form, "Audit Classification");

  _radio(form, "Audit Type — select one",
    ["Baseline", "Training", "Focus"], "", true);

  _radio(form, "Feedback Only",
    ["Yes", "No"], "", true);
}

// ─── STEP 1: MEMBER WALLET STATUS & COVERAGE DATES ───────────────────────────

function _addStep1(form) {
  _pageBreak(form, "Step 1 — Member Wallet Status & Coverage Dates");
  form.addSectionHeaderItem()
    .setTitle("Was the member eligible and actively covered on the date of service?");

  _radio(form, "Q1 — Is the wallet type Green (Traditional/Non-MMB)?",
    ["Confirmed Green — continue audit", "Not Green — Flag for Sr. Analyst / Replace Sample"],
    "If not Green, this claim is out of scope — do not score Step 1 or any remaining steps.",
    true);

  _radio(form, "Q2 — Do both Admin and Alegeus show the member as Active?",
    PFN,
    "A Termination Date in Alegeus that falls after the claim was processed = Pass.");

  _radio(form, "Q3 — In Alegeus, does the claim service date fall within the member's eligibility date, before the termination date?",
    PFN);

  _radio(form, "Q4 — Does the claim received date fall within the run-out period?",
    PFN,
    "Run-out period varies by client (check PO) — some clients have none.");

  _stepOverall(form, 1, ["Pass", "Fail", "N/A — Sample Flagged for Replacement"]);

  _errorCodes(form, [
    "MEMBER_INACTIVE_IN_ADMIN_OR_ALEGEUS",
    "SERVICE_DATE_OUTSIDE_ELIGIBILITY_WINDOW",
    "CLAIM_RECEIVED_OUTSIDE_RUN_OUT_PERIOD",
  ]);
}

// ─── STEP 2: PATIENT / CLAIMANT IDENTITY ─────────────────────────────────────

function _addStep2(form) {
  _pageBreak(form, "Step 2 — Patient / Claimant Identity");
  form.addSectionHeaderItem()
    .setTitle("Is the claimant an eligible dependent or the member, and do names match exactly across systems?");

  _radio(form, "Q1 — Is the claimant listed as eligible (member or listed dependent) in Admin?",
    PFN,
    "Per the client PO: Member Only or Covers Dependents (see Eligibility section).");

  _radio(form, "Q2 — Before denying a name mismatch, has the patient been confirmed in the Alegeus Dependents tab?",
    PFN);

  _radio(form, "Q3 — Do the claimant names in Admin and Alegeus match exactly?",
    PFN);

  _stepOverall(form, 2, PF);

  _errorCodes(form, [
    "CLAIMANT_NOT_ELIGIBLE",
    "NAME_MISMATCH_ADMIN_ALEGEUS",
  ]);
}

// ─── STEP 3: REQUIRED DOCUMENTATION ──────────────────────────────────────────

function _addStep3(form) {
  _pageBreak(form, "Step 3 — Required Documentation");
  form.addSectionHeaderItem()
    .setTitle("If documentation Fails but the claim was Denied Correctly for missing/incomplete documentation, this counts as an Overall Pass — tag Sr. Analyst for approval before closing.");

  _radio(form, "Q1 — Is the date of service clearly present and legible on the documentation?",
    PFN,
    "Date of Invoice is acceptable if the service date falls within the submission window.");

  _radio(form, "Q1b — Does the date of service fall within the member's active submission window?",
    PFN,
    "Separate check from eligibility — confirm the allowed submission timeframe in client PO (e.g. 365 days).");

  _radio(form, "Q2 — Is the provider name present on the documentation?",
    PFN);

  _radio(form, "Q2b 🔒 Access to Care — Is the provider an approved in-network (INN) clinic?",
    [
      "Pass — provider is a confirmed INN clinic per the network directory, OR member has a confirmed exception on the NERF Exception List",
      "Fail — provider OON & No NERF exception applied / No Longer within Exception Window",
      "N/A",
    ],
    "Gate: international client with 'Access to Care' documented in PO. If OON, check the NERF Exception List in Audit SOP before marking Fail.");

  _radio(form, "Q3 — Is the patient name present on the documentation?", PFN);

  _radio(form, "Q4 — Is a description of the service present on the documentation & is the expense/service eligible?",
    PFN,
    "If correctly denied for an ineligible service/expense, this is a Pass.");

  _radio(form, "Q5 — Does the claim amount match the amount on the documentation?",
    PFN,
    "The RR can be for less than the documented amount. If the RR is for more, approve only UP TO the documented amount.");

  _radio(form, "Q6 — Is proof of payment present and is it not a prepayment?",
    PFN,
    "Exception: Doula retainer/prepayment fees are eligible if no refund opportunity. MULTI-CYCLE PACKAGE: Conditions for refund must be met and member must provide clinic contract.");

  _radio(form, "Q7 — Was payment made with a non-HSA/FSA source?", PFN);

  _radio(form, "Q8 — Does Alegeus reflect the same documentation as Admin?", PFN);

  _stepOverall(form, 3, PF);

  _errorCodes(form, [
    "PROVIDER_NAME_MISSING",
    "DATE_OF_SERVICE_MISSING_OR_ILLEGIBLE",
    "PATIENT_NAME_MISSING",
    "SERVICE_DESCRIPTION_MISSING",
    "AMOUNT_MISSING_OR_MISMATCH",
    "PROOF_OF_SERVICE_DOCUMENT_MISSING",
    "PROOF_OF_PAYMENT_MISSING",
    "PREPAY_SERVICE_NOT_YET_RENDERED",
    "SUBMISSION_WINDOW_VIOLATION",
    "UNREADABLE_DOCUMENTATION",
    "HSA_FSA_DOUBLE_DIP",
    "DOC_MISMATCH_OR_MISSING_ALEGEUS",
    "OON_CLINIC_NO_NERF_EXCEPTION",
    "NON_ELIGIBLE_EXPENSE_OR_SERVICE",
  ]);
}

// ─── STEP 4: LETTER OF MEDICAL NECESSITY (LMN) 🔒 ────────────────────────────

function _addStep4(form) {
  _pageBreak(form, "Step 4 🔒 — Letter of Medical Necessity (LMN)");
  form.addSectionHeaderItem()
    .setTitle("Gate: LMN required per plan — international members are exempt.");

  _radio(form, "Q1 — Does the expense type require an LMN per Maven plan rules?",
    ["Yes", "No — skip to Step 4 Overall and mark N/A"],
    "Doula services require an LMN per Maven Coverage Policy.");

  _radio(form, "Q2 — Is the LMN uploaded and attached to this specific claim, and does Alegeus reflect the same document?",
    PF);

  _radio(form, "Q3 — Is the LMN signed by the patient/member?", PF);

  _radio(form, "Q4 — Is a medical condition/diagnosis documented on the LMN?", PF);

  _radio(form, "Q5 — Is a description of the recommended treatment documented on the LMN?", PF);

  _radio(form, "Q6 — If the claim is for supplements or equipment, are all items specifically named and itemized, and does reimbursement match only the listed items?",
    PFN);

  _radio(form, "Q7 — Does the LMN include explicit start and end treatment dates that cover the claim's service date and fall within the Active Plan Year?",
    PF);

  _radio(form, "Q8 — Does the LMN describe how the treatment will alleviate the diagnosed condition?", PF);

  _radio(form, "Q9 — Is the provider's license number documented on the LMN?", PF);

  _radio(form, "Q10 — Is the LMN signed by a licensed provider?", PF);

  _stepOverall(form, 4, PFN);

  _errorCodes(form, [
    "LMN_REQUIRED_NOT_PROVIDED",
    "LMN_NOT_ATTACHED_IN_ADMIN_OR_ALEGEUS",
    "LMN_PATIENT_SIGNATURE_MISSING",
    "LMN_DIAGNOSIS_MISSING",
    "LMN_TREATMENT_DESCRIPTION_MISSING",
    "LMN_ITEMIZATION_MISSING_OR_INCOMPLETE",
    "LMN_DATES_OUTSIDE_ACTIVE_PLAN_YEAR",
    "LMN_SERVICE_TREATMENT_DATES_MISSING",
    "LMN_ALLEVIATION_DESCRIPTION_MISSING",
    "LMN_PROVIDER_LICENSE_NUMBER_MISSING",
    "LMN_UNSIGNED_OR_UNLICENSED_PROVIDER",
  ]);
}

// ─── STEP 5: LEGAL DOCUMENTATION 🔒 ──────────────────────────────────────────

function _addStep5(form) {
  _pageBreak(form, "Step 5 🔒 — Legal Documentation");
  form.addSectionHeaderItem()
    .setTitle("Gate: Adoption, Surrogacy, or Donor claim. For detailed guidance refer to Client PO & Audit SOP.");

  _radio(form, "Q1 — Surrogacy: Is the required legal documentation present?", PFN);

  _radio(form, "Q2 — Adoption: Is the required legal documentation present?",
    PFN,
    "Per Program Overview: notarized decree or court order if finalization required; legal court docs if not.");

  _radio(form, "Q3 — Donor: Is the required legal documentation present?", PFN);

  _radio(form, "Q4 — Is the same legal document present in both Admin and Alegeus?", PFN);

  _stepOverall(form, 5, PFN);

  _errorCodes(form, [
    "LEGAL_DOC_MISSING_ADMIN",
    "LEGAL_DOC_MISSING_ALEGEUS",
    "WRONG_LEGAL_DOC_TYPE",
    "SURROGACY_AGENCY_CONTRACT_ONLY",
    "ADOPTION_DOC_INSUFFICIENT",
    "DONOR_AGREEMENT_MISSING",
  ]);
}

// ─── STEP 6: DTR / HDHP DEDUCTIBLE COMPLIANCE 🔒 ─────────────────────────────

function _addStep6(form) {
  _pageBreak(form, "Step 6 🔒 — DTR / HDHP Deductible Compliance");
  form.addSectionHeaderItem()
    .setTitle("Gate: DTR account exists. IRS minimums: 2025 Ind $1,650 / Fam $3,300 · 2026 Ind $1,700 / Fam $3,400");

  _radio(form, "Q1 — Does the member have an HDHP account in Admin?",
    ["Pass — HDHP confirmed", "Fail", "N/A — No DTR account, skip to Step 6 Overall"],
    "Confirm Single or Family plan. In Alegeus, confirm Type = DTR and note Plan Dates.");

  _radio(form, "Q2 — Does the Annual Election amount in Alegeus match the IRS minimum for the applicable plan type and plan year?",
    PF);

  _radio(form, "Q3 — Does the outcome of the reimbursement align with the member's current deductible standing (Disb YTD / Avail Balance) in Alegeus?",
    PF);

  _radio(form, "Q4 — Does the approved amount in Admin reflect the correct outcome per Alegeus?", PF);

  _radio(form, "Q5 — Does the claim sub-state match the DTR outcome?",
    PF,
    "Not met → APPROVED_NOT_PAYABLE · Met → APPROVED_PAYABLE");

  _stepOverall(form, 6, PFN);

  _errorCodes(form, [
    "NO_HDHP_ACCOUNT_ON_FILE",
    "ANNUAL_ELECTION_AMOUNT_INCORRECT",
    "REIMBURSEMENT_ISSUED_BEFORE_DEDUCTIBLE_MET",
    "REIMBURSEMENT_WITHHELD_DESPITE_DEDUCTIBLE_MET",
    "APPROVED_AMOUNT_MISMATCH_ADMIN_ALEGEUS",
    "SUBSTATE_MISMATCH_DTR_OUTCOME",
  ]);
}

// ─── STEP 7: STORAGE DATE & PRO-RATE CALCULATION 🔒 ──────────────────────────

function _addStep7(form) {
  _pageBreak(form, "Step 7 🔒 — Storage Date & Pro-Rate Calculation");
  form.addSectionHeaderItem().setTitle("Gate: Storage claim");

  _radio(form, "Q1 — Is this a storage claim?",
    ["Pass", "Fail", "N/A — Not a storage claim, skip to Step 7 Overall"],
    "Check SCC code and documentation.");

  _radio(form, "Q2 — Is this short-term or long-term storage?",
    ["Short-term (Fertility — 1 year or less)", "Long-term (Donor — greater than 1 year)"]);

  _radio(form, "Q3 — Is the Storage Start Date correct? Do Admin and Alegeus match?",
    PF,
    "Past date representing start of storage period, not deposit date.");

  _radio(form, "Q4 — If short-term storage and claim indicates period greater than 1 year, was pro-rating applied correctly?",
    PFN);

  _stepOverall(form, 7, PFN);

  _errorCodes(form, [
    "INCORRECT_STORAGE_START_DATE",
    "PRO_RATE_INCORRECT_OR_NOT_APPLIED",
    "STORAGE_DETAILS_MISMATCH_ADMIN_ALEGEUS",
    "STORAGE_TYPE_NOT_COVERED",
    "STORAGE_DATE_OUTSIDE_COVERAGE_PERIOD",
  ]);
}

// ─── STEP 8: EXPENSE ELIGIBILITY & SCC CODE VERIFICATION ─────────────────────

function _addStep8(form) {
  _pageBreak(form, "Step 8 — Expense Eligibility & SCC Code Verification");

  _radio(form, "Q1 — Is the expense type eligible in the client Program Overview, and do Admin and Alegeus reflect the same expense type?",
    PFN,
    "FERTILITY MONITORING 6-WEEK WINDOW applies.");

  _radio(form, "Q2 — Was the correct account bucket applied?",
    PFN,
    "Some clients have more than one wallet bucket — confirm the claim was applied to the correct bucket for this expense type. COBRA: only HRA eligible expenses.");

  _radio(form, "Q3 — Do the wallet dollar amounts configured in Admin and reflected in Alegeus match the approved benefit amounts in the client's Program Overview?",
    PFN,
    "Multi-bucket clients: confirm the relevant bucket (see Q2).");

  _radio(form, "Q4 — Has the correct SCC been applied in Admin, and does Alegeus reflect a consistent determination?",
    PFN);

  _radio(form, "Q5 — For international claims only: Does the converted USD amount in Admin and Alegeus appear reasonable and consistent with the submitted foreign currency amount?",
    PFN);

  _stepOverall(form, 8, PF);

  _errorCodes(form, [
    "INELIGIBLE_EXPENSE_APPROVED",
    "ELIGIBLE_EXPENSE_DENIED",
    "WRONG_ACCOUNT_BUCKET",
    "COBRA_INELIGIBLE_EXPENSE_APPROVED",
    "WALLET_AMOUNT_MISMATCH_ADMIN_ALEGEUS_OR_PO",
    "SCC_CODE_INCORRECT_OR_MISSING_ADMIN_OR_ALEGEUS",
    "EXPENSE_TYPE_INCORRECT_ADMIN_OR_ALEGEUS",
    "GLOBAL_RATE_CONVERSION_DISCREPANCY",
  ]);
}

// ─── STEP 9: CLAIM APPROVAL / DENIAL ACCURACY ────────────────────────────────

function _addStep9(form) {
  _pageBreak(form, "Step 9 — Claim Approval / Denial Accuracy");

  _radio(form, "Q1 — Was the claim approved or denied accurately?",
    PFN,
    "System: Admin/Alegeus");

  form.addSectionHeaderItem().setTitle("Scorecard Entry — Claim Dollar Details");
  _text(form, "Total Paid Amount", "Copy to Audit Record Details at the top");
  _text(form, "Correct Paid Amount", "Copy to Audit Record Details at the top");
  _text(form, "Total Errored Dollars", "Copy to Audit Record Details at the top");
  _text(form, "Over/Under", "Enter Over, Under, or N/A — Copy to Audit Record Details at the top");

  _radio(form, "Q2 — Feedback Only: Does the denial code or reason provided make sense based on why the claim should have been denied?",
    [
      "Pass — denial reason is accurate",
      "Feedback Only — denial reason does not match / is confusing",
      "N/A — claim was approved",
    ],
    "System: Alegeus. Note: Specific denial reason text options are not used by Peak One.");

  _stepOverall(form, 9, ["Pass", "Fail", "Feedback Only"]);

  _errorCodes(form, [
    "CLAIM_APPROVED_INCORRECTLY",
    "CLAIM_DENIED_INCORRECTLY",
    "CLAIM_APPROVAL_OR_DENIAL_MISMATCH_ADMIN_ALEGEUS",
  ]);
}

// ─── STEP 10: FINAL CLAIM SUB-STATE VERIFICATION ─────────────────────────────

function _addStep10(form) {
  _pageBreak(form, "Step 10 — Final Claim Sub-State Verification");
  form.addSectionHeaderItem().setTitle("Check Audit SOP for Valid Sub-States");

  _radio(form, "Q1 — Does the closing sub-state match the claim outcome?", PFN);

  _radio(form, "Q2 — If APPROVED_PAYABLE, has it ultimately reached REIMBURSED_TO_MEMBER?",
    ["Pass", "Flag for Sr. Analyst — approved but not yet reimbursed", "N/A"]);

  _stepOverall(form, 10, PF);

  _errorCodes(form, ["SUBSTATE_INCORRECT"]);
}

// ─── STEP 11: FUNDING TYPE REIMBURSEMENT METHOD ACCURACY ─────────────────────

function _addStep11(form) {
  _pageBreak(form, "Step 11 — Funding Type Reimbursement Method Accuracy");
  form.addSectionHeaderItem()
    .setTitle("One holistic check: confirm the configured method, then verify the claim was processed correctly in both systems.");

  _radio(form, "Q1 — What is the client's configured reimbursement method?",
    ["Direct Deposit", "Payroll", "Not documented in PO → Finding"],
    "Reference: PO");

  _radio(form, "Q2 — Does this claim reflect the correct reimbursement method in both Admin and Alegeus?",
    PFN);

  _stepOverall(form, 11, PFN);

  _errorCodes(form, [
    "FUNDING_TYPE_MISMATCH_ADMIN_ALEGEUS",
    "FUNDING_TYPE_CONFIGURED_INCORRECTLY_IN_ADMIN",
  ]);
}

// ─── OUTCOME SUMMARY ──────────────────────────────────────────────────────────

function _addOutcomeSummary(form) {
  _pageBreak(form, "Outcome Summary");

  _text(form, "What Step(s) Failed?", "e.g. Step 3, Step 8");
  _text(form, "What Question(s) Failed?", "e.g. Q1, Q4");
  _paragraph(form, "Error Codes Identified", "List all error codes from failed steps");
  _text(form, "Total Errored Dollars (Outcome)", "");

  _checkbox(form, "Defect Type — check all that apply",
    ["Procedural", "Financial"],
    "", false);

  _radio(form, "Overall Verdict",
    ["✅ PASS — Set Audit Status to Complete",
     "❌ FAIL — Set Audit Status to Blocked",
     "📢 Feedback Only"],
    "", true);
}

// ─── COMMENTS & FINDING WRITE-UP ─────────────────────────────────────────────

function _addComments(form) {
  _pageBreak(form, "Comments & Finding Write-Up");
  form.addSectionHeaderItem()
    .setTitle("On any Fail, use the 3-part format below. Attach screenshots (no PHI) or web links to documentation via the Jira ticket.");

  _paragraph(form, "What was wrong", "Describe the defect found.");
  _paragraph(form, "What it should be", "Describe the correct outcome or expected state.");
  _paragraph(form, "Where to find support",
    "SOT citation + reference to screenshot attached in Jira ticket.");
  _paragraph(form, "Additional notes", "Any other relevant context.");
}
