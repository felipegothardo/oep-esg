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

  const totalCO2 = entries.reduce((sum, entry) => sum + entry.co2Saved, 0);
  const totalRecycling = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  
  const monthsOfData = Math.max(1, entries.length / 3);
  const monthlyAverageCO2 = totalCO2 / monthsOfData;
  const monthlyAverageRecycling = totalRecycling / monthsOfData;
  
  const annualProjectionCO2 = monthlyAverageCO2 * 12;
  const annualProjectionRecycling = monthlyAverageRecycling * 12;
  
  // Equivalências: 1 árvore absorve ~21 kg CO2/ano (fonte: EPA GHG Equivalencies)
  const treesEquivalent = Math.round(annualProjectionCO2 / 21);
  // 1 carro emite ~4.600 kg CO2/ano (fonte: EPA)
  const carsOffRoad = annualProjectionCO2 / 4600;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <CalendarDays className="w-5 h-5" />
          Projeção Anual — {schoolName}
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
            <p className="text-sm text-muted-foreground">CO₂ evitado/ano</p>
          </div>
          
          <div className="text-center p-4 bg-card/60 rounded-lg border">
            <Target className="w-8 h-8 mx-auto text-accent mb-2" />
            <p className="text-2xl font-bold text-accent">{annualProjectionRecycling.toFixed(1)} kg</p>
            <p className="text-sm text-muted-foreground">Material reciclado/ano</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">Impacto Ambiental Equivalente</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
              <Leaf className="w-6 h-6 text-success flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-success">{treesEquivalent} árvores</p>
                <p className="text-xs text-muted-foreground">equivalente plantado por ano</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <Target className="w-6 h-6 text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-accent">{carsOffRoad.toFixed(2)} veículos</p>
                <p className="text-xs text-muted-foreground">fora de circulação/ano</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Projeção baseada no ritmo atual de {schoolName}. Fonte das equivalências: EPA GHG Equivalencies Calculator.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
