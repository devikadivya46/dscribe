import React from 'react';
import { ChevronDown, Stethoscope, UsersRound } from 'lucide-react';
import { CareTeamMember, CareTeamRole } from '../types';
import { departmentChipClass, roleChipClass } from '../careTeam';

interface CareTeamComponentProps {
  careTeam: CareTeamMember[];
  compact?: boolean;
}

const GROUPS: { title: string; roles: CareTeamRole[] }[] = [
  { title: 'Primary Consultant', roles: ['Primary Consultant'] },
  { title: 'Consulting Doctors', roles: ['Cross Consultant', 'Surgeon', 'Anaesthetist'] },
  { title: 'Resident Doctors', roles: ['Resident Doctor', 'Duty Doctor', 'ICU Doctor'] },
  { title: 'Visiting Doctors', roles: ['Visiting Doctor'] }
];

export default function CareTeamComponent({ careTeam, compact = false }: CareTeamComponentProps) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    'Primary Consultant': true,
    'Consulting Doctors': true,
    'Resident Doctors': true,
    'Visiting Doctors': !compact
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <UsersRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Care Team</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{careTeam.length} Doctors Coordinating Care</p>
          </div>
        </div>
      </div>

      {GROUPS.map((group) => {
        const members = careTeam.filter((member) => group.roles.includes(member.role));
        if (members.length === 0) return null;
        const isOpen = openGroups[group.title];

        return (
          <section key={group.title} className="bg-white border border-slate-100 rounded-[24px] shadow-card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenGroups((prev) => ({ ...prev, [group.title]: !prev[group.title] }))}
              className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{members.length} assigned</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2.5">
                {members.map((member) => (
                  <article key={member.id} className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-[20px]">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.doctor} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 border-2 border-white shadow-sm flex items-center justify-center font-black text-xs shrink-0">
                        {member.doctor.replace('Dr. ', '').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-xs font-black text-slate-900 truncate">{member.doctor}</p>
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${roleChipClass(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black ${departmentChipClass(member.department)}`}>
                          {member.department}
                        </span>
                        {!compact && member.activity && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Stethoscope className="w-3 h-3" />
                            {member.activity}
                          </span>
                        )}
                      </div>
                    </div>
                    {!compact && (
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                        <p className="text-[10px] font-black text-slate-700 mt-0.5">{member.lastSeen || 'Today'}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
