import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './Pairs.module.css';

export default function Pairs() {
  const { 
    selectedT, setSelectedT, tournaments,
    selectedC, setSelectedC, categories,
    atleta1, setAtleta1, atleta2, setAtleta2, createPair
  } = useAdmin();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 className="section-title">Criar Duplas</h1>
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
          <div style={{ display: 'grid', gap: 10 }}>
            <label className="input-label">Nomes dos Atletas</label>
            <input placeholder="Atleta 1" value={atleta1} onChange={e => setAtleta1(e.target.value)} />
            <input placeholder="Atleta 2" value={atleta2} onChange={e => setAtleta2(e.target.value)} />
            <button onClick={createPair} className="btn-primary" style={{ width: '100%', height: 55 }}>
              REGISTRAR DUPLA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
