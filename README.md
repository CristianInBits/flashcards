# Flashcards

Aplicación de tarjetas de estudio (flashcards) para aprendizaje personal. Construida con Spring Boot en el backend y React en el frontend, desplegable con Docker Compose.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot 4.0.2 · Java 21 · Spring Security · JWT |
| Base de datos | PostgreSQL 15 · Flyway (migraciones) |
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS |
| HTTP client | Axios con interceptor JWT automático |
| Routing | React Router 7 con rutas protegidas |
| Infraestructura | Docker · Docker Compose |

---

## Arquitectura

```
flashcards/
├── backend/          # Spring Boot API REST
├── frontend/         # React SPA
└── docker-compose.yml
```

**Puertos:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- (Opcional, para desarrollo local) Node.js 18+ y Java 21+

---

## Inicio rápido con Docker

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd flashcards

# Levantar todos los servicios
docker compose up

# En segundo plano
docker compose up -d
```

La primera vez descarga las imágenes, compila el proyecto y aplica las migraciones de base de datos automáticamente.

Acceder a la app en: **http://localhost:5173**

### Parar los servicios

```bash
docker compose down

# Parar y eliminar la base de datos (datos incluidos)
docker compose down -v
```

---

## Desarrollo local (sin Docker)

### Base de datos

Necesitas una instancia de PostgreSQL con estas credenciales:

```
Host:     localhost:5432
Base de datos: flashcards
Usuario:  flashcards_user
Contraseña: flashcards_password
```

Puedes levantar solo la BD con Docker:

```bash
docker compose up db
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

El servidor arranca en `http://localhost:8080`. Flyway aplica las migraciones automáticamente al iniciar.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo arranca en `http://localhost:5173`.

#### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Análisis estático con ESLint |

---

## API REST

Base URL: `http://localhost:8080/api`

Todos los endpoints (excepto auth) requieren el header:
```
Authorization: Bearer <token>
```

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/register` | Registro de usuario |
| `POST` | `/auth/login` | Login, devuelve JWT |
| `GET` | `/auth/me` | Datos del usuario autenticado |

### Mazos (Decks)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/decks` | Listar mazos (paginado, con filtros) |
| `POST` | `/decks` | Crear mazo |
| `GET` | `/decks/:id` | Ver mazo |
| `PATCH` | `/decks/:id` | Editar mazo (solo propietario) |
| `DELETE` | `/decks/:id` | Eliminar mazo (solo propietario) |

**Filtros disponibles en `GET /decks`:** `page`, `size`, `search`, `tags`, `onlyPublic`

### Tarjetas (Cards)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/decks/:deckId/cards` | Listar tarjetas del mazo |
| `POST` | `/decks/:deckId/cards` | Crear tarjeta (solo propietario) |
| `GET` | `/decks/:deckId/cards/:cardId` | Ver tarjeta |
| `PUT` | `/decks/:deckId/cards/:cardId` | Editar tarjeta (solo propietario) |
| `DELETE` | `/decks/:deckId/cards/:cardId` | Eliminar tarjeta (solo propietario) |

---

## Schema de base de datos

```sql
-- Usuarios
users (id UUID, email, username, password_hash, created_at, updated_at)

-- Mazos
decks (id UUID, user_id FK, title, description, tags TEXT[], is_public, created_at, updated_at)

-- Tarjetas
cards (id UUID, deck_id FK, front TEXT, back TEXT, created_at, updated_at)
```

Las migraciones están en `backend/src/main/resources/db/migration/` y Flyway las aplica en orden al arrancar.

---

## Estado del proyecto

### Completado

- [x] Autenticación completa (registro, login, JWT, rutas protegidas)
- [x] CRUD de mazos con paginación, búsqueda y filtros por etiquetas
- [x] Mazos públicos y privados
- [x] CRUD de tarjetas (frente y reverso) dentro de cada mazo
- [x] Visualización de tarjetas con toggle para revelar el reverso
- [x] Control de permisos (solo el propietario puede editar/eliminar)
- [x] Migraciones de base de datos con Flyway
- [x] Docker Compose con todos los servicios configurados

### Pendiente

- [ ] Modo estudio con flip card animado
- [ ] Navbar / layout global
- [ ] Algoritmo de repetición espaciada (SRS)

---

## Variables de entorno

### Backend

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `miClaveSecretaPorDefectoParaDesarrolloLocal...` |
| `SPRING_DATASOURCE_URL` | URL de conexión a PostgreSQL | Configurado en docker-compose |

> En producción, define `JWT_SECRET` con una clave aleatoria larga.

### Frontend

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base de la API | `http://localhost:8080/api` |

Crear un archivo `.env` en la carpeta `frontend/` para sobreescribir los valores.
