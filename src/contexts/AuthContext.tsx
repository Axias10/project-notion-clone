import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthActionResult, AuthContext } from "@/contexts/auth";

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirmez votre adresse email avant de vous connecter.";
  }
  if (normalized.includes("user already registered")) {
    return "Un compte existe déjà avec cette adresse email.";
  }
  if (normalized.includes("password should be")) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (normalized.includes("rate limit")) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }

  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Unable to restore Supabase session:", error);
      }
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return error
      ? { ok: false, message: getAuthErrorMessage(error.message) }
      : { ok: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      return { ok: false, message: getAuthErrorMessage(error.message) };
    }

    return {
      ok: true,
      requiresEmailConfirmation: data.session === null,
    };
  }, []);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signOut();
    return error
      ? { ok: false, message: getAuthErrorMessage(error.message) }
      : { ok: true };
  }, []);

  const sendPasswordReset = useCallback(async (email: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    return error
      ? { ok: false, message: getAuthErrorMessage(error.message) }
      : { ok: true };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.updateUser({ password });
    return error
      ? { ok: false, message: getAuthErrorMessage(error.message) }
      : { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
    }),
    [loading, sendPasswordReset, signIn, signOut, signUp, updatePassword, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
