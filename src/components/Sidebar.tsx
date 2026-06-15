import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  FolderLock,
  UploadCloud,
  BarChart3,
  ShieldCheck,
  Settings,
  HelpCircle,
  Stethoscope,
  LayoutDashboard,
  CalendarCheck,
  Pill,
  Sparkles,
  LifeBuoy,
  Accessibility
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePatientCount: number;
  unverifiedFilesCount: number;
  opdWaitingCount: number;
  openTicketsCount: number;
  comfortMode: boolean;
  onToggleComfortMode: () => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activePatientCount,
  unverifiedFilesCount,
  opdWaitingCount,
  openTicketsCount,
  comfortMode,
  onToggleComfortMode,
  onShowToast
}: SidebarProps) {

  const navItems = [
    {
      id: 'overview',
      label: 'Home',
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      id: 'in-patient',
      label: 'In-Patient',
      icon: Users,
      badge: activePatientCount > 0 ? activePatientCount : undefined,
      color: 'text-blue-600'
    },
    {
      id: 'mrd-files',
      label: 'MRD Files',
      icon: FolderLock,
      badge: unverifiedFilesCount > 0 ? unverifiedFilesCount : undefined,
      color: 'text-indigo-600'
    },
    {
      id: 'upload',
      label: 'Upload Documents',
      icon: UploadCloud,
      color: 'text-emerald-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-amber-600'
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      color: 'text-teal-600'
    }
  ];

  const extendedNavItems = [
    {
      id: 'out-patient',
      label: 'Out-Patient',
      icon: CalendarCheck,
      badge: opdWaitingCount > 0 ? opdWaitingCount : undefined,
      color: 'text-blue-600'
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: Pill,
      color: 'text-indigo-600'
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: Sparkles,
      color: 'text-purple-600'
    },
    {
      id: 'support',
      label: 'Support Team',
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      color: 'text-emerald-600'
    }
  ];

  const renderNavButton = (item: typeof navItems[number]) => {
    const IconComponent = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 relative overflow-hidden group ${
          isActive
            ? 'bg-[#0066FF] text-white font-black shadow-[0_8px_20px_rgba(0,102,255,0.2)]'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95'
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="navActivePill"
            className="absolute inset-0 bg-[#0066FF] rounded-full shadow-[0_8px_20px_rgba(0,102,255,0.35)]"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          />
        )}
        <div className="relative z-10 flex items-center gap-3">
          <IconComponent className={`w-4 h-4 transition-colors ${
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
          }`} />
          <span className="tracking-tight">{item.label}</span>
        </div>
        {item.badge !== undefined && (
          <span className={`relative z-10 text-[10px] px-2 py-0.5 font-black rounded-full transition-colors border ${
            isActive
              ? 'bg-white/25 text-white border-white/30 shadow-sm'
              : 'bg-pastel-blue text-blue-700 border-slate-200'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
        <div className="flex items-baseline font-sans">
          <span className="text-xl font-black tracking-tight text-neutral-900">DScribe</span>
          <span className="text-xl font-black text-[#0066FF] ml-0.5 animate-pulse">.</span>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 font-bold uppercase bg-white border border-slate-200 text-slate-500 rounded-full shadow-sm tracking-wider leading-none">
          v2.4
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Navigation</p>
          <div className="space-y-3">
            {navItems.map(renderNavButton)}
          </div>
        </div>
        <div>
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Extended Modules</p>
          <div className="space-y-3">
            {extendedNavItems.map(renderNavButton)}
          </div>
        </div>
      </nav>

      {/* System Configurations & Help */}
      <div className="px-4 py-4 border-t border-slate-100 bg-white space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-extrabold transition-all duration-150 ${
            activeTab === 'settings'
              ? 'bg-white text-blue-700 pointer-events-none border border-slate-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>System Config</span>
        </button>
        <button
          onClick={onToggleComfortMode}
          title="Toggle larger text, buttons & contrast"
          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-full text-xs font-extrabold transition-all duration-150 ${
            comfortMode
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.08)]'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Accessibility className={`w-4 h-4 ${comfortMode ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Comfort Mode</span>
          </div>
          <span className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-all shrink-0 ${comfortMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}>
            <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
          </span>
        </button>
        <button
          onClick={() => {
            if (onShowToast) {
              onShowToast('Clinical Help Line: Call ward coordinator on Ext. 8021.', 'info');
            } else {
              alert('Clinical Help Line: Call ward coordinator on Ext. 8021.');
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-full text-xs font-extrabold transition-all text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Clinical Help</span>
        </button>
      </div>

      {/* Admin User Footer Slot */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="p-3.5 bg-slate-50 border border-slate-100 shadow-sm rounded-2xl flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#f1f3f9] text-[#0066FF] flex items-center justify-center font-black text-xs shadow-nm-inset-small border border-white">
              SC
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#f1f3f9] rounded-full"></span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-800 truncate">Dr. Sarah Chen</p>
            <p className="text-[9px] text-[#0066FF] font-extrabold uppercase tracking-wider truncate">Lead • Ward 4B</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
