import { CareTeamMember, CareTeamRole, DepartmentName, Patient } from './types';

export const DOCTOR_AVATARS: Record<string, string> = {
  'Dr. Sarah Chen': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=160&h=160',
  'Dr. Ashok Kumar': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=160&h=160',
  'Dr. Marcus Wright': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=160&h=160',
  'Dr. Anthony Fauci': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=160&h=160',
  'Dr. Jayappa J': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=160&h=160',
  'Dr. Priya Sharma': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=160&h=160',
  'Dr. Meera Iyer': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=160&h=160',
  'Dr. Omar Rahman': 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=160&h=160'
};

export const DOCTOR_OPTIONS = [
  'Dr. Sarah Chen',
  'Dr. Ashok Kumar',
  'Dr. Marcus Wright',
  'Dr. Anthony Fauci',
  'Dr. Jayappa J',
  'Dr. Priya Sharma',
  'Dr. Meera Iyer',
  'Dr. Omar Rahman'
];

export const DEPARTMENT_OPTIONS: DepartmentName[] = [
  'Neurology',
  'Oncology',
  'Cardiology',
  'General Medicine',
  'Intensive Care',
  'ICU',
  'Pediatrics'
];

export const CARE_TEAM_ROLES: CareTeamRole[] = [
  'Primary Consultant',
  'Cross Consultant',
  'Resident Doctor',
  'Duty Doctor',
  'Visiting Doctor',
  'Surgeon',
  'Anaesthetist',
  'ICU Doctor'
];

export const normalizeDepartment = (department?: string): DepartmentName => {
  if (department === 'General') return 'General Medicine';
  if (department === 'ICU') return 'Intensive Care';
  return (department || 'General Medicine') as DepartmentName;
};

export const departmentChipClass = (department: string) => {
  const key = normalizeDepartment(department);
  const map: Record<string, string> = {
    Neurology: 'bg-sky-50 text-sky-700 border-sky-200',
    Oncology: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    Cardiology: 'bg-rose-50 text-rose-700 border-rose-200',
    'General Medicine': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Intensive Care': 'bg-amber-50 text-amber-700 border-amber-200',
    ICU: 'bg-amber-50 text-amber-700 border-amber-200',
    Pediatrics: 'bg-violet-50 text-violet-700 border-violet-200'
  };
  return map[key] || 'bg-slate-50 text-slate-700 border-slate-200';
};

export const departmentAbbreviation = (department: string): string => {
  const map: Record<string, string> = {
    Cardiology: 'CARD',
    Neurology: 'NEURO',
    'General Medicine': 'GEN MED',
    Oncology: 'ONCO',
    Pediatrics: 'PEDS',
    'Intensive Care': 'ICU',
    ICU: 'ICU'
  };
  return map[normalizeDepartment(department)] || department.slice(0, 4).toUpperCase();
};

export const roleChipClass = (role: string) => {
  if (role === 'Primary Consultant') return 'bg-blue-600 text-white border-blue-600';
  if (role === 'Resident Doctor') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (role === 'Cross Consultant') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (role === 'ICU Doctor') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

export const buildCareTeamMember = (
  doctor: string,
  role: CareTeamRole,
  department: DepartmentName,
  suffix = Date.now().toString()
): CareTeamMember => ({
  id: `${doctor.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${suffix}`,
  doctor,
  role,
  department: normalizeDepartment(department),
  avatar: DOCTOR_AVATARS[doctor],
  activity: role === 'Primary Consultant' ? 'Care plan owner' : role === 'Resident Doctor' ? 'Daily rounds and notes' : 'Consult note pending',
  lastSeen: role === 'Primary Consultant' ? '08:45 AM' : role === 'Resident Doctor' ? '10:10 AM' : 'Yesterday'
});

export const getCareTeam = (patient: Patient): CareTeamMember[] => {
  if (patient.careTeam && patient.careTeam.length > 0) {
    return patient.careTeam.map((member) => ({
      ...member,
      department: normalizeDepartment(member.department),
      avatar: member.avatar || DOCTOR_AVATARS[member.doctor]
    }));
  }

  const primaryDept = normalizeDepartment(patient.department);
  const team = [
    buildCareTeamMember(patient.attendingDoctor || 'Dr. Sarah Chen', 'Primary Consultant', primaryDept, patient.id)
  ];

  if (patient.crossConsultant && patient.crossConsultant !== 'None') {
    team.push(buildCareTeamMember(patient.crossConsultant, 'Cross Consultant', primaryDept, `${patient.id}-cross`));
  }

  return team;
};

export const getDepartments = (patient: Patient): DepartmentName[] => {
  const fromTeam = getCareTeam(patient).map((member) => normalizeDepartment(member.department));
  const departments = [...(patient.departments || []), normalizeDepartment(patient.department), ...fromTeam];
  return Array.from(new Set(departments.map(normalizeDepartment)));
};

export const getPrimaryDoctor = (patient: Patient) => {
  return getCareTeam(patient).find((member) => member.role === 'Primary Consultant') || getCareTeam(patient)[0];
};

export const migratePatientCareTeam = (patient: Patient): Patient => {
  const careTeam = getCareTeam(patient);
  const departments = getDepartments({ ...patient, careTeam });
  const primary = careTeam.find((member) => member.role === 'Primary Consultant') || careTeam[0];
  return {
    ...patient,
    careTeam,
    departments,
    department: departments[0] || normalizeDepartment(patient.department),
    attendingDoctor: primary?.doctor || patient.attendingDoctor
  };
};
