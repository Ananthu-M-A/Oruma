import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

export type BusinessConfig = {
  brandName: string;
  website: string;
  operatorLegalName: string;
  businessStructure: string;
  serviceDescription: string;
  address: {
    lines: string[];
    addressLocality: string;
    addressDistrict: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  supportPhone: {
    display: string;
    e164: string;
  };
  whatsappPhone: { display: string; digits: string };
  emails: {
    support: string;
    refund: string;
    cancellation: string;
    privacy: string;
  };
  gstin: string | null;
};

const candidates = [
  resolve(process.cwd(), 'config/business.json'),
  resolve(process.cwd(), '../config/business.json'),
  resolve(__dirname, '../../../config/business.json'),
];

function loadBusinessConfig(): BusinessConfig {
  const configPath = candidates.find(existsSync);
  if (!configPath) {
    const message =
      'config/business.json was not found. Identity-dependent features must not be published until it is restored.';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[business-config] ${message}`);
    }
    console.warn(`[business-config] ${message}`);
    return {
      brandName: 'Oruma',
      website: '',
      operatorLegalName: '',
      businessStructure: '',
      serviceDescription: '',
      address: {
        lines: [],
        addressLocality: '',
        addressDistrict: '',
        addressRegion: '',
        postalCode: '',
        addressCountry: 'IN',
      },
      supportPhone: {
        display: '',
        e164: '',
      },
      whatsappPhone: { display: '', digits: '' },
      emails: { support: '', refund: '', cancellation: '', privacy: '' },
      gstin: null,
    };
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8')) as BusinessConfig;
  const warnings = validateBusinessConfig(config);
  if (warnings.length) {
    const message = `[business-config] ${warnings.join(' ')}`;
    if (process.env.NODE_ENV === 'production') throw new Error(message);
    console.warn(message);
  }
  return config;
}

export function validateBusinessConfig(config: BusinessConfig) {
  const required: Array<[string, string | number]> = [
    ['brand name', config.brandName],
    ['website', config.website],
    ['operator legal name', config.operatorLegalName],
    ['business structure', config.businessStructure],
    ['operating address', config.address.lines?.length],
    ['PIN code', config.address.postalCode],
    ['support phone', config.supportPhone.e164],
    ['support WhatsApp', config.whatsappPhone.digits],
    ['support email', config.emails.support],
    ['refund email', config.emails.refund],
    ['cancellation email', config.emails.cancellation],
    ['privacy email', config.emails.privacy],
  ];
  const placeholder =
    /\[(?:required|verification required)\]|placeholder|example\.(?:com|org)/i;
  const warnings = required
    .filter(([, value]) => !value || placeholder.test(String(value)))
    .map(([label]) => `Missing or placeholder ${label}.`);
  if (!/^\d{6}$/.test(config.address.postalCode || '')) {
    warnings.push('The operating address requires a six-digit PIN code.');
  }
  return warnings;
}

export const businessConfig = loadBusinessConfig();
export const businessAddress = businessConfig.address.lines.join(', ');
