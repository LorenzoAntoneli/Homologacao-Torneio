import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './Matches.module.css';

export default function Matches() {
  const { 
    selectedT, setSelectedT, tournaments,
    selectedC, setSelectedC, categories,
    matchP1, setMatchP1, matchP2, setMatchP2, pairs,
    matchCourt, setMatchCourt, matchTime, setMatchTime, courts,
    createMatch
  } = useAdmin();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 className="section-title">Agendar Jogos</h1>
      <div className="app-card">
        <label className="input-label">Torneio e Categoria</label>
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          <select value={selectedT} onChange={e => setSelectedT(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">Torneio...</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={selectedC} onChange={e => setSelectedC(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">Categoria...</option>
            {categories.filter(c => c.tournament_id === selectedT).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedC && (
          <>
            <label className="input-label">Escolher Confronto</label>
            <select value={matchP1} onChange={e => setMatchP1(e.target.value)} style={{ marginBottom: 10 }}>
              <option value="">Selecione Dupla 1</option>
              {pairs.filter(p => p.category_id === selectedC).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div style={{ textAlign: 'center', fontWeight: 900, marginBottom: 10, color: 'var(--accent-primary)', fontSize: '0.7rem' }}>VERSUS</div>
            <select value={matchP2} onChange={e => setMatchP2(e.target.value)}>
              <option value="">Selecione Dupla 2</option>
              {pairs.filter(p => p.category_id === selectedC).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <label className="input-label" style={{ marginTop: 20 }}>Informações de Quadra</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <select value={matchCourt} onChange={e => setMatchCourt(e.target.value)}>
                <option value="">Quadra...</option>
                {courts.filter(c => c.tournament_id === selectedT).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)} />
            </div>

            <button onClick={createMatch} className="btn-primary" style={{ width: '100%', height: 60, marginTop: 10 }}>GERAR JOGO E QUADRA</button>
          </>
        )}
      </div>
    </div>
  );
}
