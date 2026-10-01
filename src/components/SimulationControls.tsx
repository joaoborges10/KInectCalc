import React from 'react';
import { ReactionOrder, SimulationConfig } from '../types/kinetics';
import { Sliders, Dices, RotateCcw } from 'lucide-react';

interface Props {
  config: SimulationConfig;
  onChange: (updated: Partial<SimulationConfig>) => void;
  onReset: () => void;
  onNewSeed: () => void;
}

export const SimulationControls: React.FC<Props> = ({
  config,
  onChange,
  onReset,
  onNewSeed,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Parâmetros da Simulação Sintética
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewSeed}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
            title="Sortear nova semente de ruído aleatório"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Nova Semente</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Restaurar valores padrão do exemplo em Python"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrão</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ordem da Reação */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Ordem Verdadeira Simulada</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Ordem {config.order}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {([0, 1, 2] as ReactionOrder[]).map((ord) => (
              <button
                key={ord}
                type="button"
                onClick={() => onChange({ order: ord })}
                className={`py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                  config.order === ord
                    ? ord === 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : ord === 1
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ordem {ord}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500">
            {config.order === 0 && 'Concentração linear no tempo [A] = [A]₀ - k·t'}
            {config.order === 1 && 'Decaimento exponencial [A] = [A]₀·e^(-k·t)'}
            {config.order === 2 && 'Decaimento hiperbólico 1/[A] = 1/[A]₀ + k·t'}
          </span>
        </div>

        {/* Concentração Inicial c0 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>[A]₀ (Concentração Inicial)</span>
            <span className="text-[11px] text-sky-400 font-mono">
              {config.c0.toFixed(2)} mol/L
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.05"
              value={config.c0}
              onChange={(e) => onChange({ c0: parseFloat(e.target.value) || 0.1 })}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <input
              type="number"
              min="0.01"
              max="10"
              step="0.05"
              value={config.c0}
              onChange={(e) => onChange({ c0: Math.max(0.01, parseFloat(e.target.value) || 0.1) })}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono text-right"
            />
          </div>
          <span className="text-[10px] text-slate-500">
            Concentração no instante t = 0 s
          </span>
        </div>

        {/* Constante cinética k */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Constante k</span>
            <span className="text-[11px] text-sky-400 font-mono">
              {config.k.toFixed(3)}{' '}
              {config.order === 0
                ? 'mol/(L·s)'
                : config.order === 1
                ? 's⁻¹'
                : 'L/(mol·s)'}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.005"
              max="0.5"
              step="0.005"
              value={config.k}
              onChange={(e) => onChange({ k: parseFloat(e.target.value) || 0.01 })}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <input
              type="number"
              min="0.0001"
              max="5"
              step="0.01"
              value={config.k}
              onChange={(e) => onChange({ k: Math.max(0.0001, parseFloat(e.target.value) || 0.01) })}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono text-right"
            />
          </div>
          <span className="text-[10px] text-slate-500">
            Velocidade específica intrínseca da reação
          </span>
        </div>

        {/* Duração total (s) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Duração da Coleta (Tempo Total)</span>
            <span className="text-[11px] text-sky-400 font-mono">
              {config.duration} s
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={config.duration}
              onChange={(e) => onChange({ duration: parseInt(e.target.value) || 10 })}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <input
              type="number"
              min="5"
              max="1000"
              value={config.duration}
              onChange={(e) => onChange({ duration: Math.max(5, parseInt(e.target.value) || 10) })}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono text-right"
            />
          </div>
          <span className="text-[10px] text-slate-500">
            Janela temporal de monitoramento
          </span>
        </div>

        {/* Ruído Gaussiano */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Ruído Gaussiano (Desvio Padrão σ)</span>
            <span className="text-[11px] text-amber-400 font-mono">
              {config.noise.toFixed(4)}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="0.05"
              step="0.001"
              value={config.noise}
              onChange={(e) => onChange({ noise: parseFloat(e.target.value) || 0 })}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <input
              type="number"
              min="0"
              max="0.2"
              step="0.001"
              value={config.noise}
              onChange={(e) => onChange({ noise: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono text-right"
            />
          </div>
          <span className="text-[10px] text-slate-500">
            Simula incerteza e ruído de medição espectrofotométrica
          </span>
        </div>

        {/* Pontos & Seed */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Pontos Coletados (N) & Semente</span>
            <span className="text-[11px] text-slate-400 font-mono">
              N = {config.numPoints} · Seed: {config.seed}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={config.numPoints}
              onChange={(e) => onChange({ numPoints: parseInt(e.target.value) || 10 })}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <input
              type="number"
              min="5"
              max="300"
              value={config.numPoints}
              onChange={(e) => onChange({ numPoints: Math.max(5, parseInt(e.target.value) || 10) })}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono text-right"
            />
          </div>
          <span className="text-[10px] text-slate-500">
            Resolução e reprodutibilidade estatística
          </span>
        </div>
      </div>
    </div>
  );
};
