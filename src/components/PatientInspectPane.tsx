import React from 'react';
import { BedDouble, FileText, HeartPulse, Stethoscope, UsersRound, X, Download, Plus, Trash2 } from 'lucide-react';
import { CareTeamRole, DepartmentName, Patient } from '../types';
import {
  DOCTOR_OPTIONS,
  departmentAbbreviation,
  departmentChipClass,
  DEPARTMENT_OPTIONS,
  CARE_TEAM_ROLES,
  getCareTeam,
  getDepartments,
  getPrimaryDoctor,
  roleChipClass,
  buildCareTeamMember,
  normalizeDepartment
} from '../careTeam';
import { downloadPatientReport } from '../utils/reportGenerator';

interface PatientInspectPaneProps {
  patient: Patient | null;
  onClose: () => void;
  onEdit: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
}

const LABEL_OPTIONS: Patient['labels'][number][] = ['Payment Defaulter', 'Insurance', 'High Priority'];

export default function PatientInspectPane({ patient, onClose, onEdit, onUpdatePatient }: PatientInspectPaneProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'careTeam' | 'timeline' | 'documents'>('overview');
  const [localPatient, setLocalPatient] = React.useState<Patient | null>(patient);
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>(patient?.attendingDoctor || DOCTOR_OPTIONS[0]);
  const [selectedDepartment, setSelectedDepartment] = React.useState<DepartmentName>(patient?.department || DEPARTMENT_OPTIONS[0]);
  const [selectedRole, setSelectedRole] = React.useState<CareTeamRole>('Cross Consultant');

  React.useEffect(() => {
    setLocalPatient(patient);
    setSelectedDoctor(patient?.attendingDoctor || DOCTOR_OPTIONS[0]);
    setSelectedDepartment(patient?.department || DEPARTMENT_OPTIONS[0]);
  }, [patient]);

  if (!patient || !localPatient) {
    return (
      <aside className="hidden xl:flex w-[420px] shrink-0 flex-col border-l border-slate-200/40 bg-[#f8fafc] rounded-3xl shadow-[0_2px_8px_rgba(130,134,146,0.08),0_-2px_8px_rgba(255,255,255,0.8)] sticky top-24">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <UsersRound className="w-7 h-7" />
            </div>
            <p className="text-sm font-black text-slate-900">Patient Inspect Pane</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 max-w-[240px]">
              Select Details on any patient card to review care team ownership, departments, and activity here.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const careTeam = getCareTeam(localPatient);
  const departments = getDepartments(localPatient);
  const primary = getPrimaryDoctor(localPatient);
  const timeline = careTeam.slice(0, 4).map((member, index) => ({
    id: member.id,
    title: member.role === 'Primary Consultant' ? 'Care plan reviewed' : `${member.role} update`,
    body: `${member.doctor.replace('Dr. ', '')} coordinated ${member.department}.`,
    time: member.lastSeen || (index === 0 ? '08:45 AM' : 'Today')
  }));

  const updatePatient = (updated: Patient) => {
    setLocalPatient(updated);
    onUpdatePatient(updated);
  };

  const handleAddDoctor = () => {
    if (!localPatient) return;
    const newMember = buildCareTeamMember(selectedDoctor, selectedRole, selectedDepartment);
    const updatedTeam = [...careTeam, newMember];
    const updatedDepartments = Array.from(new Set([
      ...getDepartments({ ...localPatient, careTeam: updatedTeam }),
      normalizeDepartment(selectedDepartment)
    ])) as DepartmentName[];
    const updatedPatient: Patient = {
      ...localPatient,
      careTeam: updatedTeam,
      departments: updatedDepartments,
      attendingDoctor: selectedRole === 'Primary Consultant' ? selectedDoctor : localPatient.attendingDoctor
    };
    updatePatient(updatedPatient);
  };

  const handleRemoveDoctor = (doctorId: string) => {
    if (!localPatient) return;
    const updatedTeam = careTeam.filter((member) => member.id !== doctorId);
    const nextPrimary = updatedTeam.find((member) => member.role === 'Primary Consultant') || updatedTeam[0];
    const updatedPatient: Patient = {
      ...localPatient,
      careTeam: updatedTeam,
      attendingDoctor: nextPrimary?.doctor || localPatient.attendingDoctor,
      department: nextPrimary?.department || localPatient.department,
      departments: Array.from(new Set(getDepartments({ ...localPatient, careTeam: updatedTeam }))) as DepartmentName[]
    };
    updatePatient(updatedPatient);
  };

  const handleToggleLabel = (label: Patient['labels'][number]) => {
    if (!localPatient) return;
    const hasLabel = localPatient.labels.includes(label);
    const updatedLabels = hasLabel
      ? localPatient.labels.filter((item) => item !== label)
      : [...localPatient.labels, label];
    const updatedPatient: Patient = {
      ...localPatient,
      labels: updatedLabels
    };
    updatePatient(updatedPatient);
  };

  return (
    <aside className="hidden xl:flex w-[420px] shrink-0 flex-col border-l border-slate-100 bg-white rounded-3xl shadow-card sticky top-24">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient Overview</p>
            <h2 className="text-lg font-black text-slate-950 mt-1">{localPatient.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-sm cursor-pointer"
            aria-label="Close patient details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <section className="mt-5 bg-[#f8fafc] border border-slate-200/40 rounded-[24px] p-4 shadow-[0_2px_8px_rgba(130,134,146,0.08),0_-2px_8px_rgba(255,255,255,0.8)]">
          <div className="flex items-center gap-3">
            {localPatient.avatar ? (
              <img src={localPatient.avatar} alt={localPatient.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-sm shrink-0">
                {localPatient.initials}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-950 truncate">{localPatient.name}</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">{localPatient.gender} / {localPatient.age}y</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UHID</p>
              <p className="text-xs font-mono font-black text-slate-900 mt-1">{localPatient.uhid}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bed</p>
              <p className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                {localPatient.ward} / {localPatient.bed}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-4 bg-[#f8fafc] border border-slate-200/40 rounded-[24px] p-4 shadow-[0_2px_8px_rgba(130,134,146,0.08),0_-2px_8px_rgba(255,255,255,0.8)]">
          <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
            <div>
              <p className="font-black text-slate-400 uppercase tracking-widest">Admitted</p>
              <p className="mt-1 font-black text-slate-950">{localPatient.admissionDate || '—'}</p>
            </div>
            <div>
              <p className="font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="mt-1 font-black text-slate-950">{localPatient.status}</p>
            </div>
            <div>
              <p className="font-black text-slate-400 uppercase tracking-widest">Department</p>
              <p className="mt-1 font-black text-slate-950">{localPatient.department}</p>
            </div>
            <div>
              <p className="font-black text-slate-400 uppercase tracking-widest">Ward</p>
              <p className="mt-1 font-black text-slate-950">{localPatient.ward}</p>
            </div>
          </div>
        </div>

        <section className="mt-4 bg-white border border-slate-100 rounded-[24px] p-4 shadow-sm">
        <div className="flex items-start gap-3">
          {primary?.avatar ? (
            <img src={primary.avatar} alt={primary.doctor} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
              {(primary?.doctor || localPatient.attendingDoctor).replace('Dr. ', '').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Primary Consultant</p>
            <p className="text-sm font-black text-slate-950 mt-0.5 truncate">{primary?.doctor || localPatient.attendingDoctor}</p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">Single accountable care owner</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {departments.map((department) => (
            <span key={department} className={`px-2.5 py-1 rounded-full border text-[10px] font-black ${departmentChipClass(department)}`}>
              {department}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-4 bg-white border border-slate-100 rounded-[24px] p-2 shadow-sm">
        <div className="flex bg-[#f1f3f9] p-1.5 rounded-2xl border border-slate-200/40 gap-1 overflow-x-auto no-scrollbar">
          {(['overview', 'careTeam', 'timeline', 'documents'] as const).map((tab) => {
            const labelMap = {
              overview: 'Overview',
              careTeam: 'Team',
              timeline: 'Timeline',
              documents: 'Docs'
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[64px] py-2 px-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-[#ebedf4]/50'
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Care Team ({careTeam.length})</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('careTeam')}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {careTeam.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.doctor} className="w-9 h-9 rounded-full object-cover border border-white shadow-sm shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-[10px] shrink-0">
                          {member.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-950 truncate">{member.doctor}</p>
                        <p className="text-[10px] text-slate-500 truncate">{member.department}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wide ${roleChipClass(member.role)}`}>
                          {member.role}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wide ${departmentChipClass(member.department)}`}>
                          {departmentAbbreviation(member.department)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <span className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Departments ({departments.length})</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {departments.map((department) => (
                    <span key={department} className={`px-2.5 py-1 rounded-full border text-[10px] font-black ${departmentChipClass(department)}`}>
                      {department}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Manage Doctors</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Add / remove</span>
                </div>
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    {DOCTOR_OPTIONS.map((doctor) => (
                      <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as CareTeamRole)}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      {CARE_TEAM_ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value as DepartmentName)}
                      className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      {DEPARTMENT_OPTIONS.map((department) => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDoctor}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add doctor
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {careTeam.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-950 truncate">{member.doctor}</p>
                        <p className="text-[10px] text-slate-500">{member.role} • {member.department}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoctor(member.id)}
                        disabled={member.role === 'Primary Consultant' && careTeam.length === 1}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Remove ${member.doctor}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <span className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Key Information</span>
                <div className="mt-3 space-y-2.5 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Ward / Bed</span>
                    <span className="font-black text-slate-900">{localPatient.ward} / {localPatient.bed}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Admission Date</span>
                    <span className="font-black text-slate-900">{localPatient.admissionDate || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Attending Nurse</span>
                    <span className="font-black text-slate-900 truncate max-w-[60%] text-right">{localPatient.attendingDoctor}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Insurance</span>
                    <span className="font-black text-slate-900">{localPatient.labels.includes('Insurance') ? 'MediCare Plus' : 'Standard'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-3">
                    {LABEL_OPTIONS.map((label) => {
                      const isSelected = localPatient.labels.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleToggleLabel(label)}
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Recent Activity</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('timeline')}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {timeline.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-950 truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.body}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'careTeam' && (
            <div className="space-y-3">
              {careTeam.map((member) => (
                <article key={member.id} className="rounded-[20px] border border-slate-100 bg-slate-50 p-4 flex items-center gap-3">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.doctor} className="w-11 h-11 rounded-full object-cover border border-white shadow-sm" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                      {member.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950 truncate">{member.doctor}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{member.department}</p>
                  </div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${roleChipClass(member.role)}`}>
                    {member.role}
                  </span>
                </article>
              ))}
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={item.id} className="rounded-[20px] bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3 text-sm font-black text-slate-950">
                    <span>{item.title}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">{item.time}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">{item.body}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                {localPatient.uploadedDocsCount ? (
                  <p>{localPatient.uploadedDocsCount} document{localPatient.uploadedDocsCount > 1 ? 's' : ''} attached to this patient.</p>
                ) : (
                  <p>No documents currently available for this patient.</p>
                )}
              </div>
              <button type="button" className="w-full rounded-full bg-blue-600 px-4 py-3 text-xs font-black uppercase text-white hover:bg-blue-700 transition-colors">
                Upload new document
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onEdit(localPatient)}
          className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => downloadPatientReport(localPatient)}
          className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          title="Download patient report dossier"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          Report
        </button>
        <button
          type="button"
          className="h-10 bg-white hover:bg-slate-50 border border-slate-100 text-slate-700 rounded-full text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
          Rounds
        </button>
      </div>      </div>
      <p className="mt-4 text-[10px] font-semibold text-slate-400 leading-relaxed flex items-start gap-2">
        <Stethoscope className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        Primary consultant stays visible while supporting departments and roles remain available for quick clinical review.
      </p>
    </aside>
  );
}
