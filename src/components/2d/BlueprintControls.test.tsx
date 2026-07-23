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
    isPartitionOpen: false,
    isSlidingOpen: false,
    isRearOpen: false,
    isKitchenExtended: false,
    isBedLowered: false,
    displayMode: 'solid',
    cutawayAxis: 'z',
    cutawayPosition: 0.5,
    cameraPreset: 'iso',
    blueprintView: 'floor',
    showDimensions2D: true,
    showPassageways2D: true,
    inspectedPart: null,
  };

  it('renders perspective buttons and triggers callback on click', () => {
    const onSetBlueprintView = vi.fn();

    render(
      <BlueprintControls
        vanState={initialVanState}
        onSetBlueprintView={onSetBlueprintView}
      />
    );

    fireEvent.click(screen.getByText('Draufsicht (Grundriss mm)'));
    expect(onSetBlueprintView).toHaveBeenCalledWith('floor');

    fireEvent.click(screen.getByText('Längsschnitt (Seitenprofil)'));
    expect(onSetBlueprintView).toHaveBeenCalledWith('side');

    fireEvent.click(screen.getByText('Querschnitt (Heckprofil)'));
    expect(onSetBlueprintView).toHaveBeenCalledWith('rear');
  });
});
