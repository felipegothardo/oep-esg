import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Calculator, Recycle, ChevronDown, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  // Papéis
  papel: 1.1,
  papelao: 1.0,
  papel_jornal: 0.9,
  papel_revista: 0.95,
  papel_cartao: 1.05,
  papel_sulfite: 1.15,
  
  // Plásticos
  plastico_pet: 1.8,
  plastico_polietileno: 1.5,
  plastico_pvc: 1.6,
  plastico_polipropileno: 1.4,
  plastico_poliestireno: 1.7,
  plastico_acrilico: 1.65,
  plastico_nylon: 1.9,
  sacolas_plasticas: 1.3,
  embalagens_plasticas: 1.5,
  garrafas_plasticas: 1.75,
  
  // Metais
  aluminio: 8.0,
  aco: 1.4,
  ferro: 1.2,
  cobre: 3.5,
  bronze: 2.8,
  latao: 2.5,
  lata_aluminio: 7.5,
  lata_aco: 1.3,
  
  // Vidros
  vidro: 0.3,
  vidro_temperado: 0.35,
  garrafas_vidro: 0.32,
  potes_vidro: 0.31,
  
  // Eletrônicos
  eletronicos: 2.5,
  pilhas: 3.0,
  baterias: 3.5,
  computadores: 2.8,
  celulares: 2.6,
  lampadas_fluorescentes: 2.2,
  lampadas_led: 2.0,
  
  // Orgânicos
  organico: 0.5,
  oleo_cozinha: 2.8,
  compostagem: 0.4,
  
  // Têxteis
  tecido_algodao: 1.8,
  tecido_sintetico: 2.1,
  roupas: 1.9,
  calcados: 1.6,
  
  // Outros
  madeira: 0.9,
  borracha: 1.1,
  pneus: 1.3,
  isopor: 0.8,
  tetra_pak: 1.2,
  cd_dvd: 1.4,
  radiografias: 1.5,
  esponja: 0.7,
  ceramica: 0.4,
  gesso: 0.3
};

const MATERIAL_LABELS: Record<string, string> = {
  // Papéis
  papel: 'Papel',
  papelao: 'Papelão',
  papel_jornal: 'Papel Jornal',
  papel_revista: 'Papel Revista',
  papel_cartao: 'Papel Cartão',
  papel_sulfite: 'Papel Sulfite',
  
  // Plásticos
  plastico_pet: 'Plástico PET',
  plastico_polietileno: 'Plástico Polietileno',
  plastico_pvc: 'Plástico PVC',
  plastico_polipropileno: 'Plástico Polipropileno',
  plastico_poliestireno: 'Plástico Poliestireno (PS)',
  plastico_acrilico: 'Plástico Acrílico',
  plastico_nylon: 'Plástico Nylon',
  sacolas_plasticas: 'Sacolas Plásticas',
  embalagens_plasticas: 'Embalagens Plásticas',
  garrafas_plasticas: 'Garrafas Plásticas',
  
  // Metais
  aluminio: 'Alumínio',
  aco: 'Aço',
  ferro: 'Ferro',
  cobre: 'Cobre',
  bronze: 'Bronze',
  latao: 'Latão',
  lata_aluminio: 'Lata de Alumínio',
  lata_aco: 'Lata de Aço',
  
  // Vidros
  vidro: 'Vidro',
  vidro_temperado: 'Vidro Temperado',
  garrafas_vidro: 'Garrafas de Vidro',
  potes_vidro: 'Potes de Vidro',
  
  // Eletrônicos
  eletronicos: 'Eletrônicos',
  pilhas: 'Pilhas',
  baterias: 'Baterias',
  computadores: 'Computadores',
  celulares: 'Celulares',
  lampadas_fluorescentes: 'Lâmpadas Fluorescentes',
  lampadas_led: 'Lâmpadas LED',
  
  // Orgânicos
  organico: 'Orgânico',
  oleo_cozinha: 'Óleo de Cozinha',
  compostagem: 'Compostagem',
  
  // Têxteis
  tecido_algodao: 'Tecido de Algodão',
  tecido_sintetico: 'Tecido Sintético',
  roupas: 'Roupas',
  calcados: 'Calçados',
  
  // Outros
  madeira: 'Madeira',
  borracha: 'Borracha',
  pneus: 'Pneus',
  isopor: 'Isopor',
  tetra_pak: 'Tetra Pak',
  cd_dvd: 'CD/DVD',
  radiografias: 'Radiografias',
  esponja: 'Esponja',
  ceramica: 'Cerâmica',
  gesso: 'Gesso'
};

export default function RecyclingCalculator({ onEntriesUpdate, entries = [] }: RecyclingCalculatorProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Filtrar materiais baseado no termo de busca
  const filteredMaterials = useMemo(() => {
    if (!searchTerm) return Object.entries(MATERIAL_LABELS);
    
    return Object.entries(MATERIAL_LABELS).filter(([key, label]) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
      <Card className="border-0 shadow-eco bg-gradient-to-br from-card to-secondary/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-eco rounded-full flex items-center justify-center animate-float">
            <Calculator className="w-8 h-8 text-primary-foreground" />
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
              <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="w-full justify-between font-normal"
              >
                {selectedMaterial
                  ? MATERIAL_LABELS[selectedMaterial]
                  : "Selecionar material..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {/* Dialog para seleção de material */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Selecione o Material Reciclável</DialogTitle>
                  </DialogHeader>
                  
                  {/* Campo de busca */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar material..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {/* Lista de materiais */}
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {filteredMaterials.map(([key, label]) => (
                        <Button
                          key={key}
                          variant="ghost"
                          className="w-full justify-start hover:bg-secondary"
                          onClick={() => {
                            setSelectedMaterial(key);
                            setOpen(false);
                            setSearchTerm('');
                          }}
                        >
                          <Recycle className="mr-2 h-4 w-4 text-primary" />
                          <span className="flex-1 text-left">{label}</span>
                          <span className="text-xs text-muted-foreground">
                            {CO2_FACTORS[key]} kg CO2/kg
                          </span>
                        </Button>
                      ))}
                      {filteredMaterials.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum material encontrado
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
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
        <Card className="border-0 shadow-soft bg-gradient-nature text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Leaf className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Total Acumulado</h3>
              <p className="text-4xl font-bold">{totalCO2Saved.toFixed(2)} kg</p>
              <p className="text-primary-foreground/90 mt-2">de CO2 evitado na atmosfera</p>
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