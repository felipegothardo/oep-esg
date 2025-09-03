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
    bgClass: 'bg-primary text-primary-foreground shadow-eco hover:bg-primary/90',
    hoverClass: 'bg-card border-2 hover:bg-primary/10 hover:border-primary'
  },
  {
    key: 'elvira' as const,
    label: 'Elvira Brandão',
    icon: '/lovable-uploads/ac7dcf98-b3a9-4b47-965e-df5f24f90dda.png',
    alt: 'Logo do Colégio Elvira Brandão',
    bgClass: 'bg-gradient-blue text-blue-foreground shadow-soft hover:bg-blue/90',
    hoverClass: 'bg-card border-2 hover:bg-blue/10 hover:border-blue'
  },
  {
    key: 'oswald' as const,
    label: 'Oswald',
    icon: '/lovable-uploads/13e432d6-adcc-4d69-9735-56086059444c.png',
    alt: 'Logo do Colégio Oswald',
    bgClass: 'bg-success text-success-foreground shadow-eco hover:bg-success/90',
    hoverClass: 'bg-card border-2 hover:bg-success/10 hover:border-success'
  },
  {
    key: 'piaget' as const,
    label: 'Piaget',
    icon: '/lovable-uploads/5f155554-a003-48a8-873e-69c765fa77c1.png',
    alt: 'Logo do Colégio Piaget',
    bgClass: 'bg-gradient-ocean text-blue-foreground shadow-soft hover:bg-blue-dark/90',
    hoverClass: 'bg-card border-2 hover:bg-blue-dark/10 hover:border-blue-dark'
  },
  {
    key: 'santo-antonio' as const,
    label: 'Carandá',
    icon: '/lovable-uploads/15780c7a-3c8b-4d43-a842-9bd423a699c8.png',
    alt: 'Logo do Colégio Carandá',
    bgClass: 'bg-purple text-purple-foreground shadow-soft hover:bg-purple/90',
    hoverClass: 'bg-card border-2 hover:bg-purple/10 hover:border-purple'
  }
];

export default function SchoolSelection({ activeSchool, onSchoolChange }: SchoolSelectionProps) {
  return (
    <div className="school-selection grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-8">
      {schools.map((school) => (
        <Button
          key={school.key}
          variant={activeSchool === school.key ? 'default' : 'outline'}
          onClick={() => onSchoolChange(school.key)}
          className={`h-12 md:h-14 text-xs md:text-sm font-medium transition-all ${
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