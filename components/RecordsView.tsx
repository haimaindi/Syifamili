
import React, { useState, useRef, useMemo } from 'react';
import { FileText, Plus, Search, Trash2, Eye, Cpu, X, Upload, Loader2, Edit2, Clock, MapPin, Activity, Thermometer, Droplet, Stethoscope, Pill, Hospital, ExternalLink, Sparkles, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { FamilyMember, MedicalRecord, Language, FileAttachment } from '../types';
import { analyzeMedicalRecord } from '../services/geminiService';
import { spreadsheetService } from '../services/spreadsheetService';
import { useTranslation } from '../translations';

interface RecordsViewProps {
  member: FamilyMember;
  records: MedicalRecord[];
  language: Language;
  onAddRecord: (record: MedicalRecord) => void;
  onUpdateRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  initialOpenId?: string | null;
}

const RecordsView: React.FC<RecordsViewProps> = ({ member, records, language, onAddRecord, onUpdateRecord, onDeleteRecord, initialOpenId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslation(language);
  const [isSaving, setIsSaving] = useState(false);
  
  const [existingFiles, setExistingFiles] = useState<FileAttachment[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialOpenId) {
      const target = records.find(r => r.id === initialOpenId);
      if (target) setViewRecord(target);
    }
  }, [initialOpenId, records]);

  const handleOpenForm = (record?: MedicalRecord) => {
    setEditingRecord(record || null);
    setExistingFiles(record?.files || []);
    setNewFiles([]);
    setShowForm(true);
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      const uploaded: FileAttachment[] = [];
      for (const file of newFiles) {
        const result = await spreadsheetService.uploadFile(file);
        if (result?.url) uploaded.push({ url: result.url, name: file.name });
      }
      const finalFiles = [...existingFiles, ...uploaded];
      const recordData: MedicalRecord = {
        id: editingRecord?.id || Math.random().toString(36).substr(2, 9),
        memberId: member.id,
        title: formData.get('title') as string,
        dateTime: formData.get('dateTime') as string,
        type: formData.get('type') as any,
        description: formData.get('description') as string,
        diagnosis: formData.get('diagnosis') as string,
        saran: formData.get('saran') as string,
        obat: formData.get('obat') as string,
        doctorName: formData.get('doctorName') as string,
        facility: formData.get('facility') as string,
        files: finalFiles,
        temperature: parseFloat(formData.get('temperature') as string) || undefined,
        systolic: parseFloat(formData.get('systolic') as string) || undefined,
        diastolic: parseFloat(formData.get('diastolic') as string) || undefined,
        heartRate: parseFloat(formData.get('heartRate') as string) || undefined,
        oxygen: parseFloat(formData.get('oxygen') as string) || undefined,
      };
      if (editingRecord) onUpdateRecord(recordData);
      else onAddRecord(recordData);
      setShowForm(false);
    } catch (err) {
      alert("Gagal menyimpan rekam medis.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [records, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-blue-500 shadow-xl">
             <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">{t.records}: {member.name}</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Medical Archival System</p>
          </div>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2">
          <Plus size={18} /> {t.newRecord}
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Cari keluhan atau dokter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none font-medium focus:ring-4 focus:ring-blue-50 transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5">Tgl & Judul</th>
                <th className="px-8 py-5">Diagnosis</th>
                <th className="px-8 py-5">Lokasi / Dokter</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-7">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-0.5">{new Date(record.dateTime).toLocaleDateString()}</p>
                      <p className="font-black text-slate-800 text-base">{record.title}</p>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">{record.diagnosis || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">{record.facility || '-'}</p>
                      <p className="text-[10px] font-medium text-slate-400 italic">dr. {record.doctorName || '-'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewRecord(record)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl transition-all"><Eye size={20} /></button>
                      <button onClick={() => handleOpenForm(record)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => { if(confirm('Hapus rekam medis?')) onDeleteRecord(record.id); }} className="p-3 text-slate-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-2xl shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{editingRecord ? 'Ubah Rekam Medis' : 'Input Rekam Medis Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Judul Catatan / Keluhan Utama</label>
                  <input name="title" defaultValue={editingRecord?.title} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Mis: Konsultasi Rutin, Sakit Kepala" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Waktu & Tanggal</label>
                  <input name="dateTime" type="datetime-local" defaultValue={editingRecord?.dateTime || new Date().toISOString().slice(0, 16)} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tipe Rekam Medis</label>
                  <select name="type" defaultValue={editingRecord?.type || 'Consultation'} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold appearance-none">
                    <option value="Consultation">Konsultasi</option><option value="Lab">Hasil Laboratorium</option>
                    <option value="Imaging">Radiologi (X-Ray/MRI)</option><option value="Vaccination">Vaksinasi</option>
                    <option value="Prescription">Resep Obat</option><option value="Clinical Photo">Foto Klinis</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>

                <div className="md:col-span-2 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest"><Activity size={14} /> Tanda Vital (TTV)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <VitalsInput label="Suhu (°C)" name="temperature" defaultValue={editingRecord?.temperature} />
                    <VitalsInput label="Sys (mmHg)" name="systolic" defaultValue={editingRecord?.systolic} />
                    <VitalsInput label="Dia (mmHg)" name="diastolic" defaultValue={editingRecord?.diastolic} />
                    <VitalsInput label="HR (bpm)" name="heartRate" defaultValue={editingRecord?.heartRate} />
                    <VitalsInput label="SpO2 (%)" name="oxygen" defaultValue={editingRecord?.oxygen} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Diagnosis</label>
                  <input name="diagnosis" defaultValue={editingRecord?.diagnosis} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-blue-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Fasilitas Kesehatan</label>
                  <input name="facility" defaultValue={editingRecord?.facility} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="RS / Klinik" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nama Dokter</label>
                  <input name="doctorName" defaultValue={editingRecord?.doctorName} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Daftar Obat</label>
                  <input name="obat" defaultValue={editingRecord?.obat} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Saran & Instruksi</label>
                  <textarea name="saran" defaultValue={editingRecord?.saran} rows={2} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium"></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Lampiran Berkas</label>
                  <div className="flex flex-wrap gap-3">
                    {existingFiles.map((f, i) => (
                      <div key={`ex-${i}`} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                        {f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? <img src={f.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FileText size={24} className="text-slate-300" /></div>}
                        <button type="button" onClick={() => removeExistingFile(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X size={10} strokeWidth={4} /></button>
                      </div>
                    ))}
                    {newFiles.map((f, i) => (
                      <div key={`new-${i}`} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-400 bg-blue-50 group">
                        {f.type.startsWith('image/') ? <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FileText size={24} className="text-blue-300" /></div>}
                        <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X size={10} strokeWidth={4} /></button>
                        <div className="absolute bottom-1 left-1 bg-blue-600 text-[6px] text-white px-1 rounded uppercase font-black">BARU</div>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all">
                      <Plus size={24} /><span className="text-[8px] font-black uppercase mt-1">Tambah</span>
                    </button>
                    <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileSelect} accept="image/*,.pdf" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewRecord && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/40 shrink-0">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100"><FileText size={28} /></div>
                 <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase mb-0.5 block tracking-widest">{viewRecord.type}</span>
                    <h3 className="text-xl font-black text-slate-800 leading-none">{viewRecord.title}</h3>
                 </div>
              </div>
              <button onClick={() => setViewRecord(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={28} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <DetailBadge icon={Thermometer} label="Suhu" value={viewRecord.temperature ? `${viewRecord.temperature}°C` : '--'} color="amber" />
                <DetailBadge icon={Activity} label="BP" value={viewRecord.systolic ? `${viewRecord.systolic}/${viewRecord.diastolic}` : '--'} color="blue" />
                <DetailBadge icon={Activity} label="Detak" value={viewRecord.heartRate || '--'} color="rose" />
                <DetailBadge icon={Droplet} label="SpO2" value={viewRecord.oxygen ? `${viewRecord.oxygen}%` : '--'} color="emerald" />
              </div>

              <div className="space-y-4">
                 <DetailSection icon={Stethoscope} title="Diagnosis Utama" content={viewRecord.diagnosis} highlight />
                 <DetailSection icon={Hospital} title="Fasilitas & Dokter" content={`${viewRecord.facility || '-'} (dr. ${viewRecord.doctorName || '-'})`} />
                 <DetailSection icon={Pill} title="Rencana Pengobatan" content={viewRecord.obat} />
                 <DetailSection icon={ClipboardList} title="Instruksi & Saran" content={viewRecord.saran} />
              </div>

              {viewRecord.files && viewRecord.files.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dokumentasi Medis</h4>
                  <div className="flex flex-wrap gap-3">
                    {viewRecord.files.map((f, i) => (
                      <div key={i} onClick={() => window.open(f.url, '_blank')} className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 transition-all shadow-sm relative group bg-slate-50 flex items-center justify-center">
                        {f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? <img src={f.url} className="w-full h-full object-cover" /> : <div className="text-slate-300"><FileText size={20}/><span className="text-[7px] font-black mt-1 uppercase block text-center">FILE</span></div>}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <ExternalLink className="text-white" size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 pb-2">
                <button 
                  onClick={() => { 
                    setAnalyzingId(viewRecord.id); 
                    analyzeMedicalRecord(`Record: ${viewRecord.title}, Diagnosis: ${viewRecord.diagnosis}, Vitals: ${viewRecord.temperature}°C, ${viewRecord.systolic}/${viewRecord.diastolic} mmHg`, language)
                    .then(a => { 
                      setAiAnalysis(p => ({...p, [viewRecord.id]: a})); 
                      setAnalyzingId(null); 
                    }); 
                  }} 
                  disabled={analyzingId === viewRecord.id} 
                  className="w-full py-5 bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {analyzingId === viewRecord.id ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-amber-400" />}
                  Analisa Insight AI
                </button>
                {aiAnalysis[viewRecord.id] && (
                  <div className="mt-8 space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      <Sparkles size={14} /> AI Clinical Summary
                    </div>
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-[2.5rem] p-8 text-indigo-900 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Cpu size={100} /></div>
                       <div className="relative z-10 whitespace-pre-line text-sm leading-relaxed font-medium">
                          {aiAnalysis[viewRecord.id]}
                       </div>
                       <div className="mt-6 pt-4 border-t border-indigo-100/50 flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Hasil Analisa Diverifikasi Sistem
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
               <button onClick={() => setViewRecord(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VitalsInput = ({ label, name, defaultValue }: any) => (
  <div className="flex flex-col items-center">
    <label className="block text-[7px] font-black text-slate-400 mb-1 uppercase text-center tracking-tighter">{label}</label>
    <input name={name} type="number" step="0.1" defaultValue={defaultValue} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-center text-xs outline-none focus:ring-2 focus:ring-blue-100" />
  </div>
);

const DetailBadge = ({ icon: Icon, label, value, color }: any) => {
  const colors: any = { amber: "bg-amber-50 text-amber-600 border-amber-100", blue: "bg-blue-50 text-blue-600 border-blue-100", rose: "bg-rose-50 text-rose-600 border-rose-100", emerald: "bg-emerald-50 text-emerald-600 border-emerald-100" };
  return (
    <div className={`p-4 rounded-3xl ${colors[color]} border shadow-sm text-center flex flex-col items-center flex-1`}>
      <Icon size={12} className="mb-1" />
      <span className="text-[7px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</span>
      <span className="text-xs font-black truncate w-full">{value}</span>
    </div>
  );
};

const DetailSection = ({ icon: Icon, title, content, highlight }: any) => (
  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-start gap-4 hover:bg-white hover:shadow-md transition-all group">
    <div className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 shadow-sm group-hover:text-blue-600 transition-colors"><Icon size={20} /></div>
    <div className="flex-1 min-w-0">
      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h5>
      <p className={`text-sm leading-relaxed break-words ${highlight ? 'font-black text-blue-600 text-base' : 'font-bold text-slate-700'}`}>{content || '-'}</p>
    </div>
  </div>
);

const ClipboardList = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
  </svg>
);

export default RecordsView;
