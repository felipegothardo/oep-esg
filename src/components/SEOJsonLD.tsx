interface SEOJsonLDProps {
  page?: 'home' | 'dashboard';
  schoolName?: string;
}

export default function SEOJsonLD({ page = 'home', schoolName }: SEOJsonLDProps) {
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": page === 'home' ? "SoftwareApplication" : "Dashboard",
    "name": "OEP Sustentável",
    "description": "Calculadora de Redução de CO2 para Escolas - Descubra o impacto positivo da sua reciclagem no meio ambiente",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "provider": {
      "@type": "EducationalOrganization",
      "name": "OEP Sustentável",
      "description": "Organização focada em educação ambiental e sustentabilidade"
    },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student"
    },
    "educationalLevel": "K12",
    "inLanguage": "pt-BR",
    "keywords": [
      "sustentabilidade",
      "reciclagem", 
      "CO2",
      "meio ambiente",
      "escola",
      "educação ambiental",
      "calculadora ambiental"
    ],
    ...(schoolName && {
      "about": {
        "@type": "EducationalOrganization",
        "name": schoolName,
        "description": `Dashboard de sustentabilidade da escola ${schoolName}`
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  );
}