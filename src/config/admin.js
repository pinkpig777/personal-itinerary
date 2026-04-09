export const ADMIN_EMAILS = ['charly729.chiu@gmail.com'];

export const isAdminEmail = (email) => {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};
