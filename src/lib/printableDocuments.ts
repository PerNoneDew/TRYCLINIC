import {
  User, HealthRecord, PatientVisit, Referral, FollowUp, Medicine, Expense,
  MedicineDispensing, MedicalSupply, Purchase, Supplier, StockTransaction,
} from '../types';

export interface PrintableDocConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  recordBased: boolean;
}

export const printableDocuments: PrintableDocConfig[] = [
  { id: 'health-record', title: 'Student/Employee Health Record', description: 'Complete health record for a student or employee', icon: 'heart', recordBased: true },
  { id: 'medical-treatment', title: 'Medical Treatment Record', description: 'Individual medical treatment/visit record', icon: 'stethoscope', recordBased: true },
  { id: 'dental-exam', title: 'Dental Examination & Treatment Record', description: 'Dental examination and treatment details', icon: 'tooth', recordBased: true },
  { id: 'physical-exam', title: 'Physical Examination Record', description: 'Physical examination findings and results', icon: 'activity', recordBased: true },
  { id: 'referral-followup', title: 'Referral & Follow-up Record', description: 'Referral details with follow-up information', icon: 'share', recordBased: true },
  { id: 'medicine-issuance', title: 'Medicine Issuance Record', description: 'Record of medicines dispensed to a patient', icon: 'pill', recordBased: true },
  { id: 'inventory-purchase', title: 'Inventory & Purchase Report', description: 'Current inventory with purchase summary', icon: 'package', recordBased: false },
  { id: 'dispensary-summary', title: 'Health & Dispensary Summary Report', description: 'Overall health services and dispensary summary', icon: 'clipboard', recordBased: false },
];

const escapeHtml = (s: string | undefined | null): string => {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
};

const fmtDate = (d: string | Date): string => {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return d as string;
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
};

const fmtDateTime = (d: string | Date): string => {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return d as string;
  return date.toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const baseStyles = `
  @page { size: A4; margin: 16mm 14mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; line-height: 1.6; font-size: 11pt; }
  .header { text-align: center; border-bottom: 3px double #0d9488; padding-bottom: 16px; margin-bottom: 20px; }
  .header .school { font-size: 14pt; color: #0f172a; font-weight: 700; }
  .header .subtitle { font-size: 10pt; color: #475569; margin-top: 2px; }
  .header h2 { font-size: 13pt; color: #0d9488; margin-top: 8px; font-weight: 600; letter-spacing: 0.5px; }
  .doc-info { display: flex; justify-content: space-between; font-size: 9pt; color: #475569; margin-bottom: 20px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
  .section { margin-bottom: 18px; page-break-inside: avoid; }
  .section-title { font-size: 11pt; font-weight: 700; color: #0f172a; border-left: 4px solid #0d9488; padding-left: 10px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 14px; }
  .info-grid.three { grid-template-columns: 1fr 1fr 1fr; }
  .info-grid.four { grid-template-columns: 1fr 1fr 1fr 1fr; }
  .field { font-size: 10pt; }
  .field .label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 2px; }
  .field .value { font-size: 11pt; font-weight: 600; border-bottom: 1px solid #cbd5e1; padding: 2px 4px; min-height: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 14px; }
  th { background: #0d9488; color: #ffffff; padding: 7px 10px; text-align: left; font-weight: 600; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  .notes-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; font-size: 10pt; min-height: 60px; white-space: pre-wrap; }
  .signature-block { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
  .sig-line { width: 240px; text-align: center; }
  .sig-line .line { border-top: 1px solid #1e293b; margin-bottom: 4px; margin-top: 50px; }
  .sig-line .name { font-weight: 600; font-size: 10pt; }
  .sig-line .title { font-size: 9pt; color: #64748b; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #94a3b8; text-align: center; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .summary-card { border: 1px solid #e2e8f0; border-top: 3px solid #0d9488; border-radius: 6px; padding: 12px; text-align: center; }
  .summary-card .label { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-card .value { font-size: 18pt; font-weight: 700; color: #0f172a; margin-top: 4px; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

const docHeader = (schoolName: string, title: string, subtitle: string) => `
  <div class="header">
    <div class="school">${escapeHtml(schoolName)}</div>
    <div class="subtitle">Guihulngan City, Negros Oriental, Philippines</div>
    <h2>${escapeHtml(title)}</h2>
  </div>
`;

const docInfo = (generatedAt: string, preparedBy: string, docId: string) => `
  <div class="doc-info">
    <span><strong>Generated:</strong> ${escapeHtml(generatedAt)}</span>
    <span><strong>Prepared By:</strong> ${escapeHtml(preparedBy)}</span>
    <span><strong>Document ID:</strong> ${escapeHtml(docId)}</span>
  </div>
`;

const signatures = (preparedBy: string, dateStr: string) => `
  <div class="signature-block">
    <div class="sig-line"><div class="line"></div><div class="name">${escapeHtml(preparedBy)}</div><div class="title">Prepared By</div></div>
    <div class="sig-line"><div class="line"></div><div class="name">${escapeHtml(dateStr)}</div><div class="title">Date of Issuance</div></div>
  </div>
`;

const footer = (generatedAt: string) => `
  <div class="footer">Generated electronically by HEALTH SYS SFCG on ${escapeHtml(generatedAt)}. Confidential — For internal administrative use only.</div>
`;

export interface PrintDocContext {
  schoolName: string;
  generatedBy: string;
  healthRecords: HealthRecord[];
  patientVisits: PatientVisit[];
  referrals: Referral[];
  followUps: FollowUp[];
  dispensingHistory: MedicineDispensing[];
  inventory: Medicine[];
  medicalSupplies: MedicalSupply[];
  expenses: Expense[];
  purchases: Purchase[];
  suppliers: Supplier[];
  stockTransactions: StockTransaction[];
  users: User[];
}

export function generatePrintableDoc(
  docId: string,
  recordId: string | null,
  ctx: PrintDocContext,
): string {
  const now = new Date();
  const generatedAt = fmtDateTime(now);
  const dateStr = fmtDate(now);
  const docRef = `DOC-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
  const school = ctx.schoolName || 'Saint Francis College — Guihulngan';

  switch (docId) {
    // ---- 1. Health Record ----
    case 'health-record': {
      const rec = ctx.healthRecords.find((r) => r.id === recordId);
      if (!rec) return wrapHtml('No Record Found', '<p>No health record found for the selected record.</p>', ctx);
      const user = ctx.users.find((u) => u.id === rec.userId);
      const dispHistory = ctx.dispensingHistory.filter((d) => d.patientId === rec.userId);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Full Name</div><div class="value">${escapeHtml(rec.userName)}</div></div>
            <div class="field"><div class="label">Role</div><div class="value">${escapeHtml(rec.userRole ?? '—')}</div></div>
            <div class="field"><div class="label">Department</div><div class="value">${escapeHtml(rec.department ?? '—')}</div></div>
            <div class="field"><div class="label">ID Number</div><div class="value">${escapeHtml(rec.studentId ?? rec.employeeId ?? rec.facultyId ?? '—')}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Health Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Height</div><div class="value">${escapeHtml(rec.height || '—')}</div></div>
            <div class="field"><div class="label">Weight</div><div class="value">${escapeHtml(rec.weight || '—')}</div></div>
            <div class="field"><div class="label">BMI</div><div class="value">${escapeHtml(rec.bmi ?? '—')}</div></div>
            <div class="field"><div class="label">Vision</div><div class="value">${escapeHtml(rec.vision ?? '—')}</div></div>
            <div class="field"><div class="label">Blood Type</div><div class="value">${escapeHtml(user?.dateOfBirth ? '' : '—')}</div></div>
            <div class="field"><div class="label">Dental Status</div><div class="value">${escapeHtml(rec.dentalStatus ?? '—')}</div></div>
            <div class="field"><div class="label">Last Checkup</div><div class="value">${escapeHtml(rec.lastCheckup ? fmtDate(rec.lastCheckup) : '—')}</div></div>
            <div class="field"><div class="label">Next Checkup</div><div class="value">${escapeHtml(rec.nextCheckup ? fmtDate(rec.nextCheckup) : '—')}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Allergies</div>
          <div class="notes-box">${escapeHtml(rec.allergies.length > 0 ? rec.allergies.join(', ') : 'No known allergies')}</div>
        </div>
        <div class="section">
          <div class="section-title">Medical Conditions</div>
          <div class="notes-box">${escapeHtml(rec.conditions.length > 0 ? rec.conditions.join(', ') : 'None reported')}</div>
        </div>
        <div class="section">
          <div class="section-title">Current Medications</div>
          <div class="notes-box">${escapeHtml(rec.medications.length > 0 ? rec.medications.join(', ') : 'None')}</div>
        </div>
        <div class="section">
          <div class="section-title">Emergency Contact</div>
          <div class="info-grid">
            <div class="field"><div class="label">Contact Person</div><div class="value">${escapeHtml(rec.emergencyContact ?? '—')}</div></div>
            <div class="field"><div class="label">Contact Number</div><div class="value">${escapeHtml(rec.emergencyPhone ?? '—')}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Notes</div>
          <div class="notes-box">${escapeHtml(rec.notes || '—')}</div>
        </div>
        ${dispHistory.length > 0 ? `
        <div class="section">
          <div class="section-title">Medicine Dispensing History</div>
          <table><thead><tr><th>Medicine</th><th>Quantity</th><th>Unit</th><th>Reason</th><th>Dispensed By</th><th>Date</th></tr></thead><tbody>
          ${dispHistory.map((d) => `<tr><td>${escapeHtml(d.medicineName)}</td><td>${d.quantity}</td><td>${escapeHtml(d.unit)}</td><td>${escapeHtml(d.reason)}</td><td>${escapeHtml(d.dispensedBy)}</td><td>${fmtDate(d.dispensedAt)}</td></tr>`).join('')}
          </tbody></table>
        </div>` : ''}
        ${signatures(ctx.generatedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Health Record', body, ctx);
    }

    // ---- 2. Medical Treatment Record ----
    case 'medical-treatment': {
      const visit = ctx.patientVisits.find((v) => v.id === recordId);
      if (!visit) return wrapHtml('No Record Found', '<p>No treatment record found.</p>', ctx);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Patient Name</div><div class="value">${escapeHtml(visit.patientName)}</div></div>
            <div class="field"><div class="label">Role</div><div class="value">${escapeHtml(visit.patientRole ?? '—')}</div></div>
            <div class="field"><div class="label">Department</div><div class="value">${escapeHtml(visit.department ?? '—')}</div></div>
            <div class="field"><div class="label">Visit Date</div><div class="value">${fmtDate(visit.visitDate)}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Chief Complaint & Symptoms</div>
          <div class="notes-box">${escapeHtml(visit.chiefComplaint)}</div>
          <div class="notes-box" style="margin-top:8px">${escapeHtml(visit.symptoms || '—')}</div>
        </div>
        <div class="section">
          <div class="section-title">Vital Signs</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Temperature</div><div class="value">${escapeHtml(visit.temperature ?? '—')}</div></div>
            <div class="field"><div class="label">Blood Pressure</div><div class="value">${escapeHtml(visit.bloodPressure ?? '—')}</div></div>
            <div class="field"><div class="label">Heart Rate</div><div class="value">${escapeHtml(visit.heartRate ?? '—')}</div></div>
            <div class="field"><div class="label">Respiratory Rate</div><div class="value">${escapeHtml(visit.respiratoryRate ?? '—')}</div></div>
            <div class="field"><div class="label">O2 Saturation</div><div class="value">${escapeHtml(visit.oxygenSat ?? '—')}</div></div>
            <div class="field"><div class="label">Weight</div><div class="value">${escapeHtml(visit.weight ?? '—')}</div></div>
            <div class="field"><div class="label">Height</div><div class="value">${escapeHtml(visit.height ?? '—')}</div></div>
            <div class="field"><div class="label">Status</div><div class="value">${escapeHtml(visit.status)}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Assessment & Diagnosis</div>
          <div class="notes-box">${escapeHtml(visit.assessment || '—')}</div>
          <div class="notes-box" style="margin-top:8px">${escapeHtml(visit.diagnosis || '—')}</div>
        </div>
        <div class="section">
          <div class="section-title">Treatment Provided</div>
          <div class="notes-box">${escapeHtml(visit.treatmentProvided || '—')}</div>
        </div>
        ${visit.medicineName ? `
        <div class="section">
          <div class="section-title">Medicine Prescribed</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Medicine</div><div class="value">${escapeHtml(visit.medicineName)}</div></div>
            <div class="field"><div class="label">Dosage</div><div class="value">${escapeHtml(visit.dosage || '—')}</div></div>
            <div class="field"><div class="label">Quantity</div><div class="value">${visit.quantity} ${escapeHtml(visit.unit)}</div></div>
            <div class="field"><div class="label">Instructions</div><div class="value">${escapeHtml(visit.instructions || '—')}</div></div>
          </div>
        </div>` : ''}
        <div class="section">
          <div class="section-title">Remarks</div>
          <div class="notes-box">${escapeHtml(visit.remarks || '—')}</div>
        </div>
        ${signatures(visit.recordedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Medical Treatment Record', body, ctx);
    }

    // ---- 3. Dental Examination & Treatment Record ----
    case 'dental-exam': {
      const visit = ctx.patientVisits.find((v) => v.id === recordId && v.serviceType === 'dental');
      if (!visit) return wrapHtml('No Record Found', '<p>No dental examination record found.</p>', ctx);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Patient Name</div><div class="value">${escapeHtml(visit.patientName)}</div></div>
            <div class="field"><div class="label">Role</div><div class="value">${escapeHtml(visit.patientRole ?? '—')}</div></div>
            <div class="field"><div class="label">Department</div><div class="value">${escapeHtml(visit.department ?? '—')}</div></div>
            <div class="field"><div class="label">Examination Date</div><div class="value">${fmtDate(visit.visitDate)}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Chief Complaint</div>
          <div class="notes-box">${escapeHtml(visit.chiefComplaint)}</div>
        </div>
        <div class="section">
          <div class="section-title">Clinical Findings & Assessment</div>
          <div class="notes-box">${escapeHtml(visit.assessment || '—')}</div>
        </div>
        <div class="section">
          <div class="section-title">Diagnosis</div>
          <div class="notes-box">${escapeHtml(visit.diagnosis || '—')}</div>
        </div>
        <div class="section">
          <div class="section-title">Treatment Performed</div>
          <div class="notes-box">${escapeHtml(visit.treatmentProvided || '—')}</div>
        </div>
        ${visit.medicineName ? `
        <div class="section">
          <div class="section-title">Medication Prescribed</div>
          <div class="info-grid">
            <div class="field"><div class="label">Medicine</div><div class="value">${escapeHtml(visit.medicineName)}</div></div>
            <div class="field"><div class="label">Dosage</div><div class="value">${escapeHtml(visit.dosage || '—')}</div></div>
          </div>
          <div class="notes-box" style="margin-top:8px">${escapeHtml(visit.instructions || '—')}</div>
        </div>` : ''}
        <div class="section">
          <div class="section-title">Remarks</div>
          <div class="notes-box">${escapeHtml(visit.remarks || '—')}</div>
        </div>
        <div class="info-grid">
          <div class="field"><div class="label">Status</div><div class="value">${escapeHtml(visit.status)}</div></div>
          <div class="field"><div class="label">Examined By</div><div class="value">${escapeHtml(visit.recordedBy)}</div></div>
        </div>
        ${signatures(visit.recordedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Dental Examination & Treatment Record', body, ctx);
    }

    // ---- 4. Physical Examination Record ----
    case 'physical-exam': {
      const visit = ctx.patientVisits.find((v) => v.id === recordId && v.serviceType === 'physical');
      if (!visit) return wrapHtml('No Record Found', '<p>No physical examination record found.</p>', ctx);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Patient Name</div><div class="value">${escapeHtml(visit.patientName)}</div></div>
            <div class="field"><div class="label">Role</div><div class="value">${escapeHtml(visit.patientRole ?? '—')}</div></div>
            <div class="field"><div class="label">Department</div><div class="value">${escapeHtml(visit.department ?? '—')}</div></div>
            <div class="field"><div class="label">Exam Date</div><div class="value">${fmtDate(visit.visitDate)}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Vital Signs</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Temperature</div><div class="value">${escapeHtml(visit.temperature ?? '—')}</div></div>
            <div class="field"><div class="label">Blood Pressure</div><div class="value">${escapeHtml(visit.bloodPressure ?? '—')}</div></div>
            <div class="field"><div class="label">Heart Rate</div><div class="value">${escapeHtml(visit.heartRate ?? '—')}</div></div>
            <div class="field"><div class="label">Respiratory Rate</div><div class="value">${escapeHtml(visit.respiratoryRate ?? '—')}</div></div>
            <div class="field"><div class="label">O2 Saturation</div><div class="value">${escapeHtml(visit.oxygenSat ?? '—')}</div></div>
            <div class="field"><div class="label">Weight</div><div class="value">${escapeHtml(visit.weight ?? '—')}</div></div>
            <div class="field"><div class="label">Height</div><div class="value">${escapeHtml(visit.height ?? '—')}</div></div>
            <div class="field"><div class="label">Status</div><div class="value">${escapeHtml(visit.status)}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Assessment</div>
          <div class="notes-box">${escapeHtml(visit.assessment || '—')}</div>
        </div>
        <div class="section">
          <div class="section-title">Diagnosis</div>
          <div class="notes-box">${escapeHtml(visit.diagnosis || '—')}</div>
        </div>
        <div class="section">
          <div class="section-title">Recommendations / Treatment</div>
          <div class="notes-box">${escapeHtml(visit.treatmentProvided || '—')}</div>
        </div>
        <div class="section">
          <div class="section-title">Remarks</div>
          <div class="notes-box">${escapeHtml(visit.remarks || '—')}</div>
        </div>
        <div class="info-grid">
          <div class="field"><div class="label">Examined By</div><div class="value">${escapeHtml(visit.recordedBy)}</div></div>
          <div class="field"><div class="label">Date</div><div class="value">${fmtDate(visit.visitDate)}</div></div>
        </div>
        ${signatures(visit.recordedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Physical Examination Record', body, ctx);
    }

    // ---- 5. Referral & Follow-up Record ----
    case 'referral-followup': {
      const ref = ctx.referrals.find((r) => r.id === recordId);
      const fu = ctx.followUps.find((f) => f.id === recordId);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        ${ref ? `
        <div class="section">
          <div class="section-title">Referral Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Patient Name</div><div class="value">${escapeHtml(ref.patientName)}</div></div>
            <div class="field"><div class="label">Role</div><div class="value">${escapeHtml(ref.patientRole ?? '—')}</div></div>
            <div class="field"><div class="label">Department</div><div class="value">${escapeHtml(ref.department ?? '—')}</div></div>
            <div class="field"><div class="label">Referral Date</div><div class="value">${fmtDate(ref.referralDate)}</div></div>
            <div class="field"><div class="label">Referred To</div><div class="value">${escapeHtml(ref.referredTo)}</div></div>
            <div class="field"><div class="label">Referred By</div><div class="value">${escapeHtml(ref.referredBy)}</div></div>
            <div class="field"><div class="label">Status</div><div class="value">${escapeHtml(ref.status)}</div></div>
            <div class="field"><div class="label">Result Date</div><div class="value">${escapeHtml(ref.resultDate ? fmtDate(ref.resultDate) : '—')}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Referral Reason</div>
          <div class="notes-box">${escapeHtml(ref.referralReason)}</div>
        </div>
        <div class="section">
          <div class="section-title">Result</div>
          <div class="notes-box">${escapeHtml(ref.result || '—')}</div>
        </div>` : ''}
        ${fu ? `
        <div class="section">
          <div class="section-title">Follow-up Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Patient Name</div><div class="value">${escapeHtml(fu.patientName)}</div></div>
            <div class="field"><div class="label">Role</div><div class="value">${escapeHtml(fu.patientRole ?? '—')}</div></div>
            <div class="field"><div class="label">Scheduled Date</div><div class="value">${fmtDate(fu.scheduledDate)}</div></div>
            <div class="field"><div class="label">Status</div><div class="value">${escapeHtml(fu.status)}</div></div>
            <div class="field"><div class="label">Created By</div><div class="value">${escapeHtml(fu.createdBy)}</div></div>
            <div class="field"><div class="label">Result Date</div><div class="value">${escapeHtml(fu.resultDate ? fmtDate(fu.resultDate) : '—')}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Follow-up Reason</div>
          <div class="notes-box">${escapeHtml(fu.reason)}</div>
        </div>
        <div class="section">
          <div class="section-title">Result</div>
          <div class="notes-box">${escapeHtml(fu.result || '—')}</div>
        </div>` : ''}
        ${(!ref && !fu) ? '<p>No referral or follow-up record found.</p>' : ''}
        ${signatures(ctx.generatedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Referral & Follow-up Record', body, ctx);
    }

    // ---- 6. Medicine Issuance Record ----
    case 'medicine-issuance': {
      const disp = ctx.dispensingHistory.find((d) => d.id === recordId);
      if (!disp) return wrapHtml('No Record Found', '<p>No medicine issuance record found.</p>', ctx);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        <div class="section">
          <div class="section-title">Issuance Details</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Patient Name</div><div class="value">${escapeHtml(disp.patientName)}</div></div>
            <div class="field"><div class="label">Patient Role</div><div class="value">${escapeHtml(disp.patientRole)}</div></div>
            <div class="field"><div class="label">Dispensed By</div><div class="value">${escapeHtml(disp.dispensedBy)}</div></div>
            <div class="field"><div class="label">Date Issued</div><div class="value">${fmtDate(disp.dispensedAt)}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Medicine Information</div>
          <div class="info-grid four">
            <div class="field"><div class="label">Medicine Name</div><div class="value">${escapeHtml(disp.medicineName)}</div></div>
            <div class="field"><div class="label">Quantity</div><div class="value">${disp.quantity}</div></div>
            <div class="field"><div class="label">Unit</div><div class="value">${escapeHtml(disp.unit)}</div></div>
            <div class="field"><div class="label">Medicine ID</div><div class="value">${escapeHtml(disp.medicineId)}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Reason for Issuance</div>
          <div class="notes-box">${escapeHtml(disp.reason)}</div>
        </div>
        ${signatures(disp.dispensedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Medicine Issuance Record', body, ctx);
    }

    // ---- 7. Inventory & Purchase Report ----
    case 'inventory-purchase': {
      const totalInvValue = ctx.inventory.reduce((s, m) => s + m.quantity, 0);
      const totalPurchases = ctx.purchases.reduce((s, p) => s + p.totalCost, 0);
      const lowStock = [...ctx.inventory, ...ctx.medicalSupplies].filter((m: any) => m.quantity <= m.minStock);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        <div class="summary-grid">
          <div class="summary-card"><div class="label">Medicines</div><div class="value">${ctx.inventory.length}</div></div>
          <div class="summary-card"><div class="label">Supplies</div><div class="value">${ctx.medicalSupplies.length}</div></div>
          <div class="summary-card"><div class="label">Low Stock</div><div class="value">${lowStock.length}</div></div>
          <div class="summary-card"><div class="label">Total Purchases</div><div class="value">₱${totalPurchases.toLocaleString('en-PH')}</div></div>
        </div>
        <div class="section">
          <div class="section-title">Current Medicine Inventory</div>
          <table><thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Unit</th><th>Min Stock</th><th>Expiry</th><th>Supplier</th></tr></thead><tbody>
          ${ctx.inventory.map((m) => `<tr><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.category)}</td><td>${m.quantity}</td><td>${escapeHtml(m.unit)}</td><td>${m.minStock}</td><td>${fmtDate(m.expiryDate)}</td><td>${escapeHtml(m.supplier)}</td></tr>`).join('')}
          </tbody></table>
        </div>
        ${ctx.medicalSupplies.length > 0 ? `
        <div class="section">
          <div class="section-title">Medical Supplies</div>
          <table><thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Unit</th><th>Min Stock</th><th>Expiry</th><th>Supplier</th></tr></thead><tbody>
          ${ctx.medicalSupplies.map((s) => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.category)}</td><td>${s.quantity}</td><td>${escapeHtml(s.unit)}</td><td>${s.minStock}</td><td>${fmtDate(s.expiryDate)}</td><td>${escapeHtml(s.supplier)}</td></tr>`).join('')}
          </tbody></table>
        </div>` : ''}
        <div class="section">
          <div class="section-title">Purchase Records</div>
          <table><thead><tr><th>Supplier</th><th>Item</th><th>Qty</th><th>Unit Cost</th><th>Total Cost</th><th>Date</th><th>Status</th></tr></thead><tbody>
          ${ctx.purchases.map((p) => `<tr><td>${escapeHtml(p.supplierName)}</td><td>${escapeHtml(p.itemDescription)}</td><td>${p.quantity}</td><td>₱${p.unitCost.toLocaleString('en-PH')}</td><td>₱${p.totalCost.toLocaleString('en-PH')}</td><td>${fmtDate(p.purchaseDate)}</td><td>${escapeHtml(p.status)}</td></tr>`).join('')}
          </tbody></table>
        </div>
        ${signatures(ctx.generatedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Inventory & Purchase Report', body, ctx);
    }

    // ---- 8. Health & Dispensary Summary Report ----
    case 'dispensary-summary': {
      const totalVisits = ctx.patientVisits.length;
      const completedVisits = ctx.patientVisits.filter((v) => v.status === 'completed').length;
      const totalDisp = ctx.dispensingHistory.length;
      const totalRef = ctx.referrals.length;
      const totalFU = ctx.followUps.length;
      const totalExp = ctx.expenses.reduce((s, e) => s + e.amount, 0);
      const body = `
        ${docInfo(generatedAt, ctx.generatedBy, docRef)}
        <div class="summary-grid">
          <div class="summary-card"><div class="label">Total Visits</div><div class="value">${totalVisits}</div></div>
          <div class="summary-card"><div class="label">Completed</div><div class="value">${completedVisits}</div></div>
          <div class="summary-card"><div class="label">Medicines Issued</div><div class="value">${totalDisp}</div></div>
          <div class="summary-card"><div class="label">Referrals</div><div class="value">${totalRef}</div></div>
        </div>
        <div class="section">
          <div class="section-title">Services by Type</div>
          <table><thead><tr><th>Service Type</th><th>Count</th><th>Completed</th><th>Follow-ups</th></tr></thead><tbody>
          ${['medical','dental','physical','medicine','first_aid'].map((st) => {
            const visits = ctx.patientVisits.filter((v) => v.serviceType === st);
            return `<tr><td>${st.charAt(0).toUpperCase() + st.slice(1)}</td><td>${visits.length}</td><td>${visits.filter((v) => v.status === 'completed').length}</td><td>${visits.filter((v) => v.status === 'follow_up').length}</td></tr>`;
          }).join('')}
          </tbody></table>
        </div>
        <div class="section">
          <div class="section-title">Medicine Dispensing Summary</div>
          <table><thead><tr><th>Medicine</th><th>Total Dispensed</th><th>Unit</th><th>Times Issued</th></tr></thead><tbody>
          ${Array.from(new Set(ctx.dispensingHistory.map((d) => d.medicineName))).map((name) => {
            const items = ctx.dispensingHistory.filter((d) => d.medicineName === name);
            const total = items.reduce((s, d) => s + d.quantity, 0);
            return `<tr><td>${escapeHtml(name)}</td><td>${total}</td><td>${escapeHtml(items[0]?.unit ?? '')}</td><td>${items.length}</td></tr>`;
          }).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8">No dispensing records</td></tr>'}
          </tbody></table>
        </div>
        <div class="section">
          <div class="section-title">Follow-up Summary</div>
          <table><thead><tr><th>Patient</th><th>Reason</th><th>Scheduled Date</th><th>Status</th></tr></thead><tbody>
          ${ctx.followUps.slice(0, 20).map((f) => `<tr><td>${escapeHtml(f.patientName)}</td><td>${escapeHtml(f.reason.slice(0, 40))}</td><td>${fmtDate(f.scheduledDate)}</td><td>${escapeHtml(f.status)}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8">No follow-up records</td></tr>'}
          </tbody></table>
        </div>
        <div class="section">
          <div class="section-title">Financial Summary</div>
          <div class="info-grid">
            <div class="field"><div class="label">Total Expenses</div><div class="value">₱${totalExp.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div></div>
            <div class="field"><div class="label">Liquidated</div><div class="value">₱${ctx.expenses.filter((e) => e.status === 'liquidated').reduce((s, e) => s + e.amount, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div></div>
          </div>
        </div>
        ${signatures(ctx.generatedBy, dateStr)}
        ${footer(generatedAt)}
      `;
      return wrapHtml('Health & Dispensary Summary Report', body, ctx);
    }

    default:
      return wrapHtml('Unknown Document', '<p>Document type not recognized.</p>', ctx);
  }
}

function wrapHtml(title: string, body: string, ctx: PrintDocContext): string {
  const school = ctx.schoolName || 'Saint Francis College — Guihulngan';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)} — ${escapeHtml(school)}</title>
<style>${baseStyles}</style>
</head>
<body>
  ${docHeader(school, title, '')}
  ${body}
</body>
</html>`;
}
