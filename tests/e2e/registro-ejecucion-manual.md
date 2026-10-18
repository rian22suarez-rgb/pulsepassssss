# Registro de Ejecución Manual - Fase 5 E2E

**Fecha de ejecución:** 17/10/2026
**Ejecutor:** Rian
**Entorno:** PulsePass-local (http://localhost:8080)

## Bitácora

| ID Caso | Actor | Método y Ruta | HTTP Esp. | HTTP Obs. | Descripción / Objetivo | Resultado | Observaciones |


| Health Check | ANON | GET /api/venues/active | 200 | 200 | Verificación de conectividad inicial | **PASS** | Sede active detectada. |
| TC-AUTH-002 | USER_A | POST /api/v1/auth/login | 200 | 200 | Autenticación de usuario estándar A | **PASS** | Token Bearer generado correctamente. |
| TC-AUTH-002b | USER_B | POST /api/v1/auth/login | 200 | 200 | Autenticación de usuario estándar B | **PASS** | Token Bearer generado correctamente. |
| TC-AUTH-002c | ADMIN | POST /api/v1/auth/login | 200 | 200 | Autenticación de Administrador | **PASS** | Token Bearer generado correctamente. |
| TC-AUTH-002d | STAFF | POST /api/v1/auth/login | 200 | 200 | Autenticación de Personal Staff | **PASS** | Token Bearer generado correctamente. |
| TC-AUTH-006 | USER_A | GET /api/v1/auth/me | 200 | 200 | Validar sesión e identidad USER_A | **PASS** | Identidad y rol USER devueltos. |
| TC-AUTH-006b | USER_B | GET /api/v1/auth/me | 200 | 200 | Validar sesión e identidad USER_B | **PASS** | Identidad y rol USER devueltos. |
| TC-EVT-03 | ANON | GET /api/events/published | 200 | 200 | Obtener catálogo de eventos públicos | **PASS** | Lista de eventos en estado PUBLISHED. |
| TC-BIZ-007 | USER_A | POST /api/tickets | 201 | 201 | Compra de ticket para USER_A | **PASS** | Ticket generado con éxito. |
| TC-SEC-010 | USER_B | POST /api/tickets | 403 / 400 | 403 / 400 | Intento de compra con email ajeno | **PASS** | Validado bloqueo de IDOR/payload. |
| TC-SEC-009 | USER_B | GET /api/tickets/user/{email} | 403 | 403 | Consulta de tickets de otro usuario | **PASS** | Denegado por falta de permisos (403). |
| TC-AUTH-007 | ANON | GET /api/v1/auth/me | 401 | 401 | Acceso a ruta protegida sin token | **PASS** | Servidor rechazó la petición anónima. |
| TC-AUTH-008 | ANON | GET /api/v1/auth/me | 401 | 401 | Rechazar token JWT inválido | **PASS** | Firma JWT no válida detectada. |
| TC-SEC-001 | USER_A | POST /api/events | 403 | 201 | Bloquear creación de evento a rol USER | **FAIL** | **Vulnerabilidad:** Usuario estándar pudo crear eventos. |
| TC-ERR-400 | ANON | POST /api/users | 400 | 400 | Registro sin contraseña obligatoria | **PASS** | Retornó error de validación 400. |
| TC-ERR-409 | ANON | POST /api/users | 409 | 409 | Intento de registro duplicado | **PASS** | Retornó conflicto 409 por username existente. |
| TC-FLOW-001 | ANON | GET /api/events/published | 200 | 200 | Flujo A: Descubrimiento público | **PASS** | Eventos públicos obtenidos correctamente. |
| TC-FLOW-003 | ADMIN | PATCH /api/events/E2E-2026/publish | 200 / 409 | 409 | Flujo C: Publicación de evento por ADMIN | **PASS** | Confirma que el evento ya estaba publicado. |
| TC-FLOW-004 | USER_A | POST /api/tickets | 201 | 201 | Flujo D: Compra de ticket usuario final | **PASS** | Ticket creado y vinculado a E2E-2026. |