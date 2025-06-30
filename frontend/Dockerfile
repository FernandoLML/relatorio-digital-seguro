# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de configuração do pacote
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Instala as dependências do projeto (do frontend)
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm install --loglevel verbose; \
  elif [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
  else npm install; \
  fi

# Copia o código-fonte completo do frontend
COPY . .

# Configura a variável de ambiente para a URL do backend
ENV NEXT_PUBLIC_BACKEND_URL=http://host.docker.internal:3001

# Constrói a aplicação Next.js
RUN npm run build

# Stage 2: Serve the Next.js application
FROM node:18-alpine

WORKDIR /app

# Copia apenas os arquivos necessários da etapa de construção
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar o servidor Next.js em produção
CMD ["npm", "start"]