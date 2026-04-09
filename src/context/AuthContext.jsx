import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { isAdminEmail } from '../config/admin';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError('');
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setAuthError('Unable to sign in right now. Please try again.');
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      setAuthError('');
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError('Unable to sign out right now. Please try again.');
      throw error;
    }
  };

  const value = useMemo(() => {
    return {
      user,
      isAdmin: isAdminEmail(user?.email),
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
