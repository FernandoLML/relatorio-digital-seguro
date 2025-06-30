# Usa uma imagem base oficial do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos package.json e package-lock.json (se existir)
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install --production

# Copia todo o código-fonte para o diretório de trabalho
COPY . .

# Expõe a porta em que o backend será executado
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["node", "src/server.js"]