
import React, { useState } from 'react';
import { Phone, MapPin, ExternalLink, Plus, Search, X, Navigation, Hospital, Trash2, PhoneCall, Edit2, Eye, Info } from 'lucide-react';
import { HealthContact, Language } from '../types';
import { useTranslation } from '../translations';

interface ContactsViewProps {
  contacts: HealthContact[];
  language: Language;
  onAddContact: (contact: HealthContact) => void;
  onUpdateContact: (contact: HealthContact) => void;
  onDeleteContact: (id: string) => void;
}

const ContactsView: React.FC<ContactsViewProps> = ({ contacts, language, onAddContact, onUpdateContact, onDeleteContact }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<HealthContact | null>(null);
  const [viewingContact, setViewingContact] = useState<HealthContact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslation(language);

  const handleOpenForm = (contact?: HealthContact) => {
    setEditingContact(contact || null);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contactData: HealthContact = {
      id: editingContact?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      gmapsUrl: formData.get('gmapsUrl') as string
    };
    
    if (editingContact) onUpdateContact(contactData);
    else onAddContact(contactData);
    
    setShowForm(false);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.contacts}</h2>
          <p className="text-slate-500 font-medium italic">Sentralisasi data fasilitas kesehatan & dokter darurat</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} /> {t.addContact}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder={language === 'ID' ? 'Cari nama faskes atau alamat...' : 'Search facility name or address...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-50 font-medium transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
          <div key={contact.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-3xl ${
                contact.type === 'Hospital' ? 'bg-rose-50 text-rose-600' : 
                contact.type === 'Clinic' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Hospital size={28} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setViewingContact(contact)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Eye size={18} /></button>
                <button onClick={() => handleOpenForm(contact)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Edit2 size={18} /></button>
                <button onClick={() => { if(confirm(language === 'ID' ? 'Hapus kontak ini?' : 'Delete this contact?')) onDeleteContact(contact.id); }} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18} /></button>
              </div>
            </div>

            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 inline-block">{contact.type}</span>
              <h3 className="text-xl font-black text-slate-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors">{contact.name}</h3>
              
              <div className="space-y-4 mb-8">
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400"><PhoneCall size={14} /></div>
                  {contact.phone}
                </a>
                <div className="flex items-start gap-3 text-sm font-medium text-slate-500 leading-relaxed">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 mt-0.5"><MapPin size={14} /></div>
                  <span className="line-clamp-2">{contact.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <button 
                onClick={() => contact.gmapsUrl && window.open(contact.gmapsUrl, '_blank', 'noopener,noreferrer')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
                disabled={!contact.gmapsUrl}
              >
                <Navigation size={14} /> {t.navigate}
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
            <PhoneCall size={64} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-xl font-black text-slate-800">{language === 'ID' ? 'Belum Ada Kontak' : 'No Contacts Yet'}</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-2 font-medium">Tambahkan daftar fasilitas kesehatan atau dokter langganan Anda.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-2xl my-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingContact ? 'Ubah Kontak' : 'Tambah Kontak Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Faskes / Dokter</label>
                <input name="name" defaultValue={editingContact?.name} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm" placeholder="RS Harapan Kita" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipe</label>
                  <select name="type" defaultValue={editingContact?.type || 'Hospital'} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm appearance-none">
                    <option>Hospital</option><option>Clinic</option><option>Doctor</option><option>Pharmacy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.phone}</label>
                  <input name="phone" defaultValue={editingContact?.phone} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm" placeholder="021-xxxxxx" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.address}</label>
                <input name="address" defaultValue={editingContact?.address} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm" placeholder="Jl. Raya No. 123" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.gmapsUrl}</label>
                <input name="gmapsUrl" defaultValue={editingContact?.gmapsUrl} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm" placeholder="https://maps.google.com/..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingContact && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
           <div className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 shadow-2xl animate-scaleIn relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-slate-900"></div>
              <button onClick={() => setViewingContact(null)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full z-10"><X size={24} /></button>
              
              <div className="relative pt-12 flex flex-col items-center">
                 <div className="w-24 h-24 rounded-3xl bg-white border-8 border-white shadow-2xl flex items-center justify-center text-slate-900 mb-6">
                    <Hospital size={48} />
                 </div>
                 
                 <div className="text-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2">{viewingContact.name}</h3>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">{viewingContact.type}</span>
                 </div>

                 <div className="w-full space-y-4">
                    <ContactDetail icon={Phone} label="Nomor Telepon" value={viewingContact.phone} isLink={`tel:${viewingContact.phone}`} />
                    <ContactDetail icon={MapPin} label="Alamat" value={viewingContact.address} />
                 </div>

                 {viewingContact.gmapsUrl && (
                   <div className="pt-8 w-full">
                      <button onClick={() => window.open(viewingContact.gmapsUrl, '_blank', 'noopener,noreferrer')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-all">
                         <Navigation size={18} /> Buka di Maps
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

const ContactDetail = ({ icon: Icon, label, value, isLink }: any) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 shadow-inner">
    <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 border border-slate-50"><Icon size={20} /></div>
    <div>
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       {isLink ? (
         <a href={isLink} className="text-sm font-black text-blue-600 hover:underline">{value}</a>
       ) : (
         <p className="text-sm font-black text-slate-800 leading-relaxed">{value}</p>
       )}
    </div>
  </div>
);

export default ContactsView;
