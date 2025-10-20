import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DesktopShortcutButton() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      subscription.unsubscribe();
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Atalho não disponível",
        description: "Esta função não está disponível no seu navegador ou o app já está instalado.",
        variant: "destructive"
      });
      return;
    }

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      toast({
        title: "Atalho Criado! 🎉",
        description: "OEP Sustentável foi adicionado à sua área de trabalho!",
      });
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  // Don't show button if already installed, on auth pages, or if user is logged in
  if (isInstalled || location.pathname.includes('/auth') || isLoggedIn) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleInstall}
          variant="outline"
          className="desktop-shortcut-btn animate-fade-in fixed bottom-20 right-4 z-40 flex flex-col items-center gap-1 h-auto py-2 px-3 bg-background/95 backdrop-blur-sm border-primary/20 hover:border-primary/40 shadow-lg"
        >
          <Download className="h-6 w-6 text-primary" />
          <span className="text-xs text-center max-w-[80px] leading-tight">
            Crie um atalho
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Instalar OEP Sustentável como aplicativo</p>
      </TooltipContent>
    </Tooltip>
  );
}