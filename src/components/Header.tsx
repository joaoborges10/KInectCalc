import React from 'react';
import { FlaskConical, Terminal, BookOpen, Sparkles, Database } from 'lucide-react';

interface Props {
  mode: 'simulator' | 'custom';
  onModeChange: (mode: 'simulator' | 'custom') => void;
  onOpenPythonModal: () => void;
  onOpenTheory: () => void;
}

export const Header: React.FC<Props> = ({
  mode,
  onModeChange,
  onOpenPythonModal,
  onOpenTheory,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-100">
                KinectCalc
              </h1>
              <span className="text-[11px] font-mono text-slate-400">
                v1.2 · Cinética Química
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bancada de simulação, linearização e determinação de ordem de reação
            </p>
          </div>
        </div>

        {/* Mode Selector (Segmented buttons - functional buttons) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onModeChange('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              mode === 'simulator'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador Sintético</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              mode === 'custom'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dados Experimentais / Tabela</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTheory}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Teoria & Leis</span>
          </button>

          <button
            type="button"
            onClick={onOpenPythonModal}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Python</span>
          </button>
        </div>
      </div>
    </header>
  );
};
