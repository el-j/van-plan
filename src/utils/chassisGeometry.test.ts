import { describe, it, expect } from 'vitest';
import {
  createSickenbodenGeometry,
  createChassisFrameRailsGeometry,
  createWallPillarsGroup,
  createBremerBodyShellGroup,
  calculateSickenbodenMetrics,
} from './chassisGeometry';

describe('chassisGeometry utility', () => {
  it('creates 3D Sickenboden BufferGeometry with valid attributes', () => {
    const geo = createSickenbodenGeometry({
      lengthMm: 3050,
      widthMm: 1720,
      ribDepthMm: 15,
      ribWidthMm: 45,
      ribPitchMm: 80,
    });

    expect(geo).toBeDefined();
    expect(geo.attributes.position).toBeDefined();
    expect(geo.attributes.position.count).toBeGreaterThan(0);
  });

  it('creates underbody C-channel frame rails group', () => {
    const group = createChassisFrameRailsGeometry({
      lengthMm: 3050,
      railWidthMm: 50,
      railHeightMm: 100,
      spacingCenterMm: 820,
    });

    expect(group).toBeDefined();
    expect(group.children.length).toBe(2); // Left and right rails
  });

  it('creates C/D pillar wall structural ribs group', () => {
    const pillars = createWallPillarsGroup(3050, 1850, 600);

    expect(pillars).toBeDefined();
    expect(pillars.children.length).toBeGreaterThan(0);
  });

  it('creates 100% authentic Bremer body shell for LHD and RHD', () => {
    const shellLHD = createBremerBodyShellGroup('LHD', false);
    expect(shellLHD).toBeDefined();
    // Should contain many children: walls, roof, cab, grille, headlights, doors, wheels...
    expect(shellLHD.children.length).toBeGreaterThan(20);

    const shellRHD = createBremerBodyShellGroup('RHD', true);
    expect(shellRHD).toBeDefined();
    expect(shellRHD.children.length).toBeGreaterThan(20);
  });

  it('calculates Sickenboden corrugation metrics accurately', () => {
    const metrics = calculateSickenbodenMetrics(1720, 80);

    expect(metrics.ribCount).toBe(21);
    expect(metrics.pitchMm).toBe(80);
    expect(metrics.totalRibAreaM2).toBeGreaterThan(2.5);
  });
});
