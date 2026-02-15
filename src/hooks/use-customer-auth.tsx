import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface CustomerProfile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  gender: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
}

interface CustomerAuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  loyaltyPoints: number;
  loyaltyActive: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshPoints: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyActive, setLoyaltyActive] = useState(false);

  // Check if loyalty program is active from localStorage (toggled in /loja)
  useEffect(() => {
    const checkLoyalty = () => {
      try {
        const saved = localStorage.getItem('senas_store_features');
        if (saved) {
          const parsed = JSON.parse(saved);
          setLoyaltyActive(!!parsed['loyalty_program']);
        }
      } catch {
        setLoyaltyActive(false);
      }
    };
    checkLoyalty();
    window.addEventListener('storage', checkLoyalty);
    return () => window.removeEventListener('storage', checkLoyalty);
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await (supabase as any)
      .from('profiles')
      .select('full_name, phone, avatar_url, gender, address_street, address_number, address_complement, address_neighborhood, address_city, address_state, address_zip')
      .eq('user_id', userId)
      .maybeSingle();
    setProfile(data as CustomerProfile | null);
  };

  const fetchPoints = async (userId: string) => {
    const { data, error } = await (supabase as any)
      .from('loyalty_points')
      .select('points')
      .eq('user_id', userId);
    
    if (!error && data) {
      const total = (data as any[]).reduce((sum: number, row: any) => sum + (row.points || 0), 0);
      setLoyaltyPoints(total);
    }
  };

  const refreshPoints = async () => {
    if (user) await fetchPoints(user.id);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const updateProfile = async (data: Partial<CustomerProfile>) => {
    if (!user) return { error: 'Usuário não autenticado' };
    const { error } = await supabase
      .from('profiles')
      .update(data as any)
      .eq('user_id', user.id);
    if (!error) {
      await fetchProfile(user.id);
    }
    return { error: error?.message ?? null };
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        setTimeout(async () => {
          if (!mounted) return;
          await fetchProfile(u.id);
          await fetchPoints(u.id);
          if (mounted) setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setLoyaltyPoints(0);
        if (mounted) setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await fetchProfile(u.id);
        await fetchPoints(u.id);
      }
      if (mounted) setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoading(false);
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, phone: phone || '' },
        },
      });

      if (error) return { error: error.message };

      // Try to create profile — fire and forget, don't block signup flow
      if (data.user) {
        (supabase as any).from('profiles').upsert({
          user_id: data.user.id,
          full_name: fullName,
          phone: phone || null,
        }, { onConflict: 'user_id' }).catch(() => {});
      }

      return { error: null };
    } catch (e: any) {
      return { error: e?.message || 'Erro inesperado' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoyaltyPoints(0);
  };

  return (
    <CustomerAuthContext.Provider value={{
      user, profile, loading, loyaltyPoints, loyaltyActive,
      signIn, signUp, signOut, refreshPoints, updateProfile, refreshProfile,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return context;
};
