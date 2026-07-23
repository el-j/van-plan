import { useState } from 'react';
import { VanState, TabType, MetricUnit, DisplayMode, InteriorModule, BOMItem, DriveSide, VisibleLayers2D } from '../types/van';

export function useVanState() {
  const [state, setState] = useState<VanState>({
    activeTab: '3d',
    selectedModuleId: null,
    unit: 'mm',
    driveSide: 'LHD', // German standard (Left-hand drive)
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
  });

  const setActiveTab = (tab: TabType) => setState((prev) => ({ ...prev, activeTab: tab }));
  const setUnit = (unit: MetricUnit) => setState((prev) => ({ ...prev, unit }));
  const setDriveSide = (driveSide: DriveSide) => setState((prev) => ({ ...prev, driveSide }));

  const togglePartitionDoor = () => setState((prev) => ({ ...prev, isPartitionOpen: !prev.isPartitionOpen }));
  const toggleSlidingDoor = () => setState((prev) => ({ ...prev, isSlidingOpen: !prev.isSlidingOpen }));
  const toggleRearDoors = () => setState((prev) => ({ ...prev, isRearOpen: !prev.isRearOpen }));
  const toggleKitchen = () => setState((prev) => ({
    ...prev,
    isKitchenExtended: !prev.isKitchenExtended,
    isSlidingOpen: !prev.isKitchenExtended ? true : prev.isSlidingOpen,
  }));
  const toggleBed = () => setState((prev) => ({ ...prev, isBedLowered: !prev.isBedLowered }));

  const setDisplayMode = (mode: DisplayMode) => setState((prev) => ({ ...prev, displayMode: mode }));
  const setCutawayPosition = (pos: number) => setState((prev) => ({ ...prev, cutawayPosition: pos }));
  const setCameraPreset = (preset: VanState['cameraPreset']) => setState((prev) => ({ ...prev, cameraPreset: preset }));
  const setBlueprintView = (view: VanState['blueprintView']) => setState((prev) => ({ ...prev, blueprintView: view }));

  const setSelectedModuleId = (id: string | null) => setState((prev) => ({ ...prev, selectedModuleId: id }));
  const setInspectedPart = (part: BOMItem | InteriorModule | null) => setState((prev) => ({ ...prev, inspectedPart: part }));

  const toggleLayer2D = (layer: keyof VisibleLayers2D) => {
    setState((prev) => ({
      ...prev,
      visibleLayers2D: {
        ...prev.visibleLayers2D,
        [layer]: !prev.visibleLayers2D[layer],
      },
    }));
  };

  return {
    state,
    setActiveTab,
    setUnit,
    setDriveSide,
    togglePartitionDoor,
    toggleSlidingDoor,
    toggleRearDoors,
    toggleKitchen,
    toggleBed,
    setDisplayMode,
    setCutawayPosition,
    setCameraPreset,
    setBlueprintView,
    setSelectedModuleId,
    setInspectedPart,
    toggleLayer2D,
  };
}
