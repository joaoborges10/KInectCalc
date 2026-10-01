import React, { useState } from 'react';
import { DataPoint } from '../types/kinetics';
import { KINETIC_PRESETS } from '../data/presets';
import { Plus, Trash2, Clipboard, Download, BookOpen, AlertTriangle } from 'lucide-react';

interface Props {
  points: DataPoint[];
  onUpdatePoints: (points: DataPoint[]) => void;
  onLoadPreset: (presetId: string) => void;
}

export const DataEditor: React.FC<Props> = ({
  points,
  onUpdatePoints,
  onLoadPreset,
}) => {
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteError, setPasteError] = useState('');

  const handleCellChange = (id: string, field: 'time' | 'concentration', value: string) => {
    const num = parseFloat(value);
    const updated = points.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          [field]: isNaN(num) ? 0 : Math.max(0, num),
        };
      }
      return p;
    });
    onUpdatePoints(updated);
  };

  const handleAddRow = () => {
    const lastTime = points.length > 0 ? points[points.length - 1].time : 0;
    const lastConc = points.length > 0 ? points[points.length - 1].concentration : 1.0;
    const newPoint: DataPoint = {
      id: `pt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      time: lastTime + 10,
      concentration: Math.max(0, Number((lastConc * 0.85).toFixed(4))),
    };
    onUpdatePoints([...points, newPoint]);
  };

  const handleDeleteRow = (id: string) => {
    if (points.length <= 2) {
      alert('São necessários ao menos 2 pontos experimentais para ajuste linear.');
      return;
    }
    onUpdatePoints(points.filter((p) => p.id !== id));
  };

  const handleClear = () => {
    if (confirm('Deseja limpar todos os pontos experimentais atuais?')) {
      onUpdatePoints([
        { id: 'p1', time: 0, concentration: 1.0 },
        { id: 'p2', time: 10, concentration: 0.5 },
      ]);
    }
  };

  const handlePasteSubmit = () => {
    setPasteError('');
    if (!pasteContent.trim()) {
      setPasteError('Cole ou digite os dados.');
      return;
    }

    const lines = pasteContent.trim().split(/\r?\n/);
    const parsed: DataPoint[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip common header words
      if (
        i === 0 &&
        (line.toLowerCase().includes('tempo') ||
          line.toLowerCase().includes('time') ||
          line.toLowerCase().includes('conc') ||
          line.toLowerCase().includes('t') && line.toLowerCase().includes('c'))
      ) {
        continue;
      }

      // Split by tab, comma, semicolon or multiple spaces
      const tokens = line.split(/[,\t;]|\s{2,}/).map((s) => s.trim().replace(',', '.'));
      if (tokens.length >= 2) {
        const t = parseFloat(tokens[0]);
        const c = parseFloat(tokens[1]);
        if (!isNaN(t) && !isNaN(c)) {
          parsed.push({
            id: `p-${i}-${Date.now()}`,
            time: Math.max(0, t),
            concentration: Math.max(0, c),
          });
        }
      }
    }

    if (parsed.length < 2) {
      setPasteError('Não foi possível identificar pelo menos 2 pares válidos de (Tempo, Concentração). Formatos aceitos: "0, 1.0" ou "0\t1.0".');
      return;
    }

    // Sort by time ascending
    parsed.sort((a, b) => a.time - b.time);
    onUpdatePoints(parsed);
    setPasteModalOpen(false);
    setPasteContent('');
  };

  const handleExportCsv = () => {
    const headers = 'Tempo (s),Concentracao (mol/L)\n';
    const rows = points.map((p) => `${p.time},${p.concentration}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_cineticos_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header and Preset Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Tabela de Dados Experimentais
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({points.length} medições)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400">Presets Reais:</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onLoadPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="" disabled>Carregar reação clássica...</option>
              {KINETIC_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Ordem {p.order})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setPasteModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
            title="Colar dados tabulados do Excel ou arquivo CSV"
          >
            <Clipboard className="w-3.5 h-3.5 text-sky-400" />
            <span>Colar / CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
            title="Baixar dados em formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table Editor */}
      <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-medium text-[11px] sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="py-2 px-3 w-12 text-center">#</th>
              <th className="py-2 px-3">Tempo t (s)</th>
              <th className="py-2 px-3">Concentração [A] (mol/L)</th>
              <th className="py-2 px-3 w-16 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
            {points.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-800/40">
                <td className="py-1.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={p.time}
                    onChange={(e) => handleCellChange(p.id, 'time', e.target.value)}
                    className="w-full max-w-[140px] bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={p.concentration}
                    onChange={(e) => handleCellChange(p.id, 'concentration', e.target.value)}
                    className="w-full max-w-[140px] bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </td>
                <td className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(p.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Excluir medição"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium px-3 py-1.5 rounded bg-sky-950/40 border border-sky-500/30 hover:bg-sky-900/40 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Linha</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          Limpar tabela
        </button>
      </div>

      {/* Paste / CSV Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Importar Dados (Excel, CSV ou Bloco de Notas)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cole duas colunas: a primeira com o <strong>Tempo</strong> e a segunda com a <strong>Concentração</strong>. Separadas por tabulação, vírgula ou espaço.
              </p>
            </div>

            <textarea
              rows={8}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder={`Exemplo:\n0\t1.000\n10\t0.750\n20\t0.562\n30\t0.421\n40\t0.316\n50\t0.237`}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
            />

            {pasteError && (
              <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{pasteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPasteModalOpen(false);
                  setPasteError('');
                }}
                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors cursor-pointer"
              >
                Carregar Dados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
