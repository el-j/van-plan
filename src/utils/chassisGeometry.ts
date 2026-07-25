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
 *  MB T1 Bremer (W601/W602) 309D/310D RTW Hochdach – Perfect 3D Reconstruction
 *
 *  Coordinate System (Meters):
 *    Ground: Y = 0.00m
 *    Wheel Axles: Y = 0.35m (wheel radius = 0.35m, resting on ground Y=0)
 *    Underbody Chassis Frame: Y = 0.43m .. 0.53m (strictly UNDER cargo floor)
 *    Cargo Floor Plate: Y = 0.55m
 *    Side Wall Gutter Line: Y = 1.95m
 *    GFK High Roof Ceiling: Y = 2.40m (Interior Stehhöhe = 1.85m = 1850mm)
 *    GFK High Roof Peak: Y = 2.55m (Gesamthöhe = 2.55m = 2550mm)
 *
 *  Z-Axis Bounds:
 *    Cargo Rear Doors: Z = +1.525m (+3050mm / 2)
 *    Partition Wall: Z = -1.525m (-3050mm / 2)
 *    Cockpit Seats: Z = -2.000m (0.475m clearance in front of partition)
 *    Dashboard / Windshield Base: Z = -2.450m
 *    Front Grille / Bumper: Z = -2.850m
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
  cabLength: 1.00,
  bonnetLength: 0.40,
  frontAxleZ: -2.15,
  rearAxleZ: 1.00,
};

/**
 * Generates 3D Parametric Mesh for Mercedes 309D Sickenboden (Corrugated Metal Cargo Floor)
 * Flat in horizontal X-Z plane at cargo floor level.
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
 * Generates Underbody C-Channel Chassis Main Frame Steel Beams (positioned strictly UNDER floor at Y < 0.55m)
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

  // Placed under floor Y=0.55m (rail top at Y=0.53m)
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
 * Generates 100% Authentic Mercedes-Benz T1 Bremer (W602/309D/310D) 3D Body Shell Group
 */
export function createBremerBodyShellGroup(
  driveSide: 'LHD' | 'RHD' = 'LHD',
  isWireframe: boolean = false
): THREE.Group {
  const group = new THREE.Group();

  // Materials
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
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  const W = BREMER_GEOMETRY_SPECS.bodyWidth; // 1.92m
  const HW = W / 2; // 0.96m
  const L = BREMER_GEOMETRY_SPECS.cargoLength; // 3.05m
  const floorY = BREMER_GEOMETRY_SPECS.floorY; // 0.55m
  const gutterY = 1.95; // 0.55 + 1.40
  const roofPeakY = BREMER_GEOMETRY_SPECS.roofPeakY; // 2.55m

  const cargoZFront = -L / 2; // -1.525m
  const cargoZRear = L / 2; // +1.525m
  const cabZFront = cargoZFront - BREMER_GEOMETRY_SPECS.cabLength; // -2.525m
  const bumperZ = cabZFront - BREMER_GEOMETRY_SPECS.bonnetLength; // -2.925m

  // 1. CARGO SIDE WALLS (Y = 0.55m to 1.95m)
  const sideWallGeo = new THREE.BoxGeometry(0.02, 1.40, L);

  const wallL = new THREE.Mesh(sideWallGeo, bodyPaint);
  wallL.position.set(-HW, floorY + 0.70, 0);
  wallL.userData = { isVehicleHull: true, partName: 'Fahrzeugwand Links' };
  group.add(wallL);

  const wallR = new THREE.Mesh(sideWallGeo, bodyPaint);
  wallR.position.set(HW, floorY + 0.70, 0);
  wallR.userData = { isVehicleHull: true, partName: 'Fahrzeugwand Rechts' };
  group.add(wallR);

  // 2. GFK HOCHDACH (Barrel-Curved High Roof Y = 1.95m to 2.55m)
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

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { steps: 1, depth: L, bevelEnabled: false });
  const roofMesh = new THREE.Mesh(roofGeo, bodyPaint);
  roofMesh.position.set(0, 0, cargoZFront);
  roofMesh.userData = { isVehicleHull: true, partName: 'GFK Hochdach Shell' };
  group.add(roofMesh);

  // Aerodynamic Front Forehead Cap (Stirn / Dachüberstand over cab)
  const foreheadShape = new THREE.Shape();
  foreheadShape.moveTo(-HW + 0.06, gutterY + 0.05);
  foreheadShape.quadraticCurveTo(-HW + 0.06, roofPeakY - 0.05, -HW * 0.60, roofPeakY - 0.04);
  foreheadShape.lineTo(HW * 0.60, roofPeakY - 0.04);
  foreheadShape.quadraticCurveTo(HW - 0.06, roofPeakY - 0.05, HW - 0.06, gutterY + 0.05);
  foreheadShape.closePath();

  const foreheadGeo = new THREE.ExtrudeGeometry(foreheadShape, { steps: 3, depth: 0.50, bevelEnabled: false });
  const foreheadMesh = new THREE.Mesh(foreheadGeo, bodyPaint);
  foreheadMesh.rotation.x = -Math.PI / 12;
  foreheadMesh.position.set(0, 0.02, cargoZFront - 0.20);
  foreheadMesh.userData = { isVehicleHull: true, partName: 'GFK Hochdach Stirnüberstand' };
  group.add(foreheadMesh);

  // Rear Roof Slope Cap
  const rearRoofCap = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.12, 0.50, 0.025),
    bodyPaint
  );
  rearRoofCap.position.set(0, roofPeakY - 0.28, cargoZRear);
  rearRoofCap.userData = { isVehicleHull: true };
  group.add(rearRoofCap);

  // 3. RAIN GUTTERS (Regenrinne Y = 1.95m)
  const gutterGeo = new THREE.BoxGeometry(0.035, 0.025, L + 1.0);
  const gutterMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75 });
  const gutterL = new THREE.Mesh(gutterGeo, gutterMat);
  gutterL.position.set(-HW - 0.018, gutterY, -0.3);
  group.add(gutterL);
  const gutterR = new THREE.Mesh(gutterGeo, gutterMat);
  gutterR.position.set(HW + 0.018, gutterY, -0.3);
  group.add(gutterR);

  // 4. DRIVER CAB BODY & CAB DOORS (Driver side left, Passenger side right)
  const cabGroup = new THREE.Group();

  // Cab side doors with windows
  const cabDoorGeo = new THREE.BoxGeometry(0.03, 1.40, 1.00);

  // Left Driver Door (with window cutout & outer handle)
  const cabDoorL = new THREE.Mesh(cabDoorGeo, bodyPaintSolid);
  cabDoorL.position.set(-HW, floorY + 0.70, cargoZFront - 0.50);
  cabDoorL.userData = { isVehicleHull: true, partName: 'Fahrertür' };
  cabGroup.add(cabDoorL);

  const cabWinL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.50, 0.55), glass);
  cabWinL.position.set(-HW - 0.005, floorY + 0.95, cargoZFront - 0.50);
  cabGroup.add(cabWinL);

  // Left Side Rearview Mirror (Außenspiegel)
  const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.14), blackPlastic);
  mirrorL.position.set(-HW - 0.12, floorY + 0.95, cargoZFront - 0.85);
  cabGroup.add(mirrorL);

  // Right Passenger Door
  const cabDoorR = new THREE.Mesh(cabDoorGeo, bodyPaintSolid);
  cabDoorR.position.set(HW, floorY + 0.70, cargoZFront - 0.50);
  cabDoorR.userData = { isVehicleHull: true, partName: 'Beifahrertür' };
  cabGroup.add(cabDoorR);

  const cabWinR = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.50, 0.55), glass);
  cabWinR.position.set(HW + 0.005, floorY + 0.95, cargoZFront - 0.50);
  cabGroup.add(cabWinR);

  // Right Side Rearview Mirror
  const mirrorR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.14), blackPlastic);
  mirrorR.position.set(HW + 0.12, floorY + 0.95, cargoZFront - 0.85);
  cabGroup.add(mirrorR);

  // Cab roof
  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(W, 0.02, 1.00), bodyPaint);
  cabRoof.position.set(0, gutterY, cargoZFront - 0.50);
  cabRoof.userData = { isVehicleHull: true };
  cabGroup.add(cabRoof);

  group.add(cabGroup);

  // 5. FRONT FACE: Bonnet, Grille, Headlights, Windshield
  const frontGroup = new THREE.Group();

  // Engine Bonnet Hood (slopes continuously from grille Y=0.95m at Z=-2.925m to windshield base Y=1.20m at Z=-2.525m)
  const bonnetGeo = new THREE.BoxGeometry(W - 0.04, 0.02, 0.45);
  const bonnetMesh = new THREE.Mesh(bonnetGeo, bodyPaintSolid);
  bonnetMesh.rotation.x = Math.PI / 10;
  bonnetMesh.position.set(0, floorY + 0.50, cabZFront - 0.20);
  frontGroup.add(bonnetMesh);

  // Front face panel
  const frontFace = new THREE.Mesh(new THREE.BoxGeometry(W, 0.58, 0.025), bodyPaintSolid);
  frontFace.position.set(0, floorY + 0.25, bumperZ);
  frontGroup.add(frontFace);

  // Grille (Kühlergrill)
  const grilleBack = new THREE.Mesh(new THREE.BoxGeometry(1.40, 0.28, 0.03), blackPlastic);
  grilleBack.position.set(0, floorY + 0.30, bumperZ - 0.02);
  frontGroup.add(grilleBack);

  // Chrome grille slats
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.025, 0.01), chrome);
    slat.position.set(0, floorY + 0.21 + i * 0.065, bumperZ - 0.04);
    frontGroup.add(slat);
  }

  // Mercedes Star Badge
  const starGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.015, 20);
  starGeo.rotateX(Math.PI / 2);
  const starMesh = new THREE.Mesh(starGeo, chrome);
  starMesh.position.set(0, floorY + 0.30, bumperZ - 0.05);
  frontGroup.add(starMesh);

  // Dual Round Headlights (Rundscheinwerfer)
  const headlightGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20);
  headlightGeo.rotateX(Math.PI / 2);
  const hlGlass = new THREE.MeshStandardMaterial({ color: 0xfefce8, transparent: true, opacity: 0.75, roughness: 0.05 });

  const hlL = new THREE.Mesh(headlightGeo, hlGlass);
  hlL.position.set(-0.56, floorY + 0.30, bumperZ - 0.04);
  frontGroup.add(hlL);
  const hlR = new THREE.Mesh(headlightGeo, hlGlass);
  hlR.position.set(0.56, floorY + 0.30, bumperZ - 0.04);
  frontGroup.add(hlR);

  // Corner Amber Turn Indicators
  const indicatorGeo = new THREE.BoxGeometry(0.12, 0.06, 0.035);
  const indL = new THREE.Mesh(indicatorGeo, amber);
  indL.position.set(-0.82, floorY + 0.30, bumperZ - 0.02);
  frontGroup.add(indL);
  const indR = new THREE.Mesh(indicatorGeo, amber);
  indR.position.set(0.82, floorY + 0.30, bumperZ - 0.02);
  frontGroup.add(indR);

  // Front Bumper (Stoßstange)
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 0.14, 0.10), chrome);
  bumper.position.set(0, floorY - 0.02, bumperZ - 0.04);
  frontGroup.add(bumper);

  // Windshield (Frontscheibe) - Slanted forward resting cleanly on bonnet base
  const windshieldW = W - 0.12;
  const windshieldH = 0.65;
  const windGeo = new THREE.BoxGeometry(windshieldW, windshieldH, 0.012);
  const windMesh = new THREE.Mesh(windGeo, glass);
  windMesh.rotation.x = Math.PI / 8;
  windMesh.position.set(0, floorY + 1.05, cabZFront - 0.08);
  frontGroup.add(windMesh);

  group.add(frontGroup);

  // 6. COCKPIT SEATS (Positioned inside cab at Z = -2.00m, giving 0.475m clearance from partition wall)
  const driverX = driveSide === 'LHD' ? -0.42 : 0.42;
  const passX = driveSide === 'LHD' ? 0.42 : -0.42;

  // Driver Seat Group
  const driverSeatGroup = new THREE.Group();
  const seatBaseD = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.48), seatMat);
  seatBaseD.position.set(0, 0.07, 0);
  driverSeatGroup.add(seatBaseD);
  const seatBackD = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.08), seatMat);
  seatBackD.position.set(0, 0.41, 0.20);
  driverSeatGroup.add(seatBackD);
  driverSeatGroup.position.set(driverX, floorY + 0.30, cargoZFront - 0.475);
  group.add(driverSeatGroup);

  // Passenger Seat Group
  const passSeatGroup = new THREE.Group();
  const seatBaseP = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.48), seatMat);
  seatBaseP.position.set(0, 0.07, 0);
  passSeatGroup.add(seatBaseP);
  const seatBackP = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.08), seatMat);
  seatBackP.position.set(0, 0.41, 0.20);
  passSeatGroup.add(seatBackP);
  passSeatGroup.position.set(passX, floorY + 0.30, cargoZFront - 0.475);
  group.add(passSeatGroup);

  // Dashboard Console & Steering Wheel
  const dashBoard = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.25, 0.35), blackPlastic);
  dashBoard.position.set(0, floorY + 0.65, cabZFront - 0.15);
  group.add(dashBoard);

  const wheelGroup = new THREE.Group();
  const stWheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 8, 20), blackPlastic);
  wheelGroup.add(stWheelRim);
  wheelGroup.rotation.x = Math.PI / 4;
  wheelGroup.position.set(driverX, floorY + 0.78, cabZFront - 0.10);
  group.add(wheelGroup);

  // 7. SIDE SLIDING DOOR GUIDE TRACK (Passenger Side)
  const slideSide = driveSide === 'LHD' ? HW : -HW;
  const trackGeo = new THREE.BoxGeometry(0.02, 0.025, 1.60);
  const trackMesh = new THREE.Mesh(trackGeo, chrome);
  trackMesh.position.set(slideSide + (driveSide === 'LHD' ? 0.02 : -0.02), gutterY - 0.05, -0.15);
  group.add(trackMesh);

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

  // 9. WHEELS (Resting on Ground Y = 0, Axle Y = 0.35m)
  const createWheel = (x: number, z: number) => {
    const wheelGroup = new THREE.Group();

    // Tire
    const tireGeo = new THREE.TorusGeometry(0.27, 0.08, 12, 24);
    tireGeo.rotateY(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    wheelGroup.add(tire);

    // Rim
    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rim);

    wheelGroup.position.set(x, BREMER_GEOMETRY_SPECS.wheelRadius, z);
    return wheelGroup;
  };

  // Front wheels
  group.add(createWheel(-HW - 0.02, BREMER_GEOMETRY_SPECS.frontAxleZ));
  group.add(createWheel(HW + 0.02, BREMER_GEOMETRY_SPECS.frontAxleZ));
  // Rear wheels
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
