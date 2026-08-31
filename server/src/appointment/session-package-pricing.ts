export type SessionPackageOption = {
  sessionCount: 1;
  discountPercent: number;
  label: string;
};

export const SESSION_PACKAGE_OPTIONS: SessionPackageOption[] = [
  { sessionCount: 1, discountPercent: 0, label: 'Single session' },
];

export function getSessionPackageOption(sessionCount: number) {
  return SESSION_PACKAGE_OPTIONS.find(
    (option) => option.sessionCount === sessionCount,
  );
}

export function calculateSessionPackagePricing(
  baseSessionAmount: number,
  requestedSessionCount = 1,
) {
  const option = getSessionPackageOption(requestedSessionCount);
  if (!option) return null;

  const originalAmount = baseSessionAmount * option.sessionCount;
  const discountAmount = Math.round(
    (originalAmount * option.discountPercent) / 100,
  );
  const offerAmount = originalAmount - discountAmount;

  return {
    sessionCount: option.sessionCount,
    packageName: option.label,
    discountPercent: option.discountPercent,
    originalAmount,
    offerAmount,
  };
}
