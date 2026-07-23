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

  it('renders canvas element for floor view', () => {
    const { container } = render(<BlueprintCanvas2D vanState={mockVanState} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
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

  it('renders fallback for exploded view', () => {
    const explodedState = { ...mockVanState, blueprintView: 'exploded' as const };
    const { container } = render(<BlueprintCanvas2D vanState={explodedState} />);
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
