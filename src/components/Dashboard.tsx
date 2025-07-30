import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Leaf, Droplets, Zap, Recycle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EcoHeader from './EcoHeader';
import RecyclingCalculator from './RecyclingCalculator';
import WaterEnergyTracker from './WaterEnergyTracker';
import RecyclingChart from './RecyclingChart';
import ConsumptionChart from './ConsumptionChart';

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
  const { toast } = useToast();
  
  // State for each school
  const [elviraData, setElviraData] = useState({
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });
  
  const [oswaldData, setOswaldData] = useState({
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });
  
  const [piagetData, setPiagetData] = useState({
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });

  const [activeSchool, setActiveSchool] = useState<'elvira' | 'oswald' | 'piaget'>('elvira');

  const getCurrentSchoolData = () => {
    switch (activeSchool) {
      case 'elvira': return elviraData;
      case 'oswald': return oswaldData;
      case 'piaget': return piagetData;
    }
  };

  const updateSchoolData = (schoolData: any) => {
    switch (activeSchool) {
      case 'elvira': setElviraData(schoolData); break;
      case 'oswald': setOswaldData(schoolData); break;
      case 'piaget': setPiagetData(schoolData); break;
    }
  };

  const handleRecyclingUpdate = (entries: RecyclingEntry[]) => {
    const currentData = getCurrentSchoolData();
    updateSchoolData({
      ...currentData,
      recyclingEntries: entries
    });
  };

  const handleConsumptionUpdate = (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => {
    const currentData = getCurrentSchoolData();
    updateSchoolData({
      ...currentData,
      consumptionEntries: entries,
      consumptionGoals: goals
    });
  };

  const resetAllCalculations = () => {
    setElviraData({ recyclingEntries: [], consumptionEntries: [], consumptionGoals: [] });
    setOswaldData({ recyclingEntries: [], consumptionEntries: [], consumptionGoals: [] });
    setPiagetData({ recyclingEntries: [], consumptionEntries: [], consumptionGoals: [] });
    toast({
      title: "Cálculos reiniciados",
      description: "Todos os dados foram zerados para todas as escolas.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <EcoHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Reset Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Controle por Escola</h2>
            <p className="text-muted-foreground">Selecione uma escola para visualizar seus dados</p>
          </div>
          <Button 
            onClick={resetAllCalculations}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar Cálculo
          </Button>
        </div>

        {/* School Tabs */}
        <Tabs value={activeSchool} onValueChange={(value) => setActiveSchool(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="elvira">Elvira Brandão</TabsTrigger>
            <TabsTrigger value="oswald">Oswald</TabsTrigger>
            <TabsTrigger value="piaget">Piaget</TabsTrigger>
          </TabsList>

          <TabsContent value="elvira">
            <SchoolDashboard 
              schoolName="Elvira Brandão"
              data={elviraData}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
            />
          </TabsContent>

          <TabsContent value="oswald">
            <SchoolDashboard 
              schoolName="Oswald"
              data={oswaldData}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
            />
          </TabsContent>

          <TabsContent value="piaget">
            <SchoolDashboard 
              schoolName="Piaget"
              data={piagetData}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface SchoolDashboardProps {
  schoolName: string;
  data: {
    recyclingEntries: RecyclingEntry[];
    consumptionEntries: ConsumptionEntry[];
    consumptionGoals: ConsumptionGoal[];
  };
  onRecyclingUpdate: (entries: RecyclingEntry[]) => void;
  onConsumptionUpdate: (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => void;
}

function SchoolDashboard({ schoolName, data, onRecyclingUpdate, onConsumptionUpdate }: SchoolDashboardProps) {
  const totalCO2Saved = data.recyclingEntries.reduce((total, entry) => total + entry.co2Saved, 0);
  const totalRecycled = data.recyclingEntries.reduce((total, entry) => total + entry.quantity, 0);
  
  const lastWaterConsumption = data.consumptionEntries
    .filter(entry => entry.type === 'water')
    .slice(-1)[0]?.consumption || 0;
    
  const lastEnergyConsumption = data.consumptionEntries
    .filter(entry => entry.type === 'energy')
    .slice(-1)[0]?.consumption || 0;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">{schoolName}</h3>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalCO2Saved.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO2 evitado</p>
              </div>
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{lastWaterConsumption.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">L água/mês</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{lastEnergyConsumption}</p>
                <p className="text-xs text-muted-foreground">kWh energia/mês</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalRecycled.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg reciclados</p>
              </div>
              <Recycle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="consumption">Consumo</TabsTrigger>
          <TabsTrigger value="recycling-charts">Gráfico Reciclagem</TabsTrigger>
          <TabsTrigger value="consumption-charts">Gráfico Consumo</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <RecyclingCalculator onEntriesUpdate={onRecyclingUpdate} />
        </TabsContent>

        <TabsContent value="consumption">
          <WaterEnergyTracker onDataUpdate={onConsumptionUpdate} />
        </TabsContent>

        <TabsContent value="recycling-charts">
          <RecyclingChart entries={data.recyclingEntries} />
        </TabsContent>

        <TabsContent value="consumption-charts">
          <ConsumptionChart 
            entries={data.consumptionEntries} 
            goals={data.consumptionGoals} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}