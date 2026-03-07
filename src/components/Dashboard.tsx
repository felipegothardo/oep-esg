import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCloudData } from "@/hooks/useCloudData";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import EcoHeader from "./EcoHeader";
import ConversionReferences from "./ConversionReferences";
import SchoolDashboard from "./SchoolDashboard";
import OnboardingTutorial from "./OnboardingTutorial";
import AdvancedReports from "./AdvancedReports";
import AdminUsersPanel from "./AdminUsersPanel";
import CoordinatorDashboard from "./CoordinatorDashboard";
import InitialSchoolSelection from "./InitialSchoolSelection";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadingState } from "./LoadingState";
import { BarChart3, Home, Building2, Users } from "lucide-react";
import { RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from "@/hooks/useSchoolData";
import { isLocalMode } from "@/lib/runtimeMode";
import { localGetCurrentUser, localGetEffectiveSchoolId, localGetSchoolById } from "@/services/localDb";

import logoElvira from "@/assets/logo-elvira.png";
import logoOswald from "@/assets/logo-oswald.png";
import logoPiaget from "@/assets/logo-piaget.png";
import logoCaranda from "@/assets/logo-caranda.png";

const schoolLogos: Record<string, string> = {
  elvira: logoElvira,
  oswald: logoOswald,
  piaget: logoPiaget,
  "santo-antonio": logoCaranda,
};

type TabType = "dashboard" | "coordinator" | "reports" | "admin";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentSchoolName, setCurrentSchoolName] = useState("");
  const [currentSchoolLogo, setCurrentSchoolLogo] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [userSchoolCode, setUserSchoolCode] = useState("");
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
    refresh,
  } = useCloudData();

  useEffect(() => {
    loadUserSchool();
  }, []);

  const loadUserSchool = async () => {
    try {
      if (isLocalMode) {
        setIsLoadingUser(true);
        const currentUser = localGetCurrentUser();
        if (!currentUser) {
          setHasProfile(false);
          setIsLoadingUser(false);
          return;
        }

        const effectiveSchoolId = localGetEffectiveSchoolId(currentUser);
        const school = localGetSchoolById(effectiveSchoolId);
        const isCoord = currentUser.role === "coordinator";

        setIsCoordinator(isCoord);
        setHasProfile(!!school);

        if (school) {
          setCurrentSchoolName(school.name);
          setUserSchoolCode(school.code);
          setCurrentSchoolLogo(schoolLogos[school.code] || "");
        }

        setActiveTab("dashboard");
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
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
        setIsLoadingUser(false);
        return;
      }

      if (!profile) {
        setHasProfile(false);
      } else {
        setHasProfile(true);
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "coordinator")
          .maybeSingle();

        const isCoord = !!roleData;
        setIsCoordinator(isCoord);

        if (profile.schools) {
          setCurrentSchoolName(profile.schools.name);
          setUserSchoolCode(profile.schools.code);
          setCurrentSchoolLogo(schoolLogos[profile.schools.code] || "");
        }
        setActiveTab(isCoord ? "coordinator" : "dashboard");
      }
    } catch {
      await supabase.auth.signOut();
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleRecyclingUpdate = async (entries: RecyclingEntry[]) => {
    const currentIds = recyclingEntries.map((e) => e.id);
    for (const entry of entries.filter((e) => !currentIds.includes(e.id))) {
      try {
        await addRecyclingEntry(entry);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleConsumptionUpdate = async (entries: ConsumptionEntry[], goals: ConsumptionGoal[]) => {
    const currentIds = consumptionEntries.map((e) => e.id);
    for (const entry of entries.filter((e) => !currentIds.includes(e.id))) {
      try {
        await addConsumptionEntry(entry);
      } catch (e) {
        console.error(e);
      }
    }
    for (const goal of goals) {
      try {
        await updateConsumptionGoal(goal);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (isLoadingUser) return <LoadingState message="Carregando..." fullScreen />;

  if (!hasProfile && !isLocalMode) {
    return (
      <InitialSchoolSelection
        onSchoolSelected={() => {
          setHasProfile(true);
          loadUserSchool();
          refresh();
        }}
      />
    );
  }

  if (!hasProfile && isLocalMode) {
    return <LoadingState message="Sem conta local ativa. Faca login em /auth." fullScreen />;
  }

  if (loading) return <LoadingState message="Carregando dados..." fullScreen />;

  const showServerOnlyTabs = !isLocalMode;

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [];
  if (isLocalMode) {
    tabs.push({ id: "dashboard", label: "Minha Escola", icon: Home });
  } else {
    if (!isCoordinator) tabs.push({ id: "dashboard", label: "Minha Escola", icon: Home });
    if (isCoordinator) tabs.push({ id: "coordinator", label: "Painel Geral", icon: Building2 });
    tabs.push({ id: "reports", label: "Relatorios", icon: BarChart3 });
    if (isCoordinator) tabs.push({ id: "admin", label: "Cadastros", icon: Users });
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <EcoHeader schoolName={currentSchoolName} schoolLogo={currentSchoolLogo} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <nav
            className="flex gap-1 mb-6 p-1 bg-muted/40 border border-border shadow-sm rounded-lg w-fit"
            role="tablist"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {activeTab === "dashboard" && (
            <SchoolDashboard
              schoolName={currentSchoolName}
              schoolType="current"
              data={{
                recyclingEntries: recyclingEntries || [],
                consumptionEntries: consumptionEntries || [],
                consumptionGoals: consumptionGoals || [],
              }}
              onRecyclingUpdate={handleRecyclingUpdate}
              onConsumptionUpdate={handleConsumptionUpdate}
              onDeleteAll={deleteAllRecords}
              onDeleteRecyclingByMonth={deleteRecyclingByMonth}
              onDeleteConsumptionByMonth={deleteConsumptionByMonth}
            />
          )}

          {isCoordinator && showServerOnlyTabs && activeTab === "coordinator" && <CoordinatorDashboard />}

          {showServerOnlyTabs && activeTab === "reports" && <AdvancedReports />}

          {isCoordinator && showServerOnlyTabs && activeTab === "admin" && <AdminUsersPanel />}
        </div>

        <ConversionReferences />
        <OnboardingTutorial />
      </div>
    </ErrorBoundary>
  );
}

