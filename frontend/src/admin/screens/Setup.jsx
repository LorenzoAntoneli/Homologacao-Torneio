import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './Setup.module.css';
import { PlusCircle, MapPin } from 'lucide-react';
import { supabase } from '../../supabase';

export default function Setup() {
  const { 
    tvMode, setTvMode, tvTime, setTvTime, saveTvSettings,
    newTName, setNewTName, createTournament,
    tournaments, selectedT, setSelectedT,
    tournamentSettings, setTournamentSettings, saveTournamentSettings,
    newCName, setNewCName, createCategory,
    newCourtName, setNewCourtName, createCourt,
    newSponsor, setNewSponsor, createSponsor, sponsors, loadData
  } = useAdmin();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 className="section-title">Configurar</h1>

      <div className="app-card" style={{ borderLeftColor: 'var(--accent-primary)', marginBottom: 30 }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 15, color: 'var(--accent-primary)', fontWeight: 800 }}>Controle Automático ou Manual da TV</h2>
        <label className="input-label">Modo de Exibição / Tela Fixa</label>
        <select value={tvMode} onChange={e => setTvMode(e.target.value)} style={{ marginBottom: 15 }}>
          <option value="auto">Automático (Rotacionar todas)</option>
          <option value="0">Fixo: Painel Geral</option>
          <option value="1">Fixo: Próximas Partidas</option>
          <option value="2">Fixo: Mural de Resultados</option>
          <option value="3">Fixo: Patrocinadores</option>
          <option value="4">Fixo: Chaveamento (Mata-Mata)</option>
          <option value="5">Fixo: Classificação dos Grupos</option>
        </select>
        <label className="input-label">Tempo do Slide (segundos)</label>
        <input type="number" value={tvTime} onChange={e => setTvTime(e.target.value)} placeholder="Ex: 30" style={{ marginBottom: 20 }} />
        <button className="btn-primary" style={{ width: '100%', height: 50, marginTop: 10, fontWeight: 900 }} onClick={saveTvSettings}>APLICAR NA TV AGORA</button>
      </div>

      <div className="app-card"><label className="input-label">Novo Torneio</label><input value={newTName} onChange={e => setNewTName(e.target.value)} placeholder="Ex: Open Verão" /><button onClick={createTournament} className="btn-primary" style={{ width: '100%', height: 55 }}>Salvar Evento</button></div>
      
      {tournaments.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="app-card"><label className="input-label">Selecionar Torneio</label><select value={selectedT} onChange={e => setSelectedT(e.target.value)}><option value="">Escolha...</option>{tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          {selectedT && (
            <div style={{ display: 'grid', gap: 20 }}>
               <div className="app-card" style={{ border: '1px solid #D4AF37', background: 'rgba(212,175,55,0.05)' }}>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#D4AF37', fontWeight: 900, textAlign: 'center' }}>⚙️ REGRAS DO TORNEIO (EDITAR)</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 15, marginBottom: 25 }}>
                    <div><label className="input-label" style={{ fontSize: '0.65rem' }}>Máx Duplas/Cat</label><input type="number" value={tournamentSettings.max_pairs} onChange={e => setTournamentSettings({...tournamentSettings, max_pairs: Number(e.target.value)})} style={{ marginBottom: 0 }} /></div>
                    <div><label className="input-label" style={{ fontSize: '0.65rem' }}>Nº de Grupos</label><input type="number" value={tournamentSettings.num_groups} onChange={e => setTournamentSettings({...tournamentSettings, num_groups: Number(e.target.value)})} style={{ marginBottom: 0 }} /></div>
                    <div>
                       <label className="input-label" style={{ fontSize: '0.65rem' }}>Classificados</label>
                       <input type="number" value={tournamentSettings.classify_per_group} onChange={e => setTournamentSettings({...tournamentSettings, classify_per_group: Number(e.target.value)})} style={{ marginBottom: 0 }} />
                    </div>
                    <div>
                       <label className="input-label" style={{ fontSize: '0.65rem' }}>Critério de Desempate</label>
                       <select value={tournamentSettings.ranking_criteria} onChange={e => setTournamentSettings({...tournamentSettings, ranking_criteria: e.target.value})} style={{ marginBottom: 0, fontSize: '0.8rem' }}>
                         <option value="wins_balance_pro">1. Vitórias | 2. Saldo | 3. Pró</option>
                         <option value="wins_direct_balance">1. Vitórias | 2. C. Direto | 3. Saldo</option>
                       </select>
                    </div>
                    <div>
                       <label className="input-label" style={{ fontSize: '0.65rem' }}>Formato Mata-Mata</label>
                       <select value={tournamentSettings.bracket_type} onChange={e => setTournamentSettings({...tournamentSettings, bracket_type: e.target.value})} style={{ marginBottom: 0, fontSize: '0.8rem' }}>
                         <option value="cross_seed">Cruzado (1ºA x 2ºB)</option>
                         <option value="direct_seed">Direto (1ºA x 2ºA)</option>
                       </select>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', height: 60, background: '#D4AF37', color: '#000', fontWeight: 900 }} onClick={saveTournamentSettings}>SALVAR REGRAS DO EVENTO</button>
                  <p style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: 15, textAlign: 'center' }}>Essas regras serão aplicadas automaticamente em todas as categorias deste torneio.</p>
               </div>

              <div className="app-card"><label className="input-label">Nova Categoria</label><div style={{ display: 'flex', gap: 10 }}><input value={newCName} onChange={e => setNewCName(e.target.value)} placeholder="Ex: Masculino A" style={{ marginBottom: 0 }} /><button onClick={createCategory} className="btn-primary" style={{ padding: '0 25px' }}><PlusCircle /></button></div></div>
              <div className="app-card"><label className="input-label">Nova Quadra</label><div style={{ display: 'flex', gap: 10 }}><input value={newCourtName} onChange={e => setNewCourtName(e.target.value)} placeholder="Ex: Quadra 01" style={{ marginBottom: 0 }} /><button onClick={createCourt} className="btn-primary" style={{ padding: '0 25px' }}><MapPin /></button></div></div>
              
              <div className="app-card" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Patrocinadores (Logos)</label>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <input value={newSponsor.name} onChange={e => setNewSponsor({...newSponsor, name: e.target.value})} placeholder="Marca" style={{ marginBottom: 0 }} />
                  <input value={newSponsor.logo_url} onChange={e => setNewSponsor({...newSponsor, logo_url: e.target.value})} placeholder="URL Logo" style={{ marginBottom: 0 }} />
                  <button onClick={createSponsor} className="btn-primary" style={{ padding: '0 25px' }}><PlusCircle /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 15 }}>
                  {sponsors.map(s => (
                    <div key={s.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 10, border: '1px solid #333', position: 'relative' }}>
                      <img src={s.logo_url} alt={s.name} style={{ width: '100%', height: 60, objectFit: 'contain', marginBottom: 5 }} />
                      <div style={{ fontSize: '0.6rem', textAlign: 'center', opacity: 0.5 }}>{s.name}</div>
                      <button onClick={async () => { await supabase.from('sponsors').delete().eq('id', s.id); loadData(); }} style={{ position: 'absolute', top: 5, right: 5, background: 'red', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', border: 'none' }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
