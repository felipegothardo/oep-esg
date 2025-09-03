import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, BookOpen, BarChart3, Recycle, Target, Download, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Bem-vindo ao OEP Sustentável!',
    description: 'Este aplicativo ajuda a controlar o consumo e gerenciar resíduos escolares.',
    icon: <BookOpen className="w-8 h-8" />
  },
  {
    title: 'Selecione sua Escola',
    description: 'Escolha entre as escolas disponíveis ou visualize dados consolidados.',
    icon: <BarChart3 className="w-8 h-8" />,
    target: '.school-selection'
  },
  {
    title: 'Registre Reciclagem',
    description: 'Adicione dados sobre papel, plástico e outros materiais reciclados.',
    icon: <Recycle className="w-8 h-8" />,
    target: '.recycling-section'
  },
  {
    title: 'Monitore Consumo',
    description: 'Acompanhe água e energia, definindo metas mensais.',
    icon: <Target className="w-8 h-8" />,
    target: '.consumption-section'
  },
  {
    title: 'Crie um Atalho',
    description: 'Instale o app na área de trabalho para acesso rápido!',
    icon: <Download className="w-8 h-8" />,
    target: '.desktop-shortcut-btn'
  }
];

export default function OnboardingTutorial() {
  const [showTutorial, setShowTutorial] = useLocalStorage('hasSeenTutorial', false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!showTutorial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Destacar elemento alvo
      const step = tutorialSteps[currentStep + 1];
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('tutorial-highlight');
          setTimeout(() => {
            element.classList.remove('tutorial-highlight');
          }, 2000);
        }
      }
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowTutorial(true);
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (showTutorial || !isVisible) return null;

  const currentStepData = tutorialSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in" />
      
      {/* Tutorial Card */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 animate-scale-in">
        <Card className="p-6 border-2 border-primary/20 shadow-glow">
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Pular tutorial"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-float">
              {currentStepData.icon}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground">
              {currentStepData.title}
            </h2>
            
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
            
            {/* Progress dots */}
            <div className="flex gap-2 py-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-8 bg-primary' 
                      : index < currentStep 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-3 w-full">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex-1 gap-2"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Começar' : 'Próximo'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}