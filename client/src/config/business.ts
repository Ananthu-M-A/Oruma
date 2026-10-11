import rawBusinessConfig from "../../../config/business.json";

type BusinessConfig = typeof rawBusinessConfig;

const placeholderPattern =
  /\[(?:required|verification required)\]|\b(?:todo|tbd|placeholder|example)\b/i;

export function validateBusinessConfig(config: BusinessConfig) {
  const warnings: string[] = [];
  const requiredIdentityValues = {
    brandName: config.brandName,
    website: config.website,
    operatorLegalName: config.operatorLegalName,
    businessStructure: config.businessStructure,
    serviceDescription: config.serviceDescription,
    supportPhone: config.supportPhone.display,
    supportPhoneLink: config.supportPhone.e164,
    whatsappPhone: config.whatsappPhone.digits,
    supportEmail: config.emails.support,
    refundEmail: config.emails.refund,
    cancellationEmail: config.emails.cancellation,
    privacyEmail: config.emails.privacy,
    address: config.address.lines.join(", "),
  };

  for (const [field, value] of Object.entries(requiredIdentityValues)) {
    if (!value.trim())
      warnings.push(`Missing required business identity value: ${field}`);
    else if (placeholderPattern.test(value)) {
      warnings.push(`Placeholder business identity value detected: ${field}`);
    }
  }

  if (!/^\+91\d{10}$/.test(config.supportPhone.e164)) {
    warnings.push("Support phone must be an Indian E.164 number.");
  }
  if (
    config.whatsappPhone.digits !== config.supportPhone.e164.replace(/^\+/, "")
  ) {
    warnings.push(
      "The displayed support phone and WhatsApp destination do not match.",
    );
  }
  if (!config.address.postalCode.match(/^\d{6}$/)) {
    warnings.push("The operating address requires a six-digit PIN code.");
  }

  return warnings;
}

export const businessConfig = Object.freeze(rawBusinessConfig);
export const businessConfigWarnings = validateBusinessConfig(businessConfig);
export const businessAddress = businessConfig.address.lines.join(", ");
export const ownershipDisclosure = `${businessConfig.brandName} is a brand operated by ${businessConfig.operatorLegalName}, an individual business providing online counselling and wellness services.`;

export const businessLinks = Object.freeze({
  website: businessConfig.website,
  supportEmail: `mailto:${businessConfig.emails.support}`,
  refundEmail: `mailto:${businessConfig.emails.refund}`,
  cancellationEmail: `mailto:${businessConfig.emails.cancellation}`,
  privacyEmail: `mailto:${businessConfig.emails.privacy}`,
  supportPhone: `tel:${businessConfig.supportPhone.e164}`,
});

export function createWhatsAppUrl(message: string) {
  return `https://wa.me/${businessConfig.whatsappPhone.digits}?text=${encodeURIComponent(message)}`;
}

export function createSupportEmailUrl(message: string, subject?: string) {
  const firstLine = message.trim().split(/\r?\n/, 1)[0] ?? "";
  const generatedSubject = firstLine.replace(/^hello,?\s*/i, "").trim();
  const query = new URLSearchParams({
    subject: (subject || generatedSubject || "Oruma support enquiry").slice(0, 120),
    body: message,
  });
  return `${businessLinks.supportEmail}?${query.toString()}`;
}

const supportEmailPageTopics: Record<string, string> = {
  "/": "choosing counselling or wellness support",
  "/about": "learning how Oruma's services work",
  "/articles": "reading Oruma's emotional wellbeing articles",
  "/concerns": "choosing a counselling or wellness concern area",
  "/concerns/all-concerns": "choosing a counselling or wellness concern area",
  "/concerns/relationship-marriage": "relationship and marriage counselling",
  "/concerns/breakup-recovery": "breakup recovery counselling",
  "/concerns/anxiety-stress": "anxiety and stress counselling",
  "/concerns/emotional-wellbeing": "emotional wellbeing support",
  "/concerns/postpartum-support": "postpartum counselling support",
  "/concerns/depression": "depression and low mood support",
  "/concerns/teenage-wellbeing": "teenage and student counselling",
  "/concerns/trauma-ptsd": "trauma and PTSD counselling",
  "/therapists": "choosing a verified practitioner",
  "/find-your-psychologist": "finding a practitioner for a specific need",
  "/online-counselling": "understanding online counselling at Oruma",
  "/consultation": "an online consultation from outside India",
  "/privacy-policy": "understanding Oruma's privacy practices",
  "/refund-policy": "understanding a refund request or policy step",
  "/cancellation-policy": "understanding a cancellation or rescheduling step",
  "/service-delivery-policy": "understanding booking confirmation or session delivery",
  "/terms": "understanding Oruma's terms and responsibilities",
  "/services": "choosing an Oruma counselling service",
  "/services/individual-therapy": "individual counselling",
  "/services/couple-therapy": "couple and relationship counselling",
  "/services/parenting-support": "parenting and caregiver support",
  "/services/child-teen-counselling": "counselling for a child or teenager",
  "/services/family-counselling": "family counselling",
  "/services/postpartum-support": "postpartum support",
  "/services/sexual-wellness": "sexual wellness counselling",
  "/services/follow-up": "an existing counselling follow-up booking",
  "/programs": "Oruma courses, workshops, or webinars",
  "/programs/courses": "Oruma courses",
  "/programs/workshops": "Oruma offline workshops",
  "/programs/webinars": "Oruma webinars and events",
  "/resources": "Oruma resources and information",
  "/careers": "applying as an Oruma practitioner",
  "/contact": "a service, booking, payment, cancellation, or refund question",
};

export function createPageSupportEmailUrl(pathname: string, request: string) {
  const pageTopic =
    supportEmailPageTopics[pathname] ??
    (pathname.startsWith("/therapists/")
      ? "reviewing a specific practitioner profile"
      : "an Oruma counselling or wellness service");
  return createSupportEmailUrl(
    [
      `Hello Oruma, I am viewing the page about ${pageTopic}.`,
      `I would like help with ${request}.`,
      "Please reply to this email with the relevant next step and any information needed to help.",
    ].join("\n"),
    `Enquiry about ${pageTopic}`,
  );
}

if (businessConfigWarnings.length > 0) {
  console.warn(`[business-config] ${businessConfigWarnings.join(" ")}`);
}
