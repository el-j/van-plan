export interface CADPoint {
  x: number;
  y: number;
}

export function drawCADGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSizePx: number = 40,
  subGridColor: string = 'rgba(45, 55, 72, 0.4)',
  mainGridColor: string = 'rgba(255, 107, 0, 0.25)'
) {
  ctx.save();
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += gridSizePx) {
    ctx.strokeStyle = x % (gridSizePx * 5) === 0 ? mainGridColor : subGridColor;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += gridSizePx) {
    ctx.strokeStyle = y % (gridSizePx * 5) === 0 ? mainGridColor : subGridColor;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawCADDimensionLine(
  ctx: CanvasRenderingContext2D,
  p1: CADPoint,
  p2: CADPoint,
  label: string,
  offsetPx: number = 20,
  color: string = '#ff6b00',
  textColor: string = '#ffffff'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = textColor;
  ctx.lineWidth = 1.5;
  ctx.font = '500 11px "JetBrains Mono", monospace';

  // Calculate unit vector & normal vector
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) {
    ctx.restore();
    return;
  }

  const nx = -dy / len;
  const ny = dx / len;

  // Offset points
  const o1: CADPoint = { x: p1.x + nx * offsetPx, y: p1.y + ny * offsetPx };
  const o2: CADPoint = { x: p2.x + nx * offsetPx, y: p2.y + ny * offsetPx };

  // Extension lines from object to dimension line
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(o1.x + nx * 4, o1.y + ny * 4);
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(o2.x + nx * 4, o2.y + ny * 4);
  ctx.stroke();

  // Main dimension line
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(o1.x, o1.y);
  ctx.lineTo(o2.x, o2.y);
  ctx.stroke();

  // Tick marks / Arrows at ends
  const arrowSize = 6;
  const angle = Math.atan2(dy, dx);

  // Arrow 1
  ctx.beginPath();
  ctx.moveTo(o1.x, o1.y);
  ctx.lineTo(o1.x + Math.cos(angle + Math.PI / 6) * arrowSize, o1.y + Math.sin(angle + Math.PI / 6) * arrowSize);
  ctx.moveTo(o1.x, o1.y);
  ctx.lineTo(o1.x + Math.cos(angle - Math.PI / 6) * arrowSize, o1.y + Math.sin(angle - Math.PI / 6) * arrowSize);
  ctx.stroke();

  // Arrow 2
  ctx.beginPath();
  ctx.moveTo(o2.x, o2.y);
  ctx.lineTo(o2.x - Math.cos(angle + Math.PI / 6) * arrowSize, o2.y - Math.sin(angle + Math.PI / 6) * arrowSize);
  ctx.moveTo(o2.x, o2.y);
  ctx.lineTo(o2.x - Math.cos(angle - Math.PI / 6) * arrowSize, o2.y - Math.sin(angle - Math.PI / 6) * arrowSize);
  ctx.stroke();

  // Text label background & text
  const midX = (o1.x + o2.x) / 2;
  const midY = (o1.y + o2.y) / 2;

  const textWidth = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(18, 20, 24, 0.85)';
  ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, midX, midY);

  ctx.restore();
}

export function drawWoodHatchPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bgColor: string = 'rgba(210, 140, 80, 0.25)',
  lineColor: string = 'rgba(255, 255, 255, 0.2)'
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  const step = 16;
  ctx.beginPath();
  for (let i = -h; i < w; i += step) {
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
  }
  ctx.stroke();

  ctx.strokeStyle = '#e0a060';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, w, h);

  ctx.restore();
}
