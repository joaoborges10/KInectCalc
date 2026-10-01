import React, { useState } from 'react';
import { DataPoint, FitResult, ReactionOrder } from '../types/kinetics';

interface Props {
  points: DataPoint[];
  fitResults: FitResult[];
  activeCurves: Record<ReactionOrder, boolean>;
  onToggleCurve: (order: ReactionOrder) => void;
}

const ORDER_COLORS: Record<ReactionOrder, { stroke: string; label: string; textClass: string }> = {
  0: { stroke: '#f59e0b', label: 'Ordem 0 (Linear)', textClass: 'text-amber-500' },
  1: { stroke: '#3b82f6', label: 'Ordem 1 (Exponencial)', textClass: 'text-blue-500' },
  2: { stroke: '#10b981', label: 'Ordem 2 (Hiperbólica)', textClass: 'text-emerald-500' },
};

export const KineticsChart: React.FC<Props> = ({
  points,
  fitResults,
  activeCurves,
  onToggleCurve,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  if (points.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center border border-dashed border-slate-700 rounded-lg text-slate-400 text-sm">
        Nenhum ponto cinético disponível para plotagem.
      </div>
    );
  }

  // Chart layout dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 30, right: 30, bottom: 50, left: 65 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Scale ranges
  const times = points.map((p) => p.time);
  const concols = points.map((p) => p.concentration);

  const minX = 0;
  const maxX = Math.max(1, Math.max(...times) * 1.05);

  const minY = 0;
  const maxY = Math.max(0.1, Math.max(...concols) * 1.1);

  const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
  const scaleY = (y: number) => padding.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

  // Ticks
  const numXTicks = 6;
  const xTicks = Array.from({ length: numXTicks }, (_, i) => minX + (i / (numXTicks - 1)) * (maxX - minX));

  const numYTicks = 5;
  const yTicks = Array.from({ length: numYTicks }, (_, i) => minY + (i / (numYTicks - 1)) * (maxY - minY));

  const bestFitOrder = fitResults.length > 0 ? fitResults[0].order : null;

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Concentração vs Tempo: [A] = f(t)</span>
            {bestFitOrder !== null && (
              <span className="text-xs font-normal text-slate-400">
                (Melhor ajuste empírico:{' '}
                <strong className={ORDER_COLORS[bestFitOrder].textClass}>
                  Ordem {bestFitOrder}
                </strong>
                )
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            Pontos experimentais com as curvas teóricas integradas correspondentes
          </p>
        </div>

        {/* Curve toggles */}
        <div className="flex items-center gap-2">
          {([0, 1, 2] as ReactionOrder[]).map((order) => {
            const active = activeCurves[order];
            const color = ORDER_COLORS[order].stroke;
            const isBest = bestFitOrder === order;

            return (
              <button
                key={order}
                type="button"
                onClick={() => onToggleCurve(order)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title={`Alternar visualização da curva teórica de Ordem ${order}`}
              >
                <span
                  className="w-2.5 h-0.5 inline-block rounded"
                  style={{ backgroundColor: active ? color : '#64748b' }}
                />
                <span>Ordem {order}</span>
                {isBest && (
                  <span className="text-[10px] text-emerald-400 font-mono">★</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[2/1] min-h-[300px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          {/* Grid lines */}
          {xTicks.map((xVal, idx) => {
            const xPos = scaleX(xVal);
            return (
              <g key={`x-grid-${idx}`}>
                <line
                  x1={xPos}
                  y1={padding.top}
                  x2={xPos}
                  y2={padding.top + plotHeight}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={xPos}
                  y={padding.top + plotHeight + 18}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {xVal >= 1000 ? xVal.toExponential(1) : xVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {yTicks.map((yVal, idx) => {
            const yPos = scaleY(yVal);
            return (
              <g key={`y-grid-${idx}`}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={padding.left + plotWidth}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={yPos + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {yVal.toFixed(yVal < 0.01 ? 4 : 3)}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left + plotWidth}
            y2={padding.top + plotHeight}
            stroke="#475569"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text
            x={padding.left + plotWidth / 2}
            y={height - 10}
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="500"
            textAnchor="middle"
          >
            Tempo t (segundos)
          </text>
          <text
            transform={`rotate(-90)`}
            x={-(padding.top + plotHeight / 2)}
            y={16}
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="500"
            textAnchor="middle"
          >
            Concentração [A] (mol/L)
          </text>

          {/* Theoretical Curves */}
          {fitResults.map((fit) => {
            if (!activeCurves[fit.order] || !fit.predictedCurve || fit.predictedCurve.length === 0) {
              return null;
            }

            const pathD = fit.predictedCurve
              .map((pt, idx) => {
                const px = scaleX(pt.time);
                const py = scaleY(Math.max(0, pt.concentration));
                return `${idx === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
              })
              .join(' ');

            const isBest = bestFitOrder === fit.order;
            const strokeColor = ORDER_COLORS[fit.order].stroke;

            return (
              <g key={`fit-curve-${fit.order}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isBest ? 2.5 : 1.8}
                  strokeDasharray={fit.order === 0 ? '5 3' : fit.order === 2 ? '2 2' : undefined}
                  opacity={isBest ? 1 : 0.75}
                />
              </g>
            );
          })}

          {/* Data Points */}
          {points.map((pt) => {
            const cx = scaleX(pt.time);
            const cy = scaleY(pt.concentration);
            const isHovered = hoveredPoint?.id === pt.id;

            return (
              <g
                key={pt.id}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#38bdf8"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />
                {/* Touch/click buffer */}
                <circle cx={cx} cy={cy} r={12} fill="transparent" />
              </g>
            );
          })}

          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <g
              transform={`translate(${scaleX(hoveredPoint.time)}, ${scaleY(hoveredPoint.concentration)})`}
            >
              <rect
                x="8"
                y="-32"
                width="130"
                height="32"
                rx="4"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1"
                className="shadow-lg"
              />
              <text x="14" y="-19" fill="#94a3b8" fontSize="10">
                t = <tspan fill="#f1f5f9" fontFamily="monospace">{hoveredPoint.time.toFixed(2)}s</tspan>
              </text>
              <text x="14" y="-7" fill="#94a3b8" fontSize="10">
                [A] = <tspan fill="#38bdf8" fontFamily="monospace">{hoveredPoint.concentration.toFixed(5)} M</tspan>
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-sky-400 inline-block" />
            <span>Dados experimentais / simulados ({points.length} pontos)</span>
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Min t: {minX}s</span>
          <span>·</span>
          <span>Max t: {Math.max(...times).toFixed(1)}s</span>
          <span>·</span>
          <span>[A]₀ exp: {points[0]?.concentration.toFixed(4)} M</span>
        </div>
      </div>
    </div>
  );
};
