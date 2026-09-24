'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { HelpdeskView } from '@/components/views/HelpdeskView';
import { NetworkView } from '@/components/views/NetworkView';
import { KnowledgeView } from '@/components/views/KnowledgeView';
import { InventoryView } from '@/components/views/InventoryView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { SettingsView } from '@/components/views/SettingsView';
import { AcademyView } from '@/components/views/AcademyView';
import { UsersView } from '@/components/views/UsersView';
import { MobileBottomNav } from '@/components/MobileBottomNav';

import { LoginView } from '@/components/views/LoginView';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, isLoading } = useAuth();

  // Trigger para recargar perfil cuando se actualizan datos
  const [refreshProfile, setRefreshProfile] = useState(0);
  const triggerRefresh = () => setRefreshProfile(prev => prev + 1);

  const renderView = () => {
    if (!user) return null;
    
    // Si no es admin y el modulo no está en sus permitidos, forzamos dashboard
    if (user.rol !== 'ADMIN' && activeView !== 'dashboard' && activeView !== 'users' && !user.modulosAccesibles?.includes(activeView)) {
      setTimeout(() => setActiveView('dashboard'), 0);
      return <DashboardView onNavigate={(view) => setActiveView(view)} />;
    }

    switch (activeView) {
      case 'dashboard': return <DashboardView onNavigate={(view) => setActiveView(view)} />;
      case 'tickets': return <HelpdeskView userId={user.id} onTicketResolved={triggerRefresh} />;
      case 'network': return <NetworkView />;
      case 'knowledge': return <KnowledgeView />;
      case 'inventory': return <InventoryView userId={user.id} onActivoRescatado={triggerRefresh} />;
      case 'analytics': return <AnalyticsView userId={user.id} />;
      case 'academy': return <AcademyView userId={user.id} onXPGained={triggerRefresh} />;
      case 'settings': return <SettingsView userId={user.id} onPreferencesSaved={triggerRefresh} />;
      case 'users': return user.rol === 'ADMIN' ? <UsersView /> : <DashboardView onNavigate={(view) => setActiveView(view)} />;
      default: return <DashboardView onNavigate={(view) => setActiveView(view)} />;
    }
  };

  if (isLoading) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>;
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Overlay para móviles */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          setIsMobileMenuOpen(false); // Auto-close on mobile
        }} 
        userId={user.id} 
        refreshTrigger={refreshProfile} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          userId={user.id}
          refreshTrigger={refreshProfile}
          onNavigateSettings={() => setActiveView('settings')}
          onNavigateUsers={() => setActiveView('users')}
        />
        
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {renderView()}
        </main>

        {/* Barra de navegación inferior móvil */}
        <MobileBottomNav activeView={activeView} setActiveView={setActiveView} />
      </div>
    </div>
  );
}
