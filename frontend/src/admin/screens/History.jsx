import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './History.module.css';
import { Pencil } from 'lucide-react';

export default function History() {
  const { matches, startEdit } = useAdmin();

  return (
    <div>
      <h1 className="section-title">Partidas Encerradas</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {matches.filter(m => m.status === 'finished').map(m => (
          <div key={m.id} className="app-card" style={{ padding: '15px 20px', borderLeft: '4px solid var(--accent-primary)', marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 12, opacity: 0.6, letterSpacing: 1 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                 <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{m.stage?.startsWith('Grupo') ? `GRUPO: ${m.stage}` : m.stage?.toUpperCase() || 'AMISTOSO'}</span>
                 <span>{m.category?.name} • {m.court?.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => startEdit(m)}><Pencil size={14} /></span>
                <span>{new Date(m.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* DUPLA 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: m.winner_id === m.pair1_id ? 900 : 400, color: m.winner_id === m.pair1_id ? '#fff' : '#888', flex: 1, paddingRight: 10, lineHeight: 1.2 }}>
                  {m.pair1?.name}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-primary)', minWidth: 40, textAlign: 'right' }}>
                  {m.pair1_games}
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2px 0' }}></div>

              {/* DUPLA 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: m.winner_id === m.pair2_id ? 900 : 400, color: m.winner_id === m.pair2_id ? '#fff' : '#888', flex: 1, paddingRight: 10, lineHeight: 1.2 }}>
                  {m.pair2?.name}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-primary)', minWidth: 40, textAlign: 'right' }}>
                  {m.pair2_games}
                </div>
              </div>
            </div>

            {(m.pair1_tiebreak > 0 || m.pair2_tiebreak > 0) && (
              <div style={{ textAlign: 'right', fontSize: '0.65rem', opacity: 0.3, marginTop: 8, fontStyle: 'italic' }}>
                Pts Tie-break: ({m.pair1_tiebreak} - {m.pair2_tiebreak})
              </div>
            )}
          </div>
        ))}
        {matches.filter(m => m.status === 'finished').length === 0 && <p style={{ textAlign: 'center', opacity: 0.2, padding: 100 }}>Nenhum resultado registrado ainda.</p>}
      </div>
    </div>
  );
}
