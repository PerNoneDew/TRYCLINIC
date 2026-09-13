import type { User } from '../types';
import type { FormState } from '../components/ui/PatientVisitForm';

const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
const blank = '________________';
const fld = (v: string | undefined | null): string => escapeHtml(v?.trim() || blank);
const checkbox = (checked: boolean): string => checked ? '<span style="font-size:13px;">&#9745;</span>' : '<span style="font-size:13px;">&#9744;</span>';

const clinicalRows = [
  ['eyes', 'Eyes (Vision)'],
  ['ears_nose_throat', 'Ears, Nose, Throat'],
  ['mouth_teeth', 'Mouth & Teeth'],
  ['neck_lymph_nodes', 'Neck/Lymph Nodes'],
  ['cardiovascular_heart', 'Cardiovascular/Heart'],
  ['abdomen', 'Abdomen'],
  ['chest_lungs', 'Chest & Lungs'],
  ['skin', 'Skin'],
  ['genitalia_hernia', 'Genitalia/Hernia (Male)'],
  ['breast', 'Breast'],
];

const musculoskeletalRows = [
  ['neck', 'Neck'],
  ['spine_back', 'Spine/Back'],
  ['shoulders_arm', 'Shoulders/Arm'],
  ['elbow_forearm', 'Elbow/Forearm'],
  ['wrist_hand', 'Wrist/Hand'],
  ['hip_thighs', 'Hip/Thighs'],
  ['knee', 'Knee'],
  ['leg_ankles', 'Leg/Ankles'],
];

function displayName(user: User): { first: string; middle: string; last: string } {
  const pieces = user.name.replace(/^Prof\.\s+/i, '').trim().split(/\s+/);
  return {
    first: user.firstName ?? pieces[0] ?? '',
    middle: user.middleName ?? '',
    last: user.lastName ?? pieces.slice(1).join(' '),
  };
}

function examTableHtml(title: string, rows: readonly (readonly [string, string])[], form: FormState): string {
  const get = (key: string, fallback = ''): string => String(form.clinical[key] ?? fallback);
  const body = rows.map(([key, label], i) => {
    const isNormal = form.clinical[`normal_${key}`] === 'yes';
    const abnormal = get(`abnormal_${key}`);
    const initials = get(`initials_${key}`);
    return `<tr>
      <td>${i + 1}. ${escapeHtml(label)}</td>
      <td style="text-align:center;">${checkbox(isNormal)}</td>
      <td>${escapeHtml(abnormal)}</td>
      <td>${escapeHtml(initials)}</td>
    </tr>`;
  }).join('');
  return `<table class="exam-table"><thead><tr><th>${title}</th><th style="width:60px;">NORMAL</th><th>ABNORMAL FINDINGS</th><th style="width:70px;">INITIALS</th></tr></thead><tbody>${body}</tbody></table>`;
}

export function buildPhysicalExamPrintHtml(form: FormState, patient: User, schoolName: string, schoolLogo: string): string {
  const names = displayName(patient);
  const get = (key: string, fallback = ''): string => String(form.clinical[key] ?? fallback);

  const bmi = get('bmi');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Physical Examination — ${escapeHtml(patient.name)}</title>
<style>
  @page { size: 8.5in 11in; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color:#1e293b; font-size:12px; line-height:1.6; }
  .header { text-align:center; margin-bottom:16px; }
  .header img { width:60px; height:auto; display:block; margin:0 auto 6px; }
  .header p { font-size:10px; font-weight:700; line-height:1.5; }
  .header p span { font-weight:400; font-size:9px; color:#475569; }
  .header h2 { font-size:16px; font-weight:700; letter-spacing:1px; margin-top:8px; padding-top:6px; border-top:2px solid #1e293b; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px 16px; margin-bottom:10px; }
  .info-grid-5 { display:grid; grid-template-columns:1fr 0.7fr 1.6fr 0.8fr 0.8fr; gap:8px 16px; margin-bottom:10px; align-items:end; }
  .field { font-size:11px; }
  .field .label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#475569; margin-bottom:2px; }
  .field .value { font-size:12px; font-weight:600; border-bottom:1px solid #1e293b; padding:1px 4px; min-height:18px; }
  .vitals { display:flex; flex-wrap:wrap; gap:8px 16px; align-items:end; padding:10px 0; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; margin-bottom:14px; }
  .vitals .vtitle { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; width:100%; margin-bottom:4px; }
  .vitals .field { min-width:90px; }
  .exam-table { width:100%; border-collapse:collapse; margin-bottom:12px; border:1px solid #1e293b; }
  .exam-table th { background:#f1f5f9; border-bottom:1px solid #1e293b; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 8px; text-align:left; }
  .exam-table th:nth-child(2) { text-align:center; }
  .exam-table td { font-size:11px; padding:3px 8px; border-bottom:1px solid #e2e8f0; min-height:24px; }
  .exam-table td:nth-child(2) { text-align:center; }
  .exam-table tr:last-child td { border-bottom:none; }
  .clearance { margin:14px 0 12px; font-size:12px; }
  .clearance .line { border-top:1px solid #e2e8f0; padding-top:8px; margin-bottom:6px; }
  .clearance .item { margin-bottom:4px; }
  .notes { margin-bottom:14px; }
  .notes .box { width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:6px 8px; font-size:12px; min-height:50px; white-space:pre-wrap; }
  .signatures { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:12px; }
  .footer-note { text-align:center; font-size:10px; color:#94a3b8; margin-top:8px; font-family:Arial,sans-serif; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
  <div class="header">
    <img src="${escapeHtml(schoolLogo)}" alt="Logo" />
    <p>${escapeHtml(schoolName)}<br /><span>Guihulngan City, Negros Oriental, Philippines 6214</span></p>
    <h2>PHYSICAL EXAMINATION</h2>
  </div>

  <div class="info-grid">
    <div class="field"><div class="label">First Name</div><div class="value">${fld(names.first)}</div></div>
    <div class="field"><div class="label">Middle Name</div><div class="value">${fld(names.middle)}</div></div>
    <div class="field"><div class="label">Last Name</div><div class="value">${fld(names.last)}</div></div>
    <div class="field"><div class="label">Date of Birth</div><div class="value">${fld(get('dateOfBirth', patient.dateOfBirth))}</div></div>
  </div>
  <div class="info-grid-5">
    <div class="field"><div class="label">Gender</div><div class="value">${fld(get('gender'))}</div></div>
    <div class="field"><div class="label">Age</div><div class="value">${fld(get('age'))}</div></div>
    <div class="field"><div class="label">Grade / Year / Course / Designation</div><div class="value">${fld(get('gradeYearCourse', patient.gradeYearLevel ?? patient.programCourse ?? patient.position ?? ''))}</div></div>
    <div class="field"><div class="label">Height</div><div class="value">${fld(form.height)}${form.height ? ' cm' : ''}</div></div>
    <div class="field"><div class="label">Weight</div><div class="value">${fld(form.weight)}${form.weight ? ' kg' : ''}</div></div>
  </div>
  ${bmi ? `<p style="font-size:11px;font-weight:600;margin-bottom:10px;">BMI: ${escapeHtml(bmi)}</p>` : ''}

  <div class="vitals">
    <span class="vtitle">Vital Signs:</span>
    <div class="field"><div class="label">Blood Pressure</div><div class="value">${fld(form.bloodPressure)}</div></div>
    <div class="field"><div class="label">Pulse Rate</div><div class="value">${fld(form.heartRate)}</div></div>
    <div class="field"><div class="label">Respiratory Rate</div><div class="value">${fld(form.respiratoryRate)}</div></div>
    <div class="field"><div class="label">O2 SAT</div><div class="value">${fld(form.oxygenSat)}</div></div>
    <div class="field"><div class="label">Temperature</div><div class="value">${fld(form.temperature)}</div></div>
  </div>

  ${examTableHtml('MEDICAL', clinicalRows, form)}
  ${examTableHtml('MUSCULOSKELETAL: ROM', musculoskeletalRows, form)}

  <div class="clearance">
    <div class="line"></div>
    <div class="item">${checkbox(get('clearanceStatus') === 'cleared')} Cleared without restriction</div>
    <div class="item">${checkbox(get('clearanceStatus') === 'cleared_with_restriction')} Cleared with recommendations for further evaluation or treatment for: ${escapeHtml(get('restrictionDetails'))}</div>
    <div class="item">${checkbox(get('clearanceStatus') === 'not_cleared_all')} Not Cleared: All school activities/sports</div>
    <div class="item">${checkbox(get('clearanceStatus') === 'not_cleared_certain')} Not Cleared: Certain Activities/Sports: ${escapeHtml(get('activityRestrictions'))}</div>
  </div>

  <div class="notes">
    <div class="label" style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#475569;margin-bottom:2px;">Remarks:</div>
    <div class="box">${escapeHtml(form.remarks || '')}</div>
  </div>

  <div class="signatures">
    <div class="field"><div class="label">Physician's Signature</div><div class="value">${fld(get('physicianName'))}</div></div>
    <div class="field"><div class="label">Date</div><div class="value">${fld(get('examDate'))}</div></div>
  </div>

  <div class="footer-note">Examiner's copy — Generated by ${escapeHtml(schoolName)} Health Management System</div>
</body></html>`;
}
