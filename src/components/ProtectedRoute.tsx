import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "./LoadingState";
import { isLocalMode } from "@/lib/runtimeMode";
import { getLocalSession } from "@/services/localDb";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLocalAuthenticated, setIsLocalAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLocalMode) {
      setIsLocalAuthenticated(!!getLocalSession());
      setLoading(false);
      return;
    }

    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!isMounted) return;
        setSession(currentSession);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <LoadingState fullScreen message="Verificando autenticacao..." />;
  }

  if (isLocalMode) {
    return isLocalAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
  }

  return session ? <>{children}</> : <Navigate to="/auth" replace />;
}

