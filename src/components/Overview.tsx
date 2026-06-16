import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Users,
  Stethoscope,
  FolderLock,
  Building2,
  UploadCloud,
  BarChart3,
  Settings,
  ChevronRight,
  CalendarCheck,
  Pill,
  Sparkles,
  LifeBuoy,
  HeartPulse,
  Activity
} from 'lucide-react';
import { Patient, MRDFile } from '../types';
import { getCareTeam, getDepartments } from '../careTeam';

interface OverviewProps {
  patients: Patient[];
  files: MRDFile[];
  setActiveTab: (tab: string) => void;
}

const cardMotion = (index: number) => ({
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.42, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' as const }
});

const accentPalette = [
  { bg: 'bg-teal-50', text: 'text-teal-600' },
  { bg: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-violet-50', text: 'text-violet-600' },
  { bg: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-rose-50', text: 'text-rose-600' }
];

export default function Overview({ patients, files, setActiveTab }: OverviewProps) {

  function AnimatedNumber({ value, duration = 600 }: { value: string; duration?: number }) {
    const [display, setDisplay] = React.useState<string>('0');
    React.useEffect(() => {
      let start: number | null = null;
      const isPct = typeof value === 'string' && value.trim().endsWith('%');
      const target = isPct ? parseFloat(value.replace('%', '')) : Number(value || 0);
      if (Number.isNaN(target)) { setDisplay(String(value)); return; }
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const t = Math.min(1, elapsed / duration);
        const current = Math.round((target * t) * (isPct ? 10 : 1)) / (isPct ? 10 : 1);
        setDisplay(isPct ? `${current}%` : String(Math.floor(current)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, [value, duration]);
    return <p className="text-2xl font-black text-slate-800 tracking-tight">{display}</p>;
  }

  const activePatients = patients.length;
  const uniqueDoctors = new Set(patients.flatMap(p => getCareTeam(p).map(member => member.doctor))).size;
  const totalFiles = files.length;
  const pendingFiles = files.filter(f => f.status === 'Pending Review').length;

  const departmentBreakdown = React.useMemo(() => {
    if (activePatients === 0) return [];
    const counts = patients.reduce<Record<string, number>>((acc, p) => {
      getDepartments(p).forEach((department) => {
        acc[department] = (acc[department] || 0) + 1;
      });
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: Math.round((count / activePatients) * 100) }));
  }, [patients, activePatients]);

  const stats = [
    {
      icon: Users,
      label: 'Active Incidence',
      value: String(activePatients),
      sub: 'Registered Case Dossiers',
      labelColor: 'text-teal-700',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50'
    },
    {
      icon: Stethoscope,
      label: 'Attending Clinicians',
      value: String(uniqueDoctors),
      sub: 'On Active Duty Roster',
      labelColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      icon: FolderLock,
      label: 'MRD Files on Record',
      value: String(totalFiles),
      sub: `${pendingFiles} Awaiting Review`,
      labelColor: 'text-violet-700',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50'
    },
    {
      icon: Building2,
      label: 'Bed Allocation',
      value: '85.3%',
      sub: 'Sector Ward Utilization',
      labelColor: 'text-amber-700',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50'
    }
  ];

  const features = [
    {
      id: 'in-patient',
      icon: Users,
      title: 'In-Patient Registry',
      description: 'Browse, admit, and triage patient case dossiers across all active wards.'
    },
    {
      id: 'mrd-files',
      icon: FolderLock,
      title: 'MRD Electronic Files',
      description: 'Review, verify, and annotate medical record documents securely.'
    },
    {
      id: 'upload',
      icon: UploadCloud,
      title: 'Document Ingestion',
      description: 'Securely upload imaging, consent forms, and clinical reports.'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Live triage logs, ward telemetry, and document compliance metrics.'
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'System Configurations',
      description: 'Manage clearances, alert channels, and database synchronization.'
    },
    {
      id: 'out-patient',
      icon: CalendarCheck,
      title: 'Out-Patient Department',
      description: 'Manage walk-in tokens, consultation queues, and OPD throughput.'
    },
    {
      id: 'pharmacy',
      icon: Pill,
      title: 'Pharmacy',
      description: 'Track inventory levels, stock alerts, and prescription fulfillment.'
    },
    {
      id: 'ai-insights',
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Predictive risk alerts, resource forecasts, and care recommendations.'
    },
    {
      id: 'support',
      icon: LifeBuoy,
      title: 'Support Team',
      description: 'Raise and track IT, facilities, and equipment support tickets.'
    }
  ];

  return (
    <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24 select-none animate-fadeIn">

      {/* Hero / Welcome Panel */}
      <motion.div
        {...cardMotion(0)}
        className="relative overflow-hidden bg-white border border-slate-100 shadow-card rounded-3xl p-6 md:p-10"
      >
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Clinical Workspace • Ward 4B Active</span>
            </span>

            <h1 className="mt-4 text-2xl md:text-4xl font-black text-[#0f172a] tracking-tight max-w-2xl">
              Welcome back, Dr. Sarah Chen.
            </h1>
            <p className="mt-3 text-xs md:text-sm text-slate-500 max-w-xl font-semibold leading-relaxed">
              Here's a real-time snapshot of your ward — patient registry, document compliance, and bed allocation, all in one console.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setActiveTab('in-patient')}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-100 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Open In-Patient Directory</span>
              </button>
              <button
                onClick={() => setActiveTab('out-patient')}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black flex items-center gap-2 shadow-[0_8px_16px_rgba(5,150,105,0.2)] transition-all cursor-pointer select-none"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="h-10 px-4 bg-white border border-slate-100 hover:border-slate-200 rounded-full text-xs font-black text-slate-700 flex items-center gap-1.5 shadow-sm hover:shadow-card transition-all cursor-pointer select-none"
              >
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          {/* Decorative illustration cluster */}
          <div className="hidden lg:flex items-center justify-center relative w-56 h-44 shrink-0">
            <div className="absolute top-0 right-4 w-28 h-28 rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center shadow-card">
              <HeartPulse className="w-12 h-12 text-white" />
            </div>
            <div className="absolute bottom-2 left-0 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-card">
              <Stethoscope className="w-9 h-9 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-card">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Snapshot Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              {...cardMotion(idx + 1)}
              className="p-5 bg-white border border-slate-100 shadow-card rounded-3xl flex flex-col justify-between hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.labelColor}`}>{stat.label}</span>
                <div className={`w-9 h-9 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                  <StatIcon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-3">
                <AnimatedNumber value={stat.value} />
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{stat.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Access Feature Cards */}
      <div>
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => {
            const FeatureIcon = feature.icon;
            const accent = accentPalette[idx % accentPalette.length];
            return (
              <motion.button
                key={feature.id}
                {...cardMotion(idx + stats.length + 1)}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveTab(feature.id)}
                className="text-left bg-white border border-slate-100 shadow-card rounded-3xl p-6 hover:shadow-card-hover hover:border-slate-200 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-full ${accent.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <FeatureIcon className={`w-5 h-5 ${accent.text}`} />
                </div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight">{feature.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{feature.description}</p>
                <div className="flex items-center gap-1 mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <span>Open</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Live Ward & Department Snapshot */}
      <motion.div
        {...cardMotion(stats.length + features.length + 1)}
        className="bg-white border border-slate-100 shadow-card rounded-3xl p-6 space-y-4"
      >
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Live Ward & Department Snapshot</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Current distribution of registered in-patients by medical unit</p>
        </div>

        {departmentBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">No active patient records to display.</p>
        ) : (
          <div className="space-y-4">
            {departmentBreakdown.map(dept => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                  <span>{dept.name}</span>
                  <span className="text-slate-500">{dept.count} Patients ({dept.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${dept.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </main>
  );
}
