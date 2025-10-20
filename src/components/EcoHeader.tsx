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
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left side - Logo and branding */}
          <div className="flex items-center gap-4 md:gap-6">
            {schoolLogo ? (
              <div className="flex items-center gap-4">
                <img 
                  src={oepLogo} 
                  alt="OEP Sustentável Logo" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg" 
                  loading="eager" 
                />
                <div className="w-px h-12 bg-border hidden md:block" />
                <img 
                  src={schoolLogo} 
                  alt={`Logo da ${schoolName}`}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg" 
                  loading="eager"
                />
              </div>
            ) : (
              <img 
                src={oepLogo} 
                alt="OEP Sustentável Logo" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg" 
                loading="eager" 
                onError={(e) => {
                  console.log('Logo error:', e);
                  e.currentTarget.style.display = 'none';
                }} 
              />
            )}
            
            <div className="text-left">
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-eco bg-clip-text text-transparent">
                {schoolName ? `OEP Sustentável` : 'OEP Sustentável'}
              </h1>
              {schoolName && (
                <p className="text-sm md:text-base text-muted-foreground font-medium mt-1">
                  {schoolName}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Quick stats icons */}
          <div className="flex items-center gap-3">
            <div className="group relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 hover:bg-primary/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm border border-primary/20">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Sustentável</span>
              </div>
            </div>
            
            <div className="group relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-success/10 hover:bg-success/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm border border-success/20">
                <Recycle className="w-6 h-6 text-success" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Reciclável</span>
              </div>
            </div>
            
            <div className="group relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue/10 hover:bg-blue/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm border border-blue/20">
                <Wind className="w-6 h-6 text-blue" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Limpo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom subtitle - only on desktop */}
        <div className="hidden md:block mt-6 pt-4 border-t border-border/30">
          <p className="text-sm text-muted-foreground text-center">
            {schoolName ? `Dashboard de Gestão Ambiental` : 'Sistema de Controle de Consumo e Manejo de Resíduos'}
          </p>
        </div>
      </div>
    </div>
  );
}