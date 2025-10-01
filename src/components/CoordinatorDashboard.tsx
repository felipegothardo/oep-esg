import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Recycle, Droplet, Zap, TrendingUp, Award, FileText, Download, Eye } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { exportToPDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';
import SchoolDashboard from './SchoolDashboard';

interface SchoolData {
  id: string;
  name: string;
  code: string;
  totalRecycling: number;
  totalCO2Saved: number;
  waterConsumption: number;
  energyConsumption: number;
  monthlyData: any[];
  recyclingEntries?: any[];
  consumptionEntries?: any[];
}

export default function CoordinatorDashboard() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'individual'>('overview');
  const [selectedSchoolData, setSelectedSchoolData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAllSchoolsData();
  }, []);

  const loadAllSchoolsData = async () => {
    setLoading(true);
    try {
      // Carregar todas as escolas (exceto OEP)
      const { data: schoolsList } = await supabase
        .from('schools')
        .select('*')
        .neq('code', 'OEP');

      if (!schoolsList) return;

      // Carregar dados de reciclagem e consumo para cada escola
      const schoolsWithData = await Promise.all(
        schoolsList.map(async (school) => {
          // Dados de reciclagem
          const { data: recyclingData } = await supabase
            .from('recycling_entries')
            .select('*')
            .eq('school_id', school.id)
            .order('entry_date', { ascending: false });

          // Dados de consumo
          const { data: consumptionData } = await supabase
            .from('consumption_entries')
            .select('*')
            .eq('school_id', school.id)
            .order('entry_date', { ascending: false });

          const totalRecycling = recyclingData?.reduce((sum, entry) => sum + entry.quantity, 0) || 0;
          const totalCO2Saved = recyclingData?.reduce((sum, entry) => sum + entry.co2_saved, 0) || 0;
          
          const waterConsumption = consumptionData
            ?.filter(e => e.type === 'water')
            ?.reduce((sum, entry) => sum + entry.consumption, 0) || 0;
          
          const energyConsumption = consumptionData
            ?.filter(e => e.type === 'energy')
            ?.reduce((sum, entry) => sum + entry.consumption, 0) || 0;

          // Agrupar dados por mês para gráficos
          const monthlyRecycling = recyclingData?.reduce((acc: any, entry) => {
            const month = new Date(entry.entry_date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            if (!acc[month]) {
              acc[month] = { month, recycling: 0, co2: 0 };
            }
            acc[month].recycling += entry.quantity;
            acc[month].co2 += entry.co2_saved;
            return acc;
          }, {});

          return {
            id: school.id,
            name: school.name,
            code: school.code,
            totalRecycling,
            totalCO2Saved,
            waterConsumption,
            energyConsumption,
            monthlyData: Object.values(monthlyRecycling || {}),
            recyclingEntries: recyclingData || [],
            consumptionEntries: consumptionData || []
          };
        })
      );

      setSchools(schoolsWithData);
    } catch (error) {
      console.error('Erro ao carregar dados das escolas:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados das escolas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalMetrics = () => {
    const filteredSchools = selectedSchool === 'all' 
      ? schools 
      : schools.filter(s => s.id === selectedSchool);

    return {
      totalRecycling: filteredSchools.reduce((sum, s) => sum + s.totalRecycling, 0),
      totalCO2: filteredSchools.reduce((sum, s) => sum + s.totalCO2Saved, 0),
      totalWater: filteredSchools.reduce((sum, s) => sum + s.waterConsumption, 0),
      totalEnergy: filteredSchools.reduce((sum, s) => sum + s.energyConsumption, 0),
      schoolCount: filteredSchools.length
    };
  };

  const handleExportGlobalReport = async () => {
    try {
      // Combinar dados de todas as escolas
      const allRecyclingEntries = schools.flatMap(s => s.recyclingEntries || []);
      const allConsumptionEntries = schools.flatMap(s => s.consumptionEntries || []);
      
      await exportToPDF(
        "Relatório Global - Todas as Escolas",
        allRecyclingEntries,
        allConsumptionEntries
      );
      
      toast({
        title: "Relatório exportado!",
        description: "O relatório global foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    }
  };

  const handleExportSchoolReport = async (school: SchoolData) => {
    try {
      await exportToPDF(
        school.name,
        school.recyclingEntries || [],
        school.consumptionEntries || []
      );
      
      toast({
        title: "Relatório exportado!",
        description: `Relatório de ${school.name} gerado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    }
  };

  const handleViewSchoolDetails = (school: SchoolData) => {
    setSelectedSchoolData(school);
    setViewMode('individual');
  };

  const metrics = getTotalMetrics();
  const topSchool = schools.reduce((prev, current) => 
    (current.totalCO2Saved > prev.totalCO2Saved) ? current : prev, 
    schools[0] || { name: '', totalCO2Saved: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando dados das escolas...</p>
        </div>
      </div>
    );
  }

  // Vista individual de escola
  if (viewMode === 'individual' && selectedSchoolData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dados de {selectedSchoolData.name}</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportSchoolReport(selectedSchoolData)}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              onClick={() => setViewMode('overview')}
              variant="outline"
              size="sm"
            >
              Voltar ao Resumo
            </Button>
          </div>
        </div>

        <SchoolDashboard
          schoolName={selectedSchoolData.name}
          schoolType="view-only"
          data={{
            recyclingEntries: selectedSchoolData.recyclingEntries || [],
            consumptionEntries: selectedSchoolData.consumptionEntries || [],
            consumptionGoals: []
          }}
          onRecyclingUpdate={() => {}}
          onConsumptionUpdate={() => {}}
          onDeleteAll={() => {}}
          onDeleteRecyclingByMonth={() => {}}
          onDeleteConsumptionByMonth={() => {}}
          viewOnly={true}
        />
      </div>
    );
  }

  // Vista geral
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Coordenação OEP - Visão Geral</h2>
          <p className="text-muted-foreground">Acompanhe o desempenho ambiental de todas as unidades</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar escola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Escolas</SelectItem>
              {schools.map(school => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleExportGlobalReport}
            variant="outline"
            size="default"
          >
            <FileText className="h-4 w-4 mr-2" />
            Relatório Global
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Escolas Ativas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.schoolCount}</div>
            <p className="text-xs text-muted-foreground">escolas participantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reciclagem Total</CardTitle>
            <Recycle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRecycling.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">materiais reciclados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Poupado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCO2.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">emissões evitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consumo de Água</CardTitle>
            <Droplet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalWater.toFixed(0)} m³</div>
            <p className="text-xs text-muted-foreground">consumo total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consumo de Energia</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEnergy.toFixed(0)} kWh</div>
            <p className="text-xs text-muted-foreground">consumo total</p>
          </CardContent>
        </Card>
      </div>

      {/* Escola Destaque */}
      {topSchool && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <CardTitle>Escola Destaque</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{topSchool.name}</p>
            <p className="text-sm text-muted-foreground">
              Maior economia de CO₂: {topSchool.totalCO2Saved.toFixed(1)} kg
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs com Análises */}
      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Escolas por CO₂ Poupado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {schools
                .sort((a, b) => b.totalCO2Saved - a.totalCO2Saved)
                .map((school, index) => (
                  <div key={school.id} className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 && "bg-yellow-500 text-white",
                      index === 1 && "bg-gray-400 text-white",
                      index === 2 && "bg-orange-600 text-white",
                      index > 2 && "bg-muted"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{school.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Reciclagem: {school.totalRecycling.toFixed(1)} kg</span>
                        <span>CO₂: {school.totalCO2Saved.toFixed(1)} kg</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleViewSchoolDetails(school)}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button
                        onClick={() => handleExportSchoolReport(school)}
                        variant="ghost"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Progress 
                      value={(school.totalCO2Saved / (topSchool?.totalCO2Saved || 1)) * 100} 
                      className="w-32"
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal - Reciclagem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={schools[0]?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="recycling" 
                    stroke="hsl(var(--primary))" 
                    name="Reciclagem (kg)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="hsl(var(--accent))" 
                    name="CO₂ Poupado (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparação entre Escolas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={schools.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRecycling" fill="hsl(var(--primary))" name="Reciclagem (kg)" />
                  <Bar dataKey="totalCO2Saved" fill="hsl(var(--accent))" name="CO₂ Poupado (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}