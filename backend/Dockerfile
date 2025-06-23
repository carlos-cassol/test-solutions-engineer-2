# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Remover devDependencies para reduzir tamanho da imagem
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Comando para iniciar com migrações
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"] 