import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OptimizedCardProps {
  id: string;
  title: string;
  value: string | number;
  rawValue?: number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  progress?: number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  className?: string;
}

const OptimizedCard = memo(function OptimizedCard({
  id,
  title,
  value,
  rawValue,
  description,
  icon: Icon,
  color = 'blue',
  progress,
  change,
  trend,
  onClick,
  className = ''
}: OptimizedCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    pink: 'text-pink-600 bg-pink-50',
    orange: 'text-orange-600 bg-orange-50',
    cyan: 'text-cyan-600 bg-cyan-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    violet: 'text-violet-600 bg-violet-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 truncate">
          {title}
        </CardTitle>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {change && TrendIcon && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendIcon className={`h-3 w-3 ${trendColors[trend!]}`} />
                <span className={`text-xs ${trendColors[trend!]}`}>
                  {change}
                </span>
              </Badge>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {description}
            </p>
          )}
          
          {progress !== undefined && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default OptimizedCard;