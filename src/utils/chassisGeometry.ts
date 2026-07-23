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
 *  MB T1 Bremer (W601/W602) 309D/310D Hochdach – Authentic Dimensions
 *
 *  All values in METERS (Three.js scene units = 1 meter)
 *
 *  Reference: Mercedes-Benz Aufbaurichtlinien T1, factory specifications,
 *  and verified against real photographs (see user-provided images).
 *
 *  Coordinate system:
 *    X = width  (left = -X, right = +X, looking from rear)
 *    Y = height (floor = 0, roof = max)
 *    Z = length (front bumper = -Z_max, rear = +Z_max)
 *
 *  We place the CARGO AREA centered at Z = 0, so:
 *    Cargo rear wall at   Z = +cargoL / 2  = +1.525
 *    Partition wall at    Z = -cargoL / 2  = -1.525
 *    Driver cab extends   Z = -1.525 to Z = -cabEnd
 * ───────────────────────────────────────────────────────────────────────────── */

// Key vehicle dimensions (meters)
const TOTAL_LENGTH = 5.56;        // Overall bumper to bumper (long wheelbase w/ Hochdach)
const BODY_WIDTH = 1.92;          // Body width (excluding mirrors)
const CARGO_WIDTH_INT = 1.72;     // Interior cargo wall-to-wall
const CARGO_LENGTH = 3.05;        // Interior cargo length (partition to rear doors)
const CARGO_HEIGHT_INT = 1.85;    // Interior cargo height (floor to roof peak)
const STANDARD_ROOF_H = 1.42;    // Height to standard roof / rain gutter line
const HIGH_ROOF_PEAK_H = 2.00;   // Height to GFK high roof peak (from cargo floor)
const FLOOR_H = 0.0;             // Cargo floor level (our scene Y=0)
const WHEELBASE = 3.35;          // Front axle to rear axle
const FRONT_OVERHANG = 0.78;     // Bumper to front axle center
const CAB_DEPTH = 1.20;          // Driver cab Z-depth (from partition to front cab edge at windshield base)
const BONNET_DEPTH = 0.55;       // Engine bonnet depth (from windshield base to front grille plane)
const WHEEL_RADIUS = 0.33;       // Wheel outer radius (~16" wheels with tire)
const WHEEL_WIDTH = 0.20;        // Tire width

// Derived
const CARGO_Z_FRONT = -CARGO_LENGTH / 2; // Z = -1.525 (partition wall)
const CARGO_Z_REAR = CARGO_LENGTH / 2;   // Z = +1.525 (rear doors)
const CAB_Z_FRONT = CARGO_Z_FRONT - CAB_DEPTH; // Z ≈ -2.725 (windshield base)
const BUMPER_Z = CAB_Z_FRONT - BONNET_DEPTH;    // Z ≈ -3.275 (front bumper)
const HW = BODY_WIDTH / 2;       // Half width = 0.96

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
    pL.position.set(-0.84, (H * 0.75) / 2, z);
    group.add(pL);
    const pR = new THREE.Mesh(pillarGeo, pillarMat);
    pR.position.set(0.84, (H * 0.75) / 2, z);
    group.add(pR);
  }
  return group;
}

/* ─────────────────────────────────────────────────────────────────────────────
 *  createBremerBodyShellGroup()
 *
 *  100% Authentic Mercedes-Benz T1 Bremer (W602/309D/310D) 3D Body Shell.
 *
 *  Based on: factory dimensions, reference photographs, 3D-print models,
 *  and the user's own vehicle.
 *
 *  Includes:
 *    1. Lower cargo body box (side walls to gutter line)
 *    2. GFK Hochdach (barrel-curved high roof with rounded shoulders)
 *    3. Driver cab with sloped bonnet, flat front face, round headlights
 *    4. Windshield (slightly raked)
 *    5. Driver & passenger cab doors with windows
 *    6. B-Pillar, right-side sliding door in body side
 *    7. Rear twin swing doors (Flügeltüren)
 *    8. Rain gutters (Regenrinne)
 *    9. Wheel arches and visible wheels
 *   10. Step bumper (front & rear)
 * ───────────────────────────────────────────────────────────────────────────── */
export function createBremerBodyShellGroup(
  driveSide: 'LHD' | 'RHD' = 'LHD',
  isWireframe: boolean = false
): THREE.Group {
  const group = new THREE.Group();

  // ── Materials ──
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
  const rubberSeal = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  // ── 1. LOWER CARGO BODY BOX (Side walls up to rain gutter line Y=1.42m) ──
  // Left wall
  const sideWallGeo = new THREE.BoxGeometry(0.02, STANDARD_ROOF_H, CARGO_LENGTH);
  const wallL = new THREE.Mesh(sideWallGeo, bodyPaint);
  wallL.position.set(-HW, STANDARD_ROOF_H / 2, 0);
  wallL.userData = { isVehicleHull: true };
  group.add(wallL);
  // Right wall
  const wallR = new THREE.Mesh(sideWallGeo, bodyPaint);
  wallR.position.set(HW, STANDARD_ROOF_H / 2, 0);
  wallR.userData = { isVehicleHull: true };
  group.add(wallR);
  // Floor plate (exterior underbody)
  const floorPlate = new THREE.Mesh(
    new THREE.BoxGeometry(BODY_WIDTH, 0.015, CARGO_LENGTH + CAB_DEPTH + BONNET_DEPTH),
    bodyPaintSolid
  );
  floorPlate.position.set(0, -0.01, -(CAB_DEPTH + BONNET_DEPTH) / 2);
  group.add(floorPlate);

  // ── 2. GFK HOCHDACH (Barrel-Curved High Roof) ──
  // The GFK high roof has a distinctive barrel/rounded cross-section profile.
  // It sits on top of the rain gutter line (Y=1.42) and curves up to peak (Y=2.00).
  const roofSegments = 24;
  const roofShape = new THREE.Shape();
  // Start bottom-left
  roofShape.moveTo(-HW, STANDARD_ROOF_H);
  // Left shoulder curve up
  roofShape.quadraticCurveTo(-HW, HIGH_ROOF_PEAK_H, -HW * 0.65, HIGH_ROOF_PEAK_H);
  // Flat crown across the top
  roofShape.lineTo(HW * 0.65, HIGH_ROOF_PEAK_H);
  // Right shoulder curve down
  roofShape.quadraticCurveTo(HW, HIGH_ROOF_PEAK_H, HW, STANDARD_ROOF_H);
  // Close with inner wall (thin shell)
  roofShape.lineTo(HW - 0.025, STANDARD_ROOF_H);
  roofShape.quadraticCurveTo(HW - 0.025, HIGH_ROOF_PEAK_H - 0.025, HW * 0.65 - 0.01, HIGH_ROOF_PEAK_H - 0.025);
  roofShape.lineTo(-HW * 0.65 + 0.01, HIGH_ROOF_PEAK_H - 0.025);
  roofShape.quadraticCurveTo(-HW + 0.025, HIGH_ROOF_PEAK_H - 0.025, -HW + 0.025, STANDARD_ROOF_H);
  roofShape.closePath();

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    steps: 1,
    depth: CARGO_LENGTH,
    bevelEnabled: false,
  });
  // ExtrudeGeometry extrudes along +Z by default. We need to position it.
  const roofMesh = new THREE.Mesh(roofGeo, bodyPaint);
  roofMesh.position.set(0, 0, CARGO_Z_FRONT);
  roofMesh.userData = { isVehicleHull: true };
  group.add(roofMesh);

  // GFK High Roof Front Forehead Cap (Dachüberstand / Stirn)
  // This aerodynamic visor extends forward over the driver cab, curving down smoothly.
  const foreheadShape = new THREE.Shape();
  foreheadShape.moveTo(-HW + 0.06, STANDARD_ROOF_H + 0.05);
  foreheadShape.quadraticCurveTo(-HW + 0.06, HIGH_ROOF_PEAK_H - 0.05, -HW * 0.60, HIGH_ROOF_PEAK_H - 0.04);
  foreheadShape.lineTo(HW * 0.60, HIGH_ROOF_PEAK_H - 0.04);
  foreheadShape.quadraticCurveTo(HW - 0.06, HIGH_ROOF_PEAK_H - 0.05, HW - 0.06, STANDARD_ROOF_H + 0.05);
  foreheadShape.closePath();

  const foreheadGeo = new THREE.ExtrudeGeometry(foreheadShape, {
    steps: 4,
    depth: 0.45,
    bevelEnabled: false,
  });
  const foreheadMesh = new THREE.Mesh(foreheadGeo, bodyPaint);
  foreheadMesh.rotation.x = -Math.PI / 10; // Slight forward aerodynamic slope
  foreheadMesh.position.set(0, -0.02, CARGO_Z_FRONT - 0.15);
  foreheadMesh.userData = { isVehicleHull: true };
  group.add(foreheadMesh);

  // Roof rear closing panel (slopes down ~80mm at rear)
  const rearRoofCap = new THREE.Mesh(
    new THREE.BoxGeometry(BODY_WIDTH - 0.12, 0.50, 0.025),
    bodyPaint
  );
  rearRoofCap.position.set(0, HIGH_ROOF_PEAK_H - 0.28, CARGO_Z_REAR);
  rearRoofCap.userData = { isVehicleHull: true };
  group.add(rearRoofCap);

  // ── 3. RAIN GUTTERS (Regenrinne) ──
  const gutterGeo = new THREE.BoxGeometry(0.035, 0.025, CARGO_LENGTH + CAB_DEPTH + 0.3);
  const gutterMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75 });
  const gutterL = new THREE.Mesh(gutterGeo, gutterMat);
  gutterL.position.set(-HW - 0.018, STANDARD_ROOF_H, -CAB_DEPTH / 2);
  group.add(gutterL);
  const gutterR = new THREE.Mesh(gutterGeo, gutterMat);
  gutterR.position.set(HW + 0.018, STANDARD_ROOF_H, -CAB_DEPTH / 2);
  group.add(gutterR);

  // ── 4. DRIVER CAB BODY (Semi-Forward-Control Design) ──
  const cabGroup = new THREE.Group();

  // Cab side walls (left & right)
  const cabSideGeo = new THREE.BoxGeometry(0.02, STANDARD_ROOF_H, CAB_DEPTH);
  const cabSideL = new THREE.Mesh(cabSideGeo, bodyPaint);
  cabSideL.position.set(-HW, STANDARD_ROOF_H / 2, CARGO_Z_FRONT - CAB_DEPTH / 2);
  cabSideL.userData = { isVehicleHull: true };
  cabGroup.add(cabSideL);

  const cabSideR = new THREE.Mesh(cabSideGeo, bodyPaint);
  cabSideR.position.set(HW, STANDARD_ROOF_H / 2, CARGO_Z_FRONT - CAB_DEPTH / 2);
  cabSideR.userData = { isVehicleHull: true };
  cabGroup.add(cabSideR);

  // Cab roof (standard flat roof over cab area at gutter height)
  const cabRoof = new THREE.Mesh(
    new THREE.BoxGeometry(BODY_WIDTH, 0.02, CAB_DEPTH),
    bodyPaint
  );
  cabRoof.position.set(0, STANDARD_ROOF_H, CARGO_Z_FRONT - CAB_DEPTH / 2);
  cabRoof.userData = { isVehicleHull: true };
  cabGroup.add(cabRoof);

  // Driver cab door windows (left & right)
  const cabWindowGeo = new THREE.BoxGeometry(0.005, 0.50, 0.55);
  const cabWinL = new THREE.Mesh(cabWindowGeo, glass);
  cabWinL.position.set(-HW - 0.005, 0.95, CARGO_Z_FRONT - CAB_DEPTH / 2);
  cabGroup.add(cabWinL);
  const cabWinR = new THREE.Mesh(cabWindowGeo, glass);
  cabWinR.position.set(HW + 0.005, 0.95, CARGO_Z_FRONT - CAB_DEPTH / 2);
  cabGroup.add(cabWinR);

  group.add(cabGroup);

  // ── 5. FRONT FACE: Bonnet, Grille, Headlights, Windshield ──
  const frontGroup = new THREE.Group();

  // Sloped Engine Bonnet Hood (from windshield base down to grille top)
  // The T1 has a short, flat-ish bonnet that slopes down about 30°
  const bonnetGeo = new THREE.BoxGeometry(BODY_WIDTH - 0.04, 0.02, BONNET_DEPTH);
  const bonnetMesh = new THREE.Mesh(bonnetGeo, bodyPaintSolid);
  bonnetMesh.rotation.x = Math.PI / 8; // ~22.5° slope
  bonnetMesh.position.set(0, 0.72, CAB_Z_FRONT - BONNET_DEPTH / 2 + 0.05);
  frontGroup.add(bonnetMesh);

  // Front face panel (flat vertical surface below windshield, above bumper)
  const frontFace = new THREE.Mesh(
    new THREE.BoxGeometry(BODY_WIDTH, 0.58, 0.025),
    bodyPaintSolid
  );
  frontFace.position.set(0, 0.44, BUMPER_Z);
  frontGroup.add(frontFace);

  // Grille (Kühlergrill) - black rectangular with chrome horizontal slats
  const grilleBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.40, 0.28, 0.03),
    blackPlastic
  );
  grilleBack.position.set(0, 0.50, BUMPER_Z - 0.02);
  frontGroup.add(grilleBack);

  // Chrome grille slats (4 horizontal bars)
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 0.025, 0.01),
      chrome
    );
    slat.position.set(0, 0.41 + i * 0.065, BUMPER_Z - 0.04);
    frontGroup.add(slat);
  }

  // Mercedes Star Badge (chrome circle on grille center)
  const starGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.015, 20);
  starGeo.rotateX(Math.PI / 2);
  const starMesh = new THREE.Mesh(starGeo, chrome);
  starMesh.position.set(0, 0.50, BUMPER_Z - 0.05);
  frontGroup.add(starMesh);

  // Round Headlights (Rundscheinwerfer) - one on each side
  const headlightGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20);
  headlightGeo.rotateX(Math.PI / 2);

  const hlGlass = new THREE.MeshStandardMaterial({
    color: 0xfefce8,
    transparent: true,
    opacity: 0.75,
    roughness: 0.05,
  });

  const hlL = new THREE.Mesh(headlightGeo, hlGlass);
  hlL.position.set(-0.56, 0.52, BUMPER_Z - 0.04);
  frontGroup.add(hlL);
  // Chrome ring around headlight
  const hlRingGeo = new THREE.TorusGeometry(0.09, 0.012, 8, 20);
  hlRingGeo.rotateX(Math.PI / 2);
  const hlRingL = new THREE.Mesh(hlRingGeo, chrome);
  hlRingL.position.set(-0.56, 0.52, BUMPER_Z - 0.04);
  frontGroup.add(hlRingL);

  const hlR = new THREE.Mesh(headlightGeo, hlGlass);
  hlR.position.set(0.56, 0.52, BUMPER_Z - 0.04);
  frontGroup.add(hlR);
  const hlRingR = new THREE.Mesh(hlRingGeo, chrome);
  hlRingR.position.set(0.56, 0.52, BUMPER_Z - 0.04);
  frontGroup.add(hlRingR);

  // Turn Indicators (amber rectangles at outer edges)
  const indicatorGeo = new THREE.BoxGeometry(0.12, 0.06, 0.035);
  const indL = new THREE.Mesh(indicatorGeo, amber);
  indL.position.set(-0.82, 0.52, BUMPER_Z - 0.02);
  frontGroup.add(indL);
  const indR = new THREE.Mesh(indicatorGeo, amber);
  indR.position.set(0.82, 0.52, BUMPER_Z - 0.02);
  frontGroup.add(indR);

  // Front Bumper (Stoßstange) - chrome/black
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(BODY_WIDTH + 0.04, 0.12, 0.10),
    chrome
  );
  bumper.position.set(0, 0.18, BUMPER_Z - 0.04);
  frontGroup.add(bumper);

  // Windshield (Frontscheibe) - raked at ~20° from vertical
  // The T1 windshield is a large single-piece (or divided) glass, slightly raked.
  const windshieldW = BODY_WIDTH - 0.12;
  const windshieldH = 0.62;
  const windGeo = new THREE.BoxGeometry(windshieldW, windshieldH, 0.012);
  const windMesh = new THREE.Mesh(windGeo, glass);
  windMesh.rotation.x = -0.30; // ~17° rake from vertical
  windMesh.position.set(0, 1.08, CAB_Z_FRONT + 0.08);
  frontGroup.add(windMesh);

  // Windshield rubber seal frame
  const windFrameGeo = new THREE.BoxGeometry(windshieldW + 0.06, windshieldH + 0.06, 0.02);
  const windFrame = new THREE.Mesh(windFrameGeo, rubberSeal);
  windFrame.rotation.x = -0.30;
  windFrame.position.set(0, 1.08, CAB_Z_FRONT + 0.075);
  frontGroup.add(windFrame);

  group.add(frontGroup);

  // ── 6. DRIVER & PASSENGER SEATS ──
  const driverX = driveSide === 'LHD' ? -0.40 : 0.40;
  const passX = driveSide === 'LHD' ? 0.40 : -0.40;

  // Seat base
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.46), seatMat);
  seatBase.position.set(driverX, 0.38, CARGO_Z_FRONT - 0.60);
  group.add(seatBase);
  // Seat back
  const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.50, 0.08), seatMat);
  seatBack.position.set(driverX, 0.69, CARGO_Z_FRONT - 0.82);
  group.add(seatBack);

  // Passenger seat
  const passSeatBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.46), seatMat);
  passSeatBase.position.set(passX, 0.38, CARGO_Z_FRONT - 0.60);
  group.add(passSeatBase);
  const passSeatBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.50, 0.08), seatMat);
  passSeatBack.position.set(passX, 0.69, CARGO_Z_FRONT - 0.82);
  group.add(passSeatBack);

  // ── 7. SIDE SLIDING DOOR TRACK & CUTOUT (Passenger Side = +X for LHD) ──
  // The sliding door sits in the middle of the cargo side wall (not at the front).
  // Approximate: door opening centered around Z = -0.2, width = 1.10m
  const slideDoorZ = -0.15;
  const slideDoorW = 1.10;
  const slideSide = driveSide === 'LHD' ? HW : -HW;

  // Sliding door rail / track (chrome-colored bar on outside)
  const trackGeo = new THREE.BoxGeometry(0.02, 0.025, slideDoorW + 0.50);
  const trackMesh = new THREE.Mesh(trackGeo, chrome);
  trackMesh.position.set(slideSide + (driveSide === 'LHD' ? 0.02 : -0.02), STANDARD_ROOF_H - 0.05, slideDoorZ);
  group.add(trackMesh);

  // Lower door track guide
  const lowerTrack = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.015, slideDoorW + 0.50),
    chrome
  );
  lowerTrack.position.set(slideSide + (driveSide === 'LHD' ? 0.015 : -0.015), 0.10, slideDoorZ);
  group.add(lowerTrack);

  // ── 8. REAR TWIN SWING DOORS (Flügeltüren / Hecktüren) ──
  // Two equal-width doors hinged at left and right edges of the rear face.
  // Door opening = full cargo width minus frame pillars
  const rearDoorW = (BODY_WIDTH - 0.10) / 2; // Each door ~0.91m wide
  const rearDoorH = STANDARD_ROOF_H - 0.15;

  // Left rear door
  const rearDoorGeoL = new THREE.BoxGeometry(rearDoorW, rearDoorH, 0.035);
  const rearDoorL = new THREE.Mesh(rearDoorGeoL, bodyPaintSolid);
  rearDoorL.position.set(-rearDoorW / 2 - 0.025, rearDoorH / 2 + 0.08, CARGO_Z_REAR + 0.02);
  group.add(rearDoorL);

  // Right rear door
  const rearDoorR = new THREE.Mesh(rearDoorGeoL, bodyPaintSolid);
  rearDoorR.position.set(rearDoorW / 2 + 0.025, rearDoorH / 2 + 0.08, CARGO_Z_REAR + 0.02);
  group.add(rearDoorR);

  // Rear door windows (upper glass panels on each door)
  const rearWinGeo = new THREE.BoxGeometry(rearDoorW - 0.12, 0.35, 0.01);
  const rearWinL = new THREE.Mesh(rearWinGeo, glass);
  rearWinL.position.set(-rearDoorW / 2 - 0.025, STANDARD_ROOF_H - 0.30, CARGO_Z_REAR + 0.04);
  group.add(rearWinL);
  const rearWinR = new THREE.Mesh(rearWinGeo, glass);
  rearWinR.position.set(rearDoorW / 2 + 0.025, STANDARD_ROOF_H - 0.30, CARGO_Z_REAR + 0.04);
  group.add(rearWinR);

  // Rear door handles (small chrome rectangles)
  const handleGeo = new THREE.BoxGeometry(0.08, 0.03, 0.025);
  const handleL = new THREE.Mesh(handleGeo, chrome);
  handleL.position.set(-0.12, 0.72, CARGO_Z_REAR + 0.045);
  group.add(handleL);
  const handleR = new THREE.Mesh(handleGeo, chrome);
  handleR.position.set(0.12, 0.72, CARGO_Z_REAR + 0.045);
  group.add(handleR);

  // Door hinge straps (visible on rear exterior)
  const hingeGeo = new THREE.BoxGeometry(0.04, 0.12, 0.02);
  [-0.15, 0.50, 1.00].forEach((yOff) => {
    const hingeL = new THREE.Mesh(hingeGeo, blackPlastic);
    hingeL.position.set(-HW + 0.02, yOff + 0.15, CARGO_Z_REAR + 0.025);
    group.add(hingeL);
    const hingeR = new THREE.Mesh(hingeGeo, blackPlastic);
    hingeR.position.set(HW - 0.02, yOff + 0.15, CARGO_Z_REAR + 0.025);
    group.add(hingeR);
  });

  // Rear tail lights (red rectangles at each lower corner)
  const tailLightGeo = new THREE.BoxGeometry(0.14, 0.18, 0.04);
  const tailL = new THREE.Mesh(tailLightGeo, redTail);
  tailL.position.set(-HW + 0.08, 0.55, CARGO_Z_REAR + 0.03);
  group.add(tailL);
  const tailR = new THREE.Mesh(tailLightGeo, redTail);
  tailR.position.set(HW - 0.08, 0.55, CARGO_Z_REAR + 0.03);
  group.add(tailR);

  // Rear bumper (step bumper)
  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(BODY_WIDTH + 0.04, 0.10, 0.08),
    chrome
  );
  rearBumper.position.set(0, 0.13, CARGO_Z_REAR + 0.05);
  group.add(rearBumper);

  // ── 9. WHEELS (Front + Rear Axle) ──
  // Front axle approximately at Z = BUMPER_Z + FRONT_OVERHANG = -2.495
  const frontAxleZ = BUMPER_Z + FRONT_OVERHANG;
  const rearAxleZ = frontAxleZ + WHEELBASE;

  const createWheel = (x: number, z: number) => {
    const wheelGroup = new THREE.Group();

    // Tire
    const tireGeo = new THREE.TorusGeometry(WHEEL_RADIUS - 0.06, 0.06, 10, 24);
    tireGeo.rotateY(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    wheelGroup.add(tire);

    // Rim/hub disk
    const rimGeo = new THREE.CylinderGeometry(WHEEL_RADIUS - 0.10, WHEEL_RADIUS - 0.10, WHEEL_WIDTH - 0.04, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rim);

    // Sidewall fill
    const sideGeo = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 20);
    sideGeo.rotateZ(Math.PI / 2);
    const sidewall = new THREE.Mesh(sideGeo, tireMat);
    wheelGroup.add(sidewall);

    wheelGroup.position.set(x, WHEEL_RADIUS, z);
    return wheelGroup;
  };

  // Front wheels
  group.add(createWheel(-HW - 0.02, frontAxleZ));
  group.add(createWheel(HW + 0.02, frontAxleZ));
  // Rear wheels
  group.add(createWheel(-HW - 0.02, rearAxleZ));
  group.add(createWheel(HW + 0.02, rearAxleZ));

  // ── 10. REAR WHEEL ARCH COVERS (interior intrusions) ──
  const archGeo = new THREE.BoxGeometry(0.34, 0.38, 0.85);
  const archMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, roughness: 0.5 });
  const archInnerL = new THREE.Mesh(archGeo, archMat);
  archInnerL.position.set(-CARGO_WIDTH_INT / 2 + 0.17, 0.19, rearAxleZ);
  group.add(archInnerL);
  const archInnerR = new THREE.Mesh(archGeo, archMat);
  archInnerR.position.set(CARGO_WIDTH_INT / 2 - 0.17, 0.19, rearAxleZ);
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
