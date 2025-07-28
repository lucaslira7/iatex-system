interface ErrorLog {
    message: string;
    stack?: string;
    timestamp: string;
    userAgent: string;
    url: string;
    userId?: string;
    componentName?: string;
    additionalData?: Record<string, any>;
}

class ErrorLogger {
    private static instance: ErrorLogger;
    private logs: ErrorLog[] = [];
    private maxLogs = 100;

    private constructor() { }

    static getInstance(): ErrorLogger {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }

    private sanitizeError(error: any): Partial<ErrorLog> {
        // Remove informações sensíveis
        const sanitized: Partial<ErrorLog> = {
            message: this.sanitizeMessage(error.message || 'Unknown error'),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // Adiciona stack trace apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development' && error.stack) {
            sanitized.stack = error.stack;
        }

        return sanitized;
    }

    private sanitizeMessage(message: string): string {
        // Remove possíveis dados sensíveis do erro
        return message
            .replace(/password[=:]\s*\S+/gi, 'password=***')
            .replace(/token[=:]\s*\S+/gi, 'token=***')
            .replace(/key[=:]\s*\S+/gi, 'key=***')
            .replace(/secret[=:]\s*\S+/gi, 'secret=***')
            .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=***');
    }

    logError(
        error: Error | string,
        componentName?: string,
        userId?: string,
        additionalData?: Record<string, any>
    ): void {
        const errorLog: ErrorLog = {
            ...this.sanitizeError(error),
            componentName,
            userId,
            additionalData: this.sanitizeAdditionalData(additionalData),
        } as ErrorLog;

        // Adiciona ao array de logs
        this.logs.push(errorLog);

        // Mantém apenas os últimos maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Log no console apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.group('Error Logger');
            console.error('Error:', error);
            console.error('Component:', componentName);
            console.error('User ID:', userId);
            console.error('Additional Data:', additionalData);
            console.groupEnd();
        }

        // Aqui você pode enviar para um serviço de monitoramento
        // como Sentry, LogRocket, etc.
        this.sendToMonitoringService(errorLog);
    }

    private sanitizeAdditionalData(data?: Record<string, any>): Record<string, any> | undefined {
        if (!data) return undefined;

        const sanitized: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            // Remove chaves que podem conter dados sensíveis
            if (['password', 'token', 'key', 'secret', 'apiKey', 'api_key'].includes(key.toLowerCase())) {
                sanitized[key] = '***';
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeAdditionalData(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    private sendToMonitoringService(errorLog: ErrorLog): void {
        // Implementar envio para serviço de monitoramento
        // Por exemplo: Sentry, LogRocket, etc.

        // Por enquanto, apenas simula o envio
        if (process.env.NODE_ENV === 'production') {
            // fetch('/api/error-log', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(errorLog)
            // }).catch(() => {
            //   // Silently fail if error logging fails
            // });
        }
    }

    getLogs(): ErrorLog[] {
        return [...this.logs];
    }

    clearLogs(): void {
        this.logs = [];
    }

    getErrorStats(): {
        total: number;
        byComponent: Record<string, number>;
        recent: number;
    } {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        const byComponent: Record<string, number> = {};
        let recent = 0;

        this.logs.forEach(log => {
            // Conta por componente
            if (log.componentName) {
                byComponent[log.componentName] = (byComponent[log.componentName] || 0) + 1;
            }

            // Conta erros recentes (última hora)
            if (new Date(log.timestamp) > oneHourAgo) {
                recent++;
            }
        });

        return {
            total: this.logs.length,
            byComponent,
            recent,
        };
    }
}

// Hook para usar o logger em componentes
export const useErrorLogger = () => {
    const logger = ErrorLogger.getInstance();

    const logError = (
        error: Error | string,
        componentName?: string,
        additionalData?: Record<string, any>
    ) => {
        logger.logError(error, componentName, undefined, additionalData);
    };

    return { logError };
};

// Função utilitária para logging seguro
export const safeLogError = (
    error: Error | string,
    context?: string,
    additionalData?: Record<string, any>
) => {
    const logger = ErrorLogger.getInstance();
    logger.logError(error, context, undefined, additionalData);
};

export default ErrorLogger.getInstance(); 