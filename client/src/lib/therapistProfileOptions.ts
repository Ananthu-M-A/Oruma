export const therapistProfessionalRoleOptions = [
  "Counselling Psychologist",
  "Clinical Psychologist",
  "Consultant Psychologist",
  "Psychologist",
  "Counsellor",
  "Therapist",
  "Psychotherapist",
  "Psychiatrist",
] as const;

export const therapistQualificationOptions = [
  "BA Psychology",
  "BSc Psychology",
  "MA Psychology",
  "MSc Psychology",
  "MA Clinical Psychology",
  "MSc Clinical Psychology",
  "MA Counselling Psychology",
  "MSc Counselling Psychology",
  "MPhil Clinical Psychology",
  "MPhil Psychiatric Social Work",
  "PhD Psychology",
  "PG Diploma in Counselling Psychology",
  "MSW (Medical and Psychiatric Social Work)",
  "MD Psychiatry",
] as const;

export const therapistAwardingInstitutionOptions = [
  "University of Kerala",
  "Mahatma Gandhi University",
  "University of Calicut",
  "Kannur University",
  "Central University of Kerala",
  "Sree Sankaracharya University of Sanskrit",
  "CHRIST (Deemed to be University)",
  "Tata Institute of Social Sciences",
  "National Institute of Mental Health and Neuro Sciences (NIMHANS)",
  "Indira Gandhi National Open University",
] as const;

export const therapistSpecializationOptions = [
  "Anxiety & Stress",
  "Relationship & Couples",
  "Parenting & Family",
  "Child & Teen",
  "Trauma & PTSD",
  "Depression & Emotional Wellbeing",
  "Grief & Loss",
  "Postpartum",
  "Sexual Wellness",
  "Workplace Stress",
  "Breakup Recovery",
  "LGBTQIA+ Affirmative Support",
] as const;

export const therapistAreaOfPracticeOptions = [
  "Anxiety",
  "Stress & Burnout",
  "Depression",
  "Emotional Wellbeing",
  "Trauma & PTSD",
  "Relationship Issues",
  "Couple Therapy",
  "Breakup Recovery",
  "Parenting Challenges",
  "Family Counselling",
  "Child Behaviour",
  "Teenage Concerns",
  "Academic Stress",
  "Grief & Loss",
  "Postpartum Support",
  "Sexual Wellness",
  "Self-esteem",
  "Workplace Stress",
  "LGBTQIA+ Affirmative Support",
] as const;

export const therapistLanguageOptions = [
  "English",
  "Malayalam",
  "Hindi",
  "Tamil",
  "Kannada",
  "Telugu",
  "Arabic",
] as const;

export const therapistConsultationTypeOptions = [
  "Video",
  "Voice call",
  "Video or voice call",
] as const;

export const therapistEngagementRelationshipOptions = [
  "Employee",
  "Independent practitioner",
] as const;

export function getTherapistBookingModes(
  consultationType: string | null | undefined,
) {
  if (consultationType === "Video") return ["Video"];
  if (consultationType === "Voice call") return ["Audio"];
  if (consultationType === "Video or voice call") return ["Video", "Audio"];
  return [];
}

export const therapistExperienceYearOptions = Array.from(
  { length: 51 },
  (_, year) => String(year),
);

function canonicalLanguage(value: string) {
  return therapistLanguageOptions.find(
    (language) => language.toLowerCase() === value.trim().toLowerCase(),
  );
}

export function splitTherapistTags(tags: string[] | null | undefined) {
  const areasOfPractice: string[] = [];
  const languages: string[] = [];

  for (const rawTag of tags ?? []) {
    const tag = rawTag.trim();
    if (!tag) continue;
    const language = canonicalLanguage(tag);
    if (language) languages.push(language);
    else areasOfPractice.push(tag);
  }

  return {
    areasOfPractice: [...new Set(areasOfPractice)],
    languages: [...new Set(languages)],
  };
}

export function combineTherapistTags(
  areasOfPractice: string[],
  languages: string[],
) {
  return [...new Set([...areasOfPractice, ...languages].map((tag) => tag.trim()))].filter(
    Boolean,
  );
}
