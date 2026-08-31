export const THERAPIST_CONSULTATION_TYPES = [
  'Video',
  'Voice call',
  'Video or voice call',
] as const;

export const THERAPIST_ENGAGEMENT_RELATIONSHIPS = [
  'Employee',
  'Independent practitioner',
] as const;

export function getSupportedBookingModes(
  consultationType: string | null | undefined,
): readonly string[] {
  switch (consultationType) {
    case 'Video':
      return ['Video'] as const;
    case 'Voice call':
      return ['Audio'] as const;
    case 'Video or voice call':
      return ['Video', 'Audio'] as const;
    default:
      return [] as const;
  }
}

export function requiresProfessionalRegistration(
  title: string | null | undefined,
) {
  const normalized = title?.trim().toLowerCase() ?? '';
  return /\b(clinical psychologist|psychiatrist|doctor|licensed psychologist|medical practitioner|registered healthcare professional)\b/.test(
    normalized,
  );
}

const LEGACY_LANGUAGE_NAMES = new Set([
  'english',
  'malayalam',
  'hindi',
  'tamil',
  'kannada',
  'telugu',
  'arabic',
]);

export function splitLegacyTherapistTags(tags: string[] | null | undefined) {
  const normalized = (tags ?? []).map((tag) => tag.trim()).filter(Boolean);
  return {
    areasOfPractice: normalized.filter(
      (tag) => !LEGACY_LANGUAGE_NAMES.has(tag.toLowerCase()),
    ),
    languages: normalized.filter((tag) =>
      LEGACY_LANGUAGE_NAMES.has(tag.toLowerCase()),
    ),
  };
}
