# Railway Dockerfile para IA.TEX
FROM node:18-alpine

# Instalar dependências do sistema para produção
RUN apk add --no-cache \
    imagemagick \
    imagemagick-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev

# Definir diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 5000

# Definir variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=5000

# Comando de inicialização
CMD ["npm", "start"]