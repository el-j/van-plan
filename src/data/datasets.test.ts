import { describe, it, expect } from 'vitest';
import { MB_BREMER_DIMENSIONS, MB_BREMER_SPECS } from './vehicleData';
import { INTERIOR_MODULES } from './modulesData';
import { MASTER_BOM_ITEMS } from './bomData';

describe('vehicleData dataset', () => {
  it('contains valid Mercedes 309D Bremer dimensions', () => {
    expect(MB_BREMER_DIMENSIONS.cargoLength).toBe(3050);
    expect(MB_BREMER_DIMENSIONS.cargoWidth).toBe(1720);
    expect(MB_BREMER_DIMENSIONS.cargoHeight).toBe(1850);
    expect(MB_BREMER_DIMENSIONS.archDistanceBetween).toBe(1040);
  });

  it('contains spec details array', () => {
    expect(MB_BREMER_SPECS.length).toBeGreaterThan(5);
    MB_BREMER_SPECS.forEach((spec) => {
      expect(spec.label).toBeDefined();
      expect(spec.value).toBeDefined();
    });
  });
});

describe('modulesData dataset', () => {
  it('contains 6 fully detailed interior modules', () => {
    expect(INTERIOR_MODULES.length).toBe(6);

    INTERIOR_MODULES.forEach((mod) => {
      expect(mod.id).toBeDefined();
      expect(mod.name).toBeDefined();
      expect(mod.cutList.length).toBeGreaterThan(0);
      expect(mod.assemblySteps.length).toBeGreaterThan(0);
      expect(mod.resellerLinks.length).toBeGreaterThan(0);
    });
  });
});

describe('bomData dataset', () => {
  it('contains master bill of materials items', () => {
    expect(MASTER_BOM_ITEMS.length).toBeGreaterThan(10);

    MASTER_BOM_ITEMS.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.unitPriceEuro).toBeGreaterThan(0);
      expect(item.totalPriceEuro).toBeCloseTo(item.unitPriceEuro * item.quantity, 2);
      expect(item.shopUrl).toContain('http');
    });
  });
});
