import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './Brackets.module.css';

export default function Brackets() {
  const { 
    selectedT, setSelectedT, tournaments,
    selectedC, setSelectedC, categories,
    hasMatches, tournamentSettings, pairs,
    manualSlots, setManualSlots, groupType, setGroupType, generateGroups,
    isGenerating, saveGroups, resetCategoryMatches,
    calculateStandings,
    generateAutoBracket, bracketSize, setBracketSize, generateManualBracket
  } = useAdmin();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
      <h1 className="section-title">Chaveamento do Torneio</h1>
      
      <div className="app-card" style={{ marginBottom: 30 }}>
        <label className="input-label">1. Selecione a Categoria</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
          <select value={selectedT} onChange={e => setSelectedT(e.target.value)}>
            <option value="">Torneio...</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={selectedC} onChange={e => setSelectedC(e.target.value)}>
            <option value="">Categoria...</option>
            {categories.filter(c => c.tournament_id === selectedT).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {selectedC && (
          <>
            {!hasMatches ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 15, border: '1px solid #333' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 15, marginBottom: 20 }}>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>LIMITE CATEGORIA</div>
                    <div style={{ fontWeight: 900, color: 'var(--accent-primary)' }}>{tournamentSettings.max_pairs} DUPLAS</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>GRUPOS</div>
                    <div style={{ fontWeight: 900, color: '#fff' }}>{tournamentSettings.num_groups}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>CLASSIFICAÇÃO</div>
                    <div style={{ fontWeight: 900, color: '#D4AF37' }}>{tournamentSettings.classify_per_group} POR GRUPO</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-primary" style={{ flex: 1, height: 50, fontSize: '0.8rem', background: groupType === 'manual' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: groupType === 'manual' ? '#000' : '#fff' }} onClick={() => setGroupType('manual')}>MONTAR MANUAL</button>
                  <button className="btn-primary" style={{ flex: 1, height: 50, fontSize: '0.8rem', border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)' }} onClick={generateGroups}>SORTEIO ALEATÓRIO</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={resetCategoryMatches} style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '10px 20px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>
                  🔄 RECOMEÇAR / LIMPAR ESTA CATEGORIA
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedC && hasMatches && (
        <>
          {/* TABELA DE CLASSIFICAÇÃO EM TEMPO REAL */}
          <div style={{ marginBottom: 40, marginTop: 20 }}>
            <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: 20, textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: 10 }}>📊 Tabela de Classificação (Fase de Grupos)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 15 }}>
              {Object.entries(calculateStandings(selectedC)).map(([gName, teams]) => (
                <div key={gName} className="app-card" style={{ padding: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight: 900, color: 'var(--accent-primary)', fontSize: '0.8rem', marginBottom: 10, textAlign: 'center' }}>{gName}</div>
                  <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ opacity: 0.5, textAlign: 'left' }}>
                        <th style={{ padding: '5px' }}>Dupla</th>
                        <th style={{ textAlign: 'center' }}>V</th>
                        <th style={{ textAlign: 'center' }}>Saldo</th>
                        <th style={{ textAlign: 'center' }}>GP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((t, idx) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx < (tournamentSettings.classify_per_group || 2) ? 'rgba(39,174,96,0.05)' : 'transparent' }}>
                          <td style={{ padding: '8px 5px', fontWeight: idx < (tournamentSettings.classify_per_group || 2) ? 700 : 400 }}>{t.name}</td>
                          <td style={{ textAlign: 'center', fontWeight: 900 }}>{t.wins}</td>
                          <td style={{ textAlign: 'center' }}>{t.balance}</td>
                          <td style={{ textAlign: 'center' }}>{t.gp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* GERAR MATA-MATA (INTELIGENTE) */}
          <div style={{ padding: 25, borderRadius: 20, border: '2px solid #D4AF37', background: 'rgba(212,175,55,0.05)', marginBottom: 50 }}>
            <label className="input-label" style={{ color: '#D4AF37', fontWeight: 900 }}>⚡ GERAR MATA-MATA (INTELIGENTE)</label>
            <p style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: 20 }}>Esta opção pegará os classificados da tabela acima e montará as chaves automaticamente.</p>
            <button 
              className="btn-primary" 
              style={{ width: '100%', height: 60, background: '#D4AF37', color: '#000', fontWeight: 900 }} 
              onClick={generateAutoBracket}
              disabled={isGenerating}
            >
              CRIAR CHAVES COM OS VENCEDORES
            </button>
            
            <div style={{ marginTop: 25, borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: 20 }}>
              <label className="input-label" style={{ opacity: 0.5, fontSize: '0.6rem' }}>Opção Manual (Vazia)</label>
              <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <input type="number" value={bracketSize} onChange={e => setBracketSize(e.target.value)} placeholder="Ex: 8" style={{ width: 100, marginBottom: 0 }} />
                <button className="btn-primary" style={{ flex: 1, height: 60, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #333' }} onClick={generateManualBracket}>GERAR CHAVE VAZIA</button>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedC && !hasMatches && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 40, marginTop: 40 }}>
            {Array.from({ length: tournamentSettings.num_groups }).map((_, gIdx) => {
              const letter = String.fromCharCode(65 + gIdx);
              const categoryPairs = pairs.filter(p => p.category_id === selectedC);
              const maxSlotsPossible = Math.ceil(tournamentSettings.max_pairs / tournamentSettings.num_groups);
              return (
                <div key={letter} className="app-card" style={{ border: '1px solid #333', background: 'rgba(0,0,0,0.2)' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: 15, textAlign: 'center', letterSpacing: 2 }}>GRUPO {letter}</h3>
                  {Array.from({ length: maxSlotsPossible }).map((_, sIdx) => {
                    const slotNum = sIdx + 1;
                    const slotKey = `${letter}${slotNum}`;
                    return (
                      <div key={slotKey} style={{ marginBottom: 10 }}>
                        <select 
                          value={manualSlots[slotKey] || ''} 
                          onChange={e => setManualSlots({...manualSlots, [slotKey]: e.target.value})}
                          style={{ fontSize: '0.75rem', padding: '10px' }}
                        >
                          <option value="">-- Slot {slotNum} --</option>
                          {categoryPairs.map(p => {
                            const isTaken = Object.values(manualSlots).includes(p.id) && manualSlots[slotKey] !== p.id;
                            return <option key={p.id} value={p.id} disabled={isTaken}>{p.name} {isTaken ? '(Já escalada)' : ''}</option>
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', height: 65, marginBottom: 30, fontSize: '1rem', background: '#27ae60', borderColor: '#27ae60', color: '#fff' }} 
            onClick={saveGroups}
            disabled={isGenerating}
          >
            {isGenerating ? 'CRIANDO JOGOS...' : 'SALVAR GRUPOS E GERAR CONFRONTOS'}
          </button>
        </>
      )}
    </div>
  );
}
