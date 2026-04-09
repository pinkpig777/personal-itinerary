const CANONICAL_HOSTNAME = 'itinerary-d5936.firebaseapp.com';
const LEGACY_HOSTNAMES = new Set(['itinerary-d5936.web.app']);

export const ensureCanonicalHost = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const { hostname, pathname, search, hash, protocol } = window.location;

  if (!LEGACY_HOSTNAMES.has(hostname)) {
    return false;
  }

  const targetUrl = `${protocol}//${CANONICAL_HOSTNAME}${pathname}${search}${hash}`;
  window.location.replace(targetUrl);
  return true;
};
