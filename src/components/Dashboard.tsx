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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Home, FileText, Building2 } from 'lucide-react';
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

  // Refresh data when returning to dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard' && !loading) {
      refresh();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <EcoHeader />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full mb-6",
            isCoordinator ? "grid-cols-3" : "grid-cols-2"
          )}>
            <TabsTrigger value="dashboard" className="gap-2">
              <Home className="h-4 w-4" />
              Minha Escola
            </TabsTrigger>
            {isCoordinator && (
              <TabsTrigger value="coordinator" className="gap-2">
                <Building2 className="h-4 w-4" />
                Todas as Escolas
              </TabsTrigger>
            )}
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" key="dashboard-tab" className="space-y-6">
            {recyclingEntries && consumptionEntries && consumptionGoals ? (
              <SchoolDashboard
                schoolName={currentSchoolName}
                schoolType="current"
                data={{
                  recyclingEntries,
                  consumptionEntries,
                  consumptionGoals
                }}
                onRecyclingUpdate={handleRecyclingUpdate}
                onConsumptionUpdate={handleConsumptionUpdate}
                onDeleteAll={deleteAllRecords}
                onDeleteRecyclingByMonth={deleteRecyclingByMonth}
                onDeleteConsumptionByMonth={deleteConsumptionByMonth}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            )}
          </TabsContent>

          {isCoordinator && (
            <TabsContent value="coordinator" key="coordinator-tab">
              <CoordinatorDashboard />
            </TabsContent>
          )}

          <TabsContent value="reports" key="reports-tab">
            <AdvancedReports />
          </TabsContent>
        </Tabs>
      </div>
      
      <ConversionReferences />
      <DesktopShortcutButton />
      <PWAInstallPrompt />
      <OnboardingTutorial />
    </div>
  );
}