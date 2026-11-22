# PulsePass API

Backend REST para la plataforma de gestión de eventos, artistas y venta de tickets. Construido con Spring Boot, Spring Security, JWT (JJWT) y PostgreSQL. Este repositorio implementa el ciclo completo de la aplicación, desde la persistencia y servicios hasta la capa de controladores REST, seguridad basada en roles (RBAC) y la suite de pruebas End-to-End (E2E).

---

## Stack Tecnológico

- **Java 21**
- **Spring Boot**, Spring Security, Spring Framework
- **Spring Data JPA & Hibernate**
- **PostgreSQL** (Docker)
- **Flyway** (Migraciones de base de datos)
- **JJWT** (Autenticación y tokens JWT con firma HS256)
- **MapStruct** (Mapeo DTO ↔ Entidad)
- **Maven Wrapper**

---

## Arquitectura y Dominio de la Aplicación

PulsePass gestiona 5 entidades de negocio principales que interactúan mediante reglas estrictas de capacidad, estados y roles:
1. **Venues (Sedes):** Espacios físicos activos donde se realizan los eventos.
2. **Artists (Artistas):** Creadores o talentos asociables a los eventos del catálogo.
3. **Events (Eventos):** Obras o presentaciones que pasan por estados de `DRAFT` (borrador) y `PUBLISHED` (público).
4. **Users (Usuarios):** Cuentas de usuario con roles diferenciados (`USER`, `STAFF`, `ADMIN`).
5. **Tickets (Entradas):** Títulos de acceso adquiridos por los usuarios, con ciclo de vida gestionado (`PAID`, `CANCELLED`, `USED`).

---

## Requisitos Previos

- **JDK 21+**
- **Docker Desktop** (para levantar la base de datos PostgreSQL)
- **Postman** (para la ejecución de la suite de pruebas E2E manuales)

---

## Base de Datos y Ejecución

El proyecto utiliza PostgreSQL en un contenedor Docker. Para levantar el entorno local:

```bash
docker compose up -d