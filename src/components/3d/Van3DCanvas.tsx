import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VanState, MetricUnit, BOMItem, InteriorModule } from '../../types/van';
import { INTERIOR_MODULES } from '../../data/modulesData';
import { MASTER_BOM_ITEMS } from '../../data/bomData';
import { formatDimension } from '../../utils/formatters';
import { createSickenbodenGeometry, createChassisFrameRailsGeometry, createWallPillarsGroup, createBremerBodyShellGroup } from '../../utils/chassisGeometry';

interface Van3DCanvasProps {
  vanState: VanState;
  onSelectPart: (part: BOMItem | InteriorModule | null) => void;
}

export const Van3DCanvas: React.FC<Van3DCanvasProps> = ({ vanState, onSelectPart }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ name: string; dim: string; cost: string } | null>(null);

  // References for animatable objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mesh refs for animation loops
  const partitionDoorRef = useRef<THREE.Mesh | null>(null);
  const slidingDoorRef = useRef<THREE.Mesh | null>(null);
  const rearDoorLeftRef = useRef<THREE.Mesh | null>(null);
  const rearDoorRightRef = useRef<THREE.Mesh | null>(null);
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
    scene.background = new THREE.Color(0x0b0f19); // CAD dark background
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.08);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.8, 3.2, 5.2);
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
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below floor
    controls.target.set(0, 0.9, 0);
    controls.update();
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xffffff, 1.2);
    mainSun.position.set(6, 12, 8);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    scene.add(mainSun);

    const interiorSpot = new THREE.PointLight(0xffaa44, 1.5, 5);
    interiorSpot.position.set(0, 1.7, 0);
    scene.add(interiorSpot);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(12, 24, 0xff6b00, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Build the Complete 3D Vehicle & Interior
    buildVehicleAndModules(scene);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Interpolate partition door
      if (partitionDoorRef.current) {
        const targetX = vanState.isPartitionOpen ? -0.25 : 0.35;
        partitionDoorRef.current.position.x += (targetX - partitionDoorRef.current.position.x) * 0.1;
      }

      // Interpolate sliding side door
      if (slidingDoorRef.current) {
        const targetZ = vanState.isSlidingOpen ? 0.4 : -0.6;
        slidingDoorRef.current.position.z += (targetZ - slidingDoorRef.current.position.z) * 0.1;
      }

      // Interpolate rear doors
      if (rearDoorLeftRef.current && rearDoorRightRef.current) {
        const targetRotY = vanState.isRearOpen ? -Math.PI * 0.75 : 0;
        rearDoorLeftRef.current.rotation.y += (targetRotY - rearDoorLeftRef.current.rotation.y) * 0.1;
        rearDoorRightRef.current.rotation.y += (-targetRotY - rearDoorRightRef.current.rotation.y) * 0.1;
      }

      // Interpolate kitchen slide & drop
      if (kitchenGroupRef.current) {
        const targetX = vanState.isKitchenExtended ? 1.28 : 0.60;
        const targetY = vanState.isKitchenExtended ? -0.15 : 0.05;
        kitchenGroupRef.current.position.x += (targetX - kitchenGroupRef.current.position.x) * 0.1;
        kitchenGroupRef.current.position.y += (targetY - kitchenGroupRef.current.position.y) * 0.1;

        if (kitchenLegRef.current) {
          kitchenLegRef.current.visible = vanState.isKitchenExtended;
        }
      }

      // Interpolate Hubbett height
      if (bedGroupRef.current) {
        const targetY = vanState.isBedLowered ? 0.55 : 1.65;
        bedGroupRef.current.position.y += (targetY - bedGroupRef.current.position.y) * 0.1;

        // Update strap lines
        beltLinesRef.current.forEach((b) => {
          const points = [
            new THREE.Vector3(b.corner[0], 1.82, 0.5 + b.corner[1]),
            new THREE.Vector3(b.corner[0], bedGroupRef.current!.position.y, 0.5 + b.corner[1]),
          ];
          b.line.geometry.setFromPoints(points);
        });
      }

      // Exploded view mode interpolation
      explodedGroupsRef.current.forEach((item) => {
        const target = vanState.displayMode === 'exploded' ? item.offsetPos : item.defaultPos;
        item.group.position.lerp(target, 0.08);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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

  // Handle Display Mode & Camera Presets
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;

    // Apply Wireframe / Solid mode
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.userData.isVehicleHull) {
          child.material.wireframe = vanState.displayMode === 'wireframe';
          child.material.opacity = vanState.displayMode === 'wireframe' ? 0.4 : 0.15;
        } else if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => (m.wireframe = vanState.displayMode === 'wireframe'));
        }
      }
    });

    // Apply Camera Presets
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (vanState.cameraPreset) {
      case 'iso':
        camera.position.set(4.8, 3.2, 5.2);
        controls.target.set(0, 0.9, 0);
        break;
      case 'top':
        camera.position.set(0, 7.5, 0.01);
        controls.target.set(0, 0.9, 0);
        break;
      case 'side':
        camera.position.set(6.0, 1.2, 0);
        controls.target.set(0, 0.9, 0);
        break;
      case 'driver':
        camera.position.set(0, 1.2, -1.8);
        controls.target.set(0, 1.0, 0);
        break;
      case 'kitchen':
        camera.position.set(2.8, 1.1, -0.6);
        controls.target.set(0.6, 0.6, -0.6);
        break;
      case 'bed':
        camera.position.set(0, 2.2, 0.5);
        controls.target.set(0, 1.2, 0.5);
        break;
    }
    controls.update();
  }, [vanState.displayMode, vanState.cameraPreset]);

  // Build complete 3D scene elements
  const buildVehicleAndModules = (scene: THREE.Scene) => {
    explodedGroupsRef.current = [];

    // Materials
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2d1f1d, roughness: 0.8 }); // Dark wood vinyl
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.6 });
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15, roughness: 0.1 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5 }); // Teal slate
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const kitchenMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 });
    const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.7, roughness: 0.3 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.8 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff6b00 });

    // 1. VEHICLE CHASSIS, FRAME RAILS & SICKENBODEN FLOOR
    const floorGroup = new THREE.Group();

    // Parametric Corrugated Sickenboden Floor Mesh
    const sickenGeo = createSickenbodenGeometry();
    const sickenMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
    const sickenMesh = new THREE.Mesh(sickenGeo, sickenMat);
    sickenMesh.rotation.x = Math.PI / 2;
    sickenMesh.position.set(0, 0.015, 0);
    sickenMesh.receiveShadow = true;
    floorGroup.add(sickenMesh);

    // 12mm Subfloor Wood Top Layer
    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.012, 3.05), floorMat);
    floorMesh.position.set(0, 0.021, 0);
    floorMesh.receiveShadow = true;
    floorGroup.add(floorMesh);

    // Underbody C-Channel Main Steel Frame Rails
    const frameRails = createChassisFrameRailsGeometry();
    floorGroup.add(frameRails);

    // C/D Pillar Vertical Wall Structural Ribs
    const wallPillars = createWallPillarsGroup();
    floorGroup.add(wallPillars);

    // Wheel Arches (850 x 340 x 380 mm) at left & right rear
    const archL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.85), metalMat);
    archL.position.set(-0.69, 0.19, 0.5);
    floorGroup.add(archL);

    const archR = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.85), metalMat);
    archR.position.set(0.69, 0.19, 0.5);
    floorGroup.add(archR);

    scene.add(floorGroup);

    // 2. TRANSPARENT BODY HULL SHELL (MB Bremer 309D Profile with Grille, Headlights & Aerodynamic High Roof)
    const hullGroup = createBremerBodyShellGroup(vanState.driveSide, vanState.displayMode === 'wireframe');
    scene.add(hullGroup);

    // 3. FRONT PARTITION WALL WITH SLIDING DOOR (Z = -1.2m)
    const partGroup = new THREE.Group();

    // Wall Left Panel
    const partLeft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.80, 0.03), wallMat);
    partLeft.position.set(-0.435, 0.9, -1.2);
    partGroup.add(partLeft);

    // Wall Right Header Panel
    const partTop = new THREE.Mesh(new THREE.BoxGeometry(0.87, 0.35, 0.03), wallMat);
    partTop.position.set(0.425, 1.625, -1.2);
    partGroup.add(partTop);

    // Partition Sliding Door Panel (650 x 1450 mm)
    const partDoor = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.45, 0.02), accentMat);
    partDoor.position.set(0.35, 0.725, -1.19);
    partitionDoorRef.current = partDoor;
    partGroup.add(partDoor);

    scene.add(partGroup);

    // Exploded tracking
    explodedGroupsRef.current.push({
      group: partGroup,
      defaultPos: new THREE.Vector3(0, 0, 0),
      offsetPos: new THREE.Vector3(0, 0, -0.6),
    });

    // 4. PASSENGER SLIDING DOOR CUTOUT & FRAME (+X at Z = -0.6m)
    const slideDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.40, 1.10), new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35 }));
    slideDoorFrame.position.set(0.86, 0.95, -0.6);
    slidingDoorRef.current = slideDoorFrame;
    scene.add(slideDoorFrame);

    // 5. REAR HINGED DOUBLE DOORS (Z = +1.52m)
    const rearGroup = new THREE.Group();

    // Left Door
    const rearL = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.70, 0.04), wallMat);
    rearL.position.set(-0.42, 0.90, 1.52);
    rearDoorLeftRef.current = rearL;
    rearGroup.add(rearL);

    // Right Door
    const rearR = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.70, 0.04), wallMat);
    rearR.position.set(0.42, 0.90, 1.52);
    rearDoorRightRef.current = rearR;
    rearGroup.add(rearR);

    scene.add(rearGroup);

    // 6. L-LOUNGE BENCHES & TECH COMPARTMENTS (Left & Right)
    const loungeGroup = new THREE.Group();

    // Left Bench (Houses 200Ah LiFePO4 & Victron MultiPlus)
    const benchL = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.45, 1.90), benchMat);
    benchL.position.set(-0.61, 0.25, 0.5);
    benchL.castShadow = true;
    loungeGroup.add(benchL);

    const cushionL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 1.88), cushionMat);
    cushionL.position.set(-0.61, 0.51, 0.5);
    loungeGroup.add(cushionL);

    // Right Bench (Houses Autoterm Heater & 80L Water Tank)
    const benchR = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.45, 1.90), benchMat);
    benchR.position.set(0.61, 0.25, 0.5);
    benchR.castShadow = true;
    loungeGroup.add(benchR);

    const cushionR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 1.88), cushionMat);
    cushionR.position.set(0.61, 0.51, 0.5);
    loungeGroup.add(cushionR);

    // Lagun Swivel Table (700 x 500 mm Oak Top)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.02, 0.70), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
    tableTop.position.set(-0.10, 0.72, 0.5);
    tableTop.castShadow = true;
    loungeGroup.add(tableTop);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), stainlessMat);
    tableLeg.position.set(-0.35, 0.48, 0.5);
    loungeGroup.add(tableLeg);

    scene.add(loungeGroup);

    explodedGroupsRef.current.push({
      group: loungeGroup,
      defaultPos: new THREE.Vector3(0, 0, 0),
      offsetPos: new THREE.Vector3(-0.4, 0, 0),
    });

    // 7. OUTDOOR HEAVY-DUTY DROP KITCHEN (850 x 400 x 880 mm)
    const kitchenGroup = new THREE.Group();

    const kitBody = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.88, 0.85), kitchenMat);
    kitBody.position.set(0, 0.44, 0);
    kitBody.castShadow = true;
    kitchenGroup.add(kitBody);

    // Stainless Cooker & Sink Top
    const kitTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.83), stainlessMat);
    kitTop.position.set(0, 0.89, 0);
    kitchenGroup.add(kitTop);

    // Telescopic Support Leg
    const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.85);
    const legMesh = new THREE.Mesh(legGeo, accentMat);
    legMesh.position.set(0.15, -0.42, 0);
    legMesh.visible = false;
    kitchenLegRef.current = legMesh;
    kitchenGroup.add(legMesh);

    kitchenGroupRef.current = kitchenGroup;
    kitchenGroup.position.set(0.60, 0.05, -0.65);
    scene.add(kitchenGroup);

    explodedGroupsRef.current.push({
      group: kitchenGroup,
      defaultPos: new THREE.Vector3(0.60, 0.05, -0.65),
      offsetPos: new THREE.Vector3(1.10, 0.05, -0.65),
    });

    // 8. ELECTRIC 4-POINT STRAP DROP-DOWN BED (1850 x 1400 mm)
    const bedGroup = new THREE.Group();

    // Alu Frame
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 1.85), bedFrameMat);
    bedFrame.position.set(0, 0, 0);
    bedFrame.castShadow = true;
    bedGroup.add(bedFrame);

    // Mattress
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.33, 0.10, 1.83), mattressMat);
    mattress.position.set(0, 0.08, 0);
    bedGroup.add(mattress);

    bedGroupRef.current = bedGroup;
    bedGroup.position.set(0, 1.65, 0.5);
    scene.add(bedGroup);

    // 4 Belt Lines (Orange Safety Webbing)
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
        new THREE.Vector3(c[0], 1.82, 0.5 + c[1]),
        new THREE.Vector3(c[0], 1.65, 0.5 + c[1]),
      ]);
      const line = new THREE.Line(geo, beltMat);
      scene.add(line);
      beltLinesRef.current.push({ line, corner: c });
    });

    // 9. OVERHEAD AIRCRAFT LOCKERS (Hängeschränke)
    const lockerGroup = new THREE.Group();

    const lockerL = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 1.80), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
    lockerL.position.set(-0.70, 1.62, -0.2);
    lockerGroup.add(lockerL);

    const lockerR = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 1.80), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
    lockerR.position.set(0.70, 1.62, -0.2);
    lockerGroup.add(lockerR);

    scene.add(lockerGroup);
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
