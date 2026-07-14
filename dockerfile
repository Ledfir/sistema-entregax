FROM node:20

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 5173

# En desarrollo
CMD ["npm", "run", "dev", "--", "--host"]

# Para producción, usa: npm run start