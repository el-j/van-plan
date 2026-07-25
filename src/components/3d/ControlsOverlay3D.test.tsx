import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlsOverlay3D } from './ControlsOverlay3D';
import { VanState } from '../../types/van';

describe('ControlsOverlay3D component', () => {
  const initialVanState: VanState = {
    activeTab: '3d',
    selectedModuleId: null,
    unit: 'mm',
    driveSide: 'LHD',
    isPartitionOpen: true,
    isSlidingOpen: true,
    isRearOpen: true,
    isCabDoorsOpen: true,
    isKitchenExtended: true,
    isBedLowered: true,
    displayMode: 'solid',
    cutawayAxis: 'z',
    cutawayPosition: 0.5,
    cameraPreset: 'iso',
    blueprintView: 'floor',
    showDimensions2D: true,
    showPassageways2D: true,
    visibleLayers2D: {
      dimensions: true,
      walkway: true,
      bed: true,
      kitchen: true,
      benches: true,
      partition: true,
      chassis: true,
    },
    inspectedPart: null,
  };

  it('renders all camera preset buttons, toggle buttons, and display modes', () => {
    const onTogglePartition = vi.fn();
    const onToggleSliding = vi.fn();
    const onToggleRear = vi.fn();
    const onToggleCabDoors = vi.fn();
    const onToggleKitchen = vi.fn();
    const onToggleBed = vi.fn();
    const onSetDisplayMode = vi.fn();
    const onSetCameraPreset = vi.fn();

    render(
      <ControlsOverlay3D
        vanState={initialVanState}
        onTogglePartition={onTogglePartition}
        onToggleSliding={onToggleSliding}
        onToggleRear={onToggleRear}
        onToggleCabDoors={onToggleCabDoors}
        onToggleKitchen={onToggleKitchen}
        onToggleBed={onToggleBed}
        onSetDisplayMode={onSetDisplayMode}
        onSetCameraPreset={onSetCameraPreset}
      />
    );

    // Camera presets
    fireEvent.click(screen.getByText('Iso 3D'));
    expect(onSetCameraPreset).toHaveBeenCalledWith('iso');

    fireEvent.click(screen.getByText('Draufsicht'));
    expect(onSetCameraPreset).toHaveBeenCalledWith('top');

    fireEvent.click(screen.getByText('Seite'));
    expect(onSetCameraPreset).toHaveBeenCalledWith('side');

    fireEvent.click(screen.getByText('Cockpit'));
    expect(onSetCameraPreset).toHaveBeenCalledWith('driver');

    fireEvent.click(screen.getByText('Küche'));
    expect(onSetCameraPreset).toHaveBeenCalledWith('kitchen');

    fireEvent.click(screen.getByText('Hubbett'));
    expect(onSetCameraPreset).toHaveBeenCalledWith('bed');

    // Toggles
    fireEvent.click(screen.getByText('Cab-Türen: Offen'));
    expect(onToggleCabDoors).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Trennwand-Tür: Offen'));
    expect(onTogglePartition).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Schiebetür: Offen'));
    expect(onToggleSliding).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Hecktüren: Offen'));
    expect(onToggleRear).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Küche: Draußen (-25cm)'));
    expect(onToggleKitchen).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Hubbett: Nacht (Abgesenkt)'));
    expect(onToggleBed).toHaveBeenCalled();

    // Display modes
    fireEvent.click(screen.getByText('Real 3D'));
    expect(onSetDisplayMode).toHaveBeenCalledWith('solid');

    fireEvent.click(screen.getByText('X-Ray CAD'));
    expect(onSetDisplayMode).toHaveBeenCalledWith('wireframe');

    fireEvent.click(screen.getByText('Explosionsansicht'));
    expect(onSetDisplayMode).toHaveBeenCalledWith('exploded');
  });
});
