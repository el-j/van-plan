import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVanState } from './useVanState';
import { INTERIOR_MODULES } from '../data/modulesData';

describe('useVanState hook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useVanState());

    expect(result.current.state.activeTab).toBe('3d');
    expect(result.current.state.unit).toBe('mm');
    expect(result.current.state.isPartitionOpen).toBe(false);
    expect(result.current.state.isBedLowered).toBe(false);
  });

  it('updates active tab', () => {
    const { result } = renderHook(() => useVanState());

    act(() => {
      result.current.setActiveTab('2d');
    });
    expect(result.current.state.activeTab).toBe('2d');
  });

  it('toggles partition, sliding door, rear doors, kitchen, and bed', () => {
    const { result } = renderHook(() => useVanState());

    act(() => {
      result.current.togglePartitionDoor();
    });
    expect(result.current.state.isPartitionOpen).toBe(true);

    act(() => {
      result.current.toggleSlidingDoor();
    });
    expect(result.current.state.isSlidingOpen).toBe(true);

    act(() => {
      result.current.toggleRearDoors();
    });
    expect(result.current.state.isRearOpen).toBe(true);

    // Toggle kitchen on
    act(() => {
      result.current.toggleKitchen();
    });
    expect(result.current.state.isKitchenExtended).toBe(true);
    expect(result.current.state.isSlidingOpen).toBe(true);

    // Toggle kitchen off
    act(() => {
      result.current.toggleKitchen();
    });
    expect(result.current.state.isKitchenExtended).toBe(false);

    act(() => {
      result.current.toggleBed();
    });
    expect(result.current.state.isBedLowered).toBe(true);
  });

  it('updates display mode, camera preset, blueprint view, unit, cutaway position, and inspected part', () => {
    const { result } = renderHook(() => useVanState());

    act(() => {
      result.current.setDisplayMode('wireframe');
      result.current.setCameraPreset('top');
      result.current.setBlueprintView('side');
      result.current.setUnit('cm');
      result.current.setCutawayPosition(0.8);
      result.current.setSelectedModuleId('bed');
      result.current.setInspectedPart(INTERIOR_MODULES[0]);
    });

    expect(result.current.state.displayMode).toBe('wireframe');
    expect(result.current.state.cameraPreset).toBe('top');
    expect(result.current.state.blueprintView).toBe('side');
    expect(result.current.state.unit).toBe('cm');
    expect(result.current.state.cutawayPosition).toBe(0.8);
    expect(result.current.state.selectedModuleId).toBe('bed');
    expect(result.current.state.inspectedPart).toEqual(INTERIOR_MODULES[0]);
  });
});
