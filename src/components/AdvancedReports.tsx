import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from "recharts";
import { 
  FileDown, TrendingUp, TrendingDown, Award, Users, 
  Droplets, Zap, Recycle, Calendar, School, Target,
  ArrowUpRight, ArrowDownRight, Leaf, Trophy, Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface SchoolData {
  id: string;
  name: string;
  totalRecycled: number;
  totalCO2: number;
  waterConsumption: number;
  energyConsumption: number;
  recyclingByMaterial: { material: string; quantity: number }[];
  monthlyTrend: { month: string; recycling: number; co2: number }[];
  consumptionTrend: { month: string; water: number; energy: number }[];
  goals: { type: string; target: number; current: number }[];
}

interface SchoolOption {
  id: string;
  name: string;
}

export default function AdvancedReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isCoordinator, setIsCoordinator] = useState(false);

  const COLORS = [
    'hsl(142, 55%, 45%)', 'hsl(210, 70%, 50%)', 'hsl(35, 75%, 50%)', 
    'hsl(0, 65%, 52%)', 'hsl(265, 50%, 52%)', 'hsl(195, 65%, 45%)'
  ];

  useEffect(() => {
    let isMounted = true;
    
    const checkCoordinatorRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "coordinator")
        .maybeSingle();

      if (isMounted) {
        setIsCoordinator(!!roleData);
      }
    };

    const loadSchoolOptions = async () => {
      const { data } = await supabase
        .from("schools")
        .select("id, name")
        .neq("code", "OEP")
        .order("name");
      if (isMounted && data) {
        setSchoolOptions(data);
      }
    };
    
    const loadData = async () => {
      if (!isMounted) return;
      await Promise.all([checkCoordinatorRole(), loadSchoolOptions()]);
      await loadReportData();
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedPeriod, selectedSchool]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setReportData(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setReportData(null);
        setLoading(false);
        return;
      }

      const endDate = new Date();
      const startDate = new Date();
      if (selectedPeriod === "1month") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (selectedPeriod === "3months") {
        startDate.setMonth(startDate.getMonth() - 3);
      } else if (selectedPeriod === "6months") {
        startDate.setMonth(startDate.getMonth() - 6);
      } else {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const { data: schoolsData, error: schoolsError } = await supabase
        .from("schools")
        .select("*")
        .neq('code', 'OEP')
        .order("name");

      if (schoolsError) {
        toast({
          title: "Erro ao carregar escolas",
          description: "Não foi possível carregar a lista de escolas",
          variant: "destructive"
        });
        setReportData(null);
        setLoading(false);
        return;
      }

      if (!schoolsData || schoolsData.length === 0) {
        setReportData(null);
        setLoading(false);
        return;
      }

      const schoolsWithData: SchoolData[] = [];

      for (const school of schoolsData) {
        if (selectedSchool !== "all" && school.id !== selectedSchool) continue;

        const { data: recyclingData } = await supabase
          .from("recycling_entries")
          .select("*")
          .eq("school_id", school.id)
          .gte("entry_date", startDate.toISOString().split("T")[0])
          .lte("entry_date", endDate.toISOString().split("T")[0]);

        const { data: consumptionData } = await supabase
          .from("consumption_entries")
          .select("*")
          .eq("school_id", school.id)
          .gte("entry_date", startDate.toISOString().split("T")[0])
          .lte("entry_date", endDate.toISOString().split("T")[0]);

        const { data: goalsData } = await supabase
          .from("consumption_goals")
          .select("*")
          .eq("school_id", school.id);

        const totalRecycled = recyclingData?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
        const totalCO2 = recyclingData?.reduce((sum, item) => sum + Number(item.co2_saved), 0) || 0;

        const materialGroups = recyclingData?.reduce((acc: any, item) => {
          if (!acc[item.material]) acc[item.material] = 0;
          acc[item.material] += Number(item.quantity);
          return acc;
        }, {});

        const recyclingByMaterial = Object.entries(materialGroups || {}).map(([material, quantity]) => ({
          material,
          quantity: quantity as number
        }));

        const monthlyData = recyclingData?.reduce((acc: any, item) => {
          const month = item.entry_date.substring(0, 7);
          if (!acc[month]) acc[month] = { recycling: 0, co2: 0 };
          acc[month].recycling += Number(item.quantity);
          acc[month].co2 += Number(item.co2_saved);
          return acc;
        }, {});

        const monthlyTrend = Object.entries(monthlyData || {}).map(([month, data]: [string, any]) => ({
          month,
          recycling: data.recycling,
          co2: data.co2
        })).sort((a, b) => a.month.localeCompare(b.month));

        const waterData = consumptionData?.filter(item => item.type === "water") || [];
        const energyData = consumptionData?.filter(item => item.type === "energy") || [];

        const waterConsumption = waterData.reduce((sum, item) => sum + Number(item.consumption), 0);
        const energyConsumption = energyData.reduce((sum, item) => sum + Number(item.consumption), 0);

        const consumptionByMonth = consumptionData?.reduce((acc: any, item) => {
          const month = item.month;
          if (!acc[month]) acc[month] = { water: 0, energy: 0 };
          if (item.type === "water") acc[month].water += Number(item.consumption);
          if (item.type === "energy") acc[month].energy += Number(item.consumption);
          return acc;
        }, {});

        const consumptionTrend = Object.entries(consumptionByMonth || {}).map(([month, data]: [string, any]) => ({
          month,
          water: data.water,
          energy: data.energy
        })).sort((a, b) => a.month.localeCompare(b.month));

        const goals = goalsData?.map(goal => ({
          type: goal.type === "water" ? "Água" : "Energia",
          target: Number(goal.reduction_percentage),
          current: calculateCurrentReduction(goal.type, consumptionData || [])
        })) || [];

        schoolsWithData.push({
          id: school.id,
          name: school.name,
          totalRecycled,
          totalCO2,
          waterConsumption,
          energyConsumption,
          recyclingByMaterial,
          monthlyTrend,
          consumptionTrend,
          goals
        });
      }

      setSchools(schoolsWithData);
      if (schoolsWithData.length > 0) {
        processReportData(schoolsWithData);
      } else {
        setReportData(null);
      }
    } catch (error) {
      console.error("Error loading report data:", error);
      toast({
        title: "Erro ao carregar relatórios",
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados dos relatórios",
        variant: "destructive"
      });
      setReportData(null);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentReduction = (type: string, consumptionData: any[]) => {
    const typeData = consumptionData.filter(item => item.type === type);
    if (typeData.length < 2) return 0;

    const sorted = typeData.sort((a, b) => b.month.localeCompare(a.month));
    const latest = Number(sorted[0].consumption);
    const previous = Number(sorted[1].consumption);

    if (previous === 0) return 0;
    return Math.round(((previous - latest) / previous) * 100);
  };

  const processReportData = (schoolsData: SchoolData[]) => {
    if (!schoolsData || schoolsData.length === 0) {
      setReportData(null);
      return;
    }

    try {
      const ranking = schoolsData
        .map(school => ({
          name: school.name,
          recycled: school.totalRecycled || 0,
          co2: school.totalCO2 || 0,
          score: (school.totalRecycled || 0) * 0.5 + (school.totalCO2 || 0) * 10
        }))
        .sort((a, b) => b.score - a.score);

      const comparison = schoolsData.map(school => ({
        name: school.name.replace("Escola ", ""),
        Reciclagem: school.totalRecycled || 0,
        CO2: school.totalCO2 || 0,
        Água: school.waterConsumption || 0,
        Energia: school.energyConsumption || 0
      }));

      const allMaterials: any = {};
      schoolsData.forEach(school => {
        if (school.recyclingByMaterial && Array.isArray(school.recyclingByMaterial)) {
          school.recyclingByMaterial.forEach(item => {
            if (!allMaterials[item.material]) allMaterials[item.material] = 0;
            allMaterials[item.material] += item.quantity || 0;
          });
        }
      });

      const materialsData = Object.entries(allMaterials).map(([material, quantity]) => ({
        name: material,
        value: quantity as number
      }));

      const performanceData = schoolsData.map(school => ({
        school: school.name.replace("Escola ", ""),
        Reciclagem: Math.min(100, ((school.totalRecycled || 0) / 1000) * 100),
        "Redução CO2": Math.min(100, ((school.totalCO2 || 0) / 500) * 100),
        "Economia Água": (school.goals && Array.isArray(school.goals)) ? (school.goals.find(g => g.type === "Água")?.current || 0) : 0,
        "Economia Energia": (school.goals && Array.isArray(school.goals)) ? (school.goals.find(g => g.type === "Energia")?.current || 0) : 0
      }));

      setReportData({
        ranking: ranking || [],
        comparison: comparison || [],
        materialsData: materialsData || [],
        performanceData: performanceData || [],
        totals: {
          recycling: schoolsData.reduce((sum, s) => sum + (s.totalRecycled || 0), 0),
          co2: schoolsData.reduce((sum, s) => sum + (s.totalCO2 || 0), 0),
          water: schoolsData.reduce((sum, s) => sum + (s.waterConsumption || 0), 0),
          energy: schoolsData.reduce((sum, s) => sum + (s.energyConsumption || 0), 0),
          schools: schoolsData.length
        }
      });
    } catch (error) {
      console.error("Error processing report data:", error);
      setReportData(null);
    }
  };

  const exportPDF = async () => {
    if (!reportData) {
      toast({ title: "Sem dados", description: "Não há dados para exportar", variant: "destructive" });
      return;
    }
    try {
      const reportElement = document.getElementById("advanced-report");
      if (!reportElement) return;
      const canvas = await html2canvas(reportElement, { scale: 2, logging: false, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-comparativo-${new Date().toISOString().split("T")[0]}.pdf`);
      toast({ title: "Relatório exportado", description: "O PDF foi baixado com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao exportar", description: "Não foi possível gerar o PDF", variant: "destructive" });
    }
  };

  const exportCSV = () => {
    if (!reportData) {
      toast({ title: "Sem dados", description: "Não há dados para exportar", variant: "destructive" });
      return;
    }
    try {
      let csv = "Relatório Comparativo OEP Sustentável\n";
      csv += `Período: ${selectedPeriod === "1month" ? "1 mês" : selectedPeriod === "3months" ? "3 meses" : selectedPeriod === "6months" ? "6 meses" : "1 ano"}\n\n`;
      csv += "Resumo Geral\n";
      csv += `Total Reciclado,${reportData.totals.recycling} kg\n`;
      csv += `Total CO2 Evitado,${reportData.totals.co2} kg\n`;
      csv += `Consumo Total de Água,${reportData.totals.water} m³\n`;
      csv += `Consumo Total de Energia,${reportData.totals.energy} kWh\n\n`;
      csv += "Ranking das Escolas\n";
      csv += "Posição,Escola,Material Reciclado (kg),CO2 Evitado (kg),Pontuação\n";
      reportData.ranking.forEach((school: any, index: number) => {
        csv += `${index + 1},${school.name},${school.recycled},${school.co2},${school.score.toFixed(2)}\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio-comparativo-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Relatório exportado", description: "O CSV foi baixado com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao exportar", description: "Não foi possível gerar o CSV", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!reportData || !reportData.totals || schools.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
          <p className="text-muted-foreground">
            Não há dados de escolas para gerar relatórios no período selecionado.
          </p>
        </div>
      </div>
    );
  }

  const safeReportData = {
    ...reportData,
    ranking: reportData.ranking || [],
    comparison: reportData.comparison || [],
    materialsData: reportData.materialsData || [],
    performanceData: reportData.performanceData || []
  };

  const selectedSchoolName = selectedSchool === "all" 
    ? "Todas as Escolas" 
    : schoolOptions.find(s => s.id === selectedSchool)?.name || "Escola";

  return (
    <div id="advanced-report" className="space-y-6 p-4 md:p-6">
      {/* Header with Filters */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Relatórios Avançados
              </h2>
              <p className="text-muted-foreground mt-1 ml-[52px]">
                Análise comparativa e indicadores de desempenho
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* School Filter */}
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-full sm:w-[200px] bg-card">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Todas as escolas" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">Todas as Escolas</span>
                  </SelectItem>
                  {schoolOptions.map(school => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Period Filter */}
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-[150px] bg-card">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 mês</SelectItem>
                  <SelectItem value="3months">3 meses</SelectItem>
                  <SelectItem value="6months">6 meses</SelectItem>
                  <SelectItem value="1year">1 ano</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button onClick={exportPDF} variant="outline" size="sm" className="gap-1.5">
                  <FileDown className="h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={exportCSV} variant="outline" size="sm" className="gap-1.5">
                  <FileDown className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </div>

          {selectedSchool !== "all" && (
            <div className="mt-3 ml-[52px]">
              <Badge variant="secondary" className="gap-1.5">
                <Filter className="h-3 w-3" />
                Filtrando: {selectedSchoolName}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Reciclado</p>
                <p className="text-2xl font-bold mt-1">{safeReportData.totals.recycling.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">quilogramas</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Recycle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CO₂ Evitado</p>
                <p className="text-2xl font-bold mt-1">{safeReportData.totals.co2.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg de CO₂</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Consumo de Água</p>
                <p className="text-2xl font-bold mt-1">{safeReportData.totals.water.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">metros cúbicos</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Consumo Energia</p>
                <p className="text-2xl font-bold mt-1">{safeReportData.totals.energy.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">quilowatt-hora</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-[40px]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Escolas Ativas</p>
                <p className="text-2xl font-bold mt-1">{safeReportData.totals.schools}</p>
                <p className="text-xs text-muted-foreground">participantes</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <School className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isCoordinator ? "ranking" : "performance"} className="w-full">
        <TabsList className={`grid w-full ${isCoordinator ? 'grid-cols-4' : 'grid-cols-2'} bg-card border border-border shadow-sm p-1 rounded-xl`}>
          {isCoordinator && <TabsTrigger value="ranking" className="gap-1.5"><Trophy className="h-4 w-4" />Ranking</TabsTrigger>}
          {isCoordinator && <TabsTrigger value="comparison" className="gap-1.5"><Users className="h-4 w-4" />Comparação</TabsTrigger>}
          <TabsTrigger value="materials" className="gap-1.5"><Recycle className="h-4 w-4" />Resíduos</TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5"><Target className="h-4 w-4" />Desempenho</TabsTrigger>
        </TabsList>

        {isCoordinator && (
          <TabsContent value="ranking" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Ranking de Sustentabilidade
                </CardTitle>
                <CardDescription>
                  Classificação baseada em reciclagem e redução de CO₂
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeReportData.ranking.length > 0 ? (
                    safeReportData.ranking.map((school: any, index: number) => {
                      const maxScore = safeReportData.ranking[0]?.score || 1;
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-lg font-bold">
                            {index < 3 ? medals[index] : <span className="text-sm">{index + 1}º</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold truncate">{school.name}</span>
                              <Badge variant="outline" className="ml-2 shrink-0">
                                {school.score.toFixed(0)} pts
                              </Badge>
                            </div>
                            <Progress value={(school.score / maxScore) * 100} className="h-2" />
                            <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Recycle className="h-3 w-3" />
                                {school.recycled.toFixed(1)} kg
                              </span>
                              <span className="flex items-center gap-1">
                                <Leaf className="h-3 w-3" />
                                {school.co2.toFixed(1)} kg CO₂
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma escola com dados no período selecionado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isCoordinator && (
          <TabsContent value="comparison" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Comparação entre Escolas
                </CardTitle>
                <CardDescription>
                  Visualização comparativa de todos os indicadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeReportData.comparison.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={safeReportData.comparison} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: 12
                        }}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="Reciclagem" fill="hsl(142, 55%, 45%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="CO2" fill="hsl(210, 70%, 50%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Água" fill="hsl(195, 65%, 45%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Energia" fill="hsl(35, 75%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">Sem dados para comparação</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-green-500" />
                Distribuição de Resíduos Reciclados
              </CardTitle>
              <CardDescription>Proporção de cada tipo de resíduo reciclado</CardDescription>
            </CardHeader>
            <CardContent>
              {safeReportData.materialsData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={safeReportData.materialsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {safeReportData.materialsData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Quantidade']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center space-y-3">
                    {safeReportData.materialsData.map((item: any, index: number) => {
                      const total = safeReportData.materialsData.reduce((sum: number, m: any) => sum + m.value, 0);
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                      return (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold">{item.value.toFixed(1)} kg</p>
                            <p className="text-xs text-muted-foreground">{pct}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">Sem dados de resíduos reciclados</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Indicadores de Desempenho
              </CardTitle>
              <CardDescription>Análise multidimensional do desempenho ambiental</CardDescription>
            </CardHeader>
            <CardContent>
              {safeReportData.performanceData.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={450}>
                    <RadarChart data={safeReportData.performanceData}>
                      <defs>
                        <linearGradient id="colorRecycling" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                      <PolarAngleAxis dataKey="school" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
                      <Radar name="Reciclagem" dataKey="Reciclagem" stroke="hsl(var(--chart-1))" fill="url(#colorRecycling)" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))', r: 4 }} activeDot={{ r: 6 }} />
                      <Radar name="Redução CO2" dataKey="Redução CO2" stroke="hsl(var(--chart-2))" fill="url(#colorCO2)" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))', r: 4 }} activeDot={{ r: 6 }} />
                      <Radar name="Economia Água" dataKey="Economia Água" stroke="hsl(var(--chart-3))" fill="url(#colorWater)" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-3))', r: 4 }} activeDot={{ r: 6 }} />
                      <Radar name="Economia Energia" dataKey="Economia Energia" stroke="hsl(var(--chart-4))" fill="url(#colorEnergy)" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-4))', r: 4 }} activeDot={{ r: 6 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600 }}
                        formatter={(value: any) => [`${value.toFixed(1)}%`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    </RadarChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
                    {safeReportData.performanceData.map((school: any, index: number) => (
                      <Card key={index} className="shadow-sm">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <CardTitle className="text-sm font-semibold">{school.school}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5 px-3 pb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Reciclagem</span>
                            <Badge variant="outline" className="text-xs h-5">{school.Reciclagem.toFixed(0)}%</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">CO₂</span>
                            <Badge variant="outline" className="text-xs h-5">{school["Redução CO2"].toFixed(0)}%</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Água</span>
                            <Badge variant="outline" className="text-xs h-5">{school["Economia Água"].toFixed(0)}%</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Energia</span>
                            <Badge variant="outline" className="text-xs h-5">{school["Economia Energia"].toFixed(0)}%</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">Sem dados de desempenho</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
