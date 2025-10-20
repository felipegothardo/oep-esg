import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUserEmail(session.user.email);
      
      // Load user profile with school info
      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          full_name,
          schools (
            name
          )
        `)
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (profile) {
        setUserName(profile.full_name);
        setSchoolName(profile.schools?.name);
      }
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate("/auth");
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-border">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm font-medium">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{userName || userEmail}</span>
          </div>
          {schoolName && (
            <div className="text-xs text-muted-foreground">
              {schoolName}
            </div>
          )}
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}