
import React, { useState, useRef, useMemo } from 'react';
import { Pill, Plus, Clock, Check, Trash2, Upload, Loader2, X, Eye, Edit2, Search, Calendar, Image as ImageIcon, ExternalLink, Info, ClipboardList } from 'lucide-react';
import { FamilyMember, Medication, Language } from '../types';
import { spreadsheetService } from '../services/spreadsheetService';
import { useTranslation } from '../translations';

interface MedicationViewProps {
  member: FamilyMember;
  meds: Medication[];
  language: Language;
  onAddMed: (med: Medication) => void;
  onUpdateMed: (med: Medication) => void;
  onDeleteMed: (id: string) => void;
}

const MedicationView: React.FC<MedicationViewProps> = ({ member, meds, language, onAddMed, onUpdateMed, onDeleteMed }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [viewingMed, setViewingMed] = useState<Medication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [nextTimeBuffer, setNextTimeBuffer] = useState<string>('');
  
  const t = useTranslation(language);

  const handleOpenForm = (med?: Medication) => {
    setEditingMed(med || null);
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    let fileUrl = editingMed?.fileUrl || '';
    let fileName = editingMed?.fileName || '';

    if (selectedFile) {
      try {
        const result = await spreadsheetService.uploadFile(selectedFile);
        if (result && result.url) {
          fileUrl = result.url;
          fileName = selectedFile.name;
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    const medData: Medication = {
      id: editingMed?.id || Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      name: formData.get('name') as string,
      dosage: formData.get('dosage') as string,
      frequency: formData.get('frequency') as string,
      instructions: formData.get('instructions') as string,
      nextTime: formData.get('time') as string,
      active: true,
      fileUrl,
      fileName
    };

    if (editingMed) onUpdateMed(medData);
    else onAddMed(medData);
    
    setIsSaving(false);
    setShowForm(false);
  };

  const startScheduling = (med: Medication) => {
    setSchedulingId(med.id);
    setNextTimeBuffer(med.nextTime || new Date().toISOString().slice(0, 16));
  };

  const handleManualScheduleUpdate = (med: Medication) => {
    if (!nextTimeBuffer) return;
    onUpdateMed({ ...med, nextTime: nextTimeBuffer });
    setSchedulingId(null);
  };

  const filteredMeds = useMemo(() => {
    return meds.filter(med => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      med.instructions.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meds, searchTerm]);

  const formatDisplayTime = (isoString: string) => {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString(language === 'ID' ? 'id-ID' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) { return isoString; }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-4 border-amber-500 shadow-xl">
             <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">{t.medTracker}: {member.name}</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Digital Prescription Manager</p>
          </div>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-100 flex items-center gap-2">
          <Plus size={18} /> {t.addMed}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder={language === 'ID' ? 'Cari nama obat...' : 'Search meds...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-amber-50 font-medium transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMeds.map(med => (
          <div key={med.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:border-amber-200 transition-all overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 duration-300">
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[1.2rem] flex items-center justify-center border border-amber-100 overflow-hidden shadow-inner cursor-pointer" onClick={() => setViewingMed(med)}>
                   {med.fileUrl ? <img src={med.fileUrl} className="w-full h-full object-cover" /> : <Pill size={24} />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setViewingMed(med)} className="p-3 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Eye size={18} /></button>
                  <button onClick={() => handleOpenForm(med)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                  <button onClick={() => { if(confirm(language === 'ID' ? 'Hapus data obat?' : 'Delete medication?')) onDeleteMed(med.id); }} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <h4 className="text-xl font-black text-slate-800 mb-1 leading-tight group-hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setViewingMed(med)}>{med.name}</h4>
              <p className="text-xs text-slate-400 mb-4 font-black uppercase tracking-widest">{med.dosage} • {med.frequency}</p>
              
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 mt-auto border border-slate-100 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  <span>Jadwal Berikutnya</span>
                  <Clock size={12} />
                </div>
                {schedulingId === med.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="datetime-local" 
                      value={nextTimeBuffer} 
                      onChange={(e) => setNextTimeBuffer(e.target.value)} 
                      className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" 
                    />
                    <button onClick={() => handleManualScheduleUpdate(med)} className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg"><Check size={14} strokeWidth={4} /></button>
                  </div>
                ) : (
                  <p className="text-sm font-black text-slate-800">
                    {formatDisplayTime(med.nextTime)}
                  </p>
                )}
              </div>

              <button onClick={() => startScheduling(med)} className="w-full py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-100 active:scale-95 transition-all">
                Update Jadwal Minum
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingMed ? 'Ubah Data Obat' : 'Tambah Obat Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex justify-center mb-6">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-28 h-28 rounded-[2rem] overflow-hidden bg-slate-50 border-4 border-slate-100 shadow-xl group-hover:border-amber-400 transition-all flex items-center justify-center">
                     {selectedFile ? (
                       <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" />
                     ) : editingMed?.fileUrl ? (
                       <img src={editingMed.fileUrl} className="w-full h-full object-cover" />
                     ) : (
                       <div className="flex flex-col items-center text-slate-300">
                         <ImageIcon size={24} />
                         <span className="text-[8px] font-black uppercase mt-2">Foto Kemasan</span>
                       </div>
                     )}
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Obat</label>
                <input name="name" defaultValue={editingMed?.name} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Dosis</label>
                  <input name="dosage" defaultValue={editingMed?.dosage} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" placeholder="1 Tablet" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Frekuensi</label>
                  <input name="frequency" defaultValue={editingMed?.frequency} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" placeholder="3x1 Hari" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Waktu Jadwal Pertama</label>
                <input name="time" type="datetime-local" defaultValue={editingMed?.nextTime || new Date().toISOString().slice(0, 16)} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Instruksi Penggunaan</label>
                <input name="instructions" defaultValue={editingMed?.instructions} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" placeholder="Mis: Sesudah makan" />
              </div>
              
              <button type="submit" disabled={isSaving} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 tracking-widest mt-4">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'SIMPAN DATA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingMed && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
           <div className="bg-white rounded-[3rem] w-full max-w-xs p-8 shadow-2xl animate-scaleIn relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-amber-600"></div>
              <button onClick={() => setViewingMed(null)} className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full z-10"><X size={20} /></button>
              
              <div className="relative pt-6 space-y-6 flex flex-col items-center">
                 <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50">
                    {viewingMed.fileUrl ? (
                      <img src={viewingMed.fileUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-200">
                        <Pill size={48} />
                      </div>
                    )}
                 </div>
                 
                 <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1">{viewingMed.name}</h3>
                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">{viewingMed.frequency}</span>
                 </div>

                 <div className="w-full space-y-3">
                    <DetailBox icon={Info} label="Dosis & Aturan" value={viewingMed.dosage} />
                    <DetailBox icon={ClipboardList} label="Instruksi" value={viewingMed.instructions || '-'} />
                    <DetailBox icon={Clock} label="Jadwal" value={formatDisplayTime(viewingMed.nextTime)} />
                 </div>

                 {viewingMed.fileUrl && (
                   <div className="pt-2 w-full">
                      <button onClick={() => window.open(viewingMed.fileUrl, '_blank', 'noopener,noreferrer')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl">
                         <ExternalLink size={14} /> Buka Foto
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DetailBox = ({ icon: Icon, label, value }: any) => (
  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
    <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500 border border-amber-50"><Icon size={16} /></div>
    <div>
       <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
       <p className="text-xs font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default MedicationView;
