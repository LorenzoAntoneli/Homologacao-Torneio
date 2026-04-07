import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { Search, Trophy, Clock, MapPin, ChevronDown, ChevronUp, Star, Users, Swords, BarChart3, Medal } from 'lucide-react';
import logo from './assets/logo.jpg';

export default function PlayerPortal() {
  const [searchName, setSearchName] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [matches, setMatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [courts, setCourts] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('meus-jogos');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tRes, cRes, pRes, coRes, mRes] = await Promise.all([
        supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('pairs').select('*'),
        supabase.from('courts').select('*'),
        supabase.from('matches').select('*').order('scheduled_time', { ascending: true })
      ]);

      setTournaments(tRes.data || []);
      setCategories(cRes.data || []);
      setPairs(pRes.data || []);
      setCourts(coRes.data || []);

      const catMap = {};
      (cRes.data || []).forEach(c => catMap[c.id] = c);
      const pairMap = {};
      (pRes.data || []).forEach(p => pairMap[p.id] = p);
      const courtMap = {};
      (coRes.data || []).forEach(c => courtMap[c.id] = c);

      const formatted = (mRes.data || []).map(m => ({
        ...m,
        pair1_name: pairMap[m.pair1_id]?.name || '?',
        pair2_name: pairMap[m.pair2_id]?.name || '?',
        winner_name: pairMap[m.winner_id]?.name || '?',
        category_name: catMap[m.category_id]?.name || 'Geral',
        court_name: courtMap[m.court_id]?.name || 'A definir'
      }));

      setMatches(formatted);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Real-time updates
    const ch = supabase.channel('player_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => loadData())
      .on('broadcast', { event: 'sync_data' }, () => loadData())
      .on('broadcast', { event: 'match_finished' }, () => loadData())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchName.trim().toLowerCase());
  };

  // Find all pairs that match the player's name
  const myPairs = useMemo(() => {
    if (!activeSearch) return [];
    return pairs.filter(p =>
      p.name.toLowerCase().includes(activeSearch)
    );
  }, [pairs, activeSearch]);

  const myPairIds = useMemo(() => new Set(myPairs.map(p => p.id)), [myPairs]);

  // My matches
  const myMatches = useMemo(() => {
    return matches.filter(m =>
      myPairIds.has(m.pair1_id) || myPairIds.has(m.pair2_id)
    );
  }, [matches, myPairIds]);

  const myPending = myMatches.filter(m => m.status !== 'finished');
  const myFinished = myMatches.filter(m => m.status === 'finished');

  // Calculate group standings for categories where the player participates
  const playerCategories = useMemo(() => {
    const catIds = [...new Set(myPairs.map(p => p.category_id))];
    return categories.filter(c => catIds.includes(c.id));
  }, [myPairs, categories]);

  const calculateStandings = (catId) => {
    const catMatches = matches.filter(m => m.category_id === catId && m.status === 'finished' && m.stage && m.stage.startsWith('Grupo'));
    const catPairs = pairs.filter(p => p.category_id === catId);

    const stats = {};
    catPairs.forEach(p => {
      stats[p.id] = { id: p.id, name: p.name, wins: 0, gp: 0, gc: 0, balance: 0, matches: 0 };
    });

    catMatches.forEach(m => {
      if (!stats[m.pair1_id] || !stats[m.pair2_id]) return;
      stats[m.pair1_id].matches++;
      stats[m.pair2_id].matches++;
      stats[m.pair1_id].gp += m.pair1_games;
      stats[m.pair1_id].gc += m.pair2_games;
      stats[m.pair2_id].gp += m.pair2_games;
      stats[m.pair2_id].gc += m.pair1_games;
      if (m.winner_id) stats[m.winner_id].wins++;
    });

    Object.values(stats).forEach(s => s.balance = s.gp - s.gc);

    const sorted = Object.values(stats).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.balance !== a.balance) return b.balance - a.balance;
      return b.gp - a.gp;
    });

    // Group by stage name
    const distinctGroups = [...new Set(matches.filter(m => m.category_id === catId && m.stage && m.stage.startsWith('Grupo')).map(m => m.stage))];
    const finalGroups = {};
    distinctGroups.forEach(gName => {
      const pairIdsInGroup = [...new Set(matches.filter(m => m.stage === gName && m.category_id === catId).flatMap(m => [m.pair1_id, m.pair2_id]))];
      finalGroups[gName] = sorted.filter(s => pairIdsInGroup.includes(s.id));
    });

    return finalGroups;
  };

  // All standings for all categories (for the "Classificação" tab)
  const allStandings = useMemo(() => {
    const result = {};
    const relevantCatIds = [...new Set(matches.filter(m => m.stage && m.stage.startsWith('Grupo')).map(m => m.category_id))];
    relevantCatIds.forEach(catId => {
      const cat = categories.find(c => c.id === catId);
      if (cat) result[catId] = { name: cat.name, groups: calculateStandings(catId) };
    });
    return result;
  }, [matches, categories, pairs]);

  // Bracket data for "Chave" tab
  const bracketData = useMemo(() => {
    const bracketMatches = matches.filter(m => m.stage && !m.stage.startsWith('Grupo'));
    const byCat = {};
    bracketMatches.forEach(m => {
      if (!byCat[m.category_id]) byCat[m.category_id] = [];
      byCat[m.category_id].push(m);
    });
    return byCat;
  }, [matches]);

  const getPlayerPosition = (catId) => {
    const standings = calculateStandings(catId);
    for (const [groupName, teams] of Object.entries(standings)) {
      const idx = teams.findIndex(t => myPairIds.has(t.id));
      if (idx !== -1) return { group: groupName, position: idx + 1, total: teams.length, stats: teams[idx] };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="player-portal">
        <div className="player-loading">
          <div className="player-loading-spinner"></div>
          <p>Carregando torneio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-portal">
      {/* Header */}
      <header className="player-header">
        <img src={logo} alt="Logo" className="player-logo" />
        <div className="player-header-text">
          <h1>CARECA'S BEACH CLUB</h1>
          <span className="player-subtitle">Portal do Jogador</span>
        </div>
      </header>

      {/* Search Bar */}
      <form className="player-search-form" onSubmit={handleSearch}>
        <div className="player-search-wrapper">
          <Search size={20} className="player-search-icon" />
          <input
            type="text"
            placeholder="Digite seu nome..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="player-search-input"
          />
        </div>
        <button type="submit" className="player-search-btn">BUSCAR</button>
      </form>

      {/* Tabs */}
      <div className="player-tabs">
        <button
          className={`player-tab ${activeTab === 'meus-jogos' ? 'active' : ''}`}
          onClick={() => setActiveTab('meus-jogos')}
        >
          <Swords size={16} />
          <span>Meus Jogos</span>
        </button>
        <button
          className={`player-tab ${activeTab === 'classificacao' ? 'active' : ''}`}
          onClick={() => setActiveTab('classificacao')}
        >
          <BarChart3 size={16} />
          <span>Grupos</span>
        </button>
        <button
          className={`player-tab ${activeTab === 'chave' ? 'active' : ''}`}
          onClick={() => setActiveTab('chave')}
        >
          <Trophy size={16} />
          <span>Chave</span>
        </button>
      </div>

      {/* Content */}
      <div className="player-content">

        {/* TAB: Meus Jogos */}
        {activeTab === 'meus-jogos' && (
          <>
            {!activeSearch ? (
              <div className="player-empty-state">
                <Users size={60} strokeWidth={1} />
                <h3>Busque seu nome</h3>
                <p>Digite seu nome acima para ver seus jogos, classificação e posição no torneio.</p>
              </div>
            ) : myPairs.length === 0 ? (
              <div className="player-empty-state">
                <Search size={60} strokeWidth={1} />
                <h3>Jogador não encontrado</h3>
                <p>Nenhuma dupla encontrada com o nome "<strong>{activeSearch}</strong>".</p>
              </div>
            ) : (
              <>
                {/* Player Info Cards */}
                {myPairs.map(pair => {
                  const cat = categories.find(c => c.id === pair.category_id);
                  const pos = getPlayerPosition(pair.category_id);
                  return (
                    <div key={pair.id} className="player-info-card">
                      <div className="player-info-badge">
                        <Medal size={18} />
                        <span>{cat?.name || 'Categoria'}</span>
                      </div>
                      <h3 className="player-info-name">{pair.name}</h3>
                      {pos && (
                        <div className="player-position-row">
                          <div className="player-position-item">
                            <span className="pos-label">Grupo</span>
                            <span className="pos-value">{pos.group.replace('Grupo ', '')}</span>
                          </div>
                          <div className="player-position-item">
                            <span className="pos-label">Posição</span>
                            <span className="pos-value highlight">{pos.position}º</span>
                          </div>
                          <div className="player-position-item">
                            <span className="pos-label">Vitórias</span>
                            <span className="pos-value">{pos.stats.wins}</span>
                          </div>
                          <div className="player-position-item">
                            <span className="pos-label">Saldo</span>
                            <span className="pos-value">{pos.stats.balance > 0 ? '+' : ''}{pos.stats.balance}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Próximos Jogos */}
                {myPending.length > 0 && (
                  <div className="player-section">
                    <h2 className="player-section-title">
                      <Clock size={18} />
                      Próximos Jogos
                    </h2>
                    {myPending.map(m => (
                      <div
                        key={m.id}
                        className="player-match-card pending"
                      >
                        <div className="player-match-category">{m.category_name} {m.stage ? `• ${m.stage}` : ''}</div>
                        <div className="player-match-teams">
                          <span className={myPairIds.has(m.pair1_id) ? 'my-team' : ''}>{m.pair1_name}</span>
                          <span className="vs">VS</span>
                          <span className={myPairIds.has(m.pair2_id) ? 'my-team' : ''}>{m.pair2_name}</span>
                        </div>
                        <div className="player-match-info">
                          {m.court_name !== 'A definir' && (
                            <div className="player-match-detail">
                              <MapPin size={14} />
                              <span>{m.court_name}</span>
                            </div>
                          )}
                          {m.scheduled_time && (
                            <div className="player-match-detail">
                              <Clock size={14} />
                              <span>{m.scheduled_time.substring(0, 5)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resultados */}
                {myFinished.length > 0 && (
                  <div className="player-section">
                    <h2 className="player-section-title">
                      <Trophy size={18} />
                      Resultados
                    </h2>
                    {myFinished.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).map(m => {
                      const myWin = myPairIds.has(m.winner_id);
                      return (
                        <div
                          key={m.id}
                          className={`player-match-card finished ${myWin ? 'win' : 'loss'}`}
                        >
                          <div className="player-match-status-badge">
                            {myWin ? '✅ VITÓRIA' : '❌ DERROTA'}
                          </div>
                          <div className="player-match-category">{m.category_name} {m.stage ? `• ${m.stage}` : ''}</div>
                          <div className="player-match-score-row">
                            <div className={`player-score-team ${m.winner_id === m.pair1_id ? 'winner' : ''}`}>
                              <span className="team-name">{m.pair1_name}</span>
                              <span className="team-score">{m.pair1_games}</span>
                            </div>
                            <div className={`player-score-team ${m.winner_id === m.pair2_id ? 'winner' : ''}`}>
                              <span className="team-name">{m.pair2_name}</span>
                              <span className="team-score">{m.pair2_games}</span>
                            </div>
                          </div>
                          {(m.pair1_tiebreak > 0 || m.pair2_tiebreak > 0) && (
                            <div className="player-tiebreak">
                              Tie-break: {m.pair1_tiebreak} - {m.pair2_tiebreak}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {myPending.length === 0 && myFinished.length === 0 && (
                  <div className="player-empty-state small">
                    <Swords size={40} strokeWidth={1} />
                    <p>Nenhum jogo registrado ainda para suas duplas.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* TAB: Classificação */}
        {activeTab === 'classificacao' && (
          <>
            <h2 className="player-section-title center">
              <BarChart3 size={18} />
              Classificação por Grupos
            </h2>
            {Object.keys(allStandings).length === 0 ? (
              <div className="player-empty-state small">
                <BarChart3 size={40} strokeWidth={1} />
                <p>Nenhum grupo ativo no momento.</p>
              </div>
            ) : (
              Object.entries(allStandings).map(([catId, catData]) => (
                <div key={catId} className="player-category-section">
                  <div
                    className="player-category-header"
                    onClick={() => setExpandedGroup(expandedGroup === catId ? null : catId)}
                  >
                    <div className="player-category-name">
                      <Star size={16} />
                      {catData.name}
                    </div>
                    {expandedGroup === catId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedGroup === catId && (
                    <div className="player-groups-container">
                      {Object.entries(catData.groups).sort((a, b) => a[0].localeCompare(b[0])).map(([groupName, teams]) => (
                        <div key={groupName} className="player-group-card">
                          <div className="player-group-name">{groupName}</div>
                          <table className="player-standings-table">
                            <thead>
                              <tr>
                                <th className="pos-col">#</th>
                                <th className="name-col">Dupla</th>
                                <th>V</th>
                                <th>S</th>
                                <th>GP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teams.map((t, idx) => (
                                <tr
                                  key={t.id}
                                  className={`${idx < 2 ? 'qualified' : ''} ${myPairIds.has(t.id) ? 'mine' : ''}`}
                                >
                                  <td className="pos-col">{idx + 1}</td>
                                  <td className="name-col">{t.name}</td>
                                  <td>{t.wins}</td>
                                  <td>{t.balance > 0 ? '+' : ''}{t.balance}</td>
                                  <td>{t.gp}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* TAB: Chave Mata-Mata */}
        {activeTab === 'chave' && (
          <>
            <h2 className="player-section-title center">
              <Trophy size={18} />
              Chave Mata-Mata
            </h2>
            {Object.keys(bracketData).length === 0 ? (
              <div className="player-empty-state small">
                <Trophy size={40} strokeWidth={1} />
                <p>Nenhuma chave de mata-mata gerada ainda.</p>
              </div>
            ) : (
              Object.entries(bracketData).map(([catId, catMatches]) => {
                const cat = categories.find(c => c.id === catId);
                const rounds = ['Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final'];
                return (
                  <div key={catId} className="player-bracket-category">
                    <div className="player-bracket-cat-name">
                      <Star size={16} />
                      {cat?.name || 'Categoria'}
                    </div>
                    {rounds.map(round => {
                      const roundMatches = catMatches.filter(m => m.stage === round).sort((a, b) => a.id.localeCompare(b.id));
                      if (roundMatches.length === 0) return null;
                      return (
                        <div key={round} className="player-bracket-round">
                          <div className="player-bracket-round-name">{round}</div>
                          <div className="player-bracket-matches">
                            {roundMatches.map(m => {
                              const isMyMatch = myPairIds.has(m.pair1_id) || myPairIds.has(m.pair2_id);
                              return (
                                <div
                                  key={m.id}
                                  className={`player-bracket-match ${isMyMatch ? 'mine' : ''} ${m.status === 'finished' ? 'finished' : ''}`}
                                >
                                  <div className={`bracket-team ${m.winner_id === m.pair1_id ? 'winner' : ''} ${myPairIds.has(m.pair1_id) ? 'my-team' : ''}`}>
                                    <span>{m.pair1_name || 'Aguardando...'}</span>
                                    {m.status === 'finished' && <span className="bracket-score">{m.pair1_games}</span>}
                                  </div>
                                  <div className={`bracket-team ${m.winner_id === m.pair2_id ? 'winner' : ''} ${myPairIds.has(m.pair2_id) ? 'my-team' : ''}`}>
                                    <span>{m.pair2_name || 'Aguardando...'}</span>
                                    {m.status === 'finished' && <span className="bracket-score">{m.pair2_games}</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="player-footer">
        <p>Atualização em tempo real • Careca's Beach Club © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
