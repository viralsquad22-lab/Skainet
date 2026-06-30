<p align="center">
  <img src="https://img.shields.io/badge/SKAINET-Workshop%20Manager-d4af37?style=for-the-badge&labelColor=0a0a0a&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Q0YWYzNyI+PHBhdGggZD0iTTEyIDJMMyA3bDkgNSA5LTVMMTJ6Ii8+PHBhdGggZD0iTTMgMTdsMTAgNSA5LTVNMyAxMmw5IDUgOS01Ii8+PC9zdmc+" alt="Skainet Badge"/>
</p>

<h1 align="center">💎 SKAINET — Jewelry Workshop Manager</h1>

<p align="center">
  <strong>Sistema integral de gestión para talleres de joyería</strong><br/>
  Control de personal · Órdenes de trabajo · Trazabilidad de materiales · Pedidos de clientes
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-NestJS-e0234e?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/Frontend-React%20+%20Vite-61dafb?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Mobile-Flutter-02569B?style=flat-square&logo=flutter&logoColor=white" alt="Flutter"/>
  <img src="https://img.shields.io/badge/Database-SQLite%20/%20Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white" alt="Render"/>
</p>

---

## 📋 Descripción

**Skainet** es un sistema completo de gestión para talleres de joyería artesanal. Permite controlar el flujo de trabajo desde la recepción de materiales hasta la entrega de productos terminados, con trazabilidad de pesos, órdenes de trabajo asignadas, y seguimiento de pedidos de clientes en tiempo real.

Diseñado para ser utilizado tanto desde un navegador web como desde dispositivos móviles Android.

---

## 🏗️ Arquitectura del Proyecto

```
Skainet-main/
├── 🔧 backend/          # API REST — NestJS + Prisma + SQLite
├── 🌐 frontend/         # Panel Web — React + Vite
├── 📱 skainet_mobile/   # App Android — Flutter + Dart
├── 🎨 boceto/           # Maquetas HTML iniciales del diseño
└── ⚙️ render.yaml       # Configuración de deploy en Render.com
```

---

## 🌿 Estrategia de ramas

El proyecto usa una rama principal estable y ramas de flujo de trabajo para desarrollo y pruebas.

- `main` — rama de producción, versión estable y lista para deploy.
- `develop` — rama de integración para nuevas funcionalidades y mejoras.
- `qa` — rama de pruebas de control de calidad antes de subir a `main`.

Flujo recomendado:

1. Crear ramas de feature a partir de `develop`.
2. Hacer merge a `qa` para pruebas y revisión.
3. Una vez aprobado, mergear `qa` en `main`.

Esta estructura permite mantener el backend, frontend y la app Flutter separados por carpetas, pero coordinados desde un solo repositorio.

---

## ✨ Características Principales

### 👥 Gestión de Usuarios
- Roles jerárquicos: **Admin**, **Joyero**
- Estados en tiempo real: *Disponible*, *Ocupado*, *Ausente*
- Autenticación segura con **JWT**
- Creación, edición y eliminación de personal

### 📦 Control de Lotes (Batches)
- Registro de lotes de materia prima con peso de entrada/salida
- Generación automática de **anillos** a partir de cada lote
- Seguimiento de anillos pendientes de asignación

### 📝 Órdenes de Trabajo
- Asignación de anillos a joyeros con registro de pesos
- Verificación por **PIN** para seguridad en entregas
- Cierre de órdenes con control de pesos finales y explicaciones
- Cálculo automático de **diferencia de peso** y alertas

### 💍 Pedidos de Clientes
- Registro de pedidos con diseño, peso estimado, contacto
- Seguimiento de estado por pasos: *Recibido → En proceso → Terminado → Entregado*
- Historial completo del pedido

### 🚨 Alertas y Estadísticas
- Sistema de alertas automáticas por diferencias de peso
- Dashboard con estadísticas generales del taller

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| **Backend** | NestJS + TypeScript | API REST modular con controladores, servicios y DTOs |
| **Base de Datos** | SQLite + Prisma ORM | Base de datos ligera con migraciones automáticas |
| **Autenticación** | JWT (JSON Web Tokens) | Tokens firmados con expiración configurable |
| **Frontend Web** | React + Vite | SPA con interfaz moderna y responsive |
| **App Móvil** | Flutter + Dart | App nativa Android con Material Design |
| **HTTP Client** | Dio (Flutter) | Cliente HTTP con interceptores para auth |
| **Estado** | Provider (Flutter) | Gestión de estado reactiva |
| **Deploy** | Render.com | Backend como servicio web + Frontend estático |

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- [Node.js](https://nodejs.org/) v18+
- [Flutter SDK](https://flutter.dev/docs/get-started/install) 3.x+
- [Git](https://git-scm.com/)

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/josegualguan1-crypto/skainet.git
cd skainet
```

### 2️⃣ Backend (API)

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

> El servidor se ejecuta en `http://localhost:3000`

### 3️⃣ Frontend (Panel Web)

```bash
cd frontend
npm install
npm run dev
```

> La interfaz web se abre en `http://localhost:5173`

### 4️⃣ App Móvil (Android)

```bash
cd skainet_mobile
flutter pub get
flutter run
```

> Para generar el APK: `flutter build apk`

---

## 📁 Estructura del Backend

```
backend/src/
├── auth/              # Módulo de autenticación JWT
├── users/             # CRUD de usuarios y roles
├── batches/           # Gestión de lotes y anillos
├── orders/            # Órdenes de trabajo internas
├── client-orders/     # Pedidos de clientes externos
├── alerts/            # Sistema de alertas automáticas
├── stats/             # Estadísticas del taller
├── machines/          # Gestión de maquinaria
├── notifications/     # Notificaciones del sistema
├── recovery/          # Recuperación de datos
├── prisma/            # Servicio de Prisma ORM
└── common/            # Utilidades compartidas
```

---

## 📁 Estructura de la App Móvil

```
skainet_mobile/lib/
├── config/            # Configuración de API, tema y rutas
├── models/            # Modelos de datos (User, Batch, Order...)
├── providers/         # Estado global (AuthProvider, WorkshopProvider)
├── screens/           # Pantallas (Login, Dashboard Admin/Joyero)
├── services/          # ApiService (Dio HTTP client)
└── widgets/           # Componentes reutilizables (GlassCard, etc.)
```

---

## 🌐 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/users/login` | Iniciar sesión |
| `GET` | `/users` | Listar usuarios |
| `POST` | `/users` | Crear usuario |
| `PATCH` | `/users/:id/status` | Cambiar estado |
| `DELETE` | `/users/:id` | Eliminar usuario |
| `GET` | `/batches` | Listar lotes |
| `POST` | `/batches` | Crear lote |
| `GET` | `/batches/pending-rings` | Anillos pendientes |
| `GET` | `/orders` | Listar órdenes |
| `POST` | `/orders` | Crear orden de trabajo |
| `POST` | `/orders/:id/close` | Cerrar orden |
| `GET` | `/client-orders` | Listar pedidos de clientes |
| `POST` | `/client-orders` | Crear pedido |
| `PATCH` | `/client-orders/:id/status` | Actualizar estado |
| `GET` | `/alerts` | Listar alertas |
| `GET` | `/stats` | Estadísticas generales |

---

## 🎨 Diseño

El proyecto utiliza una estética **premium oscura** con acentos dorados, inspirada en la elegancia de la joyería:

- **Fondo**: Negro profundo con gradientes radiales
- **Cards**: Efecto glassmorphism con bordes dorados semitransparentes
- **Tipografía**: [Outfit](https://fonts.google.com/specimen/Outfit) de Google Fonts
- **Colores principales**:
  - Dorado: `#D4AF37`
  - Cian (acento móvil): `#00FFCC`
  - Fondo oscuro: `#0A0A0A`

---

## 📱 Capturas de Pantalla

> *Próximamente — capturas del panel web y la app móvil*

---

## 🚢 Despliegue en Render.com

El proyecto incluye configuración lista para deploy:

- **Backend**: Servicio web con Docker
- **Frontend**: Sitio estático con build de Vite

```bash
# El archivo render.yaml configura ambos servicios automáticamente
```

Variables de entorno requeridas:
| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `PORT` | Puerto del servidor (default: 8080) |
| `VITE_API_URL` | URL del backend para el frontend |

---

## 👨‍💻 Autor

**Jose Gualguan** — [@josegualguan1-crypto](https://github.com/josegualguan1-crypto)

---

## 📄 Licencia

Este proyecto es de uso privado. Todos los derechos reservados.
