import { ReactionOrder, FitResult } from '../types/kinetics';

// Mulberry32 pseudo-random number generator
function createRng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for normal distribution
function generateNormal(rng: () => number, mean = 0, stdDev = 1): number {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Simulates kinetics matching the Python prototype:
 * Order 0: y = max(0, c0 - k * x)
 * Order 1: y = c0 * exp(-k * x)
 * Order 2: y = 1 / ((1 / c0) + k * x)
 */
export function simulateKinetics(
  c0: number,
  k: number,
  order: ReactionOrder,
  duration: number,
  numPoints = 50,
  noise = 0.0,
  seed = 42
): { times: number[]; concentrations: number[] } {
  const rng = createRng(seed);
  const times: number[] = [];
  const concentrations: number[] = [];

  const step = duration / Math.max(1, numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const t = i * step;
    let conc = 0;

    if (order === 0) {
      conc = Math.max(0, c0 - k * t);
    } else if (order === 1) {
      conc = c0 * Math.exp(-k * t);
    } else if (order === 2) {
      conc = 1 / (1 / c0 + k * t);
    }

    if (noise > 0) {
      const gaussianNoise = generateNormal(rng, 0, noise);
      conc = Math.max(0, conc + gaussianNoise);
    }

    times.push(Number(t.toFixed(4)));
    concentrations.push(Number(conc.toFixed(6)));
  }

  return { times, concentrations };
}

/**
 * Simple Linear Regression: Y = slope * X + intercept
 */
export function linearRegression(x: number[], y: number[]) {
  const n = x.length;
  if (n < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let sxx = 0;
  let sxy = 0;
  let syy = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }

  if (Math.abs(sxx) < 1e-15) {
    return { slope: 0, intercept: meanY, r2: 0 };
  }

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;

  let r2 = 0;
  if (syy > 1e-15) {
    r2 = (sxy * sxy) / (sxx * syy);
  } else {
    r2 = 1.0;
  }

  return { slope, intercept, r2: Math.min(1, Math.max(0, r2)) };
}

/**
 * Fits kinetic data to orders 0, 1, and 2.
 * Calculates k, RMSE, R2, half-life, and predicted curve points.
 */
export function fitKinetics(x: number[], y: number[]): FitResult[] {
  // Filter valid points to avoid numerical division by zero or log of non-positive
  const validIndices: number[] = [];
  for (let i = 0; i < y.length; i++) {
    if (y[i] > 1e-10 && !isNaN(y[i]) && !isNaN(x[i])) {
      validIndices.push(i);
    }
  }

  if (validIndices.length < 2) {
    return [];
  }

  const xVal = validIndices.map((i) => x[i]);
  const yVal = validIndices.map((i) => y[i]);
  const n = xVal.length;

  const maxT = Math.max(...xVal);
  const minT = Math.min(...xVal);
  const curvePoints = 80;
  const dt = (maxT - minT) / (curvePoints - 1);
  const curveTimes = Array.from({ length: curvePoints }, (_, i) => minT + i * dt);

  const results: FitResult[] = [];

  // ============================
  // ORDEM 0: [A] = [A]0 - k * t
  // ============================
  {
    const { slope, intercept, r2 } = linearRegression(xVal, yVal);
    const k = -slope;
    const c0Est = intercept;

    let sse = 0;
    const residuals: { time: number; residual: number }[] = [];
    for (let i = 0; i < n; i++) {
      const pred = Math.max(0, intercept + slope * xVal[i]);
      const diff = yVal[i] - pred;
      residuals.push({ time: xVal[i], residual: diff });
      sse += diff * diff;
    }
    const rmse = Math.sqrt(sse / n);

    const halfLife = k > 0 && c0Est > 0 ? c0Est / (2 * k) : null;

    const predictedCurve = curveTimes.map((t) => ({
      time: t,
      concentration: Math.max(0, intercept + slope * t),
    }));

    results.push({
      order: 0,
      k,
      kFormatted: formatScientific(k),
      unit: 'mol·L⁻¹·s⁻¹',
      c0Estimated: c0Est,
      slope,
      intercept,
      r2,
      rmse,
      halfLife,
      rateEquation: 'v = k',
      linearEquation: `[A] = ${intercept >= 0 ? '' : '-'}${Math.abs(intercept).toFixed(4)} ${slope >= 0 ? '+' : '-'} ${Math.abs(slope).toFixed(5)}·t`,
      predictedCurve,
      residuals,
    });
  }

  // ============================
  // ORDEM 1: ln[A] = ln[A]0 - k * t
  // ============================
  {
    const logY = yVal.map((v) => Math.log(v));
    const { slope, intercept, r2 } = linearRegression(xVal, logY);
    const k = -slope;
    const c0Est = Math.exp(intercept);

    let sse = 0;
    const residuals: { time: number; residual: number }[] = [];
    for (let i = 0; i < n; i++) {
      const pred = Math.exp(intercept + slope * xVal[i]);
      const diff = yVal[i] - pred;
      residuals.push({ time: xVal[i], residual: diff });
      sse += diff * diff;
    }
    const rmse = Math.sqrt(sse / n);

    const halfLife = k > 0 ? Math.LN2 / k : null;

    const predictedCurve = curveTimes.map((t) => ({
      time: t,
      concentration: Math.max(0, Math.exp(intercept + slope * t)),
    }));

    results.push({
      order: 1,
      k,
      kFormatted: formatScientific(k),
      unit: 's⁻¹',
      c0Estimated: c0Est,
      slope,
      intercept,
      r2,
      rmse,
      halfLife,
      rateEquation: 'v = k·[A]',
      linearEquation: `ln[A] = ${intercept >= 0 ? '' : '-'}${Math.abs(intercept).toFixed(4)} ${slope >= 0 ? '+' : '-'} ${Math.abs(slope).toFixed(5)}·t`,
      predictedCurve,
      residuals,
    });
  }

  // ============================
  // ORDEM 2: 1/[A] = 1/[A]0 + k * t
  // ============================
  {
    const invY = yVal.map((v) => 1 / v);
    const { slope, intercept, r2 } = linearRegression(xVal, invY);
    const k = slope;
    const c0Est = intercept > 0 ? 1 / intercept : yVal[0];

    let sse = 0;
    const residuals: { time: number; residual: number }[] = [];
    for (let i = 0; i < n; i++) {
      const denom = intercept + slope * xVal[i];
      const pred = denom > 1e-10 ? 1 / denom : 0;
      const diff = yVal[i] - pred;
      residuals.push({ time: xVal[i], residual: diff });
      sse += diff * diff;
    }
    const rmse = Math.sqrt(sse / n);

    const halfLife = k > 0 && c0Est > 0 ? 1 / (k * c0Est) : null;

    const predictedCurve = curveTimes.map((t) => {
      const denom = intercept + slope * t;
      return {
        time: t,
        concentration: denom > 1e-10 ? 1 / denom : 0,
      };
    });

    results.push({
      order: 2,
      k,
      kFormatted: formatScientific(k),
      unit: 'L·mol⁻¹·s⁻¹',
      c0Estimated: c0Est,
      slope,
      intercept,
      r2,
      rmse,
      halfLife,
      rateEquation: 'v = k·[A]²',
      linearEquation: `1/[A] = ${intercept >= 0 ? '' : '-'}${Math.abs(intercept).toFixed(4)} ${slope >= 0 ? '+' : '-'} ${Math.abs(slope).toFixed(5)}·t`,
      predictedCurve,
      residuals,
    });
  }

  // Sort by lowest RMSE (best fit first), matching user's python script
  return results.sort((a, b) => a.rmse - b.rmse);
}

/**
 * Format number in clean scientific or decimal notation
 */
export function formatScientific(val: number): string {
  if (isNaN(val) || !isFinite(val)) return 'N/D';
  if (val === 0) return '0.0000';
  const abs = Math.abs(val);
  if (abs >= 0.001 && abs < 10000) {
    return val.toFixed(4);
  }
  return val.toExponential(4);
}

/**
 * Predicts concentration at arbitrary time t using fitted parameters
 */
export function predictConcentration(fit: FitResult, t: number): number {
  if (t < 0) return fit.c0Estimated;
  if (fit.order === 0) {
    return Math.max(0, fit.intercept + fit.slope * t);
  } else if (fit.order === 1) {
    return Math.max(0, Math.exp(fit.intercept + fit.slope * t));
  } else {
    const denom = fit.intercept + fit.slope * t;
    return denom > 1e-10 ? 1 / denom : 0;
  }
}

/**
 * Predicts time required to reach a specific concentration fraction (e.g. 0.5 for 50% left)
 */
export function predictTimeToFraction(fit: FitResult, fraction: number): number | null {
  if (fraction <= 0 || fraction >= 1) return null;
  const c0 = fit.c0Estimated;
  const targetC = c0 * fraction;
  const k = fit.k;

  if (k <= 0) return null;

  if (fit.order === 0) {
    // [A] = [A]0 - k * t => t = ([A]0 - targetC) / k
    return (c0 - targetC) / k;
  } else if (fit.order === 1) {
    // ln([A]/[A]0) = -k * t => t = -ln(fraction) / k
    return -Math.log(fraction) / k;
  } else {
    // 1/[A] - 1/[A]0 = k * t => t = (1/targetC - 1/c0) / k
    return (1 / targetC - 1 / c0) / k;
  }
}
