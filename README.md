# PulsePass API

Backend REST para venta de tickets de eventos. Construido con Spring Boot 4, Spring Security 7, JWT (JJWT) y PostgreSQL 18. Este documento cubre el estado completo del proyecto, desde la persistencia hasta la seguridad y autorización.

---

## 📋 Stack Tecnológico

- **Java 21**
- **Spring Boot 4.1.1**, Spring Framework 7.0.9, Spring Security 7.1.1
- **Hibernate 7.4.5**, Spring Data JPA
- **PostgreSQL 18** (Docker)
- **Flyway 12.4.0** (Migraciones V1–V4)
- **JJWT 0.13.0** (Firma HS256)
- **MapStruct 1.6.3** (Mapeo DTO ↔ Entidad)
- **Testcontainers 2.0.5** (Pruebas de integración reales)
- **Maven Wrapper**

---

## 🚀 Requisitos Previos

- **JDK 21+** (el proyecto usa JDK 27 en IntelliJ)
- **Docker Desktop** corriendo
- **Git**

---

## 🗄️ Base de Datos

El proyecto usa PostgreSQL 18 en un contenedor Docker. Para levantarlo:

```bash
docker compose up -d