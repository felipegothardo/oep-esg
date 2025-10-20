import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Droplets, Zap, Recycle } from 'lucide-react';
import { SchoolData, RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from '@/hooks/useSchoolData';
import ExportButton from './ExportButton';
import MobileStats from './MobileStats';
import { DeleteRecordsDialog } from './DeleteRecordsDialog';
import { useActionHistory } from '@/hooks/useActionHistory';
import RecyclingCalculator from './RecyclingCalculator';
import WaterEnergyTracker from './WaterEnergyTracker';
import RecyclingChart from './RecyclingChart';
import ConsumptionChart from './ConsumptionChart';
import GoalProgressCard from './GoalProgressCard';
import ProjectionCard from './ProjectionCard';
import ChatTab from './ChatTab';
import ResourcesTab from './ResourcesTab';
import SmartGoalSuggestion from './SmartGoalSuggestion';
import AchievementSystem from './AchievementSystem';
import ContextualTips from './ContextualTips';
import ActionHistory from './ActionHistory';
import calculatorIcon from '@/assets/calculator-icon.png';

interface SchoolDashboardProps {
  schoolName: string;
  schoolType?: string;
  data: SchoolData;
  onRecyclingUpdate: (entries: RecyclingEntry[]) => void;
  onConsumptionUpdate: (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => void;
  onDeleteAll: () => void;
  onDeleteRecyclingByMonth: (month: string) => void;
  onDeleteConsumptionByMonth: (type: 'water' | 'energy', month: string) => void;
  viewOnly?: boolean;
}

export default function SchoolDashboard({ 
  schoolName, 
  schoolType = 'default',
  data, 
  onRecyclingUpdate, 
  onConsumptionUpdate,
  onDeleteAll,
  onDeleteRecyclingByMonth,
  onDeleteConsumptionByMonth,
  viewOnly = false
}: SchoolDashboardProps) {
  const [currentMobileTab, setCurrentMobileTab] = useState('calculator');
  
  // Ensure data is always valid arrays
  const safeData = {
    recyclingEntries: data?.recyclingEntries || [],
    consumptionEntries: data?.consumptionEntries || [],
    consumptionGoals: data?.consumptionGoals || []
  };
  
  // Sempre chamar os hooks (regra do React - hooks não podem ser condicionais)
  const actionHistory = useActionHistory();
  
  // Usar valores do hook ou valores vazios baseado em viewOnly
  const { history, addToHistory, clearHistory, undoLastAction, hasHistory } = viewOnly 
    ? { history: [], addToHistory: () => {}, clearHistory: () => {}, undoLastAction: () => {}, hasHistory: false }
    : actionHistory;
  
  // Wrapper para adicionar ações ao histórico
  const handleRecyclingUpdate = (entries: RecyclingEntry[]) => {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      addToHistory({
        type: 'add',
        category: 'recycling',
        description: `Reciclou ${lastEntry.quantity}kg de ${lastEntry.material}`,
        data: lastEntry,
        schoolName
      });
    }
    onRecyclingUpdate(entries);
  };
  
  const handleConsumptionUpdate = (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      addToHistory({
        type: 'add',
        category: 'consumption',
        description: `Registrou consumo de ${lastEntry.type === 'water' ? 'água' : 'energia'}: R$ ${lastEntry.cost}`,
        data: lastEntry,
        schoolName
      });
    }
    onConsumptionUpdate(entries, goals);
  };
  
  // Calculando estatísticas com dados seguros
  const totalCO2Saved = safeData.recyclingEntries.reduce((total, entry) => total + entry.co2Saved, 0);
  const totalRecycled = safeData.recyclingEntries.reduce((total, entry) => total + entry.quantity, 0);
  
  const lastWaterConsumption = safeData.consumptionEntries
    .filter(entry => entry.type === 'water')
    .slice(-1)[0]?.consumption || 0;
    
  const lastEnergyConsumption = safeData.consumptionEntries
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
          <ExportButton 
            schoolName={schoolName}
            recyclingEntries={safeData.recyclingEntries}
            consumptionEntries={safeData.consumptionEntries}
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
        className="space-y-6 pb-20 md:pb-0"
      >
        <TabsList 
          className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 h-auto p-2 bg-muted/30 rounded-lg"
          role="tablist"
          aria-label="Seções do dashboard"
        >
          <TabsTrigger 
            value="calculator" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Calculadora de reciclagem"
          >
            <img src={calculatorIcon} alt="Calculadora" className="w-6 h-6" />
            <span className="text-xs">Calculadora</span>
          </TabsTrigger>
          <TabsTrigger 
            value="consumption" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-blue data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Controle de consumo"
          >
            <span className="text-xl">💧</span>
            <span className="text-xs">Consumo</span>
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-accent data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Metas e projeções"
          >
            <span className="text-xl">🎯</span>
            <span className="text-xs">Metas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="recycling-charts" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-success data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Gráficos de reciclagem"
          >
            <span className="text-xl">♻️</span>
            <span className="text-xs">Reciclagem</span>
          </TabsTrigger>
          <TabsTrigger 
            value="consumption-charts" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Gráficos de consumo"
          >
            <span className="text-xl">📊</span>
            <span className="text-xs">Gráficos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-accent data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Conquistas"
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs">Conquistas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-purple data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Histórico"
          >
            <span className="text-xl">📚</span>
            <span className="text-xs">Histórico</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-blue data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Chat da comunidade"
          >
            <span className="text-xl">💬</span>
            <span className="text-xs">Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="flex flex-col items-center gap-2 p-3 h-auto rounded-md transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-success data-[state=active]:shadow-sm font-medium hover:bg-card/50"
            aria-label="Links e dicas úteis"
          >
            <span className="text-xl">🔗</span>
            <span className="text-xs">Links & Dicas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="animate-fade-in">
          <div className="recycling-section space-y-4">
            {!viewOnly && (
              <ContextualTips 
                recyclingTotal={totalRecycled}
                co2Total={totalCO2Saved}
                waterConsumption={lastWaterConsumption}
                energyConsumption={lastEnergyConsumption}
                hasRecyclingData={safeData.recyclingEntries.length > 0}
                hasConsumptionData={safeData.consumptionEntries.length > 0}
                schoolName={schoolName}
                onTabChange={setCurrentMobileTab}
              />
            )}
            {viewOnly ? (
              <RecyclingChart 
                entries={safeData.recyclingEntries}
              />
            ) : (
              <RecyclingCalculator
                onEntriesUpdate={handleRecyclingUpdate} 
                schoolType={schoolType}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="consumption" className="animate-fade-in">
          <div className="consumption-section space-y-4">
            {!viewOnly && (
              <ContextualTips 
                recyclingTotal={totalRecycled}
                co2Total={totalCO2Saved}
                waterConsumption={lastWaterConsumption}
                energyConsumption={lastEnergyConsumption}
                hasRecyclingData={safeData.recyclingEntries.length > 0}
                hasConsumptionData={safeData.consumptionEntries.length > 0}
                schoolName={schoolName}
                onTabChange={setCurrentMobileTab}
              />
            )}
            {viewOnly ? (
              <ConsumptionChart 
                entries={safeData.consumptionEntries}
                goals={safeData.consumptionGoals}
              />
            ) : (
              <WaterEnergyTracker
                onDataUpdate={handleConsumptionUpdate}
                existingEntries={safeData.consumptionEntries}
                existingGoals={safeData.consumptionGoals}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6 animate-fade-in">
          <SmartGoalSuggestion 
            recyclingEntries={safeData.recyclingEntries}
            consumptionEntries={safeData.consumptionEntries}
            currentGoals={safeData.consumptionGoals}
            onUpdateGoal={(type, percentage) => {
              const updatedGoals = safeData.consumptionGoals.map(goal => 
                goal.type === type 
                  ? { ...goal, reductionPercentage: percentage }
                  : goal
              );
              handleConsumptionUpdate(safeData.consumptionEntries, updatedGoals);
            }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoalProgressCard 
              entries={safeData.consumptionEntries} 
              goals={safeData.consumptionGoals} 
              type="water" 
            />
            <GoalProgressCard 
              entries={safeData.consumptionEntries} 
              goals={safeData.consumptionGoals} 
              type="energy" 
            />
          </div>
          <ProjectionCard entries={safeData.recyclingEntries} schoolName={schoolName} />
        </TabsContent>

        <TabsContent value="recycling-charts" className="animate-fade-in">
          <RecyclingChart entries={safeData.recyclingEntries} />
        </TabsContent>

        <TabsContent value="consumption-charts" className="animate-fade-in">
          <ConsumptionChart 
            entries={safeData.consumptionEntries} 
            goals={safeData.consumptionGoals} 
          />
        </TabsContent>

        <TabsContent value="achievements" className="animate-fade-in">
          <AchievementSystem 
            recyclingTotal={totalRecycled}
            co2Total={totalCO2Saved}
            waterReduction={safeData.consumptionGoals.find(g => g.type === 'water')?.reductionPercentage || 0}
            energyReduction={safeData.consumptionGoals.find(g => g.type === 'energy')?.reductionPercentage || 0}
            monthsActive={Math.max(safeData.recyclingEntries.length, safeData.consumptionEntries.length) > 0 ? 1 : 0}
            schoolName={schoolName}
          />
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in">
          <ActionHistory 
            history={history}
            onUndo={undoLastAction}
            onClear={clearHistory}
            hasHistory={hasHistory}
          />
        </TabsContent>

        <TabsContent value="chat" className="animate-fade-in">
          <ChatTab defaultSchool={schoolName} />
        </TabsContent>

        <TabsContent value="resources" className="animate-fade-in">
          <ResourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}