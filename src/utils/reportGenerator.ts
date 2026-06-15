import { Patient } from '../types';
import { getCareTeam, getPrimaryDoctor } from '../careTeam';

export function downloadPatientReport(patient: Patient) {
  const primary = getPrimaryDoctor(patient);
  const careTeam = getCareTeam(patient);

  const reportContent = `========================================================================
                     CLINICAL HEALTH RECORD DOSSIER
                    DScribe Clinical Nexus Console
========================================================================
Generated on: ${new Date().toLocaleString()}
Record Status: ${patient.status.toUpperCase()}

------------------------------------------------------------------------
1. PATIENT DEMOGRAPHICS & PROFILE
------------------------------------------------------------------------
Full Name:         ${patient.name}
UHID Identifier:   ${patient.uhid}
Age / Gender:      ${patient.age} years / ${patient.gender}
Phone Number:      ${patient.phone || 'Not recorded'}
Date of Birth:     ${patient.dob || 'Not recorded'}
Permanent Address: ${patient.address || 'Not recorded'}

------------------------------------------------------------------------
2. ADMISSION & HOSPITALIZATION DETAILS
------------------------------------------------------------------------
Admission Date:    ${patient.admissionDate || 'Not recorded'}
Ward Assignment:   ${patient.ward}
Bed Assignment:    ${patient.bed}
Clinical Dept:     ${patient.department}
Referred By:       ${patient.referredBy || 'Self-referred'}
Billing/Care Plan: ${patient.plan || 'Standard Care'}
Special Labels:    ${patient.labels && patient.labels.length > 0 ? patient.labels.join(', ') : 'None'}

------------------------------------------------------------------------
3. ATTENDING CARE TEAM & DEPARTMENTS
------------------------------------------------------------------------
Primary Consultant:[${primary?.role || 'Primary Consultant'}] ${primary?.doctor || patient.attendingDoctor}
Department:         ${primary?.department || patient.department}

Active Multidisciplinary Team Members:
${careTeam.map((member, index) => `${index + 1}. ${member.doctor}
   Role:        ${member.role}
   Department:  ${member.department}
   Activity:    ${member.activity || 'Assigned to care unit'}
   Last Updated: ${member.lastSeen || 'Recently'}`).join('\n\n')}

------------------------------------------------------------------------
4. MEDICAL DOCUMENT REGISTER
------------------------------------------------------------------------
Uploaded Docs Count: ${patient.uploadedDocsCount || 0} document(s) indexed for verification.

------------------------------------------------------------------------
                         End of Medical Dossier
========================================================================`;

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Clean filename
  const safeName = patient.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `Clinical_Report_${safeName}_${patient.uhid}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
