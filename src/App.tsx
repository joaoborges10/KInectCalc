import React, { useState, useMemo } from 'react';
import { DataPoint, ReactionOrder, SimulationConfig } from './types/kinetics';
import { simulateKinetics, fitKinetics } from './utils/kineticsMath';
import { KINETIC_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { SimulationControls } from './components/SimulationControls';
import { DataEditor } from './components/DataEditor';
import { KineticsChart } from './components/KineticsChart';
import { LinearizationPlots } from './components/LinearizationPlots';
import { ResidualsChart } from './components/ResidualsChart';
import { ResultsTable } from './components/ResultsTable';
import { PredictionTool } from './components/PredictionTool';
import { PythonExportModal } from './components/PythonExportModal';
import { TheoryDrawer } from './components/TheoryDrawer';

export default function App() {
  const [mode, setMode] = useState<'simulator' | 'custom'>('simulator');

  // Parameters based on the user's Python prototype example:
  // c0 = 1.0 mol/L, k = 0.1 s⁻¹, order = 1, duration = 50s, noise = 0.005, seed = 42
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    c0: 1.0,
    k: 0.1,
    order: 1,
    duration: 50,
    numPoints: 50,
    noise: 0.005,
    seed: 42,
  });

  // Custom data points for experimental mode
  const [customPoints, setCustomPoints] = useState<DataPoint[]>(() => {
    // default to the N2O5 dataset
    return KINETIC_PRESETS[0].data.map((d, i) => ({
      id: `pt-init-${i}`,
      time: d.time,
      concentration: d.concentration,
    }));
  });

  // Active theoretical curves on the main chart
  const [activeCurves, setActiveCurves] = useState<Record<ReactionOrder, boolean>>({
    0: true,
    1: true,
    2: true,
  });

  // Modals
  const [pythonModalOpen, setPythonModalOpen] = useState(false);
  const [theoryModalOpen, setTheoryModalOpen] = useState(false);

  // Generate synthetic points whenever simulation parameters change
  const simulatedPoints = useMemo<DataPoint[]>(() => {
    const { times, concentrations } = simulateKinetics(
      simConfig.c0,
      simConfig.k,
      simConfig.order,
      simConfig.duration,
      simConfig.numPoints,
      simConfig.noise,
      simConfig.seed
    );

    return times.map((t, idx) => ({
      id: `sim-${idx}`,
      time: t,
      concentration: concentrations[idx],
    }));
  }, [simConfig]);

  // Active points depending on mode
  const currentPoints = mode === 'simulator' ? simulatedPoints : customPoints;

  // Compute kinetic fits for orders 0, 1, 2
  const fitResults = useMemo(() => {
    const times = currentPoints.map((p) => p.time);
    const concentrations = currentPoints.map((p) => p.concentration);
    return fitKinetics(times, concentrations);
  }, [currentPoints]);

  const handleToggleCurve = (order: ReactionOrder) => {
    setActiveCurves((prev) => ({
      ...prev,
      [order]: !prev[order],
    }));
  };

  const handleLoadPreset = (presetId: string) => {
    const found = KINETIC_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCustomPoints(
        found.data.map((d, i) => ({
          id: `preset-${presetId}-${i}`,
          time: d.time,
          concentration: d.concentration,
        }))
      );
      setMode('custom');
    }
  };

  const handleResetSimulation = () => {
    setSimConfig({
      c0: 1.0,
      k: 0.1,
      order: 1,
      duration: 50,
      numPoints: 50,
      noise: 0.005,
      seed: 42,
    });
  };

  const handleNewSeed = () => {
    setSimConfig((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 100000),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenPythonModal={() => setPythonModalOpen(true)}
        onOpenTheory={() => setTheoryModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Top Control Section: Simulator or Experimental Table */}
        {mode === 'simulator' ? (
          <SimulationControls
            config={simConfig}
            onChange={(updated) => setSimConfig((prev) => ({ ...prev, ...updated }))}
            onReset={handleResetSimulation}
            onNewSeed={handleNewSeed}
          />
        ) : (
          <DataEditor
            points={customPoints}
            onUpdatePoints={setCustomPoints}
            onLoadPreset={handleLoadPreset}
          />
        )}

        {/* Main Charts & Results Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Main Concentration vs Time Chart */}
          <KineticsChart
            points={currentPoints}
            fitResults={fitResults}
            activeCurves={activeCurves}
            onToggleCurve={handleToggleCurve}
          />

          {/* Model Comparison Table (Ranked by lowest RMSE, matching user's Python script) */}
          <ResultsTable fitResults={fitResults} />

          {/* 3 Diagnostic Linearization Plots ([A] vs t, ln[A] vs t, 1/[A] vs t) */}
          <LinearizationPlots
            points={currentPoints}
            fitResults={fitResults}
          />

          {/* Residuals and Prediction Tool in 2 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResidualsChart fitResults={fitResults} />
            <PredictionTool fitResults={fitResults} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p>
            KinetiCalc · Bancada Cinética Química com Ajuste por Mínimos Quadrados e Diagnóstico de Ordens 0, 1 e 2
          </p>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Algoritmo: Regressão Linear Múltipla + RMSE Espacial</span>
            <span>·</span>
            <span>Unidades SI: mol/L, s</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PythonExportModal
        isOpen={pythonModalOpen}
        onClose={() => setPythonModalOpen(false)}
        config={simConfig}
        points={currentPoints}
        isCustomMode={mode === 'custom'}
      />

      <TheoryDrawer
        isOpen={theoryModalOpen}
        onClose={() => setTheoryModalOpen(false)}
      />
    </div>
  );
}
