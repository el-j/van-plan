export type TabType = '3d' | '2d' | 'workshop' | 'bom' | 'schematic';
export type DisplayMode = 'solid' | 'wireframe' | 'exploded' | 'cutaway';
export type MetricUnit = 'mm' | 'cm' | 'm';

export interface VehicleDimensions {
  cargoLength: number; // 3050 mm
  cargoWidth: number; // 1720 mm
  cargoHeight: number; // 1850 mm
  archWidth: number; // 340 mm
  archHeight: number; // 380 mm
  archLength: number; // 850 mm
  archDistanceBetween: number; // 1040 mm
  slidingDoorWidth: number; // 1100 mm
  slidingDoorHeight: number; // 1400 mm
  partitionDoorWidth: number; // 650 mm
  partitionDoorHeight: number; // 1800 mm
  totalVehicleLength: number; // 5230 mm
}

export type ModuleCategory = 
  | 'Chassis & Subfloor'
  | 'Bed & Elevator'
  | 'Kitchen & Outdoor'
  | 'Seating & Lounge'
  | 'Partition & Storage'
  | 'Sanitation & Dry Toilet'
  | 'Electrical System'
  | 'Water & Plumbing';

export interface CutListItem {
  id: string;
  name: string;
  material: string;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number;
  quantity: number;
  angleLeft: number;
  angleRight: number;
  edgeBanding?: string;
  notes?: string;
}

export interface AssemblyStep {
  stepNumber: number;
  title: string;
  description: string;
  toolsNeeded: string[];
  fastenersNeeded: string[];
  safetyNotes?: string;
  tip?: string;
}

export interface ResellerLink {
  supplier: string;
  partName: string;
  partNumber: string;
  url: string;
  unitPrice: number;
  currency: string;
  inStock: boolean;
}

export interface BOMItem {
  id: string;
  moduleId: string;
  category: ModuleCategory;
  name: string;
  specification: string;
  dimensionsMm?: string;
  quantity: number;
  unit: string;
  unitPriceEuro: number;
  totalPriceEuro: number;
  weightKg: number;
  totalWeightKg: number;
  supplier: string;
  partNumber: string;
  shopUrl: string;
  notes?: string;
}

export interface InteriorModule {
  id: string;
  name: string;
  category: ModuleCategory;
  shortDescription: string;
  fullDescription: string;
  dimensionsMm: {
    length: number;
    width: number;
    height: number;
  };
  weightKg: number;
  totalCostEuro: number;
  materials: string[];
  cutList: CutListItem[];
  assemblySteps: AssemblyStep[];
  resellerLinks: ResellerLink[];
  highlights: string[];
}

export interface VanState {
  activeTab: TabType;
  selectedModuleId: string | null;
  unit: MetricUnit;
  // Interactive Toggles
  isPartitionOpen: boolean;
  isSlidingOpen: boolean;
  isRearOpen: boolean;
  isKitchenExtended: boolean;
  isBedLowered: boolean;
  // 3D Controls
  displayMode: DisplayMode;
  cutawayAxis: 'x' | 'y' | 'z';
  cutawayPosition: number; // 0 to 1
  cameraPreset: 'iso' | 'top' | 'side' | 'driver' | 'kitchen' | 'bed';
  // 2D Controls
  blueprintView: 'floor' | 'side' | 'rear' | 'exploded';
  showDimensions2D: boolean;
  showPassageways2D: boolean;
  // Inspector
  inspectedPart: BOMItem | InteriorModule | null;
}
