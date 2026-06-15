import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Brain, FileSpreadsheet, Calendar, ChevronDown, Check } from 'lucide-react';
import { ActiveFilters } from '../types';
import { CARE_TEAM_ROLES, DEPARTMENT_OPTIONS, DOCTOR_OPTIONS } from '../careTeam';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ActiveFilters;
  onApply: (filters: ActiveFilters) => void;
  onReset: () => void;
}

export default function FilterDrawer({ isOpen, onClose, filters, onApply, onReset }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = React.useState<ActiveFilters>({ ...filters });

  // Keep local filters up-to-date with passed values
  React.useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters, isOpen]);

  // Accessibility: close on Escape key press
  const drawerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Focus Trap within filter drawer boundaries
  React.useEffect(() => {
    if (!isOpen) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const currentDrawer = drawerRef.current;
    if (!currentDrawer) return;

    // Wait slightly for Slide animation rendering to complete
    const r = setTimeout(() => {
      const focusableElements = (Array.from(
        currentDrawer.querySelectorAll(focusableSelector)
      ) as HTMLElement[]).filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));

      if (focusableElements.length > 0) {
        // Look for the apply or first interactive button
        focusableElements[0].focus();
      }
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const elements = (Array.from(
        currentDrawer.querySelectorAll(focusableSelector)
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
  }, [isOpen]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleStatusToggle = (status: string) => {
    let newStatuses = [...localFilters.statuses];
    if (newStatuses.includes(status)) {
      newStatuses = newStatuses.filter(s => s !== status);
    } else {
      newStatuses.push(status);
    }
    setLocalFilters({ ...localFilters, statuses: newStatuses });
  };

  const handleLabelToggle = (label: string) => {
    let newLabels = [...localFilters.labels];
    if (newLabels.includes(label)) {
      newLabels = newLabels.filter(l => l !== label);
    } else {
      newLabels.push(label);
    }
    setLocalFilters({ ...localFilters, labels: newLabels });
  };

  const handleWardToggle = (ward: string) => {
    let newWards = [...localFilters.wards];
    if (newWards.includes(ward)) {
      newWards = newWards.filter(w => w !== ward);
    } else {
      newWards.push(ward);
    }
    setLocalFilters({ ...localFilters, wards: newWards });
  };

  const handleReset = () => {
    const emptyFilters: ActiveFilters = {
      doctors: [],
      departments: [],
      role: '',
      statuses: [],
      startDate: '',
      endDate: '',
      labels: [],
      wards: []
    };
    setLocalFilters(emptyFilters);
    onReset();
    onClose();
  };

  // Doctors & Departments from current medical list
  const doctorsList = DOCTOR_OPTIONS;
  const departmentsList = DEPARTMENT_OPTIONS;
  const roleOptions = CARE_TEAM_ROLES;
  const statusOptions = ['Provisional Admission', 'MRD Pending', 'Completed', 'Discharged'];
  const labelOptions = ['Payment Defaulter', 'Insurance', 'High Priority'];
  const wardsList = ['Ward 4B', 'Ward 2A', 'ICU-1'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay with large close click area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Sliding Right-Side Panel Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-[#f1f3f9] z-[60] shadow-[-8px_0_24px_rgba(210,215,229,0.5)] border-l border-white/60 flex flex-col focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 bg-[#f1f3f9] shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-10 h-10 hover:bg-[#ebedf4] bg-[#f1f3f9] text-slate-800 rounded-full flex items-center justify-center transition-all shadow-nm-button border border-white cursor-pointer active:scale-95"
                  title="Close filters"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 id="filter-drawer-title" className="text-base font-extrabold text-slate-900 tracking-tight">
                  Filter Patients Directory
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="h-10 px-4 bg-[#f1f3f9] hover:bg-[#ebedf4] text-slate-700 text-xs font-bold rounded-full transition-all cursor-pointer border border-white/80 shadow-nm-button active:scale-95"
              >
                Reset All
              </button>
            </div>

            {/* Scrollable Content Fields */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 text-sm custom-scrollbar">
              
              {/* SECTION: Doctor Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Attending Doctors (Multi-Select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {doctorsList.map((doc) => {
                    const isChecked = localFilters.doctors.includes(doc);
                    return (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => {
                          const newDoctors = isChecked
                            ? localFilters.doctors.filter(d => d !== doc)
                            : [...localFilters.doctors, doc];
                          setLocalFilters({ ...localFilters, doctors: newDoctors });
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isChecked
                            ? 'bg-[#0066FF] text-white border-blue-500 shadow-sm'
                            : 'bg-[#f1f3f9] border-white/80 text-slate-700 shadow-nm-button hover:bg-[#ebedf4]'
                        }`}
                      >
                        <span>{doc}</span>
                        {isChecked && <Check className="w-3 h-3 text-white shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: Department Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Departments (Multi-Select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {departmentsList.map((dept) => {
                    const isChecked = localFilters.departments.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          const newDepts = isChecked
                            ? localFilters.departments.filter(d => d !== dept)
                            : [...localFilters.departments, dept];
                          setLocalFilters({ ...localFilters, departments: newDepts });
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isChecked
                            ? 'bg-[#0066FF] text-white border-blue-500 shadow-sm'
                            : 'bg-[#f1f3f9] border-white/80 text-slate-700 shadow-nm-button hover:bg-[#ebedf4]'
                        }`}
                      >
                        <span>{dept}</span>
                        {isChecked && <Check className="w-3 h-3 text-white shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: Role Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Care Team Role
                </label>
                <div className="relative">
                  <select 
                    value={localFilters.role}
                    onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value })}
                    className="w-full h-12 px-4 bg-[#f1f3f9] border border-white/80 rounded-full text-slate-800 font-extrabold appearance-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-nm-inset-small transition-all text-xs cursor-pointer"
                  >
                    <option value="">Any Role</option>
                    {roleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SECTION: Admission Status Buttons */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Patient Intake Status (Multi-Select)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((st) => {
                    const isChecked = localFilters.statuses.includes(st);
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusToggle(st)}
                        className={`flex items-center justify-between h-12 px-4 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#0066FF] text-white border-blue-500 shadow-sm active:scale-95'
                            : 'bg-[#f1f3f9] border-white/80 text-slate-700 shadow-nm-button hover:bg-[#ebedf4]'
                        }`}
                      >
                        <span className="truncate">{st}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: Date Range Selector */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Clinical Admission Period
                </label>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">From Date</span>
                    <div className="relative mt-1">
                      <input 
                        type="date"
                        value={localFilters.startDate}
                        onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                        className="w-full h-12 px-3 bg-[#f1f3f9] border border-white/80 rounded-full text-xs font-bold font-mono focus:ring-4 focus:ring-blue-100 focus:outline-none focus:border-blue-500 shadow-nm-inset-small transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">To Date</span>
                    <div className="relative mt-1">
                      <input 
                        type="date"
                        value={localFilters.endDate}
                        onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                        className="w-full h-12 px-3 bg-[#f1f3f9] border border-white/80 rounded-full text-xs font-bold font-mono focus:ring-4 focus:ring-blue-100 focus:outline-none focus:border-blue-500 shadow-nm-inset-small transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Priority Labels Checkbox Multi-select */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Special Priority Flags (Multi-Select)
                </label>
                <div className="space-y-3">
                  {labelOptions.map((lbl) => {
                    const isChecked = localFilters.labels.includes(lbl);
                    return (
                      <button
                        key={lbl}
                        onClick={() => handleLabelToggle(lbl)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-full border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/30 font-bold text-blue-950 shadow-sm'
                            : 'bg-[#f1f3f9] border-white/80 hover:bg-[#ebedf4] shadow-nm-button text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full inline-block ${
                            lbl === 'Payment Defaulter' 
                              ? 'bg-rose-500' 
                              : lbl === 'Insurance' 
                                ? 'bg-blue-500' 
                                : 'bg-purple-500'
                          }`} />
                          <span className="font-extrabold text-xs">{lbl}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isChecked ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: Ward Selection (Multi-Select Buttons) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Hospital Ward Location (Multi-Select)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {wardsList.map((ward) => {
                    const isChecked = localFilters.wards.includes(ward);
                    return (
                      <button
                        key={ward}
                        onClick={() => handleWardToggle(ward)}
                        className={`flex items-center justify-between h-12 px-4 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#0066FF] text-white border-blue-500 shadow-sm active:scale-95'
                            : 'bg-[#f1f3f9] border-white/80 text-slate-700 shadow-nm-button hover:bg-[#ebedf4]'
                        }`}
                      >
                        <span className="truncate">{ward}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Actions Bar - Reset and Apply Filters */}
            <div className="p-6 border-t border-slate-200/50 bg-[#f1f3f9] flex gap-4 shrink-0">
              <button
                onClick={handleReset}
                className="flex-1 h-12 bg-[#f1f3f9] border border-white hover:bg-[#ebedf4] shadow-nm-button text-slate-700 font-extrabold rounded-full transition-all cursor-pointer text-xs active:scale-95"
              >
                Reset All Filters
              </button>
              <button
                onClick={handleApply}
                className="flex-grow-[1.5] h-12 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold rounded-full transition-all shadow-[0_4px_12px_rgba(0,102,255,0.3)] hover:shadow-blue-300 active:scale-95 cursor-pointer text-xs border border-blue-400/20"
                id="apply-filter-submit-btn"
              >
                Apply Selected Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
