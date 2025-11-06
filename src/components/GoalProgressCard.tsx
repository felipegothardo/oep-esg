import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ConsumptionEntry {
  id: string;
  type: 'water' | 'energy';
  month: string;
  cost: number;
  consumption: number;
  date: string;
}

interface ConsumptionGoal {
  type: 'water' | 'energy';
  reductionPercentage: number;
}

interface GoalProgressCardProps {
  entries: ConsumptionEntry[];
  goals: ConsumptionGoal[];
  type: 'water' | 'energy';
}

export default function GoalProgressCard({ entries, goals, type }: GoalProgressCardProps) {
  const typeEntries = entries.filter(e => e.type === type);
  const goal = goals.find(g => g.type === type);
  
  if (!goal || goal.reductionPercentage === 0 || typeEntries.length < 2) {
    return null;
  }

  // Pegar os dois últimos registros para comparar
  const sortedEntries = typeEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const previousEntry = sortedEntries[sortedEntries.length - 2];
  
  const actualReduction = ((previousEntry.consumption - latestEntry.consumption) / previousEntry.consumption) * 100;
  const progressPercentage = Math.min(Math.abs(actualReduction) / goal.reductionPercentage * 100, 100);
  
  const isOnTrack = actualReduction >= goal.reductionPercentage;
  const isImproving = actualReduction > 0;

  const getStatusIcon = () => {
    if (isOnTrack) return <TrendingDown className="w-4 h-4 text-success" />;
    if (isImproving) return <TrendingUp className="w-4 h-4 text-primary" />;
    return <Minus className="w-4 h-4 text-destructive" />;
  };

  const getStatusColor = () => {
    if (isOnTrack) return 'text-success';
    if (isImproving) return 'text-primary';
    return 'text-destructive';
  };

  const getStatusText = () => {
    if (isOnTrack) return 'Meta Atingida!';
    if (isImproving) return 'Melhorando';
    return 'Precisa Melhorar';
  };

  const getProgressColor = () => {
    if (isOnTrack) return 'hsl(var(--success))';
    if (progressPercentage > 50) return 'hsl(var(--primary))';
    return 'hsl(var(--destructive))';
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Meta de {type === 'water' ? 'Água' : 'Energia'}
          </CardTitle>
          <Badge variant={isOnTrack ? "default" : "secondary"} className="gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>
          Objetivo: {goal.reductionPercentage}% de redução
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Meta</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
            <div 
              className="absolute inset-0 rounded-full h-3 transition-all duration-500"
              style={{ 
                width: `${progressPercentage}%`,
                background: getProgressColor()
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Redução Atual</p>
            <p className={`font-bold ${getStatusColor()}`}>
              {actualReduction > 0 ? '-' : '+'}{Math.abs(actualReduction).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Meta</p>
            <p className="font-bold text-primary">-{goal.reductionPercentage}%</p>
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Comparação: {previousEntry.month} ({previousEntry.consumption.toLocaleString()}) → {' '}
            {latestEntry.month} ({latestEntry.consumption.toLocaleString()})
            {type === 'water' ? ' L' : ' kWh'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}