import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle,
  ChevronRight,
  FileText,
  MoreVertical,
  PenTool,
  Printer,
  ShieldAlert,
  Download,
  Users
} from 'lucide-react';
import { Patient } from '../types';
import { getCareTeam, getPrimaryDoctor } from '../careTeam';
import { downloadPatientReport } from '../utils/reportGenerator';

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
  searchTerm?: string;
}

const statusConfig = {
  'Provisional Admission': {
    bg: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/70',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500'
  },
  'MRD Pending': {
    bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/70',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500'
  },
  Completed: {
    bg: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300/80',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400'
  },
  Discharged: {
    bg: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300/80',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400'
  }
};

const cardBackgrounds = {
  'Provisional Admission': 'from-slate-50 via-white to-sky-50 border-slate-200 shadow-[0_18px_60px_rgba(56,139,253,0.14)]',
  'MRD Pending': 'from-slate-50 via-white to-sky-50 border-slate-200 shadow-[0_18px_60px_rgba(56,139,253,0.14)]',
  Completed: 'from-slate-50 via-white to-sky-50 border-slate-200 shadow-[0_18px_60px_rgba(56,139,253,0.14)]',
  Discharged: 'from-slate-50 via-white to-sky-50 border-slate-200 shadow-[0_18px_60px_rgba(56,139,253,0.14)]'
};

const labelStyles = {
  'Payment Defaulter': 'bg-slate-950/5 text-slate-950 ring-1 ring-slate-200/80',
  Insurance: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  'High Priority': 'bg-slate-100 text-slate-700 ring-1 ring-slate-300/80'
};

function highlightText(text: string, highlight: string) {
  if (!highlight || !highlight.trim()) {
    return text;
  }
  const cleanHighlight = highlight.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  if (!cleanHighlight) return text;
  const regex = new RegExp(`(${cleanHighlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.trim().toLowerCase() ? (
          <strong key={i} className="font-extrabold text-[#0066FF] bg-blue-50/70 px-0.5 rounded shadow-[0_1px_2px_rgba(0,102,255,0.05)]">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function PatientCard({
  index = 0,
  patient,
  isSelected = false,
  compact = false,
  onEdit,
  onViewDetails,
  onDelete,
  onStatusChange,
  searchTerm = ''
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
        className={`relative overflow-visible rounded-3xl transition-all duration-300 p-4 pr-3 pl-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isSelected
            ? 'border-blue-500 bg-gradient-to-r from-blue-50/10 via-white to-white shadow-[0_10px_24px_rgba(37,99,235,0.07)] ring-4 ring-blue-100/50'
            : `border-slate-100/90 bg-gradient-to-br ${cardBackgrounds[resolvedStatus as keyof typeof cardBackgrounds]} hover:-translate-y-0.5 hover:border-slate-200`
        }`}
      >
        {/* Top block: Bio on left, Actions and Navigation on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100/50 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                  {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sky-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="min-w-0 text-left">
              <h3 className="text-xs font-bold text-slate-900 truncate max-w-[125px]" title={patient.name}>
                {highlightText(patient.name, searchTerm)}
              </h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{patient.gender} • {patient.age}y</p>
              
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.16em] shrink-0 ${currentStatusConfig.bg}`}>
                  {resolvedStatus === 'Provisional Admission' ? 'Provisional' : resolvedStatus}
                </span>
                {patient.labels?.slice(0, 1).map((label) => (
                  <span key={label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.16em] shrink-0 ${labelStyles[label as keyof typeof labelStyles] || 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/70'}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="relative">
              <button
                id={`patient-menu-btn-${patient.id}`}
                onClick={(e) => handleActionClick(e, () => setShowMenu(!showMenu))}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Patient actions"
                aria-expanded={showMenu}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-2 w-[190px] bg-white border border-slate-200/70 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] py-2 z-[55] text-xs text-left"
                >
                  <button onClick={(e) => handleActionClick(e, () => { openDetails(); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    View full file
                  </button>
                  <button onClick={(e) => handleActionClick(e, () => { downloadPatientReport(patient); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    Download report
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
                  <button onClick={(e) => handleActionClick(e, () => { if (confirm(`Delete ${patient.name} from active lists?`)) onDelete(patient.id); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
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
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
              }`}
              title="Select / View details"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Divider line */}
        <div className="h-px bg-slate-100 my-2.5" />

        {/* Dynamic lower stack */}
        <div className="space-y-2.5">
          {/* Doctors block */}
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2 min-w-0">
              {primaryDoctor?.avatar ? (
                <img
                  src={primaryDoctor.avatar}
                  alt={primaryDoctor.doctor}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-[9px] shrink-0">
                  {primaryDoctor?.doctor ? primaryDoctor.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase() : 'DR'}
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Consultant</p>
                <h4 className="text-[11px] font-bold text-slate-800 truncate max-w-[115px] mt-0.5 leading-tight" title={primaryDoctor?.doctor || patient.attendingDoctor}>
                  {highlightText(primaryDoctor?.doctor || patient.attendingDoctor, searchTerm)}
                </h4>
              </div>
            </div>

            {/* Overlapping care avatars */}
            <div className="flex items-center gap-2 shrink-0 bg-slate-50/50 p-1 rounded-lg">
              <div className="flex items-center justify-center w-7 h-7 rounded-2xl bg-sky-50 text-sky-600">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex items-center shrink-0">
                {visibleCareTeam.map((member, i) => (
                  member.avatar ? (
                    <img
                      key={member.id}
                      src={member.avatar}
                      alt={member.doctor}
                      className={`w-5 h-5 rounded-full object-cover border border-white shadow-sm shrink-0 ${i > 0 ? '-ml-1' : ''}`}
                    />
                  ) : (
                    <div
                      key={member.id}
                      className={`w-5 h-5 rounded-full bg-blue-100 text-blue-800 border-2 border-white flex items-center justify-center text-[6px] font-black shrink-0 ${i > 0 ? '-ml-1' : ''}`}
                    >
                      {member.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                    </div>
                  )
                ))}
                {extraCareTeamCount > 0 && (
                  <div className="w-5 h-5 -ml-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[6px] font-black shrink-0">
                    +{extraCareTeamCount}
                  </div>
                )}
              </div>
              <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Care • {careTeam.length}
              </span>
            </div>
          </div>

          {/* Core Metrics Grid - Bento Capsule style */}
          <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100/50 text-left bg-slate-50/60 p-2 rounded-xl border border-slate-100/40">
            <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none">UHID</p>
              <p className="mt-0.5 text-[9.5px] font-mono font-bold text-slate-800 truncate" title={patient.uhid}>
                {highlightText(patient.uhid, searchTerm)}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none">Bed</p>
              <p className="mt-0.5 text-[9.5px] font-bold text-slate-800 truncate" title={patient.bed}>{patient.bed}</p>
            </div>
            <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none">Ward</p>
              <p className="mt-0.5 text-[9.5px] font-bold text-slate-800 truncate" title={patient.ward}>
                {highlightText(patient.ward, searchTerm)}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none">Admit</p>
              <p className="mt-0.5 text-[9.5px] font-bold text-slate-800 truncate">
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
      className={`rounded-3xl hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 p-5 pl-7 cursor-pointer relative border ${
        isSelected 
          ? 'border-blue-500 bg-gradient-to-r from-blue-50/5 via-white to-white shadow-[0_12px_30px_rgba(37,99,235,0.08)] ring-4 ring-blue-100/50' 
          : `border-slate-100/90 bg-gradient-to-br ${cardBackgrounds[resolvedStatus as keyof typeof cardBackgrounds]} hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)]`
      }`}
    >
      {/* Main Grid Wrapper - Perfectly forces consistent alignment across list items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
        
        {/* Col 1: Patient Bio Block (Col span 3) */}
        <div className="lg:col-span-3 flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {patient.avatar ? (
              <img
                src={patient.avatar}
                alt={patient.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-150/70 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 border-2 border-blue-100 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {patient.initials || patient.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-sky-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          
          <div className="min-w-0 text-left">
            <h3 className="text-sm font-black text-slate-900 tracking-tight hover:text-blue-600 transition-colors truncate" title={patient.name}>
              {highlightText(patient.name, searchTerm)}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{patient.gender} • {patient.age}y</p>
            
            {/* Status and label chips */}
            <div className="flex flex-wrap items-center gap-1 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.16em] shrink-0 ${currentStatusConfig.bg}`}>
                {resolvedStatus === 'Provisional Admission' ? 'Provisional' : resolvedStatus}
              </span>
              {patient.labels?.slice(0, 1).map((label) => (
                <span key={label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.16em] shrink-0 ${labelStyles[label as keyof typeof labelStyles] || 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/70'}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Core Metrics Bento Capsule (Col span 3) */}
        <div className="lg:col-span-3 bg-slate-50/70 border border-slate-100 px-4 py-3 rounded-2xl grid grid-cols-4 gap-2 text-left shadow-inner transition-colors duration-305 hover:bg-slate-100/50">
          <div className="min-w-0 border-r border-slate-200/40 pr-1.5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">UHID</p>
            <p className="mt-1.5 text-[10.5px] font-mono font-black text-slate-800 truncate" title={patient.uhid}>
              {highlightText(patient.uhid, searchTerm)}
            </p>
          </div>
          <div className="min-w-0 border-r border-slate-200/40 px-1.5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Bed</p>
            <p className="mt-1.5 text-[10.5px] font-black text-slate-800 truncate" title={patient.bed}>{patient.bed}</p>
          </div>
          <div className="min-w-0 border-r border-slate-200/40 px-1.5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Ward</p>
            <p className="mt-1.5 text-[10.5px] font-black text-slate-800 truncate" title={patient.ward}>
              {highlightText(patient.ward, searchTerm)}
            </p>
          </div>
          <div className="min-w-0 pl-1.5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Admitted</p>
            <p className="mt-1.5 text-[10.5px] font-bold text-slate-800 truncate" title={patient.admissionDate}>
              {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
            </p>
          </div>
        </div>

        {/* Col 3: Primary Consultant (Col span 3) */}
        <div className="lg:col-span-3 flex items-center gap-3 min-w-0 border-l lg:border-l border-slate-100 pl-0 lg:pl-5">
          {primaryDoctor?.avatar ? (
            <img
              src={primaryDoctor.avatar}
              alt={primaryDoctor.doctor}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {primaryDoctor?.doctor ? primaryDoctor.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase() : 'DR'}
            </div>
          )}
          <div className="text-left min-w-0">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Primary Consultant</p>
            <h4 className="text-xs font-black text-slate-900 truncate max-w-[155px] leading-tight mt-1" title={primaryDoctor?.doctor || patient.attendingDoctor}>
              {highlightText(primaryDoctor?.doctor || patient.attendingDoctor, searchTerm)}
            </h4>
            <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[8.5px] font-bold">
              {primaryDoctor?.department || patient.department || 'General'}
            </span>
          </div>
        </div>

        {/* Col 4: Overlapping Care Team Avatars Stack (Col span 2) */}
        <div className="lg:col-span-2 flex items-center gap-3 border-l lg:border-l border-slate-100 pl-0 lg:pl-5 justify-between lg:justify-start">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-2xl bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                <Users className="w-3.5 h-3.5 text-sky-500" />
                Care Team
              </p>
              <span className="text-[10px] font-bold text-slate-600 mt-1 block">
                {careTeam.length} members
              </span>
            </div>
          </div>
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
              <div className="w-6 h-6 -ml-2 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center text-[7px] font-black shrink-0 shadow-sm">
                +{extraCareTeamCount}
              </div>
            )}
          </div>
        </div>

        {/* Col 5: Action Toolbar Trigger Buttons (Col span 1) */}
        <div className="lg:col-span-1 flex items-center justify-end gap-1.5 xl:gap-2 shrink-0 ml-auto w-full lg:w-auto border-t lg:border-t-0 border-slate-50 pt-3 lg:pt-0">
          {/* Quick Actions More-Menu trigger button */}
          <div className="relative">
            <button
              id={`patient-menu-btn-${patient.id}`}
              onClick={(e) => handleActionClick(e, () => setShowMenu(!showMenu))}
              className="w-8.5 h-8.5 rounded-full bg-slate-50/80 hover:bg-slate-100 border border-slate-150/55 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Patient actions"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-slate-150/70 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] py-2 z-[55] text-xs text-left"
              >
                <button onClick={(e) => handleActionClick(e, () => { openDetails(); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  View full file
                </button>
                <button onClick={(e) => handleActionClick(e, () => { downloadPatientReport(patient); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  Download report
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
                  <Printer className="w-3.5 h-3.5 text-sky-600" />
                  Print wristband
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={(e) => handleActionClick(e, () => { onEdit(patient); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  Edit intake
                </button>
                <button onClick={(e) => handleActionClick(e, () => { if (confirm(`Delete ${patient.name} from active lists?`)) onDelete(patient.id); setShowMenu(false); })} className="w-full text-left px-3 py-2 font-bold text-sky-600 hover:bg-sky-50 flex items-center gap-2">
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
            className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${
              isSelected 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
            }`}
            title="Select/Inspect Patient"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'translate-x-0.5' : ''}`} />
          </button>
        </div>
        
      </div>
    </motion.article>
  );
}
