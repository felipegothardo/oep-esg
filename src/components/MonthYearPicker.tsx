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
  const [tempMonth, setTempMonth] = React.useState<string>(() => {
    return value ? new Date(value + '-01').getMonth().toString() : new Date().getMonth().toString();
  });
  const [tempYear, setTempYear] = React.useState<string>(() => {
    return value ? new Date(value + '-01').getFullYear().toString() : new Date().getFullYear().toString();
  });

  // Atualizar valores temporários quando o value mudar
  React.useEffect(() => {
    if (value) {
      const date = new Date(value + '-01');
      setTempMonth(date.getMonth().toString());
      setTempYear(date.getFullYear().toString());
    }
  }, [value]);

  const handleConfirm = () => {
    const month = String(parseInt(tempMonth) + 1).padStart(2, '0');
    const formattedValue = `${tempYear}-${month}`;
    onChange(formattedValue);
    setOpen(false);
  };

  const displayValue = value 
    ? format(new Date(value + '-01'), "MMMM 'de' yyyy", { locale: ptBR })
    : 'Selecione o mês e ano';

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
                  <SelectItem key={index} value={index.toString()}>
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
