const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env');
const fileEnv = fs.existsSync(envPath)
  ? fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .reduce((values, line) => {
        const separator = line.indexOf('=');
        if (separator === -1) return values;

        const key = line.slice(0, separator).trim();
        const rawValue = line.slice(separator + 1).trim();
        values[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
        return values;
      }, {})
  : {};
const env = { ...fileEnv, ...process.env };

const publish = process.argv.includes('--publish');
const checkOnly = process.argv.includes('--check');
const slotDate = env.THERAPIST_SEED_SLOT_DATE || '2026-05-11';
const SEED_PLACEHOLDER = 'SEED_ONLY:';

const toSlot = (time) => {
  if (!time) return null;

  return new Date(`${slotDate} ${time} GMT+0530`);
};

const requiresProfessionalRegistration = (title) =>
  /\b(clinical psychologist|psychiatrist|doctor|licensed psychologist|medical practitioner|registered healthcare professional)\b/i.test(
    title,
  );

const placeholder = (field, name) =>
  `${SEED_PLACEHOLDER} replace ${field} for ${name} with verified data`;

/**
 * The previous UI stored completed-practice hours in `experience`. The current
 * schema uses `experience` for years and `verifiedExperienceHours` for hours.
 * Years and regulated-profile facts cannot be inferred safely, so they remain
 * visibly marked for administrator review.
 */
const withMandatoryProfile = (therapist) => {
  const registrationRequired = requiresProfessionalRegistration(
    therapist.title,
  );

  return {
    experience: 0,
    qualifications: placeholder('qualification', therapist.name),
    awardingInstitution: placeholder('awarding institution', therapist.name),
    areasOfPractice: [placeholder('areas of practice', therapist.name)],
    languages: [placeholder('languages', therapist.name)],
    professionalRegistrationNumber: registrationRequired
      ? placeholder('professional registration number', therapist.name)
      : null,
    registrationAuthority: registrationRequired
      ? placeholder('registration authority', therapist.name)
      : null,
    consultationType: 'Video or voice call',
    sessionDurationMinutes: 60,
    engagementRelationship: placeholder(
      'engagement relationship',
      therapist.name,
    ),
    ...therapist,
  };
};

const therapists = [
  withMandatoryProfile({
    name: 'Hamna',
    title: 'Clinical Psychologist',
    verifiedExperienceHours: 800,
    group: 2,
    tags: ['Clinical Psychologist', 'Expert Support', 'Mental Wellness'],
    price: 2000,
    couplePrice: 3000,
    nextAvailableSlot: toSlot('12:00 PM'),
    image: '/assets/hamna-profile.webp',
    specialization: 'Clinical Psychology',
    bio: 'Empathetic Support & Clinical Excellence',
  }),
  withMandatoryProfile({
    name: 'Kallu Sajeev',
    title: 'Clinical Psychologist',
    verifiedExperienceHours: 1500,
    group: 2,
    tags: ['Clinical Psychologist', 'Individual & Couple', 'Expert'],
    price: 2000,
    couplePrice: 3000,
    nextAvailableSlot: toSlot('10:00 AM'),
    image: '/assets/kallu-sajeev-psychologist-new.webp',
    specialization: 'Clinical Psychology',
    bio: 'Evidence-Based & Compassionate Care',
  }),
  withMandatoryProfile({
    name: 'Shabna',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 0,
    group: 3,
    tags: ['Consultant', 'Individual & Couple', 'Support'],
    price: 1500,
    couplePrice: 1500,
    nextAvailableSlot: toSlot('10:00 AM'),
    image: '/assets/shabna-profile-new.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Empathetic Counseling & Support',
  }),
  withMandatoryProfile({
    name: 'Shihana',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 850,
    group: 5,
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    price: 1500,
    couplePrice: 1500,
    nextAvailableSlot: toSlot('11:00 AM'),
    image: '/assets/shihana-profile-updated.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Empathetic Counseling & Support',
  }),
  withMandatoryProfile({
    name: 'Shaeza Mariyem',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 820,
    group: 5,
    tags: ['Consultant', 'Individual & Couple', 'Expert Counseling'],
    price: 2000,
    couplePrice: 2250,
    nextAvailableSlot: toSlot('10:30 AM'),
    image: '/assets/shaeza-mariyam-profile.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Healing Through Compassionate Connection',
  }),
  withMandatoryProfile({
    name: 'Aleeda',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 780,
    group: 5,
    tags: ['Consultant', 'Individual & Couple', 'Professional Guidance'],
    price: 2000,
    couplePrice: 2250,
    nextAvailableSlot: toSlot('1:00 PM'),
    image: '/assets/therapist-aleeda.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Empathetic Therapeutic Care',
  }),
  withMandatoryProfile({
    name: 'Rifana',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 800,
    group: 4,
    tags: ['Consultant', 'Individual & Couple', 'Empathy'],
    price: 1500,
    couplePrice: 1500,
    nextAvailableSlot: toSlot('12:00 PM'),
    image: '/assets/rifana-new-profile-2024.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Empathetic & Evidence-Based Support',
  }),
  withMandatoryProfile({
    name: 'Pavithra',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 820,
    group: 4,
    tags: ['Consultant', 'Individual & Couple', 'Skilled Counseling'],
    price: 1500,
    couplePrice: 1500,
    nextAvailableSlot: toSlot('2:30 PM'),
    image: '/assets/therapist-pavithra.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Guided Resilience & Well-being',
  }),
  withMandatoryProfile({
    name: 'Jasna',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 790,
    group: 4,
    tags: ['Consultant', 'Individual & Couple', 'Dedicated Support'],
    price: 1500,
    couplePrice: 1500,
    nextAvailableSlot: toSlot('4:30 PM'),
    image: '/assets/therapist-jasna.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Deep Emotional Healing',
  }),
  withMandatoryProfile({
    name: 'Dr. Ashi Chandran',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 1000,
    group: 3,
    tags: ['Consultant', 'Individual & Couple', 'Counseling'],
    price: 1000,
    couplePrice: 1500,
    nextAvailableSlot: toSlot('10:00 AM'),
    image: '/assets/dr-ashi-chandran.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Comprehensive Psychological Support',
  }),
  withMandatoryProfile({
    name: 'Anila',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 900,
    group: 3,
    tags: ['Consultant', 'Individual & Couple', 'Holistic Mental Wellness'],
    price: 1000,
    couplePrice: 1500,
    nextAvailableSlot: null,
    image: '/assets/anila.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Holistic Mental Wellness',
  }),
  withMandatoryProfile({
    name: 'Nivya',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 1100,
    group: 3,
    tags: ['Consultant', 'Individual & Couple', 'Guided Healing'],
    price: 1000,
    couplePrice: 1500,
    nextAvailableSlot: null,
    image: '/assets/nivya.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Guided Healing & Resilience',
  }),
  withMandatoryProfile({
    name: 'Rubeena',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 850,
    group: 3,
    tags: ['Consultant', 'Individual & Couple', 'Growth'],
    price: 1000,
    couplePrice: 1500,
    nextAvailableSlot: null,
    image: '/assets/rubeena.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Empathetic Listening & Growth',
  }),
  withMandatoryProfile({
    name: 'Indulekha',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 950,
    group: 3,
    tags: ['Consultant', 'Individual & Couple', 'Balanced Support'],
    price: 1000,
    couplePrice: 1500,
    nextAvailableSlot: null,
    image: '/assets/indulekha.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Balanced Mental Health Support',
  }),
  withMandatoryProfile({
    name: 'Fathima Rincy',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 1000,
    group: 3,
    tags: ['Consultant', 'Individual & Couple', 'Compassionate Care'],
    price: 1000,
    couplePrice: 1500,
    nextAvailableSlot: null,
    image: '/assets/fathima-rincy.webp',
    specialization: 'Individual & Couple Therapy',
    bio: 'Compassionate Therapeutic Care',
  }),
  withMandatoryProfile({
    name: 'Sreemol P S',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 1000,
    group: 1,
    tags: [
      'Individual Only',
      'Consultant Psychologist',
      'Mental Health',
      'Wellness',
    ],
    price: 1000,
    couplePrice: null,
    nextAvailableSlot: toSlot('9:30 PM'),
    image: '/assets/sreemol-profile.webp',
    specialization: 'Individual Therapy',
    bio: 'Compassionate Support & Personal Well-being',
  }),
  withMandatoryProfile({
    name: 'Anusha',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 1000,
    group: 1,
    tags: [
      'Individual Only',
      'Consultant Psychologist',
      'Emotional Balance',
      'Healing',
    ],
    price: 1000,
    couplePrice: null,
    nextAvailableSlot: toSlot('1:30 PM'),
    image: '/assets/anusha-profile-photo.webp',
    specialization: 'Individual Therapy',
    bio: 'Therapy, Healing & Balance',
  }),
  withMandatoryProfile({
    name: 'Nisha',
    title: 'Consultant Psychologist',
    verifiedExperienceHours: 1000,
    group: 1,
    tags: [
      'Individual Only',
      'Consultant Psychologist',
      'Counseling',
      'Wellness',
    ],
    price: 1000,
    couplePrice: null,
    nextAvailableSlot: toSlot('11:30 AM'),
    image: '/assets/nisha-profile-new.webp',
    specialization: 'Individual Therapy',
    bio: 'Counseling & Mental Wellness',
  }),
];

const activeNames = new Set(
  therapists.map((therapist) => therapist.name.toLowerCase()),
);
const publicationFields = [
  'name',
  'title',
  'qualifications',
  'awardingInstitution',
  'areasOfPractice',
  'languages',
  'consultationType',
  'sessionDurationMinutes',
  'verifiedExperienceHours',
  'engagementRelationship',
  'price',
];

const hasValue = (value) =>
  Array.isArray(value)
    ? value.length > 0
    : value !== null && value !== undefined && value !== '';

const containsPlaceholder = (value) => {
  if (Array.isArray(value)) return value.some(containsPlaceholder);
  return typeof value === 'string' && value.startsWith(SEED_PLACEHOLDER);
};

const validateTherapists = () => {
  const errors = [];
  const seenNames = new Set();

  for (const therapist of therapists) {
    const normalizedName = therapist.name.trim().toLowerCase();
    if (seenNames.has(normalizedName)) {
      errors.push(`${therapist.name}: duplicate name`);
    }
    seenNames.add(normalizedName);

    const required = [...publicationFields];
    if (requiresProfessionalRegistration(therapist.title)) {
      required.push('professionalRegistrationNumber', 'registrationAuthority');
    }

    for (const field of required) {
      if (!hasValue(therapist[field])) {
        errors.push(`${therapist.name}: missing ${field}`);
      } else if (publish && containsPlaceholder(therapist[field])) {
        errors.push(`${therapist.name}: replace the placeholder in ${field}`);
      }
    }

    if (
      !Number.isInteger(therapist.experience) ||
      therapist.experience < 0 ||
      therapist.experience > 80
    ) {
      errors.push(
        `${therapist.name}: experience must be a whole number of years from 0 to 80`,
      );
    }
    if (
      !Number.isInteger(therapist.verifiedExperienceHours) ||
      therapist.verifiedExperienceHours < 0 ||
      (publish && therapist.verifiedExperienceHours === 0)
    ) {
      errors.push(
        `${therapist.name}: verifiedExperienceHours must be ${publish ? 'greater than 0' : '0 or greater'}`,
      );
    }
    if (
      !['Video', 'Voice call', 'Video or voice call'].includes(
        therapist.consultationType,
      )
    ) {
      errors.push(`${therapist.name}: unsupported consultationType`);
    }
    if (
      !Number.isInteger(therapist.sessionDurationMinutes) ||
      therapist.sessionDurationMinutes < 15 ||
      therapist.sessionDurationMinutes > 180
    ) {
      errors.push(
        `${therapist.name}: sessionDurationMinutes must be from 15 to 180`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Therapist seed validation failed:\n- ${errors.join('\n- ')}${
        publish
          ? '\n\nNothing was written. Replace the SEED_ONLY values with verified profile data, then run the --publish check again.'
          : ''
      }`,
    );
  }
};

const requiredColumns = [
  'id',
  'name',
  'title',
  'tags',
  'areasOfPractice',
  'languages',
  'experience',
  'group',
  'price',
  'couplePrice',
  'image',
  'qualifications',
  'awardingInstitution',
  'verifiedExperienceHours',
  'professionalRegistrationNumber',
  'registrationAuthority',
  'specialization',
  'consultationType',
  'sessionDurationMinutes',
  'engagementRelationship',
  'verificationStatus',
  'bio',
  'nextAvailableSlot',
  'isActive',
  'createdAt',
];

const assertSchemaIsCurrent = async (client) => {
  const result = await client.query(
    `select column_name from information_schema.columns where table_schema = current_schema() and table_name = 'therapist'`,
  );
  const columns = new Set(result.rows.map((row) => row.column_name));
  const missing = requiredColumns.filter((column) => !columns.has(column));

  if (missing.length > 0) {
    throw new Error(
      `The therapist table is missing columns: ${missing.join(', ')}. Run "npm run migration:run" first.`,
    );
  }
};

const upsertTherapist = async (client, therapist, existingByName) => {
  const existing = existingByName.get(therapist.name.toLowerCase());
  const verificationStatus = publish ? 'VERIFIED' : 'UNVERIFIED';

  const values = [
    therapist.name,
    therapist.title,
    therapist.tags,
    therapist.areasOfPractice,
    therapist.languages,
    therapist.experience,
    therapist.group,
    therapist.price,
    therapist.couplePrice,
    therapist.image,
    therapist.qualifications,
    therapist.awardingInstitution,
    therapist.verifiedExperienceHours,
    therapist.professionalRegistrationNumber,
    therapist.registrationAuthority,
    therapist.specialization,
    therapist.consultationType,
    therapist.sessionDurationMinutes,
    therapist.engagementRelationship,
    therapist.bio,
    therapist.nextAvailableSlot,
    verificationStatus,
    publish,
  ];

  if (existing) {
    await client.query(
      `
        update therapist
        set
          name = $2,
          title = $3,
          tags = $4,
          "areasOfPractice" = $5,
          languages = $6,
          experience = $7,
          "group" = $8,
          price = $9,
          "couplePrice" = $10,
          image = $11,
          qualifications = $12,
          "awardingInstitution" = $13,
          "verifiedExperienceHours" = $14,
          "professionalRegistrationNumber" = $15,
          "registrationAuthority" = $16,
          specialization = $17,
          "consultationType" = $18,
          "sessionDurationMinutes" = $19,
          "engagementRelationship" = $20,
          bio = $21,
          "nextAvailableSlot" = $22,
          "verificationStatus" = $23,
          "isActive" = $24
        where id = $1
      `,
      [existing.id, ...values],
    );

    return 'updated';
  }

  await client.query(
    `
      insert into therapist (
        id,
        name,
        title,
        tags,
        "areasOfPractice",
        languages,
        experience,
        "group",
        price,
        "couplePrice",
        image,
        qualifications,
        "awardingInstitution",
        "verifiedExperienceHours",
        "professionalRegistrationNumber",
        "registrationAuthority",
        specialization,
        "consultationType",
        "sessionDurationMinutes",
        "engagementRelationship",
        bio,
        "nextAvailableSlot",
        "verificationStatus",
        "isActive",
        "createdAt"
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, now()
      )
    `,
    [randomUUID(), ...values],
  );

  return 'inserted';
};

const getClientConfig = () => {
  if (env.DATABASE_URL) {
    const sslMode = new URL(env.DATABASE_URL).searchParams.get('sslmode');
    const useSsl =
      env.DATABASE_SSL === 'true' ||
      ['require', 'verify-ca', 'verify-full'].includes(sslMode) ||
      env.DATABASE_URL.includes('.neon.tech');

    return {
      connectionString: env.DATABASE_URL,
      ssl: useSsl
        ? {
            rejectUnauthorized:
              env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : undefined,
    };
  }

  return {
    host: env.DATABASE_HOST || 'localhost',
    port: Number(env.DATABASE_PORT || 5432),
    user: env.DATABASE_USER || 'postgres',
    password: env.DATABASE_PASSWORD || 'postgres',
    database: env.DATABASE_NAME || 'oruma',
    ssl:
      env.DATABASE_SSL === 'true'
        ? {
            rejectUnauthorized:
              env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : undefined,
  };
};

const main = async () => {
  validateTherapists();

  if (checkOnly) {
    console.log(
      `${therapists.length} therapist seed records are structurally valid${publish ? ' and ready to publish' : ''}.`,
    );
    return;
  }

  if (env.NODE_ENV === 'production' && !publish) {
    throw new Error(
      'Refusing to replace production profiles with unverified seed data. Fill the placeholders and run with --publish.',
    );
  }

  const client = new Client(getClientConfig());
  await client.connect();

  try {
    await assertSchemaIsCurrent(client);
    await client.query('begin');

    const existingRows = await client.query(
      'select id, lower(name) as name from therapist',
    );
    const existingByName = new Map(
      existingRows.rows.map((row) => [row.name, row]),
    );
    const result = { inserted: 0, updated: 0 };

    for (const therapist of therapists) {
      const action = await upsertTherapist(client, therapist, existingByName);
      result[action] += 1;
    }

    if (publish) {
      await client.query(
        'update therapist set "isActive" = false where lower(name) <> all($1)',
        [[...activeNames]],
      );
    }

    await client.query('commit');
    const total = await client.query(
      'select count(*) from therapist where "isActive" = true and "verificationStatus" = \'VERIFIED\'',
    );

    console.log(
      `Therapists synced: ${result.inserted} inserted, ${result.updated} updated, ${total.rows[0].count} published total.`,
    );
    if (!publish) {
      console.log(
        'Seeded as UNVERIFIED and inactive. Replace every SEED_ONLY value, then rerun with --publish.',
      );
    }
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
