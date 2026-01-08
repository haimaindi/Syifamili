
import React, { useState, useRef, useMemo } from 'react';
import { UserPlus, Heart, Baby, Shield, Trash2, X, Edit2, Camera, Upload, Loader2, CreditCard, Search, Users, PlusCircle, Image as ImageIcon, Calendar, Droplets, Eye, ExternalLink } from 'lucide-react';
import { FamilyMember, Relation, AllergyDetail, Language } from '../types';
import { spreadsheetService } from '../services/spreadsheetService';
import { useTranslation } from '../translations';

interface MembersListProps {
  members: FamilyMember[];
  language: Language;
  onAddMember: (member: FamilyMember) => void;
  onUpdateMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onSelectMember: (id: string) => void;
  selectedId: string;
}

interface TempAllergy extends Partial<AllergyDetail> {
  localFile?: File;
}

const MembersList: React.FC<MembersListProps> = ({ members, language, onAddMember, onUpdateMember, onDeleteMember, onSelectMember, selectedId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [viewingMember, setViewingMember] = useState<FamilyMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [insuranceCardFile, setInsuranceCardFile] = useState<File | null>(null);
  const [tempAllergies, setTempAllergies] = useState<TempAllergy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const insuranceInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslation(language);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const bday = new Date(birthDate);
    let years = today.getFullYear() - bday.getFullYear();
    let months = today.getMonth() - bday.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < bday.getDate())) {
      years--;
      months = 12 + months;
    }
    return { years, months };
  };

  const handleOpenForm = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setTempAllergies(member.allergies || []);
    } else {
      setEditingMember(null);
      setTempAllergies([]);
    }
    setMemberPhotoFile(null);
    setInsuranceCardFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const birthDate = formData.get('birthDate') as string;
    const { years } = calculateAge(birthDate);
    
    try {
      let photoUrl = editingMember?.photoUrl || `https://picsum.photos/seed/${Math.random()}/200`;
      if (memberPhotoFile) {
        const result = await spreadsheetService.uploadFile(memberPhotoFile);
        if (result?.url) photoUrl = result.url;
      }
      
      let insuranceCardUrl = editingMember?.insuranceCardUrl || '';
      if (insuranceCardFile) {
        const result = await spreadsheetService.uploadFile(insuranceCardFile);
        if (result?.url) insuranceCardUrl = result.url;
      }

      const finalAllergies: AllergyDetail[] = [];
      for (const al of tempAllergies) {
        let finalAlPhoto = al.photoUrl || '';
        if (al.localFile) {
          const result = await spreadsheetService.uploadFile(al.localFile);
          if (result?.url) finalAlPhoto = result.url;
        }
        if (al.name) {
          finalAllergies.push({
            id: al.id || Math.random().toString(36).substr(2, 5),
            name: al.name,
            reaction: al.reaction || '',
            photoUrl: finalAlPhoto
          });
        }
      }

      const memberData: FamilyMember = {
        id: editingMember?.id || Math.random().toString(36).substr(2, 9),
        name: formData.get('name') as string,
        relation: formData.get('relation') as Relation,
        birthDate,
        bloodType: formData.get('bloodType') as string,
        allergies: finalAllergies,
        photoUrl,
        isElderly: years >= 60,
        isChild: years <= 12,
        nik: formData.get('nik') as string,
        insuranceNumber: formData.get('insuranceNumber') as string,
        insuranceCardUrl
      };

      if (editingMember) onUpdateMember(memberData);
      else onAddMember(memberData);
      setShowForm(false);
    } catch (err) {
      alert("Gagal menyimpan data profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [members, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.members}</h2>
          <p className="text-slate-500 font-medium italic">Sentralisasi profil medis seluruh keluarga</p>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
          <UserPlus size={18} /> {t.addMember}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama anggota keluarga..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none font-medium focus:ring-4 focus:ring-blue-50 transition-all" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMembers.map(member => {
          const { years } = calculateAge(member.birthDate);
          return (
            <div 
              key={member.id}
              className={`relative group bg-white p-8 rounded-[3.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${selectedId === member.id ? 'border-blue-600 shadow-2xl -translate-y-2' : 'border-slate-50 hover:border-blue-100 shadow-sm'}`}
              onClick={() => onSelectMember(member.id)}
            >
              <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setViewingMember(member); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl"><Eye size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleOpenForm(member); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl"><Edit2 size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Hapus profil ini?')) onDeleteMember(member.id); }} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl"><Trash2 size={18} /></button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl ring-4 ring-slate-50">
                  <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 leading-tight mb-1">{member.name}</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-3 py-1 rounded-lg">{member.relation}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{years} {t.years}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center shadow-inner">
                      <Calendar size={12} className="text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-800">{new Date(member.birthDate).toLocaleDateString()}</span>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center shadow-inner">
                      <Droplets size={12} className="text-red-400 mb-1" />
                      <span className="text-[10px] font-black text-slate-800">{member.bloodType}</span>
                   </div>
                </div>

                {member.allergies && member.allergies.length > 0 && (
                  <div className="mt-6 w-full flex flex-wrap justify-center gap-1.5">
                    {member.allergies.slice(0, 3).map((a, i) => (
                      <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[9px] font-black uppercase tracking-tighter">
                        <Shield size={10} className="inline mr-1" /> {a.name}
                      </span>
                    ))}
                    {member.allergies.length > 3 && <span className="text-[9px] text-slate-400 font-bold">+{member.allergies.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-2xl shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{editingMember ? 'Ubah Profil' : 'Daftarkan Anggota Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={32} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 flex justify-center">
                  <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-[3rem] overflow-hidden border-4 border-slate-100 shadow-xl group-hover:border-blue-400 transition-all">
                      <img src={memberPhotoFile ? URL.createObjectURL(memberPhotoFile) : (editingMember?.photoUrl || 'https://picsum.photos/seed/new/200')} className="w-full h-full object-cover" alt="Profile" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-[3rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={32} />
                    </div>
                    <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => setMemberPhotoFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input name="name" defaultValue={editingMember?.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NIK / Identitas</label>
                  <input name="nik" defaultValue={editingMember?.nik} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hubungan</label>
                  <select name="relation" defaultValue={editingMember?.relation || 'Other'} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm appearance-none">
                    <option value="Father">Ayah</option><option value="Mother">Ibu</option>
                    <option value="Child">Anak</option><option value="Grandparent">Kakek/Nenek</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                  <input name="birthDate" type="date" defaultValue={editingMember?.birthDate} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px) font-black text-slate-400 uppercase tracking-widest mb-2">Gol. Darah</label>
                  <select name="bloodType" defaultValue={editingMember?.bloodType || 'O+'} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm appearance-none">
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>

                {/* Insurance Details Section */}
                <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100 space-y-4">
                  <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Asuransi / BPJS</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Nomor Polis / Kartu</label>
                      <input name="insuranceNumber" defaultValue={editingMember?.insuranceNumber} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm shadow-sm" placeholder="Mis: 00012345678" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Unggah Kartu (Preview Instan)</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer bg-white px-5 py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                           <Upload size={16} className="text-blue-500" />
                           <span className="text-xs font-black uppercase text-slate-500">Pilih Berkas</span>
                           <input type="file" ref={insuranceInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => setInsuranceCardFile(e.target.files?.[0] || null)} />
                        </label>
                        {(insuranceCardFile || editingMember?.insuranceCardUrl) && (
                           <div className="w-12 h-12 rounded-lg overflow-hidden border border-blue-200 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center">
                              {insuranceCardFile ? (
                                insuranceCardFile.type.startsWith('image/') ? <img src={URL.createObjectURL(insuranceCardFile)} className="w-full h-full object-cover" /> : <CreditCard size={16} className="text-blue-400" />
                              ) : (
                                editingMember?.insuranceCardUrl?.match(/\.(jpg|jpeg|png|webp)$/i) ? <img src={editingMember.insuranceCardUrl} className="w-full h-full object-cover" /> : <CreditCard size={16} className="text-blue-400" />
                              )}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-red-50/50 p-6 rounded-[2.5rem] border border-red-100">
                   <div className="flex justify-between items-center mb-4">
                      <h5 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2"><Shield size={14} /> Daftar Alergi</h5>
                      <button type="button" onClick={() => setTempAllergies([...tempAllergies, { id: Math.random().toString(36).substr(2,5), name: '', reaction: '' }])} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-md">+ Tambah</button>
                   </div>
                   <div className="space-y-3">
                      {tempAllergies.map((al, idx) => (
                         <div key={idx} className="bg-white p-4 rounded-2xl border border-red-100 flex flex-col gap-3 group">
                            <div className="grid grid-cols-2 gap-3">
                               <input placeholder="Alergi" value={al.name} onChange={(e) => { const n = [...tempAllergies]; n[idx].name = e.target.value; setTempAllergies(n); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                               <input placeholder="Reaksi" value={al.reaction} onChange={(e) => { const n = [...tempAllergies]; n[idx].reaction = e.target.value; setTempAllergies(n); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs" />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="cursor-pointer bg-slate-50 px-4 py-1.5 rounded-xl flex items-center gap-2 border border-slate-200 hover:bg-slate-100"><ImageIcon size={12} /><span className="text-[9px] font-black uppercase">Foto Reaksi</span><input type="file" className="hidden" accept="image/*" onChange={(e) => { const n = [...tempAllergies]; n[idx].localFile = e.target.files?.[0]; setTempAllergies(n); }} /></label>
                                <div className="flex items-center gap-2">
                                   {(al.localFile || al.photoUrl) && <img src={al.localFile ? URL.createObjectURL(al.localFile) : al.photoUrl} className="w-10 h-10 rounded-lg object-cover border border-red-200" />}
                                   <button type="button" onClick={() => setTempAllergies(tempAllergies.filter((_, i) => i !== idx))} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 tracking-widest">{isSaving ? <Loader2 className="animate-spin" size={20} /> : 'SIMPAN PROFIL'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingMember && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
           <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl animate-scaleIn relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 right-0 h-24 bg-blue-600"></div>
              <button onClick={() => setViewingMember(null)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full z-10"><X size={24} /></button>
              
              <div className="relative pt-10 flex flex-col items-center flex-1 overflow-y-auto scrollbar-hide">
                 <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl mb-4 bg-slate-100 shrink-0">
                    <img src={viewingMember.photoUrl} className="w-full h-full object-cover" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 mb-1">{viewingMember.name}</h3>
                 <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">{viewingMember.relation}</span>

                 <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <MiniBox label="NIK" value={viewingMember.nik || '-'} />
                    <MiniBox label="Gol. Darah" value={viewingMember.bloodType} />
                    <MiniBox label="Usia" value={calculateAge(viewingMember.birthDate).years + " Tahun"} />
                    <MiniBox label="Kategori" value={viewingMember.isElderly ? 'Lansia' : viewingMember.isChild ? 'Anak' : 'Dewasa'} />
                 </div>

                 <div className="w-full space-y-4">
                    {viewingMember.insuranceNumber && (
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5"><CreditCard size={60} /></div>
                          <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><CreditCard size={12} /> Asuransi / BPJS</h5>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nomor Polis</p>
                          <p className="text-lg font-black text-blue-600 leading-tight mb-4">{viewingMember.insuranceNumber}</p>
                          
                          {viewingMember.insuranceCardUrl && (
                             <div className="mt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Dokumentasi Kartu</p>
                                <div onClick={() => window.open(viewingMember.insuranceCardUrl, '_blank')} className="relative h-24 w-full bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all shadow-inner group/card">
                                   {viewingMember.insuranceCardUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                      <img src={viewingMember.insuranceCardUrl} className="w-full h-full object-cover" />
                                   ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                         <ImageIcon size={24} />
                                         <span className="text-[8px] font-black uppercase mt-1">Dokumen Kartu</span>
                                      </div>
                                   )}
                                   <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-opacity text-white">
                                      <ExternalLink size={20} />
                                      <span className="text-[10px] font-black uppercase ml-2">Buka Eksternal</span>
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    )}
                    {viewingMember.allergies && viewingMember.allergies.length > 0 && (
                       <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                          <h5 className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Shield size={12} /> Data Alergi</h5>
                          <div className="space-y-2">
                             {viewingMember.allergies.map((al, i) => (
                                <div key={i} className="bg-white p-3 rounded-2xl flex items-center gap-3 shadow-sm border border-rose-50 hover:border-rose-300 transition-all cursor-pointer group/al" onClick={() => al.photoUrl && window.open(al.photoUrl, '_blank')}>
                                   {al.photoUrl ? (
                                     <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                       <img src={al.photoUrl} className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/al:opacity-100 transition-opacity flex items-center justify-center text-white"><ExternalLink size={10} /></div>
                                     </div>
                                   ) : <div className="p-2 bg-slate-50 rounded-lg"><Shield size={12} className="text-rose-400" /></div>}
                                   <div className="flex-1 min-w-0">
                                      <p className="font-black text-slate-800 text-xs truncate">{al.name}</p>
                                      <p className="text-[10px] text-rose-500 italic line-clamp-1">"{al.reaction}"</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
              </div>
              <div className="mt-8 shrink-0">
                 <button onClick={() => setViewingMember(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Tutup Detail</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const MiniBox = ({ label, value }: any) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-inner">
    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-xs font-black text-slate-800">{value}</p>
  </div>
);

export default MembersList;
