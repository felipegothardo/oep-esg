import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Info, Lightbulb, TrendingUp, TrendingDown, AlertTriangle, 
  Droplet, Zap, Recycle, Target, ChevronRight, X 
} from 'lucide-react';

interface Tip {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'suggestion';
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: number;
}

interface ContextualTipsProps {
  recyclingTotal: number;
  co2Total: number;
  waterConsumption: number[];
  energyConsumption: number[];
  waterGoal: number;
  energyGoal: number;
  lastRecyclingDate?: string;
  schoolName: string;
}

export default function ContextualTips({
  recyclingTotal,
  co2Total,
  waterConsumption,
  energyConsumption,
  waterGoal,
  energyGoal,
  lastRecyclingDate,
  schoolName
}: ContextualTipsProps) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem(`dismissedTips-${schoolName}`);
    if (dismissed) {
      setDismissedTips(JSON.parse(dismissed));
    }
  }, [schoolName]);

  useEffect(() => {
    const generatedTips: Tip[] = [];
    
    // Análise de tendências de água
    if (waterConsumption.length >= 2) {
      const lastMonth = waterConsumption[waterConsumption.length - 1];
      const previousMonth = waterConsumption[waterConsumption.length - 2];
      const trend = ((lastMonth - previousMonth) / previousMonth) * 100;
      
      if (trend > 10) {
        generatedTips.push({
          id: 'water-increase',
          title: 'Consumo de água aumentando',
          description: `Seu consumo aumentou ${trend.toFixed(1)}% este mês. Verifique possíveis vazamentos e revise as práticas de uso.`,
          type: 'warning',
          icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
          priority: 1,
          action: {
            label: 'Ver dicas de economia',
            onClick: () => window.open('https://www.sabesp.com.br/site/interna/Default.aspx?secaoId=140', '_blank')
          }
        });
      } else if (trend < -5) {
        generatedTips.push({
          id: 'water-decrease',
          title: 'Excelente economia de água!',
          description: `Parabéns! Você reduziu ${Math.abs(trend).toFixed(1)}% no consumo. Continue assim!`,
          type: 'success',
          icon: <TrendingDown className="w-5 h-5 text-green-500" />,
          priority: 3
        });
      }
    }
    
    // Análise de tendências de energia
    if (energyConsumption.length >= 2) {
      const lastMonth = energyConsumption[energyConsumption.length - 1];
      const previousMonth = energyConsumption[energyConsumption.length - 2];
      const trend = ((lastMonth - previousMonth) / previousMonth) * 100;
      
      if (trend > 10) {
        generatedTips.push({
          id: 'energy-increase',
          title: 'Consumo de energia em alta',
          description: `Aumento de ${trend.toFixed(1)}% detectado. Considere trocar lâmpadas por LED e desligar equipamentos em standby.`,
          type: 'warning',
          icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
          priority: 1
        });
      }
    }
    
    // Dicas sobre reciclagem
    if (lastRecyclingDate) {
      const daysSinceLastRecycling = Math.floor(
        (new Date().getTime() - new Date(lastRecyclingDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastRecycling > 7) {
        generatedTips.push({
          id: 'recycling-reminder',
          title: 'Hora de registrar reciclagem',
          description: `Faz ${daysSinceLastRecycling} dias desde o último registro. Mantenha os dados atualizados!`,
          type: 'info',
          icon: <Recycle className="w-5 h-5 text-blue-500" />,
          priority: 2
        });
      }
    }
    
    // Dicas sobre metas
    if (waterGoal > 0 && waterConsumption.length > 0) {
      const avgConsumption = waterConsumption.reduce((a, b) => a + b, 0) / waterConsumption.length;
      const projectedReduction = ((waterConsumption[0] - avgConsumption) / waterConsumption[0]) * 100;
      
      if (projectedReduction < waterGoal * 0.5) {
        generatedTips.push({
          id: 'water-goal-risk',
          title: 'Meta de água em risco',
          description: `Você está abaixo do esperado para atingir sua meta de ${waterGoal}% de redução. Intensifique as ações!`,
          type: 'warning',
          icon: <Target className="w-5 h-5 text-yellow-500" />,
          priority: 2
        });
      }
    }
    
    // Dicas sazonais
    const month = new Date().getMonth();
    if (month >= 11 || month <= 2) { // Verão
      generatedTips.push({
        id: 'summer-tip',
        title: 'Dica de verão',
        description: 'No verão, o consumo de água e energia tende a aumentar. Use ventiladores ao invés de ar-condicionado quando possível.',
        type: 'suggestion',
        icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
        priority: 4
      });
    }
    
    // Dicas baseadas em conquistas
    if (recyclingTotal > 90 && recyclingTotal < 100) {
      generatedTips.push({
        id: 'almost-100kg',
        title: 'Quase 100kg reciclados!',
        description: `Faltam apenas ${(100 - recyclingTotal).toFixed(1)}kg para desbloquear a conquista "Reciclador Prata"!`,
        type: 'info',
        icon: <Recycle className="w-5 h-5 text-primary" />,
        priority: 3
      });
    }
    
    // Dicas gerais
    if (co2Total > 0) {
      const trees = Math.floor(co2Total / 21); // Uma árvore absorve ~21kg CO2/ano
      if (trees > 0) {
        generatedTips.push({
          id: 'co2-impact',
          title: 'Seu impacto positivo',
          description: `Você já evitou CO₂ equivalente ao que ${trees} árvore${trees > 1 ? 's' : ''} absorve${trees > 1 ? 'm' : ''} em um ano!`,
          type: 'success',
          icon: <Info className="w-5 h-5 text-green-500" />,
          priority: 5
        });
      }
    }
    
    // Filtrar dicas já dispensadas e ordenar por prioridade
    const activeTips = generatedTips
      .filter(tip => !dismissedTips.includes(tip.id))
      .sort((a, b) => a.priority - b.priority);
    
    setTips(activeTips);
  }, [
    recyclingTotal, 
    co2Total, 
    waterConsumption, 
    energyConsumption, 
    waterGoal, 
    energyGoal, 
    lastRecyclingDate, 
    dismissedTips,
    schoolName
  ]);

  const dismissTip = (tipId: string) => {
    const newDismissed = [...dismissedTips, tipId];
    setDismissedTips(newDismissed);
    localStorage.setItem(`dismissedTips-${schoolName}`, JSON.stringify(newDismissed));
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'success': return 'default';
      default: return 'default';
    }
  };

  if (tips.length === 0) {
    return null;
  }

  const currentTip = tips[currentTipIndex];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary animate-pulse" />
            Dicas Personalizadas
          </span>
          {tips.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {currentTipIndex + 1} de {tips.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className={`border-${currentTip.type === 'warning' ? 'orange' : currentTip.type === 'success' ? 'green' : 'blue'}-200`}>
          <div className="flex items-start gap-3">
            {currentTip.icon}
            <div className="flex-1">
              <AlertDescription>
                <strong className="block mb-1">{currentTip.title}</strong>
                {currentTip.description}
              </AlertDescription>
              
              {currentTip.action && (
                <Button
                  size="sm"
                  variant="link"
                  className="mt-2 p-0 h-auto"
                  onClick={currentTip.action.onClick}
                >
                  {currentTip.action.label}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-1">
              {tips.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={nextTip}
                  title="Próxima dica"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => dismissTip(currentTip.id)}
                title="Dispensar dica"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Alert>

        {/* Indicadores de navegação */}
        {tips.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {tips.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentTipIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                onClick={() => setCurrentTipIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}