import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Calculator, Recycle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
}

interface RecyclingCalculatorProps {
  onEntriesUpdate?: (entries: RecyclingEntry[]) => void;
  entries?: RecyclingEntry[];
}

// Fatores de conversão baseados em estudos ambientais (kg CO2 evitado por kg de material reciclado)
const CO2_FACTORS: Record<string, number> = {
  papel: 1.1, // 1.1 kg CO2 evitado por kg de papel reciclado
  papelao: 1.0,
  plastico_pet: 1.8,
  plastico_polietileno: 1.5,
  vidro: 0.3,
  aluminio: 8.0, // Maior impacto devido à economia de energia na produção
  aco: 1.4,
  eletronicos: 2.5,
  organico: 0.5,
  madeira: 0.9
};

const MATERIAL_LABELS: Record<string, string> = {
  papel: 'Papel',
  papelao: 'Papelão',
  plastico_pet: 'Plástico PET',
  plastico_polietileno: 'Plástico Polietileno',
  vidro: 'Vidro',
  aluminio: 'Alumínio',
  aco: 'Aço',
  eletronicos: 'Eletrônicos',
  organico: 'Orgânico',
  madeira: 'Madeira'
};

export default function RecyclingCalculator({ onEntriesUpdate }: RecyclingCalculatorProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [entries, setEntries] = useState<RecyclingEntry[]>([]);
  const { toast } = useToast();

  const calculateCO2 = () => {
    if (!selectedMaterial || !quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um material e insira uma quantidade válida.",
        variant: "destructive"
      });
      return;
    }

    const factor = CO2_FACTORS[selectedMaterial];
    const co2Saved = parseFloat(quantity) * factor;

    const newEntry: RecyclingEntry = {
      id: Date.now().toString(),
      material: MATERIAL_LABELS[selectedMaterial],
      quantity: parseFloat(quantity),
      co2Saved,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    // Notificar componente pai sobre mudança
    if (onEntriesUpdate) {
      onEntriesUpdate(updatedEntries);
    }
    
    setQuantity('');
    setSelectedMaterial('');

    toast({
      title: "Cálculo realizado!",
      description: `Você evitou ${co2Saved.toFixed(2)} kg de CO2 na atmosfera! 🌱`,
      variant: "default"
    });
  };

  const totalCO2Saved = entries.reduce((sum, entry) => sum + entry.co2Saved, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Calculadora */}
      <Card className="border-0 shadow-eco bg-gradient-to-br from-white to-secondary/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-eco rounded-full flex items-center justify-center animate-float">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-primary">Calculadora de CO2</CardTitle>
          <CardDescription className="text-muted-foreground">
            Calcule quantos kg de CO2 você evitou de emitir na atmosfera através da reciclagem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material">Tipo de Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Recycle className="w-4 h-4 text-primary" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade (kg)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 2.5"
                className="transition-smooth focus:shadow-soft"
              />
            </div>
          </div>

          <Button 
            onClick={calculateCO2} 
            className="w-full bg-gradient-eco hover:shadow-eco transition-smooth"
            size="lg"
          >
            <Leaf className="w-5 h-5 mr-2" />
            Calcular Redução de CO2
          </Button>
        </CardContent>
      </Card>

      {/* Resultado Total */}
      {totalCO2Saved > 0 && (
        <Card className="border-0 shadow-soft bg-gradient-nature text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Leaf className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Total Acumulado</h3>
              <p className="text-4xl font-bold">{totalCO2Saved.toFixed(2)} kg</p>
              <p className="text-white/90 mt-2">de CO2 evitado na atmosfera</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      {entries.length > 0 && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-primary">Histórico de Reciclagem</CardTitle>
            <CardDescription>Suas contribuições para o meio ambiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border-l-4 border-primary">
                  <div>
                    <p className="font-medium text-foreground">{entry.material}</p>
                    <p className="text-sm text-muted-foreground">{entry.quantity} kg • {entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{entry.co2Saved.toFixed(2)} kg CO2</p>
                    <p className="text-xs text-muted-foreground">evitado</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}