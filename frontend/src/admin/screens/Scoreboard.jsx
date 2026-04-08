import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './Scoreboard.module.css';
import { Volume2, Pencil, Trash2 } from 'lucide-react';

export default function Scoreboard() {
  const { 
    matches, scoreSearch, setScoreSearch, scoreCat, setScoreCat, 
    categories, selectedT, forceCallMatch, startEdit, deleteMatch, finishMatch 
  } = useAdmin();

  return (
    <div>
      <h1 className="section-title">Em Quadra / Próximos</h1>
      
      {/* Filtros de Busca */}
      <div className="app-card" style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 15 }}>
        <div>
          <label className="input-label" style={{ fontSize: '0.65rem' }}>Filtrar por Categoria</label>
          <select value={scoreCat} onChange={e => setScoreCat(e.target.value)} style={{ marginBottom: 0, fontSize: '0.8rem' }}>
            <option value="">Todas as Categorias</option>
            {categories.filter(c => c.tournament_id === selectedT).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label" style={{ fontSize: '0.65rem' }}>Buscar Dupla</label>
          <input 
            placeholder="Nome do atleta..." 
            value={scoreSearch} 
            onChange={e => setScoreSearch(e.target.value)} 
            style={{ marginBottom: 0, fontSize: '0.8rem' }}
          />
        </div>
      </div>

       <p style={{ opacity: 0.5, fontSize: '0.8rem', textAlign: 'center', marginBottom: 20 }}>Edite (no Lápis) para definir quadra/horário.</p>
      
      {matches
        .filter(m => m.status !== 'finished' && m.pair1_id && m.pair2_id)
        .filter(m => !scoreCat || m.category_id === scoreCat)
        .filter(m => {
          if (!scoreSearch) return true;
          const search = scoreSearch.toLowerCase();
          return m.pair1?.name?.toLowerCase().includes(search) || m.pair2?.name?.toLowerCase().includes(search);
        })
        .map(m => (
        <div key={m.id} className="app-card" style={{ borderLeftColor: 'var(--accent-primary)', paddingTop: 10 }}>
          {/* Barra de Topo do Card (Ações) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 5px 10px 0', gap: 8 }}>
            <button
              onClick={() => forceCallMatch(m)}
              title="Chamar na TV Agora"
              style={{ background: 'rgba(212,175,55,0.1)', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Volume2 size={18} />
            </button>
            <button
              onClick={() => startEdit(m)}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => deleteMatch(m.id)}
              style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {m.stage && (
              <div style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: 3, background: 'rgba(212,175,55,0.1)', padding: '5px 15px', borderRadius: 20 }}>
                {m.stage.startsWith('Grupo') ? `Fase de Grupos • ${m.stage}` : m.stage}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="cat-badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>{m.category?.name || 'Geral'}</span>
              {m.court && <span className="cat-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>{m.court.name}</span>}
              {m.scheduled_time && <span className="cat-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>{m.scheduled_time}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 25 }}>
            <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontWeight: 800, marginBottom: 10, fontSize: '0.9rem', height: '2rem' }}>{m.pair1?.name}</div><input id={`g1-${m.id}`} type="number" placeholder="0" style={{ width: 80, height: 80, textAlign: 'center', fontSize: '2rem', fontWeight: 900, marginBottom: 0, background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, color: '#fff' }} /></div>
            <div style={{ fontSize: '1.5rem', opacity: 0.3, fontWeight: 900 }}>X</div>
            <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontWeight: 800, marginBottom: 10, fontSize: '0.9rem', height: '2rem' }}>{m.pair2?.name}</div><input id={`g2-${m.id}`} type="number" placeholder="0" style={{ width: 80, height: 80, textAlign: 'center', fontSize: '2rem', fontWeight: 900, marginBottom: 0, background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, color: '#fff' }} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, opacity: 0.6, marginBottom: 20 }}>
            <div><div style={{ fontSize: '0.6rem', textAlign: 'center', fontWeight: 900 }}>TB Pts</div><input id={`t1-${m.id}`} type="number" style={{ width: 60, padding: 8, textAlign: 'center', marginBottom: 0, background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff' }} /></div>
            <div style={{ alignSelf: 'flex-end', paddingBottom: 10 }}>-</div>
            <div><div style={{ fontSize: '0.6rem', textAlign: 'center', fontWeight: 900 }}>TB Pts</div><input id={`t2-${m.id}`} type="number" style={{ width: 60, padding: 8, textAlign: 'center', marginBottom: 0, background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff' }} /></div>
          </div>
          <button className="btn-primary" style={{ width: '100%', height: 60 }} onClick={() => {
            const g1 = document.getElementById(`g1-${m.id}`).value;
            const g2 = document.getElementById(`g2-${m.id}`).value;
            const t1 = document.getElementById(`t1-${m.id}`).value;
            const t2 = document.getElementById(`t2-${m.id}`).value;
            if (g1 === '' || g2 === '') return alert('Games Mandatórios!');
            finishMatch(m, g1, g2, t1, t2);
          }}>Lançar Placar</button>
        </div>
      ))}
      {matches.filter(m => m.status !== 'finished' && m.pair1_id && m.pair2_id).length === 0 && <p className={styles.emptyMessage}>Nenhum jogo aguardando placar no momento.</p>}
    </div>
  );
}
