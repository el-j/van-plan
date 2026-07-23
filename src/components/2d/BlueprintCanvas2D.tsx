import React, { useEffect, useRef } from 'react';
import { VanState, MetricUnit, VisibleLayers2D } from '../../types/van';
import { MB_BREMER_DIMENSIONS } from '../../data/vehicleData';
import { drawCADGrid, drawCADDimensionLine, drawWoodHatchPattern } from '../../utils/cadGeometry';
import { formatDimension } from '../../utils/formatters';

interface BlueprintCanvas2DProps {
  vanState: VanState;
}

export const BlueprintCanvas2D: React.FC<BlueprintCanvas2DProps> = ({ vanState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background CAD Dark Surface
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    drawCADGrid(ctx, canvas.width, canvas.height, 40);

    const unit = vanState.unit;
    const view = vanState.blueprintView;
    const driveSide = vanState.driveSide || 'LHD';
    const layers = vanState.visibleLayers2D || {
      dimensions: true,
      walkway: true,
      bed: true,
      kitchen: true,
      benches: true,
      partition: true,
      chassis: true,
    };

    if (view === 'floor') {
      renderFloorPlan(ctx, canvas.width, canvas.height, unit, driveSide, layers);
    } else if (view === 'side') {
      renderSideElevation(ctx, canvas.width, canvas.height, unit, vanState.isBedLowered, vanState.isKitchenExtended, layers);
    } else if (view === 'rear') {
      renderRearElevation(ctx, canvas.width, canvas.height, unit, vanState.isBedLowered, layers);
    } else {
      renderFloorPlan(ctx, canvas.width, canvas.height, unit, driveSide, layers);
    }
  }, [
    vanState.blueprintView,
    vanState.unit,
    vanState.driveSide,
    vanState.isBedLowered,
    vanState.isKitchenExtended,
    vanState.visibleLayers2D,
  ]);

  // View 1: Draufsicht (Floor Plan) - German LHD vs RHD Mirroring
  const renderFloorPlan = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    unit: MetricUnit,
    driveSide: 'LHD' | 'RHD',
    layers: VisibleLayers2D
  ) => {
    const scale = 0.18; // 0.18px per mm
    const startX = 180;
    const startY = 100;

    const L = MB_BREMER_DIMENSIONS.cargoLength; // 3050
    const W = MB_BREMER_DIMENSIONS.cargoWidth; // 1720

    // Vehicle Cargo Outer Body Frame (3050 x 1720 mm)
    if (layers.chassis) {
      // Bonnet / Nose
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX - 1200 * scale, startY + 100 * scale);
      ctx.lineTo(startX, startY);
      ctx.lineTo(startX, startY + W * scale);
      ctx.lineTo(startX - 1200 * scale, startY + (W - 100) * scale);
      ctx.closePath();
      ctx.stroke();

      // Outer Cargo Shell
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX, startY, L * scale, W * scale);

      // Wheel Arches (850 x 340 mm)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.fillRect(startX + 2200 * scale, startY, 850 * scale, 340 * scale);
      ctx.fillRect(startX + 2200 * scale, startY + 1380 * scale, 850 * scale, 340 * scale);
    }

    // Driver & Passenger Seats based on LHD vs RHD
    // Heading LEFT: Left side of vehicle (Driver in LHD) = BOTTOM of canvas (Y=1100), Right side = TOP of canvas (Y=150)
    const driverY = driveSide === 'LHD' ? startY + 1100 * scale : startY + 150 * scale;
    const passengerY = driveSide === 'LHD' ? startY + 150 * scale : startY + 1100 * scale;
    const driverLabel = driveSide === 'LHD' ? 'Fahrersitz 🇩🇪 (LHD)' : 'Fahrersitz 🇬🇧 (RHD)';
    const passengerLabel = 'Beifahrersitz';

    ctx.fillStyle = '#334155';
    ctx.fillRect(startX - 800 * scale, driverY, 480 * scale, 480 * scale);
    ctx.fillRect(startX - 800 * scale, passengerY, 480 * scale, 480 * scale);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(driverLabel, startX - 780 * scale, driverY + 230 * scale);
    ctx.fillText(passengerLabel, startX - 780 * scale, passengerY + 230 * scale);

    // Partition Wall & Sliding Door
    if (layers.partition) {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(startX, startY, 30, W * scale);

      // Door Passage (650 mm)
      const doorY = driveSide === 'LHD' ? startY + 470 * scale : startY + 600 * scale;
      ctx.fillStyle = '#ff6b00';
      ctx.fillRect(startX, doorY, 30, 650 * scale);
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText('Durchgang 650mm', startX - 95, doorY + 325 * scale);
    }

    // Benches (Left & Right)
    if (layers.benches) {
      drawWoodHatchPattern(ctx, startX + 1150 * scale, startY, 1900 * scale, 500 * scale, 'rgba(15, 118, 110, 0.4)');
      drawWoodHatchPattern(ctx, startX + 1150 * scale, startY + 1220 * scale, 1900 * scale, 500 * scale, 'rgba(15, 118, 110, 0.4)');
    }

    if (layers.kitchen) {
      const kitchenY = driveSide === 'LHD' ? startY : startY + 1320 * scale;
      drawWoodHatchPattern(ctx, startX + 200 * scale, kitchenY, 850 * scale, 400 * scale, 'rgba(255, 107, 0, 0.4)');
    }

    // Elevating Bed Overlay
    if (layers.bed) {
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(startX + 1200 * scale, startY + 160 * scale, 1850 * scale, 1400 * scale);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
      ctx.fillRect(startX + 1200 * scale, startY + 160 * scale, 1850 * scale, 1400 * scale);
      ctx.fillStyle = '#f97316';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText('Hubbett (1850 x 1400 mm)', startX + 1800 * scale, startY + 860 * scale);
    }

    // Central Walkway Guideline (600 mm width)
    if (layers.walkway) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(startX, startY + 860 * scale);
      ctx.lineTo(startX + L * scale, startY + 860 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Dimension lines
    if (layers.dimensions) {
      drawCADDimensionLine(
        ctx,
        { x: startX, y: startY - 25 },
        { x: startX + L * scale, y: startY - 25 },
        `Laderaum: ${formatDimension(L, unit)}`,
        0
      );

      drawCADDimensionLine(
        ctx,
        { x: startX + L * scale + 35, y: startY },
        { x: startX + L * scale + 35, y: startY + W * scale },
        `Breite: ${formatDimension(W, unit)}`,
        0
      );

      drawCADDimensionLine(
        ctx,
        { x: startX + 2200 * scale, y: startY + 340 * scale + 15 },
        { x: startX + 2200 * scale, y: startY + 1380 * scale - 15 },
        `Zwischen Radkästen: ${formatDimension(1040, unit)}`,
        0,
        '#22c55e'
      );
    }
  };

  // View 2: Längsschnitt (Side Elevation with Authentic Rear Roof Slope)
  const renderSideElevation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    unit: MetricUnit,
    isBedLowered: boolean,
    isKitchenExtended: boolean,
    layers: VisibleLayers2D
  ) => {
    const scale = 0.18;
    const startX = 180;
    const startY = 80;

    const L = MB_BREMER_DIMENSIONS.cargoLength; // 3050
    const H = MB_BREMER_DIMENSIONS.cargoHeight; // 1850

    // Vehicle Contour with Driver Cockpit Snout Nose & Rear Sloped High Roof
    if (layers.chassis) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Front Bumper to Bonnet
      ctx.moveTo(startX - 1200 * scale, startY + H * scale);
      ctx.lineTo(startX - 1200 * scale, startY + (H - 500) * scale);
      // Bonnet Slanted Nose (45 deg)
      ctx.lineTo(startX - 700 * scale, startY + (H - 950) * scale);
      // Windshield Slanted Glass (60 deg)
      ctx.lineTo(startX - 300 * scale, startY + (H - 1550) * scale);
      // Roof Crown Line over cargo area
      ctx.lineTo(startX, startY);
      ctx.lineTo(startX + 2200 * scale, startY);
      // Rear High Roof Slope Downwards (80mm slope at rear door header)
      ctx.quadraticCurveTo(startX + 2800 * scale, startY + 20 * scale, startX + L * scale, startY + 80 * scale);
      // Rear Drop Line
      ctx.lineTo(startX + L * scale, startY + H * scale);
      // Floor Line
      ctx.lineTo(startX - 1200 * scale, startY + H * scale);
      ctx.stroke();

      // Heavy Floor Beam Line
      ctx.fillStyle = '#64748b';
      ctx.fillRect(startX - 1200 * scale, startY + H * scale, (L + 1200) * scale, 15);
    }

    // Partition Wall at Z = -1200 mm
    if (layers.partition) {
      ctx.strokeStyle = '#ff6b00';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY + H * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff6b00';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('Trennwand Z = -1200mm', startX + 10, startY + 40);
    }

    // Benches (450 mm height)
    if (layers.benches) {
      ctx.fillStyle = 'rgba(15, 118, 110, 0.5)';
      ctx.fillRect(startX + 1150 * scale, startY + (H - 450) * scale, 1900 * scale, 450 * scale);
    }

    // Hubbett (Bed) Position
    if (layers.bed) {
      const bedY = isBedLowered ? startY + (H - 550) * scale : startY + (H - 1650) * scale;
      ctx.fillStyle = 'rgba(255, 107, 0, 0.8)';
      ctx.fillRect(startX + 1150 * scale, bedY, 1850 * scale, 30);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(startX + 1150 * scale, bedY, 1850 * scale, 30);

      // Straps / Gurte
      ctx.strokeStyle = '#ff6b00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX + 1200 * scale, startY + 10);
      ctx.lineTo(startX + 1200 * scale, bedY);
      ctx.moveTo(startX + 2900 * scale, startY + 10);
      ctx.lineTo(startX + 2900 * scale, bedY);
      ctx.stroke();
    }

    // Dimension lines
    if (layers.dimensions) {
      drawCADDimensionLine(
        ctx,
        { x: startX - 35, y: startY + H * scale },
        { x: startX - 35, y: startY },
        `Stehhöhe: ${formatDimension(H, unit)}`,
        0
      );
    }
  };

  // View 3: Authentic Querschnitt (Rear Elevation with True 1400mm Hubbett Span)
  const renderRearElevation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    unit: MetricUnit,
    isBedLowered: boolean,
    layers: VisibleLayers2D
  ) => {
    const scale = 0.22;
    const startX = 290;
    const startY = 80;

    const W = MB_BREMER_DIMENSIONS.cargoWidth; // 1720
    const H = MB_BREMER_DIMENSIONS.cargoHeight; // 1850

    // Authentic Body Contour
    if (layers.chassis) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Floor left corner
      ctx.moveTo(startX, startY + H * scale);
      // Tapered side wall to shoulder height (Y = 1420mm)
      ctx.lineTo(startX + 80 * scale, startY + (H - 1420) * scale);
      // Rounded GFK Roof Shoulder
      ctx.quadraticCurveTo(startX + 120 * scale, startY + (H - 1750) * scale, startX + 250 * scale, startY);
      // Flat Crowned Roof Top Plate (width 1220mm)
      ctx.lineTo(startX + (W - 250) * scale, startY);
      // Right Roof Shoulder
      ctx.quadraticCurveTo(startX + (W - 120) * scale, startY + (H - 1750) * scale, startX + (W - 80) * scale, startY + (H - 1420) * scale);
      // Right Tapered Side Wall down to floor
      ctx.lineTo(startX + W * scale, startY + H * scale);
      // Floor Line
      ctx.lineTo(startX, startY + H * scale);
      ctx.stroke();
    }

    // Benches Bottom Left & Right
    if (layers.benches) {
      ctx.fillStyle = 'rgba(15, 118, 110, 0.6)';
      ctx.fillRect(startX, startY + (H - 450) * scale, 500 * scale, 450 * scale);
      ctx.fillRect(startX + (W - 500) * scale, startY + (H - 450) * scale, 500 * scale, 450 * scale);
    }

    // Hubbett Frame (True 1400 mm Width Span)
    if (layers.bed) {
      const bedY = isBedLowered ? startY + (H - 550) * scale : startY + (H - 1650) * scale;
      const bedWidth = 1400 * scale;
      const bedStartX = startX + (W * scale - bedWidth) / 2;

      ctx.fillStyle = '#ff6b00';
      ctx.fillRect(bedStartX, bedY, bedWidth, 35 * scale);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(bedStartX, bedY, bedWidth, 35 * scale);
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText('Hubbett 1400mm', bedStartX + 80, bedY + 22);
    }

    // Gangway Guideline
    if (layers.walkway) {
      drawCADDimensionLine(
        ctx,
        { x: startX + 500 * scale, y: startY + (H - 200) * scale },
        { x: startX + (W - 500) * scale, y: startY + (H - 200) * scale },
        `Gang: ${formatDimension(600, unit)}`,
        0,
        '#22c55e'
      );
    }
  };

  return (
    <div className="blueprint-canvas-wrapper">
      <canvas ref={canvasRef} width={960} height={540} />
    </div>
  );
};
