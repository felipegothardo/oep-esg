import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCloudData } from '@/hooks/useCloudData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import EcoHeader from './EcoHeader';
import PWAInstallPrompt from './PWAInstallPrompt';
import DesktopShortcutButton from './DesktopShortcutButton';
import ConversionReferences from './ConversionReferences';
import SchoolDashboard from './SchoolDashboard';
import OnboardingTutorial from './OnboardingTutorial';
import AdvancedReports from './AdvancedReports';
import CoordinatorDashboard from './CoordinatorDashboard';
import InitialSchoolSelection from './InitialSchoolSelection';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingState } from './LoadingState';
import { BarChart3, Home, Building2 } from 'lucide-react';
import { RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from '@/hooks/useSchoolData';

type TabType = 'dashboard' | 'coordinator' | 'reports';

const schoolLogos: Record<string, string> = {
  'ELV': '/lovable-uploads/ac7dcf98-b3a9-4b47-965e-df5f24f90dda.png',
  'OSW': '/lovable-uploads/13e432d6-adcc-4d69-9735-56086059444c.png',
  'PIA': '/lovable-uploads/5f155554-a003-48a8-873e-69c765fa77c1.png',
  'CAR': '/lovable-uploads/15780c7a-3c8b-4d43-a842-9bd423a699c8.png',
};

export default function Dashboard() {
  const { toast } = useToast();
  const [currentSchoolName, setCurrentSchoolName] = useState<string>('');
  const [currentSchoolLogo, setCurrentSchoolLogo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
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

  // Load user data on mount
  useEffect(() => {
    loadUserSchool();
  }, []);

  const loadUserSchool = async () => {
    try {
      setIsLoadingUser(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        // Se houver erro de sessão, limpar e redirecionar para login
        await supabase.auth.signOut();
        setIsLoadingUser(false);
        return;
      }
      
      if (!session?.user) {
        setIsLoadingUser(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`schools (name, code)`)
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading profile:", error);
        setIsLoadingUser(false);
        return;
      }
      
      if (!profile) {
        setHasProfile(false);
      } else if (profile.schools) {
        setHasProfile(true);
        setCurrentSchoolName(profile.schools.name);
        setUserSchoolCode(profile.schools.code);
        setCurrentSchoolLogo(schoolLogos[profile.schools.code] || '');
        setIsCoordinator(profile.schools.code === 'OEP');
        setActiveTab('dashboard');
      }
    } catch (error) {
      console.error("Error in loadUserSchool:", error);
      // Em caso de erro, tentar fazer logout para limpar estado
      await supabase.auth.signOut();
    } finally {
      setIsLoadingUser(false);
    }
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
    return <LoadingState message="Carregando..." fullScreen />;
  }

  if (!hasProfile) {
    return <InitialSchoolSelection onSchoolSelected={() => {
      setHasProfile(true);
      loadUserSchool();
      refresh();
    }} />;
  }

  if (loading) {
    return <LoadingState message="Carregando dados..." fullScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <EcoHeader schoolName={currentSchoolName} schoolLogo={currentSchoolLogo} />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Navigation Tabs */}
        <div className="w-full mb-6">
          <div 
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full",
              isCoordinator ? "grid grid-cols-3 gap-1" : "grid grid-cols-2 gap-1"
            )}
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              aria-controls="dashboard-panel"
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
                activeTab === 'dashboard' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "hover:bg-background/50"
              )}
            >
              <Home className="h-4 w-4" />
              <span>Minha Escola</span>
            </button>
            
            {isCoordinator && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'coordinator'}
                aria-controls="coordinator-panel"
                onClick={() => setActiveTab('coordinator')}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
                  activeTab === 'coordinator' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "hover:bg-background/50"
                )}
              >
                <Building2 className="h-4 w-4" />
                <span>Todas as Escolas</span>
              </button>
            )}
            
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'reports'}
              aria-controls="reports-panel"
              onClick={() => setActiveTab('reports')}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
                activeTab === 'reports' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "hover:bg-background/50"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </button>
          </div>
        </div>

        {/* Tab Panels - All mounted, visibility controlled by CSS */}
        <div 
          id="dashboard-panel" 
          role="tabpanel" 
          aria-labelledby="dashboard-tab"
          className={cn("space-y-6", activeTab !== 'dashboard' && "hidden")}
        >
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
          <div 
            id="coordinator-panel" 
            role="tabpanel" 
            aria-labelledby="coordinator-tab"
            className={cn(activeTab !== 'coordinator' && "hidden")}
          >
            <CoordinatorDashboard />
          </div>
        )}

        <div 
          id="reports-panel" 
          role="tabpanel" 
          aria-labelledby="reports-tab"
          className={cn(activeTab !== 'reports' && "hidden")}
        >
          <AdvancedReports />
        </div>
      </div>
      
        <ConversionReferences />
        <DesktopShortcutButton />
        <PWAInstallPrompt />
        <OnboardingTutorial />
      </div>
    </ErrorBoundary>
  );
}