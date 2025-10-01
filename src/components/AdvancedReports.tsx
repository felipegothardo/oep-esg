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
  Droplets, Zap, Recycle, Calendar, School, Target
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

export default function AdvancedReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [reportData, setReportData] = useState<any>(null);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedSchool]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Get date range based on selected period
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

      // Load schools (excluding OEP)
      const { data: schoolsData } = await supabase
        .from("schools")
        .select("*")
        .neq('code', 'OEP')
        .order("name");

      if (!schoolsData) return;

      // Load data for each school
      const schoolsWithData: SchoolData[] = [];

      for (const school of schoolsData) {
        // Skip if specific school is selected and this isn't it
        if (selectedSchool !== "all" && school.id !== selectedSchool) continue;

        // Load recycling data
        const { data: recyclingData } = await supabase
          .from("recycling_entries")
          .select("*")
          .eq("school_id", school.id)
          .gte("entry_date", startDate.toISOString().split("T")[0])
          .lte("entry_date", endDate.toISOString().split("T")[0]);

        // Load consumption data
        const { data: consumptionData } = await supabase
          .from("consumption_entries")
          .select("*")
          .eq("school_id", school.id)
          .gte("entry_date", startDate.toISOString().split("T")[0])
          .lte("entry_date", endDate.toISOString().split("T")[0]);

        // Load goals
        const { data: goalsData } = await supabase
          .from("consumption_goals")
          .select("*")
          .eq("school_id", school.id);

        // Process data
        const totalRecycled = recyclingData?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
        const totalCO2 = recyclingData?.reduce((sum, item) => sum + Number(item.co2_saved), 0) || 0;

        // Group recycling by material
        const materialGroups = recyclingData?.reduce((acc: any, item) => {
          if (!acc[item.material]) acc[item.material] = 0;
          acc[item.material] += Number(item.quantity);
          return acc;
        }, {});

        const recyclingByMaterial = Object.entries(materialGroups || {}).map(([material, quantity]) => ({
          material,
          quantity: quantity as number
        }));

        // Calculate monthly trends
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

        // Calculate consumption trends
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

        // Process goals
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
        description: "Não foi possível carregar os dados dos relatórios",
        variant: "destructive"
      });
      setReportData(null);
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
    // Ranking data
    const ranking = schoolsData
      .map(school => ({
        name: school.name,
        recycled: school.totalRecycled,
        co2: school.totalCO2,
        score: school.totalRecycled * 0.5 + school.totalCO2 * 10
      }))
      .sort((a, b) => b.score - a.score);

    // Comparison data
    const comparison = schoolsData.map(school => ({
      name: school.name.replace("Escola ", ""),
      Reciclagem: school.totalRecycled,
      CO2: school.totalCO2,
      Água: school.waterConsumption,
      Energia: school.energyConsumption
    }));

    // Materials distribution
    const allMaterials: any = {};
    schoolsData.forEach(school => {
      school.recyclingByMaterial.forEach(item => {
        if (!allMaterials[item.material]) allMaterials[item.material] = 0;
        allMaterials[item.material] += item.quantity;
      });
    });

    const materialsData = Object.entries(allMaterials).map(([material, quantity]) => ({
      name: material,
      value: quantity as number
    }));

    // Performance metrics
    const performanceData = schoolsData.map(school => ({
      school: school.name.replace("Escola ", ""),
      Reciclagem: Math.min(100, (school.totalRecycled / 1000) * 100),
      "Redução CO2": Math.min(100, (school.totalCO2 / 500) * 100),
      "Economia Água": school.goals.find(g => g.type === "Água")?.current || 0,
      "Economia Energia": school.goals.find(g => g.type === "Energia")?.current || 0
    }));

    setReportData({
      ranking,
      comparison,
      materialsData,
      performanceData,
      totals: {
        recycling: schoolsData.reduce((sum, s) => sum + s.totalRecycled, 0),
        co2: schoolsData.reduce((sum, s) => sum + s.totalCO2, 0),
        water: schoolsData.reduce((sum, s) => sum + s.waterConsumption, 0),
        energy: schoolsData.reduce((sum, s) => sum + s.energyConsumption, 0),
        schools: schoolsData.length
      }
    });
  };

  const exportPDF = async () => {
    if (!reportData) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const reportElement = document.getElementById("advanced-report");
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-comparativo-${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "Relatório exportado",
        description: "O PDF foi baixado com sucesso",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    }
  };

  const exportCSV = () => {
    if (!reportData) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (!reportData) return;

      let csv = "Relatório Comparativo OEP Sustentável\n";
      csv += `Período: ${selectedPeriod === "1month" ? "1 mês" : selectedPeriod === "3months" ? "3 meses" : selectedPeriod === "6months" ? "6 meses" : "1 ano"}\n\n`;

      // Totals
      csv += "Resumo Geral\n";
      csv += `Total Reciclado,${reportData.totals.recycling} kg\n`;
      csv += `Total CO2 Evitado,${reportData.totals.co2} kg\n`;
      csv += `Consumo Total de Água,${reportData.totals.water} m³\n`;
      csv += `Consumo Total de Energia,${reportData.totals.energy} kWh\n\n`;

      // Ranking
      csv += "Ranking das Escolas\n";
      csv += "Posição,Escola,Material Reciclado (kg),CO2 Evitado (kg),Pontuação\n";
      reportData.ranking.forEach((school: any, index: number) => {
        csv += `${index + 1},${school.name},${school.recycled},${school.co2},${school.score.toFixed(2)}\n`;
      });

      // Download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio-comparativo-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Relatório exportado",
        description: "O CSV foi baixado com sucesso",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o CSV",
        variant: "destructive"
      });
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

  if (!reportData || schools.length === 0) {
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

  return (
    <div id="advanced-report" className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Relatórios Avançados</h2>
          <p className="text-muted-foreground">Análise comparativa entre escolas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 mês</SelectItem>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="1year">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reciclado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Recycle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">
                {reportData?.totals.recycling.toFixed(1)} kg
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CO2 Evitado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">
                {reportData?.totals.co2.toFixed(1)} kg
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consumo de Água
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              <span className="text-2xl font-bold">
                {reportData?.totals.water.toFixed(0)} m³
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consumo de Energia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">
                {reportData?.totals.energy.toFixed(0)} kWh
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escolas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">
                {reportData?.totals.schools}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Sustentabilidade</CardTitle>
              <CardDescription>
                Classificação das escolas baseada em reciclagem e redução de CO2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData?.ranking.map((school: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                      {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                      {index === 2 && <Award className="h-5 w-5 text-orange-600" />}
                      {index > 2 && <span className="font-bold">{index + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{school.name}</span>
                        <Badge variant="outline">
                          {school.score.toFixed(0)} pts
                        </Badge>
                      </div>
                      <Progress value={(school.score / reportData.ranking[0].score) * 100} className="h-2" />
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{school.recycled.toFixed(1)} kg reciclados</span>
                        <span>{school.co2.toFixed(1)} kg CO2 evitados</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparação entre Escolas</CardTitle>
              <CardDescription>
                Visualização comparativa de todos os indicadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData?.comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Reciclagem" fill="#10b981" />
                  <Bar dataKey="CO2" fill="#3b82f6" />
                  <Bar dataKey="Água" fill="#06b6d4" />
                  <Bar dataKey="Energia" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Materiais Reciclados</CardTitle>
              <CardDescription>
                Proporção de cada tipo de material reciclado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={reportData?.materialsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData?.materialsData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Desempenho</CardTitle>
              <CardDescription>
                Análise multidimensional do desempenho ambiental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={reportData?.performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="school" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Reciclagem" dataKey="Reciclagem" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Radar name="Redução CO2" dataKey="Redução CO2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Economia Água" dataKey="Economia Água" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  <Radar name="Economia Energia" dataKey="Economia Energia" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}