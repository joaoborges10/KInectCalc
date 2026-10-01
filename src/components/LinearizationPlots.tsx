import React, { useState } from 'react';
import { DataPoint, FitResult, ReactionOrder } from '../types/kinetics';

interface Props {
  points: DataPoint[];
  fitResults: FitResult[];
}

export const LinearizationPlots: React.FC<Props> = ({ points, fitResults }) => {
  const [selectedTab, setSelectedTab] = useState<'all' | ReactionOrder>('all');

  // Filter valid points
  const validPoints = points.filter((p) => p.concentration > 1e-10);
  if (validPoints.length < 2 || fitResults.length === 0) {
    return null;
  }

  // Find result for each order
  const order0 = fitResults.find((r) => r.order === 0);
  const order1 = fitResults.find((r) => r.order === 1);
  const order2 = fitResults.find((r) => r.order === 2);

  // Best fit order
  const bestOrder = fitResults[0]?.order;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Método Gráfico de Linearização (Diagnóstico de Ordem)</span>
            <span className="text-xs font-normal text-slate-400">
              A ordem correta é aquela cujo gráfico produz a melhor reta (maior R²).
            </span>
          </h3>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedTab === 'all'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ver os 3 Gráficos
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab(0)}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedTab === 0
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            [A] vs t (0ª)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab(1)}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedTab === 1
                ? 'bg-slate-800 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ln[A] vs t (1ª)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab(2)}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedTab === 2
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1/[A] vs t (2ª)
          </button>
        </div>
      </div>

      <div
        className={`grid gap-4 ${
          selectedTab === 'all'
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 max-w-2xl mx-auto w-full'
        }`}
      >
        {(selectedTab === 'all' || selectedTab === 0) && order0 && (
          <LinearCard
            order={0}
            title="Ordem 0: [A] vs t"
            yLabel="[A] (mol/L)"
            color="#f59e0b"
            isBest={bestOrder === 0}
            fit={order0}
            dataPoints={validPoints.map((p) => ({ x: p.time, y: p.concentration }))}
          />
        )}

        {(selectedTab === 'all' || selectedTab === 1) && order1 && (
          <LinearCard
            order={1}
            title="Ordem 1: ln[A] vs t"
            yLabel="ln[A]"
            color="#3b82f6"
            isBest={bestOrder === 1}
            fit={order1}
            dataPoints={validPoints.map((p) => ({ x: p.time, y: Math.log(p.concentration) }))}
          />
        )}

        {(selectedTab === 'all' || selectedTab === 2) && order2 && (
          <LinearCard
            order={2}
            title="Ordem 2: 1/[A] vs t"
            yLabel="1/[A] (L/mol)"
            color="#10b981"
            isBest={bestOrder === 2}
            fit={order2}
            dataPoints={validPoints.map((p) => ({ x: p.time, y: 1 / p.concentration }))}
          />
        )}
      </div>
    </div>
  );
};

interface LinearCardProps {
  order: ReactionOrder;
  title: string;
  yLabel: string;
  color: string;
  isBest: boolean;
  fit: FitResult;
  dataPoints: { x: number; y: number }[];
}

const LinearCard: React.FC<LinearCardProps> = ({
  order,
  title,
  yLabel,
  color,
  isBest,
  fit,
  dataPoints,
}) => {
  const width = 360;
  const height = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 55 };
  const pWidth = width - pad.left - pad.right;
  const pHeight = height - pad.top - pad.bottom;

  const xs = dataPoints.map((p) => p.x);
  const ys = dataPoints.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const rangeX = maxX - minX || 1;

  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeY = maxY - minY || 1;

  const paddedMinY = minY - rangeY * 0.08;
  const paddedMaxY = maxY + rangeY * 0.08;
  const effectiveRangeY = paddedMaxY - paddedMinY;

  const scaleX = (x: number) => pad.left + ((x - minX) / rangeX) * pWidth;
  const scaleY = (y: number) => pad.top + pHeight - ((y - paddedMinY) / effectiveRangeY) * pHeight;

  // Regression line start and end
  const x1 = minX;
  const y1 = fit.intercept + fit.slope * x1;
  const x2 = maxX;
  const y2 = fit.intercept + fit.slope * x2;

  return (
    <div
      className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
        isBest
          ? 'bg-slate-950/80 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-md'
          : 'bg-slate-950/40 border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            <h4 className="text-xs font-semibold text-slate-200">{title}</h4>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            {fit.linearEquation}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-semibold text-slate-100">
            R² = {fit.r2.toFixed(4)}
          </div>
          {isBest && (
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">
              Melhor Linearidade
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full aspect-[16/10] my-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Box outline & axes */}
          <line
            x1={pad.left}
            y1={pad.top + pHeight}
            x2={pad.left + pWidth}
            y2={pad.top + pHeight}
            stroke="#334155"
            strokeWidth="1"
          />
          <line
            x1={pad.left}
            y1={pad.top}
            x2={pad.left}
            y2={pad.top + pHeight}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Regression Line */}
          <line
            x1={scaleX(x1)}
            y1={scaleY(y1)}
            x2={scaleX(x2)}
            y2={scaleY(y2)}
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray={order === 0 ? '4 2' : undefined}
          />

          {/* Points */}
          {dataPoints.map((pt, idx) => {
            const cx = scaleX(pt.x);
            const cy = scaleY(pt.y);
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="3"
                fill="#ffffff"
                stroke={color}
                strokeWidth="1.5"
              />
            );
          })}

          {/* Axis Labels */}
          <text
            x={pad.left + pWidth / 2}
            y={height - 8}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
          >
            Tempo t (s)
          </text>
          <text
            transform="rotate(-90)"
            x={-(pad.top + pHeight / 2)}
            y={14}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
          >
            {yLabel}
          </text>

          {/* Value indicators */}
          <text
            x={pad.left + pWidth}
            y={pad.top + 12}
            fill="#64748b"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            inclinação = {fit.slope.toExponential(2)}
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900 text-slate-400 font-mono">
        <span>k = {fit.kFormatted} {fit.unit}</span>
        <span>RMSE = {fit.rmse.toFixed(5)}</span>
      </div>
    </div>
  );
};
