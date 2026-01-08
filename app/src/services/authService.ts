// app/src/services/authService.ts
import { supabase } from "./supabase/client";

export async function signUpWithEmail(payload: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    console.error("signUpWithEmail error:", error);
    throw error;
  }

  return data;
}

export async function signInWithEmail(payload: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    console.error("signInWithEmail error:", error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("signOut error:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("getCurrentUser error:", error);
    throw error;
  }
  return data.user ?? null;
}

/**
 * Subscribe to auth state changes (for a global auth context).
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}
