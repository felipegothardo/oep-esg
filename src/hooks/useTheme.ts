import { useEffect } from 'react';
import { SchoolType } from './useSchoolData';

export const schoolThemes = {
  elvira: {
    primary: '265 67% 45%', // Roxo profundo
    accent: '280 60% 55%', // Violeta
    gradientSky: 'linear-gradient(135deg, hsl(265, 67%, 45%), hsl(280, 60%, 55%))',
    name: 'Tema Místico'
  },
  oswald: {
    primary: '270 65% 50%', // Roxo médio
    accent: '285 60% 60%', // Lavanda
    gradientSky: 'linear-gradient(135deg, hsl(270, 65%, 50%), hsl(285, 60%, 60%))',
    name: 'Tema Elegante'
  },
  piaget: {
    primary: '259 60% 55%', // Roxo educação
    accent: '280 65% 60%', // Violeta
    gradientSky: 'linear-gradient(135deg, hsl(259, 60%, 55%), hsl(280, 65%, 60%))',
    name: 'Tema Conhecimento'
  },
  'santo-antonio': {
    primary: '275 70% 48%', // Roxo vibrante
    accent: '290 65% 58%', // Ametista
    gradientSky: 'linear-gradient(135deg, hsl(275, 70%, 48%), hsl(290, 65%, 58%))',
    name: 'Tema Celestial'
  },
  consolidated: {
    primary: '265 67% 45%', // Roxo padrão
    accent: '280 60% 55%', // Violeta padrão
    gradientSky: 'linear-gradient(135deg, hsl(265, 67%, 45%), hsl(280, 60%, 55%))',
    name: 'Tema Unificado'
  }
};

export function useTheme(schoolType: SchoolType | 'consolidated') {
  useEffect(() => {
    const theme = schoolThemes[schoolType];
    const root = document.documentElement;
    
    // Aplicar cores do tema
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--gradient-sky', theme.gradientSky);
    
    // Adicionar classe de animação
    root.classList.add('theme-transition');
    
    // Remover classe após transição
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [schoolType]);
  
  return schoolThemes[schoolType];
}