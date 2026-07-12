export type SessionPackageOption = {
  sessionCount: 1 | 4 | 8;
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
  {
    sessionCount: 4,
    discountPercent: 10,
    label: "4-session care package",
    shortLabel: "4 sessions",
  },
  {
    sessionCount: 8,
    discountPercent: 15,
    label: "8-session care package",
    shortLabel: "8 sessions",
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
