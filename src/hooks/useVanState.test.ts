import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVanState } from './useVanState';
import { INTERIOR_MODULES } from '../data/modulesData';

describe('useVanState hook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useVanState());

    expect(result.current.state.activeTab).toBe('3d');
    expect(result.current.state.unit).toBe('mm');
    expect(result.current.state.driveSide).toBe('LHD');
    expect(result.current.state.isPartitionOpen).toBe(false);
    expect(result.current.state.isBedLowered).toBe(false);
  });

  it('updates active tab and driveSide', () => {
    const { result } = renderHook(() => useVanState());

    act(() => {
      result.current.setActiveTab('2d');
      result.current.setDriveSide('RHD');
      result.current.setCutawayPosition(0.7);
      result.current.setSelectedModuleId('bed');
    });
    expect(result.current.state.activeTab).toBe('2d');
    expect(result.current.state.driveSide).toBe('RHD');
    expect(result.current.state.cutawayPosition).toBe(0.7);
    expect(result.current.state.selectedModuleId).toBe('bed');
  });

  it('toggles partition, sliding door, rear doors, kitchen, bed, and layers', () => {
    const { result } = renderHook(() => useVanState());

    act(() => {
      result.current.togglePartitionDoor();
      result.current.toggleSlidingDoor();
      result.current.toggleRearDoors();
      result.current.toggleKitchen();
      result.current.toggleBed();
      result.current.toggleLayer2D('bed');
      result.current.toggleLayer2D('kitchen');
    });

    expect(result.current.state.isPartitionOpen).toBe(true);
    expect(result.current.state.isSlidingOpen).toBe(true);
    expect(result.current.state.isRearOpen).toBe(true);
    expect(result.current.state.isKitchenExtended).toBe(true);
    expect(result.current.state.isBedLowered).toBe(true);
    expect(result.current.state.visibleLayers2D.bed).toBe(false);
    expect(result.current.state.visibleLayers2D.kitchen).toBe(false);
  });
});
