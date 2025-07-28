import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Zap, Target, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConsumptionEntry {
  id: string;
  type: 'water' | 'energy';
  month: string;
  cost: number;
  consumption: number; // litros para água, kWh para energia
  date: string;
}

interface ConsumptionGoal {
  type: 'water' | 'energy';
  reductionPercentage: number;
}

interface WaterEnergyTrackerProps {
  onDataUpdate: (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => void;
}

export default function WaterEnergyTracker({ onDataUpdate }: WaterEnergyTrackerProps) {
  const [entries, setEntries] = useState<ConsumptionEntry[]>([]);
  const [goals, setGoals] = useState<ConsumptionGoal[]>([
    { type: 'water', reductionPercentage: 0 },
    { type: 'energy', reductionPercentage: 0 }
  ]);
  
  // Formulário de água
  const [waterCost, setWaterCost] = useState('');
  const [waterConsumption, setWaterConsumption] = useState('');
  const [waterMonth, setWaterMonth] = useState('');
  const [waterReduction, setWaterReduction] = useState('');
  
  // Formulário de energia
  const [energyCost, setEnergyCost] = useState('');
  const [energyConsumption, setEnergyConsumption] = useState('');
  const [energyMonth, setEnergyMonth] = useState('');
  const [energyReduction, setEnergyReduction] = useState('');
  
  const { toast } = useToast();

  const addWaterEntry = () => {
    if (!waterCost || !waterConsumption || !waterMonth) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos de água.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: ConsumptionEntry = {
      id: Date.now().toString(),
      type: 'water',
      month: waterMonth,
      cost: parseFloat(waterCost),
      consumption: parseFloat(waterConsumption),
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    // Atualizar meta se informada
    if (waterReduction) {
      const updatedGoals = goals.map(goal => 
        goal.type === 'water' 
          ? { ...goal, reductionPercentage: parseFloat(waterReduction) }
          : goal
      );
      setGoals(updatedGoals);
      onDataUpdate(updatedEntries, updatedGoals);
    } else {
      onDataUpdate(updatedEntries, goals);
    }

    setWaterCost('');
    setWaterConsumption('');
    setWaterMonth('');
    
    toast({
      title: "Consumo de água registrado!",
      description: `${waterConsumption}L adicionados para ${waterMonth}`,
    });
  };

  const addEnergyEntry = () => {
    if (!energyCost || !energyConsumption || !energyMonth) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos de energia.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: ConsumptionEntry = {
      id: Date.now().toString(),
      type: 'energy',
      month: energyMonth,
      cost: parseFloat(energyCost),
      consumption: parseFloat(energyConsumption),
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    // Atualizar meta se informada
    if (energyReduction) {
      const updatedGoals = goals.map(goal => 
        goal.type === 'energy' 
          ? { ...goal, reductionPercentage: parseFloat(energyReduction) }
          : goal
      );
      setGoals(updatedGoals);
      onDataUpdate(updatedEntries, updatedGoals);
    } else {
      onDataUpdate(updatedEntries, goals);
    }

    setEnergyCost('');
    setEnergyConsumption('');
    setEnergyMonth('');
    
    toast({
      title: "Consumo de energia registrado!",
      description: `${energyConsumption} kWh adicionados para ${energyMonth}`,
    });
  };

  const updateGoal = (type: 'water' | 'energy', percentage: string) => {
    if (!percentage || parseFloat(percentage) < 0) return;

    const updatedGoals = goals.map(goal => 
      goal.type === type 
        ? { ...goal, reductionPercentage: parseFloat(percentage) }
        : goal
    );
    setGoals(updatedGoals);
    onDataUpdate(entries, updatedGoals);
    
    toast({
      title: "Meta atualizada!",
      description: `Meta de redução de ${type === 'water' ? 'água' : 'energia'}: ${percentage}%`,
    });
  };

  const waterEntries = entries.filter(e => e.type === 'water');
  const energyEntries = entries.filter(e => e.type === 'energy');
  const waterGoal = goals.find(g => g.type === 'water');
  const energyGoal = goals.find(g => g.type === 'energy');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="border-0 shadow-eco">
        <CardHeader className="text-center">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-primary">Controle de Consumo</CardTitle>
          <CardDescription>
            Monitore seu consumo de água e energia e defina metas de redução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="water" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="water" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Água
              </TabsTrigger>
              <TabsTrigger value="energy" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="water" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="water-month">Mês/Ano</Label>
                  <Input
                    id="water-month"
                    value={waterMonth}
                    onChange={(e) => setWaterMonth(e.target.value)}
                    placeholder="Ex: 01/2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water-cost">Custo (R$)</Label>
                  <Input
                    id="water-cost"
                    type="number"
                    step="0.01"
                    value={waterCost}
                    onChange={(e) => setWaterCost(e.target.value)}
                    placeholder="Ex: 85.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water-consumption">Consumo (Litros)</Label>
                  <Input
                    id="water-consumption"
                    type="number"
                    value={waterConsumption}
                    onChange={(e) => setWaterConsumption(e.target.value)}
                    placeholder="Ex: 15000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="water-reduction">Meta de Redução (%)</Label>
                <Input
                  id="water-reduction"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={waterReduction}
                  onChange={(e) => setWaterReduction(e.target.value)}
                  placeholder="Ex: 20"
                />
              </div>

              <Button onClick={addWaterEntry} className="w-full bg-blue-500 hover:bg-blue-600">
                <Droplets className="w-4 h-4 mr-2" />
                Registrar Consumo de Água
              </Button>

              {waterGoal && waterGoal.reductionPercentage > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Meta Atual: {waterGoal.reductionPercentage}% de redução</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="energy" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="energy-month">Mês/Ano</Label>
                  <Input
                    id="energy-month"
                    value={energyMonth}
                    onChange={(e) => setEnergyMonth(e.target.value)}
                    placeholder="Ex: 01/2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="energy-cost">Custo (R$)</Label>
                  <Input
                    id="energy-cost"
                    type="number"
                    step="0.01"
                    value={energyCost}
                    onChange={(e) => setEnergyCost(e.target.value)}
                    placeholder="Ex: 125.80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="energy-consumption">Consumo (kWh)</Label>
                  <Input
                    id="energy-consumption"
                    type="number"
                    step="0.1"
                    value={energyConsumption}
                    onChange={(e) => setEnergyConsumption(e.target.value)}
                    placeholder="Ex: 250.5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="energy-reduction">Meta de Redução (%)</Label>
                <Input
                  id="energy-reduction"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={energyReduction}
                  onChange={(e) => setEnergyReduction(e.target.value)}
                  placeholder="Ex: 15"
                />
              </div>

              <Button onClick={addEnergyEntry} className="w-full bg-yellow-500 hover:bg-yellow-600">
                <Zap className="w-4 h-4 mr-2" />
                Registrar Consumo de Energia
              </Button>

              {energyGoal && energyGoal.reductionPercentage > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Meta Atual: {energyGoal.reductionPercentage}% de redução</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resumo rápido */}
      {(waterEntries.length > 0 || energyEntries.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {waterEntries.length > 0 && (
            <Card className="border-0 shadow-soft bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Droplets className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Último consumo de água</p>
                  <p className="text-2xl font-bold text-blue-600">{waterEntries[0].consumption.toLocaleString()} L</p>
                  <p className="text-sm text-muted-foreground">R$ {waterEntries[0].cost.toFixed(2)} • {waterEntries[0].month}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {energyEntries.length > 0 && (
            <Card className="border-0 shadow-soft bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Último consumo de energia</p>
                  <p className="text-2xl font-bold text-yellow-600">{energyEntries[0].consumption} kWh</p>
                  <p className="text-sm text-muted-foreground">R$ {energyEntries[0].cost.toFixed(2)} • {energyEntries[0].month}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}