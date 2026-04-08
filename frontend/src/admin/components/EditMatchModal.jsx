import React from 'react';
import { useAdmin } from '../context/AdminContext';

export default function EditMatchModal() {
  const { 
    editingMatch, setEditingMatch, 
    editP1, setEditP1, editP2, setEditP2, pairs,
    editCourt, setEditCourt, courts, editTime, setEditTime,
    editG1, setEditG1, editT1, setEditT1,
    editG2, setEditG2, editT2, setEditT2,
    editStatus, setEditStatus, saveEdit
  } = useAdmin();

  if (!editingMatch) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }}>
      <div className="app-card" style={{ width: '100%', maxWidth: 500, border: '1px solid #333' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: 20, fontSize: '1.2rem' }}>Editar Partida</h2>
        <label className="input-label">Duplas</label>
        <select value={editP1} onChange={e => setEditP1(e.target.value)} style={{ marginBottom: 10 }}>
          <option value="">A Definir (Automático)</option>
          {pairs.filter(p => p.category_id === editingMatch.category_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{ textAlign: 'center', fontWeight: 900, marginBottom: 10, color: 'var(--accent-primary)', fontSize: '0.7rem' }}>VERSUS</div>
        <select value={editP2} onChange={e => setEditP2(e.target.value)}>
          <option value="">A Definir (Automático)</option>
          {pairs.filter(p => p.category_id === editingMatch.category_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label className="input-label" style={{ marginTop: 20 }}>Quadra e Horário</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <select value={editCourt} onChange={e => setEditCourt(e.target.value)}>
            <option value="">Nenhuma</option>
            {courts.filter(c => c.tournament_id === editingMatch.tournament_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} />
        </div>

        <div style={{ borderTop: '1px solid #333', marginTop: 20, paddingTop: 20 }}>
          <label className="input-label">Resultado / Placar</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: 5 }}>DUPLA 1 (Games)</div>
              <input type="number" value={editG1} onChange={e => setEditG1(e.target.value)} placeholder="0" style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 900 }} />
              <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: 10 }}>Tie-break</div>
              <input type="number" value={editT1} onChange={e => setEditT1(e.target.value)} placeholder="0" style={{ textAlign: 'center', fontSize: '0.9rem' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: 5 }}>DUPLA 2 (Games)</div>
              <input type="number" value={editG2} onChange={e => setEditG2(e.target.value)} placeholder="0" style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 900 }} />
              <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: 10 }}>Tie-break</div>
              <input type="number" value={editT2} onChange={e => setEditT2(e.target.value)} placeholder="0" style={{ textAlign: 'center', fontSize: '0.9rem' }} />
            </div>
          </div>

          <label className="input-label">Status da Partida</label>
          <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
            <option value="pending">🟡 Pendente / Em Andamento</option>
            <option value="finished">🟢 Encerrada / Finalizada</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: 12, marginTop: 30 }}>
          <button className="btn-primary" style={{ width: '100%', height: 60 }} onClick={saveEdit}>SALVAR ALTERAÇÕES</button>
          <button className="btn-primary" style={{ width: '100%', height: 60, background: 'rgba(255,255,255,0.05)', color: '#888' }} onClick={() => setEditingMatch(null)}>VOLTAR / CANCELAR</button>
        </div>
      </div>
    </div>
  );
}
