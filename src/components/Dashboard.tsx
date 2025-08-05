import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Leaf, Droplets, Zap, Recycle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import EcoHeader from './EcoHeader';
import RecyclingCalculator from './RecyclingCalculator';
import WaterEnergyTracker from './WaterEnergyTracker';
import RecyclingChart from './RecyclingChart';
import ConsumptionChart from './ConsumptionChart';
import DeleteRecordsDialog from './DeleteRecordsDialog';
import ConsolidatedDashboard from './ConsolidatedDashboard';
import GoalProgressCard from './GoalProgressCard';
import ProjectionCard from './ProjectionCard';
import ExportButton from './ExportButton';
import MobileMenu from './MobileMenu';
import MobileStats from './MobileStats';
import PWAInstallPrompt from './PWAInstallPrompt';

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
  
  
  // State for each school with localStorage persistence
  const [elviraData, setElviraData] = useLocalStorage('oep-elvira-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });
  
  const [oswaldData, setOswaldData] = useLocalStorage('oep-oswald-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });
  
  const [piagetData, setPiagetData] = useLocalStorage('oep-piaget-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });

  const [activeSchool, setActiveSchool] = useLocalStorage<'elvira' | 'oswald' | 'piaget' | 'consolidated'>('oep-active-tab', 'consolidated');

  const getCurrentSchoolData = () => {
    if (activeSchool === 'consolidated') return elviraData; // fallback
    switch (activeSchool) {
      case 'elvira': return elviraData;
      case 'oswald': return oswaldData;
      case 'piaget': return piagetData;
      default: return elviraData;
    }
  };

  const updateSchoolData = (schoolData: any) => {
    if (activeSchool === 'consolidated') return;
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

  const deleteAllRecords = () => {
    const currentData = getCurrentSchoolData();
    updateSchoolData({ 
      recyclingEntries: [], 
      consumptionEntries: [], 
      consumptionGoals: currentData.consumptionGoals 
    });
  };

  const deleteRecyclingByMonth = (month: string) => {
    const currentData = getCurrentSchoolData();
    const filteredEntries = currentData.recyclingEntries.filter(entry => entry.date !== month);
    updateSchoolData({
      ...currentData,
      recyclingEntries: filteredEntries
    });
  };

  const deleteConsumptionByMonth = (type: 'water' | 'energy', month: string) => {
    const currentData = getCurrentSchoolData();
    const filteredEntries = currentData.consumptionEntries.filter(
      entry => !(entry.type === type && entry.month === month)
    );
    updateSchoolData({
      ...currentData,
      consumptionEntries: filteredEntries
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <EcoHeader />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Header with Reset Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Controle por Escola</h2>
            <p className="text-sm md:text-base text-muted-foreground">Selecione uma escola para visualizar seus dados</p>
          </div>
          <DeleteRecordsDialog 
            recyclingEntries={getCurrentSchoolData().recyclingEntries}
            consumptionEntries={getCurrentSchoolData().consumptionEntries}
            onDeleteAll={deleteAllRecords}
            onDeleteRecyclingByMonth={deleteRecyclingByMonth}
            onDeleteConsumptionByMonth={deleteConsumptionByMonth}
          />
        </div>

        {/* School Tabs */}
        <Tabs value={activeSchool} onValueChange={(value) => setActiveSchool(value as any)} className="mb-4 md:mb-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="consolidated" className="text-xs md:text-sm p-2 md:p-3">Visão Geral</TabsTrigger>
            <TabsTrigger value="elvira" className="text-xs md:text-sm p-2 md:p-3">Elvira Brandão</TabsTrigger>
            <TabsTrigger value="oswald" className="text-xs md:text-sm p-2 md:p-3">Oswald</TabsTrigger>
            <TabsTrigger value="piaget" className="text-xs md:text-sm p-2 md:p-3">Piaget</TabsTrigger>
          </TabsList>

          <TabsContent value="consolidated">
            <ConsolidatedDashboard 
              elviraData={elviraData}
              oswaldData={oswaldData}
              piagetData={piagetData}
            />
          </TabsContent>

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
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
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
  const [currentMobileTab, setCurrentMobileTab] = useState('calculator');
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">{schoolName}</h3>
        <ExportButton 
          schoolName={schoolName}
          recyclingEntries={data.recyclingEntries}
          consumptionEntries={data.consumptionEntries}
        />
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
              <div className="text-center md:text-left">
                <p className="text-lg md:text-2xl font-bold">{totalCO2Saved.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO2 evitado</p>
              </div>
              <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
              <div className="text-center md:text-left">
                <p className="text-lg md:text-2xl font-bold">{lastWaterConsumption.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">L água/mês</p>
              </div>
              <Droplets className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
              <div className="text-center md:text-left">
                <p className="text-lg md:text-2xl font-bold">{lastEnergyConsumption}</p>
                <p className="text-xs text-muted-foreground">kWh energia/mês</p>
              </div>
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
              <div className="text-center md:text-left">
                <p className="text-lg md:text-2xl font-bold">{totalRecycled.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg reciclados</p>
              </div>
              <Recycle className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Stats */}
      <MobileStats
        totalCO2={totalCO2Saved}
        totalRecycled={totalRecycled}
        waterConsumption={lastWaterConsumption}
        energyConsumption={lastEnergyConsumption}
        schoolName={schoolName}
      />

      {/* Main Content Tabs */}
      <Tabs value={currentMobileTab} onValueChange={setCurrentMobileTab} defaultValue="calculator" className="space-y-4 md:space-y-6 pb-20 md:pb-0">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="calculator" className="text-xs md:text-sm p-2 md:p-3">📱 Calculadora</TabsTrigger>
          <TabsTrigger value="consumption" className="text-xs md:text-sm p-2 md:p-3">💧 Consumo</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs md:text-sm p-2 md:p-3">🎯 Metas</TabsTrigger>
          <TabsTrigger value="recycling-charts" className="text-xs md:text-sm p-2 md:p-3">♻️ Reciclagem</TabsTrigger>
          <TabsTrigger value="consumption-charts" className="text-xs md:text-sm p-2 md:p-3">⚡ Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <RecyclingCalculator onEntriesUpdate={onRecyclingUpdate} />
        </TabsContent>

        <TabsContent value="consumption">
          <WaterEnergyTracker onDataUpdate={onConsumptionUpdate} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoalProgressCard 
              entries={data.consumptionEntries} 
              goals={data.consumptionGoals} 
              type="water" 
            />
            <GoalProgressCard 
              entries={data.consumptionEntries} 
              goals={data.consumptionGoals} 
              type="energy" 
            />
          </div>
          <ProjectionCard entries={data.recyclingEntries} schoolName={schoolName} />
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

      {/* Mobile Navigation */}
      <MobileMenu
        currentTab={currentMobileTab}
        onTabChange={setCurrentMobileTab}
        onExport={() => {
          // Trigger export functionality
          console.log('Export triggered for', schoolName);
        }}
      />
    </div>
  );
}