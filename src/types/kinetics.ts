export type ReactionOrder = 0 | 1 | 2;

export interface DataPoint {
  id: string;
  time: number; // seconds
  concentration: number; // mol/L or M
}

export interface SimulationConfig {
  c0: number; // initial concentration in mol/L
  k: number; // rate constant
  order: ReactionOrder;
  duration: number; // total time in seconds
  numPoints: number; // default 50
  noise: number; // Gaussian std dev
  seed: number; // random seed
}

export interface FitResult {
  order: ReactionOrder;
  k: number;
  kFormatted: string;
  unit: string;
  c0Estimated: number;
  slope: number;
  intercept: number;
  r2: number;
  rmse: number;
  halfLife: number | null; // t_1/2 in seconds
  rateEquation: string;
  linearEquation: string;
  predictedCurve: { time: number; concentration: number }[];
  residuals: { time: number; residual: number }[];
}

export interface KineticsPreset {
  id: string;
  name: string;
  system: string;
  order: ReactionOrder;
  description: string;
  durationUnit: string;
  concUnit: string;
  data: { time: number; concentration: number }[];
}
