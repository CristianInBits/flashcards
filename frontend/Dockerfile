# Dockerfile para Frontend React + Vite
# Este es para DESARROLLO (con hot reload)

# Usar imagen de Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Exponer puerto de Vite (5173)
EXPOSE 5173

# Comando para ejecutar en modo desarrollo
# --host 0.0.0.0 permite acceso desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
