
import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, Search, Calendar, FileText, Eye, LayoutGrid, List, X, Stethoscope, Pill, CheckCircle2, Home, FileSearch, ExternalLink } from 'lucide-react';
import { FamilyMember, MedicalRecord, Medication, HomeCareLog } from '../types';

interface MediaVaultProps {
  member: FamilyMember;
  records: MedicalRecord[];
  meds: Medication[];
  homeCareLogs: HomeCareLog[];
}

const MediaVault: React.FC<MediaVaultProps> = ({ member, records, meds, homeCareLogs }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const allMedia = useMemo(() => {
    const mediaStream: any[] = [];
    
    records.forEach(r => {
      const rFiles = Array.isArray(r.files) ? r.files : [];
      rFiles.forEach((file, idx) => {
        mediaStream.push({
          id: `rec-${r.id}-${idx}`,
          parentId: r.id,
          title: r.title,
          date: r.dateTime,
          url: file.url,
          fileName: file.name,
          type: 'medical_record',
          category: 'Rekam Medis',
          subCategory: r.type,
          diagnosis: r.diagnosis,
          doctor: r.doctorName,
          subCount: rFiles.length,
          currentIdx: idx + 1
        });
      });
    });

    meds.filter(m => m.fileUrl).forEach(m => {
      mediaStream.push({
        id: `med-${m.id}`,
        title: m.name,
        date: 'Treatment Photo',
        url: m.fileUrl,
        fileName: m.fileName,
        type: 'medication',
        category: 'Obat',
        subCategory: 'Medication',
        dosage: m.dosage,
        instructions: m.instructions
      });
    });

    homeCareLogs.forEach(log => {
      if (Array.isArray(log.entries)) {
        log.entries.forEach(entry => {
          if (Array.isArray(entry.files)) {
            entry.files.forEach((file, fIdx) => {
              mediaStream.push({
                id: `hc-${entry.id}-${fIdx}`,
                parentId: log.id,
                title: `${log.title}: ${entry.symptom}`,
                date: entry.dateTime,
                url: file.url,
                fileName: file.name,
                type: 'home_care',
                category: 'Log Perawatan',
                subCategory: 'Home Care Observation',
                note: entry.note,
                subCount: entry.files?.length || 1,
                currentIdx: fIdx + 1
              });
            });
          }
        });
      }
    });
    
    return mediaStream.sort((a, b) => {
      if (a.date === 'Treatment Photo') return -1;
      if (b.date === 'Treatment Photo') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [records, meds, homeCareLogs]);

  const filterCategories = [
    { id: 'all', label: 'Semua' },
    { id: 'home_care', label: 'Log Perawatan' },
    { id: 'medical_record', label: 'Rekam Medis' },
    { id: 'medication', label: 'Obat' }
  ];

  const filteredMedia = allMedia.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.fileName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Health Media Vault</h2>
          <p className="text-slate-500 font-medium italic">Sentralisasi arsip visual medis {member.name}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari berkas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium" 
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><List size={20} /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2 scrollbar-hide">
        {filterCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
              filterType === cat.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredMedia.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredMedia.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : 'flex flex-col'}`}
            >
              <div className={`relative overflow-hidden bg-slate-100 ${viewMode === 'grid' ? 'h-52 w-full' : 'h-24 w-24 rounded-2xl shrink-0'}`}>
                {item.url && item.fileName?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <FileText size={viewMode === 'grid' ? 40 : 24} />
                    <span className="text-[8px] font-black mt-2 uppercase tracking-widest">Digital Asset</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1">
                   <div className={`p-2 rounded-lg text-white shadow-lg ${item.type === 'medication' ? 'bg-amber-500' : item.type === 'home_care' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                     {item.type === 'medication' ? <Pill size={14} /> : item.type === 'home_care' ? <Home size={14} /> : <FileSearch size={14} />}
                   </div>
                </div>
              </div>

              <div className={`flex-1 ${viewMode === 'grid' ? 'p-6' : ''}`}>
                <h4 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                  <Calendar size={12} className="text-slate-300" /> 
                  {item.date === 'Treatment Photo' ? item.date : new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
          <ImageIcon size={64} className="text-slate-100 mb-6" />
          <h3 className="text-xl font-black text-slate-800">Media Vault Kosong</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-2 font-medium">Belum ada dokumentasi visual atau resep yang diunggah.</p>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="relative w-full max-w-xl bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full z-10 transition-all shadow-sm"
              >
                <X size={24} />
              </button>
              
              <div className="flex-1 bg-slate-50 flex items-center justify-center p-12 overflow-hidden min-h-[300px]">
                {selectedItem.url && selectedItem.fileName?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img src={selectedItem.url} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    <FileText size={100} strokeWidth={1} />
                    <p className="mt-4 font-black uppercase tracking-widest text-xs">Arsip Digital</p>
                  </div>
                )}
              </div>

              <div className="p-12 bg-white border-t border-slate-100">
                 <div className="flex items-center gap-3 mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedItem.type === 'medication' ? 'bg-amber-100 text-amber-700' : 
                      selectedItem.type === 'home_care' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedItem.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Calendar size={12} /> {selectedItem.date === 'Treatment Photo' ? 'Foto Klinis' : new Date(selectedItem.date).toLocaleDateString()}
                    </div>
                 </div>
                 
                 <h3 className="text-2xl font-black text-slate-800 leading-tight mb-4">{selectedItem.title}</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedItem.doctor && <DataRow label="Provider / Dokter" value={selectedItem.doctor} />}
                    {selectedItem.diagnosis && <DataRow label="Diagnosis" value={selectedItem.diagnosis} />}
                    <DataRow label="Nama Berkas" value={selectedItem.fileName || 'N/A'} />
                 </div>
                 
                 <div className="mt-10">
                    <a 
                      href={selectedItem.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <ExternalLink size={18} /> Buka Berkas Secara Eksternal
                    </a>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DataRow = ({ label, value }: any) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h5>
    <p className="text-xs font-black text-slate-700 break-words">{value}</p>
  </div>
);

export default MediaVault;
