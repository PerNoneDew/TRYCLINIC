import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope, Pill, HeartPulse, Package, ClipboardList,
  Printer, Eye, FileText, CalendarDays, TrendingUp, Activity,
  Users, AlertTriangle, CheckCircle, FileSpreadsheet, Bell,
  Banknote, ScrollText, Download, Search,
} from 'lucide-react';
import { ExpenseCategory, RequestType } from '../../types';
import { allReports, reportCategories, generateReport, ReportData } from '../../lib/reportGenerator';
import { printableDocuments, generatePrintableDoc } from '../../lib/printableDocuments';
import { printHtml } from '../../lib/print';
import { Share2, Smile, FileSignature } from 'lucide-react';

const categoryIconMap: Record<string, React.ElementType> = {
  stethoscope: Stethoscope,
  tooth: Smile,
  heart: HeartPulse,
  package: Package,
  clipboard: ClipboardList,
  activity: Activity,
  share: Share2,
};

const categoryColors: Record<string, { icon: string; bg: string; border: string; btn: string }> = {
  medical: { icon: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', btn: 'bg-teal-500 hover:bg-teal-600' },
  dental: { icon: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', btn: 'bg-sky-500 hover:bg-sky-600' },
  physical: { icon: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', btn: 'bg-rose-500 hover:bg-rose-600' },
  inventory: { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', btn: 'bg-amber-500 hover:bg-amber-600' },
  administrative: { icon: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', btn: 'bg-violet-500 hover:bg-violet-600' },
};

function escapeCsv(value: string | number | undefined | null): string {
  const s = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, rows: (string | number | undefined | null)[][]): void {
  const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const categoryLabels: Record<ExpenseCategory, string> = {
  medicines: 'Medicines', equipment: 'Equipment', supplies: 'Supplies', services: 'Services', other: 'Other',
};
const requestTypeLabels: Record<RequestType, string> = {
  medical: 'Medical', dental: 'Dental', physical: 'Physical Exam', medicine: 'Medicine', first_aid: 'First Aid',
};
const catColors: Record<ExpenseCategory, string> = {
  medicines: 'bg-teal-400', equipment: 'bg-sky-400', supplies: 'bg-amber-400', services: 'bg-rose-400', other: 'bg-slate-400',
};
const statusColors: Record<string, string> = {
  approved: 'bg-emerald-400', processing: 'bg-sky-400', pending: 'bg-amber-400', rejected: 'bg-rose-400',
};
const roleBarColors: Record<string, string> = {
  admin: 'bg-teal-400', student: 'bg-teal-400', staff: 'bg-amber-400', faculty: 'bg-violet-400', employee: 'bg-rose-400',
};

function printReport(data: ReportData) {
  const summaryCards = data.summary.map((s) =>
    `<div class="summary-card"><div class="label">${s.label}</div><div class="value">${s.value}</div>${s.sub ? `<div class="sub">${s.sub}</div>` : ''}</div>`
  ).join('');

  const tableRows = data.tableRows.length > 0
    ? data.tableRows.map((row) =>
        `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
      ).join('')
    : `<tr><td colspan="${data.tableHeaders.length}" style="text-align:center;color:#94a3b8;padding:20px">${data.emptyMessage ?? 'No data available'}</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${data.title} — ${data.generatedAt}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; line-height: 1.6; font-size: 11pt; }
  .header { text-align: center; border-bottom: 3px double #0d9488; padding-bottom: 16px; margin-bottom: 20px; }
  .header h1 { font-size: 18pt; color: #0f172a; letter-spacing: 0.5px; }
  .header h2 { font-size: 13pt; color: #0d9488; margin-top: 4px; font-weight: 600; }
  .header .meta { font-size: 9pt; color: #64748b; margin-top: 8px; }
  .doc-info { display: flex; justify-content: space-between; font-size: 9pt; color: #475569; margin-bottom: 20px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
  .summary-grid { display: grid; grid-template-columns: repeat(${Math.min(data.summary.length, 5)}); gap: 10px; margin-bottom: 20px; }
  .summary-card { border: 1px solid #e2e8f0; border-top: 3px solid #0d9488; border-radius: 6px; padding: 12px; text-align: center; }
  .summary-card .label { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-card .value { font-size: 20pt; font-weight: 700; color: #0f172a; margin-top: 4px; }
  .summary-card .sub { font-size: 8pt; color: #94a3b8; margin-top: 2px; }
  .section-title { font-size: 12pt; font-weight: 700; color: #0f172a; border-left: 4px solid #0d9488; padding-left: 10px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th { background: #0d9488; color: #ffffff; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  .signature-block { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
  .sig-line { width: 240px; text-align: center; }
  .sig-line .line { border-top: 1px solid #1e293b; margin-bottom: 4px; margin-top: 50px; }
  .sig-line .name { font-weight: 600; font-size: 10pt; }
  .sig-line .title { font-size: 9pt; color: #64748b; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #94a3b8; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="header">
    <h1>HEALTH SYS SFCG</h1>
    <h2>${data.title}</h2>
    <div class="meta">${data.subtitle}<br/>Saint Francis College — Guihulngan City, Negros Oriental</div>
  </div>
  <div class="doc-info">
    <span><strong>Generated:</strong> ${data.generatedAt}</span>
    <span><strong>Prepared By:</strong> ${data.generatedBy}</span>
    <span><strong>Document ID:</strong> RPT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}</span>
  </div>
  ${data.summary.length > 0 ? `<div class="summary-grid">${summaryCards}</div>` : ''}
  <div class="section-title">Detailed Records</div>
  <table><thead><tr>${data.tableHeaders.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>
  <div class="signature-block">
    <div class="sig-line"><div class="line"></div><div class="name">${data.generatedBy}</div><div class="title">Prepared By</div></div>
    <div class="sig-line"><div class="line"></div><div class="name">Date: ${data.generatedAt.split(',')[0]}</div><div class="title">Date of Issuance</div></div>
  </div>
  <div class="footer">Generated electronically by HEALTH SYS SFCG on ${data.generatedAt}. Confidential — For internal administrative use only.</div>
</body>
</html>`;

  const existingFrame = document.getElementById('pdf-print-frame') as HTMLIFrameElement | null;
  if (existingFrame) existingFrame.remove();
  (window as any).__healthSysPrinting = true;

  const iframe = document.createElement('iframe');
  iframe.id = 'pdf-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentWindow?.document;
  if (!frameDoc) { (window as any).__healthSysPrinting = false; return; }
  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const cleanupFrame = () => {
    const f = document.getElementById('pdf-print-frame');
    if (f) f.remove();
    (window as any).__healthSysPrinting = false;
  };
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(cleanupFrame, 1000);
    } catch { cleanupFrame(); }
  };
  iframe.onload = () => setTimeout(triggerPrint, 300);
  setTimeout(() => { try { if (iframe.contentWindow?.document.readyState === 'complete') triggerPrint(); } catch { cleanupFrame(); } }, 2000);
}

export default function Reports() {
  const { currentUser } = useAuth();
  const {
    users, healthRecords, requests, inventory, expenses, notifications, auditLogs,
    dispensingHistory, patientVisits, referrals, followUps, appointments,
    medicalSupplies, stockTransactions, suppliers, purchases,
  } = useData();

  const [activeCategory, setActiveCategory] = useState<string>('medical');
  const [search, setSearch] = useState('');
  const [previewReport, setPreviewReport] = useState<ReportData | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'reports' | 'documents'>('reports');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [docSearch, setDocSearch] = useState('');

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'staff';

  const filteredReports = useMemo(() => {
    return allReports.filter((r) => {
      const matchCat = r.category === activeCategory;
      const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const handleGenerate = (reportId: string) => {
    const data = generateReport(reportId, {
      users, healthRecords, requests, inventory, expenses, notifications, auditLogs,
      dispensingHistory, patientVisits, referrals, followUps, appointments,
      medicalSupplies, stockTransactions, suppliers, purchases,
      generatedBy: currentUser.name,
    });
    setPreviewReport(data);
  };

  const handlePrint = (data: ReportData) => { printReport(data); };

  const handleExportCsv = (data: ReportData) => {
    const rows: (string | number)[][] = [data.tableHeaders, ...data.tableRows];
    downloadCsv(`${data.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const { schoolSettings } = useData();

  const printDocContext = {
    schoolName: schoolSettings?.schoolName || 'Saint Francis College — Guihulngan',
    generatedBy: currentUser.name,
    healthRecords, patientVisits, referrals, followUps, dispensingHistory,
    inventory, medicalSupplies, expenses, purchases, suppliers, stockTransactions, users,
  };

  const recordsForDoc = useMemo(() => {
    if (!selectedDocId) return [];
    switch (selectedDocId) {
      case 'health-record':
        return healthRecords.filter((r) => !r.archived).map((r) => ({ id: r.id, label: `${r.userName} (${r.userRole ?? '—'})`, sub: r.department ?? '' }));
      case 'medical-treatment':
        return patientVisits.filter((v) => v.serviceType !== 'dental' && v.serviceType !== 'physical').map((v) => ({ id: v.id, label: v.patientName, sub: `${v.serviceType} — ${new Date(v.visitDate).toLocaleDateString('en-PH')}` }));
      case 'dental-exam':
        return patientVisits.filter((v) => v.serviceType === 'dental').map((v) => ({ id: v.id, label: v.patientName, sub: `Dental — ${new Date(v.visitDate).toLocaleDateString('en-PH')}` }));
      case 'physical-exam':
        return patientVisits.filter((v) => v.serviceType === 'physical').map((v) => ({ id: v.id, label: v.patientName, sub: `Physical — ${new Date(v.visitDate).toLocaleDateString('en-PH')}` }));
      case 'referral-followup':
        return [
          ...referrals.map((r) => ({ id: r.id, label: `${r.patientName} — Referral`, sub: r.referredTo })),
          ...followUps.map((f) => ({ id: f.id, label: `${f.patientName} — Follow-up`, sub: new Date(f.scheduledDate).toLocaleDateString('en-PH') })),
        ];
      case 'medicine-issuance':
        return dispensingHistory.map((d) => ({ id: d.id, label: `${d.patientName} — ${d.medicineName}`, sub: `${d.quantity} ${d.unit} — ${new Date(d.dispensedAt).toLocaleDateString('en-PH')}` }));
      default:
        return [];
    }
  }, [selectedDocId, healthRecords, patientVisits, referrals, followUps, dispensingHistory]);

  const filteredDocRecords = useMemo(() => {
    if (!docSearch) return recordsForDoc;
    return recordsForDoc.filter((r) => r.label.toLowerCase().includes(docSearch.toLowerCase()) || r.sub?.toLowerCase().includes(docSearch.toLowerCase()));
  }, [recordsForDoc, docSearch]);

  const handlePrintDoc = () => {
    if (!selectedDocId) return;
    const html = generatePrintableDoc(selectedDocId, selectedRecordId || null, printDocContext);
    printHtml(html);
  };

  const handlePreviewDoc = () => {
    if (!selectedDocId) return;
    const html = generatePrintableDoc(selectedDocId, selectedRecordId || null, printDocContext);
    const existing = document.getElementById('doc-preview-frame') as HTMLIFrameElement | null;
    if (existing) existing.remove();
    const iframe = document.createElement('iframe');
    iframe.id = 'doc-preview-frame';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    const wrap = document.getElementById('doc-preview-container');
    if (wrap) {
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) { doc.open(); doc.write(html); doc.close(); }
    }
  };

  const [showDocPreview, setShowDocPreview] = useState(false);

  // Keep existing analytics computations for the dashboard cards at top
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const totalRequests = requests.length;
  const approvedRequests = requests.filter((r) => r.status === 'approved' || r.status === 'released').length;
  const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;
  const lowStockCount = inventory.filter((m) => m.quantity <= m.minStock).length;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const liquidatedExpenses = expenses.filter((e) => e.status === 'liquidated').reduce((s, e) => s + e.amount, 0);

  const requestsByType = (Object.keys(requestTypeLabels) as RequestType[]).map((type) => ({
    type, label: requestTypeLabels[type], count: requests.filter((r) => r.type === type).length,
  })).filter((r) => r.count > 0).sort((a, b) => b.count - a.count);
  const maxRequestCount = Math.max(...requestsByType.map((r) => r.count), 1);

  const requestsByStatus = ['pending', 'processing', 'approved', 'rejected'].map((status) => ({
    status, label: status.charAt(0).toUpperCase() + status.slice(1), count: requests.filter((r) => r.status === status).length,
  }));
  const maxStatusCount = Math.max(...requestsByStatus.map((r) => r.count), 1);

  const expensesByCategory = (Object.keys(categoryLabels) as ExpenseCategory[]).map((cat) => ({
    cat, label: categoryLabels[cat], total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((e) => e.total > 0).sort((a, b) => b.total - a.total);
  const maxExpense = Math.max(...expensesByCategory.map((e) => e.total), 1);

  const usersByRole = ['admin', 'student', 'staff', 'faculty', 'employee'].map((role) => ({
    role, label: role.charAt(0).toUpperCase() + role.slice(1), count: users.filter((u) => u.role === role).length,
  }));
  const maxRoleCount = Math.max(...usersByRole.map((r) => r.count), 1);

  const topMedicines = [...inventory].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const csvDate = new Date().toISOString().slice(0, 10);

  const exportUsersCsv = () => {
    downloadCsv(`users_${csvDate}.csv`, [
      ['ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Created At'],
      ...users.map((u) => [u.id, u.name, u.email, u.role, u.department ?? '', u.status, u.createdAt]),
    ]);
  };
  const exportHealthRecordsCsv = () => {
    downloadCsv(`health_records_${csvDate}.csv`, [
      ['ID', 'User ID', 'User Name', 'Role', 'Allergies', 'Conditions', 'Medications', 'Last Checkup', 'Created At'],
      ...healthRecords.map((r) => [r.id, r.userId, r.userName, r.userRole ?? '', r.allergies.join('; '), r.conditions.join('; '), r.medications.join('; '), r.lastCheckup, r.createdAt]),
    ]);
  };
  const exportRequestsCsv = () => {
    downloadCsv(`service_requests_${csvDate}.csv`, [
      ['ID', 'User Name', 'Type', 'Description', 'Status', 'Submitted At'],
      ...requests.map((r) => [r.id, r.userName, r.type, r.description, r.status, r.submittedAt]),
    ]);
  };
  const exportInventoryCsv = () => {
    downloadCsv(`medicine_inventory_${csvDate}.csv`, [
      ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Min Stock', 'Expiry Date', 'Supplier'],
      ...inventory.map((m) => [m.id, m.name, m.category, m.quantity, m.unit, m.minStock, m.expiryDate, m.supplier]),
    ]);
  };
  const exportExpensesCsv = () => {
    downloadCsv(`expenses_${csvDate}.csv`, [
      ['ID', 'Description', 'Amount', 'Category', 'Date', 'Status'],
      ...expenses.map((e) => [e.id, e.description, e.amount, e.category, e.date, e.status]),
    ]);
  };
  const exportNotificationsCsv = () => {
    downloadCsv(`notifications_${csvDate}.csv`, [
      ['ID', 'Title', 'Message', 'Sent By', 'Sent At', 'Type', 'Read'],
      ...notifications.map((n) => [n.id, n.title, n.message, n.sentBy, n.sentAt, n.type, n.read ? 'Yes' : 'No']),
    ]);
  };
  const exportAuditLogsCsv = () => {
    downloadCsv(`audit_logs_${csvDate}.csv`, [
      ['ID', 'User Name', 'Action', 'Module', 'Details', 'Timestamp'],
      ...auditLogs.map((l) => [l.id, l.userName, l.action, l.module, l.details, l.timestamp]),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: activeUsers, sub: `of ${users.length} total`, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Health Records', value: healthRecords.filter((r) => !r.archived).length, sub: `of ${healthRecords.length} total`, icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Approval Rate', value: `${approvalRate}%`, sub: `${approvedRequests} approved`, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Low Stock Items', value: lowStockCount, sub: `of ${inventory.length} items`, icon: Package, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
              <div className={`p-2.5 ${bg} rounded-xl`}><Icon size={18} className={color} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Top-level tab toggle */}
      {isAdmin && (
        <div className="flex items-center gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 w-fit">
          <button onClick={() => setActiveMainTab('reports')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeMainTab === 'reports' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <FileText size={15} /> Reports & Analytics
          </button>
          <button onClick={() => setActiveMainTab('documents')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeMainTab === 'documents' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <FileSignature size={15} /> Printable Documents
          </button>
        </div>
      )}

      {/* CSV export section */}
      {isAdmin && activeMainTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileSpreadsheet size={18} className="text-emerald-500" />
            <div>
              <h3 className="font-semibold text-slate-800">Export Data as CSV</h3>
              <p className="text-xs text-slate-400">Download a spreadsheet file of any data set for record-keeping or external analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Users', sub: `${users.length} records`, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50', border: 'hover:border-teal-300', action: exportUsersCsv },
              { label: 'Health Records', sub: `${healthRecords.length} records`, icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-300', action: exportHealthRecordsCsv },
              { label: 'Service Requests', sub: `${requests.length} records`, icon: ClipboardList, color: 'text-sky-600', bg: 'bg-sky-50', border: 'hover:border-sky-300', action: exportRequestsCsv },
              { label: 'Medicine Inventory', sub: `${inventory.length} records`, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-300', action: exportInventoryCsv },
              { label: 'Expenses', sub: `${expenses.length} records`, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300', action: exportExpensesCsv },
              { label: 'Notifications', sub: `${notifications.length} records`, icon: Bell, color: 'text-violet-600', bg: 'bg-violet-50', border: 'hover:border-violet-300', action: exportNotificationsCsv },
              { label: 'Audit Logs', sub: `${auditLogs.length} records`, icon: ScrollText, color: 'text-slate-600', bg: 'bg-slate-100', border: 'hover:border-slate-300', action: exportAuditLogsCsv },
            ].map(({ label, sub, icon: Icon, color, bg, border, action }) => (
              <button key={label} onClick={action}
                className={`flex items-center gap-3 p-4 rounded-xl border border-slate-200 ${border} bg-white transition-all hover:shadow-md text-left group`}>
                <div className={`p-2.5 ${bg} rounded-lg shrink-0`}><Icon size={18} className={color} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
                <Download size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report catalog */}
      {isAdmin && activeMainTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Category tabs */}
          <div className="border-b border-slate-100">
            <div className="flex flex-wrap">
              {reportCategories.map((cat) => {
                const Icon = categoryIconMap[cat.icon] ?? FileText;
                const colors = categoryColors[cat.id] ?? categoryColors.medical;
                const isActive = activeCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2 ${isActive ? `${colors.icon} border-current` : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'}`}>
                    <Icon size={16} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
            </div>
          </div>

          {/* Report cards grid */}
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => {
                const colors = categoryColors[report.category] ?? categoryColors.medical;
                return (
                  <div key={report.id} className={`rounded-xl border ${colors.border} bg-white p-5 flex flex-col gap-3 transition-all hover:shadow-md`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 ${colors.bg} rounded-xl shrink-0`}>
                        <FileText size={18} className={colors.icon} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{report.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => handleGenerate(report.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 ${colors.btn} text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors`}>
                        <Eye size={13} /> Preview
                      </button>
                      <button onClick={() => { const d = generateReport(report.id, { users, healthRecords, requests, inventory, expenses, notifications, auditLogs, dispensingHistory, patientVisits, referrals, followUps, appointments, medicalSupplies, stockTransactions, suppliers, purchases, generatedBy: currentUser.name }); handlePrint(d); }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
                        <Printer size={13} /> Print
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredReports.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No reports found matching "{search}".</div>
            )}
          </div>
        </div>
      )}

      {/* Printable Documents section */}
      {isAdmin && activeMainTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-2 mb-1">
              <FileSignature size={18} className="text-teal-600" />
              <h3 className="font-semibold text-slate-800">Printable Formal Documents</h3>
            </div>
            <p className="text-xs text-slate-400">Generate formal documents for printing or archiving. Select a document type, choose a specific record if needed, then preview or print.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Document type list */}
            <div className="lg:col-span-1 border-r border-slate-100 p-4 space-y-2">
              {printableDocuments.map((doc) => {
              const Icon = categoryIconMap[doc.icon] ?? FileText;
              const isSelected = selectedDocId === doc.id;
              return (
                <button key={doc.id} onClick={() => { setSelectedDocId(doc.id); setSelectedRecordId(''); setShowDocPreview(false); }}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all ${isSelected ? 'bg-teal-50 border border-teal-200' : 'border border-transparent hover:bg-slate-50'}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-teal-100' : 'bg-slate-100'}`}><Icon size={16} className={isSelected ? 'text-teal-600' : 'text-slate-500'} /></div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-teal-800' : 'text-slate-700'}`}>{doc.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{doc.description}</p>
                  </div>
                </button>
              );
              })}
            </div>

            {/* Record selection + actions */}
            <div className="lg:col-span-2 p-5">
              {!selectedDocId ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="p-4 bg-slate-50 rounded-2xl mb-3"><FileSignature size={28} className="text-slate-300" /></div>
                  <p className="text-sm font-medium text-slate-500">Select a document type to begin</p>
                  <p className="text-xs text-slate-400 mt-1">Choose from the list on the left</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {(() => {
                    const doc = printableDocuments.find((d) => d.id === selectedDocId)!;
                    return (
                      <>
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="p-2.5 bg-teal-50 rounded-xl">{(() => { const I = categoryIconMap[doc.icon] ?? FileText; return <I size={18} className="text-teal-600" />; })()}</div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{doc.title}</p>
                            <p className="text-xs text-slate-400">{doc.description}</p>
                          </div>
                        </div>

                        {doc.recordBased ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Select Record</label>
                              {recordsForDoc.length === 0 ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                  <p className="text-sm text-amber-700">No records available for this document type.</p>
                                </div>
                              ) : (
                                <>
                                  <div className="relative mb-2">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={docSearch} onChange={(e) => setDocSearch(e.target.value)} placeholder="Search records..."
                                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
                                  </div>
                                  <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                                    {filteredDocRecords.map((r) => (
                                      <button key={r.id} onClick={() => { setSelectedRecordId(r.id); setShowDocPreview(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${selectedRecordId === r.id ? 'bg-teal-50' : 'hover:bg-slate-50'}`}>
                                        <div className="min-w-0">
                                          <p className={`text-sm font-medium ${selectedRecordId === r.id ? 'text-teal-800' : 'text-slate-700'}`}>{r.label}</p>
                                          {r.sub && <p className="text-xs text-slate-400 mt-0.5">{r.sub}</p>}
                                        </div>
                                        {selectedRecordId === r.id && <CheckCircle size={15} className="text-teal-500 shrink-0" />}
                                      </button>
                                    ))}
                                    {filteredDocRecords.length === 0 && (
                                      <p className="px-4 py-6 text-center text-sm text-slate-400">No records match "{docSearch}".</p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                            <p className="text-sm text-sky-700">This document compiles all available data automatically. No record selection needed.</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button onClick={() => { handlePreviewDoc(); setShowDocPreview(true); }}
                            disabled={doc.recordBased && !selectedRecordId}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <Eye size={15} /> Preview
                          </button>
                          <button onClick={handlePrintDoc}
                            disabled={doc.recordBased && !selectedRecordId}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <Printer size={15} /> Print
                          </button>
                        </div>

                        {showDocPreview && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Document Preview</p>
                            <div id="doc-preview-container" className="w-full h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-white" />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared: requests charts */}
      {activeMainTab === 'reports' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList size={16} className="text-teal-500" />
            <h3 className="font-semibold text-slate-800">Requests by Type</h3>
          </div>
          {requestsByType.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No request data.</p>
          ) : (
            <div className="space-y-3">
              {requestsByType.map(({ type, label, count }) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className="font-bold text-slate-800">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-400 h-2 rounded-full transition-all" style={{ width: `${(count / maxRequestCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-sky-500" />
            <h3 className="font-semibold text-slate-800">Requests by Status</h3>
          </div>
          <div className="space-y-3">
            {requestsByStatus.map(({ status, label, count }) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="font-bold text-slate-800">{count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`${statusColors[status]} h-2 rounded-full transition-all`} style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Admin-only charts */}
      {isAdmin && activeMainTab === 'reports' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={16} className="text-emerald-500" />
                <h3 className="font-semibold text-slate-800">Expenses by Category</h3>
              </div>
              {expensesByCategory.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No expense data.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {expensesByCategory.map(({ cat, label, total }) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">{label}</span>
                        <span className="font-bold text-slate-800">₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`${catColors[cat]} h-2 rounded-full transition-all`} style={{ width: `${(total / maxExpense) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users size={16} className="text-amber-500" />
                <h3 className="font-semibold text-slate-800">Users by Role</h3>
              </div>
              <div className="space-y-3">
                {usersByRole.map(({ role, label, count }) => (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">{label}</span>
                      <span className="font-bold text-slate-800">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${roleBarColors[role] ?? 'bg-amber-400'} h-2 rounded-full transition-all`} style={{ width: `${(count / maxRoleCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Package size={16} className="text-teal-500" />
              <h3 className="font-semibold text-slate-800">Top Medicine Stock</h3>
            </div>
            <div className="space-y-3">
              {topMedicines.map((m) => {
                const isLow = m.quantity <= m.minStock;
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className={`shrink-0 p-1.5 rounded-lg ${isLow ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                      {isLow ? <AlertTriangle size={12} className="text-rose-500" /> : <CheckCircle size={12} className="text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-medium text-slate-700 truncate">{m.name}</span>
                        <span className={`text-xs font-bold ${isLow ? 'text-rose-500' : 'text-slate-700'}`}>{m.quantity}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className={`${isLow ? 'bg-rose-400' : 'bg-emerald-400'} h-1.5 rounded-full`}
                          style={{ width: `${Math.min((m.quantity / (m.minStock * 5)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-teal-500" />
              <h3 className="font-semibold text-slate-800">Financial Overview</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Total Budget Used</p>
                <p className="text-2xl font-bold text-slate-800">₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Liquidated</p>
                <p className="text-2xl font-bold text-emerald-600">₱{liquidatedExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Pending Liquidation</p>
                <p className="text-2xl font-bold text-amber-600">₱{(totalExpenses - liquidatedExpenses).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Liquidation Progress</span>
                <span>{totalExpenses > 0 ? Math.round((liquidatedExpenses / totalExpenses) * 100) : 0}% complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-3 rounded-full transition-all shadow-sm shadow-teal-200"
                  style={{ width: `${totalExpenses > 0 ? (liquidatedExpenses / totalExpenses) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Report Preview Modal */}
      {previewReport && activeMainTab === 'reports' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewReport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-xl"><FileText size={18} className="text-teal-500" /></div>
                <div>
                  <h3 className="font-semibold text-slate-800">{previewReport.title}</h3>
                  <p className="text-xs text-slate-400">{previewReport.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleExportCsv(previewReport)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                  <Download size={14} /> CSV
                </button>
                <button onClick={() => handlePrint(previewReport)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white transition-colors">
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setPreviewReport(null)}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                  Close
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <span><strong className="text-slate-700">Generated:</strong> {previewReport.generatedAt}</span>
                <span><strong className="text-slate-700">Prepared By:</strong> {previewReport.generatedBy}</span>
              </div>

              {/* Summary cards */}
              {previewReport.summary.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {previewReport.summary.map((s, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 text-center" style={{ borderTopWidth: 3, borderTopColor: '#0d9488' }}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
                      {s.sub && <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Data table */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <ClipboardList size={14} className="text-teal-500" /> Detailed Records
                </h4>
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {previewReport.tableHeaders.map((h, i) => (
                          <th key={i} className="text-left px-4 py-2.5 text-xs font-medium text-white uppercase tracking-wider" style={{ background: '#0d9488' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {previewReport.tableRows.length > 0 ? (
                        previewReport.tableRows.map((row, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-4 py-2.5 text-xs text-slate-600">{cell}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={previewReport.tableHeaders.length} className="px-4 py-8 text-center text-sm text-slate-400">{previewReport.emptyMessage ?? 'No data available'}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {previewReport.tableRows.length > 50 && (
                  <p className="text-xs text-slate-400 mt-2 text-center">Showing all {previewReport.tableRows.length} records. Use Print or CSV export for the full report.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
