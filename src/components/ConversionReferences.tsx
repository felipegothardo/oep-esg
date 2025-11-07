import React from 'react';

export default function ConversionReferences() {
  return (
    <section id="fatores-conversao" aria-labelledby="fatores-title" className="border-t border-muted mt-8 md:mt-12">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h2 id="fatores-title" className="text-lg md:text-xl font-semibold text-foreground text-center mb-4 md:mb-6">
          📊 Fatores de Conversão (Valores de Referência)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-soft border-l-4 border-primary">
            <div className="text-xl md:text-3xl font-bold text-primary mb-1 md:mb-2">1.1 kg</div>
            <div className="text-xs md:text-sm text-muted-foreground">CO2 evitado por kg de papel</div>
            <div className="text-xs text-primary/70 mt-1">📄 Valor fixo de referência</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-soft border-l-4 border-accent">
            <div className="text-xl md:text-3xl font-bold text-accent mb-1 md:mb-2">8.0 kg</div>
            <div className="text-xs md:text-sm text-muted-foreground">CO2 evitado por kg de alumínio</div>
            <div className="text-xs text-accent/70 mt-1">🥤 Valor fixo de referência</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-soft border-l-4 border-success">
            <div className="text-xl md:text-3xl font-bold text-success mb-1 md:mb-2">1.8 kg</div>
            <div className="text-xs md:text-sm text-muted-foreground">CO2 evitado por kg de plástico PET</div>
            <div className="text-xs text-success/70 mt-1">♻️ Valor fixo de referência</div>
          </div>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground text-center mt-4 italic">
          * Estes são os fatores científicos usados nos cálculos. Seus dados pessoais aparecem no painel acima.
        </p>

        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground mb-2">📚 Referências científicas:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <a
              href="https://www.epa.gov/system/files/documents/2025-01/ghg-emission-factors-hub-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              EPA GHG Factors
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://assets.publishing.service.gov.uk/media/6846b0870392ed9b784c0187/2025-GHG-CF-methodology-paper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              UK DEFRA Study
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://www.sciencedirect.com/science/article/pii/S0921344915301245"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              Scientific Research
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
