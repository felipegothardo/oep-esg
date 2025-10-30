import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Recycle, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
  month?: string;
}

interface RecyclingChartProps {
  entries: RecyclingEntry[];
}

// Paleta de cores distintas para materiais
const MATERIAL_COLORS = [
  'hsl(210, 70%, 50%)',   // Azul vibrante
  'hsl(142, 70%, 45%)',   // Verde
  'hsl(35, 85%, 55%)',    // Laranja
  'hsl(265, 70%, 55%)',   // Roxo
  'hsl(345, 75%, 55%)',   // Rosa/Vermelho
  'hsl(190, 70%, 50%)',   // Ciano
  'hsl(280, 65%, 55%)',   // Magenta
  'hsl(160, 65%, 45%)',   // Verde-água
  'hsl(25, 80%, 55%)',    // Laranja escuro
  'hsl(220, 70%, 50%)',   // Azul índigo
  'hsl(85, 60%, 45%)',    // Verde-lima
  'hsl(310, 70%, 55%)',   // Rosa púrpura
];

const getColorForMaterial = (material: string, index: number): string => {
  return MATERIAL_COLORS[index % MATERIAL_COLORS.length];
};

export default function RecyclingChart({ entries }: RecyclingChartProps) {
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Filtrar entradas por período
  const filteredEntries = (() => {
    if (periodFilter === 'all') return entries;
    
    const now = new Date();
    const monthsAgo = parseInt(periodFilter);
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    
    return entries.filter(entry => {
      const entryDate = entry.month 
        ? new Date(entry.month + '-01')
        : new Date(entry.date);
      return entryDate >= cutoffDate;
    });
  })();

  // Agrupar dados por mês
  const monthlyData = filteredEntries.reduce((acc, entry) => {
    const monthKey = entry.month || entry.date;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, RecyclingEntry[]>);

  // Agregar dados por material
  const materialData = filteredEntries.reduce((acc, entry) => {
    const existing = acc.find(item => item.material === entry.material);
    if (existing) {
      existing.quantity += entry.quantity;
      existing.co2Saved += entry.co2Saved;
      existing.count += 1;
    } else {
      acc.push({
        material: entry.material,
        quantity: entry.quantity,
        co2Saved: entry.co2Saved,
        count: 1
      });
    }
    return acc;
  }, [] as Array<{material: string; quantity: number; co2Saved: number; count: number}>);

  // Dados para gráfico de pizza (quantidade)
  const pieData = materialData.map((item, index) => ({
    name: item.material,
    value: item.quantity,
    color: getColorForMaterial(item.material, index)
  }));

  // Dados para gráfico de barras (CO2 economizado)
  const barData = materialData.map(item => ({
    material: item.material.length > 10 ? item.material.substring(0, 10) + '...' : item.material,
    co2: item.co2Saved,
    quantidade: item.quantity
  }));

  if (entries.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardHeader className="text-center">
          <Recycle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-muted-foreground">Nenhum dado de reciclagem</CardTitle>
          <CardDescription>
            Comece a registrar suas reciclagens para ver os gráficos
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalQuantity = materialData.reduce((sum, item) => sum + item.quantity, 0);
  const totalCO2 = materialData.reduce((sum, item) => sum + item.co2Saved, 0);

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

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{materialData.length}</p>
            <p className="text-sm text-muted-foreground">Tipos reciclados</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="pt-6 text-center">
            <Recycle className="w-8 h-8 mx-auto text-accent mb-2" />
            <p className="text-2xl font-bold text-accent">{totalQuantity.toFixed(1)} kg</p>
            <p className="text-sm text-muted-foreground">Total reciclado</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="pt-6 text-center">
            <div className="w-8 h-8 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-success font-bold">CO2</span>
            </div>
            <p className="text-2xl font-bold text-success">{totalCO2.toFixed(1)} kg</p>
            <p className="text-sm text-muted-foreground">CO2 evitado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de evolução mensal */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-primary">Evolução Mensal da Reciclagem</CardTitle>
          <CardDescription>Quantidade reciclada por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={Object.entries(monthlyData).map(([month, entries]) => ({
                  month: entries[0].month ? 
                    new Date(entries[0].month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 
                    month,
                  total: entries.reduce((sum, e) => sum + e.quantity, 0),
                  co2: entries.reduce((sum, e) => sum + e.co2Saved, 0)
                })).sort((a, b) => a.month.localeCompare(b.month))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'total' ? `${value.toFixed(1)} kg` : `${value.toFixed(2)} kg CO2`,
                    name === 'total' ? 'Quantidade' : 'CO2 Evitado'
                  ]}
                />
                <Bar 
                  dataKey="total" 
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  name="total"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de pizza - Distribuição por material */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-primary">Distribuição de Materiais Reciclados</CardTitle>
          <CardDescription>Quantidade em kg por tipo de material</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Quantidade']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de barras - CO2 economizado */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-primary">Impacto Ambiental por Material</CardTitle>
          <CardDescription>CO2 evitado na atmosfera (kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="material" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} kg CO2`, 
                    name === 'co2' ? 'CO2 Evitado' : name
                  ]}
                  labelFormatter={(label) => `Material: ${label}`}
                />
                <Bar 
                  dataKey="co2" 
                  fill="url(#gradientCO2)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradientCO2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Lista detalhada */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-primary">Detalhamento por Material</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {materialData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getColorForMaterial(item.material, index) }}
                  />
                  <div>
                    <p className="font-medium">{item.material}</p>
                    <p className="text-sm text-muted-foreground">{item.count} registro(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{item.quantity.toFixed(1)} kg</p>
                  <p className="text-sm text-success">{item.co2Saved.toFixed(2)} kg CO2</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}