import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Ops! Algo deu errado
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Encontramos um problema inesperado. Tente novamente ou volte para a página inicial.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Detalhes do erro (desenvolvimento)
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto">
                                    <div className="mb-2">
                                        <strong>Erro:</strong> {this.state.error.message}
                                    </div>
                                    {this.state.errorInfo && (
                                        <div>
                                            <strong>Stack:</strong>
                                            <pre className="whitespace-pre-wrap">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={this.handleRetry}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Tentar Novamente
                            </Button>

                            <Button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Página Inicial
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook para usar em componentes funcionais
export const useErrorHandler = () => {
    const handleError = (error: Error, errorInfo?: ErrorInfo) => {
        console.error('Error caught by useErrorHandler:', error, errorInfo);

        // Aqui você pode enviar o erro para um serviço de monitoramento
        // como Sentry, LogRocket, etc.

        // Por enquanto, apenas log no console
        if (process.env.NODE_ENV === 'development') {
            console.group('Error Details');
            console.error('Error:', error);
            console.error('Error Info:', errorInfo);
            console.groupEnd();
        }
    };

    return { handleError };
}; 