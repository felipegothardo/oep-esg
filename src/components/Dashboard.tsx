import { useToast } from '@/hooks/use-toast';
import { useSchoolData, RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from '@/hooks/useSchoolData';
import EcoHeader from './EcoHeader';
import DeleteRecordsDialog from './DeleteRecordsDialog';
import ConsolidatedDashboard from './ConsolidatedDashboard';
import PWAInstallPrompt from './PWAInstallPrompt';
import DesktopShortcutButton from './DesktopShortcutButton';
import ConversionReferences from './ConversionReferences';
import SchoolSelection from './SchoolSelection';
import SchoolDashboard from './SchoolDashboard';

export default function Dashboard() {
  const { toast } = useToast();
  const {
    elviraData,
    oswaldData,
    piagetData,
    santoAntonioData,
    activeSchool,
    setActiveSchool,
    getSchoolData,
    updateSchoolData
  } = useSchoolData();

  const getCurrentSchoolData = () => {
    if (activeSchool === 'consolidated') return elviraData; // fallback
    return getSchoolData(activeSchool);
  };

  const handleRecyclingUpdate = (entries: RecyclingEntry[]) => {
    if (activeSchool === 'consolidated') return;
    const currentData = getCurrentSchoolData();
    updateSchoolData(activeSchool, {
      ...currentData,
      recyclingEntries: entries
    });
  };

  const handleConsumptionUpdate = (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => {
    if (activeSchool === 'consolidated') return;
    const currentData = getCurrentSchoolData();
    updateSchoolData(activeSchool, {
      ...currentData,
      consumptionEntries: entries,
      consumptionGoals: goals
    });
  };

  const deleteAllRecords = () => {
    if (activeSchool === 'consolidated') return;
    const currentData = getCurrentSchoolData();
    updateSchoolData(activeSchool, { 
      recyclingEntries: [], 
      consumptionEntries: [], 
      consumptionGoals: currentData.consumptionGoals 
    });
  };

  const deleteRecyclingByMonth = (month: string) => {
    if (activeSchool === 'consolidated') return;
    const currentData = getCurrentSchoolData();
    const filteredEntries = currentData.recyclingEntries.filter(entry => entry.date !== month);
    updateSchoolData(activeSchool, {
      ...currentData,
      recyclingEntries: filteredEntries
    });
  };

  const deleteConsumptionByMonth = (type: 'water' | 'energy', month: string) => {
    if (activeSchool === 'consolidated') return;
    const currentData = getCurrentSchoolData();
    const filteredEntries = currentData.consumptionEntries.filter(
      entry => !(entry.type === type && entry.month === month)
    );
    updateSchoolData(activeSchool, {
      ...currentData,
      consumptionEntries: filteredEntries
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <EcoHeader />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Controle por Escola</h2>
            <p className="text-sm md:text-base text-muted-foreground">Selecione uma escola para visualizar seus dados</p>
          </div>
        </div>

        {/* School Selection */}
        <SchoolSelection 
          activeSchool={activeSchool}
          onSchoolChange={setActiveSchool}
        />

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

          {activeSchool !== 'consolidated' && (
            <SchoolDashboard
              schoolName={
                activeSchool === 'elvira' ? 'Elvira Brandão' :
                activeSchool === 'oswald' ? 'Oswald' :
                activeSchool === 'piaget' ? 'Piaget' : 'Carandá'
              }
              data={getCurrentSchoolData()}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
              onDeleteAll={deleteAllRecords}
              onDeleteRecyclingByMonth={deleteRecyclingByMonth}
              onDeleteConsumptionByMonth={deleteConsumptionByMonth}
            />
          )}
        </div>
      </div>
      
      <ConversionReferences />
      
      {/* Desktop Shortcut Button */}
      <DesktopShortcutButton />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}