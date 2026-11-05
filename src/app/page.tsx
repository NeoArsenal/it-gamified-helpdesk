'use client';

import { useState, useEffect } from 'react';
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

const VALID_VIEWS = [
  'dashboard',
  'tickets',
  'network',
  'knowledge',
  'inventory',
  'analytics',
  'academy',
  'settings',
  'users',
];

const STORAGE_KEY = 'it_helpdesk_active_view';

function getStoredView(): string {
  if (typeof window === 'undefined') return 'dashboard';

  // 1. Prioridad: Parámetro en URL (?tab= o ?view=)
  try {
    const params = new URLSearchParams(window.location.search);
    const urlView = params.get('tab') || params.get('view');
    if (urlView && VALID_VIEWS.includes(urlView)) {
      return urlView;
    }
  } catch {}

  // 2. Hash en URL (#tickets, #inventory, etc.)
  try {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && VALID_VIEWS.includes(hash)) {
      return hash;
    }
  } catch {}

  // 3. Fallback: LocalStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_VIEWS.includes(saved)) {
      return saved;
    }
  } catch {}

  return 'dashboard';
}

export default function Home() {
  const [activeView, setActiveViewState] = useState<string>('dashboard');
  const [visitedViews, setVisitedViews] = useState<string[]>(['dashboard']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, isLoading } = useAuth();

  // Función envoltorio para cambiar vista y sincronizar con URL + localStorage
  const setActiveView = (viewOrUpdater: string | ((prev: string) => string)) => {
    setActiveViewState(prev => {
      const nextView = typeof viewOrUpdater === 'function' ? viewOrUpdater(prev) : viewOrUpdater;
      if (VALID_VIEWS.includes(nextView)) {
        try {
          localStorage.setItem(STORAGE_KEY, nextView);
          const url = new URL(window.location.href);
          if (url.searchParams.get('tab') !== nextView) {
            url.searchParams.set('tab', nextView);
            window.history.pushState({ tab: nextView }, '', url.toString());
          }
        } catch {}
      }
      return nextView;
    });
  };

  // Restaurar módulo guardado al cargar/refrescar la página completa
  useEffect(() => {
    const initialView = getStoredView();
    if (initialView && initialView !== 'dashboard') {
      setActiveViewState(initialView);
      setVisitedViews(prev => (prev.includes(initialView) ? prev : [...prev, initialView]));

      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('tab') !== initialView) {
          url.searchParams.set('tab', initialView);
          window.history.replaceState({ tab: initialView }, '', url.toString());
        }
      } catch {}
    }
  }, []);

  // Sincronizar si el usuario usa las flechas Atrás / Adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      const current = getStoredView();
      if (current) {
        setActiveViewState(current);
        setVisitedViews(prev => (prev.includes(current) ? prev : [...prev, current]));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Trigger para recargar perfil cuando se actualizan datos
  const [refreshProfile, setRefreshProfile] = useState(0);
  const triggerRefresh = () => setRefreshProfile(prev => prev + 1);

  // Mantener registro de vistas visitadas para no re-descargar datos al navegar
  useEffect(() => {
    if (!visitedViews.includes(activeView)) {
      setVisitedViews(prev => [...prev, activeView]);
    }
  }, [activeView, visitedViews]);

  // Si no es admin y el modulo no está en sus permitidos, redirigir a dashboard
  useEffect(() => {
    if (user && user.rol !== 'ADMIN' && activeView !== 'dashboard' && activeView !== 'users' && !user.modulosAccesibles?.includes(activeView)) {
      setActiveView('dashboard');
    }
  }, [user, activeView]);

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4 select-none">
        <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl shadow-black/40 border border-slate-700/60 animate-pulse">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/emblem.svg" alt="Logo Limatambo" className="w-full h-full object-contain" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Clínicas Limatambo</p>
          <p className="text-xs text-slate-400 font-medium">Iniciando plataforma de soporte TI...</p>
        </div>
      </div>
    );
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
        
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative">
          {visitedViews.includes('dashboard') && (
            <div className={activeView === 'dashboard' ? 'block min-h-full' : 'hidden'}>
              <DashboardView onNavigate={(view) => setActiveView(view)} />
            </div>
          )}
          {visitedViews.includes('tickets') && (
            <div className={activeView === 'tickets' ? 'block min-h-full' : 'hidden'}>
              <HelpdeskView userId={user.id} onTicketResolved={triggerRefresh} />
            </div>
          )}
          {visitedViews.includes('network') && (
            <div className={activeView === 'network' ? 'block min-h-full' : 'hidden'}>
              <NetworkView />
            </div>
          )}
          {visitedViews.includes('knowledge') && (
            <div className={activeView === 'knowledge' ? 'block min-h-full' : 'hidden'}>
              <KnowledgeView userId={user.id} />
            </div>
          )}
          {visitedViews.includes('inventory') && (
            <div className={activeView === 'inventory' ? 'block min-h-full' : 'hidden'}>
              <InventoryView userId={user.id} onActivoRescatado={triggerRefresh} />
            </div>
          )}
          {visitedViews.includes('analytics') && (
            <div className={activeView === 'analytics' ? 'block min-h-full' : 'hidden'}>
              <AnalyticsView userId={user.id} />
            </div>
          )}
          {visitedViews.includes('academy') && (
            <div className={activeView === 'academy' ? 'block min-h-full' : 'hidden'}>
              <AcademyView userId={user.id} onXPGained={triggerRefresh} />
            </div>
          )}
          {visitedViews.includes('settings') && (
            <div className={activeView === 'settings' ? 'block min-h-full' : 'hidden'}>
              <SettingsView userId={user.id} onPreferencesSaved={triggerRefresh} />
            </div>
          )}
          {user.rol === 'ADMIN' && visitedViews.includes('users') && (
            <div className={activeView === 'users' ? 'block min-h-full' : 'hidden'}>
              <UsersView />
            </div>
          )}
        </main>

        {/* Barra de navegación inferior móvil */}
        <MobileBottomNav activeView={activeView} setActiveView={setActiveView} />
      </div>
    </div>
  );
}
