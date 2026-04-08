import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './ImportExport.module.css';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

export default function ImportExport() {
  const { 
    selectedT, setSelectedT, tournaments,
    importData, importFileName, isImporting, fileInputRef,
    handleFileUpload, executeImport, exportToExcel, matches
  } = useAdmin();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 className="section-title">Importar / Exportar Excel</h1>

      {/* IMPORT SECTION */}
      <div className="app-card" style={{ borderLeftColor: 'var(--accent-primary)', marginBottom: 30 }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 5, color: 'var(--accent-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Upload size={20} /> Importar Dados Pré-Torneio
        </h2>
        <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: 25 }}>Importe um arquivo Excel (.xlsx) contendo as duplas, categorias e informações do torneio.</p>

        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Torneio Destino</label>
          <select value={selectedT} onChange={e => setSelectedT(e.target.value)}>
            <option value="">Selecione o Torneio...</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div
          className={`import-dropzone ${importData ? 'active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer', padding: 30, border: '2px dashed #333', borderRadius: 15, textAlign: 'center', background: importData ? 'rgba(39,174,96,0.05)' : 'transparent', marginBottom: 20 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <FileSpreadsheet size={40} style={{ color: 'var(--accent-primary)', marginBottom: 15 }} />
          {importFileName ? (
            <>
              <div style={{ fontWeight: 800, color: '#fff', marginBottom: 5 }}>{importFileName}</div>
              <div style={{ fontSize: '0.75rem', color: '#27ae60' }}>✅ {importData?.length || 0} linhas carregadas</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 700, color: '#888', marginBottom: 5 }}>Clique para selecionar arquivo</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>.xlsx ou .xls</div>
            </>
          )}
        </div>

        {/* Format Hint */}
        <div style={{ marginTop: 20, padding: 15, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#888', marginBottom: 10, letterSpacing: 1 }}>FORMATO ESPERADO:</div>
          <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ opacity: 0.5 }}>
                <th style={{ padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>Categoria</th>
                <th style={{ padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>Atleta 1</th>
                <th style={{ padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>Atleta 2</th>
                <th style={{ padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>Quadra</th>
                <th style={{ padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid #333' }}>Horário</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ opacity: 0.3 }}>
                <td style={{ padding: '5px 8px' }}>Masc A</td>
                <td style={{ padding: '5px 8px' }}>João</td>
                <td style={{ padding: '5px 8px' }}>Pedro</td>
                <td style={{ padding: '5px 8px' }}>Quadra 1</td>
                <td style={{ padding: '5px 8px' }}>09:00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Preview */}
        {importData && importData.length > 0 && (
          <div style={{ marginTop: 25 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: 15, letterSpacing: 1 }}>PRÉ-VISUALIZAÇÃO ({importData.length} REGISTROS)</div>
            <div style={{ maxHeight: 300, overflowY: 'auto', borderRadius: 12, border: '1px solid #333', marginBottom: 20 }}>
              <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#1a1a1a', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: 10, borderBottom: '1px solid #333' }}>Categoria</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #333' }}>Atleta 1</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #333' }}>Atleta 2</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #333' }}>Quadra</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #333' }}>Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {importData.slice(0, 50).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 10 }}>{row.categoria}</td>
                      <td style={{ padding: 10 }}>{row.atleta1}</td>
                      <td style={{ padding: 10 }}>{row.atleta2}</td>
                      <td style={{ padding: 10 }}>{row.quadra || '—'}</td>
                      <td style={{ padding: 10 }}>{row.horario || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', height: 65, marginTop: 20, fontSize: '1rem', fontWeight: 950 }}
              onClick={executeImport}
              disabled={isImporting || !selectedT}
            >
              {isImporting ? 'IMPORTANDO...' : `IMPORTAR ${importData.length} DUPLAS`}
            </button>
          </div>
        )}
      </div>

      {/* EXPORT SECTION */}
      <div className="app-card" style={{ border: '1px solid #27ae60', background: 'rgba(39,174,96,0.03)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 5, color: '#27ae60', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Download size={20} /> Exportar Resultados
        </h2>
        <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: 25 }}>Gere um arquivo Excel completo com todas as partidas e resultados do torneio.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 25 }}>
          <div style={{ textAlign: 'center', padding: 15, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#fff' }}>{matches.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 15, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Encerradas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#27ae60' }}>{matches.filter(m => m.status === 'finished').length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 15, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Pendentes</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--accent-primary)' }}>{matches.filter(m => m.status !== 'finished').length}</div>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', height: 60, background: '#27ae60', border: 'none', color: '#fff', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          onClick={exportToExcel}
        >
          <Download size={20} /> BAIXAR PLANILHA COMPLETA (.XLSX)
        </button>
      </div>
    </div>
  );
}
