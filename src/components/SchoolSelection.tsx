import { Button } from '@/components/ui/button';
import { SchoolType } from '@/hooks/useSchoolData';

interface SchoolSelectionProps {
  activeSchool: SchoolType;
  onSchoolChange: (school: SchoolType) => void;
}

const schools = [
  {
    key: 'consolidated' as const,
    label: '📊 Visão Geral',
    bgClass: 'bg-gradient-to-br from-primary via-primary-glow to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-primary/30 hover:border-primary hover:shadow-lg hover:scale-105'
  },
  {
    key: 'elvira' as const,
    label: 'Elvira Brandão',
    icon: '/lovable-uploads/ac7dcf98-b3a9-4b47-965e-df5f24f90dda.png',
    alt: 'Logo do Colégio Elvira Brandão',
    bgClass: 'bg-gradient-to-br from-blue via-blue to-blue-light text-blue-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-blue/30 hover:border-blue hover:shadow-lg hover:scale-105'
  },
  {
    key: 'oswald' as const,
    label: 'Oswald',
    icon: '/lovable-uploads/13e432d6-adcc-4d69-9735-56086059444c.png',
    alt: 'Logo do Colégio Oswald',
    bgClass: 'bg-gradient-to-br from-success via-primary-glow to-success text-success-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-success/30 hover:border-success hover:shadow-lg hover:scale-105'
  },
  {
    key: 'piaget' as const,
    label: 'Piaget',
    icon: '/lovable-uploads/5f155554-a003-48a8-873e-69c765fa77c1.png',
    alt: 'Logo do Colégio Piaget',
    bgClass: 'bg-gradient-to-br from-blue-dark via-blue to-blue-light text-blue-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-blue-dark/30 hover:border-blue-dark hover:shadow-lg hover:scale-105'
  },
  {
    key: 'santo-antonio' as const,
    label: 'Carandá',
    icon: '/lovable-uploads/15780c7a-3c8b-4d43-a842-9bd423a699c8.png',
    alt: 'Logo do Colégio Carandá',
    bgClass: 'bg-gradient-to-br from-purple via-purple to-purple/90 text-purple-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-purple/30 hover:border-purple hover:shadow-lg hover:scale-105'
  }
];

export default function SchoolSelection({ activeSchool, onSchoolChange }: SchoolSelectionProps) {
  return (
    <div className="school-selection grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
      {schools.map((school) => (
        <Button
          key={school.key}
          variant={activeSchool === school.key ? 'default' : 'outline'}
          onClick={() => onSchoolChange(school.key)}
          className={`h-14 md:h-16 text-xs md:text-sm font-semibold transition-all duration-300 ${
            activeSchool === school.key ? school.bgClass : school.hoverClass
          }`}
          aria-label={`Selecionar escola ${school.label}`}
        >
          {school.icon ? (
            <div className="flex items-center gap-2">
              <img
                src={school.icon}
                alt={school.alt}
                className="h-5 w-5 md:h-6 md:w-6 rounded-sm object-contain"
                loading="lazy"
                width="24"
                height="24"
              />
              <span>{school.label}</span>
            </div>
          ) : (
            school.label
          )}
        </Button>
      ))}
    </div>
  );
}