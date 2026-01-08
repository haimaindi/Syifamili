
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import { 
  FamilyMember, MedicalRecord, Appointment, Medication, GrowthLog,
  CaregiverNote, Language, HealthContact, VitalLog, HomeCareLog
} from './types';
import { INITIAL_MEMBERS } from './constants';
import { spreadsheetService } from './services/spreadsheetService';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import RecordsView from './components/RecordsView';
import ScheduleView from './components/ScheduleView';
import MedicationView from './components/MedicationView';
import KidsView from './components/KidsView';
import ElderlyView from './components/ElderlyView';
import MediaVault from './components/MediaVault';
import ContactsView from './components/ContactsView';
import HomeCareView from './components/HomeCareView';
import WelcomeModal from './components/WelcomeModal';
import { Loader2, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('ID');
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Data States
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>([]);
  const [vitalLogs, setVitalLogs] = useState<VitalLog[]>([]);
  const [homeCareLogs, setHomeCareLogs] = useState<HomeCareLog[]>([]);
  const [notes, setNotes] = useState<CaregiverNote[]>([]);
  const [contacts, setContacts] = useState<HealthContact[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [initialOpenId, setInitialOpenId] = useState<string | null>(null);

  const handleCloudFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const cloudData = await spreadsheetService.fetchAllData();
      if (cloudData && cloudData.members && cloudData.members.length > 0) {
        setMembers(cloudData.members);
        setSelectedMemberId(prevId => {
           const stillExists = cloudData.members.find((m: any) => m.id === prevId);
           return stillExists ? prevId : cloudData.members[0].id;
        });
        setRecords(cloudData.records || []);
        setAppointments(cloudData.appointments || []);
        setMeds(cloudData.meds || []);
        setGrowthLogs(cloudData.growthLogs || []);
        setVitalLogs(cloudData.vitalLogs || []);
        setHomeCareLogs(cloudData.homeCareLogs || []);
        setNotes(cloudData.notes || []);
        setContacts(cloudData.contacts || []);
        setLastSync(new Date());
      } else {
        setMembers(INITIAL_MEMBERS);
        setSelectedMemberId(INITIAL_MEMBERS[0].id);
      }
    } catch (err) {
      if (members.length === 0) {
        setMembers(INITIAL_MEMBERS);
        setSelectedMemberId(INITIAL_MEMBERS[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [members.length]);

  const triggerSync = async (overrides: any) => {
    if (isSyncing) return;
    setIsSyncing(true);
    const dataToSave = {
      members, records, appointments, meds, growthLogs, vitalLogs, homeCareLogs, notes, contacts,
      ...overrides
    };
    try {
      const success = await spreadsheetService.saveData(dataToSave);
      if (success) setLastSync(new Date());
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { handleCloudFetch(); }, [handleCloudFetch]);

  const onNavigateToDetail = (tab: string, memberId: string, itemId: string) => {
    setSelectedMemberId(memberId);
    setInitialOpenId(itemId);
    setActiveTab(tab);
  };

  const currentMember = members.find(m => m.id === selectedMemberId) || (members.length > 0 ? members[0] : null);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Sinkronisasi Enkripsi Data...</p>
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
        <UserPlus size={64} className="text-slate-200 mb-6" />
        <h2 className="text-2xl font-black text-slate-800">Profil Tidak Ditemukan</h2>
        <p className="text-slate-400 mt-2 mb-8">Basis data kosong atau terjadi kesalahan pemuatan.</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">Muat Ulang</button>
      </div>
    );
  }

  return (
    <>
      {showWelcome && <WelcomeModal onAgree={() => setShowWelcome(false)} />}
      <Layout 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setInitialOpenId(null); }} 
        language={language} 
        setLanguage={setLanguage}
        syncStatus={{ isSyncing, lastSync }} 
        onManualSync={() => triggerSync({})} 
        onManualFetch={handleCloudFetch}
      >
        {(() => {
          switch (activeTab) {
            case 'dashboard': return <Dashboard members={members} appointments={appointments} meds={meds} language={language} onSwitchMember={setSelectedMemberId} onNavigateToDetail={onNavigateToDetail} activeMemberId={selectedMemberId} />;
            case 'members': return <MembersList members={members} language={language} onAddMember={(m) => { const n = [...members, m]; setMembers(n); triggerSync({members: n}) }} onUpdateMember={(u) => { const n = members.map(m => m.id === u.id ? u : m); setMembers(n); triggerSync({members: n}) }} onDeleteMember={(id) => { const n = members.filter(m => m.id !== id); setMembers(n); triggerSync({members: n}) }} onSelectMember={setSelectedMemberId} selectedId={selectedMemberId} />;
            case 'records': return <RecordsView member={currentMember} records={records.filter(r => r.memberId === selectedMemberId)} language={language} onAddRecord={(r) => { const n = [...records, r]; setRecords(n); triggerSync({records: n}) }} onUpdateRecord={(u) => { const n = records.map(r => r.id === u.id ? u : r); setRecords(n); triggerSync({records: n}) }} onDeleteRecord={(id) => { const n = records.filter(r => r.id !== id); setRecords(n); triggerSync({records: n}) }} initialOpenId={initialOpenId} />;
            case 'meds': return <MedicationView member={currentMember} meds={meds.filter(m => m.memberId === selectedMemberId)} language={language} onAddMed={(m) => { const n = [...meds, m]; setMeds(n); triggerSync({meds: n}) }} onUpdateMed={(u) => { const n = meds.map(m => m.id === u.id ? u : m); setMeds(n); triggerSync({meds: n}) }} onDeleteMed={(id) => { const n = meds.filter(m => m.id !== id); setMeds(n); triggerSync({meds: n}) }} />;
            case 'homecare': return <HomeCareView member={currentMember} homeCareLogs={homeCareLogs.filter(l => l.memberId === selectedMemberId)} language={language} onAddLog={(l) => { const n = [...homeCareLogs, l]; setHomeCareLogs(n); triggerSync({homeCareLogs: n}) }} onUpdateLog={(u) => { const n = homeCareLogs.map(l => l.id === u.id ? u : l); setHomeCareLogs(n); triggerSync({homeCareLogs: n}) }} />;
            case 'schedule': return <ScheduleView member={currentMember} appointments={appointments.filter(a => a.memberId === selectedMemberId)} onAddAppointment={(a) => { const n = [...appointments, a]; setAppointments(n); triggerSync({appointments: n}) }} onUpdateAppointment={(u) => { const n = appointments.map(a => a.id === u.id ? u : a); setAppointments(n); triggerSync({appointments: n}) }} onDeleteAppointment={(id) => { const n = appointments.filter(a => a.id !== id); setAppointments(n); triggerSync({appointments: n}) }} initialOpenId={initialOpenId} />;
            case 'vault': return <MediaVault member={currentMember} records={records.filter(r => r.memberId === selectedMemberId)} meds={meds.filter(m => m.memberId === selectedMemberId)} homeCareLogs={homeCareLogs.filter(l => l.memberId === selectedMemberId)} />;
            case 'kids': return <KidsView member={currentMember} growthLogs={growthLogs.filter(g => g.memberId === selectedMemberId)} language={language} onAddGrowthLog={(g) => { const n = [...growthLogs, g]; setGrowthLogs(n); triggerSync({growthLogs: n}) }} />;
            case 'elderly': return <ElderlyView member={currentMember} records={records.filter(r => r.memberId === selectedMemberId)} vitalLogs={vitalLogs.filter(v => v.memberId === selectedMemberId)} notes={notes.filter(note => note.memberId === selectedMemberId)} language={language} onAddVital={(v) => { const nextVitals = [...vitalLogs, v]; setVitalLogs(nextVitals); triggerSync({vitalLogs: nextVitals}) }} onAddNote={(note) => { const nextNotes = [note, ...notes]; setNotes(nextNotes); triggerSync({notes: nextNotes}) }} onAddRecord={(r) => { const nextRecords = [...records, r]; setRecords(nextRecords); triggerSync({records: nextRecords}) }} />;
            case 'contacts': return <ContactsView contacts={contacts} language={language} onAddContact={(c) => { const n = [...contacts, c]; setContacts(n); triggerSync({contacts: n}) }} onUpdateContact={(u) => { const n = contacts.map(c => c.id === u.id ? u : c); setContacts(n); triggerSync({contacts: n}) }} onDeleteContact={(id) => { const n = contacts.filter(c => c.id !== id); setContacts(n); triggerSync({contacts: n}) }} />;
            default: return null;
          }
        })()}
      </Layout>
    </>
  );
};

export default App;
