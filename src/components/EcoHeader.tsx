import { Leaf, Recycle, Wind } from 'lucide-react';
import ecoHeroImage from '@/assets/eco-hero.jpg';
import oepLogo from '@/assets/oep-logo.png';

export default function EcoHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-sky py-8 md:py-16 px-4 md:px-6">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${ecoHeroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
      
      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex flex-col items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <img 
            src={oepLogo} 
            alt="OEP Sustentável Logo" 
            className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain animate-float shadow-eco"
          />
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
              <Recycle className="w-6 h-6 text-accent" />
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
              <Wind className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-foreground mb-2 md:mb-4">
          OEP Sustentável
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-2">
          Calculadora de Redução de CO2
        </p>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Descubra o impacto positivo da sua reciclagem no meio ambiente. 
          Calcule quantos quilos de CO2 você evitou de emitir na atmosfera.
        </p>
        
        {/* Stats - fixos conforme especificação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-soft">
            <div className="text-xl md:text-3xl font-bold text-primary mb-1 md:mb-2">1.1 kg</div>
            <div className="text-xs md:text-sm text-muted-foreground">CO2 evitado por kg de papel</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-soft">
            <div className="text-xl md:text-3xl font-bold text-accent mb-1 md:mb-2">8.0 kg</div>
            <div className="text-xs md:text-sm text-muted-foreground">CO2 evitado por kg de alumínio</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-soft">
            <div className="text-xl md:text-3xl font-bold text-success mb-1 md:mb-2">1.8 kg</div>
            <div className="text-xs md:text-sm text-muted-foreground">CO2 evitado por kg de plástico PET</div>
          </div>
        </div>
      </div>
    </div>
  );
}