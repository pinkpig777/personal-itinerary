import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { isSuperAdminEmail } from '../config/admin';
import { syncAuthenticatedUserProfile } from '../utils/userRegistry';

const AuthContext = createContext(null);

const MOBILE_USER_AGENT_PATTERN = /android|iphone|ipad|ipod|mobile/i;
const POPUP_FALLBACK_ERROR_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment'
]);

const shouldUseRedirectFlow = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  if (navigator.userAgentData?.mobile) {
    return true;
  }

  return MOBILE_USER_AGENT_PATTERN.test(navigator.userAgent || '');
};

const formatAuthError = (error) => {
  switch (error?.code) {
    case 'auth/network-request-failed':
      return 'Unable to reach Google sign-in right now. Check the network and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was canceled before it finished.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign-in.';
    default:
      return 'Unable to sign in right now. Please try again.';
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let hasResolvedRedirectResult = false;

    const finishSignedOutState = () => {
      if (!isMounted || !hasResolvedRedirectResult || auth.currentUser) {
        return;
      }

      setIsAuthLoading(false);
    };

    getRedirectResult(auth)
      .catch((error) => {
        console.error('Error completing redirect sign-in:', error);

        if (isMounted) {
          setAuthError(formatAuthError(error));
        }
      })
      .finally(() => {
        hasResolvedRedirectResult = true;
        finishSignedOutState();
      });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!isMounted) {
        return;
      }

      setUser(nextUser);

      if (!nextUser) {
        finishSignedOutState();
        return;
      }

      try {
        await syncAuthenticatedUserProfile(nextUser);
        if (isMounted) {
          setAuthError('');
        }
      } catch (error) {
        console.error('Error syncing signed-in user profile:', error);

        if (isMounted) {
          setAuthError('Unable to sync this account right now. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const startRedirectFlow = async () => {
      await signInWithRedirect(auth, googleProvider);
    };

    try {
      setAuthError('');
      setIsAuthLoading(true);
      await setPersistence(auth, browserLocalPersistence);

      if (shouldUseRedirectFlow()) {
        await startRedirectFlow();
        return;
      }

      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (POPUP_FALLBACK_ERROR_CODES.has(error?.code)) {
        try {
          await startRedirectFlow();
          return;
        } catch (redirectError) {
          console.error('Error falling back to redirect sign-in:', redirectError);
          setAuthError(formatAuthError(redirectError));
          setIsAuthLoading(false);
          return;
        }
      }

      console.error('Error signing in with Google:', error);
      setAuthError(formatAuthError(error));
      setIsAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setAuthError('');
      setIsAuthLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError('Unable to sign out right now. Please try again.');
      setIsAuthLoading(false);
    }
  };

  const value = useMemo(() => {
    return {
      user,
      isSuperAdmin: isSuperAdminEmail(user?.email),
      isAuthLoading,
      authError,
      signInWithGoogle,
      signOutUser
    };
  }, [authError, isAuthLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }

  return context;
}
