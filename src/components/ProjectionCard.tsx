import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, TrendingUp, Leaf, Target } from 'lucide-react';

interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
}

interface ProjectionCardProps {
  entries: RecyclingEntry[];
  schoolName: string;
}

export default function ProjectionCard({ entries, schoolName }: ProjectionCardProps) {
  if (entries.length === 0) return null;

  // Calcular projeção anual baseada na média mensal
  const totalCO2 = entries.reduce((sum, entry) => sum + entry.co2Saved, 0);
  const totalRecycling = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  
  // Assumir que os dados representam alguns meses de atividade
  const monthsOfData = Math.max(1, entries.length / 3); // Estimativa baseada em registros
  const monthlyAverageCO2 = totalCO2 / monthsOfData;
  const monthlyAverageRecycling = totalRecycling / monthsOfData;
  
  const annualProjectionCO2 = monthlyAverageCO2 * 12;
  const annualProjectionRecycling = monthlyAverageRecycling * 12;
  
  // Equivalências ambientais
  const treesEquivalent = Math.round(annualProjectionCO2 * 0.05);
  const carsOffRoad = annualProjectionCO2 / 4600;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <CalendarDays className="w-5 h-5" />
          Projeção Anual - {schoolName}
        </CardTitle>
        <CardDescription>
          Baseado na média de {monthsOfData.toFixed(1)} meses de atividade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-card/60 rounded-lg border">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{annualProjectionCO2.toFixed(1)} kg</p>
            <p className="text-sm text-muted-foreground">CO2 evitado/ano</p>
          </div>
          
          <div className="text-center p-4 bg-card/60 rounded-lg border">
            <Target className="w-8 h-8 mx-auto text-accent mb-2" />
            <p className="text-2xl font-bold text-accent">{annualProjectionRecycling.toFixed(1)} kg</p>
            <p className="text-sm text-muted-foreground">Material reciclado/ano</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-primary">Impacto Ambiental Equivalente:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-700">{treesEquivalent} árvores</p>
                <p className="text-xs text-green-600">plantadas por ano</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-bold text-orange-700">{carsOffRoad.toFixed(1)} carros</p>
                <p className="text-xs text-orange-600">fora de circulação</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 Se continuar neste ritmo, a escola {schoolName} terá um impacto significativo no meio ambiente!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}