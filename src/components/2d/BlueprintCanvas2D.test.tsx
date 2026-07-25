import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BlueprintCanvas2D } from './BlueprintCanvas2D';
import { VanState } from '../../types/van';

describe('BlueprintCanvas2D component', () => {
  const mockVanState: VanState = {
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

  it('renders canvas element for floor view (LHD & RHD)', () => {
    const { container, rerender } = render(<BlueprintCanvas2D vanState={mockVanState} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();

    const rhdState = { ...mockVanState, driveSide: 'RHD' as const };
    rerender(<BlueprintCanvas2D vanState={rhdState} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders canvas element for side elevation view', () => {
    const sideState = { ...mockVanState, blueprintView: 'side' as const };
    const { container } = render(<BlueprintCanvas2D vanState={sideState} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders canvas element for rear elevation view', () => {
    const rearState = { ...mockVanState, blueprintView: 'rear' as const };
    const { container } = render(<BlueprintCanvas2D vanState={rearState} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('handles null canvas context gracefully', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { container } = render(<BlueprintCanvas2D vanState={mockVanState} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    spy.mockRestore();
  });
});
