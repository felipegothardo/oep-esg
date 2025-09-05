import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface ExportButtonProps {
  schoolName: string;
  recyclingEntries: RecyclingEntry[];
  consumptionEntries: ConsumptionEntry[];
}

export default function ExportButton({ schoolName, recyclingEntries, consumptionEntries }: ExportButtonProps) {
  const { toast } = useToast();

  const exportToCSV = () => {
    const totalCO2 = recyclingEntries.reduce((sum, entry) => sum + entry.co2Saved, 0);
    const totalRecycling = recyclingEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    
    // Criar conteúdo CSV
    let csvContent = `Relatório OEP Sustentável - ${schoolName}\n`;
    csvContent += `Data de Geração: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    csvContent += `RESUMO GERAL\n`;
    csvContent += `Total CO2 Evitado,${totalCO2.toFixed(2)} kg\n`;
    csvContent += `Total Material Reciclado,${totalRecycling.toFixed(2)} kg\n\n`;
    
    // Seção de Reciclagem
    csvContent += `REGISTROS DE RECICLAGEM\n`;
    csvContent += `Data,Material,Quantidade (kg),CO2 Evitado (kg)\n`;
    recyclingEntries.forEach(entry => {
      csvContent += `${entry.date},${entry.material},${entry.quantity},${entry.co2Saved.toFixed(2)}\n`;
    });
    
    csvContent += `\nREGISTROS DE CONSUMO\n`;
    csvContent += `Data,Tipo,Mês/Ano,Consumo,Custo (R$)\n`;
    consumptionEntries.forEach(entry => {
      const unit = entry.type === 'water' ? 'L' : 'kWh';
      csvContent += `${entry.date},${entry.type === 'water' ? 'Água' : 'Energia'},${entry.month},${entry.consumption} ${unit},R$ ${entry.cost.toFixed(2)}\n`;
    });

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${schoolName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório exportado!",
      description: `Dados de ${schoolName} exportados em CSV com sucesso.`,
    });
  };

  const handlePDFExport = async () => {
    await exportToPDF(schoolName, recyclingEntries, consumptionEntries);
    toast({
      title: "PDF exportado!",
      description: `Relatório de ${schoolName} exportado com sucesso.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDFExport}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}