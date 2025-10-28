import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthYearPickerProps {
  value: string; // formato YYYY-MM
  onChange: (value: string) => void;
  className?: string;
}

export function MonthYearPicker({ value, onChange, className }: MonthYearPickerProps) {
  const [date, setDate] = React.useState<Date>(() => {
    return value ? new Date(value + '-01') : new Date();
  });

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      // Converter para formato YYYY-MM
      const formattedValue = format(selectedDate, 'yyyy-MM');
      onChange(formattedValue);
    }
  };

  return (
    <Popover>
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
          {value ? format(new Date(value + '-01'), "MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione o mês e ano</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}
