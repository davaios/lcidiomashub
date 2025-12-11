# Lovable - LC Idiomas

Plataforma de formación interna para LC Idiomas. Un backoffice que combina LMS (Learning Management System), Dashboard de evolución de carrera y Sistema de chat interno.

## Características

### LMS (Learning Management System)
- Catálogo de cursos con progreso
- Reproductor de video con seguimiento de progreso
- Sistema de lecciones secuenciales
- Exámenes con preguntas de opción múltiple
- Certificados de finalización
- Panel de administración de cursos

### Dashboard de Evolución
- Estadísticas de progreso personal
- Gráficos de completitud
- Sistema de insignias (gamificación)
- Historial de cursos
- Panel de administración con métricas globales

### Chat Interno (Micro-Slack)
- Canales públicos y privados
- Mensajes en tiempo real (Supabase Realtime)
- Reacciones con emojis
- Hilos de conversación
- Menciones (@usuario)

### Gestión de Usuarios
- Roles: Super Admin, Admin, Guest
- Departamentos: Profesores, Administración
- Sistema de invitaciones

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Build**: Vite
- **Charts**: Recharts
- **Video**: React Player
- **Icons**: Lucide React

## Paleta de Colores

- Fondos: `#FFFFFF` (blanco), `#F8FAFC` (gris claro)
- Primario/Azul corporativo: `#1E40AF`
- Acento/Progreso: `#F59E0B` (naranja/amarillo)
- Éxito: `#10B981`
- Error: `#EF4444`

## Requisitos

- Node.js 18+
- Cuenta de Supabase

## Instalación

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd lcidiomashub
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Configurar la base de datos:
- Ve a tu proyecto en Supabase
- Abre el SQL Editor
- Ejecuta el contenido de `supabase/schema.sql`

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/           # Componentes base (Shadcn/ui)
│   ├── layout/       # Layouts (Sidebar, Header, etc.)
│   ├── courses/      # Componentes de cursos
│   ├── chat/         # Componentes de chat
│   └── dashboard/    # Componentes de dashboard
├── contexts/         # React Contexts (Auth)
├── hooks/            # Custom hooks
├── lib/              # Utilidades y configuración
├── pages/            # Páginas de la aplicación
│   ├── auth/         # Login, Forgot Password
│   ├── courses/      # Cursos, Detalle, Examen
│   ├── dashboard/    # Dashboard personal
│   ├── chat/         # Chat interno
│   ├── settings/     # Configuración
│   └── admin/        # Panel de administración
├── services/         # Servicios API
└── types/            # TypeScript types
```

## Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linter

## Licencia

Privado - LC Idiomas
