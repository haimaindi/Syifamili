
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, User, Trash2, X, BellRing, Edit2, Eye, Info } from 'lucide-react';
import { FamilyMember, Appointment } from '../types';

interface ScheduleViewProps {
  member: FamilyMember;
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
  onUpdateAppointment: (app: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  initialOpenId?: string | null;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ member, appointments, onAddAppointment, onUpdateAppointment, onDeleteAppointment, initialOpenId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [viewingApp, setViewingApp] = useState<Appointment | null>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (initialOpenId) {
      const target = appointments.find(a => a.id === initialOpenId);
      if (target) setViewingApp(target);
    }
  }, [initialOpenId, appointments]);

  const handleOpenForm = (app?: Appointment) => {
    setEditingApp(app || null);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const appData: Appointment = {
      id: editingApp?.id || Math.random().toString(36).substr(2, 9),
      memberId: member.id,
      title: formData.get('title') as string,
      dateTime: formData.get('datetime') as string,
      doctor: formData.get('doctor') as string,
      location: formData.get('location') as string,
      reminded: false
    };
    
    if (editingApp) onUpdateAppointment(appData);
    else onAddAppointment(appData);
    
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Jadwal Kontrol: {member.name}</h2>
          <p className="text-slate-500 font-medium italic">Kelola kunjungan dokter & konsultasi rutin</p>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
          <Plus size={20} /> Jadwal Baru
        </button>
      </div>

      <div className="space-y-4">
        {appointments.length > 0 ? appointments.sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(app => (
          <div key={app.id} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
            <div className="w-20 h-20 shrink-0 bg-indigo-50 rounded-[1.5rem] flex flex-col items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{new Date(app.dateTime).toLocaleString('id-ID', { month: 'short' })}</span>
              <span className="text-3xl font-black leading-none">{new Date(app.dateTime).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                <h4 className="text-xl font-black text-slate-800 leading-tight">{app.title}</h4>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setViewingApp(app)} className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Eye size={18} /></button>
                   <button onClick={() => handleOpenForm(app)} className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                   <button onClick={() => onDeleteAppointment(app.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100">
                  <Clock size={14} /> {new Date(app.dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><User size={14} className="text-slate-400" /> {app.doctor}</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><MapPin size={14} className="text-slate-400" /> {app.location}</div>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[4rem] p-24 text-center">
            <Calendar size={64} className="mx-auto mb-6 text-slate-100" />
            <h3 className="text-xl font-black text-slate-800">Tidak Ada Jadwal</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-2 font-medium">Belum ada agenda pemeriksaan medis mendatang.</p>
            <button onClick={() => handleOpenForm()} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800">Input Sekarang</button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingApp ? 'Ubah Jadwal' : 'Buat Jadwal Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={32} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tujuan / Keluhan Utama</label>
                <input name="title" defaultValue={editingApp?.title} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" placeholder="Mis: Cek Jantung, Vaksin" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Waktu & Tanggal</label>
                <input name="datetime" type="datetime-local" defaultValue={editingApp?.dateTime || new Date().toISOString().slice(0, 16)} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dokter / Spesialis</label>
                <input name="doctor" defaultValue={editingApp?.doctor} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" placeholder="dr. Robert Fox" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fasilitas Kesehatan</label>
                <input name="location" defaultValue={editingApp?.location} required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" placeholder="RS Medika" />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingApp && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
           <div className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 shadow-2xl animate-scaleIn relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-indigo-600"></div>
              <button onClick={() => setViewingApp(null)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full z-10"><X size={24} /></button>
              
              <div className="relative pt-8 space-y-8">
                 <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-3xl bg-white border-8 border-white shadow-2xl flex flex-col items-center justify-center text-indigo-600 mb-6">
                       <span className="text-xs font-black uppercase">{new Date(viewingApp.dateTime).toLocaleString('id-ID', { month: 'short' })}</span>
                       <span className="text-4xl font-black">{new Date(viewingApp.dateTime).getDate()}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2">{viewingApp.title}</h3>
                    <div className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                       <Clock size={14} /> {new Date(viewingApp.dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                       <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm"><User size={20} /></div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dokter</p>
                          <p className="text-sm font-black text-slate-800">{viewingApp.doctor}</p>
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                       <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm"><MapPin size={20} /></div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi</p>
                          <p className="text-sm font-black text-slate-800">{viewingApp.location}</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button onClick={() => setViewingApp(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Selesai</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
