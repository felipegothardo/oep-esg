import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface School {
  id: string;
  name: string;
  code: string;
  icon?: string;
}

const schools: School[] = [
  {
    id: '225814a9-fd16-415b-9f43-9be6cb88febf',
    name: 'Elvira Brandão',
    code: 'elvira',
    icon: '/lovable-uploads/ac7dcf98-b3a9-4b47-965e-df5f24f90dda.png'
  },
  {
    id: 'e0d8a3b2-4c5f-4d1e-8a7b-9c1d2e3f4a5b',
    name: 'Oswald',
    code: 'oswald',
    icon: '/lovable-uploads/13e432d6-adcc-4d69-9735-56086059444c.png'
  },
  {
    id: 'f1e9b4c3-5d6e-4e2f-9b8c-0d2e3f4a5b6c',
    name: 'Piaget',
    code: 'piaget',
    icon: '/lovable-uploads/5f155554-a003-48a8-873e-69c765fa77c1.png'
  },
  {
    id: 'a2f0c5d4-6e7f-4f3a-0c9d-1e3f4a5b6c7d',
    name: 'Carandá',
    code: 'caranda',
    icon: '/lovable-uploads/15780c7a-3c8b-4d43-a842-9bd423a699c8.png'
  },
  {
    id: 'b3a1d6e5-7f8a-4a4b-1d0e-2f4a5b6c7d8e',
    name: 'OEP (Coordenação)',
    code: 'OEP'
  }
];

interface InitialSchoolSelectionProps {
  onSchoolSelected: () => void;
}

export default function InitialSchoolSelection({ onSchoolSelected }: InitialSchoolSelectionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectSchool = async () => {
    if (!selectedSchool) {
      toast({
        title: "Selecione uma escola",
        description: "Por favor, selecione sua escola para continuar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Criar ou atualizar perfil com a escola selecionada
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          school_id: selectedSchool,
          full_name: user.user_metadata?.full_name || user.email
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Escola selecionada!",
        description: "Seu perfil foi configurado com sucesso",
      });

      onSchoolSelected();
    } catch (error) {
      console.error("Error selecting school:", error);
      toast({
        title: "Erro ao selecionar escola",
        description: "Não foi possível configurar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">Bem-vindo ao OEP Sustentável!</CardTitle>
          <CardDescription className="text-base">
            Selecione sua escola para começar a usar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {schools.map((school) => (
              <Button
                key={school.id}
                variant={selectedSchool === school.id ? "default" : "outline"}
                onClick={() => setSelectedSchool(school.id)}
                className="h-auto py-6 flex flex-col items-center gap-3"
              >
                {school.icon && (
                  <img
                    src={school.icon}
                    alt={`Logo ${school.name}`}
                    className="h-12 w-12 object-contain"
                  />
                )}
                <span className="text-base font-medium">{school.name}</span>
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={handleSelectSchool}
            disabled={!selectedSchool || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              'Confirmar Seleção'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
