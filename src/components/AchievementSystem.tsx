import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, Award, Star, Target, Zap, Droplet, Recycle, 
  TrendingUp, Shield, Heart, Leaf, TreePine 
} from 'lucide-react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target: number;
  current: number;
  unit: string;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'recycling' | 'water' | 'energy' | 'general';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface AchievementSystemProps {
  recyclingTotal: number;
  co2Total: number;
  waterReduction: number;
  energyReduction: number;
  monthsActive: number;
  schoolName: string;
}

export default function AchievementSystem({
  recyclingTotal,
  co2Total,
  waterReduction,
  energyReduction,
  monthsActive,
  schoolName
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [unlockedCount, setUnlockedCount] = useState(0);

  // Definir conquistas
  useEffect(() => {
    const allAchievements: Achievement[] = [
      // Conquistas de Reciclagem
      {
        id: 'recycle-10',
        title: 'Primeiros Passos',
        description: 'Recicle 10kg de materiais',
        icon: <Recycle className="w-6 h-6" />,
        target: 10,
        current: recyclingTotal,
        unit: 'kg',
        unlocked: recyclingTotal >= 10,
        category: 'recycling',
        level: 'bronze'
      },
      {
        id: 'recycle-50',
        title: 'Reciclador Bronze',
        description: 'Recicle 50kg de materiais',
        icon: <Recycle className="w-6 h-6" />,
        target: 50,
        current: recyclingTotal,
        unit: 'kg',
        unlocked: recyclingTotal >= 50,
        category: 'recycling',
        level: 'bronze'
      },
      {
        id: 'recycle-100',
        title: 'Reciclador Prata',
        description: 'Recicle 100kg de materiais',
        icon: <Award className="w-6 h-6" />,
        target: 100,
        current: recyclingTotal,
        unit: 'kg',
        unlocked: recyclingTotal >= 100,
        category: 'recycling',
        level: 'silver'
      },
      {
        id: 'recycle-500',
        title: 'Reciclador Ouro',
        description: 'Recicle 500kg de materiais',
        icon: <Trophy className="w-6 h-6" />,
        target: 500,
        current: recyclingTotal,
        unit: 'kg',
        unlocked: recyclingTotal >= 500,
        category: 'recycling',
        level: 'gold'
      },
      {
        id: 'recycle-1000',
        title: 'Mestre da Reciclagem',
        description: 'Recicle 1000kg de materiais',
        icon: <Star className="w-6 h-6" />,
        target: 1000,
        current: recyclingTotal,
        unit: 'kg',
        unlocked: recyclingTotal >= 1000,
        category: 'recycling',
        level: 'platinum'
      },
      // Conquistas de CO2
      {
        id: 'co2-50',
        title: 'Protetor do Ar',
        description: 'Evite 50kg de CO₂',
        icon: <Leaf className="w-6 h-6" />,
        target: 50,
        current: co2Total,
        unit: 'kg CO₂',
        unlocked: co2Total >= 50,
        category: 'general',
        level: 'bronze'
      },
      {
        id: 'co2-200',
        title: 'Guardião do Clima',
        description: 'Evite 200kg de CO₂',
        icon: <Shield className="w-6 h-6" />,
        target: 200,
        current: co2Total,
        unit: 'kg CO₂',
        unlocked: co2Total >= 200,
        category: 'general',
        level: 'silver'
      },
      {
        id: 'co2-500',
        title: 'Herói do Planeta',
        description: 'Evite 500kg de CO₂',
        icon: <TreePine className="w-6 h-6" />,
        target: 500,
        current: co2Total,
        unit: 'kg CO₂',
        unlocked: co2Total >= 500,
        category: 'general',
        level: 'gold'
      },
      // Conquistas de Água
      {
        id: 'water-10',
        title: 'Economizador de Água',
        description: 'Reduza 10% no consumo de água',
        icon: <Droplet className="w-6 h-6" />,
        target: 10,
        current: waterReduction,
        unit: '%',
        unlocked: waterReduction >= 10,
        category: 'water',
        level: 'bronze'
      },
      {
        id: 'water-20',
        title: 'Guardião das Águas',
        description: 'Reduza 20% no consumo de água',
        icon: <Droplet className="w-6 h-6" />,
        target: 20,
        current: waterReduction,
        unit: '%',
        unlocked: waterReduction >= 20,
        category: 'water',
        level: 'silver'
      },
      {
        id: 'water-30',
        title: 'Mestre das Águas',
        description: 'Reduza 30% no consumo de água',
        icon: <Droplet className="w-6 h-6" />,
        target: 30,
        current: waterReduction,
        unit: '%',
        unlocked: waterReduction >= 30,
        category: 'water',
        level: 'gold'
      },
      // Conquistas de Energia
      {
        id: 'energy-10',
        title: 'Economizador de Energia',
        description: 'Reduza 10% no consumo de energia',
        icon: <Zap className="w-6 h-6" />,
        target: 10,
        current: energyReduction,
        unit: '%',
        unlocked: energyReduction >= 10,
        category: 'energy',
        level: 'bronze'
      },
      {
        id: 'energy-20',
        title: 'Eficiente Energético',
        description: 'Reduza 20% no consumo de energia',
        icon: <Zap className="w-6 h-6" />,
        target: 20,
        current: energyReduction,
        unit: '%',
        unlocked: energyReduction >= 20,
        category: 'energy',
        level: 'silver'
      },
      {
        id: 'energy-30',
        title: 'Mestre da Energia',
        description: 'Reduza 30% no consumo de energia',
        icon: <Zap className="w-6 h-6" />,
        target: 30,
        current: energyReduction,
        unit: '%',
        unlocked: energyReduction >= 30,
        category: 'energy',
        level: 'gold'
      },
      // Conquistas de Tempo
      {
        id: 'time-1',
        title: 'Iniciante Sustentável',
        description: 'Complete 1 mês de atividades',
        icon: <Target className="w-6 h-6" />,
        target: 1,
        current: monthsActive,
        unit: 'mês',
        unlocked: monthsActive >= 1,
        category: 'general',
        level: 'bronze'
      },
      {
        id: 'time-3',
        title: 'Persistente',
        description: 'Complete 3 meses de atividades',
        icon: <TrendingUp className="w-6 h-6" />,
        target: 3,
        current: monthsActive,
        unit: 'meses',
        unlocked: monthsActive >= 3,
        category: 'general',
        level: 'silver'
      },
      {
        id: 'time-6',
        title: 'Veterano Sustentável',
        description: 'Complete 6 meses de atividades',
        icon: <Heart className="w-6 h-6" />,
        target: 6,
        current: monthsActive,
        unit: 'meses',
        unlocked: monthsActive >= 6,
        category: 'general',
        level: 'gold'
      }
    ];

    // Verificar novas conquistas desbloqueadas
    const savedAchievements = localStorage.getItem(`achievements-${schoolName}`);
    const previousAchievements: Achievement[] = savedAchievements ? JSON.parse(savedAchievements) : [];
    
    allAchievements.forEach(achievement => {
      const previousAchievement = previousAchievements.find(a => a.id === achievement.id);
      if (achievement.unlocked && (!previousAchievement || !previousAchievement.unlocked)) {
        // Nova conquista desbloqueada!
        toast.success(
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="font-bold">Nova Conquista!</div>
              <div className="text-sm">{achievement.title}</div>
            </div>
          </div>,
          { duration: 5000 }
        );
        achievement.unlockedAt = new Date();
      } else if (previousAchievement?.unlocked) {
        achievement.unlockedAt = previousAchievement.unlockedAt;
      }
    });

    setAchievements(allAchievements);
    setUnlockedCount(allAchievements.filter(a => a.unlocked).length);
    localStorage.setItem(`achievements-${schoolName}`, JSON.stringify(allAchievements));
  }, [recyclingTotal, co2Total, waterReduction, energyReduction, monthsActive, schoolName]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'recycling': return <Recycle className="w-4 h-4" />;
      case 'water': return <Droplet className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Conquistas
            </span>
            <Badge variant="secondary" className="text-lg px-3">
              {unlockedCount}/{achievements.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Desbloqueie conquistas completando objetivos sustentáveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progresso Geral */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso Total</span>
                <span className="font-semibold">
                  {Math.round((unlockedCount / achievements.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={(unlockedCount / achievements.length) * 100} 
                className="h-2"
              />
            </div>

            {/* Lista de Conquistas */}
            <div className="grid gap-3">
              {achievements
                .sort((a, b) => {
                  // Desbloqueadas primeiro
                  if (a.unlocked && !b.unlocked) return -1;
                  if (!a.unlocked && b.unlocked) return 1;
                  // Depois por progresso
                  return (b.current / b.target) - (a.current / a.target);
                })
                .slice(0, 5)
                .map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20' 
                        : 'bg-muted/50 opacity-75'
                    }`}
                    onClick={() => setShowAchievement(achievement)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{achievement.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getLevelColor(achievement.level)}`}
                          >
                            {achievement.level}
                          </Badge>
                          {achievement.unlocked && (
                            <Badge variant="default" className="text-xs">
                              ✓ Desbloqueada
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="space-y-1">
                          <Progress 
                            value={Math.min((achievement.current / achievement.target) * 100, 100)} 
                            className="h-1.5"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{achievement.current.toFixed(0)} {achievement.unit}</span>
                            <span>{achievement.target} {achievement.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {achievements.length > 5 && (
              <button
                className="w-full py-2 text-sm text-primary hover:underline"
                onClick={() => {
                  // Aqui você poderia abrir um modal com todas as conquistas
                  toast.info('Ver todas as conquistas em breve!');
                }}
              >
                Ver todas as {achievements.length} conquistas →
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Conquista */}
      <Dialog open={!!showAchievement} onOpenChange={() => setShowAchievement(null)}>
        <DialogContent>
          {showAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    showAchievement.unlocked ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    {showAchievement.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {showAchievement.title}
                      <Badge 
                        variant="secondary" 
                        className={getLevelColor(showAchievement.level)}
                      >
                        {showAchievement.level}
                      </Badge>
                    </div>
                    {showAchievement.unlocked && showAchievement.unlockedAt && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Desbloqueada em {new Date(showAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription className="space-y-4 mt-4">
                  <p>{showAchievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-semibold">
                        {showAchievement.current.toFixed(0)} / {showAchievement.target} {showAchievement.unit}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((showAchievement.current / showAchievement.target) * 100, 100)} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span>Categoria:</span>
                    <Badge variant="outline" className="gap-1">
                      {getCategoryIcon(showAchievement.category)}
                      {showAchievement.category}
                    </Badge>
                  </div>

                  {!showAchievement.unlocked && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <strong>Como desbloquear:</strong>
                      <p className="mt-1">
                        {showAchievement.category === 'recycling' && 'Continue reciclando materiais para atingir a meta.'}
                        {showAchievement.category === 'water' && 'Reduza o consumo de água em relação aos meses anteriores.'}
                        {showAchievement.category === 'energy' && 'Diminua o consumo de energia para atingir a meta de redução.'}
                        {showAchievement.category === 'general' && 'Continue participando ativamente do programa.'}
                      </p>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}