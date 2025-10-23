import { Leaf, Recycle, Wind } from 'lucide-react';
import ecoHeroImage from '@/assets/eco-hero.jpg';
import oepLogo from '@/assets/oep-logo-optimized.png';

interface EcoHeaderProps {
  schoolName?: string;
  schoolLogo?: string;
}

export default function EcoHeader({ schoolName, schoolLogo }: EcoHeaderProps = {}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-success/10 border-b border-border/50">
      {/* Modern geometric background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-success rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-row items-center justify-between gap-4 md:gap-8">
          
          {/* Left side - Logo and branding */}
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            {schoolLogo ? (
              <div className="flex items-center gap-4 md:gap-6">
                <img 
                  src={oepLogo} 
                  alt="OEP Sustentável Logo" 
                  className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-2xl"
                  loading="eager" 
                />
                <div className="w-px h-12 md:h-16 bg-border/50" />
                <img 
                  src={schoolLogo} 
                  alt={`Logo da ${schoolName}`}
                  className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-2xl"
                  loading="eager"
                />
              </div>
            ) : (
            <img 
              src={oepLogo} 
              alt="OEP Sustentável Logo" 
              className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-2xl"
                loading="eager" 
                onError={(e) => {
                  console.log('Logo error:', e);
                  e.currentTarget.style.display = 'none';
                }} 
              />
            )}
            
            <div className="text-left flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-eco bg-clip-text text-transparent leading-tight">
                {schoolName ? `OEP Sustentável` : 'OEP Sustentável'}
              </h1>
              {schoolName && (
                <p className="text-sm md:text-base text-foreground font-semibold mt-1">
                  {schoolName}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Quick stats icons */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="group relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 hover:bg-primary/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border-2 border-primary/30">
                <Leaf className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sustentável</span>
              </div>
            </div>
            
            <div className="group relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-success/10 hover:bg-success/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border-2 border-success/30">
                <Recycle className="w-6 h-6 md:w-7 md:h-7 text-success" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Reciclável</span>
              </div>
            </div>
            
            <div className="group relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue/10 hover:bg-blue/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border-2 border-blue/30">
                <Wind className="w-6 h-6 md:w-7 md:h-7 text-blue" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Limpo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom subtitle */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <p className="text-sm md:text-base text-muted-foreground text-center font-medium">
            {schoolName ? `Dashboard de Gestão Ambiental` : 'Sistema de Controle de Consumo e Manejo de Resíduos'}
          </p>
        </div>
      </div>
    </div>
  );
}