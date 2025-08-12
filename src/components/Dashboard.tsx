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
import ConversionReferences from './ConversionReferences';
import ChatTab from './ChatTab';
import ResourcesTab from './ResourcesTab';

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

  const [santoAntonioData, setSantoAntonioData] = useLocalStorage('oep-santo-antonio-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });

  const [activeSchool, setActiveSchool] = useLocalStorage<'elvira' | 'oswald' | 'piaget' | 'santo-antonio' | 'consolidated'>('oep-active-tab', 'consolidated');

  const getCurrentSchoolData = () => {
    if (activeSchool === 'consolidated') return elviraData; // fallback
    switch (activeSchool) {
      case 'elvira': return elviraData;
      case 'oswald': return oswaldData;
      case 'piaget': return piagetData;
      case 'santo-antonio': return santoAntonioData;
      default: return elviraData;
    }
  };

  const updateSchoolData = (schoolData: any) => {
    if (activeSchool === 'consolidated') return;
    switch (activeSchool) {
      case 'elvira': setElviraData(schoolData); break;
      case 'oswald': setOswaldData(schoolData); break;
      case 'piaget': setPiagetData(schoolData); break;
      case 'santo-antonio': setSantoAntonioData(schoolData); break;
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

        {/* School Selection Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-8">
          <Button
            variant={activeSchool === 'consolidated' ? 'default' : 'outline'}
            onClick={() => setActiveSchool('consolidated')}
            className={`h-12 md:h-14 text-xs md:text-sm font-medium transition-all ${
              activeSchool === 'consolidated'
                ? 'bg-primary text-primary-foreground shadow-eco hover:bg-primary/90'
                : 'bg-card border-2 hover:bg-primary/10 hover:border-primary'
            }`}
          >
            📊 Visão Geral
          </Button>
          
          <Button
            variant={activeSchool === 'elvira' ? 'default' : 'outline'}
            onClick={() => setActiveSchool('elvira')}
            className={`h-12 md:h-14 text-xs md:text-sm font-medium transition-all ${
              activeSchool === 'elvira'
                ? 'bg-gradient-blue text-blue-foreground shadow-soft hover:bg-blue/90'
                : 'bg-card border-2 hover:bg-blue/10 hover:border-blue'
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src="/lovable-uploads/ac7dcf98-b3a9-4b47-965e-df5f24f90dda.png"
                alt="Logo do Colégio Elvira Brandão"
                className="h-5 w-5 md:h-6 md:w-6 rounded-sm object-contain"
                loading="lazy"
              />
              <span>Elvira Brandão</span>
            </div>
          </Button>
          
          <Button
            variant={activeSchool === 'oswald' ? 'default' : 'outline'}
            onClick={() => setActiveSchool('oswald')}
            className={`h-12 md:h-14 text-xs md:text-sm font-medium transition-all ${
              activeSchool === 'oswald'
                ? 'bg-success text-success-foreground shadow-eco hover:bg-success/90'
                : 'bg-card border-2 hover:bg-success/10 hover:border-success'
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src="/lovable-uploads/7c53e382-0889-4b2c-9f93-aeb9475b0f53.png"
                alt="Logo do Colégio Oswald"
                className="h-5 w-5 md:h-6 md:w-6 rounded-sm object-contain"
                loading="lazy"
              />
              <span>Oswald</span>
            </div>
          </Button>
          
          <Button
            variant={activeSchool === 'piaget' ? 'default' : 'outline'}
            onClick={() => setActiveSchool('piaget')}
            className={`h-12 md:h-14 text-xs md:text-sm font-medium transition-all ${
              activeSchool === 'piaget'
                ? 'bg-gradient-ocean text-blue-foreground shadow-soft hover:bg-blue-dark/90'
                : 'bg-card border-2 hover:bg-blue-dark/10 hover:border-blue-dark'
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src="/lovable-uploads/5f155554-a003-48a8-873e-69c765fa77c1.png"
                alt="Logo do Colégio Piaget"
                className="h-5 w-5 md:h-6 md:w-6 rounded-sm object-contain"
                loading="lazy"
              />
              <span>Piaget</span>
            </div>
          </Button>
          
          <Button
            variant={activeSchool === 'santo-antonio' ? 'default' : 'outline'}
            onClick={() => setActiveSchool('santo-antonio')}
            className={`h-12 md:h-14 text-xs md:text-sm font-medium transition-all ${
              activeSchool === 'santo-antonio'
                ? 'bg-purple text-purple-foreground shadow-soft hover:bg-purple/90'
                : 'bg-card border-2 hover:bg-purple/10 hover:border-purple'
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src="/lovable-uploads/15780c7a-3c8b-4d43-a842-9bd423a699c8.png"
                alt="Logo do Colégio Carandá"
                className="h-5 w-5 md:h-6 md:w-6 rounded-sm object-contain"
                loading="lazy"
              />
              <span>Carandá</span>
            </div>
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeSchool === 'consolidated' && (
            <ConsolidatedDashboard 
              elviraData={elviraData}
              oswaldData={oswaldData}
              piagetData={piagetData}
              santoAntonioData={santoAntonioData}
            />
          )}

          {activeSchool === 'elvira' && (
            <SchoolDashboard 
              schoolName="Elvira Brandão"
              data={elviraData}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
            />
          )}

          {activeSchool === 'oswald' && (
            <SchoolDashboard 
              schoolName="Oswald"
              data={oswaldData}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
            />
          )}

          {activeSchool === 'piaget' && (
            <SchoolDashboard 
              schoolName="Piaget"
              data={piagetData}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
            />
          )}

          {activeSchool === 'santo-antonio' && (
            <SchoolDashboard 
              schoolName="Carandá"
              data={santoAntonioData}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
            />
          )}
        </div>
      </div>
      
      <ConversionReferences />
      
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="calculator" className="text-xs md:text-sm p-2 md:p-3">📱 Calculadora</TabsTrigger>
          <TabsTrigger value="consumption" className="text-xs md:text-sm p-2 md:p-3">💧 Consumo</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs md:text-sm p-2 md:p-3">🎯 Metas</TabsTrigger>
          <TabsTrigger value="recycling-charts" className="text-xs md:text-sm p-2 md:p-3">♻️ Reciclagem</TabsTrigger>
          <TabsTrigger value="consumption-charts" className="text-xs md:text-sm p-2 md:p-3">⚡ Gráficos</TabsTrigger>
          <TabsTrigger value="chat" className="text-xs md:text-sm p-2 md:p-3">💬 Chat</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs md:text-sm p-2 md:p-3">🔗 Links & Dicas</TabsTrigger>
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

        <TabsContent value="chat">
          <ChatTab defaultSchool={schoolName} />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesTab />
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