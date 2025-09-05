import { useState, Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Droplets, Zap, Recycle } from 'lucide-react';
import { SchoolData, RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from '@/hooks/useSchoolData';
import ExportButton from './ExportButton';
import MobileStats from './MobileStats';
import LoadingSkeleton from './LoadingSkeleton';
import DeleteRecordsDialog from './DeleteRecordsDialog';

// Lazy load dos componentes pesados
const RecyclingCalculator = lazy(() => import('./RecyclingCalculator'));
const WaterEnergyTracker = lazy(() => import('./WaterEnergyTracker'));
const RecyclingChart = lazy(() => import('./RecyclingChart'));
const ConsumptionChart = lazy(() => import('./ConsumptionChart'));
const GoalProgressCard = lazy(() => import('./GoalProgressCard'));
const ProjectionCard = lazy(() => import('./ProjectionCard'));
const ChatTab = lazy(() => import('./ChatTab'));
const ResourcesTab = lazy(() => import('./ResourcesTab'));

interface SchoolDashboardProps {
  schoolName: string;
  schoolType?: string;
  data: SchoolData;
  onRecyclingUpdate: (entries: RecyclingEntry[]) => void;
  onConsumptionUpdate: (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => void;
  onDeleteAll: () => void;
  onDeleteRecyclingByMonth: (month: string) => void;
  onDeleteConsumptionByMonth: (type: 'water' | 'energy', month: string) => void;
}

export default function SchoolDashboard({ 
  schoolName, 
  schoolType = 'default',
  data, 
  onRecyclingUpdate, 
  onConsumptionUpdate,
  onDeleteAll,
  onDeleteRecyclingByMonth,
  onDeleteConsumptionByMonth
}: SchoolDashboardProps) {
  const [currentMobileTab, setCurrentMobileTab] = useState('calculator');
  
  // Calculando estatísticas
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">
          {schoolName}
        </h3>
        <div className="flex gap-2">
          <DeleteRecordsDialog 
            schoolName={schoolName}
            recyclingEntries={data.recyclingEntries}
            consumptionEntries={data.consumptionEntries}
            onDeleteAll={onDeleteAll}
            onDeleteRecyclingByMonth={onDeleteRecyclingByMonth}
            onDeleteConsumptionByMonth={onDeleteConsumptionByMonth}
          />
          <ExportButton 
            schoolName={schoolName}
            recyclingEntries={data.recyclingEntries}
            consumptionEntries={data.consumptionEntries}
          />
        </div>
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
              <Leaf className="h-6 w-6 md:h-8 md:w-8 text-success" aria-hidden="true" />
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
              <Droplets className="h-6 w-6 md:h-8 md:w-8 text-blue" aria-hidden="true" />
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
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" aria-hidden="true" />
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
              <Recycle className="h-6 w-6 md:h-8 md:w-8 text-purple" aria-hidden="true" />
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
      <Tabs 
        value={currentMobileTab} 
        onValueChange={setCurrentMobileTab} 
        defaultValue="calculator" 
        className="space-y-4 md:space-y-6 pb-20 md:pb-0"
      >
        <TabsList 
          className="grid w-full grid-cols-2 md:grid-cols-7 h-auto gap-1"
          role="tablist"
          aria-label="Seções do dashboard"
        >
          <TabsTrigger 
            value="calculator" 
            className="text-xs md:text-sm p-2 md:p-3"
            aria-label="Calculadora de reciclagem"
          >
            📱 Calculadora
          </TabsTrigger>
          <TabsTrigger 
            value="consumption" 
            className="text-xs md:text-sm p-2 md:p-3"
            aria-label="Controle de consumo"
          >
            💧 Consumo
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            className="text-xs md:text-sm p-2 md:p-3"
            aria-label="Metas e projeções"
          >
            🎯 Metas
          </TabsTrigger>
          <TabsTrigger 
            value="recycling-charts" 
            className="text-xs md:text-sm p-2 md:p-3"
            aria-label="Gráficos de reciclagem"
          >
            ♻️ Reciclagem
          </TabsTrigger>
          <TabsTrigger 
            value="consumption-charts" 
            className="text-xs md:text-sm p-2 md:p-3"
            aria-label="Gráficos de consumo"
          >
            ⚡ Gráficos
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="text-xs md:text-sm p-2 md:p-3"
            aria-label="Chat da comunidade"
          >
            💬 Chat
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="text-xs md:text-sm p-2 md:p-3"
            aria-label="Links e dicas úteis"
          >
            🔗 Links & Dicas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton type="form" />}>
            <div className="recycling-section">
              <RecyclingCalculator 
                onEntriesUpdate={onRecyclingUpdate} 
                schoolType={schoolType}
              />
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="consumption" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton type="form" />}>
            <div className="consumption-section">
              <WaterEnergyTracker 
                onDataUpdate={onConsumptionUpdate}
                existingEntries={data.consumptionEntries}
                existingGoals={data.consumptionGoals}
              />
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<LoadingSkeleton type="chart" />}>
              <GoalProgressCard 
                entries={data.consumptionEntries} 
                goals={data.consumptionGoals} 
                type="water" 
              />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton type="chart" />}>
              <GoalProgressCard 
                entries={data.consumptionEntries} 
                goals={data.consumptionGoals} 
                type="energy" 
              />
            </Suspense>
          </div>
          <Suspense fallback={<LoadingSkeleton type="chart" />}>
            <ProjectionCard entries={data.recyclingEntries} schoolName={schoolName} />
          </Suspense>
        </TabsContent>

        <TabsContent value="recycling-charts" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton type="chart" />}>
            <RecyclingChart entries={data.recyclingEntries} />
          </Suspense>
        </TabsContent>

        <TabsContent value="consumption-charts" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton type="chart" />}>
            <ConsumptionChart 
              entries={data.consumptionEntries} 
              goals={data.consumptionGoals} 
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="chat" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton type="form" />}>
            <ChatTab defaultSchool={schoolName} />
          </Suspense>
        </TabsContent>

        <TabsContent value="resources" className="animate-fade-in">
          <Suspense fallback={<LoadingSkeleton type="list" />}>
            <ResourcesTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}