import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, Minus, Star, StarOff } from 'lucide-react';
import { formatCurrencyBR, formatNumberBR } from '@/lib/utils/format';
import type { DashboardCard as DashboardCardType } from '@/types/dashboard';

interface DashboardCardProps {
    card: DashboardCardType;
    isFavorite: boolean;
    onToggleFavorite: (cardId: string) => void;
    onMoveUp?: (cardId: string) => void;
    onMoveDown?: (cardId: string) => void;
    showActions?: boolean;
}

export const DashboardCard = ({
    card,
    isFavorite,
    onToggleFavorite,
    onMoveUp,
    onMoveDown,
    showActions = false
}: DashboardCardProps) => {
    const IconComponent = card.icon;

    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: 'bg-blue-500 text-white',
            red: 'bg-red-500 text-white',
            green: 'bg-green-500 text-white',
            purple: 'bg-purple-500 text-white',
            orange: 'bg-orange-500 text-white',
            yellow: 'bg-yellow-500 text-white',
        };
        return colorMap[color as keyof typeof colorMap] || 'bg-gray-500 text-white';
    };

    const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <ArrowUp className="h-3 w-3 text-green-500" />;
            case 'down':
                return <ArrowDown className="h-3 w-3 text-red-500" />;
            default:
                return <Minus className="h-3 w-3 text-gray-500" />;
        }
    };

    const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <Card className="relative hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getColorClasses(card.color)}`}>
                            <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium text-gray-700">
                                {card.title}
                            </CardTitle>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {showActions && (
                            <>
                                {onMoveUp && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onMoveUp(card.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        ↑
                                    </Button>
                                )}
                                {onMoveDown && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onMoveDown(card.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        ↓
                                    </Button>
                                )}
                            </>
                        )}

                        <div
                            className="cursor-pointer hover:bg-gray-100 rounded p-1 transition-colors"
                            onClick={() => onToggleFavorite(card.id)}
                        >
                            {isFavorite ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                                <StarOff className="h-4 w-4 text-gray-400" />
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-3">
                    {/* Valor principal */}
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 card-value">
                            {card.value}
                        </span>
                        {card.change && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(card.trend)}`}>
                                {getTrendIcon(card.trend)}
                                <span>{card.change}</span>
                            </div>
                        )}
                    </div>

                    {/* Descrição */}
                    {card.description && (
                        <p className="text-sm text-gray-600">
                            {card.description}
                        </p>
                    )}

                    {/* Progress bar */}
                    {card.progress !== undefined && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Progresso</span>
                                <span>{card.progress}%</span>
                            </div>
                            <Progress value={card.progress} className="h-2" />
                        </div>
                    )}

                    {/* Modal com detalhes */}
                    {card.rawValue !== undefined && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full">
                                    Ver Detalhes
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{card.title}</DialogTitle>
                                    <DialogDescription>
                                        Detalhes completos do indicador
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Valor Atual</label>
                                            <p className="text-lg font-semibold">{card.value}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Valor Bruto</label>
                                            <p className="text-lg font-semibold">
                                                {typeof card.rawValue === 'number'
                                                    ? formatNumberBR(card.rawValue)
                                                    : card.rawValue
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {card.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Descrição</label>
                                            <p className="text-sm">{card.description}</p>
                                        </div>
                                    )}
                                    {card.progress !== undefined && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Progresso</label>
                                            <div className="flex items-center gap-2">
                                                <Progress value={card.progress} className="flex-1" />
                                                <span className="text-sm">{card.progress}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 