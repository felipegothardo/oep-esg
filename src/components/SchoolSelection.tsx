import { Button } from '@/components/ui/button';
import { SchoolType } from '@/hooks/useSchoolData';

interface SchoolSelectionProps {
  activeSchool: SchoolType;
  onSchoolChange: (school: SchoolType) => void;
}

const schools = [
  {
    key: 'consolidated' as const,
    label: 'Visão Geral',
    bgClass: 'bg-gradient-to-br from-primary via-primary-glow to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-primary/30 hover:border-primary hover:shadow-lg hover:scale-105'
  },
  {
    key: 'elvira' as const,
    label: 'Elvira Brandão',
    icon: '/lovable-uploads/logo-elvira-new.png',
    alt: 'Logo do Colégio Elvira Brandão',
    bgClass: 'bg-gradient-to-br from-blue via-blue to-blue-light text-blue-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-blue/30 hover:border-blue hover:shadow-lg hover:scale-105'
  },
  {
    key: 'oswald' as const,
    label: 'Oswald',
    icon: '/lovable-uploads/logo-oswald-new.png',
    alt: 'Logo do Colégio Oswald',
    bgClass: 'bg-gradient-to-br from-success via-primary-glow to-success text-success-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-success/30 hover:border-success hover:shadow-lg hover:scale-105'
  },
  {
    key: 'piaget' as const,
    label: 'Piaget',
    icon: '/lovable-uploads/logo-piaget-new.png',
    alt: 'Logo do Colégio Piaget',
    bgClass: 'bg-gradient-to-br from-blue-dark via-blue to-blue-light text-blue-foreground shadow-lg hover:shadow-xl hover:scale-105',
    hoverClass: 'bg-gradient-to-br from-card to-muted border-2 border-blue-dark/30 hover:border-blue-dark hover:shadow-lg hover:scale-105'
  },
  {
    key: 'santo-antonio' as const,
    label: 'Carandá',
    icon: '/lovable-uploads/logo-caranda-new.png',
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
                className="h-6 w-6 md:h-8 md:w-8 object-contain"
                loading="lazy"
                width="32"
                height="32"
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