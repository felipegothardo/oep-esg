import { Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActionHistory } from '@/hooks/useActionHistory';
import { useToast } from '@/hooks/use-toast';

export default function UndoButton() {
  const { hasHistory, undoLastAction } = useActionHistory();
  const { toast } = useToast();

  const handleUndo = () => {
    const lastAction = undoLastAction();
    if (lastAction) {
      toast({
        title: "Ação desfeita",
        description: `${lastAction.description} foi desfeito(a)`,
        duration: 2000,
      });
    }
  };

  if (!hasHistory) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUndo}
      className="gap-2 shadow-soft hover:shadow-eco transition-all"
    >
      <Undo className="w-4 h-4" />
      Desfazer
    </Button>
  );
}
