import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { AdminUser } from '../types';

interface AdminAuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  demoAdminLogin: () => void;
  logout: () => Promise<void>;
}

const SUPER_ADMIN_EMAIL = 'saikrishnask990@gmail.com';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const isSuperAdmin = firebaseUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        // Set admin details
        setAdminUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Boutique Admin',
          photoURL: firebaseUser.photoURL || undefined,
          role: isSuperAdmin ? 'superadmin' : 'store_manager'
        });
      } else {
        // Check for local demo admin session (useful if popup is blocked or preview mode)
        const demoSession = localStorage.getItem('virasat_admin_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession);
            setAdminUser(parsed);
          } catch {
            setAdminUser(null);
          }
        } else {
          setAdminUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('Google sign in popup warning:', err);
      // If popup was blocked or iframe restriction triggered in preview, allow graceful fallback demo login
      return false;
    }
  };

  const demoAdminLogin = () => {
    const demoAdmin: AdminUser = {
      uid: 'admin-saikrishna-sk990',
      email: SUPER_ADMIN_EMAIL,
      displayName: 'Sai Krishna (Store Owner)',
      role: 'superadmin'
    };
    localStorage.setItem('virasat_admin_demo_session', JSON.stringify(demoAdmin));
    setAdminUser(demoAdmin);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('virasat_admin_demo_session');
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    setAdminUser(null);
    setUser(null);
  };

  const isAdmin = !!adminUser;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        adminUser,
        isAdmin,
        loading,
        loginWithGoogle,
        demoAdminLogin,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
