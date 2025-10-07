import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCloudData } from '@/hooks/useCloudData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import EcoHeader from './EcoHeader';
import { DeleteRecordsDialog } from './DeleteRecordsDialog';
import ConsolidatedDashboard from './ConsolidatedDashboard';
import PWAInstallPrompt from './PWAInstallPrompt';
import DesktopShortcutButton from './DesktopShortcutButton';
import ConversionReferences from './ConversionReferences';
import SchoolSelection from './SchoolSelection';
import SchoolDashboard from './SchoolDashboard';
import OnboardingTutorial from './OnboardingTutorial';
import AdvancedReports from './AdvancedReports';
import CoordinatorDashboard from './CoordinatorDashboard';
import InitialSchoolSelection from './InitialSchoolSelection';
import { BarChart3, Home, Building2 } from 'lucide-react';
import { RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from '@/hooks/useSchoolData';

export default function Dashboard() {
  const { toast } = useToast();
  const [currentSchoolName, setCurrentSchoolName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('dashboard'); // Valor padrão para evitar tab vazia
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [userSchoolCode, setUserSchoolCode] = useState<string>('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  
  const {
    recyclingEntries,
    consumptionEntries,
    consumptionGoals,
    loading,
    addRecyclingEntry,
    addConsumptionEntry,
    updateConsumptionGoal,
    deleteAllRecords,
    deleteRecyclingByMonth,
    deleteConsumptionByMonth,
    refresh
  } = useCloudData();

  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      if (!isMounted) return;
      await loadUserSchool();
    };
    
    loadUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadUserSchool = async () => {
    setIsLoadingUser(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          schools (
            name,
            code
          )
        `)
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading profile:", error);
      }
      
      if (!profile) {
        // Usuário não tem perfil, precisa selecionar escola
        setHasProfile(false);
      } else if (profile.schools) {
        setHasProfile(true);
        setCurrentSchoolName(profile.schools.name);
        setUserSchoolCode(profile.schools.code);
        // Verificar se é coordenador (escola OEP)
        if (profile.schools.code === 'OEP') {
          setIsCoordinator(true);
        }
        // Sempre começar na aba "Minha Escola"
        setActiveTab('dashboard');
      }
    }
    setIsLoadingUser(false);
  };

  const handleRecyclingUpdate = async (entries: RecyclingEntry[]) => {
    // Find new entries (those not in the current list)
    const currentIds = recyclingEntries.map(e => e.id);
    const newEntries = entries.filter(e => !currentIds.includes(e.id));
    
    for (const entry of newEntries) {
      try {
        await addRecyclingEntry(entry);
      } catch (error) {
        console.error("Error adding recycling entry:", error);
      }
    }
  };

  const handleConsumptionUpdate = async (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => {
    // Add new consumption entries
    const currentIds = consumptionEntries.map(e => e.id);
    const newEntries = entries.filter(e => !currentIds.includes(e.id));
    
    for (const entry of newEntries) {
      try {
        await addConsumptionEntry(entry);
      } catch (error) {
        console.error("Error adding consumption entry:", error);
      }
    }

    // Update goals
    for (const goal of goals) {
      try {
        await updateConsumptionGoal(goal);
      } catch (error) {
        console.error("Error updating goal:", error);
      }
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return <InitialSchoolSelection onSchoolSelected={() => {
      setHasProfile(true);
      loadUserSchool();
      refresh();
    }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <EcoHeader />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Tabs apenas para navegação visual */}
        <div className="w-full">
          <div className={cn(
            "grid w-full mb-6 h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            isCoordinator ? "grid-cols-3" : "grid-cols-2"
          )}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
                activeTab === 'dashboard' && "bg-background text-foreground shadow-sm"
              )}
            >
              <Home className="h-4 w-4" />
              Minha Escola
            </button>
            {isCoordinator && (
              <button
                onClick={() => setActiveTab('coordinator')}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
                  activeTab === 'coordinator' && "bg-background text-foreground shadow-sm"
                )}
              >
                <Building2 className="h-4 w-4" />
                Todas as Escolas
              </button>
            )}
            <button
              onClick={() => setActiveTab('reports')}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
                activeTab === 'reports' && "bg-background text-foreground shadow-sm"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </button>
          </div>

          {/* Manter todos os componentes montados, apenas alternar visibilidade */}
          <div className={cn("space-y-6", activeTab !== 'dashboard' && "hidden")}>
            <SchoolDashboard
              schoolName={currentSchoolName}
              schoolType="current"
              data={{
                recyclingEntries: recyclingEntries || [],
                consumptionEntries: consumptionEntries || [],
                consumptionGoals: consumptionGoals || []
              }}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
              onDeleteAll={deleteAllRecords}
              onDeleteRecyclingByMonth={deleteRecyclingByMonth}
              onDeleteConsumptionByMonth={deleteConsumptionByMonth}
            />
          </div>

          {isCoordinator && (
            <div className={cn(activeTab !== 'coordinator' && "hidden")}>
              <CoordinatorDashboard />
            </div>
          )}

          <div className={cn(activeTab !== 'reports' && "hidden")}>
            <AdvancedReports />
          </div>
        </div>
      </div>
      
      <ConversionReferences />
      <DesktopShortcutButton />
      <PWAInstallPrompt />
      <OnboardingTutorial />
    </div>
  );
}