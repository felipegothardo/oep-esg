import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  shimmer?: boolean;
  gradientBorder?: boolean;
}

export function AnimatedCard({ 
  children, 
  className, 
  glow = false, 
  shimmer = false,
  gradientBorder = false 
}: AnimatedCardProps) {
  return (
    <Card 
      className={cn(
        'card-transition hover-scale',
        glow && 'card-glow',
        shimmer && 'shimmer',
        gradientBorder && 'gradient-border',
        className
      )}
    >
      {children}
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  gradient?: 'eco' | 'nature' | 'sky' | 'ocean' | 'sunset' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient = 'eco',
  trend,
  trendValue 
}: StatCardProps) {
  const gradientClass = {
    'eco': 'from-primary/10 to-accent/10 border-primary/20',
    'nature': 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    'sky': 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    'ocean': 'from-blue-600/10 to-indigo-500/10 border-blue-600/20',
    'sunset': 'from-orange-500/10 to-pink-500/10 border-orange-500/20',
    'purple': 'from-purple-500/10 to-violet-500/10 border-purple-500/20',
  }[gradient];

  return (
    <AnimatedCard 
      className={cn(
        'bg-gradient-to-br border-2',
        gradientClass
      )}
      glow
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-background/50 backdrop-blur-sm">
            {icon}
          </div>
          {trend && trendValue && (
            <div className={cn(
              'text-sm font-medium px-2 py-1 rounded-full',
              trend === 'up' && 'bg-green-500/20 text-green-700 dark:text-green-300',
              trend === 'down' && 'bg-red-500/20 text-red-700 dark:text-red-300',
              trend === 'neutral' && 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
            )}>
              {trendValue}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}