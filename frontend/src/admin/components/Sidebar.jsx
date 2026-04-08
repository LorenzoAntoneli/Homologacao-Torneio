import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './Sidebar.module.css';
import logo from '../../assets/logo.jpg';
import { Swords, LogOut, Monitor, PlusCircle, UserPlus, Gamepad2, Settings, MapPin, LayoutList, Trash2, Pencil, Volume2, Network, FileSpreadsheet, Download, Upload, Smartphone } from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, handleLogout } = useAdmin();

  return (
    <>
      {/* SIDEBAR (Desktop Only) */}
      <aside className="sidebar">
        <div className={styles.sidebarLogo}>
          <img src={logo} alt="Logo" className={styles.logoImage} />
        </div>
        <nav className="nav-group">
          <div className={`nav-item ${activeTab === 'scoreboard' ? 'active' : ''}`} onClick={() => setActiveTab('scoreboard')}><Swords size={20} /> Score (Ativos)</div>
          <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><LayoutList size={20} /> Partidas (Encerradas)</div>
          <div className={`nav-item ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}><Gamepad2 size={20} /> Agendar Jogo</div>
          <div className={`nav-item ${activeTab === 'brackets' ? 'active' : ''}`} onClick={() => setActiveTab('brackets')}><Network size={20} /> Chaveamento</div>
          <div className={`nav-item ${activeTab === 'pairs' ? 'active' : ''}`} onClick={() => setActiveTab('pairs')}><UserPlus size={20} /> Duplas</div>
          <div className={`nav-item ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}><FileSpreadsheet size={20} /> Importar/Exportar</div>
          <div className={`nav-item ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}><Settings size={20} />Configurar</div>
          <div className={styles.bottomLinks}>
            <a href="/tv" target="_blank" rel="noreferrer" className={`nav-item ${styles.navLink}`}><Monitor size={20} /> Ver TV</a>
            <a href="/jogador" target="_blank" rel="noreferrer" className={`nav-item ${styles.navLink}`}><Smartphone size={20} /> Portal Jogador</a>
            <div className={`nav-item ${styles.logoutBtn}`} onClick={handleLogout}><LogOut size={20} /> Sair</div>
          </div>
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className={`mobile-nav ${styles.mobileNav}`}>
        <div className={`m-nav-item ${activeTab === 'scoreboard' ? 'active' : ''}`} onClick={() => setActiveTab('scoreboard')}><Swords size={20} /><small>Score</small></div>
        <div className={`m-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><LayoutList size={20} /><small>Partidas</small></div>
        <div className={`m-nav-item ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}><Gamepad2 size={20} /><small>Agendar</small></div>
        <div className={`m-nav-item ${activeTab === 'brackets' ? 'active' : ''}`} onClick={() => setActiveTab('brackets')}><Network size={20} /><small>Chaves</small></div>
        <div className={`m-nav-item ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}><FileSpreadsheet size={20} /><small>Excel</small></div>
        <div className={`m-nav-item ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}><Settings size={20} /><small>Setup</small></div>
      </nav>
    </>
  );
}
