import { Leaf, Recycle, Wind } from 'lucide-react';
import ecoHeroImage from '@/assets/eco-hero.jpg';

export default function EcoHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-sky py-16 px-6">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${ecoHeroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
      
      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex justify-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-float">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
            <Recycle className="w-6 h-6 text-accent" />
          </div>
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
            <Wind className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          OEP Sustentável
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-2">
          Calculadora de Redução de CO2
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descubra o impacto positivo da sua reciclagem no meio ambiente. 
          Calcule quantos quilos de CO2 você evitou de emitir na atmosfera.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-soft">
            <div className="text-3xl font-bold text-primary mb-2">1.1 kg</div>
            <div className="text-sm text-muted-foreground">CO2 evitado por kg de papel</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-soft">
            <div className="text-3xl font-bold text-accent mb-2">8.0 kg</div>
            <div className="text-sm text-muted-foreground">CO2 evitado por kg de alumínio</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-soft">
            <div className="text-3xl font-bold text-success mb-2">1.8 kg</div>
            <div className="text-sm text-muted-foreground">CO2 evitado por kg de plástico PET</div>
          </div>
        </div>
      </div>
    </div>
  );
}