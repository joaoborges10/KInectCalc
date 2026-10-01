import React, { useState } from 'react';
import { FitResult } from '../types/kinetics';
import { predictConcentration, predictTimeToFraction } from '../utils/kineticsMath';
import { Calculator, Clock, Target } from 'lucide-react';

interface Props {
  fitResults: FitResult[];
}

export const PredictionTool: React.FC<Props> = ({ fitResults }) => {
  const bestFit = fitResults[0];
  const [queryTime, setQueryTime] = useState<number>(30);
  const [targetConversion, setTargetConversion] = useState<number>(50); // percentage 50%

  if (!bestFit) return null;

  const predictedConc = predictConcentration(bestFit, Math.max(0, queryTime));
  const c0 = bestFit.c0Estimated > 0 ? bestFit.c0Estimated : 1.0;
  const remainingPercent = Math.max(0, Math.min(100, (predictedConc / c0) * 100));
  const reactedPercent = 100 - remainingPercent;

  // Fraction left for target conversion (e.g. 50% conversion means 0.5 fraction left)
  const fractionLeft = Math.max(0.001, (100 - targetConversion) / 100);
  const timeToConversion = predictTimeToFraction(bestFit, fractionLeft);

  const conversionMilestones = [
    { label: '50% (Meia-vida t½)', fraction: 0.5 },
    { label: '75% Reagido (2 meias-vidas p/ 1ª ord)', fraction: 0.25 },
    { label: '90% Reagido', fraction: 0.10 },
    { label: '99% Reagido', fraction: 0.01 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Calculator className="w-4 h-4 text-sky-400" />
        <h3 className="text-sm font-semibold text-slate-100">
          Calculadora de Previsões & Tempos Notáveis
        </h3>
        <span className="text-xs text-slate-400">
          (Baseado no modelo de <strong>Ordem {bestFit.order}</strong>)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previsão de Concentração por Tempo */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Prever Concentração [A] em tempo t
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              [A] = f(t)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 block mb-1">
                Tempo decorrido (segundos):
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={queryTime}
                onChange={(e) => setQueryTime(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded p-2 text-center">
              <span className="text-[10px] uppercase text-slate-400 block">
                [A] Previsto
              </span>
              <span className="text-base font-bold font-mono text-sky-400">
                {predictedConc.toFixed(5)} M
              </span>
            </div>
          </div>

          {/* Progress bar of consumption */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Reagido: <strong className="text-slate-200">{reactedPercent.toFixed(1)}%</strong></span>
              <span>Restante: <strong className="text-slate-200">{remainingPercent.toFixed(1)}%</strong></span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${reactedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Previsão de Tempo por Conversão */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Tempo para Atingir Conversão
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              t = f(% conversão)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 block mb-1">
                Conversão desejada (% consumido):
              </label>
              <input
                type="number"
                min="1"
                max="99.9"
                step="1"
                value={targetConversion}
                onChange={(e) => setTargetConversion(Math.min(99.9, Math.max(1, parseFloat(e.target.value) || 50)))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded p-2 text-center">
              <span className="text-[10px] uppercase text-slate-400 block">
                Tempo Estimado
              </span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {timeToConversion !== null ? `${timeToConversion.toFixed(2)} s` : 'N/D'}
              </span>
            </div>
          </div>

          {/* Quick presets for milestones */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            {conversionMilestones.map((m) => {
              const t = predictTimeToFraction(bestFit, m.fraction);
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setTargetConversion(Math.round((1 - m.fraction) * 100))}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded p-1 text-center transition-colors cursor-pointer"
                >
                  <span className="text-[10px] text-slate-400 block truncate">
                    {Math.round((1 - m.fraction) * 100)}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-200">
                    {t !== null ? `${t.toFixed(1)}s` : '—'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
