# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifests
COPY package.json package-lock.json* ./

# Instalar dependencias (incluidas devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción (genera browser + server SSR)
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS run

WORKDIR /app

# Solo lo necesario para ejecutar el server SSR
COPY --from=build /app/dist/tictactoe ./dist/tictactoe
COPY --from=build /app/package.json package-lock.json* ./

# Dependencias de producción para el server (express está en dependencies)
RUN npm ci --omit=dev

# Railway inyecta PORT en runtime; el server de Angular SSR lo usa por defecto
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/tictactoe/server/server.mjs"]
