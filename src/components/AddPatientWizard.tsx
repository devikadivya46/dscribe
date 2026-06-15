import React from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus,
  Bed, 
  Info, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Lock,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { Patient, CareTeamRole, DepartmentName } from '../types';
import { DOCTOR_OPTIONS, DEPARTMENT_OPTIONS, CARE_TEAM_ROLES, buildCareTeamMember, getCareTeam } from '../careTeam';

interface AddPatientWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  initialPatient?: Patient | null;
}

const WARD_BEDS = [
  { id: '101', label: 'B-101', status: 'available' },
  { id: '102', label: 'B-102', status: 'available' },
  { id: '103', label: 'B-103', status: 'occupied' },
  { id: '104', label: 'B-104', status: 'occupied' },
  { id: '105', label: 'B-105', status: 'available' },
  { id: '106', label: 'B-106', status: 'occupied' },
  { id: '107', label: 'B-107', status: 'available' },
  { id: '108', label: 'B-108', status: 'occupied' },
];

export default function AddPatientWizard({ isOpen, onClose, onSave, initialPatient }: AddPatientWizardProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [errorMsg, setErrorMsg] = React.useState('');

  // STEP 1: Personal Details State
  const [uhid, setUhid] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = React.useState('');

  // STEP 2: Ward Details State
  const [doctor, setDoctor] = React.useState('Dr. Sarah Chen');
  const [department, setDepartment] = React.useState<'Cardiology' | 'Neurology' | 'General' | 'Oncology' | 'Pediatrics' | 'Intensive Care' | 'General Medicine' | 'ICU'>('Cardiology');
  const [ward, setWard] = React.useState('Ward 4B');
  const [bed, setBed] = React.useState('B-102');
  const [crossConsultant, setCrossConsultant] = React.useState('');
  const [careTeamList, setCareTeamList] = React.useState<{ doctor: string; department: DepartmentName; role: CareTeamRole }[]>([]);

  // STEP 3: Admission Details State
  const [admissionDate, setAdmissionDate] = React.useState('');
  const [plan, setPlan] = React.useState<'Basic' | 'Premium' | 'Insurance Covered' | 'None'>('Insurance Covered');
  const [referredBy, setReferredBy] = React.useState('');
  const [uploadedDocsCount, setUploadedDocsCount] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedLabels, setSelectedLabels] = React.useState<('Payment Defaulter' | 'Insurance' | 'High Priority')[]>([]);

  // Sync state on load or edit modal change
  React.useEffect(() => {
    if (initialPatient) {
      setUhid(initialPatient.uhid);
      setFirstName(initialPatient.firstName || initialPatient.name.split(' ')[0] || '');
      setLastName(initialPatient.lastName || initialPatient.name.split(' ').slice(1).join(' ') || '');
      setPhone(initialPatient.phone || '');
      setDob(initialPatient.dob || '');
      setGender(initialPatient.gender || 'Male');
      setAddress(initialPatient.address || '');

      setDoctor(initialPatient.attendingDoctor || 'Dr. Sarah Chen');
      setDepartment(initialPatient.department || 'Cardiology');
      setWard(initialPatient.ward || 'Ward 4B');
      setBed(initialPatient.bed || 'B-102');
      setCrossConsultant(initialPatient.crossConsultant || 'Dr. Anthony Fauci');

      const existingTeam = initialPatient.careTeam && initialPatient.careTeam.length > 0 
        ? initialPatient.careTeam.map(m => ({ doctor: m.doctor, department: m.department, role: m.role }))
        : [
            { doctor: initialPatient.attendingDoctor || 'Dr. Sarah Chen', department: (initialPatient.department || 'Cardiology') as DepartmentName, role: 'Primary Consultant' as CareTeamRole }
          ];
      setCareTeamList(existingTeam);

      setAdmissionDate(initialPatient.admissionDate ? initialPatient.admissionDate.substring(0, 10) : '2026-06-14');
      setPlan(initialPatient.plan || 'Insurance Covered');
      setReferredBy(initialPatient.referredBy || 'Central Clinic');
      setUploadedDocsCount(initialPatient.uploadedDocsCount ?? 2);
      setSelectedLabels(initialPatient.labels || []);
      setStep(1);
    } else {
      // Clear all state for fresh new intake
      const randomUHID = Math.floor(1000000 + Math.random() * 9000000).toString();
      setUhid(randomUHID);
      setFirstName('');
      setLastName('');
      setPhone('');
      setDob('');
      setGender('Male');
      setAddress('');

      setDoctor('Dr. Sarah Chen');
      setDepartment('Cardiology');
      setWard('Ward 4B');
      setBed('B-101');
      setCrossConsultant('');

      setCareTeamList([
        { doctor: 'Dr. Sarah Chen', department: 'Cardiology', role: 'Primary Consultant' as CareTeamRole }
      ]);

      setAdmissionDate('2026-06-14');
      setPlan('Insurance Covered');
      setReferredBy('');
      setUploadedDocsCount(0);
      setSelectedLabels([]);
      setStep(1);
    }
    setErrorMsg('');
  }, [initialPatient, isOpen]);

  // Accessibility: close on Escape key press
  const wizardRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Focus Trap within wizard boundaries
  React.useEffect(() => {
    if (!isOpen) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const currentWizard = wizardRef.current;
    if (!currentWizard) return;

    // Wait slightly for step transition DOM rendering to settle
    const r = setTimeout(() => {
      const focusableElements = (Array.from(
        currentWizard.querySelectorAll(focusableSelector)
      ) as HTMLElement[]).filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));

      if (focusableElements.length > 0) {
        // Let's avoid resetting focus if active element is already inside the wizard
        if (!currentWizard.contains(document.activeElement)) {
          focusableElements[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const elements = (Array.from(
        currentWizard.querySelectorAll(focusableSelector)
      ) as HTMLElement[]).filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));

      if (elements.length === 0) return;

      const firstEl = elements[0];
      const lastEl = elements[elements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab navigation
        if (document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        }
      } else {
        // Tab navigation
        if (document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(r);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  // Validation before changing steps
  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!uhid.trim()) {
        setErrorMsg('UHID registration number is required.');
        return;
      }
      if (!firstName.trim()) {
        setErrorMsg('Please specify the patient’s First Name.');
        return;
      }
      if (!lastName.trim()) {
        setErrorMsg('Please specify the patient’s Last Name.');
        return;
      }
      if (!dob) {
        setErrorMsg('Please specify the patient’s Date of Birth.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please provide a secure contact telephone number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (careTeamList.length === 0) {
        setErrorMsg('Please assign at least one doctor / specialist practitioner to the care team.');
        return;
      }
      if (!bed.trim()) {
        setErrorMsg('Bed allocation is required. Click on a free slot below.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step > 1) {
      setStep((p) => (p - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!admissionDate) {
      setErrorMsg('Please pick a secure Admission Date stamp.');
      return;
    }

    const compiledName = `${firstName.trim()} ${lastName.trim()}`;
    const patientInitials = `${firstName.slice(0,1)}${lastName.slice(0,1)}`.toUpperCase();

    // Create / edit patient entry data
    const finalCareTeam = careTeamList.map((m, idx) =>
      buildCareTeamMember(m.doctor, m.role, m.department, `${Date.now()}-${idx}`)
    );

    const primaryMember = finalCareTeam.find(m => m.role === 'Primary Consultant') || finalCareTeam[0];
    const finalDepartment = primaryMember ? primaryMember.department : ('General Medicine' as DepartmentName);
    const finalDepartments = Array.from(new Set(finalCareTeam.map(m => m.department))) as DepartmentName[];

    // Status is Provisional Admission by default or preserved from existing
    const finalStatus = initialPatient?.status || 'Provisional Admission';

    const updatedRecord: Patient = {
      id: initialPatient?.id || `pat-${Date.now()}`,
      uhid: uhid.trim(),
      name: compiledName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      age: dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 65,
      phone: phone.trim(),
      dob,
      address: address.trim() || 'No address registered',
      ward,
      bed,
      department: finalDepartment,
      departments: finalDepartments,
      attendingDoctor: primaryMember ? primaryMember.doctor : 'Dr. Sarah Chen',
      crossConsultant: finalCareTeam.find(m => m.role === 'Cross Consultant')?.doctor || 'None',
      careTeam: finalCareTeam,
      status: finalStatus,
      labels: selectedLabels,
      admissionDate,
      plan,
      referredBy: referredBy.trim() || 'Direct Attending Walk-in',
      uploadedDocsCount: uploadedDocsCount,
      initials: patientInitials || 'RM',
      avatar: initialPatient?.avatar
    };

    onSave(updatedRecord);
    onClose();
  };

  // Logic to determine priority label output list based on age & status
  const labelSelection = (): ('Payment Defaulter' | 'Insurance' | 'High Priority')[] => {
    const list: ('Payment Defaulter' | 'Insurance' | 'High Priority')[] = [];
    if (plan === 'Insurance Covered' || plan === 'Premium') {
      list.push('Insurance');
    }
    // High Priority assigned loosely to elderly patients (above 70 years of age) or specific departments
    const ageNum = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 65;
    if (ageNum > 70 || department === 'Intensive Care') {
      list.push('High Priority');
    }
    return list;
  };

  const simulateDocUpload = () => {
    setUploadedDocsCount((prev) => prev + 1);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div ref={wizardRef} className="bg-[#f1f3f9] rounded-3xl w-full max-w-[720px] shadow-[8px_8px_24px_rgba(210,215,229,0.55),-8px_-8px_24px_#ffffff] border border-white/60 flex flex-col relative my-8 overflow-hidden">
        
        {/* Top Header dismiss button */}
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 w-10 h-10 rounded-xl hover:bg-[#ebedf4] bg-[#f1f3f9] shadow-nm-button flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all z-10 border border-white cursor-pointer active:scale-95"
          title="Dismiss intake portal"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Progress Section */}
        <div className="px-8 py-7 border-b border-slate-200 bg-[#f1f3f9] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center text-white font-extrabold shadow-[2px_2px_6px_rgba(0,102,255,0.25)] border border-blue-400/20">
              U
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {initialPatient ? 'Modify Active Patient Registry' : 'Electronic Patient Intake Wizard'}
              </h2>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                Simplified documentation workflow designed with accessibility and cognitive reduction.
              </p>
            </div>
          </div>

          {/* Wizard Progressive Steps Visual indicator */}
          <div className="relative flex items-center justify-between mt-8 mb-2 px-6">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[#cbd5e1]/40 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-[#0066FF] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {[
              { num: 1, label: '1. Personal Info' },
              { num: 2, label: '2. Ward & Bed' },
              { num: 3, label: '3. Admission details' }
            ].map((s) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Allow backtracking if credentials verified
                      if (s.num < step) setStep(s.num as any);
                    }}
                    disabled={s.num >= step}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold transition-all border ${
                      isCompleted 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm cursor-pointer active:scale-95' 
                        : isActive 
                          ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-100 shadow-nm-button scale-110' 
                          : 'bg-[#f1f3f9] text-slate-400 border-white/60 shadow-nm-inset-small cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : s.num}
                  </button>
                  <span className={`text-[10px] font-black mt-1.5 uppercase tracking-wide px-2 py-0.5 rounded ${
                    isActive ? 'text-[#0066FF] bg-blue-50/50 font-black' : 'text-slate-400 font-bold'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Input container */}
        <div className="p-8 max-h-[55vh] overflow-y-auto space-y-6 custom-scrollbar">
          
          {errorMsg && (
            <div 
              className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-2xl text-xs font-extrabold flex items-start gap-2.5 animate-bounce"
              role="alert"
            >
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold uppercase tracking-wider text-[10px] text-rose-700">Admission Error Prevention</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
                  {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-[#ebedf4]/65 border border-white/65 p-4 rounded-2xl flex items-start gap-3 shadow-nm-inset-small">
                <Info className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed font-bold">
                  <span className="font-extrabold text-slate-900">Patient Personal Details:</span> Kindly fill in the baseline identification parameters. The fields are scaled large to ensure readability for hospital personnel.
                </div>
              </div>

              {/* UHID Identificator Line */}
              <div className="space-y-1.5">
                <label htmlFor="wizard-uhid" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Unique Hospital ID (UHID) *
                </label>
                <input 
                  id="wizard-uhid"
                  type="text"
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value)}
                  placeholder="e.g. 1029384"
                  className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-slate-900 font-mono font-extrabold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all text-sm"
                />
              </div>

              {/* Name fields split out to reduce spelling mistakes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="wizard-fname" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    First Name *
                  </label>
                  <input 
                    id="wizard-fname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Robert"
                    className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-slate-900 text-sm font-extrabold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wizard-lname" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Last Name *
                  </label>
                  <input 
                    id="wizard-lname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Miller"
                    className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-slate-900 text-sm font-extrabold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all"
                  />
                </div>
              </div>

              {/* DOB and Gender details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="wizard-dob" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <input 
                      id="wizard-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-xs font-bold text-slate-930 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Assigned Gender *
                  </label>
                  <div className="flex bg-[#e8ecf4] p-1 border border-white/60 shadow-nm-inset-small rounded-xl h-14">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          gender === g 
                            ? 'bg-[#0066FF] text-white shadow-md font-black' 
                            : 'text-slate-600 hover:text-[#0b1c30] hover:bg-[#f1f3f9]/50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Telephone Contact Number */}
              <div className="space-y-1.5">
                <label htmlFor="wizard-phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Secure Phone Contact *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    id="wizard-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-14 pl-12 pr-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all"
                  />
                </div>
              </div>

              {/* Residential Street Address */}
              <div className="space-y-1.5">
                <label htmlFor="wizard-address" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Residential Street Address
                </label>
                <textarea 
                  id="wizard-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, City or Sector, State, ZIP code pin"
                  rows={2}
                  className="w-full p-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Ward Information */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-[#ebedf4]/65 border border-white/60 p-4 rounded-2xl flex items-start gap-3 shadow-nm-inset-small">
                <Bed className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed font-bold">
                  <span className="font-extrabold text-slate-900">Bed Allocator & Medical Personnel:</span> Select a physical ward coordinate, register the designated specialty, and assign secondary cross-consultant oversight.
                </div>
              </div>

              {/* Care Team Composition Board */}
              <div className="p-5 bg-[#f1f3f9] border border-white/80 shadow-nm-flat rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    Care Team Composition Board (Primary & Cross-Consultation) *:
                  </span>
                  <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                    {careTeamList.length} STAFF ASSIGNED
                  </span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {careTeamList.map((member, index) => (
                    <div key={index} className="p-3.5 bg-white/70 border border-white rounded-xl shadow-nm-inset-small space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Clinician</label>
                          <select
                            value={member.doctor}
                            onChange={(e) => {
                              const newTeam = [...careTeamList];
                              newTeam[index].doctor = e.target.value;
                              setCareTeamList(newTeam);
                            }}
                            className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-800 focus:ring-2 focus:ring-blue-150 outline-none"
                          >
                            {DOCTOR_OPTIONS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Department</label>
                          <select
                            value={member.department}
                            onChange={(e) => {
                              const newTeam = [...careTeamList];
                              newTeam[index].department = e.target.value as DepartmentName;
                              setCareTeamList(newTeam);
                            }}
                            className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-800 focus:ring-2 focus:ring-blue-150 outline-none"
                          >
                            {DEPARTMENT_OPTIONS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Assigned Role</label>
                          <select
                            value={member.role}
                            onChange={(e) => {
                              const newTeam = [...careTeamList];
                              newTeam[index].role = e.target.value as CareTeamRole;
                              setCareTeamList(newTeam);
                            }}
                            className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-800 focus:ring-2 focus:ring-blue-150 outline-none"
                          >
                            {CARE_TEAM_ROLES.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {careTeamList.length > 1 && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCareTeamList(careTeamList.filter((_, i) => i !== index));
                            }}
                            className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
                          >
                            Remove Clinician
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCareTeamList([
                        ...careTeamList,
                        { doctor: 'Dr. Sarah Chen', department: 'Cardiology', role: 'Resident Doctor' }
                      ]);
                    }}
                    className="px-4 h-10 bg-[#0066FF] text-white rounded-xl text-xs font-black shadow-nm-button hover:bg-blue-600 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Care Provider</span>
                  </button>
                </div>
              </div>

              {/* Physical Location Details */}
              <div className="grid grid-cols-1 gap-4">

                <div className="space-y-1.5">
                  <label htmlFor="wizard-ward" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Physical Ward Location
                  </label>
                  <select
                    id="wizard-ward"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/85 rounded-xl text-slate-800 font-extrabold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all text-sm cursor-pointer"
                  >
                    <option value="Ward 4B">Ward 4B (Cardiology Floor)</option>
                    <option value="Ward 2A">Ward 2A (Neurology Floor)</option>
                    <option value="ICU-1">ICU Wing (Level 1 Clearance)</option>
                    <option value="General Ward">General Medical Wing</option>
                  </select>
                </div>
              </div>

              {/* Interactive Bed Allocation Panel */}
              <div className="p-5 bg-[#f1f3f9] border border-white/60 shadow-nm-flat rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    Bed Matrix Selector ({ward}):
                  </span>
                  <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                    Bed allocated: {bed}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {WARD_BEDS.map((bd) => {
                    const isOccupied = bd.status === 'occupied';
                    const isSelected = bed === bd.label;
                    return (
                      <button
                        key={bd.id}
                        type="button"
                        onClick={() => {
                          if (!isOccupied) setBed(bd.label);
                        }}
                        className={`h-14 font-mono text-xs font-bold rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isOccupied 
                            ? 'bg-rose-50/40 text-rose-500 border-rose-200/50 cursor-not-allowed opacity-50 shadow-nm-inset-small'
                            : isSelected
                              ? 'bg-[#0066FF] text-white border-blue-500 shadow-nm-button scale-102 ring-4 ring-blue-100 font-black'
                              : 'bg-[#f1f3f9] text-slate-700 border-white/80 shadow-nm-button hover:bg-[#ebedf4]'
                        }`}
                        title={isOccupied ? `Bed occupied` : `Bed coordinates`}
                        disabled={isOccupied}
                      >
                        <span className="text-[10px] truncate">{bd.label}</span>
                        <span className="text-[8px] uppercase tracking-wider opacity-60 mt-0.5 font-bold">
                          {isOccupied ? 'Locked' : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Admission Stamp & Details */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-[#ebedf4]/65 border border-white/60 p-4 rounded-2xl flex items-start gap-3 shadow-nm-inset-small">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed font-bold">
                  <span className="font-extrabold text-slate-900">Admission Stamps & Documentation:</span> Formulate the client plan of record, stamp the admission registration, and upload legal HIPAA medical clearance sheets.
                </div>
              </div>

              {/* Date selection & Plan selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="wizard-admdate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Admission Date Stamp *
                  </label>
                  <input
                    id="wizard-admdate"
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-xs font-bold text-slate-933 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wizard-plan" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Special Admission Care Plan
                  </label>
                  <select
                    id="wizard-plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/85 rounded-xl text-slate-800 font-extrabold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all text-xs cursor-pointer"
                  >
                    <option value="Insurance Covered">Insurance Covered Plan (Preferred)</option>
                    <option value="Premium">Premium VIP Care Segment</option>
                    <option value="Basic">Basic Public Covered</option>
                    <option value="None">Direct Self-Paid Private</option>
                  </select>
                </div>
              </div>

              {/* Referred By */}
              <div className="space-y-1.5">
                <label htmlFor="wizard-reffered" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Referred By (Physician or Outbound department)
                </label>
                <input
                  id="wizard-reffered"
                  type="text"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  placeholder="e.g. Dr. Ashok Kumar or Walk-in emergency"
                  className="w-full h-14 px-4 bg-[#f1f3f9] border border-white/80 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all"
                />
              </div>

              {/* Manual Labels/Flags Selection - Custom Multiple Choice */}
              <div className="p-5 bg-white/75 border border-white/80 shadow-nm-inset-small rounded-2xl space-y-3.5">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    Select Patient Flags & Labels (Manual Selection)
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                    Click to attach or detach clinical conditions and billing statuses.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'Insurance', display: '🎗️ Insurance Covered', color: 'border-blue-200 hover:bg-blue-50 text-blue-800' },
                    { id: 'High Priority', display: '🚨 High Priority', color: 'border-red-200 hover:bg-red-50 text-red-800' },
                    { id: 'Payment Defaulter', display: '⚠️ Payment Defaulter', color: 'border-amber-200 hover:bg-amber-50 text-amber-800' }
                  ] as const).map((lbl) => {
                    const isSelected = selectedLabels.includes(lbl.id);
                    return (
                      <button
                        key={lbl.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLabels(selectedLabels.filter(x => x !== lbl.id));
                          } else {
                            setSelectedLabels([...selectedLabels, lbl.id]);
                          }
                        }}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_rgba(0,102,255,0.25)]'
                            : `bg-slate-50/50 text-slate-650 border-slate-150 ${lbl.color}`
                        }`}
                      >
                        <span className="text-[11px] font-black">{lbl.display}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[8px] font-extrabold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Documents simulated Section */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Legal HIPAA Clearance Docs & Consent Sheets
                </label>
                
                <div 
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      simulateDocUpload();
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer focus:outline-none bg-[#f1f3f9] border-white/80 shadow-nm-inset-small hover:border-blue-500 hover:bg-[#ebedf4]/30 ${
                    isDragging ? 'border-[#0066FF] bg-[#ebedf4]/55' : ''
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); simulateDocUpload(); }}
                  onClick={simulateDocUpload}
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs font-extrabold text-slate-800">
                    Drag and Drop Consent PDF sheets or click to browse
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                    Maximum payload limit per file: 12 MB
                  </p>
                </div>

                {/* Upload Tracker Counter with Large numeric buttons */}
                <div className="flex items-center justify-between p-4 bg-[#f1f3f9] border border-white shadow-nm-button rounded-2xl mt-4">
                  <div>
                    <span className="text-[11px] font-black text-slate-705 block">
                      Files linked to this file:
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Verify that signature pages have been audited cleanly.
                    </span>
                  </div>
                  
                  {/* Plus/Minus large Touch controls for file counts */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadedDocsCount(Math.max(0, uploadedDocsCount - 1))}
                      className="w-10 h-10 rounded-full bg-[#f1f3f9] border border-white shadow-nm-button flex items-center justify-center font-extrabold text-slate-800 hover:bg-[#ebedf4] active:scale-95 text-lg cursor-pointer"
                      title="Remove doc link"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-black text-sm text-slate-900 bg-[#f1f3f9] border border-white/60 shadow-nm-inset-small rounded-xl py-2">
                      {uploadedDocsCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadedDocsCount(uploadedDocsCount + 1)}
                      className="w-10 h-10 rounded-full bg-[#f1f3f9] border border-white shadow-nm-button flex items-center justify-center font-extrabold text-slate-700 hover:bg-[#ebedf4] active:scale-95 text-lg cursor-pointer"
                      title="Add doc link"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="p-8 border-t border-slate-200/50 bg-[#f1f3f9] flex items-center justify-between rounded-b-3xl shrink-0">
          <button 
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`h-12 px-5 bg-[#f1f3f9] border border-white hover:bg-[#ebedf4] text-slate-700 font-extrabold rounded-xl transition-all shadow-nm-button active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              step === 1 ? 'opacity-40 cursor-not-allowed pointer-events-none shadow-none border-transparent' : ''
            }`}
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span className="text-xs">Go Back</span>
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="h-12 px-6 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-blue-300 shadow-[0_4px_12px_rgba(0,102,255,0.3)] active:scale-95 transition-all outline-none cursor-pointer border border-blue-400/20"
            >
              <span>Continue Step</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="h-12 px-8 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-blue-300 shadow-[0_4px_12px_rgba(0,102,255,0.3)] active:scale-95 transition-all outline-none cursor-pointer border border-[#0066FF]/25"
              id="submit-admission-btn"
            >
              <span>Verify & Save File</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
