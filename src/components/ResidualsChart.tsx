import React, { useState } from 'react';
import { FitResult, ReactionOrder } from '../types/kinetics';

interface Props {
  fitResults: FitResult[];
}

export const ResidualsChart: React.FC<Props> = ({ fitResults }) => {
  const [activeOrder, setActiveOrder] = useState<ReactionOrder>(fitResults[0]?.order ?? 1);

  const selectedFit = fitResults.find((f) => f.order === activeOrder) || fitResults[0];
  if (!selectedFit || !selectedFit.residuals || selectedFit.residuals.length === 0) {
    return null;
  }

  const residuals = selectedFit.residuals;
  const width = 800;
  const height = 180;
  const pad = { top: 20, right: 30, bottom: 35, left: 65 };
  const pWidth = width - pad.left - pad.right;
  const pHeight = height - pad.top - pad.bottom;

  const times = residuals.map((r) => r.time);
  const minX = 0;
  const maxX = Math.max(1, Math.max(...times) * 1.05);

  const resValues = residuals.map((r) => r.residual);
  const maxAbsRes = Math.max(0.001, Math.max(...resValues.map((v) => Math.abs(v))) * 1.25);
  const minY = -maxAbsRes;
  const maxY = maxAbsRes;

  const scaleX = (x: number) => pad.left + ((x - minX) / (maxX - minX)) * pWidth;
  const scaleY = (y: number) => pad.top + pHeight / 2 - (y / maxAbsRes) * (pHeight / 2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Gráfico de Resíduos: ( [A]ₒᵦₛ − [A]ₚᵣₑᏧ ) vs Tempo</span>
          </h3>
          <p className="text-xs text-slate-400">
            Resíduos aleatórios em torno do zero confirmam a adequação do modelo cinético.
          </p>
        </div>

        {/* Order Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {fitResults.map((fit) => (
            <button
              key={fit.order}
              type="button"
              onClick={() => setActiveOrder(fit.order)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeOrder === fit.order
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ordem {fit.order} (RMSE: {fit.rmse.toFixed(4)})
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full aspect-[4/1] min-h-[140px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Zero baseline */}
          <line
            x1={pad.left}
            y1={scaleY(0)}
            x2={pad.left + pWidth}
            y2={scaleY(0)}
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Points & stems */}
          {residuals.map((r, idx) => {
            const cx = scaleX(r.time);
            const cy = scaleY(r.residual);
            const isZero = Math.abs(r.residual) < 1e-6;

            return (
              <g key={idx}>
                {/* Stem line to zero */}
                <line
                  x1={cx}
                  y1={scaleY(0)}
                  x2={cx}
                  y2={cy}
                  stroke={r.residual >= 0 ? '#38bdf8' : '#f43f5e'}
                  strokeWidth="1"
                  opacity="0.6"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill={isZero ? '#94a3b8' : r.residual >= 0 ? '#38bdf8' : '#f43f5e'}
                />
              </g>
            );
          })}

          {/* Left Y ticks */}
          <text
            x={pad.left - 10}
            y={pad.top + 8}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
          >
            +{maxAbsRes.toFixed(4)}
          </text>
          <text
            x={pad.left - 10}
            y={scaleY(0) + 4}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
          >
            0.0000
          </text>
          <text
            x={pad.left - 10}
            y={pad.top + pHeight}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
          >
            -{maxAbsRes.toFixed(4)}
          </text>

          {/* Bottom axis label */}
          <text
            x={pad.left + pWidth / 2}
            y={height - 6}
            fill="#94a3b8"
            fontSize="11"
            textAnchor="middle"
          >
            Tempo t (s)
          </text>
          <text
            transform="rotate(-90)"
            x={-(pad.top + pHeight / 2)}
            y={14}
            fill="#94a3b8"
            fontSize="11"
            textAnchor="middle"
          >
            Resíduo Δ[A]
          </text>
        </svg>
      </div>
    </div>
  );
};
