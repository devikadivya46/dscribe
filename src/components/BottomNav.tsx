import React from 'react';
import { motion } from 'motion/react';
import { Users, FolderLock, PlusCircle, BarChart3, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddPatientClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onAddPatientClick }: BottomNavProps) {
  const navItems = [
    { id: 'in-patient', label: 'Registry', icon: Users },
    { id: 'mrd-files', label: 'Records', icon: FolderLock },
    { id: 'add-patient', label: 'Admit', icon: PlusCircle, isMiddle: true },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Admin', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 h-16 flex items-center justify-around px-2 z-40 shadow-card pb-safe">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;

        if (item.isMiddle) {
          return (
            <button
              key={item.id}
              onClick={onAddPatientClick}
              className="flex flex-col items-center justify-center -mt-8 bg-[#0066FF] text-white w-14 h-14 rounded-full shadow-[0_8px_20px_rgba(0,102,255,0.3)] border-2 border-white/80 hover:bg-blue-700 active:scale-95 transition-all outline-none"
              title="Quick Admit Patient"
            >
              <IconComponent className="w-6 h-6" />
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-grow py-1 gap-0.5 rounded-full transition-all duration-150 ${
              isActive
                ? 'text-[#0066FF] font-black'
                : 'text-slate-400 hover:text-[#0b1c30]'
            }`}
          >
            <div className={`relative p-1.5 rounded-full transition-all ${isActive ? 'text-white' : ''}`}>
              {isActive && (
                <motion.div
                  layoutId="navActivePill"
                  className="absolute inset-0 bg-[#0066FF] rounded-full shadow-[0_4px_12px_rgba(0,102,255,0.25)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <IconComponent className="w-5 h-5 relative z-10" />
            </div>
            <span className="text-[9px] uppercase font-bold tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
