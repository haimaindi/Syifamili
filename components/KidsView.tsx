
import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Baby, Plus, Info, CheckCircle, Shield, X, Cpu, Search, Calendar, RefreshCw, Clock, ChevronRight, Zap, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { FamilyMember, GrowthLog, HealthInsight, Language } from '../types';
import { VACCINATION_SCHEDULE_IDAI } from '../constants';
import { getHealthInsights, fetchLatestIdaiSchedule } from '../services/geminiService';
import { useTranslation } from '../translations';

interface KidsViewProps {
  member: FamilyMember;
  growthLogs: GrowthLog[];
  language: Language;
  onAddGrowthLog: (log: GrowthLog) => void;
}

const KidsView: React.FC<KidsViewProps> = ({ member, growthLogs, language, onAddGrowthLog }) => {
  const [showAddLog, setShowAddLog] = useState(false);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiIdaiSchedule, setAiIdaiSchedule] = useState<string | null>(null);
  const [loadingIdai, setLoadingIdai] = useState(false);
  const t = useTranslation(language);

  const calculateAgeMonths = useMemo(() => {
    const today = new Date();
    const bday = new Date(member.birthDate);
    return (today.getFullYear() - bday.getFullYear()) * 12 + (today.getMonth() - bday.getMonth());
  }, [member.birthDate]);

  const loadInsights = async () => {
    setLoadingInsights(true);
    const data = await getHealthInsights(member, language, growthLogs);
    setInsights(data);
    setLoadingInsights(false);
  };

  const handleFetchIdai = async () => {
    setLoadingIdai(true);
    const data = await fetchLatestIdaiSchedule(calculateAgeMonths, language);
    setAiIdaiSchedule(data ?? null);
    setLoadingIdai(false);
  };

  const handleAddLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLog: GrowthLog = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      dateTime: formData.get('dateTime') as string,
      weight: parseFloat(formData.get('weight') as string),
      height: parseFloat(formData.get('height') as string),
      headCircumference: parseFloat(formData.get('head') as string)
    };
    onAddGrowthLog(newLog);
    setShowAddLog(false);
  };

  if (!member.isChild) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
           <Baby size={48} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Ganti ke Profil Anak</h3>
        <p className="text-slate-400 max-w-xs mt-2 font-medium">Fitur tumbuh kembang dan imunisasi IDAI hanya tersedia untuk anggota keluarga kategori anak.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-blue-500 shadow-lg">
             <img src={member.photoUrl} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
              {t.growthTracking}: {member.name}
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{calculateAgeMonths} {t.months} • Standard IDAI 2024</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddLog(true)}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} /> {t.newMeasurement}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black mb-8 text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Zap size={18} /></div>
              Visualisasi Pertumbuhan (Berat & Tinggi)
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthLogs.sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dateTime" fontSize={9} tickMargin={10} stroke="#cbd5e1" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <YAxis fontSize={9} stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '15px' }}
                    labelStyle={{ fontWeight: 'black', marginBottom: '5px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={5} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} name="Berat (kg)" />
                  <Line type="monotone" dataKey="height" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} name="Tinggi (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu size={100} /></div>
            <h3 className="font-black text-lg mb-6 flex items-center gap-3 relative z-10">
              <div className="p-2 bg-blue-600 rounded-xl"><Shield size={18} /></div>
              {t.aiGrowthAnalysis}
            </h3>
            <div className="space-y-4 relative z-10">
              {insights.length > 0 ? (
                insights.map((insight, idx) => (
                  <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-tight">{insight.title}</h4>
                      <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-400 uppercase">{insight.source}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{insight.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p className="text-xs italic mb-6">Mulai analisa cerdas untuk melihat status gizi dan perkembangan anak.</p>
                  <button 
                    onClick={loadInsights}
                    disabled={loadingInsights}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                  >
                    {loadingInsights ? <RefreshCw className="animate-spin" size={16} /> : <Cpu size={16} />}
                    {t.generateAiAnalysis}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-fit">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={20} /></div>
                Jadwal Imunisasi
              </h3>
              <button 
                onClick={handleFetchIdai}
                disabled={loadingIdai}
                className={`p-2 rounded-xl transition-all ${loadingIdai ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:scale-105 active:scale-95'}`}
              >
                {loadingIdai ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              </button>
            </div>

            <div className="overflow-y-auto max-h-[500px] pr-2 scrollbar-hide space-y-4">
              {aiIdaiSchedule ? (
                 <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                       <Shield size={14} /> IDAI Official Guidelines 2024/2025
                    </div>
                    <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] text-sm leading-relaxed text-blue-900 shadow-inner relative overflow-hidden">
                       <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none rotate-12"><FileText size={150} /></div>
                       <div className="relative z-10 whitespace-pre-line prose prose-sm prose-blue font-medium">
                          {aiIdaiSchedule}
                       </div>
                       <div className="mt-8 pt-4 border-t border-blue-200/50 flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-blue-500" />
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Informasi ini diverifikasi AI sesuai standar IDAI</span>
                       </div>
                    </div>
                    <button onClick={() => setAiIdaiSchedule(null)} className="mt-6 w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Lihat Jadwal Standar</button>
                 </div>
              ) : (
                <>
                   <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-3xl mb-4">
                     <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><Sparkles size={16} className="text-indigo-600" /></div>
                        <div>
                           <h5 className="text-xs font-black text-indigo-900 uppercase tracking-tight mb-1">Rekomendasi Cerdas</h5>
                           <p className="text-[10px] text-indigo-700 font-medium leading-relaxed italic">Klik ikon bintang di atas untuk menarik data jadwal imunisasi terkini (IDAI 2024) sesuai usia si kecil.</p>
                        </div>
                     </div>
                   </div>
                   {VACCINATION_SCHEDULE_IDAI.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-5 rounded-3xl border border-slate-50 bg-white hover:bg-slate-50 transition-all group">
                      <div className="w-14 h-14 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                        <span className="text-[7px] font-black uppercase tracking-tighter opacity-60">Usia</span>
                        <span className="text-xs font-black">{item.age}</span>
                      </div>
                      <div className="flex-1 space-y-2 py-1">
                        {item.vaccines.map((v, vIdx) => (
                          <div key={vIdx} className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 leading-tight">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddLog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-md shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.newMeasurement}</h3>
              <button onClick={() => setShowAddLog(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={32} /></button>
            </div>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Waktu Catat</label>
                <input name="dateTime" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Berat (kg)</label><input name="weight" type="number" step="0.1" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="0.0" /></div>
                 <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Tinggi (cm)</label><input name="height" type="number" step="0.1" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="0.0" /></div>
              </div>
              <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Lingkar Kepala (cm)</label><input name="head" type="number" step="0.1" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Opsional" /></div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 mt-4">SIMPAN DATA UKUR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidsView;
