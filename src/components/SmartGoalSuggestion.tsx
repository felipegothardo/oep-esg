import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { ConsumptionEntry, ConsumptionGoal } from '@/hooks/useSchoolData';

interface SmartGoalSuggestionProps {
  recyclingEntries: any[];
  consumptionEntries: ConsumptionEntry[];
  currentGoals: ConsumptionGoal[];
  onUpdateGoal?: (type: 'water' | 'energy', percentage: number) => void;
}

export default function SmartGoalSuggestion({ 
  recyclingEntries,
  consumptionEntries, 
  currentGoals,
  onUpdateGoal
}: SmartGoalSuggestionProps) {
  
  const onAcceptSuggestion = (type: 'water' | 'energy', percentage: number) => {
    if (onUpdateGoal) {
      onUpdateGoal(type, percentage);
    }
  };
  
  const calculateSuggestion = (type: 'water' | 'energy') => {
    const typeEntries = consumptionEntries
      .filter(entry => entry.type === type)
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
    
    if (typeEntries.length < 2) return null;
    
    // Calcular média dos últimos 3 meses
    const recentEntries = typeEntries.slice(0, 3);
    const avgConsumption = recentEntries.reduce((sum, entry) => sum + entry.consumption, 0) / recentEntries.length;
    
    // Calcular tendência
    const trend = typeEntries.length >= 3 
      ? (typeEntries[0].consumption - typeEntries[2].consumption) / typeEntries[2].consumption * 100
      : 0;
    
    // Sugestão baseada na tendência
    let suggestedReduction: number;
    let confidence: 'alta' | 'média' | 'baixa';
    let reason: string;
    
    if (trend < -5) {
      // Já está reduzindo
      suggestedReduction = Math.min(Math.abs(trend) + 5, 25);
      confidence = 'alta';
      reason = `Você já reduziu ${Math.abs(trend).toFixed(1)}% nos últimos meses. Continue assim!`;
    } else if (trend > 5) {
      // Consumo aumentando
      suggestedReduction = 10;
      confidence = 'média';
      reason = `Seu consumo aumentou ${trend.toFixed(1)}%. Hora de reverter essa tendência!`;
    } else {
      // Estável
      suggestedReduction = 15;
      confidence = 'média';
      reason = 'Seu consumo está estável. Que tal um desafio de redução?';
    }
    
    return {
      percentage: suggestedReduction,
      avgConsumption,
      trend,
      confidence,
      reason,
      lastMonths: recentEntries.length
    };
  };
  
  const waterSuggestion = calculateSuggestion('water');
  const energySuggestion = calculateSuggestion('energy');
  
  if (!waterSuggestion && !energySuggestion) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Metas Inteligentes
          </CardTitle>
          <CardDescription>
            Adicione pelo menos 2 meses de dados para receber sugestões de metas personalizadas
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Sugestões de Metas
        </CardTitle>
        <CardDescription>
          Baseado no seu histórico de consumo dos últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {waterSuggestion && (
          <div className="p-4 rounded-lg bg-blue/10 border border-blue/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground">Água</h4>
                <Badge variant={waterSuggestion.confidence === 'alta' ? 'default' : 'secondary'}>
                  Confiança {waterSuggestion.confidence}
                </Badge>
                {waterSuggestion.trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-success" />
                ) : waterSuggestion.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 break-words">
              {waterSuggestion.reason}
            </p>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Meta sugerida: </span>
                <span className="text-lg font-bold text-foreground">
                  {waterSuggestion.percentage.toFixed(0)}% de redução
                </span>
              </div>
              <Button 
                size="sm" 
                variant="default"
                onClick={() => onAcceptSuggestion('water', waterSuggestion.percentage)}
              >
                Aplicar Meta
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground font-medium">
              Média atual: {waterSuggestion.avgConsumption.toFixed(0)}L/mês
            </div>
          </div>
        )}
        
        {energySuggestion && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground">Energia</h4>
                <Badge variant={energySuggestion.confidence === 'alta' ? 'default' : 'secondary'}>
                  Confiança {energySuggestion.confidence}
                </Badge>
                {energySuggestion.trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-success" />
                ) : energySuggestion.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 break-words">
              {energySuggestion.reason}
            </p>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Meta sugerida: </span>
                <span className="text-lg font-bold text-foreground">
                  {energySuggestion.percentage.toFixed(0)}% de redução
                </span>
              </div>
              <Button 
                size="sm" 
                variant="default"
                onClick={() => onAcceptSuggestion('energy', energySuggestion.percentage)}
              >
                Aplicar Meta
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground font-medium">
              Média atual: {energySuggestion.avgConsumption.toFixed(0)}kWh/mês
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            As sugestões são baseadas no seu histórico e tendências de consumo. 
            Ajuste as metas conforme a realidade da sua escola.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}