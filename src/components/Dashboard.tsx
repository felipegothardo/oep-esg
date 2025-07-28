import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Droplets, Zap, BarChart3, Calculator } from 'lucide-react';

import EcoHeader from '@/components/EcoHeader';
import RecyclingCalculator from '@/components/RecyclingCalculator';
import WaterEnergyTracker from '@/components/WaterEnergyTracker';
import RecyclingChart from '@/components/RecyclingChart';
import ConsumptionChart from '@/components/ConsumptionChart';

interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
}

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

export default function Dashboard() {
  const [recyclingEntries, setRecyclingEntries] = useState<RecyclingEntry[]>([]);
  const [consumptionEntries, setConsumptionEntries] = useState<ConsumptionEntry[]>([]);
  const [consumptionGoals, setConsumptionGoals] = useState<ConsumptionGoal[]>([
    { type: 'water', reductionPercentage: 0 },
    { type: 'energy', reductionPercentage: 0 }
  ]);

  // Callback para atualizar dados de reciclagem
  const handleRecyclingUpdate = (entries: RecyclingEntry[]) => {
    setRecyclingEntries(entries);
  };

  // Callback para atualizar dados de consumo
  const handleConsumptionUpdate = (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => {
    setConsumptionEntries(entries);
    setConsumptionGoals(goals);
  };

  // Estatísticas gerais para o overview
  const totalCO2Saved = recyclingEntries.reduce((sum, entry) => sum + entry.co2Saved, 0);
  const totalRecycled = recyclingEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const waterEntries = consumptionEntries.filter(e => e.type === 'water');
  const energyEntries = consumptionEntries.filter(e => e.type === 'energy');
  const lastWaterConsumption = waterEntries[0]?.consumption || 0;
  const lastEnergyConsumption = energyEntries[0]?.consumption || 0;

  return (
    <div className="min-h-screen bg-background">
      <EcoHeader />
      
      <main className="py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-soft bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6 text-center">
                <Leaf className="w-10 h-10 mx-auto text-green-600 mb-3" />
                <p className="text-3xl font-bold text-green-700">{totalCO2Saved.toFixed(1)}</p>
                <p className="text-sm text-green-600 font-medium">kg CO2 evitado</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6 text-center">
                <Droplets className="w-10 h-10 mx-auto text-blue-600 mb-3" />
                <p className="text-3xl font-bold text-blue-700">{lastWaterConsumption.toLocaleString()}</p>
                <p className="text-sm text-blue-600 font-medium">L água/mês</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-soft bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="pt-6 text-center">
                <Zap className="w-10 h-10 mx-auto text-yellow-600 mb-3" />
                <p className="text-3xl font-bold text-yellow-700">{lastEnergyConsumption}</p>
                <p className="text-sm text-yellow-600 font-medium">kWh energia/mês</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-soft bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="pt-6 text-center">
                <BarChart3 className="w-10 h-10 mx-auto text-purple-600 mb-3" />
                <p className="text-3xl font-bold text-purple-700">{totalRecycled.toFixed(1)}</p>
                <p className="text-sm text-purple-600 font-medium">kg reciclados</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs principais */}
          <Tabs defaultValue="calculator" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Calculadora</span>
              </TabsTrigger>
              <TabsTrigger value="consumption" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                <span className="hidden sm:inline">Consumo</span>
              </TabsTrigger>
              <TabsTrigger value="recycling-charts" className="flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                <span className="hidden sm:inline">Reciclagem</span>
              </TabsTrigger>
              <TabsTrigger value="consumption-charts" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Gráficos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    Calculadora de CO2
                  </CardTitle>
                  <CardDescription>
                    Registre suas reciclagens e calcule o impacto ambiental
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecyclingCalculator onEntriesUpdate={handleRecyclingUpdate} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consumption" className="space-y-6">
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Droplets className="w-6 h-6" />
                    Controle de Consumo
                  </CardTitle>
                  <CardDescription>
                    Monitore água e energia, defina metas de redução
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WaterEnergyTracker onDataUpdate={handleConsumptionUpdate} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recycling-charts" className="space-y-6">
              <RecyclingChart entries={recyclingEntries} />
            </TabsContent>

            <TabsContent value="consumption-charts" className="space-y-6">
              <ConsumptionChart entries={consumptionEntries} goals={consumptionGoals} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}