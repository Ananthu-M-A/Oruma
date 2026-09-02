type SessionPackageOption = {
  sessionCount: 1;
  discountPercent: number;
  label: string;
  shortLabel: string;
};

export const SESSION_PACKAGE_OPTIONS: SessionPackageOption[] = [
  {
    sessionCount: 1,
    discountPercent: 0,
    label: "Single session",
    shortLabel: "1 session",
  },
];

export function calculateSessionPackagePricing(
  baseSessionAmount: number,
  sessionCount: number,
) {
  const option =
    SESSION_PACKAGE_OPTIONS.find(
      (item) => item.sessionCount === sessionCount,
    ) ?? SESSION_PACKAGE_OPTIONS[0];
  const originalAmount = baseSessionAmount * option.sessionCount;
  const discountAmount = Math.round(
    (originalAmount * option.discountPercent) / 100,
  );

  return {
    ...option,
    originalAmount,
    offerAmount: originalAmount - discountAmount,
    discountAmount,
  };
}

export function formatINR(amount: number) {
  return `Rs.${amount.toLocaleString("en-IN")}`;
}
