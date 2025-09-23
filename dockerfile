FROM node:alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./


# Copiar los archivos de configuración del gateway
COPY apps/agro-repo-frontend/package.json apps/agro-repo-frontend/

# Instalar dependencias (esto instalará todo el workspace)
RUN pnpm install --frozen-lockfile


# Copiar el código fuente del gateway
COPY apps/agro-repo-frontend apps/agro-repo-frontend

# Cambiar al directorio del gateway
WORKDIR /app/apps/agro-repo-frontend

# Compilar la aplicación
RUN pnpm run build

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]