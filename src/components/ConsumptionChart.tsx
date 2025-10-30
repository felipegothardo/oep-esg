import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Zap, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

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

interface ConsumptionChartProps {
  entries: ConsumptionEntry[];
  goals: ConsumptionGoal[];
}

export default function ConsumptionChart({ entries, goals }: ConsumptionChartProps) {
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Filtrar entradas por período
  const filteredEntries = (() => {
    if (periodFilter === 'all') return entries;
    
    const now = new Date();
    const monthsAgo = parseInt(periodFilter);
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.month + '-01');
      return entryDate >= cutoffDate;
    });
  })();

  const waterEntries = filteredEntries.filter(e => e.type === 'water').sort((a, b) => a.month.localeCompare(b.month));
  const energyEntries = filteredEntries.filter(e => e.type === 'energy').sort((a, b) => a.month.localeCompare(b.month));
  
  const waterGoal = goals.find(g => g.type === 'water');
  const energyGoal = goals.find(g => g.type === 'energy');

  // Preparar dados para gráficos com metas
  const prepareChartData = (entries: ConsumptionEntry[], goal?: ConsumptionGoal) => {
    return entries.map((entry, index) => {
      const baseConsumption = entry.consumption;
      const baseCost = entry.cost;
      
      // Calcular meta baseada na redução percentual
      const targetConsumption = goal ? baseConsumption * (1 - goal.reductionPercentage / 100) : baseConsumption;
      const targetCost = goal ? baseCost * (1 - goal.reductionPercentage / 100) : baseCost;
      
      return {
        month: entry.month,
        consumo: baseConsumption,
        meta: targetConsumption,
        custo: baseCost,
        custoMeta: targetCost,
        economia: goal ? baseConsumption - targetConsumption : 0,
        economiaFinanceira: goal ? baseCost - targetCost : 0
      };
    });
  };

  const waterChartData = prepareChartData(waterEntries, waterGoal);
  const energyChartData = prepareChartData(energyEntries, energyGoal);

  // Calcular estatísticas
  const calculateStats = (entries: ConsumptionEntry[], goal?: ConsumptionGoal) => {
    if (entries.length === 0) return null;
    
    const totalConsumption = entries.reduce((sum, e) => sum + e.consumption, 0);
    const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
    const avgConsumption = totalConsumption / entries.length;
    const avgCost = totalCost / entries.length;
    
    const potentialSavings = goal ? {
      consumption: avgConsumption * goal.reductionPercentage / 100,
      cost: avgCost * goal.reductionPercentage / 100
    } : null;
    
    return {
      total: { consumption: totalConsumption, cost: totalCost },
      average: { consumption: avgConsumption, cost: avgCost },
      savings: potentialSavings
    };
  };

  const waterStats = calculateStats(waterEntries, waterGoal);
  const energyStats = calculateStats(energyEntries, energyGoal);

  if (entries.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardHeader className="text-center">
          <div className="flex justify-center gap-4 mb-4">
            <Droplets className="w-8 h-8 text-blue-500" />
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
          <CardTitle className="text-muted-foreground">Nenhum dado de consumo</CardTitle>
          <CardDescription>
            Registre seu consumo de água e energia para ver os gráficos e metas
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de período */}
      <Card className="border-0 shadow-soft">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Período:</label>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Último ano</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="water" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="water" className="flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Água
          </TabsTrigger>
          <TabsTrigger value="energy" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Energia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="water" className="space-y-6">
          {waterStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-soft bg-blue-50">
                <CardContent className="pt-6 text-center">
                  <Droplets className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{waterStats.average.consumption.toFixed(0)} L</p>
                  <p className="text-sm text-muted-foreground">Consumo médio mensal</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-soft bg-green-50">
                <CardContent className="pt-6 text-center">
                  <div className="w-8 h-8 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-green-600 font-bold text-xs">R$</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">R$ {waterStats.average.cost.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Custo médio mensal</p>
                </CardContent>
              </Card>
              {waterStats.savings && (
                <Card className="border-0 shadow-soft bg-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Target className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-primary">{waterStats.savings.consumption.toFixed(0)} L</p>
                    <p className="text-sm text-muted-foreground">Economia potencial</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {waterChartData.length > 0 && (
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-blue-600">Consumo de Água vs Meta</CardTitle>
                <CardDescription>
                  Acompanhe seu consumo mensal e compare com sua meta de redução
                  {waterGoal && waterGoal.reductionPercentage > 0 && (
                    <span className="text-primary font-medium"> ({waterGoal.reductionPercentage}% de redução)</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waterChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(0)} L`, 
                          name === 'consumo' ? 'Consumo Real' : 'Meta'
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="consumo"
                        stroke="#3b82f6"
                        fill="url(#waterGradient)"
                        strokeWidth={3}
                        name="Consumo Real"
                      />
                      {waterGoal && waterGoal.reductionPercentage > 0 && (
                        <Area
                          type="monotone"
                          dataKey="meta"
                          stroke="#22c55e"
                          fill="url(#goalGradient)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Meta"
                        />
                      )}
                      <defs>
                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          {energyStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-soft bg-yellow-50">
                <CardContent className="pt-6 text-center">
                  <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{energyStats.average.consumption.toFixed(0)} kWh</p>
                  <p className="text-sm text-muted-foreground">Consumo médio mensal</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-soft bg-green-50">
                <CardContent className="pt-6 text-center">
                  <div className="w-8 h-8 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-green-600 font-bold text-xs">R$</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">R$ {energyStats.average.cost.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Custo médio mensal</p>
                </CardContent>
              </Card>
              {energyStats.savings && (
                <Card className="border-0 shadow-soft bg-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Target className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-primary">{energyStats.savings.consumption.toFixed(0)} kWh</p>
                    <p className="text-sm text-muted-foreground">Economia potencial</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {energyChartData.length > 0 && (
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-yellow-600">Consumo de Energia vs Meta</CardTitle>
                <CardDescription>
                  Acompanhe seu consumo mensal e compare com sua meta de redução
                  {energyGoal && energyGoal.reductionPercentage > 0 && (
                    <span className="text-primary font-medium"> ({energyGoal.reductionPercentage}% de redução)</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(0)} kWh`, 
                          name === 'consumo' ? 'Consumo Real' : 'Meta'
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="consumo"
                        stroke="#f59e0b"
                        fill="url(#energyGradient)"
                        strokeWidth={3}
                        name="Consumo Real"
                      />
                      {energyGoal && energyGoal.reductionPercentage > 0 && (
                        <Area
                          type="monotone"
                          dataKey="meta"
                          stroke="#22c55e"
                          fill="url(#goalGradient2)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Meta"
                        />
                      )}
                      <defs>
                        <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="goalGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}