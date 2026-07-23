import { VehicleDimensions } from '../types/van';

export const MB_BREMER_DIMENSIONS: VehicleDimensions = {
  cargoLength: 3050, // mm (from partition wall behind driver seat to rear doors)
  cargoWidth: 1720, // mm (wall-to-wall width at mid height)
  cargoHeight: 1850, // mm (floor to center high roof ceiling)
  archWidth: 340, // mm (single wheel arch width protruding into cargo)
  archHeight: 380, // mm (wheel arch top height from metal floor)
  archLength: 850, // mm (wheel arch length)
  archDistanceBetween: 1040, // mm (usable width between rear wheel arches)
  slidingDoorWidth: 1100, // mm (passenger side right door opening)
  slidingDoorHeight: 1400, // mm
  partitionDoorWidth: 650, // mm (passage width of sliding door into driver cabin)
  partitionDoorHeight: 1800, // mm
  totalVehicleLength: 5230, // mm (overall bumper to bumper)
};

export interface VehicleSpecDetail {
  label: string;
  value: string;
  unit?: string;
  category: 'Fahrzeug' | 'Abmessungen' | 'Gewichte' | 'Besonderheiten';
}

export const MB_BREMER_SPECS: VehicleSpecDetail[] = [
  { label: 'Modell', value: 'Mercedes-Benz T1 (W602 / 308D - 310D RTW)', category: 'Fahrzeug' },
  { label: 'Baujahr', value: '1987', category: 'Fahrzeug' },
  { label: 'Lenkung', value: 'Linkslenker (LHD - Deutschland)', category: 'Fahrzeug' },
  { label: 'Dachtyp', value: 'Original Mercedes RTW Hochdach (GFK)', category: 'Fahrzeug' },
  { label: 'Zul. Gesamtgewicht', value: '3.500 kg (Fahrzeugklasse M1 / N1)', category: 'Gewichte' },
  { label: 'Leergewicht Basis', value: '2.280 kg', category: 'Gewichte' },
  { label: 'Nutzlast für Ausbau', value: '1.220 kg MAX', category: 'Gewichte' },
  { label: 'Laderaumlänge (L2)', value: '3.050 mm', category: 'Abmessungen' },
  { label: 'Laderaumbreite (B2)', value: '1.720 mm', category: 'Abmessungen' },
  { label: 'Ladehöhe / Stehhöhe (H2)', value: '1.850 mm', category: 'Abmessungen' },
  { label: 'Breite zw. Radkästen', value: '1.040 mm', category: 'Abmessungen' },
  { label: 'Schiebetür (Rechts)', value: '1.100 mm x 1.400 mm', category: 'Abmessungen' },
  { label: 'Trennwand-Durchgang', value: '650 mm Schiebetür nach links', category: 'Besonderheiten' },
  { label: 'Besonderheiten RTW', value: 'Integrierte Trittstufe Heck, Thermo-Doppelverglasung seitlich', category: 'Besonderheiten' },
];
