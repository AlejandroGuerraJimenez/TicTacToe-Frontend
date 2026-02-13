# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifests
COPY package.json package-lock.json* ./

# Instalar dependencias (incluidas devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción (genera archivos estáticos)
RUN npm run build

# Stage 2: Run
FROM nginx:alpine AS run

# Copiar archivos estáticos build al directorio de nginx
COPY --from=build /app/dist/tictactoe/browser /usr/share/nginx/html

# Configuración básica de nginx para SPA
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
