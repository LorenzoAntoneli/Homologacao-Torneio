import React from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Sidebar from './components/Sidebar';
import EditMatchModal from './components/EditMatchModal';
import Login from './screens/Login';
import Scoreboard from './screens/Scoreboard';
import History from './screens/History';
import Matches from './screens/Matches';
import Brackets from './screens/Brackets';
import Pairs from './screens/Pairs';
import ImportExport from './screens/ImportExport';
import Setup from './screens/Setup';
import logo from '../assets/logo-go.png';

function AdminContent() {
  const { session, activeTab } = useAdmin();

  if (!session) {
    return <Login />;
  }

  return (
    <div className="admin-wrapper">
      <Sidebar />

      <main className="content-area">
        <div className="mobile-admin-logo">
          <img src={logo} alt="Logo" />
        </div>


        {activeTab === 'scoreboard' && <Scoreboard />}
        {activeTab === 'history' && <History />}
        {activeTab === 'matches' && <Matches />}
        {activeTab === 'brackets' && <Brackets />}
        {activeTab === 'pairs' && <Pairs />}
        {activeTab === 'import' && <ImportExport />}
        {activeTab === 'setup' && <Setup />}

        <EditMatchModal />
      </main>
    </div>
  );
}

export default function AdminRoot() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}
