import {
  User, HealthRecord, Request, Medicine, Expense, Notification, AuditLog,
  MedicineDispensing, PatientVisit, Referral, FollowUp, Appointment,
  MedicalSupply, StockTransaction, Supplier, Purchase,
} from '../types';

export interface ReportConfig {
  id: string;
  title: string;
  category: string;
  description: string;
}

export const reportCategories = [
  { id: 'medical', label: 'Medical Reports', icon: 'stethoscope' },
  { id: 'dental', label: 'Dental Reports', icon: 'tooth' },
  { id: 'physical', label: 'Physical Examination Reports', icon: 'heart' },
  { id: 'inventory', label: 'Inventory Reports', icon: 'package' },
  { id: 'administrative', label: 'Administrative Reports', icon: 'clipboard' },
] as const;

export const allReports: ReportConfig[] = [
  // Medical
  { id: 'medical-consultation', title: 'Medical Consultation Report', category: 'medical', description: 'Breakdown of consultations by status, role, and type' },
  { id: 'daily-treatment', title: 'Daily Treatment Report', category: 'medical', description: "Today's treatment activity and patient summary" },
  { id: 'medical-history', title: 'Medical History', category: 'medical', description: 'Patient medical history records overview' },
  { id: 'patient-visit', title: 'Patient Visit Report', category: 'medical', description: 'All patient visits with details and outcomes' },
  { id: 'first-aid', title: 'First Aid Report', category: 'medical', description: 'First aid incidents and treatments provided' },
  { id: 'medicine-issuance', title: 'Medicine Issuance Report', category: 'medical', description: 'Medicines dispensed to patients' },
  { id: 'referral', title: 'Referral Report', category: 'medical', description: 'Patient referrals and their outcomes' },
  { id: 'follow-up', title: 'Follow-up Report', category: 'medical', description: 'Patient follow-up schedules and results' },
  // Dental
  { id: 'dental-examination', title: 'Dental Examination Report', category: 'dental', description: 'Dental examination records and findings' },
  { id: 'dental-treatment', title: 'Dental Treatment Report', category: 'dental', description: 'Dental treatments performed' },
  { id: 'dental-procedure', title: 'Dental Procedure Report', category: 'dental', description: 'Specific dental procedures documented' },
  { id: 'dental-summary', title: 'Dental Summary', category: 'dental', description: 'Overall dental service summary statistics' },
  // Physical Exam
  { id: 'physical-exam', title: 'Physical Examination Report', category: 'physical', description: 'Physical examination records and results' },
  { id: 'vital-signs', title: 'Vital Signs Report', category: 'physical', description: 'Vital signs recorded during visits' },
  { id: 'medical-screening', title: 'Medical Screening Report', category: 'physical', description: 'Medical screening results and findings' },
  { id: 'fitness-assessment', title: 'Fitness Assessment Report', category: 'physical', description: 'Fitness evaluation results' },
  { id: 'further-evaluation', title: 'Further Evaluation Report', category: 'physical', description: 'Cases requiring further medical evaluation' },
  // Inventory
  { id: 'current-inventory', title: 'Current Inventory', category: 'inventory', description: 'Complete current stock listing' },
  { id: 'stock-in', title: 'Stock-In', category: 'inventory', description: 'All stock additions and purchases' },
  { id: 'stock-out', title: 'Stock-Out', category: 'inventory', description: 'All stock deductions and issuances' },
  { id: 'stock-movement', title: 'Stock Movement', category: 'inventory', description: 'Complete stock transaction history' },
  { id: 'low-stock', title: 'Low Stock', category: 'inventory', description: 'Items at or below minimum stock level' },
  { id: 'near-expiry', title: 'Near Expiry', category: 'inventory', description: 'Items expiring within 90 days' },
  { id: 'expired-medicines', title: 'Expired Medicines', category: 'inventory', description: 'All expired medicines in inventory' },
  { id: 'medicine-consumption', title: 'Medicine Consumption', category: 'inventory', description: 'Medicine consumption patterns and trends' },
  // Administrative
  { id: 'daily-summary', title: 'Daily Summary', category: 'administrative', description: 'Daily operational summary report' },
  { id: 'monthly-summary', title: 'Monthly Summary', category: 'administrative', description: 'Monthly operational summary report' },
  { id: 'annual-summary', title: 'Annual Summary', category: 'administrative', description: 'Annual operational summary report' },
  { id: 'patient-statistics', title: 'Patient Statistics', category: 'administrative', description: 'Patient demographics and visit statistics' },
  { id: 'treatment-statistics', title: 'Treatment Statistics', category: 'administrative', description: 'Treatment outcomes and service statistics' },
  { id: 'dental-statistics', title: 'Dental Statistics', category: 'administrative', description: 'Dental service utilization statistics' },
  { id: 'physical-exam-statistics', title: 'Physical Examination Statistics', category: 'administrative', description: 'Physical exam completion statistics' },
  { id: 'inventory-statistics', title: 'Inventory Statistics', category: 'inventory', description: 'Inventory turnover and stock statistics' },
];

export interface ReportData {
  title: string;
  subtitle: string;
  generatedAt: string;
  generatedBy: string;
  summary: { label: string; value: string | number; sub?: string }[];
  tableHeaders: string[];
  tableRows: (string | number)[][];
  emptyMessage?: string;
}

interface ReportContext {
  users: User[];
  healthRecords: HealthRecord[];
  requests: Request[];
  inventory: Medicine[];
  expenses: Expense[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  dispensingHistory: MedicineDispensing[];
  patientVisits: PatientVisit[];
  referrals: Referral[];
  followUps: FollowUp[];
  appointments: Appointment[];
  medicalSupplies: MedicalSupply[];
  stockTransactions: StockTransaction[];
  suppliers: Supplier[];
  purchases: Purchase[];
  generatedBy: string;
}

const fmtDate = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtDateTime = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const monthName = (m: number) => ['January','February','March','April','May','June','July','August','September','October','November','December'][m] ?? '';

export function generateReport(reportId: string, ctx: ReportContext): ReportData {
  const now = new Date();
  const generatedAt = fmtDateTime(now);
  const { generatedBy } = ctx;

  switch (reportId) {
    // ---- MEDICAL ----
    case 'medical-consultation': {
      const medReqs = ctx.requests.filter((r) => r.type === 'medical');
      const byStatus = ['pending','processing','approved','rejected','released','forwarded'].map((s) => ({
        status: s, count: medReqs.filter((r) => r.status === s).length,
      })).filter((s) => s.count > 0);
      return {
        title: 'Medical Consultation Report',
        subtitle: 'All medical consultation requests',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Consultations', value: medReqs.length },
          { label: 'Approved', value: medReqs.filter((r) => r.status === 'approved' || r.status === 'released').length },
          { label: 'Pending', value: medReqs.filter((r) => r.status === 'pending').length },
          { label: 'Rejected', value: medReqs.filter((r) => r.status === 'rejected').length },
        ],
        tableHeaders: ['Patient', 'Role', 'Description', 'Status', 'Submitted', 'Reviewed By'],
        tableRows: medReqs.map((r) => [r.userName, r.userRole ?? '—', r.description.slice(0, 50), r.status, fmtDate(r.submittedAt), r.reviewedBy ?? '—']),
        emptyMessage: 'No medical consultation records found.',
      };
    }
    case 'daily-treatment': {
      const todayStr = now.toISOString().slice(0, 10);
      const todayVisits = ctx.patientVisits.filter((v) => v.visitDate?.slice(0, 10) === todayStr);
      const todayReqs = ctx.requests.filter((r) => r.submittedAt?.slice(0, 10) === todayStr);
      return {
        title: 'Daily Treatment Report',
        subtitle: `Treatments for ${fmtDate(now)}`,
        generatedAt, generatedBy,
        summary: [
          { label: "Today's Visits", value: todayVisits.length },
          { label: "Today's Requests", value: todayReqs.length },
          { label: 'Completed', value: todayVisits.filter((v) => v.status === 'completed').length },
          { label: 'Follow-ups', value: todayVisits.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Patient', 'Complaint', 'Diagnosis', 'Treatment', 'Status', 'Time'],
        tableRows: todayVisits.map((v) => [v.patientName, v.chiefComplaint.slice(0, 40), v.diagnosis.slice(0, 40), v.treatmentProvided.slice(0, 40), v.status, fmtDate(v.visitDate)]),
        emptyMessage: 'No treatments recorded today.',
      };
    }
    case 'medical-history': {
      const active = ctx.healthRecords.filter((r) => !r.archived);
      return {
        title: 'Medical History Report',
        subtitle: 'All patient medical history records',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Records', value: ctx.healthRecords.length },
          { label: 'Active Records', value: active.length },
          { label: 'Archived', value: ctx.healthRecords.filter((r) => r.archived).length },
          { label: 'With Allergies', value: active.filter((r) => r.allergies.length > 0).length },
        ],
        tableHeaders: ['Patient', 'Role', 'Allergies', 'Conditions', 'Medications', 'Last Checkup'],
        tableRows: active.map((r) => [r.userName, r.userRole ?? '—', r.allergies.join(', ') || 'None', r.conditions.join(', ') || 'None', r.medications.join(', ') || 'None', fmtDate(r.lastCheckup)]),
        emptyMessage: 'No medical history records found.',
      };
    }
    case 'patient-visit': {
      const visits = ctx.patientVisits;
      return {
        title: 'Patient Visit Report',
        subtitle: 'All recorded patient visits',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Visits', value: visits.length },
          { label: 'Completed', value: visits.filter((v) => v.status === 'completed').length },
          { label: 'Pending', value: visits.filter((v) => v.status === 'pending').length },
          { label: 'Follow-ups', value: visits.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Patient', 'Service Type', 'Date', 'Chief Complaint', 'Diagnosis', 'Status'],
        tableRows: visits.map((v) => [v.patientName, v.serviceType, fmtDate(v.visitDate), v.chiefComplaint.slice(0, 40), v.diagnosis.slice(0, 40), v.status]),
        emptyMessage: 'No patient visits recorded.',
      };
    }
    case 'first-aid': {
      const fa = ctx.patientVisits.filter((v) => v.serviceType === 'first_aid');
      return {
        title: 'First Aid Report',
        subtitle: 'All first aid incidents and treatments',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Incidents', value: fa.length },
          { label: 'Completed', value: fa.filter((v) => v.status === 'completed').length },
          { label: 'Follow-ups Needed', value: fa.filter((v) => v.status === 'follow_up').length },
          { label: 'Pending', value: fa.filter((v) => v.status === 'pending').length },
        ],
        tableHeaders: ['Patient', 'Date', 'Chief Complaint', 'Treatment', 'Recorded By', 'Status'],
        tableRows: fa.map((v) => [v.patientName, fmtDate(v.visitDate), v.chiefComplaint.slice(0, 40), v.firstAidTreatment.slice(0, 40) || v.treatmentProvided.slice(0, 40), v.recordedBy, v.status]),
        emptyMessage: 'No first aid records found.',
      };
    }
    case 'medicine-issuance': {
      const disp = ctx.dispensingHistory;
      return {
        title: 'Medicine Issuance Report',
        subtitle: 'All medicines dispensed to patients',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Issuances', value: disp.length },
          { label: 'Unique Medicines', value: new Set(disp.map((d) => d.medicineName)).size },
          { label: 'Patients Served', value: new Set(disp.map((d) => d.patientName)).size },
          { label: 'Total Units', value: disp.reduce((s, d) => s + d.quantity, 0) },
        ],
        tableHeaders: ['Medicine', 'Patient', 'Quantity', 'Unit', 'Reason', 'Dispensed By', 'Date'],
        tableRows: disp.map((d) => [d.medicineName, d.patientName, d.quantity, d.unit, d.reason.slice(0, 30), d.dispensedBy, fmtDate(d.dispensedAt)]),
        emptyMessage: 'No medicine issuance records found.',
      };
    }
    case 'referral': {
      const refs = ctx.referrals;
      return {
        title: 'Referral Report',
        subtitle: 'All patient referrals',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Referrals', value: refs.length },
          { label: 'Pending', value: refs.filter((r) => r.status === 'pending').length },
          { label: 'Accepted', value: refs.filter((r) => r.status === 'accepted').length },
          { label: 'Completed', value: refs.filter((r) => r.status === 'completed').length },
        ],
        tableHeaders: ['Patient', 'Referred To', 'Reason', 'Date', 'Referred By', 'Status', 'Result'],
        tableRows: refs.map((r) => [r.patientName, r.referredTo, r.referralReason.slice(0, 40), fmtDate(r.referralDate), r.referredBy, r.status, r.result.slice(0, 30) || '—']),
        emptyMessage: 'No referral records found.',
      };
    }
    case 'follow-up': {
      const fus = ctx.followUps;
      return {
        title: 'Follow-up Report',
        subtitle: 'All patient follow-up schedules',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Follow-ups', value: fus.length },
          { label: 'Pending', value: fus.filter((f) => f.status === 'pending').length },
          { label: 'Scheduled', value: fus.filter((f) => f.status === 'scheduled').length },
          { label: 'Completed', value: fus.filter((f) => f.status === 'completed').length },
        ],
        tableHeaders: ['Patient', 'Reason', 'Scheduled Date', 'Status', 'Result', 'Created By'],
        tableRows: fus.map((f) => [f.patientName, f.reason.slice(0, 40), fmtDate(f.scheduledDate), f.status, f.result.slice(0, 30) || '—', f.createdBy]),
        emptyMessage: 'No follow-up records found.',
      };
    }

    // ---- DENTAL ----
    case 'dental-examination': {
      const dental = ctx.patientVisits.filter((v) => v.serviceType === 'dental');
      return {
        title: 'Dental Examination Report',
        subtitle: 'All dental examination records',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Exams', value: dental.length },
          { label: 'Completed', value: dental.filter((v) => v.status === 'completed').length },
          { label: 'Pending', value: dental.filter((v) => v.status === 'pending').length },
          { label: 'Follow-ups', value: dental.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Patient', 'Date', 'Chief Complaint', 'Diagnosis', 'Treatment', 'Status'],
        tableRows: dental.map((v) => [v.patientName, fmtDate(v.visitDate), v.chiefComplaint.slice(0, 40), v.diagnosis.slice(0, 40), v.treatmentProvided.slice(0, 40), v.status]),
        emptyMessage: 'No dental examination records found.',
      };
    }
    case 'dental-treatment': {
      const dental = ctx.patientVisits.filter((v) => v.serviceType === 'dental' && v.status === 'completed');
      return {
        title: 'Dental Treatment Report',
        subtitle: 'All completed dental treatments',
        generatedAt, generatedBy,
        summary: [
          { label: 'Treatments Completed', value: dental.length },
          { label: 'Unique Patients', value: new Set(dental.map((v) => v.patientName)).size },
          { label: 'With Medicine', value: dental.filter((v) => v.medicineName).length },
          { label: 'With Follow-up', value: dental.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Patient', 'Date', 'Diagnosis', 'Treatment', 'Medicine', 'Recorded By'],
        tableRows: dental.map((v) => [v.patientName, fmtDate(v.visitDate), v.diagnosis.slice(0, 40), v.treatmentProvided.slice(0, 40), v.medicineName || '—', v.recordedBy]),
        emptyMessage: 'No dental treatment records found.',
      };
    }
    case 'dental-procedure': {
      const dental = ctx.patientVisits.filter((v) => v.serviceType === 'dental');
      return {
        title: 'Dental Procedure Report',
        subtitle: 'All dental procedures documented',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Procedures', value: dental.length },
          { label: 'Patients', value: new Set(dental.map((v) => v.patientName)).size },
          { label: 'With Diagnosis', value: dental.filter((v) => v.diagnosis).length },
          { label: 'With Treatment', value: dental.filter((v) => v.treatmentProvided).length },
        ],
        tableHeaders: ['Patient', 'Date', 'Assessment', 'Procedure/Treatment', 'Instructions', 'Status'],
        tableRows: dental.map((v) => [v.patientName, fmtDate(v.visitDate), v.assessment.slice(0, 40), v.treatmentProvided.slice(0, 40), v.instructions.slice(0, 40), v.status]),
        emptyMessage: 'No dental procedure records found.',
      };
    }
    case 'dental-summary': {
      const dental = ctx.patientVisits.filter((v) => v.serviceType === 'dental');
      const byStatus = ['completed','pending','follow_up'].map((s) => ({
        label: s.charAt(0).toUpperCase() + s.slice(1),
        count: dental.filter((v) => v.status === s).length,
      }));
      return {
        title: 'Dental Summary Report',
        subtitle: 'Overall dental service statistics',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Dental Visits', value: dental.length },
          { label: 'Completed', value: dental.filter((v) => v.status === 'completed').length },
          { label: 'Pending', value: dental.filter((v) => v.status === 'pending').length },
          { label: 'Follow-ups', value: dental.filter((v) => v.status === 'follow_up').length },
          ...byStatus.map((s) => ({ label: `${s.label}`, value: s.count })),
        ],
        tableHeaders: ['Status', 'Count', 'Percentage'],
        tableRows: byStatus.map((s) => [s.label, s.count, dental.length > 0 ? `${Math.round((s.count / dental.length) * 100)}%` : '0%']),
        emptyMessage: 'No dental service records found.',
      };
    }

    // ---- PHYSICAL EXAM ----
    case 'physical-exam': {
      const phys = ctx.patientVisits.filter((v) => v.serviceType === 'physical');
      return {
        title: 'Physical Examination Report',
        subtitle: 'All physical examination records',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Exams', value: phys.length },
          { label: 'Completed', value: phys.filter((v) => v.status === 'completed').length },
          { label: 'Pending', value: phys.filter((v) => v.status === 'pending').length },
          { label: 'Follow-ups', value: phys.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Patient', 'Date', 'Assessment', 'Diagnosis', 'Height', 'Weight', 'Status'],
        tableRows: phys.map((v) => [v.patientName, fmtDate(v.visitDate), v.assessment.slice(0, 30), v.diagnosis.slice(0, 30), v.height || '—', v.weight || '—', v.status]),
        emptyMessage: 'No physical examination records found.',
      };
    }
    case 'vital-signs': {
      const visits = ctx.patientVisits.filter((v) => v.temperature || v.bloodPressure || v.heartRate || v.respiratoryRate || v.oxygenSat);
      return {
        title: 'Vital Signs Report',
        subtitle: 'All recorded vital signs',
        generatedAt, generatedBy,
        summary: [
          { label: 'Records with Vitals', value: visits.length },
          { label: 'With BP', value: visits.filter((v) => v.bloodPressure).length },
          { label: 'With Temperature', value: visits.filter((v) => v.temperature).length },
          { label: 'With Heart Rate', value: visits.filter((v) => v.heartRate).length },
        ],
        tableHeaders: ['Patient', 'Date', 'Temp', 'BP', 'HR', 'RR', 'O2 Sat', 'Weight', 'Height'],
        tableRows: visits.map((v) => [v.patientName, fmtDate(v.visitDate), v.temperature || '—', v.bloodPressure || '—', v.heartRate || '—', v.respiratoryRate || '—', v.oxygenSat || '—', v.weight || '—', v.height || '—']),
        emptyMessage: 'No vital signs records found.',
      };
    }
    case 'medical-screening': {
      const phys = ctx.patientVisits.filter((v) => v.serviceType === 'physical');
      return {
        title: 'Medical Screening Report',
        subtitle: 'Medical screening results from physical exams',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Screenings', value: phys.length },
          { label: 'With Assessment', value: phys.filter((v) => v.assessment).length },
          { label: 'With Diagnosis', value: phys.filter((v) => v.diagnosis).length },
          { label: 'Completed', value: phys.filter((v) => v.status === 'completed').length },
        ],
        tableHeaders: ['Patient', 'Date', 'Assessment', 'Diagnosis', 'Remarks', 'Status'],
        tableRows: phys.map((v) => [v.patientName, fmtDate(v.visitDate), v.assessment.slice(0, 40), v.diagnosis.slice(0, 40), v.remarks.slice(0, 40), v.status]),
        emptyMessage: 'No medical screening records found.',
      };
    }
    case 'fitness-assessment': {
      const phys = ctx.patientVisits.filter((v) => v.serviceType === 'physical' && (v.height || v.weight));
      return {
        title: 'Fitness Assessment Report',
        subtitle: 'Fitness evaluation from physical examinations',
        generatedAt, generatedBy,
        summary: [
          { label: 'Assessments', value: phys.length },
          { label: 'With Height & Weight', value: phys.filter((v) => v.height && v.weight).length },
          { label: 'Completed', value: phys.filter((v) => v.status === 'completed').length },
          { label: 'Follow-ups', value: phys.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Patient', 'Date', 'Height', 'Weight', 'BP', 'Assessment', 'Status'],
        tableRows: phys.map((v) => [v.patientName, fmtDate(v.visitDate), v.height || '—', v.weight || '—', v.bloodPressure || '—', v.assessment.slice(0, 40), v.status]),
        emptyMessage: 'No fitness assessment records found.',
      };
    }
    case 'further-evaluation': {
      const fu = ctx.patientVisits.filter((v) => v.status === 'follow_up' || v.remarks.toLowerCase().includes('further') || v.remarks.toLowerCase().includes('refer'));
      return {
        title: 'Further Evaluation Report',
        subtitle: 'Cases requiring further medical evaluation',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Cases', value: fu.length },
          { label: 'Follow-up Status', value: fu.filter((v) => v.status === 'follow_up').length },
          { label: 'Pending', value: fu.filter((v) => v.status === 'pending').length },
          { label: 'With Referral', value: ctx.referrals.filter((r) => r.status === 'pending' || r.status === 'forwarded').length },
        ],
        tableHeaders: ['Patient', 'Date', 'Service Type', 'Diagnosis', 'Remarks', 'Status'],
        tableRows: fu.map((v) => [v.patientName, fmtDate(v.visitDate), v.serviceType, v.diagnosis.slice(0, 40), v.remarks.slice(0, 40), v.status]),
        emptyMessage: 'No cases requiring further evaluation found.',
      };
    }

    // ---- INVENTORY ----
    case 'current-inventory': {
      return {
        title: 'Current Inventory Report',
        subtitle: 'Complete medicine stock listing',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Items', value: ctx.inventory.length },
          { label: 'Total Quantity', value: ctx.inventory.reduce((s, m) => s + m.quantity, 0) },
          { label: 'Low Stock', value: ctx.inventory.filter((m) => m.quantity <= m.minStock).length },
          { label: 'Categories', value: new Set(ctx.inventory.map((m) => m.category)).size },
        ],
        tableHeaders: ['Name', 'Category', 'Quantity', 'Unit', 'Min Stock', 'Expiry Date', 'Supplier'],
        tableRows: ctx.inventory.map((m) => [m.name, m.category, m.quantity, m.unit, m.minStock, fmtDate(m.expiryDate), m.supplier]),
        emptyMessage: 'No inventory items found.',
      };
    }
    case 'stock-in': {
      const stockIn = ctx.stockTransactions.filter((t) => t.transactionType === 'stock_in' || t.transactionType === 'return');
      return {
        title: 'Stock-In Report',
        subtitle: 'All stock additions and returns',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Transactions', value: stockIn.length },
          { label: 'Total Units In', value: stockIn.reduce((s, t) => s + t.quantity, 0) },
          { label: 'Unique Items', value: new Set(stockIn.map((t) => t.itemName)).size },
          { label: 'Recorded By', value: new Set(stockIn.map((t) => t.recordedBy)).size },
        ],
        tableHeaders: ['Item', 'Type', 'Item Type', 'Quantity', 'Unit', 'Reason', 'Recorded By', 'Date'],
        tableRows: stockIn.map((t) => [t.itemName, t.transactionType, t.itemType, t.quantity, t.unit, t.reason.slice(0, 30), t.recordedBy, fmtDate(t.recordedAt)]),
        emptyMessage: 'No stock-in transactions found.',
      };
    }
    case 'stock-out': {
      const stockOut = ctx.stockTransactions.filter((t) => t.transactionType === 'stock_out' || t.transactionType === 'issuance' || t.transactionType === 'damage' || t.transactionType === 'disposal' || t.transactionType === 'expiry');
      return {
        title: 'Stock-Out Report',
        subtitle: 'All stock deductions, issuances, and disposals',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Transactions', value: stockOut.length },
          { label: 'Total Units Out', value: stockOut.reduce((s, t) => s + t.quantity, 0) },
          { label: 'Issuances', value: stockOut.filter((t) => t.transactionType === 'issuance' || t.transactionType === 'stock_out').length },
          { label: 'Damaged/Expired', value: stockOut.filter((t) => t.transactionType === 'damage' || t.transactionType === 'expiry' || t.transactionType === 'disposal').length },
        ],
        tableHeaders: ['Item', 'Type', 'Item Type', 'Quantity', 'Unit', 'Reason', 'Recorded By', 'Date'],
        tableRows: stockOut.map((t) => [t.itemName, t.transactionType, t.itemType, t.quantity, t.unit, t.reason.slice(0, 30), t.recordedBy, fmtDate(t.recordedAt)]),
        emptyMessage: 'No stock-out transactions found.',
      };
    }
    case 'stock-movement': {
      const all = ctx.stockTransactions;
      return {
        title: 'Stock Movement Report',
        subtitle: 'Complete stock transaction history',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Transactions', value: all.length },
          { label: 'Stock-In', value: all.filter((t) => t.transactionType === 'stock_in' || t.transactionType === 'return').length },
          { label: 'Stock-Out', value: all.filter((t) => ['stock_out','issuance','damage','expiry','disposal'].includes(t.transactionType)).length },
          { label: 'Adjustments', value: all.filter((t) => t.transactionType === 'adjustment').length },
        ],
        tableHeaders: ['Item', 'Transaction Type', 'Item Type', 'Quantity', 'Unit', 'Reason', 'Recorded By', 'Date'],
        tableRows: all.map((t) => [t.itemName, t.transactionType, t.itemType, t.quantity, t.unit, t.reason.slice(0, 30), t.recordedBy, fmtDate(t.recordedAt)]),
        emptyMessage: 'No stock transactions found.',
      };
    }
    case 'low-stock': {
      const low = ctx.inventory.filter((m) => m.quantity <= m.minStock);
      const supplies = ctx.medicalSupplies.filter((s) => s.quantity <= s.minStock);
      return {
        title: 'Low Stock Report',
        subtitle: 'Items at or below minimum stock level',
        generatedAt, generatedBy,
        summary: [
          { label: 'Low Stock Medicines', value: low.length },
          { label: 'Low Stock Supplies', value: supplies.length },
          { label: 'Total Items', value: low.length + supplies.length },
          { label: 'Need Restocking', value: 'URGENT' },
        ],
        tableHeaders: ['Item', 'Type', 'Category', 'Current Qty', 'Unit', 'Min Stock', 'Supplier'],
        tableRows: [
          ...low.map((m) => [m.name, 'Medicine', m.category, m.quantity, m.unit, m.minStock, m.supplier]),
          ...supplies.map((s) => [s.name, 'Supply', s.category, s.quantity, s.unit, s.minStock, s.supplier]),
        ],
        emptyMessage: 'All items are sufficiently stocked.',
      };
    }
    case 'near-expiry': {
      const ninety = new Date(now); ninety.setDate(now.getDate() + 90);
      const near = ctx.inventory.filter((m) => {
        const exp = new Date(m.expiryDate);
        return exp >= now && exp <= ninety;
      });
      const nearSupplies = ctx.medicalSupplies.filter((s) => {
        const exp = new Date(s.expiryDate);
        return exp >= now && exp <= ninety;
      });
      return {
        title: 'Near Expiry Report',
        subtitle: 'Items expiring within 90 days',
        generatedAt, generatedBy,
        summary: [
          { label: 'Medicines Near Expiry', value: near.length },
          { label: 'Supplies Near Expiry', value: nearSupplies.length },
          { label: 'Total Items', value: near.length + nearSupplies.length },
          { label: 'Within 90 Days', value: 'WARNING' },
        ],
        tableHeaders: ['Item', 'Type', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Supplier'],
        tableRows: [
          ...near.map((m) => [m.name, 'Medicine', m.category, m.quantity, m.unit, fmtDate(m.expiryDate), m.supplier]),
          ...nearSupplies.map((s) => [s.name, 'Supply', s.category, s.quantity, s.unit, fmtDate(s.expiryDate), s.supplier]),
        ],
        emptyMessage: 'No items expiring within 90 days.',
      };
    }
    case 'expired-medicines': {
      const expired = ctx.inventory.filter((m) => new Date(m.expiryDate) < now);
      const expiredSupplies = ctx.medicalSupplies.filter((s) => new Date(s.expiryDate) < now);
      return {
        title: 'Expired Medicines Report',
        subtitle: 'All expired items in inventory',
        generatedAt, generatedBy,
        summary: [
          { label: 'Expired Medicines', value: expired.length },
          { label: 'Expired Supplies', value: expiredSupplies.length },
          { label: 'Total Expired', value: expired.length + expiredSupplies.length },
          { label: 'Action Needed', value: 'DISPOSE' },
        ],
        tableHeaders: ['Item', 'Type', 'Category', 'Quantity', 'Unit', 'Expiry Date', 'Supplier'],
        tableRows: [
          ...expired.map((m) => [m.name, 'Medicine', m.category, m.quantity, m.unit, fmtDate(m.expiryDate), m.supplier]),
          ...expiredSupplies.map((s) => [s.name, 'Supply', s.category, s.quantity, s.unit, fmtDate(s.expiryDate), s.supplier]),
        ],
        emptyMessage: 'No expired items found.',
      };
    }
    case 'medicine-consumption': {
      const disp = ctx.dispensingHistory;
      const byMed = new Map<string, { name: string; total: number; unit: string; count: number }>();
      disp.forEach((d) => {
        const existing = byMed.get(d.medicineId) ?? { name: d.medicineName, total: 0, unit: d.unit, count: 0 };
        existing.total += d.quantity;
        existing.count += 1;
        byMed.set(d.medicineId, existing);
      });
      const rows = Array.from(byMed.values()).sort((a, b) => b.total - a.total);
      return {
        title: 'Medicine Consumption Report',
        subtitle: 'Medicine consumption patterns and trends',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Issuances', value: disp.length },
          { label: 'Unique Medicines Used', value: rows.length },
          { label: 'Total Units Consumed', value: disp.reduce((s, d) => s + d.quantity, 0) },
          { label: 'Patients Served', value: new Set(disp.map((d) => d.patientName)).size },
        ],
        tableHeaders: ['Medicine', 'Total Issued', 'Unit', 'Times Dispensed', 'Avg per Issuance'],
        tableRows: rows.map((r) => [r.name, r.total, r.unit, r.count, r.count > 0 ? (r.total / r.count).toFixed(1) : '0']),
        emptyMessage: 'No medicine consumption records found.',
      };
    }

    // ---- ADMINISTRATIVE ----
    case 'daily-summary': {
      const todayStr = now.toISOString().slice(0, 10);
      const todayVisits = ctx.patientVisits.filter((v) => v.visitDate?.slice(0, 10) === todayStr);
      const todayReqs = ctx.requests.filter((r) => r.submittedAt?.slice(0, 10) === todayStr);
      const todayDisp = ctx.dispensingHistory.filter((d) => d.dispensedAt?.slice(0, 10) === todayStr);
      const todayRef = ctx.referrals.filter((r) => r.referralDate?.slice(0, 10) === todayStr);
      const todayFU = ctx.followUps.filter((f) => f.scheduledDate?.slice(0, 10) === todayStr);
      return {
        title: 'Daily Summary Report',
        subtitle: `Daily operations summary for ${fmtDate(now)}`,
        generatedAt, generatedBy,
        summary: [
          { label: 'Patient Visits', value: todayVisits.length },
          { label: 'Service Requests', value: todayReqs.length },
          { label: 'Medicines Issued', value: todayDisp.length },
          { label: 'Referrals', value: todayRef.length },
          { label: 'Follow-ups', value: todayFU.length },
        ],
        tableHeaders: ['Activity', 'Count', 'Details'],
        tableRows: [
          ['Patient Visits', todayVisits.length, `${todayVisits.filter((v) => v.status === 'completed').length} completed`],
          ['Service Requests', todayReqs.length, `${todayReqs.filter((r) => r.status === 'pending').length} pending`],
          ['Medicines Issued', todayDisp.length, `${todayDisp.reduce((s, d) => s + d.quantity, 0)} total units`],
          ['Referrals', todayRef.length, `${todayRef.filter((r) => r.status === 'pending').length} pending`],
          ['Follow-ups', todayFU.length, `${todayFU.filter((f) => f.status === 'completed').length} completed`],
        ],
        emptyMessage: 'No activity recorded today.',
      };
    }
    case 'monthly-summary': {
      const monthStr = now.toISOString().slice(0, 7);
      const mVisits = ctx.patientVisits.filter((v) => v.visitDate?.slice(0, 7) === monthStr);
      const mReqs = ctx.requests.filter((r) => r.submittedAt?.slice(0, 7) === monthStr);
      const mDisp = ctx.dispensingHistory.filter((d) => d.dispensedAt?.slice(0, 7) === monthStr);
      const mRef = ctx.referrals.filter((r) => r.referralDate?.slice(0, 7) === monthStr);
      const mExp = ctx.expenses.filter((e) => e.date?.slice(0, 7) === monthStr);
      return {
        title: 'Monthly Summary Report',
        subtitle: `${monthName(now.getMonth())} ${now.getFullYear()}`,
        generatedAt, generatedBy,
        summary: [
          { label: 'Patient Visits', value: mVisits.length },
          { label: 'Service Requests', value: mReqs.length },
          { label: 'Medicines Issued', value: mDisp.length },
          { label: 'Referrals', value: mRef.length },
          { label: 'Expenses', value: `₱${mExp.reduce((s, e) => s + e.amount, 0).toLocaleString('en-PH')}` },
        ],
        tableHeaders: ['Activity', 'Count', 'Details'],
        tableRows: [
          ['Patient Visits', mVisits.length, `${mVisits.filter((v) => v.status === 'completed').length} completed`],
          ['Service Requests', mReqs.length, `${mReqs.filter((r) => r.status === 'approved' || r.status === 'released').length} approved`],
          ['Medicines Issued', mDisp.length, `${mDisp.reduce((s, d) => s + d.quantity, 0)} total units`],
          ['Referrals', mRef.length, `${mRef.filter((r) => r.status === 'completed').length} completed`],
          ['Expenses', mExp.length, `₱${mExp.reduce((s, e) => s + e.amount, 0).toLocaleString('en-PH')}`],
        ],
        emptyMessage: 'No activity recorded this month.',
      };
    }
    case 'annual-summary': {
      const yearStr = String(now.getFullYear());
      const yVisits = ctx.patientVisits.filter((v) => v.visitDate?.slice(0, 4) === yearStr);
      const yReqs = ctx.requests.filter((r) => r.submittedAt?.slice(0, 4) === yearStr);
      const yDisp = ctx.dispensingHistory.filter((d) => d.dispensedAt?.slice(0, 4) === yearStr);
      const yRef = ctx.referrals.filter((r) => r.referralDate?.slice(0, 4) === yearStr);
      const yExp = ctx.expenses.filter((e) => e.date?.slice(0, 4) === yearStr);
      return {
        title: 'Annual Summary Report',
        subtitle: `Year ${now.getFullYear()}`,
        generatedAt, generatedBy,
        summary: [
          { label: 'Patient Visits', value: yVisits.length },
          { label: 'Service Requests', value: yReqs.length },
          { label: 'Medicines Issued', value: yDisp.length },
          { label: 'Referrals', value: yRef.length },
          { label: 'Total Expenses', value: `₱${yExp.reduce((s, e) => s + e.amount, 0).toLocaleString('en-PH')}` },
        ],
        tableHeaders: ['Activity', 'Count', 'Details'],
        tableRows: [
          ['Patient Visits', yVisits.length, `${yVisits.filter((v) => v.status === 'completed').length} completed`],
          ['Service Requests', yReqs.length, `${yReqs.filter((r) => r.status === 'approved' || r.status === 'released').length} approved`],
          ['Medicines Issued', yDisp.length, `${yDisp.reduce((s, d) => s + d.quantity, 0)} total units`],
          ['Referrals', yRef.length, `${yRef.filter((r) => r.status === 'completed').length} completed`],
          ['Total Expenses', yExp.length, `₱${yExp.reduce((s, e) => s + e.amount, 0).toLocaleString('en-PH')}`],
        ],
        emptyMessage: 'No activity recorded this year.',
      };
    }
    case 'patient-statistics': {
      const allPatients = ctx.patientVisits;
      const uniquePatients = new Set(allPatients.map((v) => v.patientId));
      const byRole = ['student','staff','faculty','employee'].map((role) => ({
        role, count: allPatients.filter((v) => v.patientRole === role).length,
      })).filter((r) => r.count > 0);
      return {
        title: 'Patient Statistics Report',
        subtitle: 'Patient demographics and visit statistics',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Visits', value: allPatients.length },
          { label: 'Unique Patients', value: uniquePatients.size },
          { label: 'Total Users', value: ctx.users.length },
          { label: 'Active Users', value: ctx.users.filter((u) => u.status === 'active').length },
        ],
        tableHeaders: ['Role', 'Visits', 'Percentage'],
        tableRows: byRole.map((r) => [r.role.charAt(0).toUpperCase() + r.role.slice(1), r.count, allPatients.length > 0 ? `${Math.round((r.count / allPatients.length) * 100)}%` : '0%']),
        emptyMessage: 'No patient statistics available.',
      };
    }
    case 'treatment-statistics': {
      const visits = ctx.patientVisits;
      const byService = ['medical','dental','physical','medicine','first_aid'].map((st) => ({
        st, count: visits.filter((v) => v.serviceType === st).length,
      })).filter((s) => s.count > 0);
      return {
        title: 'Treatment Statistics Report',
        subtitle: 'Treatment outcomes and service statistics',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Treatments', value: visits.length },
          { label: 'Completed', value: visits.filter((v) => v.status === 'completed').length },
          { label: 'Follow-ups', value: visits.filter((v) => v.status === 'follow_up').length },
          { label: 'Pending', value: visits.filter((v) => v.status === 'pending').length },
        ],
        tableHeaders: ['Service Type', 'Count', 'Completed', 'Follow-ups', 'Percentage'],
        tableRows: byService.map((s) => [s.st, s.count, visits.filter((v) => v.serviceType === s.st && v.status === 'completed').length, visits.filter((v) => v.serviceType === s.st && v.status === 'follow_up').length, visits.length > 0 ? `${Math.round((s.count / visits.length) * 100)}%` : '0%']),
        emptyMessage: 'No treatment statistics available.',
      };
    }
    case 'dental-statistics': {
      const dental = ctx.patientVisits.filter((v) => v.serviceType === 'dental');
      const uniquePatients = new Set(dental.map((v) => v.patientId));
      return {
        title: 'Dental Statistics Report',
        subtitle: 'Dental service utilization statistics',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Dental Visits', value: dental.length },
          { label: 'Unique Patients', value: uniquePatients.size },
          { label: 'Completed', value: dental.filter((v) => v.status === 'completed').length },
          { label: 'Follow-ups', value: dental.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Status', 'Count', 'Percentage'],
        tableRows: ['completed','pending','follow_up'].map((s) => {
          const c = dental.filter((v) => v.status === s).length;
          return [s.charAt(0).toUpperCase() + s.slice(1), c, dental.length > 0 ? `${Math.round((c / dental.length) * 100)}%` : '0%'];
        }),
        emptyMessage: 'No dental statistics available.',
      };
    }
    case 'physical-exam-statistics': {
      const phys = ctx.patientVisits.filter((v) => v.serviceType === 'physical');
      const uniquePatients = new Set(phys.map((v) => v.patientId));
      return {
        title: 'Physical Examination Statistics Report',
        subtitle: 'Physical exam completion statistics',
        generatedAt, generatedBy,
        summary: [
          { label: 'Total Exams', value: phys.length },
          { label: 'Unique Patients', value: uniquePatients.size },
          { label: 'Completed', value: phys.filter((v) => v.status === 'completed').length },
          { label: 'Follow-ups', value: phys.filter((v) => v.status === 'follow_up').length },
        ],
        tableHeaders: ['Status', 'Count', 'Percentage'],
        tableRows: ['completed','pending','follow_up'].map((s) => {
          const c = phys.filter((v) => v.status === s).length;
          return [s.charAt(0).toUpperCase() + s.slice(1), c, phys.length > 0 ? `${Math.round((c / phys.length) * 100)}%` : '0%'];
        }),
        emptyMessage: 'No physical examination statistics available.',
      };
    }
    case 'inventory-statistics': {
      const meds = ctx.inventory;
      const supplies = ctx.medicalSupplies;
      const totalQty = meds.reduce((s, m) => s + m.quantity, 0) + supplies.reduce((s, m) => s + m.quantity, 0);
      return {
        title: 'Inventory Statistics Report',
        subtitle: 'Inventory turnover and stock statistics',
        generatedAt, generatedBy,
        summary: [
          { label: 'Medicines', value: meds.length },
          { label: 'Supplies', value: supplies.length },
          { label: 'Total Quantity', value: totalQty },
          { label: 'Low Stock Items', value: meds.filter((m) => m.quantity <= m.minStock).length + supplies.filter((s) => s.quantity <= s.minStock).length },
        ],
        tableHeaders: ['Category', 'Items', 'Total Quantity', 'Low Stock', 'Expired'],
        tableRows: [
          ['Medicines', meds.length, meds.reduce((s, m) => s + m.quantity, 0), meds.filter((m) => m.quantity <= m.minStock).length, meds.filter((m) => new Date(m.expiryDate) < now).length],
          ['Supplies', supplies.length, supplies.reduce((s, m) => s + m.quantity, 0), supplies.filter((s) => s.quantity <= s.minStock).length, supplies.filter((s) => new Date(s.expiryDate) < now).length],
        ],
        emptyMessage: 'No inventory statistics available.',
      };
    }

    default:
      return {
        title: 'Unknown Report',
        subtitle: 'Report type not recognized',
        generatedAt, generatedBy,
        summary: [],
        tableHeaders: [],
        tableRows: [],
        emptyMessage: 'Report not found.',
      };
  }
}
