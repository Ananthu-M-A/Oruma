// Content for the SEO service pages at /services/<slug>.
//
// This file must stay free of browser-only imports: vite.config.ts reads it at
// build time to prerender each page's metadata and generate the sitemap.
//
// OWNER APPROVAL REQUIRED: this text is a developer draft. The owners must
// approve every page before it is deployed to production. Keep claims general,
// avoid cure or success-rate statements, and never imply a regulated
// professional role that the practitioner's verified profile doesn't support.

export type SeoServiceFaq = { question: string; answer: string };

export type SeoServiceSection = { heading: string; paragraphs: string[] };

export type SeoService = {
  slug: string;
  path: string;
  /** Short name for menus and related-service links. */
  navLabel: string;
  /** Page H1. */
  title: string;
  eyebrow: string;
  seoTitle: string;
  seoDescription: string;
  icon: string;
  heroImage: string;
  heroImageAlt: string;
  introduction: string[];
  /** Areas of practice used to match practitioner profiles. */
  specialtyAreas: string[];
  whoFor: string[];
  topics: string[];
  sections: SeoServiceSection[];
  faqs: SeoServiceFaq[];
  related: string[];
  note: string;
  /** Topic used in the pre-filled email and WhatsApp messages. */
  enquiryTopic: string;
  areaServed: "India" | "Worldwide";
  /**
   * false keeps the page out of the sitemap, menus and search results
   * (noindex) until the owners confirm it can go live.
   */
  published: boolean;
};

export const onlineSessionSteps = [
  "Review a verified practitioner's role, qualifications, languages, fee and next available slot.",
  "Choose a time, read the booking policies and pay securely online through Razorpay.",
  "The care team confirms the booking and shares a private video session link in your dashboard.",
  "Join from a quiet, private space on your phone or computer at the booked time.",
];

const services: SeoService[] = [
  {
    slug: "relationship-counselling",
    path: "/services/relationship-counselling",
    navLabel: "Relationship Counselling",
    title: "Relationship Counselling",
    eyebrow: "Online relationship counselling",
    seoTitle: "Relationship Counselling Online | Oruma",
    seoDescription:
      "Confidential online relationship counselling for communication, conflict, trust and emotional distance. Book a verified Oruma practitioner from home.",
    icon: "heart-handshake",
    heroImage: "/assets/relationship-healing-connection-v2.webp",
    heroImageAlt: "Two partners sitting close together and comforting each other",
    introduction: [
      "Every relationship goes through difficult seasons. Arguments repeat, conversations become tense, or partners start to feel distant even while living under the same roof. Relationship counselling offers a structured, confidential space to slow these patterns down and understand what is happening between you.",
      "You can attend on your own or together with a partner. Sessions focus on how you communicate, what each person needs, and which small, practical changes could help. Oruma sessions take place online, so you can join from home in a private setting.",
    ],
    specialtyAreas: ["Relationship Issues", "Couple Therapy"],
    whoFor: [
      "Couples who argue about the same issues again and again",
      "Partners who feel emotionally distant or unheard",
      "Individuals who want to understand their own relationship patterns",
      "People navigating family pressure or cultural expectations",
      "Partners adjusting to a move, a new baby or a career change",
    ],
    topics: [
      "Communication breakdown",
      "Frequent conflict and arguments",
      "Emotional distance",
      "Jealousy and insecurity",
      "Boundaries with family and in-laws",
      "Decisions about the future of the relationship",
    ],
    sections: [
      {
        heading: "What relationship counselling involves",
        paragraphs: [
          "In early sessions, the practitioner listens to each person's view of the relationship, what is working and what feels stuck. Together you agree on goals, such as arguing less destructively, sharing feelings more openly, or making a joint decision.",
          "Later sessions may involve practising new ways of listening and responding, noticing the triggers behind recurring conflict, and building small routines of connection. The practitioner stays neutral and does not take sides.",
        ],
      },
      {
        heading: "Attending alone or as a couple",
        paragraphs: [
          "Both partners don't have to attend. Individual relationship counselling can help you understand your own reactions, set boundaries and decide what you want. If your partner joins later, the practitioner will explain how individual and joint sessions fit together.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I attend relationship counselling without my partner?",
        answer:
          "Yes. Many people start on their own. Sessions can focus on your own patterns, needs and choices, and a partner can join later if you both agree.",
      },
      {
        question: "How many sessions will we need?",
        answer:
          "It depends on your goals and circumstances. Your practitioner will discuss a suggested plan after the first session, and you can review progress together at any time.",
      },
      {
        question: "Will the counsellor tell us whether to stay together?",
        answer:
          "No. The practitioner helps you understand the relationship and communicate clearly, but decisions about the relationship remain yours.",
      },
      {
        question: "Are sessions confidential?",
        answer:
          "Sessions are private and handled as described in the Oruma Privacy Policy. Your practitioner will explain the limits of confidentiality, such as situations involving serious risk of harm.",
      },
      {
        question: "Which languages are sessions available in?",
        answer:
          "Each practitioner's profile lists the languages they offer, such as English and Malayalam. Check the profile before booking.",
      },
    ],
    related: [
      "/services/couple-therapy",
      "/services/marriage-counselling",
      "/services/trust-healing",
    ],
    note: "Relationship counselling isn't suitable where there is ongoing violence or a risk to anyone's safety. If you feel unsafe, contact local emergency services or a domestic-violence helpline first.",
    enquiryTopic: "relationship counselling",
    areaServed: "India",
    published: true,
  },
  {
    slug: "marriage-counselling",
    path: "/services/marriage-counselling",
    navLabel: "Marriage Counselling",
    title: "Marriage Counselling",
    eyebrow: "Online marriage counselling",
    seoTitle: "Marriage Counselling Online | Oruma",
    seoDescription:
      "Online marriage counselling for married couples facing conflict, distance, family pressure or major change. Private video sessions with verified practitioners.",
    icon: "heart",
    heroImage: "/assets/couple-therapy-new-hero-image.webp",
    heroImageAlt: "A married couple talking together during a counselling session",
    introduction: [
      "Marriage brings together two people, and often two families, with their own histories and expectations. Over time, responsibilities, children, finances and family relationships can put strain on even a strong marriage.",
      "Marriage counselling gives both spouses a structured space to talk honestly, understand each other's perspective and decide on practical next steps. Sessions with Oruma take place online, which makes it easier to attend together, even on busy days.",
    ],
    specialtyAreas: ["Marriage Counselling", "Couple Therapy", "Relationship Issues"],
    whoFor: [
      "Married couples experiencing frequent conflict",
      "Spouses who feel like roommates rather than partners",
      "Couples facing pressure from extended family",
      "Couples adjusting to parenthood or caring responsibilities",
      "Spouses considering separation who want clarity first",
    ],
    topics: [
      "Communication and conflict",
      "Roles, responsibilities and fairness",
      "Extended family and in-law relationships",
      "Financial disagreements",
      "Intimacy and emotional connection",
      "Parenting differences",
    ],
    sections: [
      {
        heading: "How marriage counselling works",
        paragraphs: [
          "The first session usually explores the history of the marriage, the main concerns and what each spouse hopes will change. The practitioner then helps you agree on shared goals.",
          "Over the following sessions, you work on specific patterns, such as how disagreements start and escalate, how decisions are made, and how each person can feel heard. You may be given small exercises to try between sessions.",
        ],
      },
      {
        heading: "Family and cultural context",
        paragraphs: [
          "In many Indian families, a marriage is closely connected to parents, in-laws and community expectations. Practitioners can help you discuss these influences respectfully and agree on boundaries that suit your marriage.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do both spouses need to attend?",
        answer:
          "Joint sessions are usually the most helpful for marriage counselling, but you can begin individually if your spouse isn't ready. The practitioner will explain the options.",
      },
      {
        question: "Can we attend from different locations?",
        answer:
          "Yes. Online sessions allow each spouse to join from a separate device if needed, as long as both have a private space.",
      },
      {
        question: "Is marriage counselling only for couples in crisis?",
        answer:
          "No. Some couples attend to strengthen communication before problems grow, or to prepare for a big change such as a move or a new baby.",
      },
      {
        question: "Will the practitioner take sides?",
        answer:
          "No. The practitioner's role is to stay balanced and help both spouses understand each other.",
      },
      {
        question: "What does a session cost?",
        answer:
          "Fees are set per practitioner and shown on each profile before you book, including any couple session fee.",
      },
    ],
    related: [
      "/services/premarital-counselling",
      "/services/relationship-counselling",
      "/services/trust-healing",
    ],
    note: "Marriage counselling isn't a substitute for legal advice or emergency support. If there is violence or a risk to safety in the home, please contact local emergency services first.",
    enquiryTopic: "marriage counselling",
    areaServed: "India",
    published: true,
  },
  {
    slug: "trust-healing",
    path: "/services/trust-healing",
    navLabel: "Trust Healing",
    title: "Trust Healing Counselling",
    eyebrow: "Rebuilding trust after betrayal",
    seoTitle: "Trust Healing & Infidelity Counselling | Oruma",
    seoDescription:
      "Online counselling to help rebuild trust after infidelity, secrecy or broken promises. Work through hurt, honesty and next steps with a verified practitioner.",
    icon: "shield-check",
    heroImage: "/assets/relationship-healing-connection-v2.webp",
    heroImageAlt: "A couple holding hands as they begin to rebuild trust",
    introduction: [
      "Discovering an affair, hidden messages, financial secrecy or repeated broken promises can shake the foundation of a relationship. Hurt, anger, confusion and self-doubt are common, both for the person who was hurt and for the person who broke the trust.",
      "Trust healing counselling offers a structured space to understand what happened, express the impact honestly, and decide whether and how to rebuild. You can attend individually or as a couple.",
    ],
    specialtyAreas: [
      "Trust & Infidelity Recovery",
      "Relationship Issues",
      "Couple Therapy",
    ],
    whoFor: [
      "Couples recovering after infidelity or an emotional affair",
      "Partners affected by secrecy, lies or hidden debts",
      "Individuals struggling to trust again after a past betrayal",
      "Partners who want to make amends and rebuild",
      "People deciding whether to stay in a relationship after betrayal",
    ],
    topics: [
      "Shock, anger and grief after discovery",
      "Honesty and transparency",
      "Intrusive thoughts and constant checking",
      "Taking responsibility and making amends",
      "Rebuilding emotional and physical closeness",
      "Deciding the future of the relationship",
    ],
    sections: [
      {
        heading: "How trust can be rebuilt",
        paragraphs: [
          "Rebuilding trust is usually gradual. Early sessions focus on stabilising things: creating safe ways to talk about what happened without conversations turning into repeated fights.",
          "Later, the practitioner helps both partners understand the circumstances that contributed to the breach, agree on what transparency looks like, and rebuild connection step by step. The aim isn't to excuse what happened, but to make an informed decision about the future.",
        ],
      },
      {
        heading: "If you are healing on your own",
        paragraphs: [
          "Sometimes a partner won't attend, or the relationship has ended. Individual sessions can help you process the betrayal, rebuild self-worth and approach future relationships with more confidence.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can a relationship recover after infidelity?",
        answer:
          "Some couples do rebuild trust, and others decide to separate. Counselling helps you understand what happened and make a considered decision, without pressure towards either outcome.",
      },
      {
        question: "Can the partner who broke trust attend alone?",
        answer:
          "Yes. Individual sessions can help them understand their choices, take responsibility and prepare for honest conversations.",
      },
      {
        question: "How long does trust healing take?",
        answer:
          "There is no fixed timeline. It depends on the situation and on both partners' commitment. Your practitioner will review progress with you regularly.",
      },
      {
        question: "Will what I share be kept private from my partner?",
        answer:
          "Your practitioner will explain how information shared in individual and joint sessions is handled before you begin.",
      },
    ],
    related: [
      "/services/relationship-counselling",
      "/services/marriage-counselling",
      "/services/breakup-recovery",
    ],
    note: "If betrayal has led to threats, violence or thoughts of harming yourself or someone else, please contact local emergency services or a crisis helpline straight away.",
    enquiryTopic: "trust healing counselling",
    areaServed: "India",
    published: true,
  },
  {
    slug: "breakup-recovery",
    path: "/services/breakup-recovery",
    navLabel: "Breakup Recovery",
    title: "Breakup Recovery Counselling",
    eyebrow: "Support after a relationship ends",
    seoTitle: "Breakup Recovery Counselling Online | Oruma",
    seoDescription:
      "Online breakup recovery counselling to process grief, loneliness and self-doubt after a relationship ends. Private sessions with verified practitioners.",
    icon: "sparkles",
    heroImage: "/assets/breakup-healing-hero.webp",
    heroImageAlt: "A person sitting quietly and reflecting after a breakup",
    introduction: [
      "The end of a relationship can feel like a loss in every part of life: routines, friendships, plans for the future and even your sense of who you are. Sadness, anger, numbness and repeated thoughts about what went wrong are all common responses.",
      "Breakup recovery counselling gives you a private space to make sense of what happened, cope with difficult days and gradually rebuild confidence. Sessions take place online, so you can talk from wherever you feel most comfortable.",
    ],
    specialtyAreas: ["Breakup Recovery", "Relationship Issues", "Grief & Loss"],
    whoFor: [
      "People struggling after a breakup, separation or divorce",
      "Anyone finding it hard to stop thinking about an ex-partner",
      "People who feel their confidence or self-worth has dropped",
      "Those coping with a broken engagement or family disapproval",
      "Anyone wanting to understand recurring relationship patterns",
    ],
    topics: [
      "Grief, sadness and loneliness",
      "Rumination and overthinking",
      "Contact and boundaries with an ex-partner",
      "Self-esteem and identity",
      "Sleep, focus and daily routines",
      "Readiness for future relationships",
    ],
    sections: [
      {
        heading: "What breakup counselling can help with",
        paragraphs: [
          "Sessions can help you understand your feelings, manage difficult moments such as anniversaries or seeing an ex-partner online, and set healthy boundaries.",
          "As things settle, the focus can move towards reflection: what you learned about yourself, which patterns you want to change, and what you want from future relationships.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is it normal to still feel this way months later?",
        answer:
          "Yes. Recovery after a breakup doesn't follow a fixed timeline. If feelings are affecting your sleep, work or daily life, talking to a practitioner can help.",
      },
      {
        question: "Can counselling help us get back together?",
        answer:
          "Breakup recovery focuses on your wellbeing. If both people want to explore reconciliation, relationship counselling may be more suitable.",
      },
      {
        question: "How soon after a breakup should I seek support?",
        answer:
          "Whenever you feel it would help. Some people seek support immediately, others months later.",
      },
      {
        question: "What happens in the first session?",
        answer:
          "The practitioner will ask about what happened, how you are coping and what you hope to get from sessions, then suggest a plan.",
      },
    ],
    related: [
      "/services/trust-healing",
      "/services/relationship-counselling",
      "/services/individual-therapy",
    ],
    note: "If you are having thoughts of harming yourself, please contact local emergency services or a crisis helpline immediately. Online counselling is not an emergency service.",
    enquiryTopic: "breakup recovery counselling",
    areaServed: "India",
    published: true,
  },
  {
    slug: "clinical-hypnotherapy",
    path: "/services/clinical-hypnotherapy",
    navLabel: "Clinical Hypnotherapy",
    title: "Clinical Hypnotherapy",
    eyebrow: "Guided relaxation and focused attention",
    seoTitle: "Clinical Hypnotherapy Online | Oruma",
    seoDescription:
      "Learn about online clinical hypnotherapy at Oruma: guided relaxation and focused attention with a practitioner whose hypnotherapy training has been verified.",
    icon: "brain",
    heroImage: "/assets/anxiety-slow-down-healing.webp",
    heroImageAlt: "A person resting calmly with eyes closed in a quiet room",
    introduction: [
      "Clinical hypnotherapy uses guided relaxation and focused attention to help a person explore thoughts, feelings and habits. During a session, you remain aware and in control, and you can stop at any time.",
      "At Oruma, hypnotherapy is offered only by practitioners whose hypnotherapy training has been reviewed and verified. It is used alongside, not instead of, counselling and appropriate medical care.",
    ],
    specialtyAreas: ["Clinical Hypnotherapy"],
    whoFor: [
      "Adults who want help with relaxation and stress",
      "People working on unhelpful habits",
      "Those who feel stuck with recurring thoughts or worries",
      "Clients already in counselling who want an additional approach",
    ],
    topics: [
      "Stress and tension",
      "Sleep routines",
      "Confidence and performance worries",
      "Habit change",
      "Relaxation skills",
    ],
    sections: [
      {
        heading: "What happens in a session",
        paragraphs: [
          "The practitioner first discusses your goals, health history and any concerns, and checks whether hypnotherapy is suitable for you. If it is, they guide you into a relaxed, focused state using calm verbal instructions.",
          "You remain aware throughout. Afterwards, the practitioner talks with you about the experience and any practical steps to try before the next session.",
        ],
      },
      {
        heading: "When hypnotherapy isn't suitable",
        paragraphs: [
          "Hypnotherapy may not be appropriate for people with certain mental health conditions, such as psychosis, or during a crisis. The practitioner will discuss this before any session begins.",
        ],
      },
    ],
    faqs: [
      {
        question: "Will I lose control during hypnosis?",
        answer:
          "No. You remain aware and can end the session or speak at any time.",
      },
      {
        question: "Can hypnotherapy be done online?",
        answer:
          "Yes, provided you can join from a quiet, private and comfortable space where you won't be disturbed.",
      },
      {
        question: "Does hypnotherapy replace medical treatment?",
        answer:
          "No. It does not replace diagnosis or treatment by a doctor or psychiatrist. Continue any prescribed treatment unless your doctor advises otherwise.",
      },
    ],
    related: [
      "/services/individual-therapy",
      "/services/relationship-counselling",
      "/services/breakup-recovery",
    ],
    note: "Hypnotherapy is offered only after a suitability discussion with a practitioner whose hypnotherapy training has been verified by Oruma. It isn't an emergency or medical service.",
    enquiryTopic: "clinical hypnotherapy",
    areaServed: "India",
    // Keep unpublished until a practitioner with verified hypnotherapy
    // training is live on the site (owner decision A2-6).
    published: false,
  },
  {
    slug: "premarital-counselling",
    path: "/services/premarital-counselling",
    navLabel: "Premarital Counselling",
    title: "Premarital Counselling",
    eyebrow: "Preparing for marriage together",
    seoTitle: "Premarital Counselling Online | Oruma",
    seoDescription:
      "Online premarital counselling for engaged and soon-to-be-married couples. Discuss expectations, family, finances and communication before the wedding.",
    icon: "calendar-check",
    heroImage: "/assets/couple-therapy-new-hero-image.webp",
    heroImageAlt: "An engaged couple talking together about their future",
    introduction: [
      "Wedding preparations often leave little time to talk about the marriage itself. Premarital counselling gives engaged couples a calm, structured space to discuss expectations, values and practical plans before they marry.",
      "It isn't only for couples with problems. Many couples find it helpful to understand each other's families, communication styles and hopes for the future. Online sessions suit couples who live or work in different cities.",
    ],
    specialtyAreas: ["Premarital Counselling", "Couple Therapy", "Relationship Issues"],
    whoFor: [
      "Engaged couples, in arranged or love marriages",
      "Couples who want to talk through expectations before the wedding",
      "Couples from different religious, cultural or family backgrounds",
      "Partners in a long-distance engagement",
      "Couples planning a second marriage or blended family",
    ],
    topics: [
      "Expectations of married life",
      "Roles, careers and household responsibilities",
      "Finances and spending",
      "Relationships with parents and in-laws",
      "Plans for children",
      "Handling disagreements",
    ],
    sections: [
      {
        heading: "What premarital counselling covers",
        paragraphs: [
          "A typical series of sessions covers the topics couples most often disagree about after marriage: money, family, careers, children and household responsibilities. The practitioner helps you talk through each one openly.",
          "You also practise communication skills you can use for years to come, such as expressing needs clearly, listening without interrupting and finding compromises.",
        ],
      },
      {
        heading: "For arranged marriages",
        paragraphs: [
          "When couples have known each other for a short time, premarital sessions can be a respectful way to get to know each other's values and expectations in more depth.",
        ],
      },
    ],
    faqs: [
      {
        question: "When should we start premarital counselling?",
        answer:
          "Ideally a few months before the wedding, so you have time for several sessions without the pressure of final preparations.",
      },
      {
        question: "How many sessions do couples usually attend?",
        answer:
          "Many couples attend a short series of sessions. Your practitioner will suggest a plan based on what you want to discuss.",
      },
      {
        question: "Can we attend from different cities or countries?",
        answer:
          "Yes. Each partner can join the online session from their own device.",
      },
      {
        question: "Does attending mean something is wrong?",
        answer:
          "Not at all. Premarital counselling is a positive step that helps couples start marriage with a shared understanding.",
      },
    ],
    related: [
      "/services/marriage-counselling",
      "/services/relationship-counselling",
      "/services/couple-therapy",
    ],
    note: "Premarital counselling is educational and supportive. It doesn't replace legal, financial or medical advice.",
    enquiryTopic: "premarital counselling",
    areaServed: "India",
    published: true,
  },
  {
    slug: "nri-online-counselling",
    path: "/services/nri-online-counselling",
    navLabel: "NRI Online Counselling",
    title: "Online Counselling for NRIs",
    eyebrow: "Support from home, wherever you live",
    seoTitle: "Online Counselling for NRIs | Oruma",
    seoDescription:
      "Online counselling for NRIs and Indians living abroad, in English, Malayalam and other languages. Book private video sessions with verified practitioners.",
    icon: "globe",
    heroImage: "/assets/home-lady-striped-shirt-v2.webp",
    heroImageAlt: "A woman abroad joining an online counselling session from home",
    introduction: [
      "Living away from India can bring opportunities, but also loneliness, cultural adjustment, work pressure and the strain of being far from family. Many NRIs find it easier to talk to someone who understands their language and cultural background.",
      "Oruma offers online counselling that you can join from anywhere in the world. Practitioners list the languages they speak, so you can choose a session in English, Malayalam or another language you are comfortable with.",
    ],
    specialtyAreas: [
      "NRI Counselling",
      "Relationship Issues",
      "Stress & Burnout",
      "Emotional Wellbeing",
    ],
    whoFor: [
      "NRIs and Indians working or studying abroad",
      "Gulf-based professionals and their families",
      "Couples in long-distance marriages across countries",
      "Students adjusting to life in a new country",
      "Families supporting relatives in India from abroad",
    ],
    topics: [
      "Loneliness and homesickness",
      "Cultural adjustment",
      "Work stress and burnout",
      "Long-distance relationships and marriages",
      "Family responsibilities and pressure from home",
      "Returning to India",
    ],
    sections: [
      {
        heading: "Booking from outside India",
        paragraphs: [
          "Session times on Oruma are shown in Indian Standard Time (IST). Before booking, convert the time to your local time zone. For example, 7:00 pm IST is 5:30 pm in the UAE and 1:30 pm in the UK during winter.",
          "Fees are charged in Indian rupees (INR) through Razorpay. Please check that your payment method supports payments in INR before booking. If you have difficulty paying from abroad, email us and we will help.",
        ],
      },
      {
        heading: "Talking in your own language",
        paragraphs: [
          "Expressing difficult feelings is often easier in your first language. Each practitioner's profile lists the languages they offer, so you can choose someone who understands both your language and your cultural context.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I book from outside India?",
        answer:
          "Yes. Sessions are online, so you can join from any country with a stable internet connection.",
      },
      {
        question: "Which time zone are session times shown in?",
        answer:
          "Indian Standard Time (IST). Please convert the time to your local time before booking.",
      },
      {
        question: "How do I pay from abroad?",
        answer:
          "Payments are made in INR through Razorpay. Some international cards are supported, depending on the card and its issuing bank. Contact us if a payment doesn't go through.",
      },
      {
        question: "Can my spouse in India join the same session?",
        answer:
          "Yes. For couple sessions, each partner can join the video session from their own device and location.",
      },
    ],
    related: [
      "/services/relationship-counselling",
      "/services/marriage-counselling",
      "/services/individual-therapy",
    ],
    note: "Oruma isn't an emergency service. If you are in crisis, please contact the emergency services in the country where you are.",
    enquiryTopic: "online counselling from outside India",
    areaServed: "Worldwide",
    published: true,
  },
];

export const seoServices: readonly SeoService[] = services;

export const publishedSeoServices = services.filter(
  (service) => service.published,
);

export function findSeoService(slug: string) {
  return services.find((service) => service.slug === slug);
}

/** Labels for related-service links, including existing non-template pages. */
export const serviceLinkLabels: Record<string, string> = {
  "/services/couple-therapy": "Couple Therapy",
  "/services/individual-therapy": "Individual Therapy",
  ...Object.fromEntries(services.map((service) => [service.path, service.navLabel])),
};
