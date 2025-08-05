import { useState } from 'react';
import { Menu, X, Home, Calculator, TrendingUp, Target, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MobileMenuProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onExport?: () => void;
}

export default function MobileMenu({ currentTab, onTabChange, onExport }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
    { id: 'consumption', label: 'Consumo', icon: TrendingUp },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'recycling-charts', label: 'Gráficos', icon: Home },
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="grid grid-cols-4 gap-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="flex flex-col gap-1 h-auto py-2"
              onClick={() => handleTabChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Floating Action Button for Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-4 rounded-full shadow-lg h-12 w-12"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[50vh]">
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-semibold">Menu Rápido</h3>
            
            {onExport && (
              <Button 
                onClick={() => { onExport(); setIsOpen(false); }} 
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleTabChange('consumption-charts')}
                className="flex flex-col gap-1 h-16"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Gráfico Consumo</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex flex-col gap-1 h-16"
              >
                <X className="h-5 w-5" />
                <span className="text-xs">Resetar App</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}