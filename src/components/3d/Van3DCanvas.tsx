import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VanState, BOMItem, InteriorModule } from '../../types/van';
import {
  createSickenbodenGeometry,
  createChassisFrameRailsGeometry,
  createWallPillarsGroup,
  createBremerBodyShellGroup,
  createBremerCabDoorGroup,
  BREMER_GEOMETRY_SPECS,
} from '../../utils/chassisGeometry';

interface Van3DCanvasProps {
  vanState: VanState;
  onSelectPart: (part: BOMItem | InteriorModule | null) => void;
}

export const Van3DCanvas: React.FC<Van3DCanvasProps> = ({ vanState, onSelectPart }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ name: string; dim: string; cost: string } | null>(null);

  // Dynamic state ref for animation loop
  const vanStateRef = useRef<VanState>(vanState);
  useEffect(() => {
    vanStateRef.current = vanState;
  }, [vanState]);

  // References for animatable objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mesh refs for smooth animations
  const partitionDoorRef = useRef<THREE.Mesh | null>(null);
  const slidingDoorRef = useRef<THREE.Mesh | null>(null);
  const rearDoorLeftRef = useRef<THREE.Group | null>(null);
  const rearDoorRightRef = useRef<THREE.Group | null>(null);
  const cabDoorLeftRef = useRef<THREE.Group | null>(null);
  const cabDoorRightRef = useRef<THREE.Group | null>(null);
  const kitchenGroupRef = useRef<THREE.Group | null>(null);
  const kitchenLegRef = useRef<THREE.Mesh | null>(null);
  const bedGroupRef = useRef<THREE.Group | null>(null);
  const beltLinesRef = useRef<{ line: THREE.Line; corner: number[] }[]>([]);
  const explodedGroupsRef = useRef<{ group: THREE.Group; defaultPos: THREE.Vector3; offsetPos: THREE.Vector3 }[]>([]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.06);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.2, 3.2, 5.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.localClippingEnabled = true;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.target.set(0, 1.2, 0);
    controls.update();
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xffffff, 1.3);
    mainSun.position.set(6, 12, 8);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    scene.add(mainSun);

    const interiorSpot = new THREE.PointLight(0xffaa44, 1.5, 6);
    interiorSpot.position.set(0, 2.0, 0);
    scene.add(interiorSpot);

    // Ground Grid Floor (Y = 0)
    const gridHelper = new THREE.GridHelper(14, 28, 0xff6b00, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Build Complete 3D Vehicle & Interior
    buildVehicleAndModules(scene);

    // Dynamic Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentState = vanStateRef.current;
      const floorY = BREMER_GEOMETRY_SPECS.floorY; // 0.55m

      // 1. Centered Partition Wall Sliding Door
      if (partitionDoorRef.current) {
        const targetX = currentState.isPartitionOpen ? 0.65 : 0.0;
        partitionDoorRef.current.position.x += (targetX - partitionDoorRef.current.position.x) * 0.12;
      }

      // 2. Side Passenger Sliding Door (In cutout hole: Z=-0.9625m closed to Z=+0.25m open)
      if (slidingDoorRef.current) {
        const targetZ = currentState.isSlidingOpen ? 0.25 : -0.9625;
        slidingDoorRef.current.position.z += (targetZ - slidingDoorRef.current.position.z) * 0.12;
      }

      // 3. Rear Hinged Double Swing Doors (Hinged at X = ±0.725m, swinging OUTWARD)
      if (rearDoorLeftRef.current && rearDoorRightRef.current) {
        const targetRotL = currentState.isRearOpen ? -Math.PI * 0.75 : 0; // Outward left
        const targetRotR = currentState.isRearOpen ? Math.PI * 0.75 : 0;  // Outward right
        rearDoorLeftRef.current.rotation.y += (targetRotL - rearDoorLeftRef.current.rotation.y) * 0.12;
        rearDoorRightRef.current.rotation.y += (targetRotR - rearDoorRightRef.current.rotation.y) * 0.12;
      }

      // 4. Driver & Passenger 5-Corner Cab Doors (Hinged at front A-pillar Z = -2.42m, swinging OUTWARDS forward)
      if (cabDoorLeftRef.current && cabDoorRightRef.current) {
        const targetRotL = currentState.isCabDoorsOpen ? -Math.PI * 0.40 : 0;  // Outward left
        const targetRotR = currentState.isCabDoorsOpen ? Math.PI * 0.40 : 0; // Outward right
        cabDoorLeftRef.current.rotation.y += (targetRotL - cabDoorLeftRef.current.rotation.y) * 0.12;
        cabDoorRightRef.current.rotation.y += (targetRotR - cabDoorRightRef.current.rotation.y) * 0.12;
      }

      // 5. Outdoor Drop-out Kitchen (Anchored FLAT ON CARGO FLOOR Y = 0.55m!)
      if (kitchenGroupRef.current) {
        const targetX = currentState.isKitchenExtended ? 1.25 : 0.60;
        kitchenGroupRef.current.position.x += (targetX - kitchenGroupRef.current.position.x) * 0.12;
        kitchenGroupRef.current.position.y = floorY; // Strictly anchored on cargo floor Y = 0.55m!

        if (kitchenLegRef.current) {
          kitchenLegRef.current.visible = currentState.isKitchenExtended;
        }
      }

      // 6. Electric 4-Point Strap Drop-Down Bed
      if (bedGroupRef.current) {
        const targetY = currentState.isBedLowered ? 1.10 : 2.20;
        bedGroupRef.current.position.y += (targetY - bedGroupRef.current.position.y) * 0.12;

        beltLinesRef.current.forEach((b) => {
          const points = [
            new THREE.Vector3(b.corner[0], 2.38, 0.5 + b.corner[1]),
            new THREE.Vector3(b.corner[0], bedGroupRef.current!.position.y, 0.5 + b.corner[1]),
          ];
          b.line.geometry.setFromPoints(points);
        });
      }

      // 7. Exploded View Mode Interpolation
      explodedGroupsRef.current.forEach((item) => {
        const target = currentState.displayMode === 'exploded' ? item.offsetPos : item.defaultPos;
        item.group.position.lerp(target, 0.08);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handle Display Mode, Wireframe & Camera Presets
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.userData.isVehicleHull) {
          child.material.wireframe = vanState.displayMode === 'wireframe';
          child.material.opacity = vanState.displayMode === 'wireframe' ? 0.4 : 0.22;
        } else if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => (m.wireframe = vanState.displayMode === 'wireframe'));
        }
      }
    });

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (vanState.cameraPreset) {
      case 'iso':
        camera.position.set(5.2, 3.2, 5.5);
        controls.target.set(0, 1.2, 0);
        break;
      case 'top':
        camera.position.set(0, 8.5, 0.01);
        controls.target.set(0, 1.2, 0);
        break;
      case 'side':
        camera.position.set(6.5, 1.4, 0);
        controls.target.set(0, 1.2, 0);
        break;
      case 'driver':
        camera.position.set(0, 1.35, -2.0);
        controls.target.set(0, 1.2, 0);
        break;
      case 'kitchen':
        camera.position.set(2.8, 1.4, -0.6);
        controls.target.set(0.6, 1.0, -0.6);
        break;
      case 'bed':
        camera.position.set(0, 2.5, 0.5);
        controls.target.set(0, 1.5, 0.5);
        break;
    }
    controls.update();
  }, [vanState.displayMode, vanState.cameraPreset]);

  // Build complete 3D scene elements
  const buildVehicleAndModules = (scene: THREE.Scene) => {
    explodedGroupsRef.current = [];

    // Materials
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2d1f1d, roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const kitchenMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 });
    const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.7, roughness: 0.3 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.8 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff6b00 });

    const floorY = BREMER_GEOMETRY_SPECS.floorY; // 0.55m
    const HW = BREMER_GEOMETRY_SPECS.bodyWidth / 2; // 0.9875m
    const aPillarZ = -2.420;

    // ── 1. VEHICLE CHASSIS, FRAME RAILS & SICKENBODEN FLOOR ──
    const floorGroup = new THREE.Group();

    const sickenGeo = createSickenbodenGeometry();
    const sickenMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
    const sickenMesh = new THREE.Mesh(sickenGeo, sickenMat);
    sickenMesh.position.set(0, floorY + 0.005, 0);
    sickenMesh.receiveShadow = true;
    floorGroup.add(sickenMesh);

    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.012, 3.05), floorMat);
    floorMesh.position.set(0, floorY + 0.012, 0);
    floorMesh.receiveShadow = true;
    floorGroup.add(floorMesh);

    const frameRails = createChassisFrameRailsGeometry();
    floorGroup.add(frameRails);

    const wallPillars = createWallPillarsGroup();
    floorGroup.add(wallPillars);

    scene.add(floorGroup);

    // ── 2. AUTHENTIC BODY HULL SHELL ──
    const hullGroup = createBremerBodyShellGroup(vanState.driveSide, vanState.displayMode === 'wireframe');
    scene.add(hullGroup);

    explodedGroupsRef.current.push({
      group: hullGroup,
      defaultPos: new THREE.Vector3(0, 0, 0),
      offsetPos: new THREE.Vector3(0, 0.6, 0),
    });

    // ── 3. 5-CORNER OPENABLE CAB DOORS (Hinged at A-pillar Z = -2.42m, X = ±0.9875m) ──
    // Driver Left Cab Door Pivot
    const cabDoorPivotL = new THREE.Group();
    cabDoorPivotL.position.set(-HW, floorY, aPillarZ);
    const cabDoorMeshL = createBremerCabDoorGroup('left', vanState.displayMode === 'wireframe');
    cabDoorPivotL.add(cabDoorMeshL);
    cabDoorLeftRef.current = cabDoorPivotL;
    scene.add(cabDoorPivotL);

    // Passenger Right Cab Door Pivot
    const cabDoorPivotR = new THREE.Group();
    cabDoorPivotR.position.set(HW, floorY, aPillarZ);
    const cabDoorMeshR = createBremerCabDoorGroup('right', vanState.displayMode === 'wireframe');
    cabDoorPivotR.add(cabDoorMeshR);
    cabDoorRightRef.current = cabDoorPivotR;
    scene.add(cabDoorPivotR);

    // ── 4. CENTERED PARTITION WALL WITH SLIDING DOOR (Z = -1.525m) ──
    const partZ = -1.525;
    const partGroup = new THREE.Group();

    const partLeft = new THREE.Mesh(new THREE.BoxGeometry(0.535, 1.85, 0.03), wallMat);
    partLeft.position.set(-0.5925, floorY + 0.925, partZ);
    partGroup.add(partLeft);

    const partRight = new THREE.Mesh(new THREE.BoxGeometry(0.535, 1.85, 0.03), wallMat);
    partRight.position.set(0.5925, floorY + 0.925, partZ);
    partGroup.add(partRight);

    const partTop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.40, 0.03), wallMat);
    partTop.position.set(0, floorY + 1.65, partZ);
    partGroup.add(partTop);

    const partDoor = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.45, 0.02), accentMat);
    partDoor.position.set(0.0, floorY + 0.725, partZ + 0.015);
    partitionDoorRef.current = partDoor;
    partGroup.add(partDoor);

    scene.add(partGroup);

    explodedGroupsRef.current.push({
      group: partGroup,
      defaultPos: new THREE.Vector3(0, 0, 0),
      offsetPos: new THREE.Vector3(0, 0, -0.7),
    });

    // ── 5. PASSENGER SLIDING DOOR (Fits inside cutout hole Z = -1.525m .. -0.40m) ──
    const slideDoorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45,
    });
    const slideDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.38, 1.125), slideDoorMat);
    const slideSideX = vanState.driveSide === 'LHD' ? HW : -HW;
    slideDoorFrame.position.set(slideSideX, floorY + 0.70, -0.9625);
    slidingDoorRef.current = slideDoorFrame;
    scene.add(slideDoorFrame);

    // ── 6. REAR HINGED SWING DOORS (Hinged at X = ±0.725m, Z = +1.55m) ──
    const rearZ = 1.55;
    const doorW = 0.725; // 1450mm rear door opening width / 2
    const doorH = 1.35;
    const rearDoorMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.35,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });

    // Left rear door pivot hinged at X = -0.725m
    const rearPivotL = new THREE.Group();
    rearPivotL.position.set(-0.725, 0, rearZ);
    const rearDoorLMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.035), rearDoorMat);
    rearDoorLMesh.position.set(doorW / 2, floorY + doorH / 2, 0);
    rearPivotL.add(rearDoorLMesh);
    rearDoorLeftRef.current = rearPivotL;
    scene.add(rearPivotL);

    // Right rear door pivot hinged at X = +0.725m
    const rearPivotR = new THREE.Group();
    rearPivotR.position.set(0.725, 0, rearZ);
    const rearDoorRMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.035), rearDoorMat);
    rearDoorRMesh.position.set(-doorW / 2, floorY + doorH / 2, 0);
    rearPivotR.add(rearDoorRMesh);
    rearDoorRightRef.current = rearPivotR;
    scene.add(rearPivotR);

    // ── 7. L-LOUNGE BENCHES & TECH COMPARTMENTS ──
    const loungeGroup = new THREE.Group();

    const benchL = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.45, 1.90), benchMat);
    benchL.position.set(-0.61, floorY + 0.225, 0.5);
    benchL.castShadow = true;
    loungeGroup.add(benchL);

    const cushionL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 1.88), cushionMat);
    cushionL.position.set(-0.61, floorY + 0.49, 0.5);
    loungeGroup.add(cushionL);

    const benchR = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.45, 1.90), benchMat);
    benchR.position.set(0.61, floorY + 0.225, 0.5);
    benchR.castShadow = true;
    loungeGroup.add(benchR);

    const cushionR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 1.88), cushionMat);
    cushionR.position.set(0.61, floorY + 0.49, 0.5);
    loungeGroup.add(cushionR);

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.02, 0.70), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
    tableTop.position.set(-0.10, floorY + 0.72, 0.5);
    tableTop.castShadow = true;
    loungeGroup.add(tableTop);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), stainlessMat);
    tableLeg.position.set(-0.35, floorY + 0.48, 0.5);
    loungeGroup.add(tableLeg);

    scene.add(loungeGroup);

    explodedGroupsRef.current.push({
      group: loungeGroup,
      defaultPos: new THREE.Vector3(0, 0, 0),
      offsetPos: new THREE.Vector3(-0.5, 0, 0),
    });

    // ── 8. OUTDOOR HEAVY-DUTY DROP KITCHEN ──
    const kitchenGroup = new THREE.Group();

    // Sits flat on cargo floor (Y=0 relative to group)
    const kitBody = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.88, 0.85), kitchenMat);
    kitBody.position.set(0, 0.44, 0); // Center is 0.44m above bottom
    kitBody.castShadow = true;
    kitchenGroup.add(kitBody);

    const kitTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.83), stainlessMat);
    kitTop.position.set(0, 0.89, 0);
    kitchenGroup.add(kitTop);

    // Heavy-duty telescopic pull-out rails (Ausziehschienen)
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.02), stainlessMat);
    rail1.position.set(-0.30, 0.01, -0.30);
    kitchenGroup.add(rail1);

    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.02), stainlessMat);
    rail2.position.set(-0.30, 0.01, 0.30);
    kitchenGroup.add(rail2);

    const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.85);
    const legMesh = new THREE.Mesh(legGeo, accentMat);
    legMesh.position.set(0.15, -0.42, 0);
    legMesh.visible = false;
    kitchenLegRef.current = legMesh;
    kitchenGroup.add(legMesh);

    kitchenGroupRef.current = kitchenGroup;
    kitchenGroup.position.set(0.60, floorY, -0.65);
    scene.add(kitchenGroup);

    explodedGroupsRef.current.push({
      group: kitchenGroup,
      defaultPos: new THREE.Vector3(0.60, floorY, -0.65),
      offsetPos: new THREE.Vector3(1.20, floorY, -0.65),
    });

    // ── 9. ELECTRIC 4-POINT STRAP DROP-DOWN BED ──
    const bedGroup = new THREE.Group();

    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 1.85), bedFrameMat);
    bedFrame.position.set(0, 0, 0);
    bedFrame.castShadow = true;
    bedGroup.add(bedFrame);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.33, 0.10, 1.83), mattressMat);
    mattress.position.set(0, 0.08, 0);
    bedGroup.add(mattress);

    bedGroupRef.current = bedGroup;
    bedGroup.position.set(0, 2.20, 0.5);
    scene.add(bedGroup);

    beltLinesRef.current = [];
    const beltMat = new THREE.LineBasicMaterial({ color: 0xff6b00, linewidth: 3 });
    const corners = [
      [-0.65, -0.9],
      [0.65, -0.9],
      [-0.65, 0.9],
      [0.65, 0.9],
    ];

    corners.forEach((c) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(c[0], 2.38, 0.5 + c[1]),
        new THREE.Vector3(c[0], 2.20, 0.5 + c[1]),
      ]);
      const line = new THREE.Line(geo, beltMat);
      scene.add(line);
      beltLinesRef.current.push({ line, corner: c });
    });

    // ── 10. OVERHEAD AIRCRAFT LOCKERS ──
    const lockerGroup = new THREE.Group();

    const lockerL = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 1.80), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
    lockerL.position.set(-0.70, floorY + 1.55, -0.2);
    lockerGroup.add(lockerL);

    const lockerR = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 1.80), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
    lockerR.position.set(0.70, floorY + 1.55, -0.2);
    lockerGroup.add(lockerR);

    scene.add(lockerGroup);

    // ── 11. 3D CAD DIMENSION OVERLAYS ──
    const dimGroup = create3DDimensionOverlayGroup();
    scene.add(dimGroup);
  };

  const create3DDimensionOverlayGroup = () => {
    const group = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const orangeLineMat = new THREE.LineBasicMaterial({ color: 0xff6b00, linewidth: 2 });

    const createCalloutLine = (start: THREE.Vector3, end: THREE.Vector3, mat = lineMat) => {
      const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
      return new THREE.Line(geo, mat);
    };

    group.add(createCalloutLine(new THREE.Vector3(-0.95, 0.56, -1.525), new THREE.Vector3(-0.95, 0.56, 1.525), orangeLineMat));
    group.add(createCalloutLine(new THREE.Vector3(-0.95, 0.55, 0.0), new THREE.Vector3(-0.95, 2.40, 0.0)));
    group.add(createCalloutLine(new THREE.Vector3(1.10, 0.0, 1.525), new THREE.Vector3(1.10, 2.525, 1.525), orangeLineMat));
    group.add(createCalloutLine(new THREE.Vector3(-0.86, 0.56, 1.55), new THREE.Vector3(0.86, 0.56, 1.55)));

    return group;
  };

  return (
    <div className="canvas-3d-wrapper" ref={mountRef}>
      {hoveredInfo && (
        <div className="canvas-tooltip-card">
          <div className="tooltip-title">{hoveredInfo.name}</div>
          <div className="tooltip-detail">Abmessung: {hoveredInfo.dim}</div>
          <div className="tooltip-cost">Preis: {hoveredInfo.cost}</div>
        </div>
      )}
    </div>
  );
};
