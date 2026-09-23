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
      return <DashboardView />;
    }

    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'tickets': return <HelpdeskView userId={user.id} onTicketResolved={triggerRefresh} />;
      case 'network': return <NetworkView />;
      case 'knowledge': return <KnowledgeView />;
      case 'inventory': return <InventoryView userId={user.id} onActivoRescatado={triggerRefresh} />;
      case 'analytics': return <AnalyticsView userId={user.id} />;
      case 'academy': return <AcademyView userId={user.id} onXPGained={triggerRefresh} />;
      case 'settings': return <SettingsView userId={user.id} onPreferencesSaved={triggerRefresh} />;
      case 'users': return user.rol === 'ADMIN' ? <UsersView /> : <DashboardView />;
      default: return <DashboardView />;
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
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
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          userId={user.id}
          refreshTrigger={refreshProfile}
          onNavigateSettings={() => setActiveView('settings')}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
