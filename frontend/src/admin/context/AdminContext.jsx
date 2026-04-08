import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../supabase';
import * as XLSX from 'xlsx';
import { Swords, LogOut, Monitor, PlusCircle, UserPlus, Gamepad2, Settings, MapPin, LayoutList, Trash2, Pencil, Volume2, Network, FileSpreadsheet, Download, Upload, Smartphone } from 'lucide-react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // Session & UI state
  const [session, setSession] = useState(localStorage.getItem('bt_session'));
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('scoreboard');

  // Database states
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [courts, setCourts] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  // Form states
  const [selectedT, setSelectedT] = useState(localStorage.getItem('bt_selectedT') || '');
  const [selectedC, setSelectedC] = useState(localStorage.getItem('bt_selectedC') || '');
  const [newTName, setNewTName] = useState('');
  const [newCName, setNewCName] = useState('');
  const [newCourtName, setNewCourtName] = useState('');
  const [newSponsor, setNewSponsor] = useState({ name: '', logo_url: '' });
  const [atleta1, setAtleta1] = useState('');
  const [atleta2, setAtleta2] = useState('');
  const [matchP1, setMatchP1] = useState('');
  const [matchP2, setMatchP2] = useState('');
  const [matchCourt, setMatchCourt] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [elevenKey, setElevenKey] = useState(import.meta.env.VITE_ELEVENLABS_KEY || '');
  const [voiceKey, setVoiceKey] = useState('');
  const [tvMode, setTvMode] = useState('auto');
  const [tvTime, setTvTime] = useState(30);
  const [bracketSize, setBracketSize] = useState('8');

  // Edit states
  const [editingMatch, setEditingMatch] = useState(null);
  const [editP1, setEditP1] = useState('');
  const [editP2, setEditP2] = useState('');
  const [editCourt, setEditCourt] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editG1, setEditG1] = useState('');
  const [editG2, setEditG2] = useState('');
  const [editT1, setEditT1] = useState('');
  const [editT2, setEditT2] = useState('');
  const [editStatus, setEditStatus] = useState('pending');

  // Scoreboard filters
  const [scoreSearch, setScoreSearch] = useState('');
  const [scoreCat, setScoreCat] = useState('');

  // Bracket/Groups states
  const [isGenerating, setIsGenerating] = useState(false);
  const [groupType, setGroupType] = useState('auto'); // 'auto' ou 'manual'
  const [manualSlots, setManualSlots] = useState({}); // { 'A1': pairId, 'A2': pairId... }

  // Import/Export states
  const [importData, setImportData] = useState(null);
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Dynamic tournament settings
  const [tournamentSettings, setTournamentSettings] = useState({
    max_pairs: 15,
    num_groups: 4,
    classify_per_group: 2,
    ranking_criteria: 'wins_balance_pro',
    bracket_type: 'cross_seed'
  });

  // Derived state – verifica se a categoria já tem partidas
  const hasMatches = useMemo(() => {
    if (!selectedC) return false;
    return (matches || []).some(m => m && m.category_id === selectedC);
  }, [matches, selectedC]);

  // Persistent TV channel
  const [tvChannel, setTvChannel] = useState(null);
  useEffect(() => {
    const ch = supabase.channel('tv_rt', { config: { broadcast: { self: true } } });
    ch.subscribe();
    setTvChannel(ch);
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (selectedT) localStorage.setItem('bt_selectedT', selectedT);
  }, [selectedT]);

  useEffect(() => {
    if (selectedC) localStorage.setItem('bt_selectedC', selectedC);
  }, [selectedC]);

  const notifyTV = (payload = {}) => {
    if (tvChannel) {
      tvChannel.send({ type: 'broadcast', event: 'sync_data', payload: { ts: Date.now(), ...payload } });
    }
  };

  const loadData = async () => {
    try {
      const { data: tData } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      const { data: cData } = await supabase.from('categories').select('*');
      const { data: pData } = await supabase.from('pairs').select('*');
      const { data: coData } = await supabase.from('courts').select('*');
      const { data: mData } = await supabase.from('matches').select('*').order('updated_at', { ascending: false });
      const { data: spData } = await supabase.from('sponsors').select('*').order('created_at', { ascending: true });

      setTournaments(tData || []);
      const catMap = {};
      (cData || []).forEach(c => catMap[c.id] = c);
      const pairMap = {};
      (pData || []).forEach(p => pairMap[p.id] = p);
      const courtMap = {};
      (coData || []).forEach(c => courtMap[c.id] = c);

      const formatted = (mData || []).map(m => ({
        ...m,
        pair1: pairMap[m.pair1_id],
        pair2: pairMap[m.pair2_id],
        category: catMap[m.category_id],
        court: courtMap[m.court_id],
        category_name: catMap[m.category_id]?.name || 'Geral'
      }));

      setMatches(formatted);
      setCategories(cData || []);
      setCourts(coData || []);
      setPairs(pData || []);
      setSponsors(spData || []);

      const { data: sData, error: sError } = await supabase.from('settings').select('*');
      if (sError) console.warn('Erro ao buscar configurações:', sError.message);
      // Cache local das configurações globais (keys, tv)
      if (sData) {
        const el = sData.find(s => s.id === 'elevenlabs_key');
        if (el) setElevenKey(el.value);
        const vr = sData.find(s => s.id === 'voicerss_key');
        if (vr) setVoiceKey(vr.value);
        const tv = sData.find(s => s.id === 'tv_settings');
        if (tv) {
          try {
            const p = JSON.parse(tv.value);
            setTvMode(p.mode || 'auto');
            setTvTime(p.time || 30);
          } catch (e) { }
        }
      }
    } catch (e) { console.error('Erro no carregamento:', e); }
  };

  // Sincroniza as configurações sempre que o torneio selecionado mudar
  useEffect(() => {
    if (selectedT && tournaments.length > 0) {
      const currentT = tournaments.find(t => t.id === selectedT);
      if (currentT) {
        setTournamentSettings({
          max_pairs: currentT.max_pairs ?? 15,
          num_groups: currentT.num_groups ?? 4,
          classify_per_group: currentT.classify_per_group ?? 2,
          ranking_criteria: currentT.ranking_criteria ?? 'wins_balance_pro',
          bracket_type: currentT.bracket_type ?? 'cross_seed'
        });
      }
    }
  }, [selectedT, tournaments]);

  const saveTournamentSettings = async () => {
    if (!selectedT) return alert('Selecione um torneio!');
    const { error } = await supabase.from('tournaments').update({ 
      max_pairs: tournamentSettings.max_pairs,
      num_groups: tournamentSettings.num_groups,
      classify_per_group: tournamentSettings.classify_per_group,
      ranking_criteria: tournamentSettings.ranking_criteria,
      bracket_type: tournamentSettings.bracket_type
    }).eq('id', selectedT);
    
    if (error) alert('Erro ao salvar no Supabase: ' + error.message);
    else { alert('✅ Configurações salvas diretamente no Torneio!'); await loadData(); }
  };

  useEffect(() => { if (session) loadData(); }, [session, selectedT, selectedC]);

  const handleLogin = (e) => { e.preventDefault(); if (password === 'admin123') { localStorage.setItem('bt_session', 'logged'); setSession('logged'); } else alert('Senha Incorreta!'); };
  const handleLogout = () => { localStorage.removeItem('bt_session'); setSession(null); };

  const finishMatch = async (match, g1, g2, t1, t2) => {
    let games1 = parseInt(g1);
    let games2 = parseInt(g2);
    const tb1 = t1 ? parseInt(t1) : 0;
    const tb2 = t2 ? parseInt(t2) : 0;
    if (games1 === 6 && games2 === 6) {
      if (tb1 === 0 && tb2 === 0) return alert('⚠️ No 6x6 você deve preencher os pontos do Tie-break!');
      if (tb1 === tb2) return alert('⚠️ O Tie-break não pode terminar empatado!');
      if (tb1 > tb2) games1 = 7; else games2 = 7;
    } else if (games1 === games2) return alert('⚠️ Não pode haver empate!');

    const winnerId = games1 > games2 ? match.pair1_id : match.pair2_id;
    const { error } = await supabase.from('matches').update({
      pair1_games: games1,
      pair2_games: games2,
      pair1_tiebreak: tb1,
      pair2_tiebreak: tb2,
      status: 'finished',
      winner_id: winnerId,
      updated_at: new Date().toISOString()
    }).eq('id', match.id);
    if (error) { return alert(error.message); }
    notifyTV({ matchId: match.id, isFinish: true });
    if (match.next_match_id) {
      const { data: nextMatch } = await supabase.from('matches').select('*').eq('id', match.next_match_id).single();
      if (nextMatch) {
        let updateField = 'pair1_id';
        if (nextMatch.pair1_id && nextMatch.pair1_id !== winnerId) updateField = 'pair2_id';
        await supabase.from('matches').update({ [updateField]: winnerId }).eq('id', match.next_match_id);
      }
    }
    alert('✅ Placar Oficializado!');
    await loadData();
  };

  const createTournament = async () => { if (!newTName) return; const { error } = await supabase.from('tournaments').insert([{ name: newTName }]); if (error) alert("Erro ao criar torneio: " + error.message); else { setNewTName(''); await loadData(); notifyTV(); } };
  const createCategory = async () => { if (!selectedT || !newCName) return; const { error } = await supabase.from('categories').insert([{ tournament_id: selectedT, name: newCName }]); if (error) alert("Erro ao criar categoria: " + error.message); else { setNewCName(''); await loadData(); notifyTV(); } };
  const createCourt = async () => { if (!selectedT || !newCourtName) return; const { error } = await supabase.from('courts').insert([{ tournament_id: selectedT, name: newCourtName }]); if (error) alert("Erro ao criar quadra: " + error.message); else { setNewCourtName(''); await loadData(); notifyTV(); } };
  const createSponsor = async () => { if (!newSponsor.name || !newSponsor.logo_url) return; const { error } = await supabase.from('sponsors').insert([newSponsor]); if (error) alert("Erro ao criar patrocinador: " + error.message); else { setNewSponsor({ name: '', logo_url: '' }); await loadData(); notifyTV(); } };
  const saveVoiceKey = async () => { if (!voiceKey) return; const { error } = await supabase.from('settings').upsert({ id: 'voicerss_key', value: voiceKey }); if (error) alert(error.message); else alert('✅ Chave salva no banco!'); };
  const saveTvSettings = async () => { const payload = { mode: tvMode, time: Number(tvTime) || 30 }; const { error } = await supabase.from('settings').upsert({ id: 'tv_settings', value: JSON.stringify(payload) }); if (error) { alert(error.message); } else { notifyTV(); alert('✅ Exibição da TV atualizada!'); } };
  const forceCallMatch = (m) => { if (!m.court_id) return alert('Por favor, edite a partida (Lápis) e informe a Quadra antes de chamar os jogadores na TV!'); const tvMatchData = { ...m, pair1_name: m.pair1?.name || '?', pair2_name: m.pair2?.name || '?', category_name: m.category?.name || 'Geral', court_name: m.court?.name || 'Quadra' }; if (tvChannel) { tvChannel.send({ type: 'broadcast', event: 'call_match', payload: { match: tvMatchData } }); } alert('📢 Aviso enviado instantaneamente para a TV!'); };
  const deleteSponsor = async (id) => { if (!window.confirm('Excluir este patrocinador?')) return; const { error } = await supabase.from('sponsors').delete().eq('id', id); if (error) alert(error.message); else await loadData(); };
  const createPair = async () => { if (!selectedC || !atleta1 || !atleta2) return; const { error } = await supabase.from('pairs').insert([{ category_id: selectedC, name: `${atleta1} / ${atleta2}` }]); if (error) alert("Erro ao criar dupla: " + error.message); else { setAtleta1(''); setAtleta2(''); await loadData(); notifyTV(); } };
  const createMatch = async () => { if (!selectedT || !selectedC || !matchP1 || !matchP2) return; const { error } = await supabase.from('matches').insert([{ tournament_id: selectedT, category_id: selectedC, pair1_id: matchP1 || null, pair2_id: matchP2 || null, court_id: matchCourt || null, scheduled_time: matchTime || null, status: 'pending' }]); if (error) alert("Erro ao criar partida: " + error.message); else { await loadData(); setActiveTab('scoreboard'); notifyTV(); } };
  const deleteMatch = async (id) => { if (!window.confirm('⚠️ Tem certeza que deseja APAGAR esta partida?')) return; const { error } = await supabase.from('matches').delete().eq('id', id); if (error) alert(error.message); else { await loadData(); notifyTV(); } };
  const startEdit = (m) => { setEditingMatch(m); setEditP1(m.pair1_id || ''); setEditP2(m.pair2_id || ''); setEditCourt(m.court_id || ''); setEditTime(m.scheduled_time || ''); setEditG1(m.pair1_games !== null ? m.pair1_games : ''); setEditG2(m.pair2_games !== null ? m.pair2_games : ''); setEditT1(m.pair1_tiebreak || ''); setEditT2(m.pair2_tiebreak || ''); setEditStatus(m.status || 'pending'); };
  const saveEdit = async () => { if (!editingMatch) return; let winnerId = null; let g1 = editG1 !== '' ? parseInt(editG1) : null; let g2 = editG2 !== '' ? parseInt(editG2) : null; let t1 = editT1 !== '' ? parseInt(editT1) : 0; let t2 = editT2 !== '' ? parseInt(editT2) : 0; if (editStatus === 'finished') { if (g1 === null || g2 === null) return alert('Para encerrar a partida, informe o placar!'); if (g1 > g2) winnerId = editP1; else if (g2 > g1) winnerId = editP2; else { if (t1 === t2) return alert('Em caso de empate nos games, informe os pontos do tie-break!'); winnerId = t1 > t2 ? editP1 : editP2; if (t1 > t2) g1 = 7; else g2 = 7; } } const { error } = await supabase.from('matches').update({ pair1_id: editP1 || null, pair2_id: editP2 || null, court_id: editCourt || null, scheduled_time: editTime || null, pair1_games: g1, pair2_games: g2, pair1_tiebreak: t1, pair2_tiebreak: t2, status: editStatus, winner_id: winnerId, updated_at: new Date().toISOString() }).eq('id', editingMatch.id); if (error) alert(error.message); else { if (winnerId && editingMatch.next_match_id) { const { data: nextMatch } = await supabase.from('matches').select('*').eq('id', editingMatch.next_match_id).single(); if (nextMatch) { let updateField = 'pair1_id'; if (nextMatch.pair1_id && nextMatch.pair1_id !== winnerId) updateField = 'pair2_id'; await supabase.from('matches').update({ [updateField]: winnerId }).eq('id', editingMatch.next_match_id); } } setEditingMatch(null); await loadData(); notifyTV(editStatus === 'finished' ? { matchId: editingMatch.id, isFinish: true } : {}); } };
  const generateManualBracket = async () => { if (!selectedC || !bracketSize) return alert('Selecione categoria e informe a quantidade de duplas!'); const size = parseInt(bracketSize); if (![4,8,16,32].includes(size)) return alert('Favor utilizar tamanhos padrão: 4, 8, 16 ou 32 para garantir a simetria da chave.'); if (!window.confirm(`Isso gerará uma chave de ${size} duplas (mata-mata). Continuar?`)) return; setIsGenerating(true); try { const { data: finalJoin, error: fError } = await supabase.from('matches').insert([{ tournament_id: selectedT, category_id: selectedC, status: 'pending', stage: 'Final' }]).select().single(); if (fError) throw fError; let currentRoundMatches = [finalJoin]; let matchesPerRound = 2; while (matchesPerRound <= (size / 2)) { const newRoundMatches = []; const stageName = matchesPerRound === 2 ? 'Semifinal' : matchesPerRound === 4 ? 'Quartas de Final' : matchesPerRound === 8 ? 'Oitavas de Final' : `Rodada de ${matchesPerRound*2}`; for (let m of currentRoundMatches) { const { data: parents, error: pError } = await supabase.from('matches').insert([{ tournament_id: selectedT, category_id: selectedC, status: 'pending', stage: stageName, next_match_id: m.id }, { tournament_id: selectedT, category_id: selectedC, status: 'pending', stage: stageName, next_match_id: m.id }]).select(); if (pError) throw pError; newRoundMatches.push(...parents); } currentRoundMatches = newRoundMatches; matchesPerRound *= 2; } alert('✅ Chave Mata-Mata gerada com sucesso!'); await loadData(); setActiveTab('scoreboard'); notifyTV(); } catch (e) { alert('Erro ao gerar chave: ' + e.message); } finally { setIsGenerating(false); } };
  const generateGroups = () => { if (!selectedC) return alert('Selecione uma categoria!'); const categoryPairs = pairs.filter(p => p.category_id === selectedC); if (categoryPairs.length < 2) return alert('Necessário ao menos 2 duplas nesta categoria!'); const { max_pairs, num_groups } = tournamentSettings; const shuffled = [...categoryPairs.slice(0, max_pairs)].sort(() => Math.random() - 0.5); const newSlots = {}; let pairIdx = 0; const baseCount = Math.floor(shuffled.length / num_groups); const extraCount = shuffled.length % num_groups; for (let g = 0; g < num_groups; g++) { const letter = String.fromCharCode(65 + g); const slotsInThisGroup = baseCount + (g < extraCount ? 1 : 0); for (let s = 1; s <= slotsInThisGroup; s++) { if (pairIdx < shuffled.length) { newSlots[`${letter}${s}`] = shuffled[pairIdx].id; pairIdx++; } } } setManualSlots(newSlots); setGroupType('manual'); };
  const calculateStandings = (catId) => { const catMatches = matches.filter(m => m && m.category_id === catId && m.status === 'finished' && m.stage?.startsWith('Grupo')); const catPairs = pairs.filter(p => p && p.category_id === catId); const stats = {}; catPairs.forEach(p => { stats[p.id] = { id: p.id, name: p.name, wins: 0, gp: 0, gc: 0, balance: 0, matches: 0 }; }); catMatches.forEach(m => { if (!stats[m.pair1_id] || !stats[m.pair2_id]) return; stats[m.pair1_id].matches++; stats[m.pair2_id].matches++; stats[m.pair1_id].gp += m.pair1_games; stats[m.pair1_id].gc += m.pair2_games; stats[m.pair2_id].gp += m.pair2_games; stats[m.pair2_id].gc += m.pair1_games; if (m.winner_id) stats[m.winner_id].wins++; }); Object.values(stats).forEach(s => s.balance = s.gp - s.gc); const sorted = Object.values(stats).sort((a, b) => { if (b.wins !== a.wins) return b.wins - a.wins; if (b.balance !== a.balance) return b.balance - a.balance; return b.gp - a.gp; }); const groups = {}; catMatches.forEach(m => { const gName = m.stage; if (gName && !groups[gName]) groups[gName] = []; }); const distinctGroups = [...new Set(matches.filter(m => m && m.category_id === catId && m.stage?.startsWith('Grupo')).map(m => m.stage))]; distinctGroups.forEach(gName => { const pairIdsInGroup = [...new Set(matches.filter(m => m && m.stage === gName && m.category_id === catId).flatMap(m => [m.pair1_id, m.pair2_id]))]; const finalGroups = sorted.filter(s => pairIdsInGroup.includes(s.id)); groups[gName] = finalGroups; }); return groups; };
  const generateAutoBracket = async () => { if (!selectedC) return alert('Selecione uma categoria!'); const standings = calculateStandings(selectedC); const groups = Object.keys(standings).sort(); if (groups.length === 0) return alert('Não foram encontrados resultados de grupos para esta categoria!'); const qualifiers = []; const nQualify = tournamentSettings.classify_per_group || 2; groups.forEach(gName => { const topPairs = standings[gName].slice(0, nQualify); qualifiers.push(...topPairs); }); const size = qualifiers.length; const bracketSize = size <= 4 ? 4 : size <= 8 ? 8 : 16; if (!window.confirm(`Gerar Mata-Mata automático para ${size} duplas classificadas?`)) return; setIsGenerating(true); try { const mapping = []; if (groups.length === 4 && nQualify === 2) { mapping.push([standings[groups[0]][0], standings[groups[1]][1]]); mapping.push([standings[groups[2]][0], standings[groups[3]][1]]); mapping.push([standings[groups[1]][0], standings[groups[0]][1]]); mapping.push([standings[groups[3]][0], standings[groups[2]][1]]); } else { for (let i = 0; i < groups.length; i++) { const next = (i + 1) % groups.length; mapping.push([standings[groups[i]][0], standings[groups[next]][1]]); } }
    const { data: finalMatch } = await supabase.from('matches').insert([{ tournament_id: selectedT, category_id: selectedC, stage: 'Final', status: 'pending' }]).select().single();
    const { data: semis } = await supabase.from('matches').insert([
      { tournament_id: selectedT, category_id: selectedC, stage: 'Semifinal', status: 'pending', next_match_id: finalMatch.id },
      { tournament_id: selectedT, category_id: selectedC, stage: 'Semifinal', status: 'pending', next_match_id: finalMatch.id }
    ]).select();
    if (mapping.length > 2) {
      const quartasData = [];
      mapping.forEach((pairSet, idx) => {
        quartasData.push({
          tournament_id: selectedT,
          category_id: selectedC,
          stage: 'Quartas de Final',
          status: 'pending',
          next_match_id: idx < 2 ? semis[0].id : semis[1].id,
          pair1_id: pairSet[0]?.id || null,
          pair2_id: pairSet[1]?.id || null
        });
      });
      await supabase.from('matches').insert(quartasData);
    } else {
      await supabase.from('matches').update({ pair1_id: mapping[0][0]?.id, pair2_id: mapping[0][1]?.id }).eq('id', semis[0].id);
      await supabase.from('matches').update({ pair1_id: mapping[1][0]?.id, pair2_id: mapping[1][1]?.id }).eq('id', semis[1].id);
    }
    alert('✅ Mata-Mata Automático Gerado com os Classificados!');
    await loadData();
    setActiveTab('scoreboard');
    notifyTV();
  } catch (e) { alert('Erro: ' + e.message); } finally { setIsGenerating(false); } };
  const saveGroups = async () => { const categoryPairs = pairs.filter(p => p.category_id === selectedC); const finalGroups = {}; Object.keys(manualSlots).forEach(key => { const letter = key[0]; const pairId = manualSlots[key]; if (pairId) { if (!finalGroups[letter]) finalGroups[letter] = []; const pair = categoryPairs.find(p => p.id === pairId); if (pair) finalGroups[letter].push(pair); } }); const groupsArray = Object.keys(finalGroups).sort().map(letter => ({ name: `Grupo ${letter}`, pairs: finalGroups[letter] })); if (groupsArray.length === 0) return alert('⚠️ Preencha ao menos um grupo com duplas!'); if (!window.confirm('Confirmar a criação das partidas para estes grupos?')) return; setIsGenerating(true); const matchesToCreate = []; groupsArray.forEach(group => { const validPairs = group.pairs.filter(p => p && p.id); for (let i = 0; i < validPairs.length; i++) { for (let j = i + 1; j < validPairs.length; j++) { matchesToCreate.push({ tournament_id: selectedT, category_id: selectedC, pair1_id: validPairs[i].id, pair2_id: validPairs[j].id, status: 'pending', stage: group.name }); } } }); if (matchesToCreate.length === 0) { setIsGenerating(false); return alert('⚠️ Nenhum confronto gerado. Verifique se os grupos têm ao menos 2 duplas.'); } const { error } = await supabase.from('matches').insert(matchesToCreate); setIsGenerating(false); if (error) { console.error('Erro Supabase:', error); alert('❌ Erro ao salvar partidas: ' + error.message); } else { alert('✅ Grupos e Partidas gerados com sucesso!'); await loadData(); setManualSlots({}); setGroupType('auto'); notifyTV(); } };
  const resetCategoryMatches = async () => { if (!selectedC) return; const cat = categories.find(c => c.id === selectedC); if (!window.confirm(`🚨 ALERTA CRÍTICO: Isso apagará TODOS os jogos e resultados da categoria "${cat?.name}". Esta ação não pode ser desfeita.`)) return; if (!window.confirm('Tem real certeza de que deseja apagar absolutamente tudo desta categoria?')) return; const { error } = await supabase.from('matches').delete().eq('category_id', selectedC); if (error) alert(error.message); else { await loadData(); notifyTV(); alert('✅ Categoria resetada com sucesso!'); } };
  const handleFileUpload = (e) => { const file = e.target.files[0]; if (!file) return; setImportFileName(file.name); const reader = new FileReader(); reader.onload = (evt) => { const bstr = evt.target.result; const wb = XLSX.read(bstr, { type: 'binary' }); const wsname = wb.SheetNames[0]; const ws = wb.Sheets[wsname]; const data = XLSX.utils.sheet_to_json(ws); const normalized = data.map(row => { const n = {}; Object.keys(row).forEach(k => { const key = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); n[key] = row[k]; }); return { categoria: n.categoria || n.category || '', atleta1: n.atleta1 || n.player1 || '', atleta2: n.atleta2 || n.player2 || '', quadra: n.quadra || n.court || '', horario: n.horario || n.time || '' }; }).filter(r => r.categoria && r.atleta1 && r.atleta2); setImportData(normalized); }; reader.readAsBinaryString(file); };
  const executeImport = async () => { if (!selectedT || !importData || importData.length === 0) return; setIsImporting(true); try { const uniqueCats = [...new Set(importData.map(d => d.categoria))]; for (const catName of uniqueCats) { const exists = categories.find(c => c.name === catName && c.tournament_id === selectedT); if (!exists) { await supabase.from('categories').insert([{ tournament_id: selectedT, name: catName }]); } } const { data: freshCats } = await supabase.from('categories').select('*').eq('tournament_id', selectedT); for (const row of importData) { const cat = freshCats.find(c => c.name === row.categoria); if (!cat) continue; const pairName = `${row.atleta1} / ${row.atleta2}`; let { data: pair } = await supabase.from('pairs').select('id').eq('category_id', cat.id).eq('name', pairName).single(); if (!pair) { const { data: newPair } = await supabase.from('pairs').insert([{ category_id: cat.id, name: pairName }]).select().single(); pair = newPair; } }
    alert('✅ Importação concluída com sucesso!'); setImportData(null); setImportFileName(''); await loadData(); notifyTV(); } catch (err) { alert('Erro na importação: ' + err.message); } finally { setIsImporting(false); } };
  const exportToExcel = () => { const exportData = matches.map(m => ({ ID: m.id, Torneio: tournaments.find(t => t.id === m.tournament_id)?.name, Categoria: m.category_name, Fase: m.stage || 'Geral', 'Dupla 1': m.pair1?.name, 'Dupla 2': m.pair2?.name, 'Placar D1': m.pair1_games, 'Placar D2': m.pair2_games, 'Tiebreak D1': m.pair1_tiebreak, 'Tiebreak D2': m.pair2_tiebreak, Vencedor: m.winner_id === m.pair1_id ? m.pair1?.name : (m.winner_id === m.pair2_id ? m.pair2?.name : 'Pendente'), Status: m.status === 'finished' ? 'Encerrada' : 'Pendente', Quadra: m.court?.name, Horario: m.scheduled_time })); const ws = XLSX.utils.json_to_sheet(exportData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Resultados'); XLSX.writeFile(wb, `Torneio_Resultados_${new Date().toISOString().split('T')[0]}.xlsx`); };

  return (
    <AdminContext.Provider value={{
      session, setSession, password, setPassword, activeTab, setActiveTab,
      matches, setMatches, tournaments, setTournaments, categories, setCategories,
      pairs, setPairs, courts, setCourts, sponsors, setSponsors,
      selectedT, setSelectedT, selectedC, setSelectedC,
      newTName, setNewTName, newCName, setNewCName, newCourtName, setNewCourtName,
      newSponsor, setNewSponsor, atleta1, setAtleta1, atleta2, setAtleta2,
      matchP1, setMatchP1, matchP2, setMatchP2, matchCourt, setMatchCourt, matchTime, setMatchTime,
      elevenKey, setElevenKey, voiceKey, setVoiceKey, tvMode, setTvMode, tvTime, setTvTime,
      bracketSize, setBracketSize,
      editingMatch, setEditingMatch, editP1, setEditP1, editP2, setEditP2, editCourt, setEditCourt,
      editTime, setEditTime, editG1, setEditG1, editG2, setEditG2, editT1, setEditT1, editT2, setEditT2,
      editStatus, setEditStatus,
      scoreSearch, setScoreSearch, scoreCat, setScoreCat,
      isGenerating, setIsGenerating, groupType, setGroupType, manualSlots, setManualSlots,
      importData, setImportData, importFileName, setImportFileName, isImporting, setIsImporting,
      fileInputRef,
      tournamentSettings, setTournamentSettings,
      hasMatches,
      tvChannel,
      // functions
      loadData, notifyTV, handleLogin, handleLogout, finishMatch, createTournament, createCategory,
      createCourt, createSponsor, saveVoiceKey, saveTvSettings, forceCallMatch, deleteSponsor,
      createPair, createMatch, deleteMatch, startEdit, saveEdit, generateManualBracket,
      generateGroups, calculateStandings, generateAutoBracket, saveGroups, resetCategoryMatches,
      handleFileUpload, executeImport, exportToExcel, saveTournamentSettings
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
