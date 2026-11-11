-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: convenios
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asignaciones_revision`
--

DROP TABLE IF EXISTS `asignaciones_revision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaciones_revision` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_id` bigint(20) unsigned NOT NULL,
  `revisor_id` bigint(20) unsigned NOT NULL,
  `asignado_por` bigint(20) unsigned NOT NULL,
  `asignado_en` datetime NOT NULL,
  `completado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `asignaciones_revision_convenio_id_foreign` (`convenio_id`),
  KEY `asignaciones_revision_revisor_id_foreign` (`revisor_id`),
  KEY `asignaciones_revision_asignado_por_foreign` (`asignado_por`),
  CONSTRAINT `asignaciones_revision_asignado_por_foreign` FOREIGN KEY (`asignado_por`) REFERENCES `users` (`id`),
  CONSTRAINT `asignaciones_revision_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_revision_revisor_id_foreign` FOREIGN KEY (`revisor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_revision`
--

LOCK TABLES `asignaciones_revision` WRITE;
/*!40000 ALTER TABLE `asignaciones_revision` DISABLE KEYS */;
INSERT INTO `asignaciones_revision` VALUES (1,5,6,1,'2026-11-11 00:54:07',NULL),(2,12,6,1,'2026-11-11 00:54:07',NULL),(3,22,6,1,'2026-11-11 00:54:07',NULL),(4,27,6,1,'2026-11-11 00:54:07',NULL);
/*!40000 ALTER TABLE `asignaciones_revision` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditoria` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `accion` varchar(50) NOT NULL COMMENT 'crear, editar, cambiar_estado, descargar...',
  `entidad` varchar(50) NOT NULL COMMENT 'convenio, documento, usuario...',
  `entidad_id` bigint(20) unsigned DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `detalle` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalle`)),
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `auditoria_user_id_foreign` (`user_id`),
  KEY `auditoria_entidad_entidad_id_index` (`entidad`,`entidad_id`),
  CONSTRAINT `auditoria_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba','i:1;',1794364262),('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer','i:1794364262;',1794364262);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigos_mfa`
--

DROP TABLE IF EXISTS `codigos_mfa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `codigos_mfa` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `codigo_hash` varchar(255) NOT NULL COMMENT 'Nunca el código en texto plano',
  `canal` enum('email','sms','push') NOT NULL DEFAULT 'email',
  `expira_en` datetime NOT NULL,
  `usado_en` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `codigos_mfa_user_id_foreign` (`user_id`),
  CONSTRAINT `codigos_mfa_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigos_mfa`
--

LOCK TABLES `codigos_mfa` WRITE;
/*!40000 ALTER TABLE `codigos_mfa` DISABLE KEYS */;
/*!40000 ALTER TABLE `codigos_mfa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comentarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('observacion','comentario') NOT NULL,
  `contenido` text NOT NULL,
  `es_ofensivo` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Si es true se muestra "comentario ofensivo"',
  `estado` enum('pendiente','resuelta') DEFAULT NULL COMMENT 'Solo para observaciones',
  `respuesta` text DEFAULT NULL COMMENT 'Respuesta/corrección del equipo gestor',
  `resuelto_por` bigint(20) unsigned DEFAULT NULL,
  `resuelto_en` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comentarios_user_id_foreign` (`user_id`),
  KEY `comentarios_resuelto_por_foreign` (`resuelto_por`),
  KEY `comentarios_convenio_id_tipo_index` (`convenio_id`,`tipo`),
  CONSTRAINT `comentarios_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_resuelto_por_foreign` FOREIGN KEY (`resuelto_por`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `comentarios_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
INSERT INTO `comentarios` VALUES (1,5,6,'observacion','Falta adjuntar el plan de cursos del segundo nivel.',0,'pendiente',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(2,2,4,'comentario','¿Alguien tiene el informe de avance del segundo trimestre?',0,NULL,NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(3,2,6,'comentario','[contenido removido]',1,NULL,NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07');
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `convenio_parte`
--

DROP TABLE IF EXISTS `convenio_parte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `convenio_parte` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_id` bigint(20) unsigned NOT NULL,
  `parte_id` bigint(20) unsigned NOT NULL,
  `representante_nombre` varchar(150) NOT NULL,
  `representante_cargo` varchar(150) DEFAULT NULL COMMENT 'Ej: Rector/a, Decano/a',
  `es_firmante` tinyint(1) NOT NULL DEFAULT 1,
  `firmo_en` date DEFAULT NULL COMMENT 'Fecha en que firmó el representante',
  PRIMARY KEY (`id`),
  UNIQUE KEY `convenio_parte_convenio_id_parte_id_unique` (`convenio_id`,`parte_id`),
  KEY `convenio_parte_parte_id_foreign` (`parte_id`),
  CONSTRAINT `convenio_parte_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `convenio_parte_parte_id_foreign` FOREIGN KEY (`parte_id`) REFERENCES `partes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convenio_parte`
--

LOCK TABLES `convenio_parte` WRITE;
/*!40000 ALTER TABLE `convenio_parte` DISABLE KEYS */;
INSERT INTO `convenio_parte` VALUES (1,1,1,'Rita Rectora','Rector/a',1,NULL),(2,1,2,'Representante de Municipalidad de Villa Caldén','Intendente/a',1,NULL),(3,2,1,'Rita Rectora','Rector/a',1,NULL),(4,2,2,'Representante de Municipalidad de Villa Caldén','Secretario/a de Obras Públicas',1,NULL),(5,3,1,'Rita Rectora','Rector/a',1,NULL),(6,3,2,'Representante de Municipalidad de Villa Caldén','Secretario/a de Gobierno',1,NULL),(7,4,1,'Rita Rectora','Rector/a',1,NULL),(8,4,2,'Representante de Municipalidad de Villa Caldén','Secretario/a de Obras Públicas',1,NULL),(9,5,1,'Rita Rectora','Rector/a',1,NULL),(10,5,2,'Representante de Municipalidad de Villa Caldén','Secretario/a de Gobierno',1,NULL),(11,6,1,'Rita Rectora','Rector/a',1,NULL),(12,6,5,'Representante de Software del Oeste S.R.L.','Socio gerente',1,NULL),(13,7,1,'Rita Rectora','Rector/a',1,NULL),(14,7,5,'Representante de Software del Oeste S.R.L.','Socio gerente',1,NULL),(15,8,1,'Rita Rectora','Rector/a',1,NULL),(16,8,5,'Representante de Software del Oeste S.R.L.','Socio gerente',1,NULL),(17,9,1,'Rita Rectora','Rector/a',1,NULL),(18,9,5,'Representante de Software del Oeste S.R.L.','Socio gerente',1,NULL),(19,10,1,'Rita Rectora','Rector/a',1,NULL),(20,10,8,'Representante de Universidad Nacional del Sur Ficticio','Representante legal',1,NULL),(21,11,1,'Rita Rectora','Rector/a',1,NULL),(22,11,9,'Representante de Fundación Horizonte Pampeano','Representante legal',1,NULL),(23,12,1,'Rita Rectora','Rector/a',1,NULL),(24,12,9,'Representante de Fundación Horizonte Pampeano','Representante legal',1,NULL),(25,13,1,'Rita Rectora','Rector/a',1,NULL),(26,13,8,'Representante de Universidad Nacional del Sur Ficticio','Representante legal',1,NULL),(27,14,1,'Rita Rectora','Rector/a',1,NULL),(28,14,4,'Representante de AgroPampa Servicios S.A.','Representante legal',1,NULL),(29,15,1,'Rita Rectora','Rector/a',1,NULL),(30,15,4,'Representante de AgroPampa Servicios S.A.','Representante legal',1,NULL),(31,16,1,'Rita Rectora','Rector/a',1,NULL),(32,16,4,'Representante de AgroPampa Servicios S.A.','Representante legal',1,NULL),(33,17,1,'Rita Rectora','Rector/a',1,NULL),(34,17,7,'Representante de Laboratorio Veterinario Médanos','Representante legal',1,NULL),(35,18,1,'Rita Rectora','Rector/a',1,NULL),(36,18,7,'Representante de Laboratorio Veterinario Médanos','Representante legal',1,NULL),(37,19,1,'Rita Rectora','Rector/a',1,NULL),(38,19,7,'Representante de Laboratorio Veterinario Médanos','Representante legal',1,NULL),(39,20,1,'Rita Rectora','Rector/a',1,NULL),(40,20,3,'Representante de Ministerio de Producción Pampeano (ficticio)','Representante legal',1,NULL),(41,21,1,'Rita Rectora','Rector/a',1,NULL),(42,21,3,'Representante de Ministerio de Producción Pampeano (ficticio)','Representante legal',1,NULL),(43,22,1,'Rita Rectora','Rector/a',1,NULL),(44,22,2,'Representante de Municipalidad de Villa Caldén','Representante legal',1,NULL),(45,23,1,'Rita Rectora','Rector/a',1,NULL),(46,23,9,'Representante de Fundación Horizonte Pampeano','Representante legal',1,NULL),(47,24,1,'Rita Rectora','Rector/a',1,NULL),(48,24,10,'Representante de Hospital Regional Caldenal','Representante legal',1,NULL),(49,25,1,'Rita Rectora','Rector/a',1,NULL),(50,25,10,'Representante de Hospital Regional Caldenal','Representante legal',1,NULL),(51,26,1,'Rita Rectora','Rector/a',1,NULL),(52,26,6,'Representante de Cooperativa Eléctrica Llanura','Representante legal',1,NULL),(53,27,1,'Rita Rectora','Rector/a',1,NULL),(54,27,6,'Representante de Cooperativa Eléctrica Llanura','Representante legal',1,NULL),(55,28,1,'Rita Rectora','Rector/a',1,NULL),(56,28,6,'Representante de Cooperativa Eléctrica Llanura','Representante legal',1,NULL);
/*!40000 ALTER TABLE `convenio_parte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `convenio_persona`
--

DROP TABLE IF EXISTS `convenio_persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `convenio_persona` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_id` bigint(20) unsigned NOT NULL,
  `persona_id` bigint(20) unsigned NOT NULL,
  `rol` enum('pasante','tutor_docente','tutor_institucional','responsable','coordinador','otro') NOT NULL,
  `fecha_desde` date DEFAULT NULL,
  `fecha_hasta` date DEFAULT NULL,
  `firmo_en` date DEFAULT NULL COMMENT 'Fecha en que firmó (registro, no firma en el sistema)',
  PRIMARY KEY (`id`),
  KEY `convenio_persona_convenio_id_foreign` (`convenio_id`),
  KEY `convenio_persona_persona_id_foreign` (`persona_id`),
  CONSTRAINT `convenio_persona_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `convenio_persona_persona_id_foreign` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convenio_persona`
--

LOCK TABLES `convenio_persona` WRITE;
/*!40000 ALTER TABLE `convenio_persona` DISABLE KEYS */;
INSERT INTO `convenio_persona` VALUES (1,7,3,'pasante','2026-07-11','2027-01-11',NULL),(2,7,1,'tutor_docente','2026-07-11','2027-01-11',NULL),(3,7,2,'tutor_institucional','2026-07-11','2027-01-11',NULL),(4,8,4,'pasante','2026-08-11','2027-02-11',NULL),(5,8,1,'tutor_docente','2026-08-11','2027-02-11',NULL),(6,8,2,'tutor_institucional','2026-08-11','2027-02-11',NULL),(7,9,5,'pasante',NULL,NULL,NULL),(8,9,1,'tutor_docente',NULL,NULL,NULL),(9,9,2,'tutor_institucional',NULL,NULL,NULL);
/*!40000 ALTER TABLE `convenio_persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `convenios`
--

DROP TABLE IF EXISTS `convenios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `convenios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ref_publica` char(36) NOT NULL COMMENT 'UUID para el QR (no expone datos)',
  `codigo` varchar(20) NOT NULL COMMENT 'Ej: MC-2026-0001',
  `titulo` varchar(255) NOT NULL,
  `tipo` enum('marco_colaboracion','especifico_colaboracion','marco_pasantia','especifico_pasantia','adenda') NOT NULL,
  `unidad_id` bigint(20) unsigned NOT NULL COMMENT 'Unidad responsable',
  `objeto` text NOT NULL,
  `alcance` text DEFAULT NULL,
  `obligaciones` text DEFAULT NULL,
  `condiciones_rescision` text DEFAULT NULL,
  `marco_legal` text DEFAULT NULL,
  `resolucion` varchar(50) DEFAULT NULL COMMENT 'Ej: 123/2026',
  `expediente` varchar(50) DEFAULT NULL COMMENT 'Ej: 1754/2026',
  `condiciones_renovacion` text DEFAULT NULL,
  `renovacion_automatica` tinyint(1) NOT NULL DEFAULT 0,
  `confidencial` tinyint(1) NOT NULL DEFAULT 0,
  `notas` text DEFAULT NULL,
  `fecha_firma` date DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL COMMENT 'NULL = sin vencimiento registrado',
  `dias_preaviso` smallint(5) unsigned DEFAULT NULL,
  `estado` enum('borrador','revision','aprobado','firmado','rescindido','archivado') NOT NULL DEFAULT 'borrador',
  `version` int(10) unsigned NOT NULL DEFAULT 1 COMMENT 'Control de concurrencia',
  `creado_por` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `convenios_ref_publica_unique` (`ref_publica`),
  UNIQUE KEY `convenios_codigo_unique` (`codigo`),
  KEY `convenios_unidad_id_foreign` (`unidad_id`),
  KEY `convenios_creado_por_foreign` (`creado_por`),
  KEY `convenios_tipo_index` (`tipo`),
  KEY `convenios_fecha_vencimiento_index` (`fecha_vencimiento`),
  KEY `convenios_estado_index` (`estado`),
  CONSTRAINT `convenios_creado_por_foreign` FOREIGN KEY (`creado_por`) REFERENCES `users` (`id`),
  CONSTRAINT `convenios_unidad_id_foreign` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convenios`
--

LOCK TABLES `convenios` WRITE;
/*!40000 ALTER TABLE `convenios` DISABLE KEYS */;
INSERT INTO `convenios` VALUES (1,'83c78db3-0fb6-43cd-9a56-7e0a9d8d2293','MC-2024-0001','Convenio marco de cooperación con la Municipalidad de Villa Caldén','marco_colaboracion',7,'Establecer un marco general de cooperación en docencia, investigación y extensión.',NULL,NULL,'Cualquiera de las partes podrá rescindirlo con 6 meses de preaviso fehaciente.',NULL,'101/2024','2001/2024',NULL,1,0,NULL,'2024-11-11','2024-11-11','2028-11-11',180,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(2,'768d8c99-4b79-433a-8d96-a793d80c7dc8','EC-2025-0001','Específico: relevamiento del alumbrado público con sensores','especifico_colaboracion',7,'Diseñar e instalar una red de sensores para medir el consumo del alumbrado público.',NULL,'FI: diseño y pruebas. Municipalidad: acceso a la red y materiales.',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2025-11-11','2025-11-11','2026-12-21',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(3,'e5601e09-97e7-4e38-8f71-676de675463e','EC-2025-0002','Específico: capacitación en programación para agentes municipales','especifico_colaboracion',7,'Dictar cursos de programación básica para personal municipal.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2025-01-11','2025-01-11','2026-08-11',30,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(4,'bb526773-107d-48ff-9df0-c7893b21104b','AD-2026-0001','Adenda I al específico de alumbrado: amplía a dos barrios más','adenda',7,'Ampliar el relevamiento a los barrios Norte y Las Acacias.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'aprobado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(5,'d32caef6-52f4-49e6-82c5-e4c023796085','EC-2026-0001','Renovación del específico de capacitación para agentes municipales','especifico_colaboracion',7,'Continuar los cursos de programación con un segundo nivel.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'revision',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(6,'e6e2f399-a52c-42bc-86f2-9c8f180769a5','MP-2025-0001','Convenio marco de pasantías educativas con Software del Oeste','marco_pasantia',7,'Pasantías educativas para estudiantes de Ingeniería en Sistemas (Ley 26.427).',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2025-05-11','2025-05-11','2028-05-11',90,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(7,'a52dd47b-bbe3-41bb-96e1-836a76e45450','EP-2026-0001','Pasantía de Valentina Correa en Software del Oeste','especifico_pasantia',7,'Práctica en desarrollo web dentro del equipo de producto.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2026-07-11','2026-07-11','2027-01-11',15,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(8,'4601378c-215f-4cd1-8ae0-fb8f109b7682','EP-2026-0002','Pasantía de Mateo Funes en Software del Oeste','especifico_pasantia',7,'Práctica en desarrollo web dentro del equipo de producto.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2026-08-11','2026-08-11','2027-02-11',15,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(9,'efc18588-68b9-4484-b681-5f3aab8c1374','EP-2026-0003','Pasantía de Julieta Iriarte en Software del Oeste','especifico_pasantia',7,'Práctica en desarrollo web dentro del equipo de producto.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,15,'borrador',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(10,'9e9d8418-b9d4-45ce-8df7-bdf2b16aa24a','MC-2023-0001','Marco de cooperación académica e intercambio docente','marco_colaboracion',4,'Marco de cooperación académica e intercambio docente.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2023-11-01','2023-11-01','2028-11-11',60,'firmado',1,5,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(11,'c9f82260-8309-4193-b5b2-25a4255d8932','MC-2025-0001','Marco de cooperación en educación ambiental','marco_colaboracion',4,'Marco de cooperación en educación ambiental.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2025-10-31','2025-10-31',NULL,NULL,'firmado',1,5,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(12,'4336a3be-8eea-458f-bcc0-d132cdf32174','EC-2026-0002','Monitoreo de calidad de agua en lagunas','especifico_colaboracion',4,'Monitoreo de calidad de agua en lagunas.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'revision',1,5,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(13,'5d49991e-7846-401f-98c5-2350a1f071e5','EC-2026-0003','Movilidad de estudiantes de Biología','especifico_colaboracion',4,'Movilidad de estudiantes de Biología.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'borrador',1,5,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(14,'991ba0e5-764f-4ca0-ae3a-32972ad77d85','MC-2024-0002','Marco de cooperación en innovación agropecuaria','marco_colaboracion',2,'Marco de cooperación en innovación agropecuaria.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2024-10-28','2024-10-28','2029-11-07',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(15,'20ac0751-0ca9-4be3-a5ed-763710caf827','EC-2025-0003','Ensayos de rendimiento de cultivos de cobertura','especifico_colaboracion',2,'Ensayos de rendimiento de cultivos de cobertura.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2025-10-27','2025-10-27','2026-12-06',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(16,'22bfcb6c-f764-4cc4-9c6e-cff0f8fea8de','MP-2026-0001','Marco de pasantías para Ingeniería Agronómica','marco_pasantia',2,'Marco de pasantías para Ingeniería Agronómica.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'aprobado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(17,'bfd58f15-8389-4e7d-b001-18989f0de20c','MC-2022-0001','Marco de cooperación en diagnóstico veterinario','marco_colaboracion',6,'Marco de cooperación en diagnóstico veterinario.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2022-10-25','2022-10-25','2027-11-04',60,'rescindido',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(18,'124a749a-2663-4501-b6a9-72d320e9f766','EC-2021-0001','Campaña de vacunación antirrábica','especifico_colaboracion',6,'Campaña de vacunación antirrábica.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2021-10-24','2021-10-24','2023-11-03',60,'archivado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(19,'1dc1c62a-5058-4c87-925d-08661a5a4623','MP-2025-0002','Marco de pasantías para Ciencias Veterinarias','marco_pasantia',6,'Marco de pasantías para Ciencias Veterinarias.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2025-10-23','2025-10-23','2028-11-02',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(20,'abce89d2-ed38-4fa4-a4d7-031fc0a47912','MC-2024-0003','Marco de asistencia técnica en economía regional','marco_colaboracion',3,'Marco de asistencia técnica en economía regional.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2024-10-22','2024-10-22','2027-11-01',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(21,'357612d4-9ca1-47a7-bec1-b8202c99487c','EC-2026-0004','Informe de coyuntura económica provincial','especifico_colaboracion',3,'Informe de coyuntura económica provincial.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'aprobado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(22,'3a9f97af-2a24-4b70-8663-dea7cb7ed844','MC-2026-0001','Marco de cooperación cultural y educativa','marco_colaboracion',5,'Marco de cooperación cultural y educativa.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'revision',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(23,'97a6d038-ccde-4b1e-b426-5f024a44dbec','EC-2026-0005','Talleres de alfabetización digital para adultos','especifico_colaboracion',5,'Talleres de alfabetización digital para adultos.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'borrador',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(24,'7157b783-dcd4-4e3e-a5b5-f7dfb936c71d','MP-2025-0003','Marco de prácticas en servicios de salud','marco_pasantia',8,'Marco de prácticas en servicios de salud.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2025-10-18','2025-10-18','2027-10-28',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(25,'79b9e63b-edeb-45b9-8aee-c3f0bf9735d9','EC-2026-0006','Capacitación en registro clínico electrónico','especifico_colaboracion',8,'Capacitación en registro clínico electrónico.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2026-10-17','2026-10-17','2026-12-16',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(26,'64b34035-c88a-4278-8c7d-f6df8011ec9b','MC-2023-0002','Marco de cooperación en eficiencia energética','marco_colaboracion',1,'Marco de cooperación en eficiencia energética.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,'2023-10-16','2023-10-16','2029-10-26',60,'firmado',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(27,'b266b4d8-7797-4d30-886e-4529fce908ba','EC-2026-0007','Auditoría energética de edificios universitarios','especifico_colaboracion',1,'Auditoría energética de edificios universitarios.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'revision',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(28,'84f62742-16bf-4019-9cbe-6a1691e878bd','MC-2026-0002','Marco de cooperación en redes eléctricas inteligentes','marco_colaboracion',7,'Marco de cooperación en redes eléctricas inteligentes.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'borrador',1,4,'2026-11-11 03:54:07','2026-11-11 03:54:07');
/*!40000 ALTER TABLE `convenios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `datos_pasantia`
--

DROP TABLE IF EXISTS `datos_pasantia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `datos_pasantia` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_persona_id` bigint(20) unsigned NOT NULL,
  `carrera` varchar(150) NOT NULL,
  `tutor_docente_id` bigint(20) unsigned DEFAULT NULL,
  `tutor_institucional_id` bigint(20) unsigned DEFAULT NULL,
  `horas_semanales` tinyint(3) unsigned NOT NULL COMMENT 'Máximo 20 (Ley 26.427)',
  `asignacion_estimulo` decimal(12,2) DEFAULT NULL,
  `seguro` varchar(150) DEFAULT NULL COMMENT 'ART / aseguradora',
  `obra_social` varchar(150) DEFAULT NULL,
  `plan_trabajo` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `datos_pasantia_convenio_persona_id_unique` (`convenio_persona_id`),
  KEY `datos_pasantia_tutor_docente_id_foreign` (`tutor_docente_id`),
  KEY `datos_pasantia_tutor_institucional_id_foreign` (`tutor_institucional_id`),
  CONSTRAINT `datos_pasantia_convenio_persona_id_foreign` FOREIGN KEY (`convenio_persona_id`) REFERENCES `convenio_persona` (`id`) ON DELETE CASCADE,
  CONSTRAINT `datos_pasantia_tutor_docente_id_foreign` FOREIGN KEY (`tutor_docente_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `datos_pasantia_tutor_institucional_id_foreign` FOREIGN KEY (`tutor_institucional_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `datos_pasantia`
--

LOCK TABLES `datos_pasantia` WRITE;
/*!40000 ALTER TABLE `datos_pasantia` DISABLE KEYS */;
INSERT INTO `datos_pasantia` VALUES (1,1,'Ingeniería en Sistemas',1,2,20,350000.00,'ART Ficticia S.A.','Obra Social Ficticia','Desarrollo de componentes web y pruebas automatizadas.'),(2,4,'Ingeniería en Sistemas',1,2,20,350000.00,'ART Ficticia S.A.','Obra Social Ficticia','Desarrollo de componentes web y pruebas automatizadas.'),(3,7,'Ingeniería en Sistemas',1,2,20,350000.00,'ART Ficticia S.A.','Obra Social Ficticia','Desarrollo de componentes web y pruebas automatizadas.');
/*!40000 ALTER TABLE `datos_pasantia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispositivos`
--

DROP TABLE IF EXISTS `dispositivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dispositivos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `token_push` varchar(255) NOT NULL,
  `plataforma` enum('android','ios') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dispositivos_token_push_unique` (`token_push`),
  KEY `dispositivos_user_id_foreign` (`user_id`),
  CONSTRAINT `dispositivos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispositivos`
--

LOCK TABLES `dispositivos` WRITE;
/*!40000 ALTER TABLE `dispositivos` DISABLE KEYS */;
/*!40000 ALTER TABLE `dispositivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos`
--

DROP TABLE IF EXISTS `documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documentos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_id` bigint(20) unsigned NOT NULL,
  `categoria` enum('principal','anexo','dictamen','resolucion','otro') NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `ruta` varchar(255) NOT NULL COMMENT 'storage/app/private/...',
  `tamano_bytes` int(10) unsigned NOT NULL COMMENT 'Máximo 20 MB',
  `sha256` char(64) NOT NULL,
  `numero_version` int(10) unsigned NOT NULL DEFAULT 1,
  `marca` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Metadatos estampados por la API' CHECK (json_valid(`marca`)),
  `subido_por` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `documentos_subido_por_foreign` (`subido_por`),
  KEY `documentos_convenio_id_categoria_index` (`convenio_id`,`categoria`),
  CONSTRAINT `documentos_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documentos_subido_por_foreign` FOREIGN KEY (`subido_por`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos`
--

LOCK TABLES `documentos` WRITE;
/*!40000 ALTER TABLE `documentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firmas`
--

DROP TABLE IF EXISTS `firmas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `firmas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `firma_ruta` varchar(255) NOT NULL COMMENT 'Imagen de la firma a mano',
  `firmado_en` datetime NOT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `biometria_ok` tinyint(1) NOT NULL DEFAULT 0,
  `sha256_documento` char(64) DEFAULT NULL COMMENT 'Hash del PDF principal firmado',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `firmas_convenio_id_user_id_unique` (`convenio_id`,`user_id`),
  KEY `firmas_user_id_foreign` (`user_id`),
  CONSTRAINT `firmas_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `firmas_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firmas`
--

LOCK TABLES `firmas` WRITE;
/*!40000 ALTER TABLE `firmas` DISABLE KEYS */;
/*!40000 ALTER TABLE `firmas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `identidades_usuario`
--

DROP TABLE IF EXISTS `identidades_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identidades_usuario` (
  `user_id` bigint(20) unsigned NOT NULL,
  `firma_ruta` varchar(255) DEFAULT NULL COMMENT 'Imagen de la firma registrada',
  `rostro_registrado_en` datetime DEFAULT NULL,
  `huella_registrada_en` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `identidades_usuario_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `identidades_usuario`
--

LOCK TABLES `identidades_usuario` WRITE;
/*!40000 ALTER TABLE `identidades_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `identidades_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_10_20_150759_create_personal_access_tokens_table',1),(5,'2026_10_21_000001_create_unidades_table',1),(6,'2026_10_21_000002_add_campos_proyecto_to_users_table',1),(7,'2026_10_21_000003_create_codigos_mfa_table',1),(8,'2026_10_21_000004_create_identidades_usuario_table',1),(9,'2026_10_21_000005_create_dispositivos_table',1),(10,'2026_10_21_000006_create_convenios_table',1),(11,'2026_10_21_000007_create_vinculos_convenio_table',1),(12,'2026_10_21_000008_create_partes_table',1),(13,'2026_10_21_000009_create_convenio_parte_table',1),(14,'2026_10_21_000010_create_personas_table',1),(15,'2026_10_21_000011_create_convenio_persona_table',1),(16,'2026_10_21_000012_create_datos_pasantia_table',1),(17,'2026_10_21_000013_create_documentos_table',1),(18,'2026_10_21_000014_create_transiciones_estado_table',1),(19,'2026_10_21_000015_create_asignaciones_revision_table',1),(20,'2026_10_21_000016_create_comentarios_table',1),(21,'2026_10_21_000017_create_firmas_table',1),(22,'2026_10_21_000018_create_notificaciones_table',1),(23,'2026_10_21_000019_create_auditoria_table',1),(24,'2026_10_22_000001_cambiar_puede_firmar_por_rol_autoridad',1),(25,'2026_10_27_000001_agregar_fecha_firma_a_firmantes_externos',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `convenio_id` bigint(20) unsigned DEFAULT NULL,
  `tipo` enum('revision_asignada','cambio_estado','vencimiento','preaviso','nuevo_convenio','nuevo_comentario','convenio_rescindido') NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `cuerpo` text DEFAULT NULL,
  `enlace` varchar(255) DEFAULT NULL COMMENT 'Pantalla autorizada a la que lleva',
  `leida_en` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificaciones_convenio_id_foreign` (`convenio_id`),
  KEY `notificaciones_user_id_leida_en_index` (`user_id`,`leida_en`),
  CONSTRAINT `notificaciones_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partes`
--

DROP TABLE IF EXISTS `partes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `tipo` enum('universidad','unidad_academica','empresa','organismo_publico','ong','otro') NOT NULL,
  `cuit` varchar(13) DEFAULT NULL COMMENT 'Ficticio',
  `domicilio` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partes_cuit_unique` (`cuit`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partes`
--

LOCK TABLES `partes` WRITE;
/*!40000 ALTER TABLE `partes` DISABLE KEYS */;
INSERT INTO `partes` VALUES (1,'Universidad Nacional de La Pampa','universidad',NULL,NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(2,'Municipalidad de Villa Caldén','organismo_publico','30-99000001-1',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(3,'Ministerio de Producción Pampeano (ficticio)','organismo_publico','30-99000002-2',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(4,'AgroPampa Servicios S.A.','empresa','30-99000003-3',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(5,'Software del Oeste S.R.L.','empresa','30-99000004-4',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(6,'Cooperativa Eléctrica Llanura','empresa','30-99000005-5',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(7,'Laboratorio Veterinario Médanos','empresa','30-99000006-6',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(8,'Universidad Nacional del Sur Ficticio','universidad','30-99000007-7',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(9,'Fundación Horizonte Pampeano','ong','30-99000008-8',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(10,'Hospital Regional Caldenal','organismo_publico','30-99000009-9',NULL,NULL,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07');
/*!40000 ALTER TABLE `partes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',4,'swagger','7afd1071bf8feac3c4114d6ef9251ed1fe59e71057c389e569ba1d922961da5c','[\"*\"]',NULL,NULL,'2026-11-11 05:30:54','2026-11-11 05:30:54');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personas`
--

DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `documento` varchar(20) DEFAULT NULL COMMENT 'Ficticio; minimizar datos personales',
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personas_documento_unique` (`documento`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas`
--

LOCK TABLES `personas` WRITE;
/*!40000 ALTER TABLE `personas` DISABLE KEYS */;
INSERT INTO `personas` VALUES (1,'Lucía','Benítez','90000001','lucia.benitez@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(2,'Tomás','Aguirre','90000002','tomas.aguirre@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(3,'Valentina','Correa','90000003','valentina.correa@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(4,'Mateo','Funes','90000004','mateo.funes@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(5,'Julieta','Iriarte','90000005','julieta.iriarte@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(6,'Santiago','Lucero','90000006','santiago.lucero@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(7,'Camila','Medina','90000007','camila.medina@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(8,'Joaquín','Ortiz','90000008','joaquin.ortiz@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(9,'Florencia','Paz','90000009','florencia.paz@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(10,'Nicolás','Quiroga','90000010','nicolas.quiroga@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(11,'Martina','Rivas','90000011','martina.rivas@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(12,'Bruno','Sosa','90000012','bruno.sosa@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(13,'Agustina','Torres','90000013','agustina.torres@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(14,'Facundo','Vera','90000014','facundo.vera@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(15,'Paula','Zárate','90000015','paula.zarate@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(16,'Ignacio','Arce','90000016','ignacio.arce@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(17,'Sofía','Bustos','90000017','sofia.bustos@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(18,'Lautaro','Cabral','90000018','lautaro.cabral@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(19,'Micaela','Domínguez','90000019','micaela.dominguez@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(20,'Diego','Escudero','90000020','diego.escudero@ejemplo.test',NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07');
/*!40000 ALTER TABLE `personas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transiciones_estado`
--

DROP TABLE IF EXISTS `transiciones_estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transiciones_estado` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_id` bigint(20) unsigned NOT NULL,
  `estado_desde` enum('borrador','revision','aprobado','firmado','rescindido','archivado') DEFAULT NULL,
  `estado_hasta` enum('borrador','revision','aprobado','firmado','rescindido','archivado') NOT NULL,
  `fundamento` text NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transiciones_estado_convenio_id_foreign` (`convenio_id`),
  KEY `transiciones_estado_user_id_foreign` (`user_id`),
  CONSTRAINT `transiciones_estado_convenio_id_foreign` FOREIGN KEY (`convenio_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transiciones_estado_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transiciones_estado`
--

LOCK TABLES `transiciones_estado` WRITE;
/*!40000 ALTER TABLE `transiciones_estado` DISABLE KEYS */;
INSERT INTO `transiciones_estado` VALUES (1,1,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(2,1,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(3,1,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(4,1,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(5,2,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(6,2,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(7,2,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(8,2,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(9,3,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(10,3,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(11,3,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(12,3,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(13,4,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(14,4,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(15,4,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(16,5,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(17,5,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(18,6,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(19,6,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(20,6,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(21,6,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(22,7,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(23,7,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(24,7,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(25,7,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(26,8,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(27,8,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(28,8,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(29,8,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(30,9,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(31,10,NULL,'borrador','Alta del instrumento',5,'2026-11-11 03:54:07'),(32,10,'borrador','revision','Enviado a revisión',5,'2026-11-11 03:54:07'),(33,10,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(34,10,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(35,11,NULL,'borrador','Alta del instrumento',5,'2026-11-11 03:54:07'),(36,11,'borrador','revision','Enviado a revisión',5,'2026-11-11 03:54:07'),(37,11,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(38,11,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(39,12,NULL,'borrador','Alta del instrumento',5,'2026-11-11 03:54:07'),(40,12,'borrador','revision','Enviado a revisión',5,'2026-11-11 03:54:07'),(41,13,NULL,'borrador','Alta del instrumento',5,'2026-11-11 03:54:07'),(42,14,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(43,14,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(44,14,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(45,14,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(46,15,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(47,15,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(48,15,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(49,15,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(50,16,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(51,16,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(52,16,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(53,17,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(54,17,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(55,17,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(56,17,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(57,17,'firmado','rescindido','Rescisión comunicada por la contraparte',1,'2026-11-11 03:54:07'),(58,18,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(59,18,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(60,18,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(61,18,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(62,18,'firmado','archivado','Archivado por cumplimiento del objeto',1,'2026-11-11 03:54:07'),(63,19,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(64,19,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(65,19,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(66,19,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(67,20,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(68,20,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(69,20,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(70,20,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(71,21,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(72,21,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(73,21,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(74,22,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(75,22,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(76,23,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(77,24,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(78,24,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(79,24,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(80,24,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(81,25,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(82,25,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(83,25,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(84,25,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(85,26,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(86,26,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(87,26,'revision','aprobado','Revisión administrativa sin observaciones',6,'2026-11-11 03:54:07'),(88,26,'aprobado','firmado','Firma registrada por las partes',2,'2026-11-11 03:54:07'),(89,27,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07'),(90,27,'borrador','revision','Enviado a revisión',4,'2026-11-11 03:54:07'),(91,28,NULL,'borrador','Alta del instrumento',4,'2026-11-11 03:54:07');
/*!40000 ALTER TABLE `transiciones_estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidades`
--

DROP TABLE IF EXISTS `unidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unidades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `sigla` varchar(15) NOT NULL,
  `latitud` decimal(10,7) DEFAULT NULL COMMENT 'Sede, para detectar ingreso (app)',
  `longitud` decimal(10,7) DEFAULT NULL,
  `radio_metros` smallint(5) unsigned DEFAULT 200,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unidades_sigla_unique` (`sigla`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidades`
--

LOCK TABLES `unidades` WRITE;
/*!40000 ALTER TABLE `unidades` DISABLE KEYS */;
INSERT INTO `unidades` VALUES (1,'Rectorado','RECT',-36.6167000,-64.2869000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(2,'Facultad de Agronomía','FA',-36.5480000,-64.2990000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(3,'Facultad de Ciencias Económicas y Jurídicas','FCEyJ',-36.6194000,-64.2903000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(4,'Facultad de Ciencias Exactas y Naturales','FCEyN',-36.5495000,-64.2975000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(5,'Facultad de Ciencias Humanas','FCH',-36.6208000,-64.2958000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(6,'Facultad de Ciencias Veterinarias','FCV',-35.6588000,-63.7569000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(7,'Facultad de Ingeniería','FI',-35.6633000,-63.7564000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(8,'Facultad de Ciencias de la Salud','FCS',-36.6250000,-64.2950000,200,'2026-11-11 03:54:06','2026-11-11 03:54:06');
/*!40000 ALTER TABLE `unidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','gestor','revisor','consulta','autoridad') NOT NULL DEFAULT 'consulta',
  `unidad_id` bigint(20) unsigned DEFAULT NULL COMMENT 'NULL = alcance global',
  `tamano_letra` enum('chica','mediana','grande') NOT NULL DEFAULT 'mediana',
  `tema` enum('claro','oscuro','sistema') NOT NULL DEFAULT 'sistema',
  `foto_ruta` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_unidad_id_foreign` (`unidad_id`),
  CONSTRAINT `users_unidad_id_foreign` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ana Admin','admin@convenios.test',NULL,'$2y$12$pXTEuvXZ4qAKgd8f.t5CU.belCtnFGUNfrxSvvgyniduhB9Vi7Tr6','admin',NULL,'mediana','sistema',NULL,1,NULL,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(2,'Rita Rectora','autoridad@convenios.test',NULL,'$2y$12$3bzFjkai/4WZU7C8YIkeL.dbg4BGQZNJX/s8NUIUXI5O9aujYLNie','autoridad',NULL,'mediana','sistema',NULL,1,NULL,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(3,'Diego Decano','decano.fi@convenios.test',NULL,'$2y$12$nvWHpyewgEe.bAAjuuQowecWYIp.f/W9/trDyo2pQb8SJMGDzzZzu','autoridad',7,'mediana','sistema',NULL,1,NULL,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(4,'Gabriel Gestor','gestor.fi@convenios.test',NULL,'$2y$12$dNQCmJVemHrmSwXdcPWiFutk6Z9wjyYiSygFqTipdiwHTmBAya9c6','gestor',7,'mediana','sistema',NULL,1,NULL,'2026-11-11 03:54:06','2026-11-11 03:54:06'),(5,'Gisela Gestora','gestor.fceyn@convenios.test',NULL,'$2y$12$bucoRGIdb/TG0QC.Punnyu5kfdHW1ubb9Lp26F.oCCoZNvUF0APXi','gestor',4,'mediana','sistema',NULL,1,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(6,'Raúl Revisor','revisor@convenios.test',NULL,'$2y$12$Rf/bx74.2rFbZsJODcilQ.dKnk/vdwqc5rpAl9l93gkhvBGGS1Yh2','revisor',NULL,'mediana','sistema',NULL,1,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07'),(7,'Carla Consulta','consulta.fi@convenios.test',NULL,'$2y$12$O2OFV5ETHnYdjq2ON3Yhve1vitQ21LY3/O4xju548JVxyIk2S2.dm','consulta',7,'mediana','sistema',NULL,1,NULL,'2026-11-11 03:54:07','2026-11-11 03:54:07');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vinculos_convenio`
--

DROP TABLE IF EXISTS `vinculos_convenio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinculos_convenio` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `convenio_origen_id` bigint(20) unsigned NOT NULL,
  `convenio_destino_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('especifico_de','adenda_de','renueva_a','sustituye_a') NOT NULL,
  `creado_por` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vinculo` (`convenio_origen_id`,`convenio_destino_id`,`tipo`),
  KEY `vinculos_convenio_convenio_destino_id_foreign` (`convenio_destino_id`),
  KEY `vinculos_convenio_creado_por_foreign` (`creado_por`),
  CONSTRAINT `vinculos_convenio_convenio_destino_id_foreign` FOREIGN KEY (`convenio_destino_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vinculos_convenio_convenio_origen_id_foreign` FOREIGN KEY (`convenio_origen_id`) REFERENCES `convenios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vinculos_convenio_creado_por_foreign` FOREIGN KEY (`creado_por`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vinculos_convenio`
--

LOCK TABLES `vinculos_convenio` WRITE;
/*!40000 ALTER TABLE `vinculos_convenio` DISABLE KEYS */;
INSERT INTO `vinculos_convenio` VALUES (1,2,1,'especifico_de',4,'2026-11-11 03:54:07'),(2,3,1,'especifico_de',4,'2026-11-11 03:54:07'),(3,4,2,'adenda_de',4,'2026-11-11 03:54:07'),(4,5,3,'renueva_a',4,'2026-11-11 03:54:07'),(5,5,1,'especifico_de',4,'2026-11-11 03:54:07'),(6,7,6,'especifico_de',4,'2026-11-11 03:54:07'),(7,8,6,'especifico_de',4,'2026-11-11 03:54:07'),(8,9,6,'especifico_de',4,'2026-11-11 03:54:07');
/*!40000 ALTER TABLE `vinculos_convenio` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-10 23:35:41
