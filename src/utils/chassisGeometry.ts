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
  // Convert mm to 3D Scene Meters (scale 1m = 1000mm)
  const L = config.lengthMm / 1000;
  const W = config.widthMm / 1000;
  const depth = config.ribDepthMm / 1000;
  const pitch = config.ribPitchMm / 1000;

  const numRibs = Math.floor(config.widthMm / config.ribPitchMm);
  const shape = new THREE.Shape();

  // Start at bottom left of floor profile (X axis cross section)
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
  shape.lineTo(W / 2, -0.003); // 3mm sheet metal thickness
  shape.lineTo(-W / 2, -0.003);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: L,
    bevelEnabled: false,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center extrusion along Z axis
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

  // Left Frame Rail
  const railL = new THREE.Mesh(railGeo, railMat);
  railL.position.set(-spacing / 2, -h / 2 - 0.005, 0);
  railL.castShadow = true;
  group.add(railL);

  // Right Frame Rail
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
  const pillarGeo = new THREE.BoxGeometry(0.03, H, 0.04);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });

  const startZ = -L / 2 + 0.3;
  const endZ = L / 2 - 0.3;

  for (let z = startZ; z <= endZ; z += spacingMm / 1000) {
    // Left Wall Pillar
    const pL = new THREE.Mesh(pillarGeo, pillarMat);
    pL.position.set(-0.85, H / 2, z);
    group.add(pL);

    // Right Wall Pillar
    const pR = new THREE.Mesh(pillarGeo, pillarMat);
    pR.position.set(0.85, H / 2, z);
    group.add(pR);
  }

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
