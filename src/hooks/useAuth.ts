import { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';
import { User } from '@blinkdotnew/sdk';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  const login = () => blink.auth.login(window.location.origin);
  const logout = () => blink.auth.signOut();

  return { user, loading, login, logout, isAuthenticated: !!user };
}
