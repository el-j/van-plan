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
 * Generates Authentic Mercedes T1 Bremer GFK High-Roof (Hochdach) 3D Solid Shell Mesh
 */
export function createBremerRoofGeometry(cargoLengthMm: number = 3050): THREE.BufferGeometry {
  const L = cargoLengthMm / 1000;
  const W = 1.72; // Full cargo width

  // Create solid curved roof cap geometry (X-Y plane cross section, extruded along Z)
  const shape = new THREE.Shape();
  // Bottom left shoulder at Y = 1.40m
  shape.moveTo(-W / 2, 1.40);
  // Curve up to roof shoulder
  shape.quadraticCurveTo(-W / 2, 1.75, -0.65, 1.85);
  // Top flat crowned roof line
  shape.lineTo(0.65, 1.85);
  // Right roof shoulder curve
  shape.quadraticCurveTo(W / 2, 1.75, W / 2, 1.40);
  // Close top cap
  shape.lineTo(W / 2, 1.42);
  shape.quadraticCurveTo(W / 2 - 0.02, 1.77, 0.65, 1.87);
  shape.lineTo(-0.65, 1.87);
  shape.quadraticCurveTo(-W / 2 + 0.02, 1.77, -W / 2, 1.42);
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
 * Generates Front Driver Cockpit (Bremer Short-Snout Nose & Windshield) 3D Group
 */
export function createDriverCabGroup(driveSide: 'LHD' | 'RHD' = 'LHD'): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, roughness: 0.1 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  // Bonnet / Engine Hood (Sloped 45 deg nose from Z = -2.40 to Z = -1.95)
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.85, 0.40);
  hoodShape.lineTo(-0.85, 0.85);
  hoodShape.lineTo(0.85, 0.85);
  hoodShape.lineTo(0.85, 0.40);
  hoodShape.closePath();

  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, { steps: 1, depth: 0.45, bevelEnabled: false });
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
  hoodMesh.position.set(0, 0, -2.40);
  group.add(hoodMesh);

  // Slanted Windshield (From Z = -1.95, Y = 0.85 to Z = -1.65, Y = 1.45)
  const windGeo = new THREE.BoxGeometry(1.60, 0.70, 0.03);
  const windMesh = new THREE.Mesh(windGeo, glassMat);
  windMesh.rotation.x = -Math.PI / 4;
  windMesh.position.set(0, 1.15, -1.80);
  group.add(windMesh);

  // Driver & Passenger Seats in Cockpit based on LHD vs RHD
  const driverX = driveSide === 'LHD' ? -0.45 : 0.45;
  const passX = driveSide === 'LHD' ? 0.45 : -0.45;

  const seatDriver = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.48), seatMat);
  seatDriver.position.set(driverX, 0.50, -1.55); // Driver seat
  group.add(seatDriver);

  const seatPassenger = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.48), seatMat);
  seatPassenger.position.set(passX, 0.50, -1.55); // Passenger seat
  group.add(seatPassenger);

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
