export const concernPaths = {
  relationship: "/concerns/relationship-marriage",
  breakup: "/concerns/breakup-recovery",
  anxiety: "/concerns/anxiety-stress",
  emotionalWellbeing: "/concerns/emotional-wellbeing",
  postpartum: "/concerns/postpartum-support",
  depression: "/concerns/depression",
  student: "/concerns/teenage-wellbeing",
  trauma: "/concerns/trauma-ptsd",
} as const;

export type ConcernPath = (typeof concernPaths)[keyof typeof concernPaths];

export const legacyConcernHashPaths: Record<string, ConcernPath> = {
  relationship: concernPaths.relationship,
  breakup: concernPaths.breakup,
  // The legacy home-page #anxiety link represented the broader emotional
  // wellbeing area. The focused anxiety service has its own route now.
  anxiety: concernPaths.emotionalWellbeing,
  emotional: concernPaths.emotionalWellbeing,
  postpartum: concernPaths.postpartum,
  depression: concernPaths.depression,
  student: concernPaths.student,
  trauma: concernPaths.trauma,
};

export function therapistDirectoryHref(
  areas: string[],
  language?: string,
  sessionFor?: string,
) {
  const params = new URLSearchParams();
  if (areas.length) params.set("areas", areas.join(","));
  if (language && language !== "No preference") params.set("language", language);
  if (sessionFor) params.set("sessionFor", sessionFor);
  const query = params.toString();
  return query ? `/therapists?${query}` : "/therapists";
}
