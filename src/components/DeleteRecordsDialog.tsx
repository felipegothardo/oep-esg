import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Target, Droplets, Zap, Recycle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface DeleteRecordsDialogProps {
  recyclingEntries: RecyclingEntry[];
  consumptionEntries: ConsumptionEntry[];
  onDeleteAll: () => void;
  onDeleteRecyclingByMonth: (month: string) => void;
  onDeleteConsumptionByMonth: (type: 'water' | 'energy', month: string) => void;
}

export default function DeleteRecordsDialog({
  recyclingEntries,
  consumptionEntries,
  onDeleteAll,
  onDeleteRecyclingByMonth,
  onDeleteConsumptionByMonth
}: DeleteRecordsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'all' | 'selected'>('all');
  const [selectedSession, setSelectedSession] = useState<'water' | 'energy' | 'waste'>('water');
  const [selectedMonth, setSelectedMonth] = useState('');
  const { toast } = useToast();

  const waterEntries = consumptionEntries.filter(e => e.type === 'water');
  const energyEntries = consumptionEntries.filter(e => e.type === 'energy');

  const getAvailableMonths = (session: 'water' | 'energy' | 'waste') => {
    if (session === 'waste') {
      return [...new Set(recyclingEntries.map(e => e.date))];
    } else {
      const entries = session === 'water' ? waterEntries : energyEntries;
      return [...new Set(entries.map(e => e.month))];
    }
  };

  const handleDelete = () => {
    if (deleteType === 'all') {
      onDeleteAll();
      toast({
        title: "Todos os registros apagados",
        description: "Todos os dados foram removidos com sucesso.",
      });
    } else {
      if (!selectedSession || !selectedMonth) {
        toast({
          title: "Erro",
          description: "Selecione uma sessão e um mês para apagar.",
          variant: "destructive"
        });
        return;
      }

      if (selectedSession === 'waste') {
        onDeleteRecyclingByMonth(selectedMonth);
        toast({
          title: "Registros de resíduos apagados",
          description: `Registros de ${selectedMonth} foram removidos.`,
        });
      } else {
        onDeleteConsumptionByMonth(selectedSession, selectedMonth);
        toast({
          title: `Registros de ${selectedSession === 'water' ? 'água' : 'energia'} apagados`,
          description: `Registros de ${selectedMonth} foram removidos.`,
        });
      }
    }
    
    setIsOpen(false);
    setDeleteType('all');
    setSelectedSession('water');
    setSelectedMonth('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Apagar Registros
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apagar Registros</DialogTitle>
          <DialogDescription>
            Escolha quais registros deseja apagar. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de exclusão</Label>
            <Select value={deleteType} onValueChange={(value: 'all' | 'selected') => setDeleteType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Apagar Todos os Registros</SelectItem>
                <SelectItem value="selected">Apagar Registros Selecionados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {deleteType === 'selected' && (
            <>
              <div className="space-y-2">
                <Label>Sessão</Label>
                <Select value={selectedSession} onValueChange={(value: 'water' | 'energy' | 'waste') => setSelectedSession(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        Água
                      </div>
                    </SelectItem>
                    <SelectItem value="energy">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Energia
                      </div>
                    </SelectItem>
                    <SelectItem value="waste">
                      <div className="flex items-center gap-2">
                        <Recycle className="w-4 h-4 text-green-500" />
                        Resíduos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mês para apagar</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableMonths(selectedSession).map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Apagar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}