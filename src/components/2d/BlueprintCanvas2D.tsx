import React, { useEffect, useRef } from 'react';
import { VanState, MetricUnit } from '../../types/van';
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

    if (view === 'floor') {
      renderFloorPlan(ctx, canvas.width, canvas.height, unit);
    } else if (view === 'side') {
      renderSideElevation(ctx, canvas.width, canvas.height, unit, vanState.isBedLowered, vanState.isKitchenExtended);
    } else if (view === 'rear') {
      renderRearElevation(ctx, canvas.width, canvas.height, unit, vanState.isBedLowered);
    } else {
      renderFloorPlan(ctx, canvas.width, canvas.height, unit);
    }
  }, [vanState.blueprintView, vanState.unit, vanState.isBedLowered, vanState.isKitchenExtended]);

  // View 1: Draufsicht (Floor Plan)
  const renderFloorPlan = (ctx: CanvasRenderingContext2D, width: number, height: number, unit: MetricUnit) => {
    const scale = 0.18; // 0.18px per mm
    const startX = 180;
    const startY = 100;

    const L = MB_BREMER_DIMENSIONS.cargoLength; // 3050
    const W = MB_BREMER_DIMENSIONS.cargoWidth; // 1720

    // Driver Cockpit Front Bonnet (Short Snout Nose)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX - 1200 * scale, startY + 100 * scale);
    ctx.lineTo(startX, startY);
    ctx.lineTo(startX, startY + W * scale);
    ctx.lineTo(startX - 1200 * scale, startY + (W - 100) * scale);
    ctx.closePath();
    ctx.stroke();

    // Driver & Passenger Seats
    ctx.fillStyle = '#334155';
    ctx.fillRect(startX - 800 * scale, startY + 150 * scale, 480 * scale, 480 * scale); // Driver (LHD)
    ctx.fillRect(startX - 800 * scale, startY + 1100 * scale, 480 * scale, 480 * scale); // Passenger
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('Fahrersitz', startX - 780 * scale, startY + 380 * scale);
    ctx.fillText('Beifahrersitz', startX - 780 * scale, startY + 1330 * scale);

    // Vehicle Cargo Outer Body Frame (3050 x 1720 mm)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, startY, L * scale, W * scale);

    // Partition Wall at front (left side in top view)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(startX, startY, 30, W * scale);

    // Partition Door Cutout (650 mm)
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(startX, startY + 600 * scale, 30, 650 * scale);
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('Durchgang 650mm', startX - 95, startY + 925 * scale);

    // Benches (Left & Right)
    drawWoodHatchPattern(ctx, startX + 1150 * scale, startY, 1900 * scale, 500 * scale, 'rgba(15, 118, 110, 0.4)');
    drawWoodHatchPattern(ctx, startX + 1150 * scale, startY + 1220 * scale, 1900 * scale, 500 * scale, 'rgba(15, 118, 110, 0.4)');

    // Kitchen Unit (850 x 400 mm) at sliding door
    drawWoodHatchPattern(ctx, startX + 200 * scale, startY + 1320 * scale, 850 * scale, 400 * scale, 'rgba(255, 107, 0, 0.4)');

    // Wheel Arches (850 x 340 mm)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillRect(startX + 2200 * scale, startY, 850 * scale, 340 * scale);
    ctx.fillRect(startX + 2200 * scale, startY + 1380 * scale, 850 * scale, 340 * scale);

    // Central Walkway Guideline (600 mm width)
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(startX, startY + 860 * scale);
    ctx.lineTo(startX + L * scale, startY + 860 * scale);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dimension lines
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
  };

  // View 2: Längsschnitt (Side Elevation with Driver Cab)
  const renderSideElevation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    unit: MetricUnit,
    isBedLowered: boolean,
    isKitchenExtended: boolean
  ) => {
    const scale = 0.18;
    const startX = 180;
    const startY = 80;

    const L = MB_BREMER_DIMENSIONS.cargoLength; // 3050
    const H = MB_BREMER_DIMENSIONS.cargoHeight; // 1850

    // Vehicle Outline with Driver Cockpit Snout Nose & GFK Hochdach
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Bumper to Bonnet
    ctx.moveTo(startX - 1200 * scale, startY + H * scale);
    ctx.lineTo(startX - 1200 * scale, startY + (H - 500) * scale);
    // Bonnet Slanted Nose (45 deg)
    ctx.lineTo(startX - 700 * scale, startY + (H - 950) * scale);
    // Windshield Slanted Glass (60 deg)
    ctx.lineTo(startX - 300 * scale, startY + (H - 1550) * scale);
    // Roof Line (Slight crown slope to rear)
    ctx.lineTo(startX, startY);
    ctx.lineTo(startX + L * scale, startY + 10);
    // Rear Drop
    ctx.lineTo(startX + L * scale, startY + H * scale);
    // Floor Line
    ctx.lineTo(startX - 1200 * scale, startY + H * scale);
    ctx.stroke();

    // Partition Wall at Z = -1200 mm
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

    // Floor Line Heavy
    ctx.fillStyle = '#64748b';
    ctx.fillRect(startX - 1200 * scale, startY + H * scale, (L + 1200) * scale, 15);

    // Benches (450 mm height)
    ctx.fillStyle = 'rgba(15, 118, 110, 0.5)';
    ctx.fillRect(startX + 1150 * scale, startY + (H - 450) * scale, 1900 * scale, 450 * scale);

    // Hubbett (Bed) Position
    const bedY = isBedLowered ? startY + (H - 550) * scale : startY + (H - 1650) * scale;
    ctx.fillStyle = 'rgba(255, 107, 0, 0.7)';
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

    // Dimension lines
    drawCADDimensionLine(
      ctx,
      { x: startX - 35, y: startY + H * scale },
      { x: startX - 35, y: startY },
      `Stehhöhe: ${formatDimension(H, unit)}`,
      0
    );
  };

  // View 3: Authentic Querschnitt (Rear Elevation with GFK Hochdach Shoulder Curves)
  const renderRearElevation = (ctx: CanvasRenderingContext2D, width: number, height: number, unit: MetricUnit, isBedLowered: boolean) => {
    const scale = 0.22;
    const startX = 290;
    const startY = 80;

    const W = MB_BREMER_DIMENSIONS.cargoWidth; // 1720
    const H = MB_BREMER_DIMENSIONS.cargoHeight; // 1850

    // Authentic Mercedes T1 Bremer Body Contour:
    // Vertical/tapered side walls to shoulder height Y = 1420mm, curved shoulders to Y = 1850mm, flat crowned top plate
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

    // Benches Bottom Left & Right
    ctx.fillStyle = 'rgba(15, 118, 110, 0.6)';
    ctx.fillRect(startX, startY + (H - 450) * scale, 500 * scale, 450 * scale);
    ctx.fillRect(startX + (W - 500) * scale, startY + (H - 450) * scale, 500 * scale, 450 * scale);

    // Bed Frame
    const bedY = isBedLowered ? startY + (H - 550) * scale : startY + (H - 1650) * scale;
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(startX + 180 * scale, bedY, 1360 * scale, 35 * scale);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(startX + 180 * scale, bedY, 1360 * scale, 35 * scale);

    // Dimension lines
    drawCADDimensionLine(
      ctx,
      { x: startX + 500 * scale, y: startY + (H - 200) * scale },
      { x: startX + (W - 500) * scale, y: startY + (H - 200) * scale },
      `Gang: ${formatDimension(600, unit)}`,
      0,
      '#22c55e'
    );
  };

  return (
    <div className="blueprint-canvas-wrapper">
      <canvas ref={canvasRef} width={960} height={540} />
    </div>
  );
};
