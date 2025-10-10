FROM node:alpine

WORKDIR /app

RUN npm install -g pnpm

# Copiar archivos de configuración del workspace
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copiar los archivos de configuración del frontend
COPY apps/agro-repo-frontend/package.json apps/agro-repo-frontend/

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile

# Copiar el código fuente del frontend
COPY apps/agro-repo-frontend apps/agro-repo-frontend

# Cambiar al directorio del frontend
WORKDIR /app/apps/agro-repo-frontend

# Exponer el puerto de Vite (desarrollo)
EXPOSE 5173

# Comando para ejecutar en modo desarrollo
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]