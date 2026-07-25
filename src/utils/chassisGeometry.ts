import * as THREE from 'three';
import { MB_BREMER_DIMENSIONS } from '../data/vehicleData';

export interface SickenbodenConfig {
  lengthMm: number;
  widthMm: number;
  ribDepthMm: number;
  ribWidthMm: number;
  ribPitchMm: number;
}

export interface FrameRailConfig {
  lengthMm: number;
  railWidthMm: number;
  railHeightMm: number;
  spacingCenterMm: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  MB T1 Bremer (W601/W602) 309D/310D RTW Hochdach – Precision Modular Geometry
 * ───────────────────────────────────────────────────────────────────────────── */

export const BREMER_GEOMETRY_SPECS = {
  groundY: 0.0,
  wheelRadius: 0.35,
  wheelWidth: 0.22,
  floorY: 0.55,
  interiorHeight: 1.85,
  ceilingY: 2.40,
  roofPeakY: 2.55,
  cargoLength: 3.05,
  cargoWidth: 1.72,
  bodyWidth: 1.92,
  cabLength: 0.925, // Z = -1.525m to -2.450m
  bonnetLength: 0.40, // Z = -2.450m to -2.850m
  frontAxleZ: -2.05,
  rearAxleZ: 1.00,
};

/**
 * Generates 3D Parametric Mesh for Mercedes 309D Sickenboden
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

  const geo = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: L, bevelEnabled: false });
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

  const railGeo = new THREE.BoxGeometry(w, h, L + 1.0);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  const railY = 0.55 - h / 2 - 0.005;

  const railL = new THREE.Mesh(railGeo, railMat);
  railL.position.set(-spacing / 2, railY, -0.3);
  railL.castShadow = true;
  group.add(railL);

  const railR = new THREE.Mesh(railGeo, railMat);
  railR.position.set(spacing / 2, railY, -0.3);
  railR.castShadow = true;
  group.add(railR);

  return group;
}

/**
 * Generates C/D Pillar Vertical Wall Structural Ribs
 */
export function createWallPillarsGroup(
  cargoLengthMm: number = 3050,
  cargoHeightMm: number = 1850,
  spacingMm: number = 600
): THREE.Group {
  const group = new THREE.Group();
  const L = cargoLengthMm / 1000;
  const H = cargoHeightMm / 1000;
  const pillarGeo = new THREE.BoxGeometry(0.03, H * 0.75, 0.04);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });

  const startZ = -L / 2 + 0.3;
  const endZ = L / 2 - 0.3;

  for (let z = startZ; z <= endZ; z += spacingMm / 1000) {
    const pL = new THREE.Mesh(pillarGeo, pillarMat);
    pL.position.set(-0.84, 0.55 + (H * 0.75) / 2, z);
    group.add(pL);

    const pR = new THREE.Mesh(pillarGeo, pillarMat);
    pR.position.set(0.84, 0.55 + (H * 0.75) / 2, z);
    group.add(pR);
  }

  return group;
}

/**
 * Builds Structural Cab Pillar Framing (A-Pillars, B-Pillars, Rocker Sills, Roof Header)
 */
export function buildCabPillarFraming(isWireframe: boolean = false): THREE.Group {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4, wireframe: isWireframe });

  const W = BREMER_GEOMETRY_SPECS.bodyWidth;
  const HW = W / 2;
  const floorY = BREMER_GEOMETRY_SPECS.floorY;
  const gutterY = 1.95;
  const cabZFront = -1.525 - BREMER_GEOMETRY_SPECS.cabLength; // -2.450m

  // Left A-Pillar (slanted box from front fender to windshield top header)
  const aPillarGeo = new THREE.BoxGeometry(0.06, 1.05, 0.06);

  const aPillarL = new THREE.Mesh(aPillarGeo, frameMat);
  aPillarL.rotation.x = -Math.PI / 8; // Slanted along windshield
  aPillarL.position.set(-HW + 0.03, floorY + 0.85, cabZFront - 0.02);
  group.add(aPillarL);

  // Right A-Pillar
  const aPillarR = new THREE.Mesh(aPillarGeo, frameMat);
  aPillarR.rotation.x = -Math.PI / 8;
  aPillarR.position.set(HW - 0.03, floorY + 0.85, cabZFront - 0.02);
  group.add(aPillarR);

  // B-Pillars (vertical steel pillars at partition Z = -1.525m)
  const bPillarGeo = new THREE.BoxGeometry(0.06, 1.40, 0.06);
  const bPillarL = new THREE.Mesh(bPillarGeo, frameMat);
  bPillarL.position.set(-HW + 0.03, floorY + 0.70, -1.525);
  group.add(bPillarL);

  const bPillarR = new THREE.Mesh(bPillarGeo, frameMat);
  bPillarR.position.set(HW - 0.03, floorY + 0.70, -1.525);
  group.add(bPillarR);

  // Windshield Top Header Beam (Dachrahmen quer)
  const topHeader = new THREE.Mesh(new THREE.BoxGeometry(W, 0.05, 0.06), frameMat);
  topHeader.position.set(0, gutterY - 0.025, cabZFront);
  group.add(topHeader);

  // Door Rocker Sills (Schweller unten)
  const sillGeo = new THREE.BoxGeometry(0.06, 0.06, 0.925);
  const sillL = new THREE.Mesh(sillGeo, frameMat);
  sillL.position.set(-HW + 0.03, floorY + 0.03, -1.9875);
  group.add(sillL);

  const sillR = new THREE.Mesh(sillGeo, frameMat);
  sillR.position.set(HW - 0.03, floorY + 0.03, -1.9875);
  group.add(sillR);

  return group;
}

/**
 * Builds Continuous GFK High Roof Shell (spanning Z = +1.525m to Z = -2.45m with zero gaps)
 */
export function buildGfkHighRoofShell(bodyPaintMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const W = BREMER_GEOMETRY_SPECS.bodyWidth;
  const HW = W / 2;
  const L = BREMER_GEOMETRY_SPECS.cargoLength;
  const gutterY = 1.95;
  const roofPeakY = BREMER_GEOMETRY_SPECS.roofPeakY;
  const totalRoofLength = L + BREMER_GEOMETRY_SPECS.cabLength; // 3.975m
  const cabZFront = -1.525 - BREMER_GEOMETRY_SPECS.cabLength; // -2.450m

  // Single continuous barrel roof cross-section profile
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-HW, gutterY);
  roofShape.quadraticCurveTo(-HW, roofPeakY, -HW * 0.65, roofPeakY);
  roofShape.lineTo(HW * 0.65, roofPeakY);
  roofShape.quadraticCurveTo(HW, roofPeakY, HW, gutterY);
  roofShape.lineTo(HW - 0.025, gutterY);
  roofShape.quadraticCurveTo(HW - 0.025, roofPeakY - 0.025, HW * 0.65 - 0.01, roofPeakY - 0.025);
  roofShape.lineTo(-HW * 0.65 + 0.01, roofPeakY - 0.025);
  roofShape.quadraticCurveTo(-HW + 0.025, roofPeakY - 0.025, -HW + 0.025, gutterY);
  roofShape.closePath();

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { steps: 1, depth: totalRoofLength, bevelEnabled: false });
  const roofMesh = new THREE.Mesh(roofGeo, bodyPaintMat);
  roofMesh.position.set(0, 0, cabZFront);
  roofMesh.userData = { isVehicleHull: true, partName: 'GFK Hochdach Shell' };
  group.add(roofMesh);

  // Aerodynamic Rounded Front Visor Cap (capping seamlessly onto windshield header)
  const visorShape = new THREE.Shape();
  visorShape.moveTo(-HW, gutterY);
  visorShape.quadraticCurveTo(-HW, roofPeakY, -HW * 0.65, roofPeakY);
  visorShape.lineTo(HW * 0.65, roofPeakY);
  visorShape.quadraticCurveTo(HW, roofPeakY, HW, gutterY);
  visorShape.closePath();

  const visorGeo = new THREE.ExtrudeGeometry(visorShape, { steps: 2, depth: 0.15, bevelEnabled: true, bevelThickness: 0.10, bevelSize: 0.05, bevelSegments: 3 });
  const visorMesh = new THREE.Mesh(visorGeo, bodyPaintMat);
  visorMesh.position.set(0, 0, cabZFront - 0.15);
  visorMesh.userData = { isVehicleHull: true, partName: 'GFK Hochdach Stirnvisier' };
  group.add(visorMesh);

  return group;
}

/**
 * Builds 25° Downward Sloping Bonnet & Side Fenders (Haube & Kotflügel)
 */
export function buildFrontBonnetAndFenders(bodyPaintSolidMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const W = BREMER_GEOMETRY_SPECS.bodyWidth;
  const HW = W / 2;
  const floorY = BREMER_GEOMETRY_SPECS.floorY;
  const cabZFront = -1.525 - BREMER_GEOMETRY_SPECS.cabLength; // -2.450m
  const bumperZ = cabZFront - BREMER_GEOMETRY_SPECS.bonnetLength; // -2.850m

  // 25° Downward Sloping Bonnet Hood (from windshield base Y=1.15m down to grille top Y=0.85m)
  const bonnetShape = new THREE.Shape();
  bonnetShape.moveTo(-HW + 0.04, 0.0);
  bonnetShape.lineTo(-HW + 0.04, 0.40);
  bonnetShape.lineTo(HW - 0.04, 0.40);
  bonnetShape.lineTo(HW - 0.04, 0.0);
  bonnetShape.closePath();

  const bonnetGeo = new THREE.ExtrudeGeometry(bonnetShape, { steps: 1, depth: 0.42, bevelEnabled: false });
  const bonnetMesh = new THREE.Mesh(bonnetGeo, bodyPaintSolidMat);
  // Rotation slopes DOWNWARD towards front bumper!
  bonnetMesh.rotation.x = Math.PI / 9;
  bonnetMesh.position.set(0, floorY + 0.50, bumperZ);
  group.add(bonnetMesh);

  // Side Fenders (Kotflügel) wrapping around front wheel arches
  const fenderGeoL = new THREE.BoxGeometry(0.04, 0.40, 0.42);
  const fenderL = new THREE.Mesh(fenderGeoL, bodyPaintSolidMat);
  fenderL.position.set(-HW - 0.01, floorY + 0.20, cabZFront - 0.21);
  group.add(fenderL);

  const fenderR = new THREE.Mesh(fenderGeoL, bodyPaintSolidMat);
  fenderR.position.set(HW + 0.01, floorY + 0.20, cabZFront - 0.21);
  group.add(fenderR);

  return group;
}

/**
 * Builds 100% Authentic Mercedes-Benz T1 Bremer (W602/309D/310D) 3D Body Shell Group
 */
export function createBremerBodyShellGroup(
  driveSide: 'LHD' | 'RHD' = 'LHD',
  isWireframe: boolean = false
): THREE.Group {
  const group = new THREE.Group();

  const bodyPaint = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.35,
    metalness: 0.3,
    transparent: true,
    opacity: isWireframe ? 0.35 : 0.22,
    wireframe: isWireframe,
    side: THREE.DoubleSide,
  });

  const bodyPaintSolid = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.35,
    metalness: 0.3,
    wireframe: isWireframe,
    side: THREE.DoubleSide,
  });

  const blackPlastic = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    wireframe: isWireframe,
  });

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.08,
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    side: THREE.DoubleSide,
  });

  const amber = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2 });
  const redTail = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });

  const W = BREMER_GEOMETRY_SPECS.bodyWidth; // 1.92m
  const HW = W / 2;
  const L = BREMER_GEOMETRY_SPECS.cargoLength; // 3.05m
  const floorY = BREMER_GEOMETRY_SPECS.floorY; // 0.55m
  const gutterY = 1.95;
  const roofPeakY = BREMER_GEOMETRY_SPECS.roofPeakY; // 2.55m

  const cargoZFront = -L / 2; // -1.525m
  const cargoZRear = L / 2; // +1.525m
  const cabZFront = cargoZFront - BREMER_GEOMETRY_SPECS.cabLength; // -2.450m
  const bumperZ = cabZFront - BREMER_GEOMETRY_SPECS.bonnetLength; // -2.850m

  // 1. CARGO SIDE WALLS
  const sideWallGeo = new THREE.BoxGeometry(0.02, 1.40, L);

  const wallL = new THREE.Mesh(sideWallGeo, bodyPaint);
  wallL.position.set(-HW, floorY + 0.70, 0);
  wallL.userData = { isVehicleHull: true, partName: 'Fahrzeugwand Links' };
  group.add(wallL);

  const wallR = new THREE.Mesh(sideWallGeo, bodyPaint);
  wallR.position.set(HW, floorY + 0.70, 0);
  wallR.userData = { isVehicleHull: true, partName: 'Fahrzeugwand Rechts' };
  group.add(wallR);

  // 2. CONTINUOUS GFK HIGH ROOF SHELL
  const roofGroup = buildGfkHighRoofShell(bodyPaint);
  group.add(roofGroup);

  // 3. CAB STRUCTURAL PILLAR FRAMING (A-Pillars, B-Pillars, Rockers)
  const framing = buildCabPillarFraming(isWireframe);
  group.add(framing);

  // 4. RAIN GUTTERS
  const totalRoofLength = L + BREMER_GEOMETRY_SPECS.cabLength;
  const gutterGeo = new THREE.BoxGeometry(0.035, 0.025, totalRoofLength + 0.2);
  const gutterMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75 });
  const gutterL = new THREE.Mesh(gutterGeo, gutterMat);
  gutterL.position.set(-HW - 0.018, gutterY, -0.2);
  group.add(gutterL);
  const gutterR = new THREE.Mesh(gutterGeo, gutterMat);
  gutterR.position.set(HW + 0.018, gutterY, -0.2);
  group.add(gutterR);

  // 5. FRONT BONNET & FENDERS
  const bonnetGroup = buildFrontBonnetAndFenders(bodyPaintSolid);
  group.add(bonnetGroup);

  // 6. FRONT FACE: Grille, Headlights, Bumper & Windshield Assembly
  const frontGroup = new THREE.Group();

  const frontFace = new THREE.Mesh(new THREE.BoxGeometry(W, 0.58, 0.025), bodyPaintSolid);
  frontFace.position.set(0, floorY + 0.25, bumperZ);
  frontGroup.add(frontFace);

  const grilleBack = new THREE.Mesh(new THREE.BoxGeometry(1.40, 0.28, 0.03), blackPlastic);
  grilleBack.position.set(0, floorY + 0.30, bumperZ - 0.02);
  frontGroup.add(grilleBack);

  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.025, 0.01), chrome);
    slat.position.set(0, floorY + 0.21 + i * 0.065, bumperZ - 0.04);
    frontGroup.add(slat);
  }

  const starGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.015, 20);
  starGeo.rotateX(Math.PI / 2);
  const starMesh = new THREE.Mesh(starGeo, chrome);
  starMesh.position.set(0, floorY + 0.30, bumperZ - 0.05);
  frontGroup.add(starMesh);

  const headlightGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20);
  headlightGeo.rotateX(Math.PI / 2);
  const hlGlass = new THREE.MeshStandardMaterial({ color: 0xfefce8, transparent: true, opacity: 0.75, roughness: 0.05 });

  const hlL = new THREE.Mesh(headlightGeo, hlGlass);
  hlL.position.set(-0.56, floorY + 0.30, bumperZ - 0.04);
  frontGroup.add(hlL);
  const hlR = new THREE.Mesh(headlightGeo, hlGlass);
  hlR.position.set(0.56, floorY + 0.30, bumperZ - 0.04);
  frontGroup.add(hlR);

  const indicatorGeo = new THREE.BoxGeometry(0.12, 0.06, 0.035);
  const indL = new THREE.Mesh(indicatorGeo, amber);
  indL.position.set(-0.82, floorY + 0.30, bumperZ - 0.02);
  frontGroup.add(indL);
  const indR = new THREE.Mesh(indicatorGeo, amber);
  indR.position.set(0.82, floorY + 0.30, bumperZ - 0.02);
  frontGroup.add(indR);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 0.14, 0.10), chrome);
  bumper.position.set(0, floorY - 0.02, bumperZ - 0.04);
  frontGroup.add(bumper);

  // Raked Windshield set cleanly inside A-Pillar framing
  const windshieldW = W - 0.12;
  const windshieldH = 0.65;
  const windGeo = new THREE.BoxGeometry(windshieldW, windshieldH, 0.012);
  const windMesh = new THREE.Mesh(windGeo, glass);
  windMesh.rotation.x = -Math.PI / 9; // Raked backwards from bonnet base up to roof header!
  windMesh.position.set(0, floorY + 0.98, cabZFront - 0.02);
  frontGroup.add(windMesh);

  group.add(frontGroup);

  // 7. COCKPIT SEATS ON STEEL PEDESTALS, CURVED DASHBOARD & 45° ANGLED STEERING COLUMN
  const driverX = driveSide === 'LHD' ? -0.42 : 0.42;
  const passX = driveSide === 'LHD' ? 0.42 : -0.42;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });

  // Driver Seat & Steel Pedestal Box (Sitzkiste)
  const driverGroup = new THREE.Group();
  const pedestalD = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.25, 0.46), pedestalMat);
  pedestalD.position.set(0, 0.125, 0);
  driverGroup.add(pedestalD);

  const seatBaseD = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.48), seatMat);
  seatBaseD.position.set(0, 0.32, 0);
  driverGroup.add(seatBaseD);

  const seatBackD = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.08), seatMat);
  seatBackD.position.set(0, 0.66, 0.20);
  driverGroup.add(seatBackD);

  driverGroup.position.set(driverX, floorY, cargoZFront - 0.45);
  group.add(driverGroup);

  // Passenger Seat & Steel Pedestal Box
  const passGroup = new THREE.Group();
  const pedestalP = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.25, 0.46), pedestalMat);
  pedestalP.position.set(0, 0.125, 0);
  passGroup.add(pedestalP);

  const seatBaseP = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.48), seatMat);
  seatBaseP.position.set(0, 0.32, 0);
  passGroup.add(seatBaseP);

  const seatBackP = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.08), seatMat);
  seatBackP.position.set(0, 0.66, 0.20);
  passGroup.add(seatBackP);

  passGroup.position.set(passX, floorY, cargoZFront - 0.45);
  group.add(passGroup);

  // Curved T1 Dashboard Console
  const dashBoard = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.28, 0.35), blackPlastic);
  dashBoard.position.set(0, floorY + 0.55, cabZFront - 0.15);
  group.add(dashBoard);

  // Sloping Steering Column & 45° Angled Steering Wheel (Lenkrad)
  const stColumnGroup = new THREE.Group();
  const stColumnShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.40), blackPlastic);
  stColumnShaft.rotation.x = -Math.PI / 4; // 45° sloping column extending UP & BACK towards driver!
  stColumnShaft.position.set(0, 0.15, 0.10);
  stColumnGroup.add(stColumnShaft);

  const stWheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.016, 8, 24), blackPlastic);
  stWheelRim.rotation.x = -Math.PI / 4; // 45° tilt towards driver
  stWheelRim.position.set(0, 0.30, 0.22);
  stColumnGroup.add(stWheelRim);

  const stHub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), blackPlastic);
  stHub.rotation.x = -Math.PI / 4;
  stHub.position.set(0, 0.30, 0.22);
  stColumnGroup.add(stHub);

  stColumnGroup.position.set(driverX, floorY + 0.55, cabZFront - 0.15);
  group.add(stColumnGroup);

  // 8. REAR BUMPER & TAIL LIGHTS
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 0.12, 0.08), chrome);
  rearBumper.position.set(0, floorY - 0.02, cargoZRear + 0.05);
  group.add(rearBumper);

  const tailLightGeo = new THREE.BoxGeometry(0.14, 0.18, 0.04);
  const tailL = new THREE.Mesh(tailLightGeo, redTail);
  tailL.position.set(-HW + 0.08, floorY + 0.40, cargoZRear + 0.03);
  group.add(tailL);
  const tailR = new THREE.Mesh(tailLightGeo, redTail);
  tailR.position.set(HW - 0.08, floorY + 0.40, cargoZRear + 0.03);
  group.add(tailR);

  // 9. WHEELS
  const createWheel = (x: number, z: number) => {
    const wheelGroup = new THREE.Group();

    const tireGeo = new THREE.TorusGeometry(0.27, 0.08, 12, 24);
    tireGeo.rotateY(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rim);

    wheelGroup.position.set(x, BREMER_GEOMETRY_SPECS.wheelRadius, z);
    return wheelGroup;
  };

  group.add(createWheel(-HW - 0.02, BREMER_GEOMETRY_SPECS.frontAxleZ));
  group.add(createWheel(HW + 0.02, BREMER_GEOMETRY_SPECS.frontAxleZ));
  group.add(createWheel(-HW - 0.02, BREMER_GEOMETRY_SPECS.rearAxleZ));
  group.add(createWheel(HW + 0.02, BREMER_GEOMETRY_SPECS.rearAxleZ));

  // 10. REAR WHEEL ARCH INTRUSIONS
  const archGeo = new THREE.BoxGeometry(0.34, 0.38, 0.85);
  const archMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, roughness: 0.5 });
  const archInnerL = new THREE.Mesh(archGeo, archMat);
  archInnerL.position.set(-BREMER_GEOMETRY_SPECS.cargoWidth / 2 + 0.17, floorY + 0.19, BREMER_GEOMETRY_SPECS.rearAxleZ);
  group.add(archInnerL);
  const archInnerR = new THREE.Mesh(archGeo, archMat);
  archInnerR.position.set(BREMER_GEOMETRY_SPECS.cargoWidth / 2 - 0.17, floorY + 0.19, BREMER_GEOMETRY_SPECS.rearAxleZ);
  group.add(archInnerR);

  return group;
}

/**
 * Builds 5-Corner Openable Cab Door Group with Hinge Origin at Front A-Pillar Edge (0,0,0)
 */
export function createBremerCabDoorGroup(side: 'left' | 'right', isWireframe: boolean = false): THREE.Group {
  const doorGroup = new THREE.Group();

  const bodyPaintSolid = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.35,
    metalness: 0.3,
    wireframe: isWireframe,
    side: THREE.DoubleSide,
  });

  const blackPlastic = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    wireframe: isWireframe,
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    side: THREE.DoubleSide,
  });

  // Local Hinge Origin (0,0,0) is at front A-pillar edge (Z = -2.45m)
  // Extruded 5-corner door panel extending BACKWARDS (+Z in local coords) to B-pillar (length = 0.925m)
  const doorShape = new THREE.Shape();
  doorShape.moveTo(0, 0); // Bottom front corner (A-pillar)
  doorShape.lineTo(0.925, 0); // Bottom rear corner (B-pillar)
  doorShape.lineTo(0.925, 1.40); // Top rear corner at B-pillar header
  doorShape.lineTo(0.375, 1.40); // Top A-pillar slanted corner
  doorShape.lineTo(0, 0.30); // Front vertical lower edge at wheel arch
  doorShape.closePath();

  const doorGeo = new THREE.ExtrudeGeometry(doorShape, { steps: 1, depth: 0.03, bevelEnabled: false });
  const doorMesh = new THREE.Mesh(doorGeo, bodyPaintSolid);
  doorMesh.userData = { isVehicleHull: true, partName: side === 'left' ? 'Fahrertür' : 'Beifahrertür' };
  doorGroup.add(doorMesh);

  // Recessed Glass Window Frame & Glass Panel
  const winShape = new THREE.Shape();
  winShape.moveTo(0.075, 0.50);
  winShape.lineTo(0.875, 0.50);
  winShape.lineTo(0.875, 1.32);
  winShape.lineTo(0.40, 1.32);
  winShape.closePath();

  const winGeo = new THREE.ExtrudeGeometry(winShape, { steps: 1, depth: 0.01, bevelEnabled: false });
  const winMesh = new THREE.Mesh(winGeo, glass);
  winMesh.position.set(0, 0, 0.01);
  doorGroup.add(winMesh);

  // Outer Door Handle (at rear door edge)
  const handleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.025), blackPlastic);
  handleMesh.position.set(0.675, 0.45, side === 'left' ? -0.015 : 0.035);
  doorGroup.add(handleMesh);

  // Side Rearview Mirror (Außenspiegel) attached at front A-pillar edge
  const mirrorGroup = new THREE.Group();
  const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.14), blackPlastic);
  mirrorHousing.position.set(0.10, 0.70, side === 'left' ? -0.12 : 0.12);
  mirrorGroup.add(mirrorHousing);

  const mirrorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15), blackPlastic);
  mirrorArm.rotation.z = Math.PI / 4;
  mirrorArm.position.set(0.15, 0.65, side === 'left' ? -0.06 : 0.06);
  mirrorGroup.add(mirrorArm);

  doorGroup.add(mirrorGroup);

  return doorGroup;
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
