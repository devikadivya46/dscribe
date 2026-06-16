import React from 'react';
import { 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Search, 
  Users, 
  FolderLock, 
  AlertTriangle,
  LogOut,
  Bell,
  HelpCircle,
  Menu,
  Activity,
  Heart,
  UserCheck,
  Building,
  ChevronRight,
  TrendingUp,
  X,
  ShieldCheck,
  PlusCircle,
  Settings,
  CheckCircle,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';

// Shared definitions & types
import { Patient, MRDFile, ActiveFilters } from './types';
import { INITIAL_PATIENTS, INITIAL_FILES, INITIAL_OPD_QUEUE, INITIAL_SUPPORT_TICKETS } from './data';
import { getCareTeam } from './careTeam';

// Components
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import PatientCard from './components/PatientCard';
import FilterDrawer from './components/FilterDrawer';
import AddPatientWizard from './components/AddPatientWizard';
import MRDFiles from './components/MRDFiles';
import Overview from './components/Overview';
import PatientInspectPane from './components/PatientInspectPane';
import PatientDetailsModal from './components/PatientDetailsModal';
import Logo from './components/Logo';
import ScribeWorkbench from './components/ScribeWorkbench';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<string>('in-patient');

  // Comfort mode: larger text, higher contrast, and easier spacing for older users
  const [comfortMode, setComfortMode] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('nexus_comfort_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error'; onUndo?: () => void }[]>([]);

  const addToast = (
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    onUndo?: () => void
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, onUndo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, onUndo ? 7500 : 4500); // give users more time to click Undo
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  React.useEffect(() => {
    localStorage.setItem('nexus_comfort_mode', JSON.stringify(comfortMode));
    document.documentElement.classList.toggle('comfort-mode', comfortMode);
  }, [comfortMode]);

  // Keyboard Shortcuts: Alt + N and Alt + F
  React.useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isAltN = e.altKey && (e.key === 'n' || e.key === 'N');
      const isAltF = e.altKey && (e.key === 'f' || e.key === 'F');

      if (isAltN) {
        e.preventDefault();
        setEditingPatient(null);
        setIsWizardOpen(true);
        addToast('Shortcut Activated: Opening electronic admissions wizard', 'info');
      } else if (isAltF) {
        e.preventDefault();
        setIsFilterDrawerOpen(true);
        addToast('Shortcut Activated: Opening directory filters board', 'info');
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const activeFiltersSummary = () => {
    const active = [];
    if (activeFilters.doctors.length > 0) active.push(`Doctors: ${activeFilters.doctors.map(d => d.replace('Dr. ', '')).join(', ')}`);
    if (activeFilters.departments.length > 0) active.push(`Depts: ${activeFilters.departments.join(', ')}`);
    if (activeFilters.statuses.length > 0) active.push(`Statuses: ${activeFilters.statuses.join(', ')}`);
    if (activeFilters.labels.length > 0) active.push(`Labels: ${activeFilters.labels.join(', ')}`);
    if (searchTerm) active.push(`Search: "${searchTerm}"`);
    return active.length > 0 ? active.join(' | ') : 'None (Full Registry)';
  };

  // Export Current View to PDF function
  const exportCurrentViewToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Cover Page Header slate panel
      doc.setFillColor(15, 23, 42); // slate-900 background
      doc.rect(0, 0, 210, 32, 'F');

      // Title Card
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('CLINICAL NEXUS - IN-PATIENT DIRECTORY REPORT', 14, 11);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(186, 210, 255);
      doc.text(`Generated: ${new Date().toLocaleString('en-US', { hour12: true })}`, 14, 17);
      doc.text(`Active Constraints: ${activeFiltersSummary()}`, 14, 22);
      doc.text(`Record Count: ${filteredPatients.length} Patients Filtered`, 14, 27);

      // Section Header
      let yPosition = 40;
      doc.setFillColor(241, 245, 249); // slate-100 column guide row
      doc.rect(10, yPosition, 190, 8.5, 'F');

      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('UHID ID', 12, yPosition + 5.5);
      doc.text('PATIENT NAME', 40, yPosition + 5.5);
      doc.text('AGE & SEX', 82, yPosition + 5.5);
      doc.text('WARD / BED', 110, yPosition + 5.5);
      doc.text('ATTENDING CLINICIAN', 142, yPosition + 5.5);
      doc.text('INTAKE STATUS', 178, yPosition + 5.5);

      yPosition += 13.5;

      // Table body render iterator
      filteredPatients.forEach((patient, idx) => {
        // Multi-page threshold check
        if (yPosition > 275) {
          doc.addPage();
          // Header on following pages
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 210, 14, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.text('CLINICAL NEXUS - IN-PATIENT REPORT (CONTINUED)', 14, 9);
          
          yPosition = 24;
        }

        // Draw zebra coloring
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252); // slate-50
          doc.rect(10, yPosition - 3.5, 190, 8.5, 'F');
        }

        doc.setTextColor(30, 41, 59); // slate-800
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(patient.uhid.slice(0, 8), 12, yPosition + 2);

        doc.setFont('Helvetica', 'bold');
        doc.text(patient.name.length > 20 ? patient.name.slice(0, 18) + '..' : patient.name, 40, yPosition + 2);

        doc.setFont('Helvetica', 'normal');
        doc.text(`${patient.age}y / ${patient.gender.slice(0, 6)}`, 82, yPosition + 2);
        doc.text(`${patient.ward} • ${patient.bed}`, 110, yPosition + 2);

        const drClean = patient.attendingDoctor.replace('Dr. ', '');
        doc.text(drClean.length > 14 ? drClean.slice(0, 12) + '..' : drClean, 142, yPosition + 2);

        const stVal = patient.status || 'Active';
        doc.setFont('Helvetica', 'bold');
        if (stVal === 'Completed') {
          doc.setTextColor(14, 165, 233); // sky-blue
        } else if (stVal === 'Discharged') {
          doc.setTextColor(100, 116, 139); // slate-neutral
        } else if (stVal === 'MRD Pending') {
          doc.setTextColor(37, 99, 235); // blue
        } else {
          doc.setTextColor(56, 189, 248); // cyan
        }
        doc.text(stVal, 178, yPosition + 2);

        yPosition += 9.5;
      });

      // Save document natively
      doc.save(`patient-registry-report-${new Date().toISOString().split('T')[0]}.pdf`);
      addToast('Patient directory document exported cleanly as PDF!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Error formatting administrative PDF report.', 'error');
    }
  };

  // Interactive Document Ingestion state
  const [ingestFileName, setIngestFileName] = React.useState('');
  const [ingestPatientId, setIngestPatientId] = React.useState('');
  const [ingestCategory, setIngestCategory] = React.useState<'Clinical' | 'Imaging' | 'Administrative'>('Clinical');
  const [ingestNotes, setIngestNotes] = React.useState('');
  
  // Data State persisted via LocalStorage
  const [patients, setPatients] = React.useState<Patient[]>(() => {
    const saved = localStorage.getItem('nexus_patients');
    const parsed: Patient[] = saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    return parsed.map(p => {
      let migratedStatus = p.status;
      const currentRawStatus = p.status as string;
      if (currentRawStatus === 'Critical' || currentRawStatus === 'Pending') {
        migratedStatus = 'Provisional Admission';
      } else if (currentRawStatus === 'Stable') {
        migratedStatus = 'Completed';
      }
      return {
        ...p,
        status: migratedStatus as any
      };
    });
  });

  const [files, setFiles] = React.useState<MRDFile[]>(() => {
    const saved = localStorage.getItem('nexus_files');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  // UI Interactive States
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [sortBy, setSortBy] = React.useState<'name' | 'age' | 'status' | 'none'>('name');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Active filters tracker
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilters>({
    doctors: [],
    departments: [],
    role: '',
    statuses: [],
    startDate: '',
    endDate: '',
    labels: [],
    wards: []
  });

  // Persist edits to LocalStorage
  React.useEffect(() => {
    localStorage.setItem('nexus_patients', JSON.stringify(patients));
  }, [patients]);

  React.useEffect(() => {
    localStorage.setItem('nexus_files', JSON.stringify(files));
  }, [files]);

  // Calculations for counters
  const criticalPatientsCount = patients.filter(p => p.labels.includes('High Priority')).length;
  const unverifiedFilesCount = files.filter(f => f.status === 'Pending Review').length;
  const opdWaitingCount = INITIAL_OPD_QUEUE.filter(v => v.status === 'Waiting').length;
  const openTicketsCount = INITIAL_SUPPORT_TICKETS.filter(t => t.status === 'Open').length;

  // Add / edit patient callback
  const handleSavePatient = (savedPatient: Patient) => {
    setPatients((prev) => {
      const exists = prev.some(p => p.id === savedPatient.id);
      if (exists) {
        return prev.map(p => p.id === savedPatient.id ? savedPatient : p);
      } else {
        return [savedPatient, ...prev];
      }
    });

    if (selectedPatient?.id === savedPatient.id) {
      setSelectedPatient(savedPatient);
    }

    // Also auto-generate an onboarding Medical Record File for the new patient
    const newFile: MRDFile = {
      id: `mrd-${Math.floor(1000 + Math.random() * 9000)}-x`,
      fileName: `Intake_Assessment_${savedPatient.name.replace(/\s+/g, '_')}.pdf`,
      patientName: savedPatient.name,
      uhid: savedPatient.uhid,
      category: 'Clinical',
      uploadDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + `, 09:00 AM`,
      status: 'Pending Review',
      securityLevel: 'High',
      fileSize: '1.4 MB',
      authoredBy: savedPatient.attendingDoctor,
      notes: `Patient initiated admissions triage at ${savedPatient.admissionDate ? new Date(savedPatient.admissionDate).toLocaleTimeString() : 'current shift'}. Assessed on ward ${savedPatient.ward} bed ${savedPatient.bed}.`,
      previewUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600'
    };
    setFiles(prev => [newFile, ...prev]);

    setEditingPatient(null);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient?.id === updatedPatient.id) {
      setSelectedPatient(updatedPatient);
    }
  };

  const handleDeletePatient = (id: string) => {
    const patientToDelete = patients.find(p => p.id === id);
    if (!patientToDelete) return;
    const currentPatients = [...patients];
    
    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedPatient?.id === id) {
      setSelectedPatient(null);
    }
    
    addToast(
      `Patient "${patientToDelete.name}" was permanently deleted.`,
      'warning',
      () => {
        setPatients(currentPatients);
        if (selectedPatient?.id === id) {
          setSelectedPatient(patientToDelete);
        }
        addToast(`Restored patient "${patientToDelete.name}" data record successfully.`, 'success');
      }
    );
  };

  const handleStatusChange = (id: string, newStatus: 'Provisional Admission' | 'MRD Pending' | 'Completed' | 'Discharged') => {
    const targetPatient = patients.find(p => p.id === id);
    if (!targetPatient) return;
    const oldStatus = targetPatient.status;
    if (oldStatus === newStatus) return;

    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedPatient?.id === id) {
      setSelectedPatient(prev => prev ? { ...prev, status: newStatus } : null);
    }
    
    addToast(
      `Status of "${targetPatient.name}" updated to ${newStatus}.`,
      'success',
      () => {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, status: oldStatus } : p));
        if (selectedPatient?.id === id) {
          setSelectedPatient(prev => prev ? { ...prev, status: oldStatus } : null);
        }
        addToast(`Reverted status of "${targetPatient.name}" back to ${oldStatus}.`, 'info');
      }
    );
  };

  const handleUpdateClinicalNotes = (fileId: string, updatedNotes: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, notes: updatedNotes } : f));
  };

  const handleResetFilters = () => {
    setActiveFilters({
      doctors: [],
      departments: [],
      role: '',
      statuses: [],
      startDate: '',
      endDate: '',
      labels: [],
      wards: []
    });
  };

  const handleRemoveFilterTag = (type: keyof ActiveFilters, value?: string) => {
    const updated = { ...activeFilters };
    if (type === 'role' || type === 'startDate' || type === 'endDate') {
      (updated as any)[type] = '';
    } else if (type === 'doctors' && value) {
      updated.doctors = updated.doctors.filter(d => d !== value);
    } else if (type === 'departments' && value) {
      updated.departments = updated.departments.filter(d => d !== value);
    } else if (type === 'statuses' && value) {
      updated.statuses = updated.statuses.filter(s => s !== value);
    } else if (type === 'labels' && value) {
      updated.labels = updated.labels.filter(l => l !== value);
    } else if (type === 'wards' && value) {
      updated.wards = updated.wards.filter(w => w !== value);
    }
    setActiveFilters(updated);
  };

  const triggerAddPatient = () => {
    setEditingPatient(null);
    setIsWizardOpen(true);
  };

  const triggerEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsWizardOpen(true);
  };

  // Filter application core logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.includes(searchTerm) ||
      p.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.attendingDoctor.toLowerCase().includes(searchTerm.toLowerCase());

    const team = getCareTeam(p);

    const matchesDoctor = activeFilters.doctors.length === 0 || team.some(m => activeFilters.doctors.includes(m.doctor));
    const matchesDept = activeFilters.departments.length === 0 || team.some(m => activeFilters.departments.includes(m.department));
    const matchesRole = !activeFilters.role || team.some(m => m.role === activeFilters.role);
    const matchesWard = !activeFilters.wards || activeFilters.wards.length === 0 || activeFilters.wards.includes(p.ward);
    const matchesStatus = activeFilters.statuses.length === 0 || activeFilters.statuses.includes(p.status);
    const matchesLabel = activeFilters.labels.length === 0 || p.labels.some(l => activeFilters.labels.includes(l));

    let matchesDate = true;
    if (activeFilters.startDate && p.admissionDate) {
      matchesDate = new Date(p.admissionDate) >= new Date(activeFilters.startDate);
    }
    if (activeFilters.endDate && p.admissionDate) {
      matchesDate = matchesDate && new Date(p.admissionDate) <= new Date(activeFilters.endDate + 'T23:59:59');
    }

    return matchesSearch && matchesDoctor && matchesDept && matchesRole && matchesWard && matchesStatus && matchesLabel && matchesDate;
  });

  // Sorting
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'age') {
      return b.age - a.age;
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  const handleCycleSort = () => {
    setSortBy(prev => {
      if (prev === 'name') return 'age';
      if (prev === 'age') return 'status';
      if (prev === 'status') return 'none';
      return 'name';
    });
  };

  return (
    <div 
      className={`min-h-screen text-[#0b1c30] flex font-sans overflow-x-hidden antialiased select-none relative isolate ${comfortMode ? 'comfort-mode' : ''}`}
    >
      
      {/* Sidebar Navigation (Wide view) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activePatientCount={patients.length}
        unverifiedFilesCount={unverifiedFilesCount}
        opdWaitingCount={opdWaitingCount}
        openTicketsCount={openTicketsCount}
        comfortMode={comfortMode}
        onToggleComfortMode={() => setComfortMode(prev => !prev)}
        onShowToast={addToast}
      />

      {/* Main Container Column */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Global Toolbar Header */}
        <header className="h-16 border-b border-white/40 bg-white/70 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between xl:gap-8 lg:pl-72 shadow-[0_10px_36px_rgba(31,38,135,0.08)] select-none animate-fadeIn">
          <div className="flex items-center gap-3">
            {/* Desktop Hamburger trigger for mobile Drawer navigation */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center bg-white/70 border border-white hover:bg-white rounded-xl text-slate-500 lg:hidden cursor-pointer shadow-sm"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-[#0066FF]" />
            </button>
            <div className="flex items-center cursor-default select-none">
              <Logo className="h-6 w-auto" strokeColor="stroke-slate-900" dotClassName="" />
              <span className="ml-2 text-xs font-semibold text-slate-400 border-l border-[#e2e8f0] pl-2 inline-block pt-0.5">
                Clinical Workspace
              </span>
            </div>
          </div>

          {/* Utility slots */}
          <div className="flex items-center gap-3 md:gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 text-blue-700 text-xs font-black rounded-lg border border-white/80 shadow-sm">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></span>
              <span>Ward 4B Active</span>
            </span>

            <button 
              onClick={() => {
                if (criticalPatientsCount > 0) {
                  addToast(`Emergency Alert: There are currently ${criticalPatientsCount} high-priority clinical reviews pending.`, 'warning');
                } else {
                  addToast('System Notification: Clear of any critical patient issues.', 'success');
                }
                if (unverifiedFilesCount > 0) {
                  addToast(`${unverifiedFilesCount} unprocessed medical record records are waiting for review.`, 'info');
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f1f3f9] border border-white text-slate-500 hover:text-slate-700 transition-colors relative shadow-nm-button active:shadow-nm-button-inset cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-500" />
              {(criticalPatientsCount > 0 || unverifiedFilesCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-600 rounded-full border border-white"></span>
              )}
            </button>

            <button 
              onClick={triggerAddPatient}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-100"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </header>        {/* Tab content routing switches */}
        {activeTab === 'overview' ? (
          <Overview patients={patients} files={files} setActiveTab={setActiveTab} />
        ) : activeTab === 'in-patient' ? (
          <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24">
            
            {/* Context bar subheader titles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">In-Patients Directory</h1>
                <p className="text-xs text-[#424754]">Triage overview monitoring {filteredPatients.length} active patients within sector units</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="h-10 px-4 bg-white/70 border border-white hover:bg-white rounded-xl text-xs font-black text-slate-700 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer select-none"
                >
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span>Filters</span>
                </button>
                <button 
                  onClick={handleCycleSort}
                  className="h-10 px-4 bg-white/70 border border-white hover:bg-white rounded-xl text-xs font-black text-slate-700 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer select-none"
                >
                  <ArrowUpDown className="w-4 h-4 text-slate-500" />
                  <span>Sort{sortBy !== 'none' ? `: ${sortBy}` : ''}</span>
                </button>
                <button 
                  onClick={exportCurrentViewToPDF}
                  className="h-10 px-4 bg-white/70 border border-white hover:bg-white rounded-xl text-xs font-black text-slate-700 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
                  title="Export Current View to Formatted PDF Directory"
                >
                  <FileDown className="w-4 h-4 text-blue-600 animate-pulse" style={{ animationDuration: '3s' }} />
                  <span>Export Report (PDF)</span>
                </button>
              </div>
            </div>

            {/* Premium Neumorphic/Glassmorphic Command Console for Clinical Officials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 select-none">
              
              {/* Metric Card 1: Active In-Patients */}
              <div className="p-5 bg-gradient-to-br from-sky-50 via-white to-cyan-50 border border-white/80 shadow-[0_10px_32px_rgba(56,139,253,0.12)] rounded-3xl flex flex-col justify-between hover:shadow-[0_14px_42px_rgba(37,99,235,0.16)] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Active Incidence</span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-white/60 flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-[#0066FF]" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{patients.length}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Registered Case Dossiers</p>
                </div>
              </div>

              {/* Metric Card 2: Urgent Triage */}
              <div className="p-5 bg-gradient-to-br from-slate-50 via-white to-sky-50 border border-white/80 shadow-[0_10px_32px_rgba(56,139,253,0.12)] rounded-3xl flex flex-col justify-between hover:shadow-[0_14px_42px_rgba(37,99,235,0.16)] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Critical Triage</span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-white/60 flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-sky-600 animate-pulse" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{criticalPatientsCount}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">High Priority Reviews</p>
                </div>
              </div>

              {/* Metric Card 3: Unverified Records */}
              <div className="p-5 bg-gradient-to-br from-slate-50 via-white to-sky-50 border border-white/80 shadow-[0_10px_32px_rgba(56,139,253,0.12)] rounded-3xl flex flex-col justify-between hover:shadow-[0_14px_42px_rgba(37,99,235,0.16)] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">File Compliance</span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-white/60 flex items-center justify-center shadow-sm">
                    <FolderLock className="w-5 h-5 text-sky-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{unverifiedFilesCount}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Awaiting MRD Review</p>
                </div>
              </div>

              {/* Metric Card 4: Global Bed Utilization */}
              <div className="p-5 bg-gradient-to-br from-slate-50 via-white to-sky-50 border border-white/80 shadow-[0_10px_32px_rgba(56,139,253,0.12)] rounded-3xl flex flex-col justify-between hover:shadow-[0_14px_42px_rgba(37,99,235,0.16)] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Bed Allocation</span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-white/60 flex items-center justify-center shadow-sm">
                    <Building className="w-5 h-5 text-sky-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-slate-800 tracking-tight">85.3%</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Sector Ward Utilization</p>
                </div>
              </div>

            </div>

            {/* Responsive Search Input Block */}
            <div className="relative group">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-slate-900 transition-colors duration-[180ms] ease-out pointer-events-none" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search active records by patient name, attending doctor, ward index, or UHID identifier..."
                className="w-full h-12 pl-12 pr-12 bg-white border border-slate-300 rounded-2xl text-xs font-black text-[#0b1c30] placeholder-slate-500 focus:bg-white focus:border-slate-950 focus:ring-2 focus:ring-slate-900/25 outline-none shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-[180ms] ease-out"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-150 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live active filter tags indicator chips directly above patient cards to avoid hidden filters problem */}
            {Object.values(activeFilters).some(v => Array.isArray(v) ? v.length > 0 : !!v) && (
              <div className="flex flex-wrap items-center gap-2.5 p-4 bg-white/45 backdrop-blur-md border border-white/70 rounded-2xl select-none shadow-sm">
                <span className="font-black text-slate-500 uppercase tracking-wider text-[9px] mr-1">Applied Filters:</span>
                
                {activeFilters.doctors.map(doc => (
                  <span key={doc} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm">
                    <span>Doctor: {doc.replace('Dr. ', '')}</span>
                    <button 
                      onClick={() => handleRemoveFilterTag('doctors', doc)} 
                      className="hover:bg-sky-100 hover:text-sky-700 w-4 h-4 flex items-center justify-center font-extrabold rounded-full ml-1 text-sm cursor-pointer outline-none transition-colors"
                      title={`Clear ${doc} Filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {activeFilters.departments.map(dept => (
                  <span key={dept} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm">
                    <span>Department: {dept}</span>
                    <button 
                      onClick={() => handleRemoveFilterTag('departments', dept)} 
                      className="hover:bg-sky-100 hover:text-sky-700 w-4 h-4 flex items-center justify-center font-extrabold rounded-full ml-1 text-sm cursor-pointer outline-none transition-colors"
                      title={`Clear ${dept} Filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {activeFilters.role && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm">
                    <span>Role: {activeFilters.role}</span>
                    <button 
                      onClick={() => handleRemoveFilterTag('role')} 
                      className="hover:bg-sky-100 hover:text-sky-700 w-4 h-4 flex items-center justify-center font-extrabold rounded-full ml-1 text-sm cursor-pointer outline-none transition-colors"
                      title="Clear Role Filter"
                    >
                      ×
                    </button>
                  </span>
                )}

                {activeFilters.wards && activeFilters.wards.map(wd => (
                  <span key={wd} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm">
                    <span>Ward: {wd}</span>
                    <button 
                      onClick={() => handleRemoveFilterTag('wards', wd)} 
                      className="hover:bg-sky-100 hover:text-sky-700 w-4 h-4 flex items-center justify-center font-extrabold rounded-full ml-1 text-sm cursor-pointer outline-none transition-colors"
                      title={`Clear ${wd} Ward`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {activeFilters.statuses.map(st => (
                  <span key={st} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm">
                    <span>Status: {st}</span>
                    <button 
                      onClick={() => handleRemoveFilterTag('statuses', st)} 
                      className="hover:bg-sky-100 hover:text-sky-700 w-4 h-4 flex items-center justify-center font-extrabold rounded-full ml-1 text-sm cursor-pointer outline-none transition-colors"
                      title={`Clear ${st} Status`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {activeFilters.labels.map(lbl => (
                  <span key={lbl} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm">
                    <span>Label: {lbl}</span>
                    <button 
                      onClick={() => handleRemoveFilterTag('labels', lbl)} 
                      className="hover:bg-sky-100 hover:text-sky-700 w-4 h-4 flex items-center justify-center font-extrabold rounded-full ml-1 text-sm cursor-pointer outline-none transition-colors"
                      title={`Clear ${lbl} Label`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {(activeFilters.startDate || activeFilters.endDate) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/90 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm">
                    <span>Admissions: {activeFilters.startDate || '*'} to {activeFilters.endDate || '*'}</span>
                    <button 
                      onClick={() => { handleRemoveFilterTag('startDate'); handleRemoveFilterTag('endDate'); }} 
                      className="hover:bg-sky-100 hover:text-sky-700 w-4 h-4 flex items-center justify-center font-extrabold rounded-full ml-1 text-sm cursor-pointer outline-none transition-colors"
                      title="Clear Date range"
                    >
                      ×
                    </button>
                  </span>
                )}

                <button 
                  onClick={handleResetFilters}
                  className="text-xs font-black text-sky-700 hover:text-sky-900 hover:underline outline-none ml-auto cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Patients list grids as shown in original screens */}
            {sortedPatients.length === 0 ? (
              <div className="bg-white/55 backdrop-blur-md border border-white/80 rounded-3xl p-16 text-center text-slate-500 shadow-[0_8px_30px_rgba(200,210,230,0.1)] flex flex-col items-center select-none animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-white/70 border border-white shadow-sm flex items-center justify-center mb-4 text-slate-400">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">No Patient Files Match Active Criteria</p>
                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide max-w-sm">Try relaxing search terms, refining spelling, or resetting filter drawer configs.</p>
                <button 
                  onClick={() => { setSearchTerm(''); handleResetFilters(); }}
                  className="mt-6 h-9 px-5 bg-white/80 hover:bg-blue-600 hover:text-white border border-white/90 text-blue-700 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Reset Directory
                </button>
              </div>
            ) : (
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    {sortedPatients.map((patient) => (
                      <PatientCard 
                        key={patient.id} 
                        patient={patient} 
                        isSelected={selectedPatient?.id === patient.id}
                        compact={!!selectedPatient}
                        onViewDetails={(p) => setSelectedPatient(p)}
                        onEdit={triggerEditPatient}
                        onDelete={handleDeletePatient}
                        onStatusChange={handleStatusChange}
                        searchTerm={searchTerm}
                      />
                    ))}
                  </div>
                </div>

                {selectedPatient && (
                  <PatientInspectPane 
                    patient={selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                    onEdit={triggerEditPatient}
                    onUpdatePatient={handleUpdatePatient}
                  />
                )}
              </div>
            )}

          </main>
        ) : activeTab === 'mrd-files' ? (
          <MRDFiles 
            files={files} 
            onUpdateFileNotes={handleUpdateClinicalNotes}
            onRefresh={() => {
              setFiles(INITIAL_FILES);
              addToast('Clinical database synchronized details fully with central medical records department.', 'success');
            }}
            onShowToast={addToast}
          />
        ) : activeTab === 'upload' ? (
          <ScribeWorkbench 
            patients={patients}
            onAddFile={(newFile) => setFiles(prev => [newFile, ...prev])}
            setActiveTab={setActiveTab}
            onShowToast={addToast}
          />
        ) : activeTab === 'analytics' ? (
          <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24 select-none animate-fadeIn">
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Clinical Analytics Dashboard</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time triage logs, ward telemetry metrics, and document compliance logs.</p>
            </div>

            {/* Premium bento metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#f1f3f9] border border-white/60 p-5 rounded-2xl shadow-nm-flat space-y-2 hover:shadow-nm-pressed transition-all duration-300">
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Global Bed Occupancy</p>
                <p className="text-2xl font-black text-slate-800">85.7%</p>
                <div className="w-full bg-[#ebedf4] border border-white/35 h-2.5 rounded-full overflow-hidden shadow-nm-inset-small">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '85.7%' }} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">36 out of 42 active slots allocated</p>
              </div>

              <div className="bg-[#f1f3f9] border border-white/60 p-5 rounded-2xl shadow-nm-flat space-y-2 hover:shadow-nm-pressed transition-all duration-300">
                <p className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Triage Duration</p>
                <p className="text-2xl font-black text-slate-800">14 mins</p>
                <div className="w-full bg-[#ebedf4] border border-white/35 h-2.5 rounded-full overflow-hidden shadow-nm-inset-small">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-[10px] text-sky-700 font-extrabold uppercase tracking-wide">✓ Outstanding (Within benchmark limit)</p>
              </div>

              <div className="bg-[#f1f3f9] border border-white/60 p-5 rounded-2xl shadow-nm-flat space-y-2 hover:shadow-[#ebedf4] transition-all duration-300">
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Record Verification</p>
                <p className="text-2xl font-black text-slate-800">92.4%</p>
                <div className="w-full bg-[#ebedf4] border border-white/35 h-2.5 rounded-full overflow-hidden shadow-nm-inset-small">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92.4%' }} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">4 non-verified records remaining</p>
              </div>
            </div>

            {/* Department Breakdown Bar charts */}
            <div className="bg-[#f1f3f9] border border-white/60 p-6 rounded-2xl shadow-nm-flat space-y-4 hover:shadow-nm-pressed transition-all duration-300">
              <div>
                <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest">Patient Distribution by Medical Unit</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Live share of clinical resources in active service</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Cardiology Department', count: 18, pct: '52%', color: 'bg-sky-500' },
                  { name: 'Neurology Unit', count: 10, pct: '28%', color: 'bg-blue-600' },
                  { name: 'General Medicine & Intensive Care', count: 8, pct: '20%', color: 'bg-slate-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-extrabold text-slate-705 uppercase tracking-wide">
                      <span>{item.name}</span>
                      <span className="text-slate-605">{item.count} Patients ({item.pct})</span>
                    </div>
                    <div className="w-full bg-[#ebedf4] border border-white/35 h-3 rounded-full overflow-hidden shadow-nm-inset-small">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Audit Log protocols preview */}
            <div className="bg-[#1b1f2b] text-[#869ab8] p-5 rounded-2xl border border-[#2b3347] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.6),4px_4px_12px_rgba(255,255,255,0.03)] font-mono text-[11px] space-y-2.5">
              <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest leading-none">// LOCAL TELEMETRY BUFFER PROTOCOLS</p>
              <p className="text-[#64748b] leading-relaxed">[09:12 AM] Inception of document file "Lab_Report_Feb24.pdf" fully verified by credentials: Dr. Sarah Chen.</p>
              <p className="text-[#64748b] leading-relaxed">[10:00 AM] Provisional admission logged for "Evelyn Thorne" under priority "Routine". Assigned: Bed B-105.</p>
              <p className="text-sky-500/80 animate-pulse flex items-center gap-1.5 font-bold leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span>Connection streaming verified securely.</span>
              </p>
            </div>
          </main>
        ) : (
          <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24 select-none animate-fadeIn">
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">System Settings & Configurations</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Manage medical system parameters, synchronizer triggers, and secure clearances.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Permission & clearance segment */}
              <div className="bg-[#f1f3f9] border border-white/60 p-5 rounded-2xl shadow-nm-flat space-y-4 hover:shadow-[#ebedf4] transition-all duration-300">
                <h3 className="text-[10px] font-black text-slate-850 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="text-blue-600 w-4 h-4" />
                  <span>Credential Session Level</span>
                </h3>
                <div className="space-y-3">
                  <div className="bg-[#ebedf4]/65 border border-white/50 p-4 rounded-xl shadow-nm-inset-small flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f1f3f9] border border-white text-blue-700 flex items-center justify-center font-black text-xs shadow-nm-button shrink-0">
                      SC
                    </div>
                    <div className="text-xs">
                      <p className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide">Dr. Sarah Chen</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Chief Attending • Cardiology Sector</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed space-y-2 pt-1 border-t border-white/40">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                      <span>Auth Clearance: <span className="font-extrabold text-[#0066FF] uppercase tracking-wider text-[10px]">Super-User Access</span></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                      <span>Auto-Session Lock: <span className="font-black text-slate-700 uppercase tracking-wide text-[10px]">12 Hours Sec.</span></span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Database engines console */}
              <div className="bg-[#f1f3f9] border border-white/60 p-5 rounded-2xl shadow-nm-flat space-y-4 hover:shadow-[#ebedf4] transition-all duration-300">
                <h3 className="text-[10px] font-black text-slate-850 uppercase tracking-widest flex items-center gap-2">
                  <FolderLock className="text-indigo-650 w-4 h-4" />
                  <span>Clinical Database Engines</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <p className="text-slate-500 leading-relaxed bg-[#ebedf4]/65 border border-white/45 p-3.5 rounded-xl shadow-nm-inset-small text-[11px] font-medium">
                    Database schemas are initialized. In the event of stale mock cached instances, enforce a manual system cache ledger reset.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        setPatients(INITIAL_PATIENTS);
                        setFiles(INITIAL_FILES);
                        addToast('Local Clinical database cache execution completed cleanly!', 'success');
                      }}
                      className="h-9 px-4 bg-[#f1f3f9] border border-sky-200/50 text-sky-700 text-xs font-bold rounded-xl shadow-nm-button hover:shadow-nm-button-inset transition-all active:scale-95 cursor-pointer text-[10px] uppercase tracking-wider font-black"
                    >
                      Reset System Cache
                    </button>
                    <button 
                      onClick={() => {
                        addToast('Clinical database synchronized details fully with central medical records department.', 'success');
                      }}
                      className="h-9 px-4 bg-[#f1f3f9] border border-white text-slate-700 text-xs font-bold rounded-xl shadow-nm-button hover:shadow-nm-button-inset transition-all active:scale-95 cursor-pointer text-[10px] uppercase tracking-wider font-black"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Preferences list toggles */}
              <div className="bg-[#f1f3f9] border border-white/60 p-5 rounded-2xl shadow-nm-flat space-y-4 md:col-span-2 hover:shadow-[#ebedf4] transition-all duration-300">
                <h3 className="text-[10px] font-black text-slate-855 uppercase tracking-widest flex items-center gap-2">
                  <Bell className="text-blue-600 w-4 h-4" />
                  <span>Medical Alert Dispatch Channels</span>
                </h3>
                <div className="space-y-4 divide-y divide-white/20">
                  {[
                    { label: 'Ward pager instant-call trigger', desc: 'Instantly notify designated attending pager of Critical emergency admissions.' },
                    { label: 'Patient secure consent email sync', desc: 'Auto-compile HIPAA clearance summary docs on final signature verification.' }
                  ].map((p, index) => (
                    <div key={index} className={`flex justify-between items-center gap-4 ${index > 0 ? 'pt-4' : ''}`}>
                      <div className="text-xs">
                        <p className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide">{p.label}</p>
                        <p className="text-slate-400 mt-0.5 text-[10px] uppercase font-bold tracking-tight">{p.desc}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          addToast(`Channel preference for "${p.label}" toggled system-wide.`, 'success');
                        }}
                        className="w-11 h-6 bg-blue-600 rounded-full p-0.5 flex items-center justify-end cursor-pointer transition-all hover:bg-blue-700 active:scale-95 shadow-nm-button"
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </main>
        )}

        {/* Global floating responsive bottom bar for mobile screens */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onAddPatientClick={triggerAddPatient}
        />

        {/* Sidebar Mobile Dialog Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Cover Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
              />
              
              {/* Slider Panel Box */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#e2e8f0] z-[60] flex flex-col lg:hidden"
              >
                {/* Brand Banner */}
                <div className="h-16 flex items-center px-5 border-b border-[#e2e8f0] justify-between bg-white">
                  <div className="flex items-center">
                    <Logo className="h-7 w-auto" strokeColor="stroke-slate-850" dotClassName="" />
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Nav Links mapping */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {[
                    { id: 'in-patient', label: 'In-Patient Registry', icon: Users },
                    { id: 'mrd-files', label: 'MRD Electronic Files', icon: FolderLock },
                    { id: 'upload', label: 'Upload Documents', icon: PlusCircle },
                    { id: 'analytics', label: 'Performance metrics', icon: Activity },
                    { id: 'settings', label: 'System Configurations', icon: Settings }
                  ].map((elem) => {
                    const LinkIcon = elem.icon;
                    const isActive = activeTab === elem.id;
                    return (
                      <button
                        key={elem.id}
                        onClick={() => {
                          setActiveTab(elem.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <LinkIcon className="w-4 h-4 shrink-0" />
                        <span>{elem.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Profile Tray */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Authenticated Session</p>
                  <p className="text-xs font-bold text-slate-800">Dr. Sarah Chen</p>
                  <p className="text-[10px] text-slate-500">Lead Clinician • Ward 4B</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Patient filter drawer */}
        <FilterDrawer 
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={activeFilters}
          onApply={(updatedFilters) => setActiveFilters(updatedFilters)}
          onReset={handleResetFilters}
        />

        {/* Patient intake wizard modal popup */}
        <AddPatientWizard 
          isOpen={isWizardOpen}
          onClose={() => {
            setIsWizardOpen(false);
            setEditingPatient(null);
          }}
          onSave={handleSavePatient}
          initialPatient={editingPatient}
        />

        {/* Mobile/Tablet Patient Details Modal Popup Overlay */}
        <div className="xl:hidden">
          <PatientDetailsModal 
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onEdit={triggerEditPatient}
          />
        </div>

        {/* Dynamic Multi-Alert Toast HUD overlay */}
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none p-4 sm:p-0">
          <AnimatePresence>
            {toasts.length > 1 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setToasts([])}
                className="pointer-events-auto w-full py-2.5 bg-[#f1f3f9] text-sky-600 hover:text-sky-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-nm-button hover:shadow-nm-button-inset flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 border border-white/60 cursor-pointer self-end"
              >
                <span>Dismiss All Alerts ({toasts.length})</span>
                <span className="text-sky-400 font-extrabold text-xs">×</span>
              </motion.button>
            )}

            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="pointer-events-auto w-full bg-[#f1f3f9] border border-white/70 rounded-2xl p-4 shadow-nm-toast flex items-start gap-3 relative overflow-hidden"
              >
                {/* Visual colored side indicator accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  toast.type === 'success' ? 'bg-sky-500' :
                  toast.type === 'warning' ? 'bg-blue-500' :
                  toast.type === 'error' ? 'bg-slate-500' :
                  'bg-[#0066FF]'
                }`} />

                {/* Status custom icon wrapper */}
                <div className={`p-1.5 rounded-xl shrink-0 ${
                  toast.type === 'success' ? 'bg-sky-50/70 border border-sky-200/50 text-sky-600' :
                  toast.type === 'warning' ? 'bg-blue-50/70 border border-blue-200/50 text-blue-600' :
                  toast.type === 'error' ? 'bg-slate-50/70 border border-slate-200/50 text-slate-600' :
                  'bg-blue-50/70 border border-blue-200/50 text-[#0066FF]'
                }`}>
                  {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                   toast.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                   toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
                   <HelpCircle className="w-5 h-5" />}
                </div>

                {/* Message body blocks */}
                <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {toast.type === 'success' ? 'Task Completed' :
                       toast.type === 'warning' ? 'Admissions Alert' :
                       toast.type === 'error' ? 'System Failure' :
                       'Clinical Notification'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-snug">
                      {toast.message}
                    </p>
                  </div>
                  {toast.onUndo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.onUndo?.();
                        removeToast(toast.id);
                      }}
                      className="mt-2.5 px-2.5 py-1 bg-[#f1f3f9] text-blue-700 hover:text-blue-800 text-[10px] font-black uppercase tracking-wider border border-white/80 rounded-md shadow-nm-inset-small transition-all cursor-pointer pointer-events-auto self-start flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      Undo Action
                    </button>
                  )}
                </div>

                {/* Invariant dismiss button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-white/40 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
