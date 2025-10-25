import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SaveReminderProps {
  hasUnsavedChanges: boolean;
  onDismiss?: () => void;
}

export default function SaveReminder({ hasUnsavedChanges, onDismiss }: SaveReminderProps) {
  const [show, setShow] = useState(false);
  const [lastShown, setLastShown] = useState<number>(0);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const now = Date.now();
      // Só mostrar se passou mais de 5 minutos desde a última vez
      if (now - lastShown > 5 * 60 * 1000) {
        const timer = setTimeout(() => {
          setShow(true);
          setLastShown(now);
        }, 3000); // Espera 3 segundos antes de mostrar
        
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [hasUnsavedChanges, lastShown]);

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  if (!show) return null;

  return (
    <Alert className="fixed bottom-4 right-4 max-w-md shadow-eco z-50 border-primary/30 bg-background/95 backdrop-blur">
      <AlertCircle className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between gap-2">
        <span className="text-sm">Lembre-se de salvar suas alterações</span>
        <button 
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Dispensar
        </button>
      </AlertDescription>
    </Alert>
  );
}
