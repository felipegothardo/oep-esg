import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  unit: string;
  format?: (value: number) => string;
}

interface PeriodComparisonProps {
  comparisons: ComparisonData[];
  title?: string;
}

export function PeriodComparison({ 
  comparisons,
  title = "Comparação de Períodos" 
}: PeriodComparisonProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-red-600 dark:text-red-400";
    if (change < 0) return "text-green-600 dark:text-green-400";
    return "text-muted-foreground";
  };

  const getChangeBadgeVariant = (change: number): "default" | "destructive" | "secondary" => {
    if (change > 0) return "destructive";
    if (change < 0) return "default";
    return "secondary";
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparisons.map((comparison, index) => {
            const change = calculateChange(comparison.current, comparison.previous);
            const formatter = comparison.format || ((val) => val.toFixed(2));

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover-scale transition-all"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{comparison.label}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Anterior: {formatter(comparison.previous)} {comparison.unit}
                    </span>
                    <span className="font-semibold">
                      Atual: {formatter(comparison.current)} {comparison.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={getChangeBadgeVariant(change)}
                    className="flex items-center gap-1"
                  >
                    {getChangeIcon(change)}
                    {Math.abs(change).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
