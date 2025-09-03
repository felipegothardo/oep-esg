import { useEffect } from 'react';
import { SchoolType } from './useSchoolData';

export const schoolThemes = {
  elvira: {
    primary: '142 70% 45%', // Verde floresta
    accent: '82 60% 50%', // Verde lima
    gradientSky: 'linear-gradient(135deg, hsl(142, 70%, 45%), hsl(82, 60%, 50%))',
    name: 'Tema Natureza'
  },
  oswald: {
    primary: '217 71% 53%', // Azul oceano
    accent: '187 60% 50%', // Ciano
    gradientSky: 'linear-gradient(135deg, hsl(217, 71%, 53%), hsl(187, 60%, 50%))',
    name: 'Tema Oceano'
  },
  piaget: {
    primary: '259 60% 55%', // Roxo educação
    accent: '280 65% 60%', // Violeta
    gradientSky: 'linear-gradient(135deg, hsl(259, 60%, 55%), hsl(280, 65%, 60%))',
    name: 'Tema Conhecimento'
  },
  'santo-antonio': {
    primary: '25 75% 47%', // Laranja terra
    accent: '39 77% 53%', // Amarelo dourado
    gradientSky: 'linear-gradient(135deg, hsl(25, 75%, 47%), hsl(39, 77%, 53%))',
    name: 'Tema Sol'
  },
  consolidated: {
    primary: '217 71% 53%', // Azul padrão
    accent: '142 70% 45%', // Verde padrão
    gradientSky: 'linear-gradient(135deg, hsl(217, 71%, 53%), hsl(142, 70%, 45%))',
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