import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedToken = localStorage.getItem('supabase_access_token');
      const storedUser = localStorage.getItem('supabase_user');
      
      if (storedToken && storedUser) {
        // Verify the token is still valid
        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'apikey': publicAnonKey,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token expired, clear storage
          localStorage.removeItem('supabase_access_token');
          localStorage.removeItem('supabase_user');
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': publicAnonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Provide more specific error messages
      if (response.status === 400) {
        // Check if it's an invalid credentials error
        if (data.error_description?.includes('Invalid login credentials') || 
            data.msg?.includes('Invalid login credentials')) {
          throw new Error('Account not found. Please sign up first or check your credentials.');
        }
      }
      throw new Error(data.error_description || data.msg || 'Failed to sign in');
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || 'User',
    };

    setAccessToken(data.access_token);
    setUser(userData);
    
    // Store in localStorage for persistence
    localStorage.setItem('supabase_access_token', data.access_token);
    localStorage.setItem('supabase_user', JSON.stringify(userData));
  };

  const signUp = async (email: string, password: string, name: string) => {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/make-server-aa1e89fd/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to sign up');
    }

    // After signup, sign in the user
    await signIn(email, password);
  };

  const signOut = async () => {
    try {
      if (accessToken) {
        await fetch(`${supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
          },
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('supabase_access_token');
      localStorage.removeItem('supabase_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signUp, signOut }}>
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