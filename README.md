# Sistema de Gestión de Convenios — UNLPam

Trabajo Integrador Final de **Programación Orientada a la Web** y **Laboratorio de Aplicaciones Móviles** (Facultad de Ingeniería, UNLPam, 2026).

Sistema para administrar convenios marco y específicos de colaboración y de pasantías, adendas, renovaciones, partes, documentos, revisión, firma registrada y vencimientos. Está compuesto por una API REST, una plataforma web y una aplicación móvil.

> Todos los datos del sistema son **ficticios**. No se usan convenios, documentos ni datos personales reales.

## Integrantes

| Integrante | Responsabilidad principal |
| --- | --- |
| Vick | Backend (API REST) y base de datos |
| Marti | Plataforma web |
| Ale | Aplicación móvil |

## Estructura del repositorio

```
integrador-POW-LOAM/
├── backend/    API REST en Laravel + MySQL
├── web/        Plataforma web en Next.js
├── mobile/     Aplicación móvil en React Native (Expo)
├── database/   Diagrama entidad-relación y dump de ejemplo
└── docs/       Informes, contrato de la API, manual de uso
```

## Requisitos

| Herramienta | Versión |
| --- | --- |
| PHP | 8.2 o superior |
| Composer | 2.x |
| MySQL / MariaDB | MySQL 8 o MariaDB 10.4+ (XAMPP) |
| Node.js | 22 LTS o superior |
| Git | cualquier versión reciente |
| Expo Go / emulador Android | para probar la app |

En Windows, el `php.ini` de XAMPP necesita activadas las extensiones `zip`, `fileinfo` y `pdo_mysql`.

## Instalación desde cero

### 1. Clonar el repositorio

```bash
git clone https://github.com/victoriariosmass-blip/integrador-POW-LOAM.git
cd integrador-POW-LOAM
```

### 2. Backend (API)

Crear en phpMyAdmin una base de datos vacía llamada `convenios` con cotejamiento `utf8mb4_unicode_ci`.

**Windows (PowerShell)**

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

**Mac / Linux (zsh)**

```zsh
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

La API queda disponible en `http://localhost:8000/api`.

Para reiniciar la base con los datos de prueba: `php artisan migrate:fresh --seed`.

### 3. Web

```bash
cd web
npm install
npm run dev
```

Crear el archivo `web/.env.local` con:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

La web queda disponible en `http://localhost:3000`.

### 4. App móvil

```bash
cd mobile
npm install
npx expo start
```

Escanear el código QR con Expo Go (el celular y la computadora tienen que estar en la misma red Wi-Fi) o presionar `a` para abrirla en el emulador de Android.

Para que la app se conecte a la API desde un celular, el backend tiene que levantarse con `php artisan serve --host=0.0.0.0` y la app tiene que apuntar a la IP local de la computadora (por ejemplo `http://192.168.0.15:8000/api`). En el emulador de Android se usa `http://10.0.2.2:8000/api`.

## Usuarios de prueba

Se crean automáticamente con `php artisan migrate --seed`. La contraseña de todos es `password` (solo para desarrollo).

| Email | Rol | Alcance | Para probar |
| --- | --- | --- | --- |
| admin@convenios.test | Administración | Global | Gestión de usuarios y unidades, rescindir y archivar |
| autoridad@convenios.test | Consulta + puede firmar | Global | Firma de convenios aprobados (app) |
| gestor.fi@convenios.test | Gestión | Facultad de Ingeniería | Alta y edición de convenios, respuesta a observaciones |
| gestor.fceyn@convenios.test | Gestión | Facultad de Ciencias Exactas y Naturales | Verificar que solo ve los convenios de su unidad |
| revisor@convenios.test | Revisión | Global | Panel de revisión, aprobar o devolver con observaciones |
| consulta.fi@convenios.test | Consulta | Facultad de Ingeniería | Acceso de solo lectura limitado a su unidad |

## Datos de prueba incluidos

- 8 unidades de la UNLPam (Rectorado y facultades), con coordenadas aproximadas de sus sedes.
- 10 partes ficticias (organismos, empresas, universidades, ONG).
- 20 personas ficticias.
- 28 convenios en todos los estados, entre ellos dos árboles completos:
  - Marco de colaboración → 2 específicos → adenda + renovación.
  - Marco de pasantías → 3 específicos de pasantía con pasantes y tutores.
- Convenios vencidos, próximos a vencer y vigentes (las fechas se calculan a partir del día en que se corre el seeder).

## Documentación

- Informe de indagación: `docs/`
- Informe técnico: `docs/`
- Contrato de la API (OpenAPI): `docs/openapi.yaml`
- Diagrama entidad-relación: `database/`
- Diseño (Figma): _agregar link_