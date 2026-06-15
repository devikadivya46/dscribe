import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Clock,
  Activity,
  Timer,
  PhoneCall,
  CheckCircle,
  Stethoscope,
  HeartPulse,
  Brain,
  Microscope,
  CalendarDays,
  Star,
  Award,
  Wallet,
  CreditCard
} from 'lucide-react';
import { OutPatientVisit, Doctor } from '../types';

interface OutPatientProps {
  visits: OutPatientVisit[];
  doctors: Doctor[];
  onUpdateStatus: (id: string, status: OutPatientVisit['status']) => void;
  onBookAppointment: (doctor: Doctor, date: string, time: string, patientName: string, age: string, type: OutPatientVisit['type']) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const cardMotion = (index: number) => ({
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.42, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' as const }
});

const statusStyles: Record<OutPatientVisit['status'], string> = {
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Consultation': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-600 border-rose-200'
};

const specialtyIcons: Record<string, typeof Stethoscope> = {
  Cardiologist: HeartPulse,
  Neurologist: Brain,
  Oncologist: Microscope,
  'General Physician': Stethoscope
};

const visitTypes: OutPatientVisit['type'][] = ['New Consultation', 'Follow-up', 'Routine Checkup'];

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:30 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

function getUpcomingDates(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    };
  });
}

export default function OutPatient({ visits, doctors, onUpdateStatus, onBookAppointment, onShowToast }: OutPatientProps) {
  const waitingCount = visits.filter(v => v.status === 'Waiting').length;
  const inConsultationCount = visits.filter(v => v.status === 'In Consultation').length;
  const nowServing = visits.find(v => v.status === 'In Consultation');

  const stats = [
    { icon: Users, label: "Today's Appointments", value: String(visits.length), sub: 'Scheduled OPD Visits', labelColor: 'text-teal-700', iconColor: 'text-teal-600', iconBg: 'bg-teal-50' },
    { icon: Clock, label: 'Patients Waiting', value: String(waitingCount), sub: 'In Queue Right Now', labelColor: 'text-amber-700', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
    { icon: Activity, label: 'In Consultation', value: String(inConsultationCount), sub: 'Active Consult Rooms', labelColor: 'text-blue-700', iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
    { icon: Timer, label: 'Avg Wait Time', value: '18 mins', sub: 'Rolling 1-Hour Average', labelColor: 'text-emerald-700', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' }
  ];

  const upcomingDates = React.useMemo(() => getUpcomingDates(6), []);

  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>(doctors[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = React.useState(upcomingDates[0]?.full ?? '');
  const [selectedTime, setSelectedTime] = React.useState(TIME_SLOTS[0]);
  const [visitType, setVisitType] = React.useState<OutPatientVisit['type']>('New Consultation');
  const [paymentMethod, setPaymentMethod] = React.useState<'Cash' | 'Online'>('Cash');
  const [patientName, setPatientName] = React.useState('');
  const [patientAge, setPatientAge] = React.useState('');
  const [patientPhone, setPatientPhone] = React.useState('');
  const [patientGender, setPatientGender] = React.useState('');
  const [patientEmail, setPatientEmail] = React.useState('');
  const [shake, setShake] = React.useState(false);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) ?? doctors[0];

  const handleCallNext = () => {
    const next = visits.find(v => v.status === 'Waiting');
    if (!next) {
      onShowToast?.('No patients currently waiting in the OPD queue.', 'info');
      return;
    }
    onUpdateStatus(next.id, 'In Consultation');
    onShowToast?.(`Token ${next.tokenNumber} (${next.patientName}) called in for consultation.`, 'success');
  };

  const handleMarkComplete = (visit: OutPatientVisit) => {
    onUpdateStatus(visit.id, 'Completed');
    onShowToast?.(`Consultation for ${visit.patientName} (Token ${visit.tokenNumber}) marked as completed.`, 'success');
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctor || !patientName.trim() || !patientAge.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      onShowToast?.('Please fill in patient name and age before confirming.', 'warning');
      return;
    }
    onBookAppointment(selectedDoctor, selectedDate, selectedTime, patientName.trim(), patientAge.trim(), visitType);
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setPatientGender('');
    setPatientEmail('');
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-6 lg:pl-72 pb-24 select-none animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 items-center justify-center shadow-card shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Out-Patient Department</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-bold">Live walk-in queue, consultation tokens, and OPD throughput.</p>
          </div>
        </div>
        <button
          onClick={handleCallNext}
          className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black flex items-center gap-2 shadow-[0_8px_16px_rgba(5,150,105,0.25)] transition-all cursor-pointer select-none uppercase tracking-wider"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Next Token</span>
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

      {/* Now Serving highlight */}
      <motion.div
        {...cardMotion(stats.length)}
        className="relative overflow-hidden bg-white border border-slate-100 shadow-card rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Now Serving</p>
            {nowServing ? (
              <>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Token {nowServing.tokenNumber} — {nowServing.patientName}
                </h2>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{nowServing.doctor} • {nowServing.department}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">No active consultation</h2>
                <p className="text-xs text-slate-500 font-bold mt-0.5">Call the next token to begin a consultation.</p>
              </>
            )}
          </div>
        </div>
        {nowServing && (
          <button
            onClick={() => handleMarkComplete(nowServing)}
            className="h-10 px-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-600 font-black rounded-full text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-card transition-all active:scale-95 cursor-pointer uppercase tracking-wider shrink-0"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mark Complete</span>
          </button>
        )}
      </motion.div>

      {/* Queue list */}
      <motion.div
        {...cardMotion(stats.length + 1)}
        className="bg-white border border-slate-100 shadow-card rounded-3xl p-6 space-y-4"
      >
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">OPD Queue & Token Board</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">All scheduled and walk-in tokens for today's clinic session</p>
        </div>

        <div className="space-y-3">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-card hover:border-slate-200 transition-all"
            >
              <div className="flex items-center gap-3 sm:w-1/4">
                <span className="w-14 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-black font-mono shrink-0">
                  {visit.tokenNumber}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{visit.patientName}</p>
                  <p className="text-[10px] font-mono text-slate-400">UHID: {visit.uhid}</p>
                </div>
              </div>

              <div className="sm:w-1/4 text-xs">
                <p className="font-bold text-slate-700">{visit.doctor}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{visit.department}</p>
              </div>

              <div className="sm:w-1/6 text-xs">
                <p className="font-bold text-slate-700">{visit.appointmentTime}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{visit.type}</p>
              </div>

              <p className="flex-1 text-[11px] text-slate-500 leading-relaxed">{visit.reason}</p>

              <div className="flex items-center gap-2 sm:w-auto shrink-0">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${statusStyles[visit.status]}`}>
                  {visit.status}
                </span>
                {visit.status === 'In Consultation' && (
                  <button
                    onClick={() => handleMarkComplete(visit)}
                    className="h-8 px-3 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-card transition-all cursor-pointer"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Book an Appointment */}
      <motion.div
        {...cardMotion(stats.length + 2)}
        className="bg-white border border-slate-100 shadow-card rounded-3xl p-6 space-y-6"
      >
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Book an Appointment</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Schedule a new OPD visit for a walk-in or referred patient</p>
        </div>

        {/* Doctor picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctors.map(doctor => {
            const SpecIcon = specialtyIcons[doctor.specialty] ?? Stethoscope;
            const isSelected = doctor.id === selectedDoctorId;
            return (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctorId(doctor.id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-50/50 shadow-card' : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-card'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                    <SpecIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{doctor.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide truncate">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-black text-slate-700">₹{doctor.consultationFee}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${doctor.available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                    {doctor.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedDoctor && (
          <>
            {/* Doctor profile card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex items-center gap-4 sm:w-1/3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                  {(() => {
                    const SpecIcon = specialtyIcons[selectedDoctor.specialty] ?? Stethoscope;
                    return <SpecIcon className="w-7 h-7 text-white" />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{selectedDoctor.name}</p>
                  <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wide">{selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-white border border-slate-100">
                  <Star className="w-4 h-4 text-amber-500 mx-auto" />
                  <p className="text-sm font-black text-slate-800 mt-1">{selectedDoctor.successRate}%</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Success</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white border border-slate-100">
                  <Award className="w-4 h-4 text-blue-500 mx-auto" />
                  <p className="text-sm font-black text-slate-800 mt-1">{selectedDoctor.yearsExperience} yrs</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Experience</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white border border-slate-100">
                  <Users className="w-4 h-4 text-emerald-500 mx-auto" />
                  <p className="text-sm font-black text-slate-800 mt-1">{(selectedDoctor.patientsServed / 1000).toFixed(1)}k</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Patients</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-black text-slate-700 uppercase tracking-wide text-[10px] mr-1.5">About:</span>
              {selectedDoctor.about}
            </p>

            {/* Booking panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div className="space-y-4 pt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Select Date
                  </p>
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {upcomingDates.map(d => (
                      <button
                        key={d.full}
                        onClick={() => setSelectedDate(d.full)}
                        className={`shrink-0 w-14 py-2 rounded-2xl border text-center transition-all cursor-pointer ${selectedDate === d.full ? 'bg-emerald-600 border-emerald-600 text-white shadow-card' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}`}
                      >
                        <p className="text-[9px] font-bold uppercase">{d.weekday}</p>
                        <p className="text-sm font-black">{d.day}</p>
                        <p className="text-[9px] font-bold uppercase">{d.month}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Available Time Slots
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`h-9 px-3 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${selectedTime === t ? 'bg-emerald-600 border-emerald-600 text-white shadow-card' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Visit Type</p>
                  <div className="flex flex-wrap gap-2">
                    {visitTypes.map(t => (
                      <button
                        key={t}
                        onClick={() => setVisitType(t)}
                        className={`h-9 px-3 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${visitType === t ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Patient Details</p>
                  <div className={`grid grid-cols-2 gap-3 ${shake ? 'animate-shake' : ''}`}>
                    <input
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="Patient Name"
                      className="col-span-2 h-10 px-4 rounded-full border border-slate-100 bg-white text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-300"
                    />
                    <input
                      value={patientAge}
                      onChange={e => setPatientAge(e.target.value)}
                      placeholder="Age"
                      type="number"
                      className="h-10 px-4 rounded-full border border-slate-100 bg-white text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-300"
                    />
                    <select
                      value={patientGender}
                      onChange={e => setPatientGender(e.target.value)}
                      className="h-10 px-4 rounded-full border border-slate-100 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-300"
                    >
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="h-10 px-4 rounded-full border border-slate-100 bg-white text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-300"
                    />
                    <input
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      placeholder="Email"
                      type="email"
                      className="h-10 px-4 rounded-full border border-slate-100 bg-white text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-300"
                    />
                  </div>
                </div>
              </div>

              {/* Booking summary */}
              <div className="pt-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-3 h-full flex flex-col">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Booking Summary</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Selected Doctor</span><span className="font-black text-slate-800">{selectedDoctor.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Specialty</span><span className="font-black text-slate-800">{selectedDoctor.specialty}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Date</span><span className="font-black text-slate-800 text-right">{selectedDate}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Time</span><span className="font-black text-slate-800">{selectedTime}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-bold">Consultation Fee</span><span className="font-black text-emerald-600">₹{selectedDoctor.consultationFee}</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payment</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentMethod('Cash')}
                        className={`flex-1 h-9 rounded-full border text-[11px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${paymentMethod === 'Cash' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-600'}`}
                      >
                        <Wallet className="w-3.5 h-3.5" /> Cash
                      </button>
                      <button
                        onClick={() => setPaymentMethod('Online')}
                        className={`flex-1 h-9 rounded-full border text-[11px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${paymentMethod === 'Online' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-600'}`}
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Online
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={!selectedDoctor.available}
                    className="mt-auto h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(5,150,105,0.25)] transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{selectedDoctor.available ? 'Confirm Booking' : 'Doctor Unavailable'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

    </main>
  );
}
