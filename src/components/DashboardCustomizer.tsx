import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface DashboardConfig {
  showRecycling: boolean;
  showConsumption: boolean;
  showGoals: boolean;
  showCharts: boolean;
  showComparison: boolean;
  showProjections: boolean;
  showAchievements: boolean;
}

interface DashboardCustomizerProps {
  config: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
}

const DEFAULT_CONFIG: DashboardConfig = {
  showRecycling: true,
  showConsumption: true,
  showGoals: true,
  showCharts: true,
  showComparison: true,
  showProjections: true,
  showAchievements: true,
};

export function DashboardCustomizer({ config, onConfigChange }: DashboardCustomizerProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: keyof DashboardConfig) => {
    setLocalConfig({ ...localConfig, [key]: !localConfig[key] });
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    localStorage.setItem("dashboardConfig", JSON.stringify(localConfig));
    toast({
      title: "Configuração salva!",
      description: "Seu dashboard foi personalizado.",
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
    onConfigChange(DEFAULT_CONFIG);
    localStorage.removeItem("dashboardConfig");
    toast({
      title: "Configuração restaurada!",
      description: "Dashboard voltou ao padrão.",
    });
  };

  const options: { key: keyof DashboardConfig; label: string; description: string }[] = [
    { key: "showRecycling", label: "Reciclagem", description: "Mostrar seção de reciclagem" },
    { key: "showConsumption", label: "Consumo", description: "Mostrar consumo de água e energia" },
    { key: "showGoals", label: "Metas", description: "Exibir metas de redução" },
    { key: "showCharts", label: "Gráficos", description: "Visualizar gráficos e estatísticas" },
    { key: "showComparison", label: "Comparações", description: "Comparar períodos" },
    { key: "showProjections", label: "Projeções", description: "Ver projeções futuras" },
    { key: "showAchievements", label: "Conquistas", description: "Sistema de conquistas" },
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Personalizar Dashboard
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4 animate-accordion-down">
          <div className="space-y-4">
            {options.map((option) => (
              <div key={option.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor={option.key} className="font-medium">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <Switch
                  id={option.key}
                  checked={localConfig[option.key]}
                  onCheckedChange={() => handleToggle(option.key)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 hover-scale">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Restaurar Padrão
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
