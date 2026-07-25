import React from 'react';
import { DisplayMode, VanState } from '../../types/van';
import { Eye, Layers, Maximize2, MoveRight, DoorClosed, ArrowUpDown, Compass } from 'lucide-react';

interface ControlsOverlay3DProps {
  vanState: VanState;
  onTogglePartition: () => void;
  onToggleSliding: () => void;
  onToggleRear: () => void;
  onToggleCabDoors: () => void;
  onToggleKitchen: () => void;
  onToggleBed: () => void;
  onSetDisplayMode: (mode: DisplayMode) => void;
  onSetCameraPreset: (preset: VanState['cameraPreset']) => void;
  onSetDriveSide?: (side: 'LHD' | 'RHD') => void;
}

export const ControlsOverlay3D: React.FC<ControlsOverlay3DProps> = ({
  vanState,
  onTogglePartition,
  onToggleSliding,
  onToggleRear,
  onToggleCabDoors,
  onToggleKitchen,
  onToggleBed,
  onSetDisplayMode,
  onSetCameraPreset,
  onSetDriveSide,
}) => {
  return (
    <div className="controls-overlay-3d">
      <div className="control-section">
        <span className="section-title">Kamera-Ansichten</span>
        <div className="btn-group">
          <button
            className={`ctrl-btn ${vanState.cameraPreset === 'iso' ? 'active' : ''}`}
            onClick={() => onSetCameraPreset('iso')}
            title="Isometrische Gesamtansicht"
          >
            <Compass size={14} />
            Iso 3D
          </button>
          <button
            className={`ctrl-btn ${vanState.cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => onSetCameraPreset('top')}
            title="Draufsicht von oben"
          >
            Draufsicht
          </button>
          <button
            className={`ctrl-btn ${vanState.cameraPreset === 'side' ? 'active' : ''}`}
            onClick={() => onSetCameraPreset('side')}
            title="Seitenansicht Schiebetür"
          >
            Seite
          </button>
          <button
            className={`ctrl-btn ${vanState.cameraPreset === 'driver' ? 'active' : ''}`}
            onClick={() => onSetCameraPreset('driver')}
            title="Blick vom Fahrerhaus durch Trennwand"
          >
            Cockpit
          </button>
          <button
            className={`ctrl-btn ${vanState.cameraPreset === 'kitchen' ? 'active' : ''}`}
            onClick={() => onSetCameraPreset('kitchen')}
            title="Fokus Outdoor-Küche"
          >
            Küche
          </button>
          <button
            className={`ctrl-btn ${vanState.cameraPreset === 'bed' ? 'active' : ''}`}
            onClick={() => onSetCameraPreset('bed')}
            title="Fokus Hubbett & Decke"
          >
            Hubbett
          </button>
        </div>
      </div>

      <div className="control-divider" />

      <div className="control-section">
        <span className="section-title">Interaktive Mechaniken</span>
        <div className="btn-group">
          <button
            className={`ctrl-btn toggle ${vanState.isCabDoorsOpen ? 'active-orange' : ''}`}
            onClick={onToggleCabDoors}
          >
            <DoorClosed size={14} />
            Cab-Türen: {vanState.isCabDoorsOpen ? 'Offen' : 'Zu'}
          </button>

          <button
            className={`ctrl-btn toggle ${vanState.isPartitionOpen ? 'active-orange' : ''}`}
            onClick={onTogglePartition}
          >
            <DoorClosed size={14} />
            Trennwand-Tür: {vanState.isPartitionOpen ? 'Offen' : 'Zu'}
          </button>

          <button
            className={`ctrl-btn toggle ${vanState.isSlidingOpen ? 'active-orange' : ''}`}
            onClick={onToggleSliding}
          >
            <MoveRight size={14} />
            Schiebetür: {vanState.isSlidingOpen ? 'Offen' : 'Zu'}
          </button>

          <button
            className={`ctrl-btn toggle ${vanState.isRearOpen ? 'active-orange' : ''}`}
            onClick={onToggleRear}
          >
            Hecktüren: {vanState.isRearOpen ? 'Offen' : 'Zu'}
          </button>

          <button
            className={`ctrl-btn toggle ${vanState.isKitchenExtended ? 'active-accent' : ''}`}
            onClick={onToggleKitchen}
          >
            <Maximize2 size={14} />
            Küche: {vanState.isKitchenExtended ? 'Draußen (-25cm)' : 'Eingefahren'}
          </button>

          <button
            className={`ctrl-btn toggle ${vanState.isBedLowered ? 'active-accent' : ''}`}
            onClick={onToggleBed}
          >
            <ArrowUpDown size={14} />
            Hubbett: {vanState.isBedLowered ? 'Nacht (Abgesenkt)' : 'Tag (An Decke)'}
          </button>
        </div>
      </div>

      <div className="control-divider" />

      <div className="control-section">
        <span className="section-title">Darstellungsmodus</span>
        <div className="btn-group">
          <button
            className={`ctrl-btn ${vanState.displayMode === 'solid' ? 'active' : ''}`}
            onClick={() => onSetDisplayMode('solid')}
          >
            <Eye size={14} />
            Real 3D
          </button>
          <button
            className={`ctrl-btn ${vanState.displayMode === 'wireframe' ? 'active' : ''}`}
            onClick={() => onSetDisplayMode('wireframe')}
          >
            <Layers size={14} />
            X-Ray CAD
          </button>
          <button
            className={`ctrl-btn ${vanState.displayMode === 'exploded' ? 'active' : ''}`}
            onClick={() => onSetDisplayMode('exploded')}
          >
            Explosionsansicht
          </button>
        </div>
      </div>

      <div className="control-divider" />

      <div className="control-section">
        <span className="section-title">Lenkrad / Fahrerseite</span>
        <div className="btn-group">
          <button
            className={`ctrl-btn ${vanState.driveSide === 'LHD' ? 'active' : ''}`}
            onClick={() => onSetDriveSide && onSetDriveSide('LHD')}
            title="Linkslenker (Deutschland)"
          >
            LHD 🇩🇪 (Links)
          </button>
          <button
            className={`ctrl-btn ${vanState.driveSide === 'RHD' ? 'active' : ''}`}
            onClick={() => onSetDriveSide && onSetDriveSide('RHD')}
            title="Rechtslenker (Großbritannien)"
          >
            RHD 🇬🇧 (Rechts)
          </button>
        </div>
      </div>
    </div>
  );
};
