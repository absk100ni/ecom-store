// Business & legal configuration — India E-Commerce Rules 2020 compliant.
// All values from env with sensible placeholder defaults.

const env = import.meta.env;

export const BUSINESS = {
  legalName: env.VITE_BUSINESS_LEGAL_NAME || 'LucubraElec India Private Limited',
  address: env.VITE_BUSINESS_ADDRESS || '123 MG Road, Bengaluru, Karnataka 560001, India',
  supportEmail: env.VITE_SUPPORT_EMAIL || 'support@lucubraelec.in',
  supportPhone: env.VITE_SUPPORT_PHONE || '+91-9876543210',
  gstin: env.VITE_BUSINESS_GSTIN || '29ABCDE1234F1Z5',
  grievanceOfficer: {
    name: env.VITE_GRIEVANCE_OFFICER_NAME || 'Grievance Officer',
    email: env.VITE_GRIEVANCE_OFFICER_EMAIL || 'grievance@lucubraelec.in',
    phone: env.VITE_GRIEVANCE_OFFICER_PHONE || '+91-9876543211',
  },
  returnWindowDays: Number(env.VITE_RETURN_WINDOW_DAYS) || 7,
} as const;
