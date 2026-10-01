import React from 'react';
import { FitResult } from '../types/kinetics';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  fitResults: FitResult[];
}

export const ResultsTable: React.FC<Props> = ({ fitResults }) => {
  if (fitResults.length === 0) {
    return null;
  }

  const bestFit = fitResults[0]; // Ranked by lowest RMSE first

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Comparação e Ajuste de Modelos Cinéticos</span>
            <span className="text-xs text-slate-400 font-normal">
              (Ordenado pelo menor RMSE)
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Ajuste empírico simultâneo para as ordens 0, 1 e 2 via linearização das leis integradas
          </p>
        </div>

        {bestFit && (
          <div className="flex items-center gap-2 text-xs bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Cinética dominante detectada:{' '}
              <strong className="font-semibold text-emerald-200">
                Ordem {bestFit.order}
              </strong>{' '}
              (RMSE: {bestFit.rmse.toFixed(5)}, R²: {bestFit.r2.toFixed(4)})
            </span>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Ordem</th>
              <th className="py-2.5 px-3">Lei de Velocidade</th>
              <th className="py-2.5 px-3">Equação Linearizada</th>
              <th className="py-2.5 px-3">Constante k</th>
              <th className="py-2.5 px-3">Unidade de k</th>
              <th className="py-2.5 px-3">[A]₀ Ajustado</th>
              <th className="py-2.5 px-3 font-mono">R² Linear</th>
              <th className="py-2.5 px-3 font-mono">RMSE [A]</th>
              <th className="py-2.5 px-3 font-mono">t½ (Meia-vida)</th>
              <th className="py-2.5 px-3 text-center">Diagnóstico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {fitResults.map((res, index) => {
              const isBest = index === 0;
              return (
                <tr
                  key={res.order}
                  className={`transition-colors ${
                    isBest
                      ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        res.order === 0
                          ? 'bg-amber-400'
                          : res.order === 1
                          ? 'bg-blue-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span>Ordem {res.order}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {res.rateEquation}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                    {res.linearEquation}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-100">
                    {res.kFormatted}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {res.unit}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {res.c0Estimated > 0 ? res.c0Estimated.toFixed(4) : '—'} M
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold">
                    <span
                      className={
                        res.r2 > 0.99
                          ? 'text-emerald-400'
                          : res.r2 > 0.95
                          ? 'text-sky-400'
                          : 'text-amber-400'
                      }
                    >
                      {res.r2.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold">
                    <span className={isBest ? 'text-emerald-400' : 'text-slate-300'}>
                      {res.rmse.toFixed(5)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {res.halfLife !== null && res.halfLife > 0 ? (
                      `${res.halfLife.toFixed(2)} s`
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isBest ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ★ Melhor Ajuste
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        +{(res.rmse - bestFit.rmse).toFixed(5)} erro
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chemical Interpretation Note */}
      {bestFit && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">
              Interpretação Cinética:
            </p>
            <p className="text-slate-400 leading-relaxed">
              {bestFit.order === 0 && (
                <>
                  A reação é de <strong>Ordem Zero</strong> (velocidade independente da concentração do reagente,{' '}
                  <span className="font-mono text-slate-300">v = {bestFit.kFormatted} mol·L⁻¹·s⁻¹</span>). Típica de processos heterogêneos catalisados com superfície completamente saturada ou reações fotoquímicas. A meia-vida é diretamente proporcional à concentração inicial.
                </>
              )}
              {bestFit.order === 1 && (
                <>
                  A reação é de <strong>Primeira Ordem</strong> (velocidade proporcional a [A],{' '}
                  <span className="font-mono text-slate-300">v = {bestFit.kFormatted}·[A] s⁻¹</span>). Típica de decaimentos radioativos, isomerizações ou decomposições unimoleculares. A meia-vida é constante ({bestFit.halfLife?.toFixed(2)} s) e independe da concentração inicial.
                </>
              )}
              {bestFit.order === 2 && (
                <>
                  A reação é de <strong>Segunda Ordem</strong> (velocidade proporcional a [A]²,{' '}
                  <span className="font-mono text-slate-300">v = {bestFit.kFormatted}·[A]² L·mol⁻¹·s⁻¹</span>). Típica de reações bimoleculares (colisão efetiva entre duas moléculas reagentes). A meia-vida duplica a cada ciclo à medida que a concentração diminui.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
