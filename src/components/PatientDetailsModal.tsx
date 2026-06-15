import React from 'react';
import { FileText, MapPin, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient } from '../types';
import { getPrimaryDoctor, getCareTeam, roleChipClass, departmentChipClass } from '../careTeam';
import { downloadPatientReport } from '../utils/reportGenerator';

interface PatientDetailsModalProps {
  patient: Patient | null;
  onClose: () => void;
  onEdit: (patient: Patient) => void;
}

export default function PatientDetailsModal({ patient, onClose, onEdit }: PatientDetailsModalProps) {
  if (!patient) return null;

  const primary = getPrimaryDoctor(patient);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-[0_28px_80px_rgba(15,23,42,0.14)] flex flex-col"
        >
          <header className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {patient.avatar ? (
                <img src={patient.avatar} alt={patient.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 border border-slate-200 shadow-sm flex items-center justify-center font-black text-lg shrink-0">
                  {patient.initials || patient.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient summary</p>
                <h2 className="text-xl font-black text-slate-950 truncate">{patient.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-600">
                  <span>UHID {patient.uhid}</span>
                  <span>{patient.gender}</span>
                  <span>{patient.age}y</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center shadow-sm"
              aria-label="Close patient details"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                <p className="mt-3 text-sm font-black text-slate-950">{patient.ward} / {patient.bed}</p>
                <p className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {patient.department || 'Ward location'}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary consultant</p>
                <p className="mt-3 text-sm font-black text-slate-950">{primary?.doctor || patient.attendingDoctor}</p>
                {primary?.department && <p className="mt-2 text-sm text-slate-600">{primary.department}</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Active Care Team (Multidisciplinary)
              </p>
              
              <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto pr-1">
                {getCareTeam(patient).map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.doctor} className="w-9 h-9 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066FF] border border-blue-100 flex items-center justify-center font-black text-xs">
                          {member.doctor.split(' ').slice(-1)[0][0]}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-black text-slate-900">{member.doctor}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{member.activity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${roleChipClass(member.role)}`}>
                        {member.role === 'Primary Consultant' ? 'Primary' : member.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${departmentChipClass(member.department)}`}>
                        {member.department}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current status</p>
                  <p className="mt-3 text-sm font-black text-slate-950">{patient.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadPatientReport(patient)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-200/80 text-slate-700 px-4 py-2 text-xs font-black uppercase shadow-sm hover:bg-slate-300/80 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    Download Report
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(patient)}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase text-white shadow-sm hover:bg-blue-700 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
