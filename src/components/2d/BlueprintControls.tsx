import React from 'react';
import { VanState } from '../../types/van';
import { LayoutGrid, Maximize, ArrowDownUp } from 'lucide-react';

interface BlueprintControlsProps {
  vanState: VanState;
  onSetBlueprintView: (view: VanState['blueprintView']) => void;
}

export const BlueprintControls: React.FC<BlueprintControlsProps> = ({ vanState, onSetBlueprintView }) => {
  return (
    <div className="blueprint-controls-bar">
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

      <div className="blueprint-legend">
        <div className="legend-item">
          <span className="legend-box accent" />
          <span>Hubbett / Auszüge</span>
        </div>
        <div className="legend-item">
          <span className="legend-box teal" />
          <span>Sitzbänke & Technik</span>
        </div>
        <div className="legend-item">
          <span className="legend-box green" />
          <span>Freie Gangachse (600mm)</span>
        </div>
      </div>
    </div>
  );
};
