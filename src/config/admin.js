export const SUPER_ADMIN_EMAILS = ['charly729.chiu@gmail.com'];

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const isSuperAdminEmail = (email) => {
  if (!email) {
    return false;
  }

  return SUPER_ADMIN_EMAILS.includes(normalizeEmail(email));
};
