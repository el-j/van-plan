import { useState, useCallback } from 'react';
import { TabType, DisplayMode, MetricUnit, VanState, BOMItem, InteriorModule } from '../types/van';

export function useVanState() {
  const [state, setState] = useState<VanState>({
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
  });

  const setActiveTab = useCallback((tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const setSelectedModuleId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedModuleId: id }));
  }, []);

  const setUnit = useCallback((unit: MetricUnit) => {
    setState((prev) => ({ ...prev, unit }));
  }, []);

  const togglePartitionDoor = useCallback(() => {
    setState((prev) => ({ ...prev, isPartitionOpen: !prev.isPartitionOpen }));
  }, []);

  const toggleSlidingDoor = useCallback(() => {
    setState((prev) => ({ ...prev, isSlidingOpen: !prev.isSlidingOpen }));
  }, []);

  const toggleRearDoors = useCallback(() => {
    setState((prev) => ({ ...prev, isRearOpen: !prev.isRearOpen }));
  }, []);

  const toggleKitchen = useCallback(() => {
    setState((prev) => {
      const nextKitchen = !prev.isKitchenExtended;
      // Auto open sliding door if kitchen is extending outdoor
      return {
        ...prev,
        isKitchenExtended: nextKitchen,
        isSlidingOpen: nextKitchen ? true : prev.isSlidingOpen,
      };
    });
  }, []);

  const toggleBed = useCallback(() => {
    setState((prev) => ({ ...prev, isBedLowered: !prev.isBedLowered }));
  }, []);

  const setDisplayMode = useCallback((displayMode: DisplayMode) => {
    setState((prev) => ({ ...prev, displayMode }));
  }, []);

  const setCameraPreset = useCallback((cameraPreset: VanState['cameraPreset']) => {
    setState((prev) => ({ ...prev, cameraPreset }));
  }, []);

  const setCutawayPosition = useCallback((cutawayPosition: number) => {
    setState((prev) => ({ ...prev, cutawayPosition }));
  }, []);

  const setBlueprintView = useCallback((blueprintView: VanState['blueprintView']) => {
    setState((prev) => ({ ...prev, blueprintView }));
  }, []);

  const setInspectedPart = useCallback((inspectedPart: BOMItem | InteriorModule | null) => {
    setState((prev) => ({ ...prev, inspectedPart }));
  }, []);

  return {
    state,
    setActiveTab,
    setSelectedModuleId,
    setUnit,
    togglePartitionDoor,
    toggleSlidingDoor,
    toggleRearDoors,
    toggleKitchen,
    toggleBed,
    setDisplayMode,
    setCameraPreset,
    setCutawayPosition,
    setBlueprintView,
    setInspectedPart,
  };
}
