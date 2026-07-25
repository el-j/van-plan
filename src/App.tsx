import React from 'react';
import { useVanState } from './hooks/useVanState';
import { Header } from './components/layout/Header';
import { QuickStatsBar } from './components/layout/QuickStatsBar';
import { Van3DCanvas } from './components/3d/Van3DCanvas';
import { ControlsOverlay3D } from './components/3d/ControlsOverlay3D';
import { BlueprintCanvas2D } from './components/2d/BlueprintCanvas2D';
import { BlueprintControls } from './components/2d/BlueprintControls';
import { WorkshopGuide } from './components/workshop/WorkshopGuide';
import { BOMTable } from './components/bom/BOMTable';
import { SchematicViewer } from './components/schematics/SchematicViewer';

export const App: React.FC = () => {
  const {
    state,
    setActiveTab,
    setUnit,
    setDriveSide,
    togglePartitionDoor,
    toggleSlidingDoor,
    toggleRearDoors,
    toggleCabDoors,
    toggleKitchen,
    toggleBed,
    setDisplayMode,
    setCameraPreset,
    setBlueprintView,
    setInspectedPart,
    toggleLayer2D,
  } = useVanState();

  return (
    <div id="root">
      <Header
        activeTab={state.activeTab}
        setActiveTab={setActiveTab}
        unit={state.unit}
        setUnit={setUnit}
      />

      <QuickStatsBar
        unit={state.unit}
        isBedLowered={state.isBedLowered}
        isKitchenExtended={state.isKitchenExtended}
      />

      <main className="app-main">
        {state.activeTab === '3d' && (
          <div className="tab-view">
            <Van3DCanvas vanState={state} onSelectPart={setInspectedPart} />
            <ControlsOverlay3D
              vanState={state}
              onTogglePartition={togglePartitionDoor}
              onToggleSliding={toggleSlidingDoor}
              onToggleRear={toggleRearDoors}
              onToggleCabDoors={toggleCabDoors}
              onToggleKitchen={toggleKitchen}
              onToggleBed={toggleBed}
              onSetDisplayMode={setDisplayMode}
              onSetCameraPreset={setCameraPreset}
            />
          </div>
        )}

        {state.activeTab === '2d' && (
          <div className="blueprint-view-container">
            <BlueprintControls
              vanState={state}
              onSetBlueprintView={setBlueprintView}
              onSetDriveSide={setDriveSide}
              onToggleLayer2D={toggleLayer2D}
            />
            <BlueprintCanvas2D vanState={state} />
          </div>
        )}

        {state.activeTab === 'workshop' && (
          <WorkshopGuide unit={state.unit} />
        )}

        {state.activeTab === 'bom' && (
          <BOMTable />
        )}

        {state.activeTab === 'schematic' && (
          <SchematicViewer />
        )}
      </main>
    </div>
  );
};

export default App;
