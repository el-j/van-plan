import React from 'react';
import { VanState, DriveSide, VisibleLayers2D } from '../../types/van';
import { LayoutGrid, Maximize, ArrowDownUp, Eye, Compass } from 'lucide-react';

interface BlueprintControlsProps {
  vanState: VanState;
  onSetBlueprintView: (view: VanState['blueprintView']) => void;
  onSetDriveSide?: (side: DriveSide) => void;
  onToggleLayer2D?: (layer: keyof VisibleLayers2D) => void;
}

export const BlueprintControls: React.FC<BlueprintControlsProps> = ({
  vanState,
  onSetBlueprintView,
  onSetDriveSide,
  onToggleLayer2D,
}) => {
  const layers = vanState.visibleLayers2D || {
    dimensions: true,
    walkway: true,
    bed: true,
    kitchen: true,
    benches: true,
    partition: true,
    chassis: true,
  };

  return (
    <div className="blueprint-controls-bar flex-col gap-3">
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        <div className="control-group">
          <span className="control-label">Blaupausen-Perspektive:</span>
          <button
            className={`bp-btn ${vanState.blueprintView === 'floor' ? 'active' : ''}`}
            onClick={() => onSetBlueprintView('floor')}
          >
            <LayoutGrid size={15} />
            Draufsicht (Grundriss mm)
          </button>

          <button
            className={`bp-btn ${vanState.blueprintView === 'side' ? 'active' : ''}`}
            onClick={() => onSetBlueprintView('side')}
          >
            <Maximize size={15} />
            Längsschnitt (Seitenprofil)
          </button>

          <button
            className={`bp-btn ${vanState.blueprintView === 'rear' ? 'active' : ''}`}
            onClick={() => onSetBlueprintView('rear')}
          >
            <ArrowDownUp size={15} />
            Querschnitt (Heckprofil)
          </button>
        </div>

        {/* Steering & Drive Configuration (LHD DE vs RHD UK) */}
        {onSetDriveSide && (
          <div className="control-group">
            <span className="control-label flex items-center gap-1">
              <Compass size={14} /> Lenkung & Seite:
            </span>
            <button
              className={`bp-btn ${vanState.driveSide === 'LHD' ? 'active' : ''}`}
              onClick={() => onSetDriveSide('LHD')}
              title="Deutscher / EU Standard (Fahrersitz Links, Schiebetür Rechts)"
            >
              🇩🇪 LHD (Linkslenker DE)
            </button>
            <button
              className={`bp-btn ${vanState.driveSide === 'RHD' ? 'active' : ''}`}
              onClick={() => onSetDriveSide('RHD')}
              title="UK / Japan Standard (Fahrersitz Rechts, Schiebetür Links)"
            >
              🇬🇧 RHD (Rechtslenker UK)
            </button>
          </div>
        )}
      </div>

      {/* Layer Visibility Controls */}
      {onToggleLayer2D && (
        <div className="flex items-center gap-2 border-t border-slate-800 pt-2 w-full flex-wrap text-xs">
          <span className="control-label flex items-center gap-1 text-slate-400">
            <Eye size={14} /> Ebenen Ein-/Ausblenden:
          </span>

          <button
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              layers.bed ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60'
            }`}
            onClick={() => onToggleLayer2D('bed')}
          >
            🛏️ Hubbett
          </button>

          <button
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              layers.kitchen ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60'
            }`}
            onClick={() => onToggleLayer2D('kitchen')}
          >
            🍳 Küche & Auszug
          </button>

          <button
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              layers.benches ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60'
            }`}
            onClick={() => onToggleLayer2D('benches')}
          >
            🛋️ Sitzbänke & Technik
          </button>

          <button
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              layers.partition ? 'bg-slate-700/40 border-slate-600 text-slate-200' : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60'
            }`}
            onClick={() => onToggleLayer2D('partition')}
          >
            🚪 Trennwand
          </button>

          <button
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              layers.walkway ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60'
            }`}
            onClick={() => onToggleLayer2D('walkway')}
          >
            🟢 Gangachse (600mm)
          </button>

          <button
            className={`px-2.5 py-1 rounded text-xs transition-colors border ${
              layers.dimensions ? 'bg-sky-500/20 border-sky-500 text-sky-300' : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60'
            }`}
            onClick={() => onToggleLayer2D('dimensions')}
          >
            📏 Maßlinien
          </button>
        </div>
      )}
    </div>
  );
};
