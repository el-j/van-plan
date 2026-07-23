import { describe, it, expect, vi } from 'vitest';
import { drawCADGrid, drawCADDimensionLine, drawWoodHatchPattern } from './cadGeometry';

describe('cadGeometry utility', () => {
  const createMockContext = () => {
    return {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 40 }),
      setLineDash: vi.fn(),
      lineWidth: 1,
      strokeStyle: '',
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
    } as unknown as CanvasRenderingContext2D;
  };

  it('draws CAD grid on canvas context', () => {
    const ctx = createMockContext();
    drawCADGrid(ctx, 800, 600, 40);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws CAD dimension line with arrows and label', () => {
    const ctx = createMockContext();
    drawCADDimensionLine(
      ctx,
      { x: 10, y: 10 },
      { x: 100, y: 10 },
      '1000 mm',
      20
    );

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('1000 mm', expect.any(Number), expect.any(Number));
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('handles zero length dimension line gracefully', () => {
    const ctx = createMockContext();
    drawCADDimensionLine(
      ctx,
      { x: 10, y: 10 },
      { x: 10, y: 10 },
      '0 mm',
      20
    );

    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws wood hatch pattern rectangle', () => {
    const ctx = createMockContext();
    drawWoodHatchPattern(ctx, 10, 10, 100, 50);

    expect(ctx.fillRect).toHaveBeenCalledWith(10, 10, 100, 50);
    expect(ctx.strokeRect).toHaveBeenCalledWith(10, 10, 100, 50);
  });
});
