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

  it('applies the 4-session care package offer', () => {
    expect(calculateSessionPackagePricing(1500, 4)).toEqual({
      sessionCount: 4,
      packageName: '4-session care package',
      discountPercent: 10,
      originalAmount: 6000,
      offerAmount: 5400,
    });
  });

  it('applies the 8-session care package offer', () => {
    expect(calculateSessionPackagePricing(1500, 8)).toEqual({
      sessionCount: 8,
      packageName: '8-session care package',
      discountPercent: 15,
      originalAmount: 12000,
      offerAmount: 10200,
    });
  });

  it('rejects unsupported package sizes', () => {
    expect(calculateSessionPackagePricing(1500, 2)).toBeNull();
  });
});
