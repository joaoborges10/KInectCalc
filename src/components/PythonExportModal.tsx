import React, { useState } from 'react';
import { DataPoint, SimulationConfig } from '../types/kinetics';
import { Copy, Check, Terminal, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  points: DataPoint[];
  isCustomMode: boolean;
}

export const PythonExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  points,
  isCustomMode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonCode = isCustomMode
    ? `# ============================================================
# Calculadora Cinética - Script Python com Dados Atuais
# ============================================================
import numpy as np
import matplotlib.pyplot as plt

# 1. Dados experimentais carregados na interface
t_exp = np.array([${points.map((p) => p.time).join(', ')}])
c_exp = np.array([${points.map((p) => p.concentration).join(', ')}])

def fit_kinetics(x, y):
    """
    Compara modelos cinéticos. Ajusta os dados para as ordens 0, 1 e 2 
    e retorna o k estimado e o RMSE para cada ajuste.
    """
    valid = y > 1e-10
    x_val = x[valid]
    y_val = y[valid]
    results = []
    
    # Ordem 0: y = C, slope = -k
    slope0, int0 = np.polyfit(x_val, y_val, 1)
    pred0 = int0 + slope0 * x_val
    rmse0 = np.sqrt(np.mean((y_val - pred0)**2))
    results.append({'order': 0, 'k': -slope0, 'rmse': rmse0, 'intercept': int0})
    
    # Ordem 1: y = ln(C), slope = -k
    slope1, int1 = np.polyfit(x_val, np.log(y_val), 1)
    pred1 = np.exp(int1 + slope1 * x_val)
    rmse1 = np.sqrt(np.mean((y_val - pred1)**2))
    results.append({'order': 1, 'k': -slope1, 'rmse': rmse1, 'intercept': int1})
    
    # Ordem 2: y = 1/C, slope = k
    slope2, int2 = np.polyfit(x_val, 1/y_val, 1)
    pred2 = 1 / (int2 + slope2 * x_val)
    rmse2 = np.sqrt(np.mean((y_val - pred2)**2))
    results.append({'order': 2, 'k': slope2, 'rmse': rmse2, 'intercept': int2})
    
    # Ordena pelo menor RMSE (melhor ajuste primeiro)
    return sorted(results, key=lambda r: r['rmse'])

if __name__ == "__main__":
    resultados = fit_kinetics(t_exp, c_exp)
    
    print("=== Comparação Cinética ===")
    for res in resultados:
        print(f"Ordem {res['order']}: k = {res['k']:.5f} | RMSE = {res['rmse']:.5f}")
        
    # Plotagem rápida com Matplotlib
    plt.figure(figsize=(8, 5))
    plt.scatter(t_exp, c_exp, color='black', label='Dados Experimentais', zorder=5)
    
    t_smooth = np.linspace(min(t_exp), max(t_exp), 100)
    for res in resultados:
        if res['order'] == 0:
            y_smooth = np.maximum(0, res['intercept'] - res['k'] * t_smooth)
            plt.plot(t_smooth, y_smooth, label=f"Ordem 0 (RMSE={res['rmse']:.4f})")
        elif res['order'] == 1:
            y_smooth = np.exp(res['intercept'] - res['k'] * t_smooth)
            plt.plot(t_smooth, y_smooth, label=f"Ordem 1 (RMSE={res['rmse']:.4f})")
        elif res['order'] == 2:
            y_smooth = 1 / (res['intercept'] + res['k'] * t_smooth)
            plt.plot(t_smooth, y_smooth, label=f"Ordem 2 (RMSE={res['rmse']:.4f})")
            
    plt.xlabel("Tempo (s)")
    plt.ylabel("Concentração [A] (mol/L)")
    plt.title("Ajuste de Modelos Cinéticos")
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.show()
`
    : `# ============================================================
# Calculadora Cinética - Script Python Base + Simulação
# ============================================================
import numpy as np
import matplotlib.pyplot as plt

def simulate_kinetics(c0, k, order, duration, noise=0.0, seed=42):
    """
    Gera dados cinéticos simulados. Baseado nos inputs do Nexum Scientific Workbench.
    """
    np.random.seed(seed)
    x = np.linspace(0, duration, ${config.numPoints}) # x = Tempo (s)
    
    if order == 0:
        y = np.maximum(0, c0 - k * x)
    elif order == 1:
        y = c0 * np.exp(-k * x)
    elif order == 2:
        y = 1 / ((1 / c0) + k * x)
    else:
        raise ValueError("A ordem simulada deve ser 0, 1 ou 2.")
        
    # Adição de ruído gaussiano
    if noise > 0:
        y += np.random.normal(0, noise, len(x))
        
    return x, y

def fit_kinetics(x, y):
    """
    Compara modelos cinéticos. Ajusta os dados para as ordens 0, 1 e 2 
    e retorna o k estimado e o RMSE para cada ajuste.
    """
    valid = y > 1e-10
    x_val = x[valid]
    y_val = y[valid]
    results = []
    
    # Ordem 0: y = C, slope = -k
    slope0, int0 = np.polyfit(x_val, y_val, 1)
    pred0 = int0 + slope0 * x_val
    rmse0 = np.sqrt(np.mean((y_val - pred0)**2))
    results.append({'order': 0, 'k': -slope0, 'rmse': rmse0, 'intercept': int0})
    
    # Ordem 1: y = ln(C), slope = -k
    slope1, int1 = np.polyfit(x_val, np.log(y_val), 1)
    pred1 = np.exp(int1 + slope1 * x_val)
    rmse1 = np.sqrt(np.mean((y_val - pred1)**2))
    results.append({'order': 1, 'k': -slope1, 'rmse': rmse1, 'intercept': int1})
    
    # Ordem 2: y = 1/C, slope = k
    slope2, int2 = np.polyfit(x_val, 1/y_val, 1)
    pred2 = 1 / (int2 + slope2 * x_val)
    rmse2 = np.sqrt(np.mean((y_val - pred2)**2))
    results.append({'order': 2, 'k': slope2, 'rmse': rmse2, 'intercept': int2})
    
    return sorted(results, key=lambda r: r['rmse'])

if __name__ == "__main__":
    # Parâmetros configurados atualmente no KinetiCalc:
    c0 = ${config.c0}
    k = ${config.k}
    order = ${config.order}
    duration = ${config.duration}
    noise = ${config.noise}
    seed = ${config.seed}

    x, y = simulate_kinetics(c0, k, order, duration, noise, seed)
    resultados = fit_kinetics(x, y)
    
    print("=== Comparação Cinética ===")
    for res in resultados:
        print(f"Ordem {res['order']}: k = {res['k']:.5f} | RMSE = {res['rmse']:.5f}")
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-3 max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Código Python Compatível
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Você pode executar este código diretamente em qualquer ambiente Python (Jupyter Notebook, Google Colab, VSCode ou terminal com NumPy e Matplotlib).
        </p>

        <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-y-auto max-h-96 leading-relaxed">
            {pythonCode}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono">
            {isCustomMode ? 'Exportando medições manuais' : 'Exportando parâmetros do simulador'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
