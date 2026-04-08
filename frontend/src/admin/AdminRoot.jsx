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
import logo from '../assets/logo.jpg';

function AdminContent() {
  const { session, activeTab } = useAdmin();

  if (!session) {
    return <Login />;
  }

  return (
    <div className="admin-wrapper">
      <Sidebar />

      <main className="content-area">
        {/* LOGO MOBILE is already in Sidebar or rather, wait we didn't extract LOGO MOBILE. Let's put it here just in case. */}
        <div className="mobile-admin-logo" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <img src={logo} alt="Logo" style={{ width: 120, height: 'auto' }} />
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
