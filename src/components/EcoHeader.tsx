import { Leaf, Recycle, Wind } from 'lucide-react';
import ecoHeroImage from '@/assets/eco-hero.jpg';
import oepLogo from '@/assets/oep-logo.png';

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
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left side - Logo and branding */}
          <div className="flex items-center gap-6 md:gap-8 flex-1">
            {schoolLogo ? (
              <div className="flex items-center gap-6 md:gap-8">
                <img 
                  src={oepLogo} 
                  alt="OEP Sustentável Logo" 
                  className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl" 
                  loading="eager" 
                />
                <div className="w-px h-16 md:h-20 bg-border/50" />
                <img 
                  src={schoolLogo} 
                  alt={`Logo da ${schoolName}`}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl" 
                  loading="eager"
                />
              </div>
            ) : (
              <img 
                src={oepLogo} 
                alt="OEP Sustentável Logo" 
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl" 
                loading="eager" 
                onError={(e) => {
                  console.log('Logo error:', e);
                  e.currentTarget.style.display = 'none';
                }} 
              />
            )}
            
            <div className="text-left flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-eco bg-clip-text text-transparent leading-tight">
                {schoolName ? `OEP Sustentável` : 'OEP Sustentável'}
              </h1>
              {schoolName && (
                <p className="text-base md:text-lg text-foreground font-semibold mt-2">
                  {schoolName}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Quick stats icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="group relative">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 hover:bg-primary/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border-2 border-primary/30">
                <Leaf className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sustentável</span>
              </div>
            </div>
            
            <div className="group relative">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-success/10 hover:bg-success/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border-2 border-success/30">
                <Recycle className="w-7 h-7 md:w-8 md:h-8 text-success" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Reciclável</span>
              </div>
            </div>
            
            <div className="group relative">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue/10 hover:bg-blue/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border-2 border-blue/30">
                <Wind className="w-7 h-7 md:w-8 md:h-8 text-blue" />
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