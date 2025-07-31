import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
    windowMs: number; // Janela de tempo em milissegundos
    maxRequests: number; // Máximo de requisições por janela
    message?: string;
    statusCode?: number;
}

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

class RateLimiter {
    private store: RateLimitStore = {};
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = {
            message: 'Muitas requisições. Tente novamente mais tarde.',
            statusCode: 429,
            ...config,
        };

        // Limpa dados expirados a cada 5 minutos
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    private getClientKey(req: Request): string {
        // Usa IP do cliente como chave
        return req.ip || req.connection.remoteAddress || 'unknown';
    }

    private cleanup(): void {
        const now = Date.now();
        Object.keys(this.store).forEach(key => {
            if (this.store[key].resetTime <= now) {
                delete this.store[key];
            }
        });
    }

    middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            const clientKey = this.getClientKey(req);
            const now = Date.now();

            // Inicializa ou obtém dados do cliente
            if (!this.store[clientKey]) {
                this.store[clientKey] = {
                    count: 0,
                    resetTime: now + this.config.windowMs,
                };
            }

            const clientData = this.store[clientKey];

            // Verifica se a janela de tempo expirou
            if (now > clientData.resetTime) {
                clientData.count = 0;
                clientData.resetTime = now + this.config.windowMs;
            }

            // Incrementa contador
            clientData.count++;

            // Adiciona headers de rate limit
            res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - clientData.count));
            res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());

            // Verifica se excedeu o limite
            if (clientData.count > this.config.maxRequests) {
                return res.status(this.config.statusCode!).json({
                    error: 'Rate limit exceeded',
                    message: this.config.message,
                    retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
                });
            }

            next();
        };
    }
}

// Configurações específicas para diferentes tipos de endpoints
export const createRateLimiters = () => {
    // Rate limiter padrão para APIs gerais
    const defaultLimiter = new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 100, // 100 requisições
    });

    // Rate limiter mais restritivo para autenticação
    const authLimiter = new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 5, // 5 tentativas de login
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    });

    // Rate limiter para uploads
    const uploadLimiter = new RateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hora
        maxRequests: 10, // 10 uploads por hora
        message: 'Limite de uploads excedido. Tente novamente em 1 hora.',
    });

    // Rate limiter para IA (mais restritivo)
    const aiLimiter = new RateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hora
        maxRequests: 20, // 20 requisições de IA por hora
        message: 'Limite de requisições de IA excedido. Tente novamente em 1 hora.',
    });

    return {
        default: defaultLimiter.middleware(),
        auth: authLimiter.middleware(),
        upload: uploadLimiter.middleware(),
        ai: aiLimiter.middleware(),
    };
};

// Middleware para aplicar rate limiting baseado no tipo de rota
export const applyRateLimiting = (req: Request, res: Response, next: NextFunction) => {
    const limiters = createRateLimiters();

    // Aplica rate limiting baseado no tipo de rota
    if (req.path.startsWith('/api/auth')) {
        return limiters.auth(req, res, next);
    }

    if (req.path.startsWith('/api/ai')) {
        return limiters.ai(req, res, next);
    }

    if (req.path.includes('upload') || req.method === 'POST' && req.path.includes('fabric')) {
        return limiters.upload(req, res, next);
    }

    // Rate limiting padrão para outras rotas
    return limiters.default(req, res, next);
};

export default createRateLimiters; 