# Sistema de Mesa de Ayuda y Gestión de Operaciones TI (Helpdesk)

Plataforma integral para la gestión de incidencias, trazabilidad de activos tecnológicos, monitoreo de infraestructura de red, analítica y gamificación corporativa.

---

## 🚀 Arquitectura y Tecnologías

- **Frontend:** Next.js 15 (React 19, TypeScript, Tailwind CSS)
- **Comunicación en Tiempo Real:** Microsoft SignalR Client (WebSockets bidireccionales de baja latencia)
- **Alertas y Notificaciones:** Web Push W3C (VAPID) para soporte PWA y móviles
- **Visualización de Datos:** Recharts con matrices de calor operativas y reportes ejecutivos en PDF
- **Backend Conectado:** .NET 8 Web API de alto rendimiento (desplegado en Render)
- **Base de Datos:** PostgreSQL en Supabase estructurada en Tercera Forma Normal (3NF)

---

## 📋 Módulos Principales

1. **Mesa de Ayuda (Tickets):** Registro, atención, resolución y trazabilidad de incidencias multisede con asignación técnica y auditoría en tiempo real.
2. **Gestión de Activos (Inventario):** Control del ciclo de vida de equipamiento tecnológico con historial de intervenciones y mantenimiento preventivo.
3. **Infraestructura y Redes:** Topología de dispositivos de red (switches, routers, APs), mapeo de VLANs y direccionamiento IP por sede y área.
4. **Analítica y SLAs:** Indicadores clave de desempeño (KPIs), métricas de resolución, mapa de calor de fallas por departamento y exportación de reportes PDF ejecutivos.
5. **Gamificación y Academia TI:** Sistema de incentivos, niveles, rangos RPG y cuestionarios de capacitación para usuarios y técnicos.
6. **Administración y Seguridad:** Control de acceso basado en roles (RBAC) y gestión de usuarios por módulos permitidos.

---

## ⚙️ Configuración del Entorno

### Requisitos previos
- Node.js 18+ o 20 LTS
- Gestor de paquetes `npm`

### Variables de Entorno
Crear un archivo `.env.local` basado en [.env.example](.env.example):
```env
NEXT_PUBLIC_API_URL=https://it-ops-backend.onrender.com
```

### Instalación y Ejecución Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 🚢 Despliegue en Producción (Vercel)

El proyecto está optimizado para despliegue continuo en Vercel:
1. Conectar el repositorio de GitHub en Vercel.
2. Configurar la variable de entorno:
   - `NEXT_PUBLIC_API_URL`: URL del backend en producción (ej. `https://it-ops-backend.onrender.com`).
3. El despliegue se ejecuta automáticamente con cada cambio en la rama `main`.
