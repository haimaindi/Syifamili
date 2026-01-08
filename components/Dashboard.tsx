
import React, { useState, useMemo } from 'react';
import { Calendar, Pill, ArrowRight, TrendingUp, Cpu, X, Clock, MapPin, User, Activity, Loader2, Heart, Shield, Zap } from 'lucide-react';
import { FamilyMember, Appointment, Medication, Language } from '../types';
import { getHealthInsights } from '../services/geminiService';
import { useTranslation } from '../translations';

interface DashboardProps {
  members: FamilyMember[];
  appointments: Appointment[];
  meds: Medication[];
  language: Language;
  onSwitchMember: (id: string) => void;
  onNavigateToDetail: (tab: string, memberId: string, itemId: string) => void;
  activeMemberId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ members, appointments, meds, language, onSwitchMember, onNavigateToDetail, activeMemberId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any[] | null>(null);
  const t = useTranslation(language);

  const generateFullReport = async () => {
    setIsGenerating(true);
    const allInsights = [];
    // Analisa seluruh anggota keluarga tanpa batasan slice
    for (const member of members) {
      const insights = await getHealthInsights(member, language);
      allInsights.push({ member, insights });
    }
    setReport(allInsights);
    setIsGenerating(false);
  };

  const sortedAppointments = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter(app => new Date(app.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, 4);
  }, [appointments]);

  const sortedMeds = useMemo(() => {
    return [...meds]
      .filter(m => m.active && m.nextTime)
      .sort((a, b) => new Date(a.nextTime).getTime() - new Date(b.nextTime).getTime())
      .slice(0, 4);
  }, [meds]);

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10"><Activity size={200} /></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          <div>
            <h2 className="text-4xl font-black mb-3 tracking-tight">{t.welcome}</h2>
            <p className="opacity-80 max-w-md font-medium text-lg leading-relaxed">{t.familyOverview}</p>
          </div>
          <div className="flex -space-x-5 overflow-visible">
            {members.map(member => (
              <button 
                key={member.id}
                onClick={() => onSwitchMember(member.id)}
                className={`w-20 h-20 rounded-[2.5rem] border-8 overflow-hidden hover:scale-110 transition-all shadow-2xl ${
                  activeMemberId === member.id ? 'border-amber-400 z-20 scale-110' : 'border-white z-10'
                }`}
              >
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* APPOINTMENT CARD */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calendar size={24} /></div>
            <h3 className="font-black text-slate-800 tracking-tight">{t.nextCheckups}</h3>
          </div>
          <div className="space-y-4 flex-1">
            {sortedAppointments.length > 0 ? sortedAppointments.map(app => (
              <div 
                key={app.id} 
                onClick={() => onNavigateToDetail('schedule', app.memberId, app.id)}
                className="flex gap-4 p-4 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 shrink-0 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                  <span className="text-[8px] font-black uppercase tracking-widest">{new Date(app.dateTime).toLocaleString(language === 'ID' ? 'id-ID' : 'en-US', { month: 'short' })}</span>
                  <span className="text-xl font-black leading-none">{new Date(app.dateTime).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-sm line-clamp-1">{app.title}</h4>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{getMemberName(app.memberId)}</p>
                  <div className="flex items-center gap-3 opacity-60">
                     <div className="flex items-center gap-1"><Clock size={10} /><span className="text-[9px] font-bold">{new Date(app.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</span></div>
                     <div className="flex items-center gap-1 truncate"><MapPin size={10} /><span className="text-[9px] font-bold truncate">{app.location}</span></div>
                  </div>
                </div>
              </div>
            )) : <NoDataMessage text={t.noAppointments} />}
          </div>
        </div>

        {/* MED REMINDER CARD */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Pill size={24} /></div>
            <h3 className="font-black text-slate-800 tracking-tight">{t.medReminders}</h3>
          </div>
          <div className="space-y-4 flex-1">
            {sortedMeds.length > 0 ? sortedMeds.map(med => (
              <div 
                key={med.id} 
                onClick={() => onNavigateToDetail('meds', med.memberId, med.id)}
                className="p-5 rounded-[2rem] bg-amber-50/50 border border-amber-100 hover:bg-white hover:border-amber-200 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">{getMemberName(med.memberId)}</p>
                     <h4 className="font-black text-slate-800 text-sm">{med.name}</h4>
                   </div>
                   <span className="text-[8px] font-black bg-amber-600 text-white px-3 py-1 rounded-full uppercase">{med.dosage}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                   <Clock size={12} className="text-amber-500" />
                   {new Date(med.nextTime).toLocaleString()}
                </div>
              </div>
            )) : <NoDataMessage text={t.noMeds} />}
          </div>
        </div>

        {/* AI INSIGHTS TRIGGER CARD */}
        <div className="bg-slate-900 p-8 rounded-[3.5rem] shadow-2xl flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={150} /></div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Cpu size={24} /></div>
            <h3 className="font-black text-white tracking-tight">{t.familyStatus}</h3>
          </div>
          <div className="flex-1 space-y-4 relative z-10 text-slate-400">
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-center">
              <p className="text-sm leading-relaxed mb-6">AI akan menganalisa seluruh profil keluarga untuk memberikan insight kesehatan preventif secara komprehensif.</p>
              <div className="flex justify-center -space-x-2">
                 {members.slice(0, 6).map(m => (
                   <img key={m.id} src={m.photoUrl} className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" />
                 ))}
              </div>
            </div>
          </div>
          <button 
            onClick={generateFullReport}
            disabled={isGenerating}
            className="mt-8 w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Cpu size={16} />}
            Analisa Seluruh Keluarga (AI)
          </button>
        </div>
      </div>

      {report && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Cpu size={24} /></div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">AI Comprehensive Family Report</h3>
              </div>
              <button onClick={() => setReport(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={28} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide">
              {report.map((item, idx) => (
                <div key={idx} className="animate-fadeIn" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-4">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-md shrink-0">
                        <img src={item.member.photoUrl} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h4 className="font-black text-slate-800 text-lg leading-none mb-1">{item.member.name}</h4>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">{item.member.relation}</span>
                     </div>
                  </div>
                  <div className="grid gap-4">
                    {item.insights.map((ins: any, iIdx: number) => (
                      <div key={iIdx} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${ins.type === 'warning' ? 'bg-rose-500' : ins.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <div className="flex items-center gap-2 mb-2">
                           {ins.type === 'warning' ? <Shield className="text-rose-500" size={14} /> : ins.type === 'success' ? <Heart className="text-emerald-500" size={14} /> : <Zap className="text-amber-500" size={14} />}
                           <h5 className="font-black text-slate-800 text-xs uppercase tracking-tight">{ins.title}</h5>
                           <span className="ml-auto text-[7px] font-black px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 uppercase">{ins.source}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{ins.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
               <button onClick={() => setReport(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Selesai Membaca</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NoDataMessage = ({ text }: { text: string }) => (
  <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
     <Clock size={32} className="text-slate-200 mb-3" />
     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{text}</p>
  </div>
);

export default Dashboard;
