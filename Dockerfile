FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie os arquivos .json para o diretorio de trabalho
COPY package.json package-lock.json ./

# Instale as dependências do trabalho
RUN npm install

# Copie o diretório prisma e os outros arquivos para o diretório de trabalho
COPY prisma ./prisma
COPY . .

# Exporta a porta 3000
EXPOSE 3000

# Execute o aplicativo quando o contêiner for iniciado
CMD ["sh", "-c", "npx prisma migrate dev --name init --schema=./prisma/schema.prisma && npm run dev"]