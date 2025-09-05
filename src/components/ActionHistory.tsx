import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  History, Undo, Trash2, Plus, Edit, Target, 
  Droplet, Zap, Recycle, Calendar 
} from 'lucide-react';
import { Action } from '@/hooks/useActionHistory';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActionHistoryProps {
  history: Action[];
  onUndo: () => void;
  onClear: () => void;
  hasHistory: boolean;
}

export default function ActionHistory({ 
  history, 
  onUndo, 
  onClear, 
  hasHistory 
}: ActionHistoryProps) {
  const getActionIcon = (action: Action) => {
    switch (action.type) {
      case 'add': return <Plus className="w-4 h-4" />;
      case 'update': return <Edit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'recycling': return <Recycle className="w-4 h-4" />;
      case 'consumption': 
        return Math.random() > 0.5 ? <Droplet className="w-4 h-4" /> : <Zap className="w-4 h-4" />;
      case 'goal': return <Target className="w-4 h-4" />;
      default: return null;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'add': return 'text-green-600 dark:text-green-400';
      case 'update': return 'text-blue-600 dark:text-blue-400';
      case 'delete': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recycling': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'consumption': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'goal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const recentActions = history.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Ações
          </span>
          <div className="flex gap-2">
            {hasHistory && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onUndo}
                  className="gap-2"
                >
                  <Undo className="w-4 h-4" />
                  Desfazer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClear}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Últimas ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentActions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ação registrada ainda</p>
            <p className="text-xs mt-1">Suas ações aparecerão aqui</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`mt-0.5 ${getActionColor(action.type)}`}>
                    {getActionIcon(action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {action.description}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(action.category)}`}
                      >
                        <span className="mr-1">
                          {getCategoryIcon(action.category)}
                        </span>
                        {action.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(action.timestamp), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                      <span>•</span>
                      <span>{action.schoolName}</span>
                    </div>
                    
                    {action.data && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <details className="cursor-pointer">
                          <summary className="font-medium">Detalhes</summary>
                          <pre className="mt-2 overflow-x-auto">
                            {JSON.stringify(action.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}