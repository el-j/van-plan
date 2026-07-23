import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as THREE from 'three';

// Mock WebGLRenderer constructor for Three.js in headless JSDOM
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');

  class MockWebGLRenderer {
    domElement = document.createElement('canvas');
    shadowMap = { enabled: false, type: 0 };
    localClippingEnabled = false;
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});

// Mock Canvas 2D Context for tests
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId: string) => {
  if (contextId === '2d') {
    return {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      quadraticCurveTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
    };
  }
  return null;
});

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 0) as unknown as number;
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
