import { Patient, MRDFile, OutPatientVisit, Doctor, PharmacyItem, Prescription, AIInsight, SupportTicket } from './types';
import { buildCareTeamMember } from './careTeam';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    uhid: '1029384',
    name: 'Robert Miller',
    firstName: 'Robert',
    lastName: 'Miller',
    gender: 'Male',
    age: 72,
    phone: '+1 (555) 321-9876',
    dob: '1954-04-12',
    address: '42 Main St, Sector 12, Boston, MA',
    ward: 'Ward 4B',
    bed: 'B-102',
    department: 'Cardiology',
    departments: ['Cardiology', 'Neurology', 'General Medicine'],
    attendingDoctor: 'Dr. Sarah Chen',
    crossConsultant: 'Dr. Anthony Fauci',
    careTeam: [
      buildCareTeamMember('Dr. Sarah Chen', 'Primary Consultant', 'Cardiology', 'pat-1-a'),
      buildCareTeamMember('Dr. Marcus Wright', 'Cross Consultant', 'Neurology', 'pat-1-b'),
      buildCareTeamMember('Dr. Priya Sharma', 'Resident Doctor', 'General Medicine', 'pat-1-c')
    ],
    status: 'Provisional Admission',
    labels: ['High Priority', 'Insurance'],
    admissionDate: '2026-06-12',
    plan: 'Insurance Covered',
    referredBy: 'Central Clinic',
    uploadedDocsCount: 2,
    initials: 'RM',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKhyL2PPUmXUmhQE9iBZ1B6jCrMNVVjyKne4oQoSdcjzYpTpnX9PvF87vV0_n4SlHeCm0OCKjT5wu0NsacSsNm7s-_1W3QgpCOWWZfVu3dtGA2AGjR6YdwK0eIQ4Yahc_xd1GEdC7JMPvLhqDuhP5Kp0dEWbLKDcbrH5gSgJrEL8SxC825PUmzJEIRgfFwgPpEsDaFq_9yajvdoFO7c9qrvLbMxGyrjf7UqwIi6_MZUfD47Wtad2dyowA4n-vIrJ5qNpTn6txyQAE'
  },
  {
    id: 'pat-2',
    uhid: '1029412',
    name: 'Sarah Jenkins',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    gender: 'Female',
    age: 68,
    phone: '+1 (555) 765-4321',
    dob: '1958-08-22',
    address: '15 Oak Ridge Rd, Lincoln, NE',
    ward: 'Ward 2A',
    bed: 'A-201',
    department: 'Neurology',
    departments: ['Neurology', 'Oncology', 'General Medicine'],
    attendingDoctor: 'Dr. Ashok Kumar',
    crossConsultant: 'Dr. Sarah Chen',
    careTeam: [
      buildCareTeamMember('Dr. Ashok Kumar', 'Primary Consultant', 'Neurology', 'pat-2-a'),
      buildCareTeamMember('Dr. Jayappa J', 'Cross Consultant', 'Oncology', 'pat-2-b'),
      buildCareTeamMember('Dr. Priya Sharma', 'Resident Doctor', 'General Medicine', 'pat-2-c')
    ],
    status: 'Completed',
    labels: ['Insurance'],
    admissionDate: '2026-06-10',
    plan: 'Premium',
    referredBy: 'Dr. Ashok Kumar',
    uploadedDocsCount: 3,
    initials: 'SJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjqJhbKU6wsCnUdPoHtyOqX1czmHaxhfXINje-9E1FgLx6yvka05S3v7wPRDWn3V9735dpKSGJYFvJGAZ19pP8PzC0KhX7sMy-jJafFXvVa8pyyTqB38VktZD0DTIZBT9bGwYSy0n70AEI8PO4wCZg_ARicW_Ha_iB-1oZRe-NIWezWm77B-F8fZxxtXi8CA-bQAQEfGH72zrAVD-NZlpIBveRXLfIe_6atyuJ0JGx_zTWoux6vX-G9mRRYHKVGnzGEgQOoo8gDT0'
  },
  {
    id: 'pat-3',
    uhid: '1029455',
    name: 'Arthur Lewis',
    firstName: 'Arthur',
    lastName: 'Lewis',
    gender: 'Male',
    age: 75,
    phone: '+1 (555) 234-5678',
    dob: '1951-11-05',
    address: '89 Maple Dr, Springfield, IL',
    ward: 'ICU-1',
    bed: 'I-01',
    department: 'Intensive Care',
    departments: ['Intensive Care', 'Cardiology', 'General Medicine'],
    attendingDoctor: 'Dr. Marcus Wright',
    crossConsultant: 'Dr. Sarah Chen',
    careTeam: [
      buildCareTeamMember('Dr. Marcus Wright', 'Primary Consultant', 'Intensive Care', 'pat-3-a'),
      buildCareTeamMember('Dr. Sarah Chen', 'Cross Consultant', 'Cardiology', 'pat-3-b'),
      buildCareTeamMember('Dr. Omar Rahman', 'ICU Doctor', 'Intensive Care', 'pat-3-c'),
      buildCareTeamMember('Dr. Meera Iyer', 'Duty Doctor', 'General Medicine', 'pat-3-d')
    ],
    status: 'MRD Pending',
    labels: ['Payment Defaulter'],
    admissionDate: '2026-06-13',
    plan: 'Basic',
    referredBy: 'Emergency Inbound',
    uploadedDocsCount: 1,
    initials: 'AL',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoWA_MquWUSiOkqD3NECzhu4_My-XONmZ1T8tUTLBiYIVJeLKAdR7bU_wjQMbYAifQu2tW_OwtTwenbnvX23SHCqgOR150hwvbXejPhVzVyL-Iwbs7eo2jXrgUF-qwYWjEAH8-AAvliIaHAuPe4_yCGb9Lv7KopCtcAljUrz72WTCdNEijBNXfnXC6SKg4t_bLOvq5sSgKt-vAoD-bg09zZzu4v9RFSjOfOgOuAvhdmik4jQ9F4-QsMrShVq1cCKkcv6TatIhqo-c'
  },
  {
    id: 'pat-4',
    uhid: '1029501',
    name: 'Evelyn Thorne',
    firstName: 'Evelyn',
    lastName: 'Thorne',
    gender: 'Female',
    age: 82,
    phone: '+1 (555) 890-1234',
    dob: '1944-01-18',
    address: '202 Pine St, Augusta, GA',
    ward: 'Ward 4B',
    bed: 'B-105',
    department: 'Cardiology',
    departments: ['Cardiology', 'Oncology'],
    attendingDoctor: 'Dr. Sarah Chen',
    crossConsultant: 'Dr. Ashok Kumar',
    careTeam: [
      buildCareTeamMember('Dr. Sarah Chen', 'Primary Consultant', 'Cardiology', 'pat-4-a'),
      buildCareTeamMember('Dr. Ashok Kumar', 'Cross Consultant', 'Oncology', 'pat-4-b'),
      buildCareTeamMember('Dr. Meera Iyer', 'Visiting Doctor', 'Cardiology', 'pat-4-c')
    ],
    status: 'Discharged',
    labels: ['Insurance'],
    admissionDate: '2026-06-08',
    plan: 'Insurance Covered',
    referredBy: 'Nursing Home Referral',
    uploadedDocsCount: 4,
    initials: 'ET',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJYkEZRF9eFx6tc0LBKMIfxtp6CggZ0TETUUnjsgN2K-cWeZRSBZXkEkTXF44Bz3ZnWhMP86McZeholVgBuXVTveZGApveG9BlR_2Bnbztrd-4XrNdbThRkPlYxFng8rimjqerDLESgwRw1ROWJjFp3zE0Tby90RSAgGNeIamoNEoT65qoKAMRjQujzjrPyYXXH4FYJqR7rlbLaeYvENfBwGJQkkV-Ygki7pPfUEHi3ai9vEpD83KyvzsWNxB_R-3pZUs-ZCmhr0c'
  }
];

export const INITIAL_FILES: MRDFile[] = [
  {
    id: 'doc-1',
    fileName: 'Lab_Report_Feb24.pdf',
    patientName: 'Sarah Jenkins',
    uhid: '1029412',
    category: 'Clinical',
    uploadDate: '24 Feb 2024, 09:12 AM',
    status: 'Verified',
    securityLevel: 'High',
    fileSize: '2.4 MB',
    authoredBy: 'Dr. Sarah Chen',
    notes: 'Patient shows significant improvement in creatinine levels since previous testing. Continue current medication regimen.',
    previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAphuincDntJzYNjDHY_ALBJPdi4Qn5Msgg9n3wCp8nnLwtFUTmoI9R6uGzOwm0Kt_cg_leavX7BKPTVczmKG913zVSIhyyTVltO_0aLluPseeoWUlU00D8dk84Gd_aj9pok6QZui9dxPijqSUxkElLeLZso2lKydO2mIjU7J_GiIjdaguzY8IEwtzxHVfqsmSWkfxVwjtAlkokwJEBaaGMWdR-8Tz1742zU7czSm2b01p6iBlXgTvOv5qc79tOimSCxxMhAdiNFe0'
  },
  {
    id: 'doc-2',
    fileName: 'MRI_Scan_Lumbar.jpg',
    patientName: 'Marcus Chen',
    uhid: '99301221',
    category: 'Imaging',
    uploadDate: '23 Feb 2024, 04:45 PM',
    status: 'Pending Review',
    securityLevel: 'Restricted',
    fileSize: '8.1 MB',
    authoredBy: 'Dr. Marcus Wright',
    notes: 'L4-L5 disc protrusion noted with secondary stenosis. Suggest referral for physical therapy evaluation and follow-up appointment in 14 days.',
    previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfbPkYfyLrVxamJLNjhNsy4oruMNRz5DutSVqjvoqhqzK-kwL5V4MTNfSUHnshf_HZOmBUECLlFVSSSbK2TovQ81OGNI7kbiUGogW_6D4vMmgy7dKgenkx2Oyv6tgpwUB04q8JK3lOYlsn6enXEJZFZe0a-EUomYSQgAoNWYwlSorLwlZ0Bjuepc0zaApMEAcNcUI-vW-fafQxHVznWopmA9_LMR2eSPCCVDYsxcmJbspkWaEkoZO1AOB1BlHO0AArvWCVJER_SAY'
  },
  {
    id: 'doc-3',
    fileName: 'Consent_Form_Surgery.doc',
    patientName: 'Elena Rodriguez',
    uhid: '77102293',
    category: 'Administrative',
    uploadDate: '23 Feb 2024, 02:20 PM',
    status: 'Flagged',
    securityLevel: 'Standard',
    fileSize: '1.1 MB',
    authoredBy: 'Dr. Sarah Chen',
    notes: 'Signed treatment consent copy for laparoscopic cholecystectomy. Signature verified by attending nurse, but witness line requires notary countersign.',
    previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoWA_MquWUSiOkqD3NECzhu4_My-XONmZ1T8tUTLBiYIVJeLKAdR7bU_wjQMbYAifQu2tW_OwtTwenbnvX23SHCqgOR150hwvbXejPhVzVyL-Iwbs7eo2jXrgUF-qwYWjEAH8-AAvliIaHAuPe4_yCGb9Lv7KopCtcAljUrz72WTCdNEijBNXfnXC6SKg4t_bLOvq5sSgKt-vAoD-bg09zZzu4v9RFSjOfOgOuAvhdmik4jQ9F4-QsMrShVq1cCKkcv6TatIhqo-c'
  },
  {
    id: 'doc-4',
    fileName: 'Discharge_Summary_101.pdf',
    patientName: 'Robert Miller',
    uhid: '1029384',
    category: 'Clinical',
    uploadDate: '22 Feb 2024, 11:30 AM',
    status: 'Verified',
    securityLevel: 'High',
    fileSize: '1.8 MB',
    authoredBy: 'Dr. Sarah Chen',
    notes: 'Standard discharge dispatch summarizing medication change from heavy IV beta-blockers to oral ACE-inhibitors. Clinical outcome fully synchronized.',
    previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3CFOFmvkz0vLGgzTCfau8BA-n4fPOxmtJK5f80AOmIU7ysms4X_QndKdCYHJoD1kWStMlEFyNe8ra487ef3_NcPQLPy4J_wPNkjUICKPiby0xNgErHmf7TOQycGixRThtHF2wX5A4eOSwsw2_qUQee1-ZrjVcVBu7Zkk-SQmO1eRUGfbPNgdpdqjMLLCwB2LBFka3eWjBDg6sQRwCGbEwwXHm547Z6RmOPE01jnFuWVs40QW-7UHrvMR-mXVTYbtuxhf-gMijVHo'
  }
];

export const INITIAL_OPD_QUEUE: OutPatientVisit[] = [
  {
    id: 'opd-1',
    tokenNumber: 'A-041',
    patientName: 'Michael Tran',
    uhid: '1031022',
    doctor: 'Dr. Sarah Chen',
    department: 'Cardiology',
    appointmentTime: '09:15 AM',
    type: 'Follow-up',
    status: 'In Consultation',
    reason: 'Post-angioplasty review and medication adjustment.'
  },
  {
    id: 'opd-2',
    tokenNumber: 'A-042',
    patientName: 'Priya Nair',
    uhid: '1031045',
    doctor: 'Dr. Sarah Chen',
    department: 'Cardiology',
    appointmentTime: '09:30 AM',
    type: 'New Consultation',
    status: 'Waiting',
    reason: 'Chest tightness and shortness of breath on exertion.'
  },
  {
    id: 'opd-3',
    tokenNumber: 'B-018',
    patientName: 'Daniel Osei',
    uhid: '1031051',
    doctor: 'Dr. Marcus Wright',
    department: 'Neurology',
    appointmentTime: '09:40 AM',
    type: 'Follow-up',
    status: 'Waiting',
    reason: 'Migraine management — review of new prophylactic regimen.'
  },
  {
    id: 'opd-4',
    tokenNumber: 'C-009',
    patientName: 'Grace Williams',
    uhid: '1031060',
    doctor: 'Dr. Ashok Kumar',
    department: 'Oncology',
    appointmentTime: '09:50 AM',
    type: 'Routine Checkup',
    status: 'Waiting',
    reason: 'Quarterly oncology surveillance scan review.'
  },
  {
    id: 'opd-5',
    tokenNumber: 'A-043',
    patientName: 'Lucas Bennett',
    uhid: '1031072',
    doctor: 'Dr. Sarah Chen',
    department: 'Cardiology',
    appointmentTime: '10:00 AM',
    type: 'New Consultation',
    status: 'Waiting',
    reason: 'Referred for evaluation of irregular heartbeat.'
  },
  {
    id: 'opd-6',
    tokenNumber: 'B-019',
    patientName: 'Sofia Martinez',
    uhid: '1031088',
    doctor: 'Dr. Marcus Wright',
    department: 'Neurology',
    appointmentTime: '08:45 AM',
    type: 'Follow-up',
    status: 'Completed',
    reason: 'Post-seizure monitoring follow-up appointment.'
  },
  {
    id: 'opd-7',
    tokenNumber: 'D-004',
    patientName: 'Ethan Brooks',
    uhid: '1031093',
    doctor: 'Dr. Anthony Fauci',
    department: 'General',
    appointmentTime: '08:30 AM',
    type: 'Routine Checkup',
    status: 'Completed',
    reason: 'Annual physical examination and vaccination review.'
  },
  {
    id: 'opd-8',
    tokenNumber: 'C-010',
    patientName: 'Amara Chukwu',
    uhid: '1031101',
    doctor: 'Dr. Ashok Kumar',
    department: 'Oncology',
    appointmentTime: '10:15 AM',
    type: 'New Consultation',
    status: 'Cancelled',
    reason: 'Patient called in to reschedule due to transport delay.'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiologist',
    department: 'Cardiology',
    successRate: 96,
    yearsExperience: 12,
    patientsServed: 8400,
    consultationFee: 1200,
    available: true,
    about: 'Specializes in interventional cardiology, angioplasty recovery, and long-term heart health management for adult patients.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Wright',
    specialty: 'Neurologist',
    department: 'Neurology',
    successRate: 93,
    yearsExperience: 9,
    patientsServed: 5200,
    consultationFee: 1500,
    available: true,
    about: 'Focuses on migraine management, seizure monitoring, and post-stroke neurological rehabilitation programs.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Ashok Kumar',
    specialty: 'Oncologist',
    department: 'Oncology',
    successRate: 91,
    yearsExperience: 15,
    patientsServed: 6700,
    consultationFee: 1800,
    available: false,
    about: 'Leads quarterly surveillance and treatment planning for oncology patients, with a focus on early detection follow-ups.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Anthony Fauci',
    specialty: 'General Physician',
    department: 'General',
    successRate: 95,
    yearsExperience: 20,
    patientsServed: 12300,
    consultationFee: 800,
    available: true,
    about: 'Provides general physical examinations, vaccination reviews, and routine preventive care for patients of all ages.'
  }
];

export const INITIAL_PHARMACY_ITEMS: PharmacyItem[] = [
  {
    id: 'rx-item-1',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    stock: 420,
    unit: 'tablets',
    reorderLevel: 150,
    expiryDate: '2027-03-15',
    status: 'In Stock'
  },
  {
    id: 'rx-item-2',
    name: 'Paracetamol 650mg',
    category: 'Analgesics',
    stock: 95,
    unit: 'tablets',
    reorderLevel: 200,
    expiryDate: '2026-11-02',
    status: 'Low Stock'
  },
  {
    id: 'rx-item-3',
    name: 'Atorvastatin 20mg',
    category: 'Cardiac',
    stock: 0,
    unit: 'tablets',
    reorderLevel: 100,
    expiryDate: '2026-09-30',
    status: 'Out of Stock'
  },
  {
    id: 'rx-item-4',
    name: 'IV Cannula 18G',
    category: 'Consumables',
    stock: 310,
    unit: 'units',
    reorderLevel: 100,
    expiryDate: '2028-01-10',
    status: 'In Stock'
  },
  {
    id: 'rx-item-5',
    name: 'Vitamin D3 60K IU',
    category: 'Vitamins',
    stock: 60,
    unit: 'capsules',
    reorderLevel: 80,
    expiryDate: '2026-07-22',
    status: 'Low Stock'
  },
  {
    id: 'rx-item-6',
    name: 'Heparin Injection',
    category: 'Cardiac',
    stock: 145,
    unit: 'vials',
    reorderLevel: 50,
    expiryDate: '2026-06-30',
    status: 'In Stock'
  },
  {
    id: 'rx-item-7',
    name: 'Surgical Gauze Pads',
    category: 'Consumables',
    stock: 18,
    unit: 'boxes',
    reorderLevel: 40,
    expiryDate: '2029-02-01',
    status: 'Low Stock'
  },
  {
    id: 'rx-item-8',
    name: 'Ibuprofen 400mg',
    category: 'Analgesics',
    stock: 260,
    unit: 'tablets',
    reorderLevel: 120,
    expiryDate: '2026-12-18',
    status: 'In Stock'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'pres-1',
    patientName: 'Robert Miller',
    uhid: '1029384',
    doctor: 'Dr. Sarah Chen',
    medicines: ['Atorvastatin 20mg — 1 tab nightly', 'Aspirin 75mg — 1 tab morning'],
    date: '14 Jun 2026',
    status: 'Pending'
  },
  {
    id: 'pres-2',
    patientName: 'Sarah Jenkins',
    uhid: '1029412',
    doctor: 'Dr. Marcus Wright',
    medicines: ['Levetiracetam 500mg — twice daily'],
    date: '14 Jun 2026',
    status: 'Pending'
  },
  {
    id: 'pres-3',
    patientName: 'Michael Tran',
    uhid: '1031022',
    doctor: 'Dr. Sarah Chen',
    medicines: ['Clopidogrel 75mg — 1 tab daily', 'Metoprolol 50mg — twice daily'],
    date: '14 Jun 2026',
    status: 'Pending'
  },
  {
    id: 'pres-4',
    patientName: 'Daniel Osei',
    uhid: '1031051',
    doctor: 'Dr. Marcus Wright',
    medicines: ['Propranolol 40mg — twice daily', 'Paracetamol 650mg — as needed'],
    date: '13 Jun 2026',
    status: 'Dispensed'
  },
  {
    id: 'pres-5',
    patientName: 'Grace Williams',
    uhid: '1031060',
    doctor: 'Dr. Ashok Kumar',
    medicines: ['Ondansetron 8mg — before chemo session'],
    date: '14 Jun 2026',
    status: 'Pending'
  }
];

export const INITIAL_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ai-1',
    type: 'Risk Alert',
    title: 'Elevated readmission risk detected',
    description: 'Robert Miller (UHID 1029384) shows a 78% predicted likelihood of 30-day readmission based on recent vitals trends and discharge plan complexity.',
    severity: 'High',
    confidence: 91,
    relatedTo: 'Robert Miller — Ward 4B',
    timestamp: '08:12 AM'
  },
  {
    id: 'ai-2',
    type: 'Resource Forecast',
    title: 'ICU bed demand spike expected',
    description: 'Forecast model predicts ICU occupancy will exceed 90% within 48 hours based on current admission velocity in the Cardiology and Neurology units.',
    severity: 'Medium',
    confidence: 84,
    relatedTo: 'Ward 4B / ICU Wing',
    timestamp: '07:45 AM'
  },
  {
    id: 'ai-3',
    type: 'Anomaly Detection',
    title: 'Unusual lab result pattern flagged',
    description: 'Sarah Jenkins’ latest CBC panel deviates significantly from her 6-month baseline trend — recommend clinician review before next dosage adjustment.',
    severity: 'High',
    confidence: 88,
    relatedTo: 'Sarah Jenkins — Ward 2A',
    timestamp: '07:30 AM'
  },
  {
    id: 'ai-4',
    type: 'Care Recommendation',
    title: 'Consider early mobilization protocol',
    description: 'Post-operative recovery data for similar cardiac cases suggests early mobilization may reduce average length-of-stay by 1.2 days.',
    severity: 'Low',
    confidence: 76,
    relatedTo: 'Cardiology Department',
    timestamp: '06:55 AM'
  },
  {
    id: 'ai-5',
    type: 'Resource Forecast',
    title: 'Pharmacy stock depletion forecast',
    description: 'Atorvastatin 20mg is projected to reach zero stock within 3 days given current prescription velocity. Reorder recommended immediately.',
    severity: 'Medium',
    confidence: 95,
    relatedTo: 'Pharmacy Inventory',
    timestamp: '06:20 AM'
  },
  {
    id: 'ai-6',
    type: 'Risk Alert',
    title: 'High fall-risk patient identified',
    description: 'Evelyn Thorne’s mobility assessment and medication profile indicate elevated fall risk overnight — recommend bed rail and hourly checks.',
    severity: 'Medium',
    confidence: 82,
    relatedTo: 'Evelyn Thorne — Ward 4B',
    timestamp: '05:50 AM'
  },
  {
    id: 'ai-7',
    type: 'Care Recommendation',
    title: 'Documentation compliance nudge',
    description: '4 MRD files remain unverified for over 48 hours. Prioritizing these reviews may improve audit compliance scores this week.',
    severity: 'Low',
    confidence: 70,
    relatedTo: 'MRD Records',
    timestamp: '05:10 AM'
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1',
    subject: 'ECG monitor in Bay 3 not powering on',
    requestedBy: 'Nurse Patel',
    department: 'Cardiology',
    category: 'Equipment',
    priority: 'Critical',
    status: 'Open',
    createdAt: '14 Jun 2026, 07:20 AM',
    assignedTo: 'Biomedical Eng. Team'
  },
  {
    id: 'tkt-2',
    subject: 'Cannot access MRD upload module on Ward 2A terminal',
    requestedBy: 'Dr. Marcus Wright',
    department: 'Neurology',
    category: 'IT Support',
    priority: 'High',
    status: 'In Progress',
    createdAt: '14 Jun 2026, 06:50 AM',
    assignedTo: 'IT Helpdesk - Raj'
  },
  {
    id: 'tkt-3',
    subject: 'Request additional login seats for night shift',
    requestedBy: 'Ward Admin - Lisa',
    department: 'Administration',
    category: 'Software Access',
    priority: 'Medium',
    status: 'Open',
    createdAt: '13 Jun 2026, 09:15 PM',
    assignedTo: 'IT Helpdesk - Raj'
  },
  {
    id: 'tkt-4',
    subject: 'Air conditioning unit malfunctioning in Ward 4B',
    requestedBy: 'Nurse Coordinator - Tom',
    department: 'Facilities',
    category: 'Facilities',
    priority: 'High',
    status: 'In Progress',
    createdAt: '13 Jun 2026, 04:30 PM',
    assignedTo: 'Facilities Crew B'
  },
  {
    id: 'tkt-5',
    subject: 'Printer in Pharmacy out of toner',
    requestedBy: 'Pharmacist - Anjali',
    department: 'Pharmacy',
    category: 'Equipment',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '12 Jun 2026, 11:00 AM',
    assignedTo: 'Facilities Crew A'
  },
  {
    id: 'tkt-6',
    subject: 'Password reset request for Dr. Ashok Kumar',
    requestedBy: 'Dr. Ashok Kumar',
    department: 'Oncology',
    category: 'IT Support',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '12 Jun 2026, 09:40 AM',
    assignedTo: 'IT Helpdesk - Raj'
  }
];
