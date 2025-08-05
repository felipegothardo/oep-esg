import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MobileStatsProps {
  totalCO2: number;
  totalRecycled: number;
  waterConsumption: number;
  energyConsumption: number;
  schoolName?: string;
}

export default function MobileStats({ 
  totalCO2, 
  totalRecycled, 
  waterConsumption, 
  energyConsumption, 
  schoolName 
}: MobileStatsProps) {
  const getTrend = (value: number, previousValue: number = 0) => {
    if (value > previousValue) return { icon: TrendingUp, color: 'text-green-600', trend: 'up' };
    if (value < previousValue) return { icon: TrendingDown, color: 'text-red-600', trend: 'down' };
    return { icon: Minus, color: 'text-gray-600', trend: 'stable' };
  };

  const co2Trend = getTrend(totalCO2);
  const recycledTrend = getTrend(totalRecycled);

  return (
    <div className="md:hidden space-y-3 p-4 bg-muted/30 rounded-lg">
      {schoolName && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{schoolName}</h4>
          <Badge variant="secondary" className="text-xs">
            {new Date().toLocaleDateString('pt-BR')}
          </Badge>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-green-700">{totalCO2.toFixed(1)}</p>
                <p className="text-xs text-green-600">kg CO2 evitado</p>
              </div>
              <co2Trend.icon className={`h-4 w-4 ${co2Trend.color}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-blue-700">{totalRecycled.toFixed(1)}</p>
                <p className="text-xs text-blue-600">kg reciclados</p>
              </div>
              <recycledTrend.icon className={`h-4 w-4 ${recycledTrend.color}`} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>💧 {waterConsumption.toLocaleString()}L</span>
        <span>⚡ {energyConsumption}kWh</span>
      </div>
    </div>
  );
}