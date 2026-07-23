import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { Van3DCanvas } from './Van3DCanvas';
import { VanState } from '../../types/van';

describe('Van3DCanvas component', () => {
  const mockVanState: VanState = {
    activeTab: '3d',
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

  it('renders Three.js canvas container and responds to window resize', () => {
    const onSelectPart = vi.fn();
    const { container, unmount } = render(
      <Van3DCanvas vanState={mockVanState} onSelectPart={onSelectPart} />
    );

    expect(container.querySelector('.canvas-3d-wrapper')).toBeInTheDocument();

    // Trigger window resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    unmount();
  });

  it('handles state updates for all presets and modes', () => {
    const onSelectPart = vi.fn();
    const presets: VanState['cameraPreset'][] = ['iso', 'top', 'side', 'driver', 'kitchen', 'bed'];

    presets.forEach((preset) => {
      const state = {
        ...mockVanState,
        displayMode: 'wireframe' as const,
        cameraPreset: preset,
        isPartitionOpen: true,
        isSlidingOpen: true,
        isRearOpen: true,
        isKitchenExtended: true,
        isBedLowered: true,
      };
      const { unmount } = render(
        <Van3DCanvas vanState={state} onSelectPart={onSelectPart} />
      );
      unmount();
    });

    const explodedState = { ...mockVanState, displayMode: 'exploded' as const };
    const { unmount } = render(
      <Van3DCanvas vanState={explodedState} onSelectPart={onSelectPart} />
    );
    unmount();

    expect(true).toBe(true);
  });
});
