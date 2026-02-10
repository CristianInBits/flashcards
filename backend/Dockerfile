# Dockerfile para Backend Spring Boot
# Este archivo define cómo construir la imagen Docker de tu backend

# ETAPA 1: BUILD (Compilación)
# Usamos una imagen con Java y Maven para compilar el proyecto
FROM eclipse-temurin:21-jdk-alpine AS build

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivo de configuración de Maven
COPY pom.xml .

# Copiar código fuente
COPY src ./src

# Instalar Maven (gestor de dependencias de Java)
RUN apk add --no-cache maven

# Compilar el proyecto (crea un archivo .jar)
# -DskipTests = no ejecuta tests (para ir más rápido)
RUN mvn clean package -DskipTests

# ETAPA 2: RUNTIME (Ejecución)
# Usamos una imagen más ligera solo con Java (sin Maven)
FROM eclipse-temurin:21-jre-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar el .jar compilado desde la etapa BUILD
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto 8080 (donde corre Spring Boot)
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
