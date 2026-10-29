# rrhh-frontend

Interfaz web del sistema de RRHH: React + TypeScript + Vite, con [Refine](https://refine.dev) y Ant Design (en español).

- **Login**: Keycloak con Authorization Code + PKCE. Sin sesión, la app redirige al login de Keycloak; el token se renueva solo.
- **API**: todo pasa por Kong (`VITE_API_URL`). Cada recurso indica su microservicio en `meta.servicio` y el `dataProvider` arma la URL: `cargos` → `/api/organizacion/cargos`.
- **Pantallas**: legajos de funcionarios (listado con búsqueda y filtro por estado, alta con cargo inicial, edición, detalle con el cargo actual y baja lógica) y catálogos de sectores, cargos, tipos de contrato y países, con búsqueda. El cargo se guarda en el historial de ms-desempeno, no en el legajo.

## Desarrollo

Con la plataforma (`rrhh-plataforma`) y los microservicios levantados:

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Usuario inicial: `admin.rrhh` / `Admin-dev-2026` (Keycloak pide cambiarla).

## En Docker

```bash
docker compose up -d --build   # http://localhost:5173, servido por nginx
```

## Agregar una pantalla

1. Declarar el recurso en `src/App.tsx` con su `meta.servicio`.
2. Para un catálogo simple alcanza con `<Catalogo>` (`src/pages/catalogos/catalogo.tsx`): columnas + campos del formulario.
3. Para algo más complejo, seguir el ejemplo de `src/pages/funcionarios`.

## Pendiente

- La API todavía no devuelve el total de registros: el paginador asume que hay otra página cuando la actual vino llena.
- Pantallas de hijos, formación, documentos, desempeño, nómina y vacaciones.
- Mostrar u ocultar acciones según el rol (`authProvider.getPermissions` ya devuelve los roles).
