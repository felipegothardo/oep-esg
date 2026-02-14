import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Info, TrendingUp, TrendingDown, AlertTriangle, 
  Droplet, Zap, Recycle, ChevronRight, X 
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
    
    if (recyclingTotal > 0 && recyclingTotal < 50) {
      generatedTips.push({
        id: 'low-recycling',
        title: 'Continue registrando',
        description: 'Você está no caminho certo. Continue registrando para alcançar 50 kg de materiais reciclados.',
        type: 'suggestion',
        icon: <Recycle className="w-5 h-5 text-primary" />,
        priority: 2
      });
    } else if (recyclingTotal > 500) {
      generatedTips.push({
        id: 'high-recycling',
        title: 'Marco atingido',
        description: `${recyclingTotal.toFixed(1)} kg reciclados, com ${co2Total.toFixed(1)} kg de CO₂ evitado.`,
        type: 'success',
        icon: <TrendingUp className="w-5 h-5 text-success" />,
        priority: 3
      });
    }
    
    if (waterConsumption > 10000) {
      generatedTips.push({
        id: 'high-water',
        title: 'Consumo de água elevado',
        description: 'Considere implementar medidas de economia como captação de água da chuva e torneiras econômicas.',
        type: 'warning',
        icon: <Droplet className="w-5 h-5 text-blue" />,
        priority: 1
      });
    }
    
    if (energyConsumption > 500) {
      generatedTips.push({
        id: 'high-energy',
        title: 'Consumo de energia alto',
        description: 'Troque lâmpadas por LED e desligue equipamentos em standby para economizar.',
        type: 'warning',
        icon: <Zap className="w-5 h-5 text-accent" />,
        priority: 1
      });
    }
    
    if (!hasRecyclingData && !hasConsumptionData) {
      generatedTips.push({
        id: 'get-started',
        title: 'Comece a registrar',
        description: 'Registre seus primeiros dados de reciclagem ou consumo para acompanhar o progresso da escola.',
        type: 'info',
        icon: <Info className="w-5 h-5 text-primary" />,
        priority: 1,
        action: {
          label: 'Iniciar registro',
          onClick: () => {
            if (onTabChange) onTabChange('calculator');
            setTimeout(() => {
              const calculatorForm = document.querySelector('.recycling-calculator-form');
              if (calculatorForm) {
                calculatorForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const firstInput = calculatorForm.querySelector('select, input');
                if (firstInput instanceof HTMLElement) firstInput.focus();
              }
            }, 100);
          }
        }
      });
    }
    
    if (co2Total > 0) {
      const trees = Math.floor(co2Total / 21);
      if (trees > 0) {
        generatedTips.push({
          id: 'co2-impact',
          title: 'Impacto registrado',
          description: `CO₂ evitado equivalente à absorção anual de ${trees} árvore${trees > 1 ? 's' : ''}.`,
          type: 'success',
          icon: <TrendingUp className="w-5 h-5 text-success" />,
          priority: 5
        });
      }
    }
    
    const activeTips = generatedTips
      .filter(tip => !dismissedTips.includes(tip.id))
      .sort((a, b) => a.priority - b.priority);
    
    setTips(activeTips);
  }, [
    recyclingTotal, co2Total, waterConsumption, energyConsumption,
    hasRecyclingData, hasConsumptionData, dismissedTips, schoolName
  ]);

  const dismissTip = (tipId: string) => {
    const newDismissed = [...dismissedTips, tipId];
    setDismissedTips(newDismissed);
    localStorage.setItem(`dismissedTips-${schoolName}`, JSON.stringify(newDismissed));
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  if (tips.length === 0) return null;

  const currentTip = tips[currentTipIndex];

  return (
    <div className="mb-4">
      <Card className="border border-accent/30 shadow-md bg-gradient-to-r from-accent/10 via-accent/5 to-transparent">
        <CardContent className="px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-0.5">{currentTip.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentTip.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">
                  {currentTip.description}
                </p>
                {currentTip.action && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1 text-xs text-primary hover:text-primary/80"
                    onClick={currentTip.action.onClick}
                  >
                    {currentTip.action.label}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 flex-shrink-0">
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
