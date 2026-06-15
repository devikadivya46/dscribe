export type DepartmentName = 'Cardiology' | 'Neurology' | 'General Medicine' | 'General' | 'Oncology' | 'Pediatrics' | 'Intensive Care' | 'ICU';

export type CareTeamRole =
  | 'Primary Consultant'
  | 'Cross Consultant'
  | 'Resident Doctor'
  | 'Duty Doctor'
  | 'Visiting Doctor'
  | 'Surgeon'
  | 'Anaesthetist'
  | 'ICU Doctor';

export interface CareTeamMember {
  id: string;
  doctor: string;
  role: CareTeamRole;
  department: DepartmentName;
  avatar?: string;
  activity?: string;
  lastSeen?: string;
}

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  firstName?: string; // For wizard
  lastName?: string;  // For wizard
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  phone?: string;     // Step 1
  dob?: string;       // Step 1
  address?: string;   // Step 1
  ward: string;
  bed: string;
  department: DepartmentName;
  departments?: DepartmentName[];
  attendingDoctor: string;
  crossConsultant?: string; // Step 2
  careTeam?: CareTeamMember[];
  status: 'Provisional Admission' | 'MRD Pending' | 'Completed' | 'Discharged';
  labels: ('Payment Defaulter' | 'Insurance' | 'High Priority')[];
  admissionDate?: string; // Step 3
  plan?: 'Basic' | 'Premium' | 'Insurance Covered' | 'None'; // Step 3
  referredBy?: string;   // Step 3
  uploadedDocsCount?: number; // Step 3
  initials: string;
  avatar?: string;
}

export interface MRDFile {
  id: string;
  fileName: string;
  patientName: string;
  uhid: string;
  category: 'Clinical' | 'Imaging' | 'Administrative';
  uploadDate: string;
  status: 'Verified' | 'Pending Review' | 'Flagged';
  securityLevel: 'High' | 'Standard' | 'Restricted';
  fileSize: string;
  authoredBy: string;
  notes: string;
  previewUrl: string; // fallback fallback images
}

export interface ActiveFilters {
  doctor: string;
  department: string;
  role: string;
  statuses: string[];
  startDate: string;
  endDate: string;
  labels: string[];
  wards: string[];
}

export interface OutPatientVisit {
  id: string;
  tokenNumber: string;
  patientName: string;
  uhid: string;
  doctor: string;
  department: string;
  appointmentTime: string;
  type: 'New Consultation' | 'Follow-up' | 'Routine Checkup';
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  reason: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  successRate: number;
  yearsExperience: number;
  patientsServed: number;
  consultationFee: number;
  available: boolean;
  about: string;
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: 'Antibiotics' | 'Analgesics' | 'Cardiac' | 'Consumables' | 'Vitamins';
  stock: number;
  unit: string;
  reorderLevel: number;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Prescription {
  id: string;
  patientName: string;
  uhid: string;
  doctor: string;
  medicines: string[];
  date: string;
  status: 'Pending' | 'Dispensed';
}

export interface AIInsight {
  id: string;
  type: 'Risk Alert' | 'Resource Forecast' | 'Anomaly Detection' | 'Care Recommendation';
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  confidence: number;
  relatedTo: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  requestedBy: string;
  department: string;
  category: 'IT Support' | 'Facilities' | 'Equipment' | 'Software Access';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  assignedTo: string;
}
