import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface AnimatedBannerProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: 'eco' | 'nature' | 'sky' | 'ocean' | 'sunset' | 'purple';
  className?: string;
}

export function AnimatedBanner({ 
  title, 
  subtitle, 
  icon, 
  gradient = 'eco',
  className 
}: AnimatedBannerProps) {
  const gradientStyles = {
    'eco': 'bg-[image:var(--gradient-eco)]',
    'nature': 'bg-[image:var(--gradient-nature)]',
    'sky': 'bg-[image:var(--gradient-sky)]',
    'ocean': 'bg-[image:var(--gradient-ocean)]',
    'sunset': 'bg-[image:var(--gradient-sunset)]',
    'purple': 'bg-[image:var(--gradient-purple)]',
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-[--radius-card] p-8 text-white shadow-[--shadow-elegant]',
        gradientStyles[gradient],
        className
      )}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-[shimmer_3s_infinite]" />
      
      {/* Floating particles */}
      <div className="absolute top-4 left-4 animate-float">
        <Sparkles className="h-6 w-6 text-white/60" />
      </div>
      <div className="absolute bottom-4 right-4 animate-float" style={{ animationDelay: '1s' }}>
        <Sparkles className="h-4 w-4 text-white/40" />
      </div>
      <div className="absolute top-1/2 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
        <Sparkles className="h-5 w-5 text-white/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {icon && (
          <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {subtitle && (
            <p className="text-white/90 text-lg">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}