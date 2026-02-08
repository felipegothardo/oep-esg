import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Calculator, Recycle, ChevronDown, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DeleteRecordsDialog } from '@/components/DeleteRecordsDialog';
import { supabase } from '@/integrations/supabase/client';
import { MonthYearPicker } from '@/components/MonthYearPicker';

interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
  month?: string;
}

interface RecyclingCalculatorProps {
  onEntriesUpdate?: (entries: RecyclingEntry[]) => void;
  entries?: RecyclingEntry[];
  schoolType?: string;
}

interface CustomMaterial {
  id: string;
  name: string;
  co2Factor: number;
}

// Fatores de conversão (kg CO2 evitado por kg de material reciclado)
// Fontes: EPA WARM v16 (2023), UK DEFRA GHG Conversion Factors (2025), Climatiq/Idemat
const BASE_CO2_FACTORS: Record<string, number> = {
  papel: 1.1,           // EPA WARM: ~0.9-1.3 | DEFRA: ~0.9 | Média adotada: 1.1
  plastico: 1.4,        // EPA WARM PET: ~1.0, HDPE: ~0.8, PP: ~0.8 | Média mista: 1.4
  vidro: 0.3,           // EPA WARM: ~0.31 | DEFRA: ~0.3
  metal: 1.8,           // EPA WARM aço: ~1.8 | DEFRA: ~1.8
  pilhas: 3.0,          // Estimativa baseada em composição mista
  baterias: 3.5,        // Estimativa baseada em composição mista
  capsulas_cafe: 2.5,   // Componente alumínio + orgânico
  eletronicos: 2.5,     // E-waste: alta variabilidade
  lacres: 8.0,          // Alumínio puro: EPA ~8.0-9.0
  tampas_pet: 1.4,      // PET/PP: EPA WARM ~1.0-1.5
  instrumentos_escrita: 1.6, // Plástico misto
};

const BASE_MATERIAL_LABELS: Record<string, string> = {
  papel: 'Papel',
  plastico: 'Plástico',
  vidro: 'Vidro',
  metal: 'Metal',
  pilhas: 'Pilhas',
  baterias: 'Baterias',
  capsulas_cafe: 'Cápsulas de café',
  eletronicos: 'Eletrônicos',
  lacres: 'Lacres',
  tampas_pet: 'Tampas PET',
  instrumentos_escrita: 'Instrumentos de escrita',
};

export default function RecyclingCalculator({ onEntriesUpdate, entries = [], schoolType = 'default' }: RecyclingCalculatorProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialCO2, setNewMaterialCO2] = useState(''); 
  const { toast } = useToast();

  // Carregar materiais customizados do localStorage
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>(() => {
    const storageKey = `customMaterials_${schoolType}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });

  // Salvar materiais customizados no localStorage sempre que mudarem
  useEffect(() => {
    const storageKey = `customMaterials_${schoolType}`;
    localStorage.setItem(storageKey, JSON.stringify(customMaterials));
  }, [customMaterials, schoolType]);

  // Combinar materiais base com customizados
  const allMaterials = useMemo(() => {
    const combined: Record<string, string> = { ...BASE_MATERIAL_LABELS };
    customMaterials.forEach(material => {
      combined[material.id] = material.name;
    });
    return combined;
  }, [customMaterials]);

  const allCO2Factors = useMemo(() => {
    const combined: Record<string, number> = { ...BASE_CO2_FACTORS };
    customMaterials.forEach(material => {
      combined[material.id] = material.co2Factor;
    });
    return combined;
  }, [customMaterials]);

  // Filtrar materiais baseado no termo de busca
  const filteredMaterials = useMemo(() => {
    if (!searchTerm) return Object.entries(allMaterials);
    
    return Object.entries(allMaterials).filter(([key, label]) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allMaterials]);

  const handleAddCustomMaterial = () => {
    if (!newMaterialName.trim() || !newMaterialCO2 || parseFloat(newMaterialCO2) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      });
      return;
    }

    const newMaterial: CustomMaterial = {
      id: `custom_${Date.now()}`,
      name: newMaterialName.trim(),
      co2Factor: parseFloat(newMaterialCO2)
    };

    setCustomMaterials(prev => [...prev, newMaterial]);
    setNewMaterialName('');
    setNewMaterialCO2('');
    setShowAddMaterialDialog(false);

    toast({
      title: "Material adicionado!",
      description: `${newMaterial.name} foi adicionado à lista de materiais.`,
    });
  };

  const calculateCO2 = () => {
    console.log('calculateCO2 called - Material:', selectedMaterial, 'Quantity:', quantity);
    
    if (!selectedMaterial || !quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um material e insira uma quantidade válida.",
        variant: "destructive"
      });
      return;
    }

    const factor = allCO2Factors[selectedMaterial];
    const co2Saved = parseFloat(quantity) * factor;

    const newEntry: RecyclingEntry = {
      id: Date.now().toString(),
      material: allMaterials[selectedMaterial],
      quantity: parseFloat(quantity),
      co2Saved,
      date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      month: selectedMonth
    };

    const updatedEntries = [newEntry, ...entries];
    
    // Notificar componente pai sobre mudança
    if (onEntriesUpdate) {
      onEntriesUpdate(updatedEntries);
    }
    
    // Limpar apenas a quantidade, mantendo o material selecionado
    setQuantity('');

    toast({
      title: "Cálculo realizado!",
      description: `Redução de ${co2Saved.toFixed(2)} kg de CO₂ registrada com sucesso.`,
      variant: "default"
    });
  };

  const totalCO2Saved = entries.reduce((sum, entry) => sum + entry.co2Saved, 0);

  const handleDeleteAllRecycling = async () => {
    try {
      // Se os dados vierem do Supabase, deletar do banco
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('recycling_entries')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Limpar dados locais
      if (onEntriesUpdate) {
        onEntriesUpdate([]);
      }
      
      toast({
        title: "Registros apagados!",
        description: "Todos os registros de reciclagem foram removidos.",
      });
    } catch (error) {
      console.error("Erro ao apagar registros:", error);
      toast({
        title: "Erro ao apagar registros",
        description: "Não foi possível apagar os registros. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Calculadora */}
      <Card className="border-0 shadow-eco bg-gradient-to-br from-card to-secondary/30">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-primary/15 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl text-primary">Calculadora de CO₂</CardTitle>
          <CardDescription className="text-muted-foreground">
            Calcule quantos kg de CO2 você evitou de emitir na atmosfera através da reciclagem
          </CardDescription>
        </CardHeader>
        <CardContent className="recycling-calculator-form space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material">Tipo de Material</Label>
              <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="w-full justify-between font-normal text-foreground"
              >
                <span className={selectedMaterial ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {selectedMaterial
                    ? allMaterials[selectedMaterial]
                    : "Selecionar material..."}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              
              {/* Dialog para seleção de material */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg z-50">
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* Lista de materiais */}
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {filteredMaterials.map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          className="w-full flex items-center justify-start gap-2 p-2 rounded-md hover:bg-secondary transition-colors text-left"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Material selecionado:', key, label);
                            setSelectedMaterial(key);
                            setSearchTerm('');
                            setOpen(false);
                          }}
                        >
                          <Recycle className="h-4 w-4 text-primary shrink-0" />
                          <span className="flex-1">{label}</span>
                          <span className="text-xs text-muted-foreground">
                            {allCO2Factors[key]} kg CO2/kg
                          </span>
                        </button>
                      ))}
                      {filteredMaterials.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum material encontrado
                        </p>
                      )}
                      
                      {/* Opção "Outro" */}
                      <button
                        type="button"
                        className="w-full flex items-center justify-start gap-2 p-2 rounded-md border border-dashed hover:bg-secondary transition-colors text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                          setSearchTerm('');
                          setShowAddMaterialDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 text-primary shrink-0" />
                        <span className="flex-1">Outro (adicionar novo material)</span>
                      </button>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              {/* Dialog para adicionar novo material */}
              <Dialog open={showAddMaterialDialog} onOpenChange={setShowAddMaterialDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Material</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo tipo de material reciclável para sua escola
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-material-name">Nome do Material</Label>
                      <Input
                        id="new-material-name"
                        value={newMaterialName}
                        onChange={(e) => setNewMaterialName(e.target.value)}
                        placeholder="Ex: Óleo de cozinha"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-material-co2">Fator de CO2 (kg CO2/kg material)</Label>
                      <Input
                        id="new-material-co2"
                        type="number"
                        step="0.1"
                        min="0"
                        value={newMaterialCO2}
                        onChange={(e) => setNewMaterialCO2(e.target.value)}
                        placeholder="Ex: 2.8"
                      />
                      <p className="text-xs text-muted-foreground">
                        Quantidade de CO2 evitado por kg de material reciclado
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddMaterialDialog(false);
                        setNewMaterialName('');
                        setNewMaterialCO2('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCustomMaterial}>
                      Adicionar Material
                    </Button>
                  </DialogFooter>
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

          <div className="space-y-2">
            <Label htmlFor="month">Mês de Registro</Label>
            <MonthYearPicker
              value={selectedMonth}
              onChange={setSelectedMonth}
              className="transition-smooth focus:shadow-soft"
            />
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
              <div className="w-16 h-16 mx-auto mb-3 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Total Acumulado</h3>
              <p className="text-3xl font-bold">{totalCO2Saved.toFixed(2)} kg</p>
              <p className="text-primary-foreground/90 mt-1 text-sm">de CO₂ evitado na atmosfera</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      {entries.length > 0 && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-primary">Histórico de Reciclagem</CardTitle>
                <CardDescription>Suas contribuições para o meio ambiente</CardDescription>
              </div>
              <DeleteRecordsDialog
                title="Apagar todos os registros de reciclagem?"
                description="Todos os seus registros de materiais reciclados serão permanentemente removidos."
                buttonText="Apagar Tudo"
                onConfirm={handleDeleteAllRecycling}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border-l-4 border-primary">
                  <div>
                    <p className="font-medium text-foreground">{entry.material}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.quantity} kg • {entry.month ? new Date(entry.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : entry.date}
                    </p>
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