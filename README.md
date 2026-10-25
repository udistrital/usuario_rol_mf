# Usuario Rol Microcliente

Microcliente para la gestión de los periodos de roles de un usuario, este sistema complementa su funcionalidad con WSO2. Este microcliente es de uso transversal para los sistemas que requieran gestionar los roles de los usuarios.

## Especificaciones Técnicas

### Requisitos

- Node.js **24.22.1**, versión utilizada en Drone mediante `node:24.22.1-alpine`.
- pnpm **11.25.0**, versión utilizada para validar la instalación y la compilación.

```bash
npm install -g pnpm@11.25.0
```

Las dependencias se gestionan con [pnpm-workspace.yaml](pnpm-workspace.yaml) y [pnpm-lock.yaml](pnpm-lock.yaml). Utilice `pnpm install --frozen-lockfile` para reproducir las versiones verificadas.

### Tecnologías Implementadas y Versiones

Versiones resueltas en el lockfile:

| Tecnología | Versión |
| -- | -- |
| Angular | 22.2.1 |
| Angular CLI y herramientas de compilación | 22.1.8 |
| Angular Material y CDK | 22.1.7 |
| TypeScript | 6.0.3 |
| RxJS | 7.8.2 |
| Single-spa | 6.0.3 |
| single-spa-angular | 9.2.0 |
| SweetAlert2 | 11.26.25 |
| @sweetalert2/ngx-sweetalert2 | 15.0.0 |
| tslib | 2.8.1 |
| Zone.js | 0.15.1 |

La compilación y el servidor local utilizan `@angular-builders/custom-webpack`. Vite forma parte de las dependencias transitivas de las herramientas de Angular.

### Variables de Entorno

```javascript
export const environment = {
  production: false,
  apiUrl: "http://localhost:4202/",
  AUTENTICACION_MID: [URL de API MID Autenticación],
  TOKEN: {
    AUTORIZATION_URL: [URL de Autorización - login],
    CLIENTE_ID: [Token de acceso],
    RESPONSE_TYPE: [Tipo de Respuesta del token],
    SCOPE: [Alcance de la solicitud],
    REDIRECT_URL: [URL de redirección],
    SIGN_OUT_URL: [URL de Cerrar Sesión - logout],
    SIGN_OUT_REDIRECT_URL: [URL de redirección despues de cerrar sesion],
    AUTENTICACION_MID:  [URL de API MID Autenticación],
  },
};
```

## Ejecución del Proyecto

Este proyecto es parte de una infraestructura de microfrontend implementada con la librería Single-SPA. Para ejecutarlo correctamente, es necesario levantar dos aplicaciones independientes: el **Root** y el **Core**.

### Root

El Root contiene la lógica de Sísifo

### Pasos para la Ejecución del Root

1. Clonar el repositorio del Root:

   ```bash
   git clone https://github.com/udistrital/auditoria_plan_mejoramiento_root_mf
   ```

2. Acceder al directorio del repositorio clonado:

   ```bash
   cd auditoria_plan_mejoramiento_root_mf
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Iniciar el Root:
   ```bash
   npm start
   ```

### Core

El Core contiene componentes generales que construyen el layout y administran aspectos como la autenticación.

### Pasos para la Ejecución del Core

1. Clonar el repositorio del Core:

   ```bash
   git clone https://github.com/udistrital/core_mf_cliente
   ```

2. Acceder al directorio del repositorio clonado:

   ```bash
   cd core_mf_cliente
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Iniciar el Core:

   ```bash
   npm start
   ```

### usuario_rol_mf

Microcliente de gestión de usuarios

### Pasos para la Ejecución de usuario_rol_mf

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/udistrital/usuario_rol_mf
   ```

2. Acceder al directorio del repositorio clonado:

   ```bash
   cd usuario_rol_mf
   ```

3. Instalar las dependencias:

   ```bash
   pnpm install --frozen-lockfile
   ```

4. Iniciar usuario_rol_mf (puerto 4202):

   ```bash
   pnpm start
   ```

Con estos pasos, se tendrán las partes mínimas necesarias para ejecutar el proyecto en un entorno local.

## Compilación

| Comando | Configuración | Uso en Drone |
| -- | -- | -- |
| `pnpm run build` | local (predeterminada) | `feature/*` y `develop` |
| `pnpm run build:test` | development | `release/*` |
| `pnpm run build:prod` | production | `master` |

Los archivos generados se guardan en `dist/`. Drone publica los artefactos de `release/*` y `master` en los destinos S3 configurados en [.drone.yml](.drone.yml).

## Docker

No se documenta una ejecución independiente mediante Dockerfile o Docker Compose. La compilación en Drone utiliza `node:24.22.1-alpine` en sus tres pasos de Node.

## Pruebas

```bash
pnpm test
```

Las pruebas usan Jest y la configuración de [jest.config.ts](jest.config.ts). En la validación del 25 de octubre de 2026, su ejecución quedó bloqueada porque `jest-environment-jsdom` no está declarado en las dependencias. La compilación local sí se verificó con Node 24.22.1 y una instalación con el lockfile congelado; esto no equivale a una ejecución satisfactoria de las pruebas.

## Mantenimiento de dependencias y seguridad

Los overrides de [pnpm-workspace.yaml](pnpm-workspace.yaml) establecen versiones mínimas corregidas para las dependencias transitivas. El lockfile conserva las versiones exactas instaladas.

| Dependencia | Mínimo establecido | Versión resuelta |
| -- | -- | -- |
| Vite | 8.3.3 | 8.3.5 |
| launch-editor | 2.14.2 | 2.14.2 |
| Hono | 4.13.11 | 4.13.13 |
| Zod | 4.6.6 | 4.6.7 |
| Undici | 8.12.2 | 8.12.3 |
| fast-uri | 4.2.3 | 4.2.3 |
| serialize-javascript | 7.1.3 | 7.1.4 |

Para revisar los avisos vigentes:

```bash
pnpm audit
```

La auditoría del **25 de octubre de 2026**, posterior a estas actualizaciones, no reportó avisos para las siete dependencias de la tabla. Permanecieron **3 avisos**: dos de severidad alta asociados a `body-parser` y uno moderado asociado a `ip-address`. Este resultado corresponde a esa revisión y debe comprobarse nuevamente al actualizar dependencias.

Al modificar los overrides, regenere y versione también el lockfile:

```bash
pnpm install --lockfile-only
pnpm install --frozen-lockfile
pnpm audit
pnpm run build
```

## Estado CI

| Develop | Release | Master |
| -- | -- | -- |
| [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/develop)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/release/0.0.1)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/master)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) |

## Licencia

[This file is part of usuario_rol_mf](LICENSE)

usuario_rol_mf is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

usuario_rol_mf is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with usuario_rol_mf. If not, see https://www.gnu.org/licenses/.
