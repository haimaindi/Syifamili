
import React, { useState, useMemo } from 'react';
import { Heart, Activity, Thermometer, Droplet, Pill, Plus, CheckCircle, MessageSquare, X, Activity as Pulse, Clock, Stethoscope, Loader2 } from 'lucide-react';
import { FamilyMember, MedicalRecord, CaregiverNote, Language, VitalLog } from '../types';
import { useTranslation } from '../translations';

interface ElderlyViewProps {
  member: FamilyMember;
  records: MedicalRecord[];
  vitalLogs: VitalLog[];
  notes: CaregiverNote[];
  language: Language;
  onAddVital: (vital: VitalLog) => void;
  onAddNote: (note: CaregiverNote) => void;
  onAddRecord: (record: MedicalRecord) => void;
}

const ElderlyView: React.FC<ElderlyViewProps> = ({ member, records, vitalLogs, notes, language, onAddVital, onAddNote, onAddRecord }) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddVital, setShowAddVital] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const t = useTranslation(language);

  const latestVital = useMemo(() => {
    if (vitalLogs.length === 0) return null;
    return [...vitalLogs].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0];
  }, [vitalLogs]);

  const handleAddNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = new Date();
    const newNote: CaregiverNote = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      date: now.toLocaleDateString(language === 'ID' ? 'id-ID' : 'en-US'),
      dateTime: now.toISOString(),
      text: formData.get('text') as string,
      type: formData.get('type') as any
    };
    onAddNote(newNote);
    setShowAddNote(false);
  };

  const handleAddVital = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVital: VitalLog = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      dateTime: new Date().toISOString(),
      heartRate: parseFloat(formData.get('hr') as string) || undefined,
      systolic: parseFloat(formData.get('sys') as string) || undefined,
      diastolic: parseFloat(formData.get('dia') as string) || undefined,
      temperature: parseFloat(formData.get('temp') as string) || undefined,
      oxygen: parseFloat(formData.get('spo2') as string) || undefined,
    };
    onAddVital(newVital);
    setShowAddVital(false);
  };

  const handleAddPrescription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      title: formData.get('title') as string,
      dateTime: new Date().toISOString(),
      type: 'Prescription',
      description: formData.get('notes') as string,
      obat: formData.get('obat') as string,
      doctorName: formData.get('doctor') as string,
      facility: formData.get('facility') as string,
      files: []
    };
    onAddRecord(newRecord);
    setShowAddPrescription(false);
  };

  if (!member.isElderly) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Heart size={64} className="text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-800">{language === 'ID' ? 'Pindah ke Profil Lansia' : 'Switch to Elderly Profile'}</h3>
        <p className="text-slate-500 max-w-xs mt-2">
          {language === 'ID' ? 'Kelola perawatan khusus, catatan mobilitas, dan pemantauan kondisi kronis untuk lansia.' : 'Manage specialized care, mobility notes, and chronic condition monitoring for elderly family members.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">
        <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl shrink-0 ring-8 ring-slate-50">
          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-black text-slate-800 mb-2">{member.name}</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">{t.age}: {new Date().getFullYear() - new Date(member.birthDate).getFullYear()} {t.years}</span>
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">LANSIA</span>
          </div>
          <button 
            onClick={() => setShowAddVital(true)}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={16} /> {t.addVital}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <VitalCard 
          icon={Pulse} 
          label={language === 'ID' ? 'Detak Jantung' : 'Heart Rate'} 
          value={latestVital?.heartRate || '--'} 
          unit="bpm" 
          color="rose" 
          time={latestVital?.dateTime}
          language={language}
        />
        <VitalCard 
          icon={Activity} 
          label={language === 'ID' ? 'Tekanan Darah' : 'BP'} 
          value={latestVital?.systolic ? `${latestVital.systolic}/${latestVital.diastolic}` : '--'} 
          unit="mmHg" 
          color="blue" 
          time={latestVital?.dateTime}
          language={language}
        />
        <VitalCard 
          icon={Thermometer} 
          label={language === 'ID' ? 'Suhu' : 'Temp'} 
          value={latestVital?.temperature || '--'} 
          unit="°C" 
          color="amber" 
          time={latestVital?.dateTime}
          language={language}
        />
        <VitalCard 
          icon={Droplet} 
          label={language === 'ID' ? 'Oksigen (SpO2)' : 'Oxygen (SpO2)'} 
          value={latestVital?.oxygen || '--'} 
          unit="%" 
          color="indigo" 
          time={latestVital?.dateTime}
          language={language}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl"><Pill className="text-blue-600" size={20} /></div>
              {language === 'ID' ? 'Obat Kondisi Kronis' : 'Chronic Condition Meds'}
            </h3>
            <button 
              onClick={() => setShowAddPrescription(true)}
              className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-4">
            {records.filter(r => r.type === 'Prescription').length > 0 ? records.filter(r => r.type === 'Prescription').map(r => (
               <div key={r.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h5 className="font-bold text-slate-800">{r.title}</h5>
                  <p className="text-xs text-slate-500 mt-1">{r.obat || '-'}</p>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-4">{language === 'ID' ? 'Belum ada resep tercatat.' : 'No prescriptions logged.'}</p>
                <button 
                  onClick={() => setShowAddPrescription(true)}
                  className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
                >
                  {language === 'ID' ? 'Tambah Data Sekarang' : 'Add Data Now'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-lg font-black flex items-center gap-3">
              <MessageSquare size={20} className="text-blue-400" /> {t.caregiverJournal}
            </h3>
            <button 
              onClick={() => setShowAddNote(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4 text-sm relative z-10 max-h-96 overflow-y-auto scrollbar-hide">
            {notes.length > 0 ? [...notes].sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).map((note) => (
              <div key={note.id} className="p-5 border-l-4 border-blue-500 bg-white/5 rounded-r-2xl hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                      <Clock size={12} className="text-blue-400" />
                      <span className="text-[10px] font-black text-blue-400 block uppercase tracking-widest">
                        {new Date(note.dateTime).toLocaleString(language === 'ID' ? 'id-ID' : 'en-US')}
                      </span>
                   </div>
                   <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-slate-400">{note.type}</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic font-medium">"{note.text}"</p>
              </div>
            )) : (
              <div className="text-center py-8 opacity-40">
                <MessageSquare size={32} className="mx-auto mb-2" />
                <p className="text-xs">{language === 'ID' ? 'Belum ada catatan tercatat.' : 'No entries recorded yet.'}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowAddNote(true)}
            className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 uppercase text-xs tracking-widest"
          >
            {language === 'ID' ? 'Tambah Observasi Baru' : 'Add New Observation'}
          </button>
        </div>
      </div>

      {showAddVital && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-scaleIn my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">{t.addVital}</h3>
              <button onClick={() => setShowAddVital(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={32} /></button>
            </div>
            <form onSubmit={handleAddVital} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">Suhu (°C)</label>
                  <input name="temp" type="number" step="0.1" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">Systolic (Atas)</label>
                  <input name="sys" type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">Diastolic (Bawah)</label>
                  <input name="dia" type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">HR (bpm)</label>
                  <input name="hr" type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">SpO2 (%)</label>
                  <input name="spo2" type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-lg tracking-widest">{t.save}</button>
            </form>
          </div>
        </div>
      )}

      {showAddPrescription && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-scaleIn my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">{language === 'ID' ? 'Input Resep Lansia' : 'Add Elderly Prescription'}</h3>
              <button onClick={() => setShowAddPrescription(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={32} /></button>
            </div>
            <form onSubmit={handleAddPrescription} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Obat / Tujuan</label>
                <input name="title" required placeholder="Mis: Obat Hipertensi" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Detail Kandungan & Dosis</label>
                <input name="obat" required placeholder="Mis: Amlodipine 5mg" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Dokter Pemeriksa</label>
                  <input name="doctor" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Faskes</label>
                  <input name="facility" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Catatan Instruksi</label>
                <textarea name="notes" rows={2} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" placeholder="Mis: Diminum pagi hari sesudah makan"></textarea>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-100 tracking-widest">{t.save}</button>
            </form>
          </div>
        </div>
      )}

      {showAddNote && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-scaleIn my-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">{t.caregiverJournal}</h3>
                <button onClick={() => setShowAddNote(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 tracking-widest">{t.observationType}</label>
                  <select name="type" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
                    <option value="mobility">{language === 'ID' ? 'Mobilitas / Berjalan' : 'Mobility / Walking'}</option>
                    <option value="diet">{language === 'ID' ? 'Diet / Nutrisi' : 'Diet / Nutrition'}</option>
                    <option value="sleep">{language === 'ID' ? 'Kualitas Tidur' : 'Sleep Quality'}</option>
                    <option value="general">{language === 'ID' ? 'Suasana Hati / Lainnya' : 'General Mood/Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 tracking-widest">{t.observations}</label>
                  <textarea name="text" required rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" placeholder={language === 'ID' ? 'Masukkan detail...' : 'Enter details...'}></textarea>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all tracking-widest">{t.saveObservation}</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const VitalCard = ({ icon: Icon, label, value, unit, color, time, language }: any) => {
  const colors: any = {
    rose: "bg-rose-50 text-rose-500 border-rose-100",
    blue: "bg-blue-50 text-blue-500 border-blue-100",
    amber: "bg-amber-50 text-amber-500 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-500 border-indigo-100"
  };
  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} shadow-sm hover:shadow-md transition-all flex flex-col`}>
      <Icon className="mb-4" size={24} />
      <h4 className="text-slate-800 font-bold text-sm tracking-tight">{label}</h4>
      <div className="flex items-baseline gap-1 my-1">
        <p className="text-3xl font-black">{value}</p>
        <span className="text-xs font-medium opacity-60">{unit}</span>
      </div>
      <div className="mt-auto pt-2 flex flex-col gap-1">
        {time && (
          <div className="flex items-center gap-1 opacity-60 text-[8px] font-bold uppercase">
             <Clock size={8} /> {new Date(time).toLocaleTimeString(language === 'ID' ? 'id-ID' : 'en-US', {hour:'2-digit', minute:'2-digit'})}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${value === '--' ? 'bg-slate-300' : 'bg-green-500'}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{value === '--' ? 'N/A' : 'LATEST'}</span>
        </div>
      </div>
    </div>
  );
};

export default ElderlyView;
