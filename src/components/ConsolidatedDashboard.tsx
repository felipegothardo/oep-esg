import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Leaf, Droplets, Zap, Trophy, TrendingUp, Target } from 'lucide-react';

interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
}

interface ConsumptionEntry {
  id: string;
  type: 'water' | 'energy';
  month: string;
  cost: number;
  consumption: number;
  date: string;
}

interface ConsumptionGoal {
  type: 'water' | 'energy';
  reductionPercentage: number;
}

interface SchoolData {
  recyclingEntries: RecyclingEntry[];
  consumptionEntries: ConsumptionEntry[];
  consumptionGoals: ConsumptionGoal[];
}

interface ConsolidatedDashboardProps {
  elviraData: SchoolData;
  oswaldData: SchoolData;
  piagetData: SchoolData;
  santoAntonioData: SchoolData;
}

export default function ConsolidatedDashboard({ elviraData, oswaldData, piagetData, santoAntonioData }: ConsolidatedDashboardProps) {
  const schools = [
    { name: 'Elvira Brandão', data: elviraData, color: 'bg-blue-500' },
    { name: 'Oswald', data: oswaldData, color: 'bg-green-500' },
    { name: 'Piaget', data: piagetData, color: 'bg-purple-500' },
    { name: 'Santo Antônio', data: santoAntonioData, color: 'bg-orange-500' }
  ];

  const calculateSchoolStats = (data: SchoolData) => {
    const totalCO2 = data.recyclingEntries.reduce((sum, entry) => sum + entry.co2Saved, 0);
    const totalRecycling = data.recyclingEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const lastWater = data.consumptionEntries.filter(e => e.type === 'water').slice(-1)[0]?.consumption || 0;
    const lastEnergy = data.consumptionEntries.filter(e => e.type === 'energy').slice(-1)[0]?.consumption || 0;
    
    return { totalCO2, totalRecycling, lastWater, lastEnergy };
  };

  const allSchoolsStats = schools.map(school => ({
    ...school,
    stats: calculateSchoolStats(school.data)
  }));

  // Ranking por CO2 economizado
  const co2Ranking = [...allSchoolsStats]
    .sort((a, b) => b.stats.totalCO2 - a.stats.totalCO2);

  // Totais gerais
  const totalCO2Global = allSchoolsStats.reduce((sum, school) => sum + school.stats.totalCO2, 0);
  const totalRecyclingGlobal = allSchoolsStats.reduce((sum, school) => sum + school.stats.totalRecycling, 0);

  // Equivalências ambientais
  const treesEquivalent = Math.round(totalCO2Global * 0.05); // 1 árvore ≈ 20kg CO2/ano
  const carsOffRoad = Math.round(totalCO2Global / 4600); // Carro médio emite 4,6 ton CO2/ano

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Dashboard Consolidado</h2>
        <p className="text-muted-foreground">Visão geral de todas as escolas</p>
      </div>

      {/* Métricas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-nature text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Leaf className="w-12 h-12 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalCO2Global.toFixed(1)} kg</p>
              <p className="text-sm opacity-90">CO2 Total Evitado</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-500 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalRecyclingGlobal.toFixed(1)} kg</p>
              <p className="text-sm opacity-90">Material Reciclado</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-600 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Leaf className="w-12 h-12 mx-auto mb-2" />
              <p className="text-2xl font-bold">{treesEquivalent}</p>
              <p className="text-sm opacity-90">Árvores Plantadas*</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-500 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-2" />
              <p className="text-2xl font-bold">{carsOffRoad}</p>
              <p className="text-sm opacity-90">Carros Fora de Circulação*</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Escolas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Ranking de CO2 Economizado
          </CardTitle>
          <CardDescription>Classificação das escolas por impacto ambiental</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {co2Ranking.map((school, index) => (
              <div key={school.name} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {index + 1}º
                  </Badge>
                  <div className={`w-4 h-4 rounded-full ${school.color}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{school.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{school.stats.totalCO2.toFixed(1)} kg CO2</span>
                    <span>{school.stats.totalRecycling.toFixed(1)} kg reciclados</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <Progress 
                    value={totalCO2Global > 0 ? (school.stats.totalCO2 / totalCO2Global) * 100 : 0} 
                    className="w-24 mb-1" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {totalCO2Global > 0 ? ((school.stats.totalCO2 / totalCO2Global) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo Detalhado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {allSchoolsStats.map((school) => (
          <Card key={school.name} className="border-l-4" style={{ borderLeftColor: school.color.replace('bg-', '#') }}>
            <CardHeader>
              <CardTitle className="text-lg">{school.name}</CardTitle>
              <CardDescription>Resumo de desempenho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Leaf className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <p className="font-bold text-green-700">{school.stats.totalCO2.toFixed(1)}</p>
                  <p className="text-xs text-green-600">kg CO2</p>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Droplets className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                  <p className="font-bold text-blue-700">{school.stats.lastWater.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">L água/mês</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Zap className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
                <p className="font-bold text-yellow-700">{school.stats.lastEnergy}</p>
                <p className="text-xs text-yellow-600">kWh energia/mês</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nota sobre equivalências */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            * Equivalências baseadas em médias: 1 árvore absorve ~20kg CO2/ano, 1 carro emite ~4,6 ton CO2/ano
          </p>
        </CardContent>
      </Card>
    </div>
  );
}