import { businessConfig, validateBusinessConfig } from './business.config';

describe('businessConfig', () => {
  it('contains a complete individual-owner identity without sensitive KYC numbers', () => {
    expect(validateBusinessConfig(businessConfig)).toEqual([]);
    expect(businessConfig.operatorLegalName).toBe('RANJINI R');
    expect(businessConfig.businessStructure).toBe('Individual-owned business');
    expect(businessConfig.gstin).toBeNull();
    expect(JSON.stringify(businessConfig)).not.toMatch(
      /aadhaar|bank.?account|pan.?number/i,
    );
  });
});
