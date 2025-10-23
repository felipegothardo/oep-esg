import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Droplets, Zap, Recycle, Calculator, Target, BarChart3, Trophy, History, MessageSquare, Link } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            {schoolName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Painel de Controle Ambiental</p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            schoolName={schoolName}
            recyclingEntries={safeData.recyclingEntries}
            consumptionEntries={safeData.consumptionEntries}
          />
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="bg-gradient-to-br from-primary/10 via-blue/5 to-success/10 p-6 md:p-8 rounded-2xl border-2 border-primary/30 shadow-xl">
        <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">Métricas Principais</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
                <div className="text-center md:text-left">
                  <p className="text-lg md:text-3xl font-bold text-success">{totalCO2Saved.toFixed(1)}</p>
                  <p className="text-xs font-medium text-muted-foreground">kg CO2 evitado</p>
                </div>
                <Leaf className="h-6 w-6 md:h-10 md:w-10 text-success" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
                <div className="text-center md:text-left">
                  <p className="text-lg md:text-3xl font-bold text-blue">{lastWaterConsumption.toLocaleString()}</p>
                  <p className="text-xs font-medium text-muted-foreground">L água/mês</p>
                </div>
                <Droplets className="h-6 w-6 md:h-10 md:w-10 text-blue" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-600/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
                <div className="text-center md:text-left">
                  <p className="text-lg md:text-3xl font-bold text-yellow-600">{lastEnergyConsumption}</p>
                  <p className="text-xs font-medium text-muted-foreground">kWh energia/mês</p>
                </div>
                <Zap className="h-6 w-6 md:h-10 md:w-10 text-yellow-600" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:justify-between gap-2">
                <div className="text-center md:text-left">
                  <p className="text-lg md:text-3xl font-bold text-purple">{totalRecycled.toFixed(1)}</p>
                  <p className="text-xs font-medium text-muted-foreground">kg reciclados</p>
                </div>
                <Recycle className="h-6 w-6 md:h-10 md:w-10 text-purple" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        </div>
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
        className="space-y-8 pb-20 md:pb-0"
      >
        <TabsList 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-background/80 backdrop-blur-sm rounded-2xl border-2 border-border/50 shadow-lg w-full mb-8"
          role="tablist"
          aria-label="Seções do dashboard"
        >
          <TabsTrigger 
            value="calculator" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-primary/5 data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 data-[state=active]:-translate-y-1 hover:border-primary/50 hover:-translate-y-0.5 group"
            aria-label="Calculadora de reciclagem"
          >
            <Calculator className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-primary transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-primary transition-colors leading-tight">Calculadora</span>
          </TabsTrigger>
          <TabsTrigger 
            value="consumption" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-blue/5 data-[state=active]:border-blue data-[state=active]:shadow-lg data-[state=active]:shadow-blue/20 data-[state=active]:-translate-y-1 hover:border-blue/50 hover:-translate-y-0.5 group"
            aria-label="Controle de consumo"
          >
            <Droplets className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-blue transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-blue transition-colors leading-tight">Consumo</span>
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-accent/5 data-[state=active]:border-accent data-[state=active]:shadow-lg data-[state=active]:shadow-accent/20 data-[state=active]:-translate-y-1 hover:border-accent/50 hover:-translate-y-0.5 group"
            aria-label="Metas e projeções"
          >
            <Target className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-accent transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-accent transition-colors leading-tight">Metas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="recycling-charts" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-success/5 data-[state=active]:border-success data-[state=active]:shadow-lg data-[state=active]:shadow-success/20 data-[state=active]:-translate-y-1 hover:border-success/50 hover:-translate-y-0.5 group"
            aria-label="Gráficos de reciclagem"
          >
            <Recycle className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-success transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-success transition-colors leading-tight">Reciclagem</span>
          </TabsTrigger>
          <TabsTrigger 
            value="consumption-charts" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-primary/5 data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 data-[state=active]:-translate-y-1 hover:border-primary/50 hover:-translate-y-0.5 group"
            aria-label="Gráficos de consumo"
          >
            <BarChart3 className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-primary transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-primary transition-colors leading-tight">Gráficos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-accent/5 data-[state=active]:border-accent data-[state=active]:shadow-lg data-[state=active]:shadow-accent/20 data-[state=active]:-translate-y-1 hover:border-accent/50 hover:-translate-y-0.5 group"
            aria-label="Conquistas"
          >
            <Trophy className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-accent transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-accent transition-colors leading-tight">Conquistas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-purple/5 data-[state=active]:border-purple data-[state=active]:shadow-lg data-[state=active]:shadow-purple/20 data-[state=active]:-translate-y-1 hover:border-purple/50 hover:-translate-y-0.5 group"
            aria-label="Histórico"
          >
            <History className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-purple transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-purple transition-colors leading-tight">Histórico</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-blue/5 data-[state=active]:border-blue data-[state=active]:shadow-lg data-[state=active]:shadow-blue/20 data-[state=active]:-translate-y-1 hover:border-blue/50 hover:-translate-y-0.5 group"
            aria-label="Chat da comunidade"
          >
            <MessageSquare className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-blue transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-blue transition-colors leading-tight">Bater papo</span>
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] rounded-xl transition-all duration-300 bg-card border-2 border-border/50 data-[state=active]:bg-success/5 data-[state=active]:border-success data-[state=active]:shadow-lg data-[state=active]:shadow-success/20 data-[state=active]:-translate-y-1 hover:border-success/50 hover:-translate-y-0.5 group"
            aria-label="Links e dicas úteis"
          >
            <Link className="h-6 w-6 text-muted-foreground group-data-[state=active]:text-success transition-colors shrink-0" />
            <span className="text-xs font-medium text-center text-muted-foreground group-data-[state=active]:text-success transition-colors leading-tight">Links & Dicas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="animate-fade-in mt-8">
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

        <TabsContent value="consumption" className="animate-fade-in mt-8">
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

        <TabsContent value="goals" className="space-y-6 animate-fade-in mt-8">
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

        <TabsContent value="recycling-charts" className="animate-fade-in mt-8">
          <RecyclingChart entries={safeData.recyclingEntries} />
        </TabsContent>

        <TabsContent value="consumption-charts" className="animate-fade-in mt-8">
          <ConsumptionChart 
            entries={safeData.consumptionEntries} 
            goals={safeData.consumptionGoals} 
          />
        </TabsContent>

        <TabsContent value="achievements" className="animate-fade-in mt-8">
          <AchievementSystem 
            recyclingTotal={totalRecycled}
            co2Total={totalCO2Saved}
            waterReduction={safeData.consumptionGoals.find(g => g.type === 'water')?.reductionPercentage || 0}
            energyReduction={safeData.consumptionGoals.find(g => g.type === 'energy')?.reductionPercentage || 0}
            monthsActive={Math.max(safeData.recyclingEntries.length, safeData.consumptionEntries.length) > 0 ? 1 : 0}
            schoolName={schoolName}
          />
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in mt-8">
          <ActionHistory 
            history={history}
            onUndo={undoLastAction}
            onClear={clearHistory}
            hasHistory={hasHistory}
          />
        </TabsContent>

        <TabsContent value="chat" className="animate-fade-in mt-8">
          <ChatTab defaultSchool={schoolName} />
        </TabsContent>

        <TabsContent value="resources" className="animate-fade-in mt-8">
          <ResourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}