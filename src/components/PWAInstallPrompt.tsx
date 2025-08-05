import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt only if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      toast({
        title: "App Instalado! 📱",
        description: "OEP Sustentável agora está disponível na sua tela inicial!",
      });
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed or no prompt available
  if (!showPrompt || !deferredPrompt || localStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 md:hidden border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Instalar OEP Sustentável</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Adicione o app à sua tela inicial para acesso rápido e offline!
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="text-xs"
              >
                Instalar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDismiss}
                className="text-xs"
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}