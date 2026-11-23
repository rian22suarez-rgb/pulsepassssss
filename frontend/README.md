# PulsePass — Frontend (Fase 5)

SPA en **React 19 + TypeScript (strict) + Tailwind CSS v4 + React Router v8 + TanStack Query + React Hook Form + zod**, con pruebas en **Vitest + Testing Library**. Consume la API Spring Boot de este mismo repositorio **sin modificarla**.

## Cómo ejecutarlo

Requisitos: Node 22.22 o superior, y el backend corriendo en `http://localhost:8080` (como indica el README raíz: `docker compose up -d` y luego la app Spring Boot).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm test           # 38 pruebas, sin backend real
npm run build      # typecheck + bundle de producción en dist/
```

Si tu API corre en otro puerto, copia `.env.example` a `.env` y cambia `VITE_API_PROXY`.

## Por qué no rompe el backend

| Decisión | Justificación |
|---|---|
| Todo vive en la carpeta `frontend/` | No se tocó ningún archivo Java, SQL, `pom.xml` ni la configuración de Spring. El backend compila y se ejecuta igual que antes. |
| Proxy de Vite (`/api` → `:8080`) | Tu `SecurityConfig` no configura CORS (GAP-05 del PRD). Con el proxy, el navegador ve un solo origen y no hace falta cambiar el backend. |
| Rutas tomadas de **tus controladores reales**, no del PRD | El PRD usa nombres de ejemplo que no coinciden con tu código. Se usaron los reales (ver tabla abajo). |
| Validación zod tolerante en campos dudosos | Los DTO en `dto/` no se pudieron leer directamente. Los campos se dedujeron de tus mappers MapStruct, de tus entidades y de la colección Postman. Los campos opcionales usan `looseObject`/`nullish`, como permite el PRD §10.2. |
| Roles normalizados | Se acepta tanto `ADMIN` como `ROLE_ADMIN` desde `/me`. |

### Endpoints: PRD frente a tu backend

| Operación | El PRD decía | Tu backend (lo que usa el frontend) |
|---|---|---|
| Login | `POST /api/auth/login` | `POST /api/v1/auth/login` |
| Usuario autenticado | `GET /api/auth/me` | `GET /api/v1/auth/me` |
| Tickets del usuario | `GET /api/tickets/by-user?email=` | `GET /api/tickets/user/{email}` |
| Tickets pagados por evento | `GET /api/events/{code}/tickets/paid` | `GET /api/tickets/event/{code}/paid` |
| Perfil | `GET /api/users/by-username` | `GET /api/users/{username}` |

Las 20 operaciones REST y los endpoints de autenticación están en `src/api/endpoints.ts`, cada uno con una función.

## Estilo visual (adaptado de Techvora)

Valores medidos directamente en la plantilla publicada de Techvora:

- **Paleta:** tinta `#0A0A12`, verde bosque `#17432D`, lima `#B4F03D`, rosa `#F6A9E4`, naranja `#FF7A3D`, mostaza `#EBAF3F` y coral `#FF6A63`.
- **Tipografía:** *Anton* en mayúsculas para títulos, *Inter* para el texto y *JetBrains Mono* para las etiquetas pequeñas. Las fuentes van incluidas en el bundle (`@fontsource`), sin CDN externo.
- **Patrones de Techvora:** navbar flotante en forma de píldora, botones píldora con punto, hero verde con rejilla y palabra gigante, banda rosa ladeada con el lema, secciones numeradas "01 · …" y bloques de color con cifras grandes.
- **Adaptación a PulsePass:** las tarjetas de evento y los tickets tienen **forma de entrada** (muescas laterales y línea perforada). Cada categoría de evento y cada tipo de ticket tiene un color de la paleta. Como la API no entrega imágenes, el color y la tipografía reemplazan a las fotos.
- **Nombres del PRD:** los tokens conservan los nombres que pide el PRD (`marca`, `acento`, `--font-titulo`, `--font-cuerpo`) en `src/index.css`, así que la sección 9.1 sigue siendo válida.
- **Modo oscuro:** respeta `prefers-color-scheme` y además tiene un botón para alternarlo.

## Estructura

```
src/
  lib/          http.ts (fetch + Bearer + ApiError), esquemas.ts (zod), errores.ts, rutas.ts (RUTAS), formato.ts, almacen.ts
  api/          endpoints.ts (una función por endpoint), consultas.ts (hooks TanStack Query + invalidaciones)
  auth/         AuthContext (sesión como unión discriminada), Guardas (RutaProtegida, RutaPorRol, SoloAnonimo)
  componentes/  Boton, Campo/Selector, Badge, Tarjeta, Modal (<dialog>), Tabla<T>, Estados, Aviso, Layout, TicketVisual…
  paginas/      las 20 páginas del PRD §8.1, cargadas con lazy salvo Inicio
  pruebas/      Vitest: http, errores, esquemas, componentes, guardas, login, registro, compra y expiración de sesión
```

## Brechas del backend y cómo se resolvieron en el cliente

- **GAP-01, no hay un listado de todos los eventos:** el panel ADMIN busca por código y recuerda en `sessionStorage` los eventos creados o consultados durante la sesión.
- **GAP-02, los borradores no son públicos:** un 404 o 403 se muestra como "Evento no disponible".
- **GAP-03, no hay consulta de tickets por ID de usuario:** se usa el email que devuelve `/me`, nunca un email escrito a mano.
- **GAP-04, la API no informa entradas disponibles:** se muestra la capacidad de la sede, y el 409 por capacidad se muestra tal cual lo envía el backend.
- **GAP-06, el precio lo fija el backend:** la interfaz no calcula ni envía precios; el precio se muestra en la confirmación.
- **GAP-07, el registro no emite token:** después de registrarse, la persona va a `/login` con un aviso y el usuario ya escrito.
- **GAP-08, no hay refresh token:** se programa un cierre de sesión local al vencer el token, y cualquier 401 cierra la sesión y lleva a `/login` con el aviso "Tu sesión expiró".

## Seguridad en el cliente

- El token se guarda en `sessionStorage` y en memoria, nunca en `localStorage` ni en cookies. Solo viaja en `Authorization: Bearer` y nunca en la URL ni en la consola.
- Las guardas de ruta mejoran la experiencia, pero **no son seguridad**: un 403 del servidor siempre prevalece.
- La redirección después del login solo acepta rutas internas (`/…`), para evitar redirecciones abiertas a otros sitios.

## Pendiente de tu lado

1. **Confirmar los DTO.** Si algún nombre de campo de `AuthResponse`, `EventResponse`, `TicketResponse` o `UserResponse` difiere de lo que hay en `src/lib/esquemas.ts`, basta con ajustarlo ahí. La consola de desarrollo avisa con "Respuesta de … no cumple el contrato".
2. **Revisar `EventResponse`.** Si no incluye la lista `artists`, el detalle de evento muestra "Line-up por anunciar". Para ver los artistas del evento, el DTO debería exponer esa lista (es un cambio de backend, que es opcional).
3. **Revisar la regla del matcher en `SecurityConfig`.** La regla de `/api/events/*/tickets/paid` no corresponde a ninguna ruta del `TicketController`. El endpoint real (`/api/tickets/event/{code}/paid`) igual queda protegido por `@PreAuthorize`, así que el frontend funciona, pero vale la pena alinear esa regla.
