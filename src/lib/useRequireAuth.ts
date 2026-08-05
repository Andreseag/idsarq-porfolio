import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Protege una isla de admin: mientras carga muestra un loader, si no hay sesión
 * redirige a /admin/login, y si la hay expone la sesión activa.
 */
export function useRequireAuth() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) window.location.href = "/admin/login";
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) window.location.href = "/admin/login";
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, loading: session === undefined };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/admin/login";
}
