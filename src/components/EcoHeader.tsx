import { Leaf, Recycle, Wind } from 'lucide-react';
import ecoHeroImage from '@/assets/eco-hero.jpg';
import oepLogo from '@/assets/oep-logo-new.png';

interface EcoHeaderProps {
  schoolName?: string;
  schoolLogo?: string;
}

export default function EcoHeader({ schoolName, schoolLogo }: EcoHeaderProps = {}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/10 border-b border-primary/30 backdrop-blur-sm">
      {/* Minimal tech grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(210 60% 42% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(210 60% 42% / 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-row items-center justify-between gap-4 md:gap-8">
          
          {/* Left side - Logo and branding */}
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            {schoolLogo ? (
              <div className="flex items-center gap-4 md:gap-6">
                <img 
                  src={oepLogo} 
                  alt="OEP Sustentável Logo" 
                  className="w-24 h-24 md:w-36 md:h-36 object-contain"
                  loading="eager"
                  style={{ padding: 0, margin: 0 }}
                />
                <div className="w-px h-20 md:h-28 bg-border/30" />
                <img 
                  src={schoolLogo} 
                  alt={`Logo da ${schoolName}`}
                  className="w-20 h-20 md:w-28 md:h-28 object-contain"
                  loading="eager"
                  style={{ padding: 0, margin: 0 }}
                />
              </div>
            ) : (
            <img 
              src={oepLogo} 
              alt="OEP Sustentável Logo" 
              className="w-28 h-28 md:w-40 md:h-40 object-contain"
                loading="eager"
                style={{ padding: 0, margin: 0 }}
                onError={(e) => {
                  console.log('Logo error:', e);
                  e.currentTarget.style.display = 'none';
                }} 
              />
            )}
            
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                {schoolName ? 'Dashboard de Gestão Ambiental' : 'Sistema de Controle de Consumo e Manejo de Resíduos'}
              </p>
            </div>
          </div>

          {/* Right side - Minimal tech badges */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            
            <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-lg flex items-center justify-center border border-success/20">
              <Recycle className="w-5 h-5 md:w-6 md:h-6 text-success" />
            </div>
            
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue/10 rounded-lg flex items-center justify-center border border-blue/20">
              <Wind className="w-5 h-5 md:w-6 md:h-6 text-blue" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}