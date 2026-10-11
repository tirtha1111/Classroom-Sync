import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

export type UserRole = 'teacher' | 'student';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (role: UserRole) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for demo user session first
    const savedDemoUser = localStorage.getItem('classroomsync_demo_user');
    if (savedDemoUser) {
      try {
        setUser(JSON.parse(savedDemoUser));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('classroomsync_demo_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const path = `users/${firebaseUser.uid}`;
        try {
          const userDoc = await getDoc(doc(db, path));
          if (userDoc.exists()) {
            setUser(userDoc.data() as AppUser);
          } else {
            // Fallback if doc doesn't exist yet
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || 'user@classroomsync.demo',
              role: 'student'
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (role: UserRole) => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const path = `users/${firebaseUser.uid}`;
      const userDocRef = doc(db, path);
      
      let userDoc;
      try {
        userDoc = await getDoc(userDocRef);
      } catch (error) {
        // If permission denied or offline, gracefully fallback to local demo user object
        console.warn('Firestore getDoc failed, falling back to local user session');
      }

      const userData: AppUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || (role === 'teacher' ? 'Mr. Sharma' : 'Tirtharaj'),
        email: firebaseUser.email || `${role}@classroomsync.demo`,
        role: role,
      };

      if (!userDoc?.exists()) {
        try {
          await setDoc(userDocRef, {
            ...userData,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.warn('Could not write user to Firestore, continuing with local session');
        }
      }

      setUser(userData);
      localStorage.setItem('classroomsync_demo_user', JSON.stringify(userData));
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log('Login popup cancelled, using demo instant login fallback.');
        loginAsDemo(role);
      } else {
        // Fallback to demo login so the app is always 100% demo-ready for presentation
        loginAsDemo(role);
      }
    }
  };

  const loginAsDemo = (role: UserRole) => {
    const demoUser: AppUser = {
      id: role === 'teacher' ? 'teacher-demo-123' : 'student-demo-456',
      name: role === 'teacher' ? 'Mr. Sharma (Demo)' : 'Tirtharaj (Student Demo)',
      email: role === 'teacher' ? 'teacher@classroomsync.demo' : 'student@classroomsync.demo',
      role: role
    };
    setUser(demoUser);
    localStorage.setItem('classroomsync_demo_user', JSON.stringify(demoUser));
    setLoading(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('classroomsync_demo_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
