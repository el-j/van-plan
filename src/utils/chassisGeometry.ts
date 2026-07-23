import * as THREE from 'three';
import { MB_BREMER_DIMENSIONS } from '../data/vehicleData';

export interface SickenbodenConfig {
  lengthMm: number; // 3050 mm
  widthMm: number; // 1720 mm
  ribDepthMm: number; // 15 mm
  ribWidthMm: number; // 45 mm
  ribPitchMm: number; // 80 mm
}

export interface FrameRailConfig {
  lengthMm: number; // 3050 mm
  railWidthMm: number; // 50 mm
  railHeightMm: number; // 100 mm
  spacingCenterMm: number; // 820 mm
}

/**
 * Generates 3D Parametric Mesh for Mercedes 309D Sickenboden (Corrugated Metal Cargo Floor)
 */
export function createSickenbodenGeometry(config: SickenbodenConfig = {
  lengthMm: MB_BREMER_DIMENSIONS.cargoLength,
  widthMm: MB_BREMER_DIMENSIONS.cargoWidth,
  ribDepthMm: 15,
  ribWidthMm: 45,
  ribPitchMm: 80,
}): THREE.BufferGeometry {
  const L = config.lengthMm / 1000;
  const W = config.widthMm / 1000;
  const depth = config.ribDepthMm / 1000;
  const pitch = config.ribPitchMm / 1000;

  const numRibs = Math.floor(config.widthMm / config.ribPitchMm);
  const shape = new THREE.Shape();

  shape.moveTo(-W / 2, 0);

  for (let i = 0; i < numRibs; i++) {
    const startX = -W / 2 + i * pitch;
    shape.lineTo(startX + 0.01, 0);
    shape.lineTo(startX + 0.02, depth);
    shape.lineTo(startX + 0.055, depth);
    shape.lineTo(startX + 0.065, 0);
    shape.lineTo(startX + pitch, 0);
  }
  shape.lineTo(W / 2, 0);
  shape.lineTo(W / 2, -0.003);
  shape.lineTo(-W / 2, -0.003);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: L,
    bevelEnabled: false,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

/**
 * Generates Underbody C-Channel Chassis Main Frame Steel Beams
 */
export function createChassisFrameRailsGeometry(config: FrameRailConfig = {
  lengthMm: MB_BREMER_DIMENSIONS.cargoLength,
  railWidthMm: 50,
  railHeightMm: 100,
  spacingCenterMm: 820,
}): THREE.Group {
  const group = new THREE.Group();
  const L = config.lengthMm / 1000;
  const w = config.railWidthMm / 1000;
  const h = config.railHeightMm / 1000;
  const spacing = config.spacingCenterMm / 1000;

  const railGeo = new THREE.BoxGeometry(w, h, L);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });

  const railL = new THREE.Mesh(railGeo, railMat);
  railL.position.set(-spacing / 2, -h / 2 - 0.005, 0);
  railL.castShadow = true;
  group.add(railL);

  const railR = new THREE.Mesh(railGeo, railMat);
  railR.position.set(spacing / 2, -h / 2 - 0.005, 0);
  railR.castShadow = true;
  group.add(railR);

  return group;
}

/**
 * Generates C/D Pillar Vertical Wall Structural Ribs
 */
export function createWallPillarsGroup(cargoLengthMm: number = 3050, cargoHeightMm: number = 1850, spacingMm: number = 600): THREE.Group {
  const group = new THREE.Group();
  const L = cargoLengthMm / 1000;
  const H = cargoHeightMm / 1000;
  const pillarGeo = new THREE.BoxGeometry(0.03, H * 0.75, 0.04);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });

  const startZ = -L / 2 + 0.3;
  const endZ = L / 2 - 0.3;

  for (let z = startZ; z <= endZ; z += spacingMm / 1000) {
    const pL = new THREE.Mesh(pillarGeo, pillarMat);
    pL.position.set(-0.84, (H * 0.75) / 2, z);
    group.add(pL);

    const pR = new THREE.Mesh(pillarGeo, pillarMat);
    pR.position.set(0.84, (H * 0.75) / 2, z);
    group.add(pR);
  }

  return group;
}

/**
 * Generates 100% Authentic Mercedes-Benz T1 Bremer (W602/309D/310D) 3D Body Shell Group
 */
export function createBremerBodyShellGroup(
  driveSide: 'LHD' | 'RHD' = 'LHD',
  isWireframe: boolean = false
): THREE.Group {
  const group = new THREE.Group();

  // Materials
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.3,
    metalness: 0.4,
    transparent: true,
    opacity: isWireframe ? 0.4 : 0.25,
    wireframe: isWireframe,
  });

  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, roughness: 0.1 });
  const amberMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 });

  const W = 1.72; // Width
  const L = 3.05; // Cargo length

  // 1. Lower Cargo Body Box (Side Walls up to Shoulder Y = 1.40m)
  const lowerBodyGeo = new THREE.BoxGeometry(W, 1.40, L);
  const lowerBodyMesh = new THREE.Mesh(lowerBodyGeo, bodyMat);
  lowerBodyMesh.position.set(0, 0.70, 0);
  lowerBodyMesh.userData = { isVehicleHull: true };
  group.add(lowerBodyMesh);

  // 2. Rain Gutters (Regenrinne) along left & right roof lines
  const gutterGeo = new THREE.BoxGeometry(0.04, 0.03, L + 1.2);
  const gutterMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  const gutterL = new THREE.Mesh(gutterGeo, gutterMat);
  gutterL.position.set(-W / 2 - 0.02, 1.40, -0.4);
  group.add(gutterL);

  const gutterR = new THREE.Mesh(gutterGeo, gutterMat);
  gutterR.position.set(W / 2 + 0.02, 1.40, -0.4);
  group.add(gutterR);

  // 3. Aerodynamic GFK High Roof (Original Bremer Hochdach with Front Forehead Cap)
  const roofGroup = new THREE.Group();

  // Roof Cross Section Shape
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-W / 2, 1.40);
  roofShape.quadraticCurveTo(-W / 2, 1.75, -0.65, 1.85);
  roofShape.lineTo(0.65, 1.85);
  roofShape.quadraticCurveTo(W / 2, 1.75, W / 2, 1.40);
  roofShape.lineTo(W / 2, 1.42);
  roofShape.quadraticCurveTo(W / 2 - 0.02, 1.77, 0.65, 1.87);
  roofShape.lineTo(-0.65, 1.87);
  roofShape.quadraticCurveTo(-W / 2 + 0.02, 1.77, -W / 2, 1.42);
  roofShape.closePath();

  // Main Roof Extrusion over cargo area
  const mainRoofGeo = new THREE.ExtrudeGeometry(roofShape, { steps: 1, depth: L, bevelEnabled: false });
  mainRoofGeo.center();
  const mainRoofMesh = new THREE.Mesh(mainRoofGeo, bodyMat);
  mainRoofMesh.position.set(0, 0, 0);
  mainRoofMesh.userData = { isVehicleHull: true };
  roofGroup.add(mainRoofMesh);

  // Aerodynamic Front Forehead Cap (Stirn / Dachüberstand over driver cab)
  const foreheadShape = new THREE.Shape();
  foreheadShape.moveTo(-W / 2 + 0.05, 1.45);
  foreheadShape.quadraticCurveTo(-W / 2 + 0.05, 1.70, -0.60, 1.82);
  foreheadShape.lineTo(0.60, 1.82);
  foreheadShape.quadraticCurveTo(W / 2 - 0.05, 1.70, W / 2 - 0.05, 1.45);
  foreheadShape.closePath();

  const foreheadGeo = new THREE.ExtrudeGeometry(foreheadShape, { steps: 1, depth: 0.50, bevelEnabled: false });
  foreheadGeo.center();
  const foreheadMesh = new THREE.Mesh(foreheadGeo, bodyMat);
  foreheadMesh.rotation.x = -Math.PI / 8; // Aerodynamic forward slope
  foreheadMesh.position.set(0, 0.02, -L / 2 - 0.22);
  foreheadMesh.userData = { isVehicleHull: true };
  roofGroup.add(foreheadMesh);

  // Longitudinal Roof Strengthening Ribs (3 parallel ribs on roof top)
  const ribGeo = new THREE.BoxGeometry(0.04, 0.03, L - 0.4);
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  const ribCenter = new THREE.Mesh(ribGeo, ribMat);
  ribCenter.position.set(0, 1.87, 0);
  roofGroup.add(ribCenter);

  const ribLeft = new THREE.Mesh(ribGeo, ribMat);
  ribLeft.position.set(-0.35, 1.86, 0);
  roofGroup.add(ribLeft);

  const ribRight = new THREE.Mesh(ribGeo, ribMat);
  ribRight.position.set(0.35, 1.86, 0);
  roofGroup.add(ribRight);

  group.add(roofGroup);

  // 4. Front Snout, Mercedes Grille & Round Headlights
  const frontGroup = new THREE.Group();

  // Bumper (Stoßstange)
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.18, 0.15), blackMat);
  bumper.position.set(0, 0.25, -2.55);
  frontGroup.add(bumper);

  // Grille Frame (Kühlergrill)
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.32, 0.05), blackMat);
  grille.position.set(0, 0.55, -2.46);
  frontGroup.add(grille);

  // Mercedes Star Badge (Chrome Circle)
  const star = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), chromeMat);
  star.rotation.x = Math.PI / 2;
  star.position.set(0, 0.55, -2.48);
  frontGroup.add(star);

  // Dual Round Glass Headlights (Rundscheinwerfer)
  const headlightGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16);
  headlightGeo.rotateX(Math.PI / 2);

  const headlightL = new THREE.Mesh(headlightGeo, chromeMat);
  headlightL.position.set(-0.52, 0.55, -2.48);
  frontGroup.add(headlightL);

  const headlightR = new THREE.Mesh(headlightGeo, chromeMat);
  headlightR.position.set(0.52, 0.55, -2.48);
  frontGroup.add(headlightR);

  // Corner Amber Turn Indicators
  const indicatorL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.06), amberMat);
  indicatorL.position.set(-0.76, 0.55, -2.44);
  frontGroup.add(indicatorL);

  const indicatorR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.06), amberMat);
  indicatorR.position.set(0.76, 0.55, -2.44);
  frontGroup.add(indicatorR);

  // Slanted Hood Bonnet
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.84, 0.40);
  hoodShape.lineTo(-0.84, 0.85);
  hoodShape.lineTo(0.84, 0.85);
  hoodShape.lineTo(0.84, 0.40);
  hoodShape.closePath();

  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, { steps: 1, depth: 0.48, bevelEnabled: false });
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
  hoodMesh.position.set(0, 0, -2.42);
  frontGroup.add(hoodMesh);

  // Slanted Windshield Frame & Glass
  const windFrame = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.68, 0.05), blackMat);
  windFrame.rotation.x = -Math.PI / 4;
  windFrame.position.set(0, 1.15, -1.80);
  frontGroup.add(windFrame);

  const windGlass = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.60, 0.02), glassMat);
  windGlass.rotation.x = -Math.PI / 4;
  windGlass.position.set(0, 1.15, -1.81);
  frontGroup.add(windGlass);

  // Driver & Passenger Cockpit Seats based on LHD vs RHD
  const driverX = driveSide === 'LHD' ? -0.45 : 0.45;
  const passX = driveSide === 'LHD' ? 0.45 : -0.45;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  const seatDriver = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.48), seatMat);
  seatDriver.position.set(driverX, 0.50, -1.55);
  frontGroup.add(seatDriver);

  const seatPassenger = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.48), seatMat);
  seatPassenger.position.set(passX, 0.50, -1.55);
  frontGroup.add(seatPassenger);

  group.add(frontGroup);

  return group;
}

/**
 * Calculates Sickenboden Corrugation Metrics
 */
export function calculateSickenbodenMetrics(widthMm: number = 1720, pitchMm: number = 80) {
  const count = Math.floor(widthMm / pitchMm);
  const totalRibAreaM2 = (count * 45 * 3050) / 1000000;
  return {
    ribCount: count,
    totalRibAreaM2,
    pitchMm,
  };
}
