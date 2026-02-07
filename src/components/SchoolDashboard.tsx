import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Droplets, Zap, Recycle, Calculator, Target, BarChart3, History, Link } from 'lucide-react';
import { SchoolData, RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from '@/hooks/useSchoolData';
import ExportButton from './ExportButton';
import { DeleteRecordsDialog } from './DeleteRecordsDialog';
import { useActionHistory } from '@/hooks/useActionHistory';
import RecyclingCalculator from './RecyclingCalculator';
import WaterEnergyTracker from './WaterEnergyTracker';
import RecyclingChart from './RecyclingChart';
import ConsumptionChart from './ConsumptionChart';
import GoalProgressCard from './GoalProgressCard';
import ProjectionCard from './ProjectionCard';
import ResourcesTab from './ResourcesTab';
import SmartGoalSuggestion from './SmartGoalSuggestion';
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
  const [currentTab, setCurrentTab] = useState('calculator');
  
  const safeData = {
    recyclingEntries: data?.recyclingEntries || [],
    consumptionEntries: data?.consumptionEntries || [],
    consumptionGoals: data?.consumptionGoals || []
  };
  
  const actionHistory = useActionHistory();
  const { history, addToHistory, clearHistory, undoLastAction, hasHistory } = viewOnly 
    ? { history: [], addToHistory: () => {}, clearHistory: () => {}, undoLastAction: () => {}, hasHistory: false }
    : actionHistory;
  
  const handleRecyclingUpdate = (entries: RecyclingEntry[]) => {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      addToHistory({
        type: 'add', category: 'recycling',
        description: `Reciclou ${lastEntry.quantity}kg de ${lastEntry.material}`,
        data: lastEntry, schoolName
      });
    }
    onRecyclingUpdate(entries);
  };
  
  const handleConsumptionUpdate = (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      addToHistory({
        type: 'add', category: 'consumption',
        description: `Registrou consumo de ${lastEntry.type === 'water' ? 'água' : 'energia'}: R$ ${lastEntry.cost}`,
        data: lastEntry, schoolName
      });
    }
    onConsumptionUpdate(entries, goals);
  };
  
  const totalCO2Saved = safeData.recyclingEntries.reduce((total, entry) => total + entry.co2Saved, 0);
  const totalRecycled = safeData.recyclingEntries.reduce((total, entry) => total + entry.quantity, 0);
  const lastWaterConsumption = safeData.consumptionEntries
    .filter(entry => entry.type === 'water').slice(-1)[0]?.consumption || 0;
  const lastEnergyConsumption = safeData.consumptionEntries
    .filter(entry => entry.type === 'energy').slice(-1)[0]?.consumption || 0;

  return (
    <div className="space-y-4">
      {/* Compact Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="border-success/20">
          <CardContent className="p-3 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-success flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-base md:text-lg font-bold text-success">{totalCO2Saved.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">kg CO₂ evitado</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue/20">
          <CardContent className="p-3 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-base md:text-lg font-bold text-blue">{lastWaterConsumption.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">L água/mês</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-600/20">
          <CardContent className="p-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-base md:text-lg font-bold text-yellow-600">{lastEnergyConsumption}</p>
              <p className="text-[10px] text-muted-foreground">kWh/mês</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple/20">
          <CardContent className="p-3 flex items-center gap-2">
            <Recycle className="h-4 w-4 text-purple flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-base md:text-lg font-bold text-purple">{totalRecycled.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">kg reciclados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Painel de Controle Ambiental</p>
        <ExportButton 
          schoolName={schoolName}
          recyclingEntries={safeData.recyclingEntries}
          consumptionEntries={safeData.consumptionEntries}
        />
      </div>

      {/* Tabs - compact & scrollable */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <div className="overflow-x-auto -mx-2 px-2 pb-1">
          <TabsList className="inline-flex w-auto gap-1 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger value="calculator" className="gap-1.5 px-3 py-2 text-xs md:text-sm whitespace-nowrap rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              <Calculator className="h-3.5 w-3.5" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="consumption" className="gap-1.5 px-3 py-2 text-xs md:text-sm whitespace-nowrap rounded-md data-[state=active]:bg-blue data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Droplets className="h-3.5 w-3.5" />
              Consumo
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-1.5 px-3 py-2 text-xs md:text-sm whitespace-nowrap rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm">
              <Target className="h-3.5 w-3.5" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="recycling-charts" className="gap-1.5 px-3 py-2 text-xs md:text-sm whitespace-nowrap rounded-md data-[state=active]:bg-success data-[state=active]:text-success-foreground data-[state=active]:shadow-sm">
              <Recycle className="h-3.5 w-3.5" />
              Reciclagem
            </TabsTrigger>
            <TabsTrigger value="consumption-charts" className="gap-1.5 px-3 py-2 text-xs md:text-sm whitespace-nowrap rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              <BarChart3 className="h-3.5 w-3.5" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 px-3 py-2 text-xs md:text-sm whitespace-nowrap rounded-md data-[state=active]:bg-purple data-[state=active]:text-purple-foreground data-[state=active]:shadow-sm">
              <History className="h-3.5 w-3.5" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 px-3 py-2 text-xs md:text-sm whitespace-nowrap rounded-md data-[state=active]:bg-success data-[state=active]:text-success-foreground data-[state=active]:shadow-sm">
              <Link className="h-3.5 w-3.5" />
              Dicas
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calculator" className="animate-fade-in">
          <div className="space-y-4">
            {!viewOnly && safeData.recyclingEntries.length > 0 && (
              <div className="flex justify-end">
                <DeleteRecordsDialog
                  title="Apagar Dados de Reciclagem"
                  description="Tem certeza que deseja apagar todos os registros de reciclagem?"
                  buttonText="Apagar Dados"
                  size="sm"
                  variant="outline"
                  onConfirm={async () => { onDeleteAll(); }}
                />
              </div>
            )}
            {!viewOnly && (
              <ContextualTips 
                recyclingTotal={totalRecycled} co2Total={totalCO2Saved}
                waterConsumption={lastWaterConsumption} energyConsumption={lastEnergyConsumption}
                hasRecyclingData={safeData.recyclingEntries.length > 0}
                hasConsumptionData={safeData.consumptionEntries.length > 0}
                schoolName={schoolName} onTabChange={setCurrentTab}
              />
            )}
            {viewOnly ? (
              <RecyclingChart entries={safeData.recyclingEntries} />
            ) : (
              <RecyclingCalculator onEntriesUpdate={handleRecyclingUpdate} schoolType={schoolType} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="consumption" className="animate-fade-in">
          <div className="space-y-4">
            {!viewOnly && safeData.consumptionEntries.length > 0 && (
              <div className="flex justify-end gap-2">
                <DeleteRecordsDialog
                  title="Apagar Dados de Água" description="Tem certeza que deseja apagar todos os registros de consumo de água?"
                  buttonText="Apagar Água" size="sm" variant="outline"
                  onConfirm={async () => {
                    const waterMonths = [...new Set(safeData.consumptionEntries.filter(e => e.type === 'water').map(e => e.month))];
                    for (const month of waterMonths) { onDeleteConsumptionByMonth('water', month); }
                  }}
                />
                <DeleteRecordsDialog
                  title="Apagar Dados de Energia" description="Tem certeza que deseja apagar todos os registros de consumo de energia?"
                  buttonText="Apagar Energia" size="sm" variant="outline"
                  onConfirm={async () => {
                    const energyMonths = [...new Set(safeData.consumptionEntries.filter(e => e.type === 'energy').map(e => e.month))];
                    for (const month of energyMonths) { onDeleteConsumptionByMonth('energy', month); }
                  }}
                />
              </div>
            )}
            {!viewOnly && (
              <ContextualTips 
                recyclingTotal={totalRecycled} co2Total={totalCO2Saved}
                waterConsumption={lastWaterConsumption} energyConsumption={lastEnergyConsumption}
                hasRecyclingData={safeData.recyclingEntries.length > 0}
                hasConsumptionData={safeData.consumptionEntries.length > 0}
                schoolName={schoolName} onTabChange={setCurrentTab}
              />
            )}
            {viewOnly ? (
              <ConsumptionChart entries={safeData.consumptionEntries} goals={safeData.consumptionGoals} />
            ) : (
              <WaterEnergyTracker
                onDataUpdate={handleConsumptionUpdate}
                existingEntries={safeData.consumptionEntries}
                existingGoals={safeData.consumptionGoals}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 animate-fade-in">
          <SmartGoalSuggestion 
            recyclingEntries={safeData.recyclingEntries}
            consumptionEntries={safeData.consumptionEntries}
            currentGoals={safeData.consumptionGoals}
            onUpdateGoal={(type, percentage) => {
              const updatedGoals = safeData.consumptionGoals.map(goal => 
                goal.type === type ? { ...goal, reductionPercentage: percentage } : goal
              );
              handleConsumptionUpdate(safeData.consumptionEntries, updatedGoals);
            }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalProgressCard entries={safeData.consumptionEntries} goals={safeData.consumptionGoals} type="water" />
            <GoalProgressCard entries={safeData.consumptionEntries} goals={safeData.consumptionGoals} type="energy" />
          </div>
          <ProjectionCard entries={safeData.recyclingEntries} schoolName={schoolName} />
        </TabsContent>

        <TabsContent value="recycling-charts" className="animate-fade-in">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold">Dados de Reciclagem</h3>
              {!viewOnly && safeData.recyclingEntries.length > 0 && (
                <DeleteRecordsDialog
                  title="Apagar Dados de Reciclagem" 
                  description="Todos os dados de materiais reciclados serão removidos permanentemente."
                  buttonText="Apagar" onConfirm={async () => { onDeleteAll(); }}
                />
              )}
            </div>
            <RecyclingChart entries={safeData.recyclingEntries} />
          </div>
        </TabsContent>

        <TabsContent value="consumption-charts" className="animate-fade-in">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold">Dados de Consumo</h3>
              {!viewOnly && safeData.consumptionEntries.length > 0 && (
                <div className="flex gap-2">
                  <DeleteRecordsDialog
                    title="Apagar Água" description="Apagar todos os registros de consumo de água?"
                    buttonText="Água" variant="outline"
                    onConfirm={async () => {
                      const waterMonths = [...new Set(safeData.consumptionEntries.filter(e => e.type === 'water').map(e => e.month))];
                      for (const month of waterMonths) { onDeleteConsumptionByMonth('water', month); }
                    }}
                  />
                  <DeleteRecordsDialog
                    title="Apagar Energia" description="Apagar todos os registros de consumo de energia?"
                    buttonText="Energia" variant="outline"
                    onConfirm={async () => {
                      const energyMonths = [...new Set(safeData.consumptionEntries.filter(e => e.type === 'energy').map(e => e.month))];
                      for (const month of energyMonths) { onDeleteConsumptionByMonth('energy', month); }
                    }}
                  />
                </div>
              )}
            </div>
            <ConsumptionChart entries={safeData.consumptionEntries} goals={safeData.consumptionGoals} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in">
          <ActionHistory history={history} onUndo={undoLastAction} onClear={clearHistory} hasHistory={hasHistory} />
        </TabsContent>

        <TabsContent value="resources" className="animate-fade-in">
          <ResourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
