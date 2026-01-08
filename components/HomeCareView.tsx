
import React, { useState, useRef } from 'react';
import { Home, Plus, Activity, Thermometer, Clock, X, Trash2, CheckCircle2, Heart, Droplet, Upload, Loader2, FileText, Eye, Paperclip, Edit2, Info, ExternalLink } from 'lucide-react';
import { FamilyMember, HomeCareLog, Language, FileAttachment, HomeCareEntry } from '../types';
import { useTranslation } from '../translations';
import { spreadsheetService } from '../services/spreadsheetService';

interface HomeCareViewProps {
  member: FamilyMember;
  homeCareLogs: HomeCareLog[];
  language: Language;
  onAddLog: (log: HomeCareLog) => void;
  onUpdateLog: (log: HomeCareLog) => void;
}

const HomeCareView: React.FC<HomeCareViewProps> = ({ member, homeCareLogs, language, onAddLog, onUpdateLog }) => {
  const [showAddLog, setShowAddLog] = useState(false);
  const [activeLog, setActiveLog] = useState<HomeCareLog | null>(null);
  
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HomeCareEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<HomeCareEntry | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [existingFiles, setExistingFiles] = useState<FileAttachment[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = useTranslation(language);

  const handleCreateLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLog: HomeCareLog = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      title: formData.get('title') as string,
      entries: [],
      active: true
    };
    onAddLog(newLog);
    setShowAddLog(false);
  };

  const handleOpenEntryForm = (entry?: HomeCareEntry) => {
    setEditingEntry(entry || null);
    setExistingFiles(entry?.files || []);
    setNewFiles([]);
    setShowEntryForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setNewFiles(prev => [...prev, ...filesArray]);
    }
    if (e.target) e.target.value = '';
  };

  const removeNewFile = (idx: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingFile = (idx: number) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeLog) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      const uploaded: FileAttachment[] = [];
      for (const file of newFiles) {
        const result = await spreadsheetService.uploadFile(file);
        if (result && result.url) {
          uploaded.push({ url: result.url, name: file.name });
        }
      }

      const finalFiles = [...existingFiles, ...uploaded];
      const entryData: HomeCareEntry = {
        id: editingEntry?.id || Math.random().toString(36).substr(2, 5),
        dateTime: editingEntry?.dateTime || new Date().toISOString(),
        symptom: formData.get('symptom') as string,
        temperature: parseFloat(formData.get('temp') as string) || undefined,
        systolic: parseFloat(formData.get('sys') as string) || undefined,
        diastolic: parseFloat(formData.get('dia') as string) || undefined,
        heartRate: parseFloat(formData.get('hr') as string) || undefined,
        oxygen: parseFloat(formData.get('spo2') as string) || undefined,
        note: formData.get('note') as string,
        files: finalFiles
      };

      let updatedEntries;
      if (editingEntry) {
        updatedEntries = activeLog.entries.map(en => en.id === editingEntry.id ? entryData : en);
      } else {
        updatedEntries = [...activeLog.entries, entryData];
      }

      const updatedLog = { ...activeLog, entries: updatedEntries };
      onUpdateLog(updatedLog);
      setActiveLog(updatedLog);
      setShowEntryForm(false);
    } catch (err) {
      console.error("Save Entry failed", err);
      alert("Error mengunggah berkas atau menyimpan entri.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!activeLog) return;
    if (!confirm(language === 'ID' ? 'Hapus entri ini?' : 'Delete this entry?')) return;
    const updatedEntries = activeLog.entries.filter(en => en.id !== entryId);
    const updatedLog = { ...activeLog, entries: updatedEntries };
    onUpdateLog(updatedLog);
    setActiveLog(updatedLog);
  };

  const handleCloseCare = (log: HomeCareLog) => {
    if (!confirm(language === 'ID' ? 'Selesaikan sesi perawatan ini?' : 'Close this session?')) return;
    onUpdateLog({ ...log, active: false });
    if (activeLog?.id === log.id) setActiveLog(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.homeCare}</h2>
          <p className="text-slate-500 font-medium">Dokumentasikan penanganan gejala di rumah secara detail</p>
        </div>
        <button 
          onClick={() => setShowAddLog(true)} 
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} className="inline-block mr-2" /> {t.newHomeCare}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Sesi Aktif</h3>
          {homeCareLogs.filter(l => l.active).map(log => (
            <div key={log.id} onClick={() => setActiveLog(log)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${activeLog?.id === log.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${activeLog?.id === log.id ? 'bg-white/10' : 'bg-blue-50 text-blue-600'}`}><Activity size={20} /></div>
                <button onClick={(e) => { e.stopPropagation(); handleCloseCare(log); }} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all ${activeLog?.id === log.id ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>Selesaikan</button>
              </div>
              <h4 className="font-black text-lg mb-1 leading-tight">{log.title}</h4>
              <p className={`text-xs font-bold uppercase tracking-widest ${activeLog?.id === log.id ? 'opacity-80' : 'text-slate-400'}`}>{log.entries.length} entri tercatat</p>
            </div>
          ))}
          
          {homeCareLogs.filter(l => !l.active).length > 0 && (
            <>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mt-8">Riwayat</h3>
              <div className="space-y-3">
                 {homeCareLogs.filter(l => !l.active).map(log => (
                   <div key={log.id} onClick={() => setActiveLog(log)} className={`p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${activeLog?.id === log.id ? 'ring-2 ring-blue-600' : ''}`}>
                      <span className="font-bold text-slate-700 text-sm">{log.title}</span>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                   </div>
                 ))}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2">
          {activeLog ? (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm min-h-[500px]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                 <div>
                   <h3 className="text-2xl font-black text-slate-800">{activeLog.title}</h3>
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Detail Riwayat Perawatan</span>
                 </div>
                 {activeLog.active && (
                   <button onClick={() => handleOpenEntryForm()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"><Plus size={16} /> Entri Baru</button>
                 )}
              </div>

              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                {activeLog.entries.sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).map((entry) => (
                  <div key={entry.id} className="relative pl-12 group">
                     <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-slate-400 shadow-sm"><Clock size={16} /></div>
                     <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group-hover:bg-white group-hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{new Date(entry.dateTime).toLocaleString()}</span>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setViewEntry(entry)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Eye size={18} /></button>
                              {activeLog.active && (
                                <>
                                  <button onClick={() => handleOpenEntryForm(entry)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                  <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                </>
                              )}
                           </div>
                        </div>
                        <h5 className="font-black text-slate-800 mb-2 leading-tight text-lg">{entry.symptom}</h5>
                        <p className="text-xs text-slate-500 italic mb-4 font-medium leading-relaxed">"{entry.note}"</p>
                        <div className="flex flex-wrap gap-2">
                           {entry.temperature && <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-700 flex items-center gap-2"><Thermometer size={12} className="text-amber-500"/>{entry.temperature}°C</div>}
                           {entry.files && entry.files.length > 0 && <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-[10px] font-bold text-blue-600 flex items-center gap-2"><Paperclip size={12}/> {entry.files.length} Lampiran</div>}
                        </div>
                     </div>
                  </div>
                ))}
                {activeLog.entries.length === 0 && (
                  <div className="text-center py-20 opacity-30 flex flex-col items-center">
                    <Activity size={64} className="mb-4" />
                    <p className="font-black uppercase text-xs tracking-widest">Belum ada entri tercatat</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-[3rem] h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center border-2 border-dashed border-slate-200">
              <Home size={64} className="mb-6 opacity-20" />
              <p className="font-black text-lg uppercase tracking-widest">Pilih sesi perawatan untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      {showAddLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sesi Perawatan Baru</h3>
              <button onClick={() => setShowAddLog(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={32} /></button>
            </div>
            <form onSubmit={handleCreateLog} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul / Keluhan Utama</label>
                <input name="title" required placeholder="Mis: Demam Anak Jan 2025" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-100 tracking-widest transition-all active:scale-95">Mulai Pemantauan</button>
            </form>
          </div>
        </div>
      )}

      {showEntryForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingEntry ? 'Ubah Entri' : 'Entri Log Baru'}</h3>
              <button onClick={() => setShowEntryForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={32} /></button>
            </div>
            <form onSubmit={handleSaveEntry} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Gejala Utama / Keluhan</label>
                <input name="symptom" defaultValue={editingEntry?.symptom} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm" placeholder="Mis: Demam Tinggi, Batuk" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Suhu (°C)</label><input name="temp" type="number" step="0.1" defaultValue={editingEntry?.temperature} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold shadow-sm" placeholder="37.5" /></div>
                 <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">SpO2 (%)</label><input name="spo2" type="number" defaultValue={editingEntry?.oxygen} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold shadow-sm" placeholder="98" /></div>
                 <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">HR (bpm)</label><input name="hr" type="number" defaultValue={editingEntry?.heartRate} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold shadow-sm" placeholder="80" /></div>
                 <div><label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Tekanan Sistolik</label><input name="sys" type="number" defaultValue={editingEntry?.systolic} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold shadow-sm" placeholder="120" /></div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Catatan & Tindakan</label>
                <textarea name="note" defaultValue={editingEntry?.note} required rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium shadow-sm" placeholder="Tindakan yang diambil, dosis obat, dll..."></textarea>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lampiran (Preview Instan)</label>
                <div className="flex flex-wrap gap-3">
                  {existingFiles.map((f, i) => (
                    <div key={`ex-${i}`} className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center relative group overflow-hidden shadow-sm">
                      {f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? <img src={f.url} className="w-full h-full object-cover"/> : <Paperclip size={20} className="text-slate-300" />}
                      <button type="button" onClick={() => removeExistingFile(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} strokeWidth={4}/></button>
                    </div>
                  ))}
                  {newFiles.map((f, i) => (
                    <div key={`new-${i}`} className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center relative group overflow-hidden shadow-sm">
                      {f.type.startsWith('image/') ? <img src={URL.createObjectURL(f)} className="w-full h-full object-cover"/> : <Upload size={20} className="text-blue-400" />}
                      <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} strokeWidth={4}/></button>
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-[6px] text-white font-black text-center py-0.5 uppercase tracking-tighter">BARU</div>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all">
                    <Plus size={24} />
                    <span className="text-[6px] font-black uppercase mt-0.5">Add</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileSelect} accept="image/*" />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowEntryForm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 tracking-widest transition-all active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Entri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewEntry && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
           <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-scaleIn">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{new Date(viewEntry.dateTime).toLocaleString()}</span>
                   <h3 className="text-2xl font-black text-slate-800 leading-tight">{viewEntry.symptom}</h3>
                </div>
                <button onClick={() => setViewEntry(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Suhu" value={viewEntry.temperature ? `${viewEntry.temperature}°C` : '-'} icon={Thermometer} />
                    <DetailItem label="Detak Jantung" value={viewEntry.heartRate ? `${viewEntry.heartRate} bpm` : '-'} icon={Heart} />
                    <DetailItem label="Oksigen (SpO2)" value={viewEntry.oxygen ? `${viewEntry.oxygen}%` : '-'} icon={Droplet} />
                    <DetailItem label="BP Sistolik" value={viewEntry.systolic ? `${viewEntry.systolic}` : '-'} icon={Activity} />
                 </div>
                 <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Observasi & Tindakan</h5>
                    <p className="text-sm text-slate-700 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 italic leading-relaxed shadow-inner">"{viewEntry.note}"</p>
                 </div>
                 {viewEntry.files && viewEntry.files.length > 0 && (
                   <div>
                     <h5 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Dokumentasi Foto</h5>
                     <div className="flex flex-wrap gap-3">
                        {viewEntry.files.map((f, i) => (
                          <div key={i} onClick={() => window.open(f.url, '_blank', 'noopener,noreferrer')} className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 transition-all shadow-sm relative group">
                             {f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? <img src={f.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><FileText size={24}/></div>}
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ExternalLink className="text-white" size={14} />
                             </div>
                          </div>
                        ))}
                     </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, icon: Icon }: any) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={12} className="text-slate-400" />
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-800">{value}</span>
  </div>
);

export default HomeCareView;
