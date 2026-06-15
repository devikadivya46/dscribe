import React from 'react';
import { motion } from 'motion/react';
import {
  Pill,
  Package,
  AlertTriangle,
  XCircle,
  ClipboardList,
  Syringe,
  HeartPulse,
  Leaf,
  Boxes,
  CheckCircle
} from 'lucide-react';
import { PharmacyItem, Prescription } from '../types';

interface PharmacyProps {
  items: PharmacyItem[];
  prescriptions: Prescription[];
  onDispense: (id: string) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const cardMotion = (index: number) => ({
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.42, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' as const }
});

const categoryIcons: Record<PharmacyItem['category'], typeof Pill> = {
  Antibiotics: Syringe,
  Analgesics: Pill,
  Cardiac: HeartPulse,
  Consumables: Boxes,
  Vitamins: Leaf
};

const stockStatusStyles: Record<PharmacyItem['status'], string> = {
  'In Stock': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  'Out of Stock': 'bg-rose-50 text-rose-600 border-rose-200'
};

const stockBarStyles: Record<PharmacyItem['status'], string> = {
  'In Stock': 'bg-emerald-400',
  'Low Stock': 'bg-amber-400',
  'Out of Stock': 'bg-rose-400'
};

export default function Pharmacy({ items, prescriptions, onDispense, onShowToast }: PharmacyProps) {
  const lowStockCount = items.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = items.filter(i => i.status === 'Out of Stock').length;
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'Pending');

  const stats = [
    { icon: Package, label: 'Total SKUs', value: String(items.length), sub: 'Items in Inventory', labelColor: 'text-blue-700', iconColor: 'text-[#0066FF]', iconBg: 'bg-pastel-blue' },
    { icon: AlertTriangle, label: 'Low Stock', value: String(lowStockCount), sub: 'Below Reorder Level', labelColor: 'text-indigo-700', iconColor: 'text-indigo-600', iconBg: 'bg-pastel-purple' },
    { icon: XCircle, label: 'Out of Stock', value: String(outOfStockCount), sub: 'Needs Immediate Reorder', labelColor: 'text-purple-700', iconColor: 'text-purple-600', iconBg: 'bg-pastel-pink' },
    { icon: ClipboardList, label: 'Pending Prescriptions', value: String(pendingPrescriptions.length), sub: 'Awaiting Dispense', labelColor: 'text-emerald-700', iconColor: 'text-emerald-600', iconBg: 'bg-pastel-green' }
  ];

  const handleDispense = (prescription: Prescription) => {
    onDispense(prescription.id);
    onShowToast?.(`Prescription for ${prescription.patientName} dispensed successfully.`, 'success');
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24 select-none animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 items-center justify-center shadow-card shrink-0">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Pharmacy</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-bold">Inventory levels, stock alerts, and prescription fulfillment.</p>
          </div>
        </div>
        <button
          onClick={() => onShowToast?.('Inventory report export started.', 'info')}
          className="h-10 px-5 bg-[#0066FF] hover:bg-blue-700 text-white rounded-full text-xs font-black flex items-center gap-2 shadow-[0_8px_16px_rgba(0,102,255,0.2)] transition-all cursor-pointer select-none uppercase tracking-wider"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Export Inventory Report</span>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              {...cardMotion(idx)}
              className="p-5 bg-white border border-slate-100 shadow-card rounded-3xl flex flex-col justify-between hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.labelColor}`}>{stat.label}</span>
                <div className={`w-9 h-9 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                  <StatIcon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{stat.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Inventory list */}
        <motion.div
          {...cardMotion(stats.length)}
          className="lg:col-span-2 bg-white border border-slate-100 shadow-card rounded-3xl p-6 space-y-4"
        >
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Inventory</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Live stock levels across all pharmacy categories</p>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const CategoryIcon = categoryIcons[item.category];
              const fillPct = Math.max(4, Math.min(100, Math.round((item.stock / (item.reorderLevel * 3)) * 100)));
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <div className="w-10 h-10 rounded-full bg-pastel-blue flex items-center justify-center shrink-0">
                      <CategoryIcon className="w-4.5 h-4.5 text-[#0066FF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500">{item.stock} {item.unit} in stock</span>
                      <span className="text-[10px] font-bold text-slate-400">Reorder at {item.reorderLevel}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${stockBarStyles[item.status]}`} style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-1/4 shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold">Exp. {item.expiryDate}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${stockStatusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Pending prescriptions */}
        <motion.div
          {...cardMotion(stats.length + 1)}
          className="bg-white border border-slate-100 shadow-card rounded-3xl p-6 space-y-4"
        >
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pending Prescriptions</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting dispensing from the pharmacy counter</p>
          </div>

          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{rx.patientName}</p>
                    <p className="text-[10px] font-mono text-slate-400">UHID: {rx.uhid} • {rx.date}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border shrink-0 ${
                    rx.status === 'Dispensed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {rx.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Prescribed by {rx.doctor}</p>
                <div className="flex flex-wrap gap-1.5">
                  {rx.medicines.map((med) => (
                    <span key={med} className="text-[10px] px-2 py-0.5 rounded-full bg-pastel-purple text-indigo-700 font-bold">
                      {med}
                    </span>
                  ))}
                </div>
                {rx.status === 'Pending' && (
                  <button
                    onClick={() => handleDispense(rx)}
                    className="w-full h-9 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Dispense</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </main>
  );
}
