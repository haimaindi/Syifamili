
import React from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  Pill, 
  Baby, 
  Heart, 
  FileText, 
  Menu,
  X,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  Languages,
  PhoneCall,
  Home,
  CloudUpload,
  RotateCw
} from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  syncStatus?: { isSyncing: boolean; lastSync: Date | null };
  onManualSync?: () => void;
  onManualFetch?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  language, 
  setLanguage, 
  syncStatus, 
  onManualSync,
  onManualFetch
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const t = useTranslation(language);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Activity },
    { id: 'members', label: t.members, icon: Users },
    { id: 'homecare', label: t.homeCare, icon: Home },
    { id: 'records', label: t.records, icon: FileText },
    { id: 'vault', label: t.vault, icon: ImageIcon },
    { id: 'schedule', label: t.schedule, icon: Calendar },
    { id: 'meds', label: t.meds, icon: Pill },
    { id: 'kids', label: t.kids, icon: Baby },
    { id: 'elderly', label: t.elderly, icon: Heart },
    { id: 'contacts', label: t.contacts, icon: PhoneCall },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-[100] bg-blue-600 text-white p-4 rounded-full shadow-2xl scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[95] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/d/1GCbiWaJ9RhpMZcUTE2D-idHjc_3UcLmb" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">FaMed</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">BY MAINDI</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                `}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Languages size={14} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.language}</span>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLanguage('ID')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  language === 'ID' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('EN')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  language === 'EN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
            {navItems.find(i => i.id === activeTab)?.label || activeTab}
          </h2>

          <div className="flex items-center gap-2">
            {syncStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                {syncStatus.isSyncing ? (
                  <RefreshCw size={12} className="text-blue-500 animate-spin" />
                ) : (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                )}
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {syncStatus.isSyncing ? t.syncing : 'Synced'}
                </span>
              </div>
            )}
            
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button 
                onClick={onManualFetch}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all group"
                title="Refresh from Cloud"
              >
                <RotateCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
              </button>
              <button 
                onClick={onManualSync}
                disabled={syncStatus?.isSyncing}
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                title="Manual Push to Cloud"
              >
                <CloudUpload size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide bg-slate-50/50">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
