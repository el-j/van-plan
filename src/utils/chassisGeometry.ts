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
 *  MB T1 Bremer (W601/W602 308D/310D RTW Hochdach) – 100% Factory Blueprint Spec
 * ───────────────────────────────────────────────────────────────────────────── */

export const BREMER_GEOMETRY_SPECS = {
  groundY: 0.0,
  wheelRadius: 0.35,
  wheelWidth: 0.22,
  floorY: 0.55,
  interiorHeight: 1.85,
  ceilingY: 2.40,
  roofPeakY: 2.525, // Factory Spec 2500 - 2540 mm
  cargoLength: 3.05, // 3050 mm
  cargoWidth: 1.72, // 1720 mm
  bodyWidth: 1.975, // Factory Spec 1975 mm
  cabLength: 0.895, // Z = -1.525m (B-pillar) to -2.420m (A-pillar)
  bonnetLength: 0.35, // Z = -2.420m to -2.770m (Front overhang 720mm ahead of axle)
  frontAxleZ: -2.05,
  rearAxleZ: 0.95, // Rear overhang 1105mm behind axle
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
 * Builds Structural Cab Pillar Framing (A-Pillars slanting BACKWARD 22.5°, B-Pillars, Rocker Sills, Roof Header)
 */
export function buildCabPillarFraming(isWireframe: boolean = false): THREE.Group {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4, wireframe: isWireframe });

  const W = BREMER_GEOMETRY_SPECS.bodyWidth; // 1.975m
  const HW = W / 2; // 0.9875m
  const floorY = BREMER_GEOMETRY_SPECS.floorY; // 0.55m
  const gutterY = 1.95;
  const aPillarZ = -2.420;

  // Left A-Pillar (slanted BACKWARD towards driver: Z = -2.42m at lower cowl Y=1.15m up to Z = -2.15m at roof header Y=1.80m)
  const aPillarGeo = new THREE.BoxGeometry(0.06, 0.82, 0.06);

  const aPillarL = new THREE.Mesh(aPillarGeo, frameMat);
  aPillarL.rotation.x = Math.PI / 8; // Slanted BACKWARD 22.5° towards driver!
  aPillarL.position.set(-HW + 0.03, floorY + 0.85, aPillarZ + 0.135);
  group.add(aPillarL);

  // Right A-Pillar
  const aPillarR = new THREE.Mesh(aPillarGeo, frameMat);
  aPillarR.rotation.x = Math.PI / 8;
  aPillarR.position.set(HW - 0.03, floorY + 0.85, aPillarZ + 0.135);
  group.add(aPillarR);

  // B-Pillars (vertical steel pillars at partition Z = -1.525m)
  const bPillarGeo = new THREE.BoxGeometry(0.06, 1.40, 0.06);
  const bPillarL = new THREE.Mesh(bPillarGeo, frameMat);
  bPillarL.position.set(-HW + 0.03, floorY + 0.70, -1.525);
  group.add(bPillarL);

  const bPillarR = new THREE.Mesh(bPillarGeo, frameMat);
  bPillarR.position.set(HW - 0.03, floorY + 0.70, -1.525);
  group.add(bPillarR);

  // Windshield Top Header Beam (Dachrahmen quer at Z = -2.15m, Y = 1.80m)
  const topHeader = new THREE.Mesh(new THREE.BoxGeometry(W, 0.05, 0.06), frameMat);
  topHeader.position.set(0, 1.80, aPillarZ + 0.27);
  group.add(topHeader);

  // Door Rocker Sills (Schweller unten)
  const sillGeo = new THREE.BoxGeometry(0.06, 0.06, 0.895);
  const sillL = new THREE.Mesh(sillGeo, frameMat);
  sillL.position.set(-HW + 0.03, floorY + 0.03, -1.9725);
  group.add(sillL);

  const sillR = new THREE.Mesh(sillGeo, frameMat);
  sillR.position.set(HW - 0.03, floorY + 0.03, -1.9725);
  group.add(sillR);

  return group;
}

/**
 * Builds Continuous GFK High Roof Shell (matching Pink Silhouette Line Image 2)
 * High roof peak Y = 2.525m, front cap curves smoothly DOWNWARD over cab to seal onto top windshield header at Z = -2.15m, Y = 1.80m
 */
export function buildGfkHighRoofShell(bodyPaintMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const W = BREMER_GEOMETRY_SPECS.bodyWidth; // 1.975m
  const HW = W / 2; // 0.9875m
  const L = BREMER_GEOMETRY_SPECS.cargoLength; // 3.05m
  const gutterY = 1.95;
  const roofPeakY = BREMER_GEOMETRY_SPECS.roofPeakY; // 2.525m
  
  // The main roof peak starts further back at Z = -1.85m to allow for a sloped forehead cap
  const roofZFront = -1.85; 
  const totalRoofLength = L + 0.625 - 0.30; // 3.375m (from Z = -1.85m to Z = +1.525m)

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
  roofMesh.position.set(0, 0, roofZFront);
  roofMesh.userData = { isVehicleHull: true, partName: 'GFK Hochdach Shell' };
  group.add(roofMesh);

  // Aerodynamic Rounded Front Visor Cap (lofted from roof cross-section down to gutter line at Z = -2.15m)
  const capShape = new THREE.Shape();
  capShape.moveTo(-HW, gutterY);
  capShape.quadraticCurveTo(-HW, roofPeakY, -HW * 0.65, roofPeakY);
  capShape.lineTo(HW * 0.65, roofPeakY);
  capShape.quadraticCurveTo(HW, roofPeakY, HW, gutterY);
  capShape.closePath();

  const capGeo = new THREE.ExtrudeGeometry(capShape, { steps: 5, depth: 0.30, bevelEnabled: false });
  
  // Loft vertices dynamically to slope down towards front (Z = 0)
  const posAttr = capGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i); // 0 (front) to 0.30 (back)
    const t = z / 0.30; // 0 to 1
    const newY = gutterY + (y - gutterY) * Math.sin(t * Math.PI / 2); // Smooth sinus curve slope
    posAttr.setY(i, newY);
  }
  capGeo.computeVertexNormals();

  const capMesh = new THREE.Mesh(capGeo, bodyPaintMat);
  capMesh.position.set(0, 0, -2.15); // Bridges Z=-2.15m to Z=-1.85m
  capMesh.userData = { isVehicleHull: true, partName: 'GFK Hochdach Stirnhaube' };
  group.add(capMesh);

  return group;
}

/**
 * Builds 25° Downward Sloping Bonnet & Side Fenders (Haube & Kotflügel) with authentic Bremer Snout Profile
 */
export function buildFrontBonnetAndFenders(bodyPaintSolidMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const W = BREMER_GEOMETRY_SPECS.bodyWidth; // 1.975m
  const HW = W / 2; // 0.9875m
  const floorY = BREMER_GEOMETRY_SPECS.floorY; // 0.55m
  const aPillarZ = -2.420;
  const bumperZ = -2.770;
  const snoutLength = Math.abs(aPillarZ - bumperZ); // 0.35m

  // 1. Curved Bonnet Hood (Haube)
  const bonnetProfile = new THREE.Shape();
  // Drawn in X,Y where X maps to Z-axis (length) and Y maps to Y-axis (height).
  bonnetProfile.moveTo(0, 0.30); // Front grille top (Z=-2.77)
  bonnetProfile.quadraticCurveTo(0.15, 0.45, snoutLength, 0.60); // Curve up to cowl (Z=-2.42)
  bonnetProfile.lineTo(snoutLength, 0.20); // Down to fender seam
  bonnetProfile.lineTo(0, 0.20); // Forward to front
  bonnetProfile.closePath();

  const bonnetGeo = new THREE.ExtrudeGeometry(bonnetProfile, { steps: 1, depth: W - 0.08, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015 });
  const bonnetMesh = new THREE.Mesh(bonnetGeo, bodyPaintSolidMat);
  bonnetMesh.rotation.y = -Math.PI / 2; // local X (snout) -> +World Z, local Z (width) -> -World X
  bonnetMesh.position.set((W - 0.08) / 2, floorY, bumperZ); // +D/2 down to -D/2
  group.add(bonnetMesh);

  // 2. Side Fenders (Kotflügel) wrapping around the front corners
  const fenderProfile = new THREE.Shape();
  fenderProfile.moveTo(0, -0.05); // Z=-2.77, below floor
  fenderProfile.lineTo(0, 0.30); // Z=-2.77, meets bonnet
  fenderProfile.quadraticCurveTo(0.15, 0.45, snoutLength, 0.60); // Z=-2.42, meets bonnet
  fenderProfile.lineTo(snoutLength, 0.20); // Z=-2.42, wheel arch start
  fenderProfile.quadraticCurveTo(snoutLength - 0.10, 0.20, snoutLength - 0.15, -0.05); // Curve down for front of wheel arch
  fenderProfile.lineTo(0, -0.05);
  fenderProfile.closePath();

  const fenderGeo = new THREE.ExtrudeGeometry(fenderProfile, { steps: 1, depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
  
  const fenderL = new THREE.Mesh(fenderGeo, bodyPaintSolidMat);
  fenderL.rotation.y = -Math.PI / 2;
  fenderL.position.set(-HW + 0.04, floorY, bumperZ);
  group.add(fenderL);

  const fenderR = new THREE.Mesh(fenderGeo, bodyPaintSolidMat);
  fenderR.rotation.y = -Math.PI / 2;
  fenderR.position.set(HW, floorY, bumperZ);
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

  const W = BREMER_GEOMETRY_SPECS.bodyWidth; // 1.975m
  const HW = W / 2; // 0.9875m
  const L = BREMER_GEOMETRY_SPECS.cargoLength; // 3.05m
  const floorY = BREMER_GEOMETRY_SPECS.floorY; // 0.55m
  const gutterY = 1.95;

  const cargoZFront = -L / 2; // -1.525m
  const cargoZRear = L / 2; // +1.525m
  const aPillarZ = -2.420;
  const bumperZ = -2.770;

  // 1. CARGO SIDE WALLS (Right wall has SLIDING DOOR OPENING CUTOUT HOLE from Z=-1.50m to Z=-0.40m)
  const leftWallGeo = new THREE.BoxGeometry(0.02, 1.40, L);
  const wallL = new THREE.Mesh(leftWallGeo, bodyPaint);
  wallL.position.set(-HW, floorY + 0.70, 0);
  wallL.userData = { isVehicleHull: true, partName: 'Fahrzeugwand Links' };
  group.add(wallL);

  // Right Side Wall: Rear Panel (Z=-0.40m to +1.525m) & Header Beam above sliding door cutout
  const rightWallRearGeo = new THREE.BoxGeometry(0.02, 1.40, 1.925);
  const wallRRear = new THREE.Mesh(rightWallRearGeo, bodyPaint);
  wallRRear.position.set(HW, floorY + 0.70, 0.5625);
  wallRRear.userData = { isVehicleHull: true, partName: 'Fahrzeugwand Rechts Hinten' };
  group.add(wallRRear);

  const wallRHeaderGeo = new THREE.BoxGeometry(0.02, 0.30, 1.10);
  const wallRHeader = new THREE.Mesh(wallRHeaderGeo, bodyPaint);
  wallRHeader.position.set(HW, floorY + 1.25, -0.95);
  wallRHeader.userData = { isVehicleHull: true, partName: 'Schiebetür Sturz' };
  group.add(wallRHeader);

  // 2. CONTINUOUS GFK HIGH ROOF SHELL
  const roofGroup = buildGfkHighRoofShell(bodyPaint);
  group.add(roofGroup);

  // 3. CAB PILLAR FRAMING
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

  // 6. FRONT FACE: Grille, Headlights, Bumper & Backward Leaning Windshield
  const frontGroup = new THREE.Group();

  const grilleBack = new THREE.Mesh(new THREE.BoxGeometry(1.40, 0.35, 0.03), blackPlastic);
  grilleBack.position.set(0, floorY + 0.125, bumperZ - 0.02);
  frontGroup.add(grilleBack);

  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.025, 0.01), chrome);
    slat.position.set(0, floorY + 0.01 + i * 0.075, bumperZ - 0.04);
    frontGroup.add(slat);
  }

  const starGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.015, 20);
  starGeo.rotateX(Math.PI / 2);
  const starMesh = new THREE.Mesh(starGeo, chrome);
  starMesh.position.set(0, floorY + 0.15, bumperZ - 0.05);
  frontGroup.add(starMesh);

  const headlightGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20);
  headlightGeo.rotateX(Math.PI / 2);
  const hlGlass = new THREE.MeshStandardMaterial({ color: 0xfefce8, transparent: true, opacity: 0.75, roughness: 0.05 });

  const hlL = new THREE.Mesh(headlightGeo, hlGlass);
  hlL.position.set(-0.56, floorY + 0.15, bumperZ - 0.04);
  frontGroup.add(hlL);
  const hlR = new THREE.Mesh(headlightGeo, hlGlass);
  hlR.position.set(0.56, floorY + 0.15, bumperZ - 0.04);
  frontGroup.add(hlR);

  const indicatorGeo = new THREE.BoxGeometry(0.12, 0.06, 0.035);
  const indL = new THREE.Mesh(indicatorGeo, amber);
  indL.position.set(-0.82, floorY + 0.15, bumperZ - 0.02);
  frontGroup.add(indL);
  const indR = new THREE.Mesh(indicatorGeo, amber);
  indR.position.set(0.82, floorY + 0.15, bumperZ - 0.02);
  frontGroup.add(indR);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 0.14, 0.10), chrome);
  bumper.position.set(0, floorY - 0.02, bumperZ - 0.04);
  frontGroup.add(bumper);

  // Raked Windshield set cleanly leaning BACKWARD 22.5°
  const windshieldW = W - 0.12;
  const windshieldH = 0.65;
  const windGeo = new THREE.BoxGeometry(windshieldW, windshieldH, 0.012);
  const windMesh = new THREE.Mesh(windGeo, glass);
  windMesh.rotation.x = Math.PI / 8; // Leans BACKWARD towards driver!
  windMesh.position.set(0, floorY + 0.98, aPillarZ + 0.135);
  frontGroup.add(windMesh);

  group.add(frontGroup);

  // 7. COCKPIT SEATS ON STEEL PEDESTALS, CURVED DASHBOARD & 45° ANGLED STEERING COLUMN
  const driverX = driveSide === 'LHD' ? -0.42 : 0.42;
  const passX = driveSide === 'LHD' ? 0.42 : -0.42;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });

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

  const dashBoard = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.28, 0.35), blackPlastic);
  dashBoard.position.set(0, floorY + 0.55, aPillarZ + 0.10);
  group.add(dashBoard);

  const stColumnGroup = new THREE.Group();
  
  // Angle of the column: 60 degrees from horizontal (Math.PI / 3)
  const colAngle = Math.PI / 3; 
  
  // Column shaft
  const stColumnShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.50), blackPlastic);
  stColumnShaft.rotation.x = -colAngle; // Tilt back towards driver
  stColumnShaft.position.set(0, 0.20, -0.05); // Position inside group
  stColumnGroup.add(stColumnShaft);

  // Wheel rim (flat, tilted)
  const stWheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 8, 24), blackPlastic);
  stWheelRim.rotation.x = Math.PI / 2 - colAngle; // Tilted to be perpendicular to the column shaft
  stWheelRim.position.set(0, 0.40, -0.15);
  stColumnGroup.add(stWheelRim);

  const stHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), blackPlastic);
  stHub.rotation.x = Math.PI / 2 - colAngle;
  stHub.position.set(0, 0.40, -0.15);
  stColumnGroup.add(stHub);

  // Position the entire group relative to the cab floor
  // Let's place it at the driver's side X, and Y = floorY (0.55), Z = aPillarZ + 0.30
  stColumnGroup.position.set(driverX, floorY, aPillarZ + 0.30); // Z = -2.12m
  group.add(stColumnGroup);

  // 8. REAR D-PILLAR CORNER BODY PANELS (262.5mm wide from X = ±0.725m to ±0.9875m), BUMPER & TAIL LIGHTS
  const rearDPillarGeo = new THREE.BoxGeometry(0.2625, 1.40, 0.04);
  const rearDPillarL = new THREE.Mesh(rearDPillarGeo, bodyPaintSolid);
  rearDPillarL.position.set(-0.85625, floorY + 0.70, cargoZRear + 0.02);
  group.add(rearDPillarL);

  const rearDPillarR = new THREE.Mesh(rearDPillarGeo, bodyPaintSolid);
  rearDPillarR.position.set(0.85625, floorY + 0.70, cargoZRear + 0.02);
  group.add(rearDPillarR);

  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 0.12, 0.08), chrome);
  rearBumper.position.set(0, floorY - 0.02, cargoZRear + 0.05);
  group.add(rearBumper);

  const tailLightGeo = new THREE.BoxGeometry(0.14, 0.18, 0.04);
  const tailL = new THREE.Mesh(tailLightGeo, redTail);
  tailL.position.set(-0.85, floorY + 0.40, cargoZRear + 0.03);
  group.add(tailL);
  const tailR = new THREE.Mesh(tailLightGeo, redTail);
  tailR.position.set(0.85, floorY + 0.40, cargoZRear + 0.03);
  group.add(tailR);

  // 9. WHEELS (Front axle Z = -2.05m, Rear axle Z = +0.95m)
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
 * Builds 5-Corner Openable Cab Door Group with Hinge Origin at Front A-Pillar Edge (0,0,0) and Transparent Window Glass
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

  // Hinge origin (0,0,0) at front A-pillar edge (Z = -2.42m). Door panel extends BACKWARD (+Z) from Z = 0 to Z = +0.895m (B-pillar)
  const doorOuterShape = new THREE.Shape();
  doorOuterShape.moveTo(0.895, 0); // Bottom rear corner at B-pillar
  doorOuterShape.lineTo(0.35, 0); // Bottom edge straight to wheel arch start
  doorOuterShape.quadraticCurveTo(0.15, 0.05, 0.05, 0.30); // Curve up and forward around front wheel arch
  doorOuterShape.lineTo(0, 0.40); // To front edge (meets fender)
  doorOuterShape.lineTo(0, 0.85); // Up to bottom of window sill
  doorOuterShape.lineTo(0.27, 1.25); // A-pillar slant backward (meets windshield top header at Y=1.80m / local 1.25m)
  doorOuterShape.lineTo(0.895, 1.40); // Top rear corner
  doorOuterShape.closePath();

  // Window Hole inside door panel
  const winHolePath = new THREE.Path();
  winHolePath.moveTo(0.12, 0.55);
  winHolePath.lineTo(0.845, 0.55);
  winHolePath.lineTo(0.845, 1.32);
  winHolePath.lineTo(0.30, 1.18);
  winHolePath.closePath();
  doorOuterShape.holes.push(winHolePath);

  const doorGeo = new THREE.ExtrudeGeometry(doorOuterShape, { steps: 1, depth: 0.03, bevelEnabled: false });
  const doorMesh = new THREE.Mesh(doorGeo, bodyPaintSolid);
  doorMesh.userData = { isVehicleHull: true, partName: side === 'left' ? 'Fahrertür' : 'Beifahrertür' };
  doorGroup.add(doorMesh);

  // Transparent Window Glass Panel fitted into window hole
  const winShape = new THREE.Shape();
  winShape.moveTo(0.12, 0.55);
  winShape.lineTo(0.845, 0.55);
  winShape.lineTo(0.845, 1.32);
  winShape.lineTo(0.30, 1.18);
  winShape.closePath();

  const winGeo = new THREE.ExtrudeGeometry(winShape, { steps: 1, depth: 0.008, bevelEnabled: false });
  const winMesh = new THREE.Mesh(winGeo, glass);
  winMesh.position.set(0, 0, 0.011);
  doorGroup.add(winMesh);

  // Rubber Window Frame Border
  const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(0.79, 0.02, 0.02), blackPlastic);
  frameBorder.position.set(0.46, 0.54, 0.015);
  doorGroup.add(frameBorder);

  // Position handle and mirrors on the outside (based on left/right side logic)
  const isLeft = side === 'left';
  const handleZ = isLeft ? 0.04 : -0.01;
  const mirrorZ = isLeft ? 0.12 : -0.12;
  const armZ = isLeft ? 0.06 : -0.06;

  // Outer Door Handle
  const handleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.025), blackPlastic);
  handleMesh.position.set(0.65, 0.45, handleZ);
  doorGroup.add(handleMesh);

  // Side Rearview Mirror (Außenspiegel) attached at front A-pillar edge
  const mirrorGroup = new THREE.Group();
  const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.14), blackPlastic);
  mirrorHousing.position.set(0.10, 0.70, mirrorZ);
  mirrorGroup.add(mirrorHousing);

  const mirrorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15), blackPlastic);
  mirrorArm.rotation.z = Math.PI / 4;
  mirrorArm.position.set(0.15, 0.65, armZ);
  mirrorGroup.add(mirrorArm);

  doorGroup.add(mirrorGroup);

  // Rotate doorGroup by -90 degrees so it runs longitudinally along the Z axis
  doorGroup.rotation.y = -Math.PI / 2;

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
