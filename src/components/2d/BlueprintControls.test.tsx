import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlueprintControls } from './BlueprintControls';
import { VanState } from '../../types/van';

describe('BlueprintControls component', () => {
  const initialVanState: VanState = {
    activeTab: '2d',
    selectedModuleId: null,
    unit: 'mm',
    driveSide: 'LHD',
    isPartitionOpen: false,
    isSlidingOpen: false,
    isRearOpen: false,
    isCabDoorsOpen: false,
    isKitchenExtended: false,
    isBedLowered: false,
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

  it('renders perspective buttons, driveSide toggle, and layer visibility toggles', () => {
    const onSetBlueprintView = vi.fn();
    const onSetDriveSide = vi.fn();
    const onToggleLayer2D = vi.fn();

    render(
      <BlueprintControls
        vanState={initialVanState}
        onSetBlueprintView={onSetBlueprintView}
        onSetDriveSide={onSetDriveSide}
        onToggleLayer2D={onToggleLayer2D}
      />
    );

    fireEvent.click(screen.getByText('Draufsicht (Grundriss mm)'));
    expect(onSetBlueprintView).toHaveBeenCalledWith('floor');

    fireEvent.click(screen.getByText('Längsschnitt (Seitenprofil)'));
    expect(onSetBlueprintView).toHaveBeenCalledWith('side');

    fireEvent.click(screen.getByText('Querschnitt (Heckprofil)'));
    expect(onSetBlueprintView).toHaveBeenCalledWith('rear');

    fireEvent.click(screen.getByText('🇩🇪 LHD (Linkslenker DE)'));
    expect(onSetDriveSide).toHaveBeenCalledWith('LHD');

    fireEvent.click(screen.getByText('🇬🇧 RHD (Rechtslenker UK)'));
    expect(onSetDriveSide).toHaveBeenCalledWith('RHD');

    fireEvent.click(screen.getByText('🛏️ Hubbett'));
    expect(onToggleLayer2D).toHaveBeenCalledWith('bed');

    fireEvent.click(screen.getByText('🍳 Küche & Auszug'));
    expect(onToggleLayer2D).toHaveBeenCalledWith('kitchen');

    fireEvent.click(screen.getByText('🛋️ Sitzbänke & Technik'));
    expect(onToggleLayer2D).toHaveBeenCalledWith('benches');

    fireEvent.click(screen.getByText('🚪 Trennwand'));
    expect(onToggleLayer2D).toHaveBeenCalledWith('partition');

    fireEvent.click(screen.getByText('🟢 Gangachse (600mm)'));
    expect(onToggleLayer2D).toHaveBeenCalledWith('walkway');

    fireEvent.click(screen.getByText('📏 Maßlinien'));
    expect(onToggleLayer2D).toHaveBeenCalledWith('dimensions');
  });
});
