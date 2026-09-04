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

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Usuario hardcodeado de la semilla ("Juan Dev")
  const [userId] = useState('4e447e7e-0824-49d1-9abd-490209ad77de');

  // Trigger para recargar el sidebar cuando ganamos XP
  const [refreshProfile, setRefreshProfile] = useState(0);
  const triggerRefresh = () => setRefreshProfile(prev => prev + 1);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'tickets': return <HelpdeskView userId={userId} onTicketResolved={triggerRefresh} />;
      case 'network': return <NetworkView />;
      case 'knowledge': return <KnowledgeView />;
      case 'inventory': return <InventoryView userId={userId} onActivoRescatado={triggerRefresh} />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <div className="p-8 text-slate-500 animate-in fade-in">Panel de configuración en construcción...</div>;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} userId={userId} refreshTrigger={refreshProfile} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
