import React from 'react';
import { BookOpen, X, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">
              Fundamentos de Cinética Química & Linearização
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Cards for Orders 0, 1, 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Ordem 0 */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-lg p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="font-semibold text-xs text-amber-300">Ordem Zero</h3>
            </div>
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <p>Lei Dif: <strong>v = k</strong></p>
              <p>Lei Int: <strong>[A] = [A]₀ − k·t</strong></p>
              <p>Linear: <strong>y = [A] vs x = t</strong></p>
              <p>Inclinação: <strong>−k</strong></p>
              <p>Meia-vida: <strong>t½ = [A]₀ / (2k)</strong></p>
              <p>Unidade: <strong>mol·L⁻¹·s⁻¹</strong></p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
              A velocidade não depende de [A]. Comum em reações catalisadas heterogêneas com superfície do catalisador saturada (ex: Pt aquecido).
            </p>
          </div>

          {/* Ordem 1 */}
          <div className="bg-slate-950 border border-blue-500/30 rounded-lg p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <h3 className="font-semibold text-xs text-blue-300">Primeira Ordem</h3>
            </div>
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <p>Lei Dif: <strong>v = k·[A]</strong></p>
              <p>Lei Int: <strong>[A] = [A]₀·e^(−k·t)</strong></p>
              <p>Linear: <strong>y = ln[A] vs x = t</strong></p>
              <p>Inclinação: <strong>−k</strong></p>
              <p>Meia-vida: <strong>t½ = ln(2) / k ≈ 0.693/k</strong></p>
              <p>Unidade: <strong>s⁻¹</strong></p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
              A meia-vida é constante e independe da concentração inicial. Típica de decomposição unimolecular e decaimentos nucleares.
            </p>
          </div>

          {/* Ordem 2 */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-lg p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-semibold text-xs text-emerald-300">Segunda Ordem</h3>
            </div>
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <p>Lei Dif: <strong>v = k·[A]²</strong></p>
              <p>Lei Int: <strong>1/[A] = 1/[A]₀ + k·t</strong></p>
              <p>Linear: <strong>y = 1/[A] vs x = t</strong></p>
              <p>Inclinação: <strong>+k (positiva)</strong></p>
              <p>Meia-vida: <strong>t½ = 1 / (k·[A]₀)</strong></p>
              <p>Unidade: <strong>L·mol⁻¹·s⁻¹</strong></p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
              A meia-vida duplica a cada ciclo sucessivo conforme a concentração cai pela metade. Comum em reações bimoleculares.
            </p>
          </div>
        </div>

        {/* Statistical Methodology */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2.5 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Critério de Seleção do Modelo: Por que RMSE no espaço de concentração?
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Ao transformar matematicamente a variável dependente (aplicando <code className="text-sky-300 font-mono">ln(y)</code> para a ordem 1 ou <code className="text-emerald-300 font-mono">1/y</code> para a ordem 2), as escalas dos resíduos lineares ficam distorcidas. Por isso, calcular o <strong>RMSE (Root Mean Square Error)</strong> diretamente no espaço real de concentração <code className="text-slate-200 font-mono">y = [A]</code> permite uma comparação equitativa e justa entre os três modelos, exatamente como implementado na sua função <code className="text-amber-300 font-mono">fit_kinetics(x, y)</code>.
          </p>
          <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
            RMSE = √[ (1/N) · Σ ([A]obs,i − [A]pred,i)² ]
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
