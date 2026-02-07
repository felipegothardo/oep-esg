import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import oepLogo from '@/assets/oep-logo-new.png';

interface EcoHeaderProps {
  schoolName?: string;
  schoolLogo?: string;
}

export default function EcoHeader({ schoolName, schoolLogo }: EcoHeaderProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (profile?.full_name) setUserName(profile.full_name);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Erro ao sair", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Até logo!", description: "Logout realizado com sucesso." });
      navigate("/auth");
    }
  };

  const displayName = userName || userEmail?.split('@')[0] || '';

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
        {/* Left - Logo + Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img 
            src={schoolLogo || oepLogo} 
            alt={schoolName ? `Logo ${schoolName}` : "OEP Sustentável"} 
            className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
            loading="eager"
          />
          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-bold text-foreground truncate">
              {schoolName || 'OEP Sustentável'}
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate hidden sm:block">
              Gestão Ambiental Escolar
            </p>
          </div>
        </div>

        {/* Right - User Info */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 min-w-[180px]">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  {userEmail && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
