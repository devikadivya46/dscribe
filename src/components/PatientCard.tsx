import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle,
  ChevronRight,
  FileText,
  MoreVertical,
  PenTool,
  Printer,
  ShieldAlert
} from 'lucide-react';
import { Patient } from '../types';
import { getCareTeam, getPrimaryDoctor } from '../careTeam';

interface PatientCardProps {
  key?: string;
  index?: number;
  patient: Patient;
  isSelected?: boolean;
  compact?: boolean;
  onEdit: (patient: Patient) => void;
  onViewDetails?: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, state: 'Provisional Admission' | 'MRD Pending' | 'Completed' | 'Discharged') => void;
}

const statusConfig = {
  'Provisional Admission': {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    dot: 'bg-amber-500'
  },
  'MRD Pending': {
    bg: 'bg-rose-50 border-rose-200 text-rose-700',
    dot: 'bg-rose-500'
  },
  Completed: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-500'
  },
  Discharged: {
    bg: 'bg-slate-100 border-slate-200 text-slate-600',
    dot: 'bg-slate-400'
  }
};

const labelStyles = {
  'Payment Defaulter': 'bg-rose-50 text-rose-700 border-rose-200',
  Insurance: 'bg-blue-50 text-blue-700 border-blue-200',
  'High Priority': 'bg-violet-50 text-violet-700 border-violet-200'
};

export default function PatientCard({
  index = 0,
  patient,
  isSelected = false,
  compact = false,
  onEdit,
  onViewDetails,
  onDelete,
  onStatusChange
}: PatientCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const primaryDoctor = getPrimaryDoctor(patient);

  const rawStatus = patient.status as string;
  const resolvedStatus = (rawStatus === 'Critical' || rawStatus === 'Pending')
    ? 'Provisional Admission'
    : (rawStatus === 'Stable' ? 'Completed' : patient.status);
  const currentStatusConfig = statusConfig[resolvedStatus as keyof typeof statusConfig] || statusConfig['Provisional Admission'];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDetails = () => (onViewDetails || onEdit)(patient);

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetails();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const careTeam = getCareTeam(patient);
  const visibleCareTeam = careTeam.slice(0, 2);
  const extraCareTeamCount = Math.max(0, careTeam.length - visibleCareTeam.length);

  // High-fidelity compact layout when inspect pane is open (takes up less horizontal width)
  if (compact) {
    return (
      <motion.article
        id={`patient-card-${patient.id}`}
        tabIndex={0}
        role="group"
        aria-label={`Patient ${patient.name} card`}
        onKeyDown={handleCardKeyDown}
        onClick={openDetails}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: Math.min(index * 0.035, 0.22), ease: 'easeOut' }}
        className={`bg-white rounded-3xl hover:shadow-card-hover focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 p-4 sm:p-5 cursor-pointer relative border ${
          isSelected 
            ? 'border-2 border-blue-500 shadow-lg ring-4 ring-blue-100/60' 
            : 'border-slate-150/70 shadow-sm'
        }`}
      >
        {/* Top block: Bio on left, Actions and Navigation on right */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                  {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="min-w-0 text-left">
              <h3 className="text-xs font-black text-slate-900 truncate max-w-[130px]" title={patient.name}>
                {patient.name}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">{patient.gender} • {patient.age}y</p>
              
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${currentStatusConfig.bg}`}>
                  {resolvedStatus === 'Provisional Admission' ? 'Provisional' : resolvedStatus}
                </span>
                {patient.labels?.slice(0, 1).map((label) => (
                  <span key={label} className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${labelStyles[label as keyof typeof labelStyles] || 'bg-slate-50 text-slate-655 border-slate-100'}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <button
                id={`patient-menu-btn-${patient.id}`}
                onClick={(e) => handleActionClick(e, () => setShowMenu(!showMenu))}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150/70 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Patient actions"
                aria-expanded={showMenu}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-9 w-[190px] bg-white border border-slate-150/70 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] py-2 z-55 text-xs text-left"
                >
                  <button onClick={(e) => handleActionClick(e, () => { openDetails(); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    View full file
                  </button>
                  <button onClick={(e) => handleActionClick(e, () => { onStatusChange(patient.id, 'Discharged'); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    Mark discharged
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={(e) => handleActionClick(e, () => { onEdit(patient); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    Edit intake
                  </button>
                  <button onClick={(e) => handleActionClick(e, () => { if (confirm(`Delete ${patient.name} from active lists?`)) onDelete(patient.id); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Delete patient
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => handleActionClick(e, openDetails)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-150'
              }`}
              title="Select / View details"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Divider line */}
        <div className="h-px bg-slate-100/80 my-3" />

        {/* Dynamic lower stack */}
        <div className="space-y-3">
          {/* Doctors block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2 min-w-0">
              {primaryDoctor?.avatar ? (
                <img
                  src={primaryDoctor.avatar}
                  alt={primaryDoctor.doctor}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm shrink-0 animate-fadeIn"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-[9px] shrink-0">
                  {primaryDoctor?.doctor ? primaryDoctor.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase() : 'DR'}
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Consultant</p>
                <h4 className="text-xs font-black text-slate-800 truncate max-w-[130px] mt-0.5 leading-tight" title={primaryDoctor?.doctor || patient.attendingDoctor}>
                  {primaryDoctor?.doctor || patient.attendingDoctor}
                </h4>
              </div>
            </div>

            {/* Overlapping care avatars */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-50/50 p-1 rounded-lg">
              <div className="flex items-center shrink-0">
                {visibleCareTeam.map((member, i) => (
                  member.avatar ? (
                    <img
                      key={member.id}
                      src={member.avatar}
                      alt={member.doctor}
                      className={`w-5 h-5 rounded-full object-cover border border-white shadow-sm shrink-0 ${i > 0 ? '-ml-1.5' : ''}`}
                    />
                  ) : (
                    <div
                      key={member.id}
                      className={`w-5 h-5 rounded-full bg-blue-100 text-blue-800 border-2 border-white flex items-center justify-center text-[7px] font-black shrink-0 ${i > 0 ? '-ml-1.5' : ''}`}
                    >
                      {member.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                    </div>
                  )
                ))}
                {extraCareTeamCount > 0 && (
                  <div className="w-5 h-5 -ml-1.5 rounded-full bg-slate-100 text-slate-650 border border-slate-200 flex items-center justify-center text-[6.5px] font-black shrink-0">
                    +{extraCareTeamCount}
                  </div>
                )}
              </div>
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-450 whitespace-nowrap">
                Care Team • {careTeam.length}
              </span>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-slate-100/50 text-left">
            <div>
              <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">UHID</p>
              <p className="mt-1 text-[10px] font-mono font-black text-slate-800 truncate" title={patient.uhid}>{patient.uhid}</p>
            </div>
            <div>
              <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">Bed</p>
              <p className="mt-1 text-[10px] font-black text-slate-800 truncate" title={patient.bed}>{patient.bed}</p>
            </div>
            <div>
              <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">Ward</p>
              <p className="mt-1 text-[10px] font-black text-slate-800 truncate" title={patient.ward}>{patient.ward}</p>
            </div>
            <div>
              <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">Admitted</p>
              <p className="mt-1 text-[10px] font-black text-slate-800 truncate">
                {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  // We use a high-fidelity horizontal layout for all states (standard and compact) to match the vertical list of horizontal cards in the specs.
  return (
    <motion.article
      id={`patient-card-${patient.id}`}
      tabIndex={0}
      role="group"
      aria-label={`Patient ${patient.name} card`}
      onKeyDown={handleCardKeyDown}
      onClick={openDetails}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.035, 0.22), ease: 'easeOut' }}
      className={`bg-white rounded-3xl hover:shadow-card-hover focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 p-5 cursor-pointer relative ${
        isSelected 
          ? 'border-2 border-blue-500 shadow-lg ring-4 ring-blue-100/60' 
          : 'border border-slate-100/90 shadow-sm'
      }`}
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left Section: Avatar, demographic data, labels, and metrics table */}
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start md:items-center gap-5">
          {/* Column A: Patient Bio block */}
          <div className="flex items-center gap-4 shrink-0 min-w-[200px]">
            <div className="relative shrink-0">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                  {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 truncate" title={patient.name}>
                {patient.name}
              </h3>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">{patient.gender} • {patient.age}y</p>
              
              {/* Labels and key status */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${currentStatusConfig.bg}`}>
                  {resolvedStatus === 'Provisional Admission' ? 'Provisional' : resolvedStatus}
                </span>
                {patient.labels?.slice(0, 2).map((label) => (
                  <span key={label} className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${labelStyles[label as keyof typeof labelStyles] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column B: Horizontal metrics row alignment */}
          <div className="grid grid-cols-4 gap-x-5 gap-y-2 text-left md:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5 min-w-[280px] xl:min-w-[340px]">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">UHID</p>
              <p className="mt-1 text-[11px] font-mono font-black text-slate-800 truncate" title={patient.uhid}>{patient.uhid}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Bed</p>
              <p className="mt-1 text-[11px] font-black text-slate-800 truncate" title={patient.bed}>{patient.bed}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Ward</p>
              <p className="mt-1 text-[11px] font-black text-slate-800 truncate" title={patient.ward}>{patient.ward}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Admitted</p>
              <p className="mt-1 text-[11px] font-black text-slate-800 truncate">
                {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Primary Consultant, Care Team stack, menu actions, and right arrow */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-x-6 gap-y-3 shrink-0 border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 min-w-0">
          {/* Consultant with Small Doctor Avatar */}
          <div className="flex items-center gap-2.5 min-w-0">
            {primaryDoctor?.avatar ? (
              <img
                src={primaryDoctor.avatar}
                alt={primaryDoctor.doctor}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                {primaryDoctor?.doctor ? primaryDoctor.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase() : 'DR'}
              </div>
            )}
            <div className="text-left min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Primary Consultant</p>
              <h4 className="text-xs font-black text-slate-900 truncate max-w-[130px] leading-tight mt-0.5" title={primaryDoctor?.doctor || patient.attendingDoctor}>
                {primaryDoctor?.doctor || patient.attendingDoctor}
              </h4>
              <p className="text-[9px] font-bold text-slate-500 italic mt-0.5 leading-none">
                {primaryDoctor?.department || patient.department || 'General'}
              </p>
            </div>
          </div>

          {/* Overlapping Care Team Avatars Stack */}
          <div className="flex items-center gap-2 bg-slate-50/50 xl:bg-transparent rounded-xl px-2.5 py-1 xl:p-0">
            <div className="flex items-center shrink-0">
              {visibleCareTeam.map((member, i) => (
                member.avatar ? (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt={member.doctor}
                    className={`w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm shrink-0 ${i > 0 ? '-ml-2' : ''}`}
                  />
                ) : (
                  <div
                    key={member.id}
                    className={`w-6 h-6 rounded-full bg-blue-100 text-blue-800 border-2 border-white flex items-center justify-center text-[8px] font-black shrink-0 ${i > 0 ? '-ml-2' : ''}`}
                  >
                    {member.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                  </div>
                )
              ))}
              {extraCareTeamCount > 0 && (
                <div className="w-6 h-6 -ml-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[7px] font-black shrink-0">
                  +{extraCareTeamCount}
                </div>
              )}
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Care Team • {careTeam.length}
            </span>
          </div>

          {/* Action Toolbar buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-auto whitespace-nowrap">
            {/* Quick Actions More-Menu trigger button */}
            <div className="relative">
              <button
                id={`patient-menu-btn-${patient.id}`}
                onClick={(e) => handleActionClick(e, () => setShowMenu(!showMenu))}
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150/70 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Patient actions"
                aria-expanded={showMenu}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-10 w-[200px] bg-white border border-slate-150/70 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] py-2 z-55 text-xs text-left"
                >
                  <button onClick={(e) => handleActionClick(e, () => { openDetails(); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    View full file
                  </button>
                  <button onClick={(e) => handleActionClick(e, () => { onStatusChange(patient.id, 'Discharged'); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    Mark discharged
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, () => {
                      alert(`Print wristband\n\nPatient: ${patient.name}\nUHID: ${patient.uhid}\nBed: ${patient.ward} / ${patient.bed}`);
                      setShowMenu(false);
                    })}
                    className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-violet-600" />
                    Print wristband
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={(e) => handleActionClick(e, () => { onEdit(patient); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    Edit intake
                  </button>
                  <button onClick={(e) => handleActionClick(e, () => { if (confirm(`Delete ${patient.name} from active lists?`)) onDelete(patient.id); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Delete patient
                  </button>
                </div>
              )}
            </div>

            {/* Selection right arrow */}
            <button
              type="button"
              onClick={(e) => handleActionClick(e, openDetails)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-205'
              }`}
              title="Select / View details"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
