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
  waterConsumption: number;
  energyConsumption: number;
  hasRecyclingData: boolean;
  hasConsumptionData: boolean;
  schoolName: string;
}

export default function ContextualTips({
  recyclingTotal,
  co2Total,
  waterConsumption,
  energyConsumption,
  hasRecyclingData,
  hasConsumptionData,
  schoolName,
  onTabChange
}: ContextualTipsProps & { onTabChange?: (tab: string) => void }) {
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
    
    // Dicas baseadas no total de reciclagem
    if (recyclingTotal > 0) {
      if (recyclingTotal < 50) {
        generatedTips.push({
          id: 'low-recycling',
          title: 'Aumente a reciclagem',
          description: 'Você está no caminho certo! Continue registrando seus materiais reciclados para alcançar 50kg.',
          type: 'suggestion',
          icon: <Recycle className="w-5 h-5 text-blue-500" />,
          priority: 2
        });
      } else if (recyclingTotal > 500) {
        generatedTips.push({
          id: 'high-recycling',
          title: 'Excelente desempenho!',
          description: `Incrível! Você já reciclou ${recyclingTotal.toFixed(1)}kg e evitou ${co2Total.toFixed(1)}kg de CO₂!`,
          type: 'success',
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          priority: 3
        });
      }
    }
    
    // Dicas sobre consumo de água
    if (waterConsumption > 0) {
      if (waterConsumption > 10000) {
        generatedTips.push({
          id: 'high-water',
          title: 'Consumo de água elevado',
          description: 'Considere implementar medidas de economia como captação de água da chuva e torneiras econômicas.',
          type: 'warning',
          icon: <Droplet className="w-5 h-5 text-blue-500" />,
          priority: 1
        });
      }
    }
    
    // Dicas sobre consumo de energia  
    if (energyConsumption > 0) {
      if (energyConsumption > 500) {
        generatedTips.push({
          id: 'high-energy',
          title: 'Consumo de energia alto',
          description: 'Troque lâmpadas por LED e desligue equipamentos em standby para economizar.',
          type: 'warning',
          icon: <Zap className="w-5 h-5 text-yellow-500" />,
          priority: 1
        });
      }
    }
    
    // Dicas iniciais
    if (!hasRecyclingData && !hasConsumptionData) {
      generatedTips.push({
        id: 'get-started',
        title: 'Bem-vindo ao OEP Sustentável!',
        description: 'Comece registrando seus primeiros dados de reciclagem ou consumo para acompanhar seu progresso.',
        type: 'info',
        icon: <Info className="w-5 h-5 text-blue-500" />,
        priority: 1,
        action: {
          label: 'Começar agora',
          onClick: () => {
            // Muda para a aba da calculadora se necessário
            if (onTabChange) {
              onTabChange('calculator');
            }
            // Aguarda um momento para a aba carregar e então foca no formulário
            setTimeout(() => {
              const calculatorForm = document.querySelector('.recycling-calculator-form');
              if (calculatorForm) {
                calculatorForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Tenta focar no primeiro input do formulário
                const firstInput = calculatorForm.querySelector('select, input');
                if (firstInput instanceof HTMLElement) {
                  firstInput.focus();
                }
              }
            }, 100);
          }
        }
      });
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
    hasRecyclingData,
    hasConsumptionData,
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
    <div className="mb-3">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              {currentTip.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {currentTip.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {currentTip.description}
                </p>
                {currentTip.action && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1 text-xs text-primary hover:text-primary/80"
                    onClick={currentTip.action.onClick}
                  >
                    {currentTip.action.label} →
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-0.5">
              {tips.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={nextTip}
                  aria-label="Próxima dica"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-50 hover:opacity-100"
                onClick={() => dismissTip(currentTip.id)}
                aria-label="Fechar"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Subtle dots indicator */}
          {tips.length > 1 && (
            <div className="flex justify-center gap-1 mt-2">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === currentTipIndex ? 'w-3 bg-primary/60' : 'w-1 bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}