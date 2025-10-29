import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MonthYearPickerProps {
  value: string; // formato YYYY-MM
  onChange: (value: string) => void;
  className?: string;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const years = Array.from({ length: 31 }, (_, i) => 2000 + i); // 2000 a 2030

export function MonthYearPicker({ value, onChange, className }: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Inicializar com o valor correto (mês 1-12, não índice 0-11)
  const [tempMonth, setTempMonth] = React.useState<string>(() => {
    if (value) {
      const [year, month] = value.split('-');
      return month; // já está no formato "01" a "12"
    }
    return String(new Date().getMonth() + 1).padStart(2, '0');
  });
  
  const [tempYear, setTempYear] = React.useState<string>(() => {
    if (value) {
      const [year] = value.split('-');
      return year;
    }
    return new Date().getFullYear().toString();
  });

  // Atualizar valores temporários quando o value mudar
  React.useEffect(() => {
    if (value) {
      const [year, month] = value.split('-');
      setTempMonth(month);
      setTempYear(year);
    }
  }, [value]);

  const handleConfirm = () => {
    const formattedValue = `${tempYear}-${tempMonth}`;
    onChange(formattedValue);
    setOpen(false);
  };

  const displayValue = React.useMemo(() => {
    if (!value) return 'Selecione o mês e ano';
    const [year, month] = value.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex]} de ${year}`;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 pointer-events-auto" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mês</label>
            <Select value={tempMonth} onValueChange={setTempMonth}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={String(index + 1).padStart(2, '0')}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
            <Select value={tempYear} onValueChange={setTempYear}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleConfirm} 
            className="w-full"
            size="sm"
          >
            <Check className="mr-2 h-4 w-4" />
            Confirmar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
