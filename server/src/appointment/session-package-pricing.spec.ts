import { calculateSessionPackagePricing } from './session-package-pricing';

describe('calculateSessionPackagePricing', () => {
  it('keeps a single session at the base session price', () => {
    expect(calculateSessionPackagePricing(1500, 1)).toEqual({
      sessionCount: 1,
      packageName: 'Single session',
      discountPercent: 0,
      originalAmount: 1500,
      offerAmount: 1500,
    });
  });

  it('rejects multi-session packages until every session can be scheduled', () => {
    expect(calculateSessionPackagePricing(1500, 4)).toBeNull();
    expect(calculateSessionPackagePricing(1500, 8)).toBeNull();
  });

  it('rejects unsupported package sizes', () => {
    expect(calculateSessionPackagePricing(1500, 2)).toBeNull();
  });
});
