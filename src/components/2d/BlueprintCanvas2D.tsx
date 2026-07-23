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
    const scale = 0.22; // 0.22px per mm
    const startX = 120;
    const startY = 90;

    const L = MB_BREMER_DIMENSIONS.cargoLength; // 3050
    const W = MB_BREMER_DIMENSIONS.cargoWidth; // 1720

    // Vehicle Outer Body Frame (3050 x 1720)
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

  // View 2: Längsschnitt (Side Elevation)
  const renderSideElevation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    unit: MetricUnit,
    isBedLowered: boolean,
    isKitchenExtended: boolean
  ) => {
    const scale = 0.22;
    const startX = 120;
    const startY = 60;

    const L = MB_BREMER_DIMENSIONS.cargoLength; // 3050
    const H = MB_BREMER_DIMENSIONS.cargoHeight; // 1850

    // Vehicle Roof Contour (Mercedes T1 High Roof)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY + H * scale);
    ctx.lineTo(startX, startY + 20);
    ctx.quadraticCurveTo(startX + (L * scale) / 2, startY - 20, startY + L * scale, startY + 20);
    ctx.lineTo(startX + L * scale, startY + H * scale);
    ctx.lineTo(startX, startY + H * scale);
    ctx.stroke();

    // Floor Line
    ctx.fillStyle = '#64748b';
    ctx.fillRect(startX, startY + H * scale, L * scale, 15);

    // Bench height (450 mm)
    ctx.fillStyle = 'rgba(15, 118, 110, 0.5)';
    ctx.fillRect(startX + 1150 * scale, startY + (H - 450) * scale, 1900 * scale, 450 * scale);

    // Hubbett (Bed) Position
    const bedY = isBedLowered ? startY + (H - 550) * scale : startY + (H - 1650) * scale;
    ctx.fillStyle = 'rgba(255, 107, 0, 0.7)';
    ctx.fillRect(startX + 1150 * scale, bedY, 1850 * scale, 30);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(startX + 1150 * scale, bedY, 1850 * scale, 30);

    // Straps / Gurte (4-Point)
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX + 1200 * scale, startY + 20);
    ctx.lineTo(startX + 1200 * scale, bedY);
    ctx.moveTo(startX + 2900 * scale, startY + 20);
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

  // View 3: Querschnitt (Rear Elevation)
  const renderRearElevation = (ctx: CanvasRenderingContext2D, width: number, height: number, unit: MetricUnit, isBedLowered: boolean) => {
    const scale = 0.24;
    const startX = 220;
    const startY = 60;

    const W = MB_BREMER_DIMENSIONS.cargoWidth; // 1720
    const H = MB_BREMER_DIMENSIONS.cargoHeight; // 1850

    // Body Contour
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY + H * scale);
    ctx.lineTo(startX, startY + 80);
    ctx.quadraticCurveTo(startX + (W * scale) / 2, startY - 30, startY + W * scale, startY + 80);
    ctx.lineTo(startX + W * scale, startY + H * scale);
    ctx.stroke();

    // Benches Bottom Left & Right
    ctx.fillStyle = 'rgba(15, 118, 110, 0.6)';
    ctx.fillRect(startX, startY + (H - 450) * scale, 500 * scale, 450 * scale);
    ctx.fillRect(startX + (W - 500) * scale, startY + (H - 450) * scale, 500 * scale, 450 * scale);

    // Bed Frame
    const bedY = isBedLowered ? startY + (H - 550) * scale : startY + (H - 1650) * scale;
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(startX + 180 * scale, bedY, 1360 * scale, 35 * scale);

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
