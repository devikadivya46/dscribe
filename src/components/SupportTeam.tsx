import React from 'react';
import { motion } from 'motion/react';
import {
  LifeBuoy,
  Inbox,
  Loader,
  CheckCircle2,
  Clock,
  Laptop,
  Building2,
  HardDrive,
  KeyRound,
  PhoneCall,
  CheckCircle
} from 'lucide-react';
import { SupportTicket } from '../types';

interface SupportTeamProps {
  tickets: SupportTicket[];
  onResolve: (id: string) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const cardMotion = (index: number) => ({
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.42, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' as const }
});

const categoryIcons: Record<SupportTicket['category'], typeof Laptop> = {
  'IT Support': Laptop,
  Facilities: Building2,
  Equipment: HardDrive,
  'Software Access': KeyRound
};

const priorityStyles: Record<SupportTicket['priority'], string> = {
  Low: 'bg-blue-50 text-blue-700 border-blue-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-rose-50 text-rose-600 border-rose-200'
};

const statusStyles: Record<SupportTicket['status'], string> = {
  Open: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

export default function SupportTeam({ tickets, onResolve, onShowToast }: SupportTeamProps) {
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  const stats = [
    { icon: Inbox, label: 'Open Tickets', value: String(openCount), sub: 'Awaiting Assignment', labelColor: 'text-blue-700', iconColor: 'text-[#0066FF]', iconBg: 'bg-pastel-blue' },
    { icon: Loader, label: 'In Progress', value: String(inProgressCount), sub: 'Being Worked On', labelColor: 'text-indigo-700', iconColor: 'text-indigo-600', iconBg: 'bg-pastel-purple' },
    { icon: CheckCircle2, label: 'Resolved', value: String(resolvedCount), sub: 'Closed This Week', labelColor: 'text-purple-700', iconColor: 'text-purple-600', iconBg: 'bg-pastel-pink' },
    { icon: Clock, label: 'Avg Response Time', value: '12 mins', sub: 'First Response SLA', labelColor: 'text-emerald-700', iconColor: 'text-emerald-600', iconBg: 'bg-pastel-green' }
  ];

  const handleResolve = (ticket: SupportTicket) => {
    onResolve(ticket.id);
    onShowToast?.(`Ticket "${ticket.subject}" marked as resolved.`, 'success');
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24 select-none animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 items-center justify-center shadow-card shrink-0">
            <LifeBuoy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Support Team</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-bold">IT, facilities, and equipment requests from across the hospital.</p>
          </div>
        </div>
        <button
          onClick={() => onShowToast?.('New support ticket form opened.', 'info')}
          className="h-10 px-5 bg-[#0066FF] hover:bg-blue-700 text-white rounded-full text-xs font-black flex items-center gap-2 shadow-[0_8px_16px_rgba(0,102,255,0.2)] transition-all cursor-pointer select-none uppercase tracking-wider"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Raise New Ticket</span>
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

      {/* Ticket list */}
      <motion.div
        {...cardMotion(stats.length)}
        className="bg-white border border-slate-100 shadow-card rounded-3xl p-6 space-y-4"
      >
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Support Tickets</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Requests raised by staff across all departments</p>
        </div>

        <div className="space-y-3">
          {tickets.map((ticket) => {
            const CategoryIcon = categoryIcons[ticket.category];
            return (
              <div
                key={ticket.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all"
              >
                <div className="flex items-center gap-3 sm:w-1/3">
                  <div className="w-10 h-10 rounded-full bg-pastel-blue flex items-center justify-center shrink-0">
                    <CategoryIcon className="w-4.5 h-4.5 text-[#0066FF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{ticket.subject}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{ticket.category} • {ticket.department}</p>
                  </div>
                </div>

                <div className="sm:w-1/4 text-xs">
                  <p className="font-bold text-slate-700">Requested by {ticket.requestedBy}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Assigned to {ticket.assignedTo}</p>
                </div>

                <p className="flex-1 text-[10px] text-slate-400 font-bold">{ticket.createdAt}</p>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${priorityStyles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${statusStyles[ticket.status]}`}>
                    {ticket.status}
                  </span>
                  {ticket.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolve(ticket)}
                      className="h-8 px-3 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Urgent help banner */}
      <motion.div
        {...cardMotion(stats.length + 1)}
        className="bg-[#1b1f2b] rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Need urgent help?</p>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Call the Support Desk on Ext. 9000 for critical IT or facilities issues.</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-4 py-2 self-start sm:self-center">
          24/7 On-Call
        </span>
      </motion.div>

    </main>
  );
}
