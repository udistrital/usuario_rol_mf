# usuario_rol_mf

Microcliente para la gestión de los periodos de roles de un usuario, este sistema complementa su funcionalidad con WSO2. Este microcliente es de uso transversal para los sistemas que requieran gestionar los roles de los usuarios.

## Especificaciones Técnicas

### Requisitos

- [Node.js](https://nodejs.org/) **24.22.1**, versión utilizada en Drone mediante `node:24.22.1-alpine`.
- [pnpm](https://pnpm.io/) **11.25.0**, versión utilizada para validar la instalación y la compilación.

```bash
npm install -g pnpm@11.25.0
```

Las dependencias se gestionan con [pnpm-workspace.yaml](pnpm-workspace.yaml) y [pnpm-lock.yaml](pnpm-lock.yaml). Utilice `pnpm install --frozen-lockfile` para reproducir las versiones verificadas.

### Tecnologías Implementadas y Versiones

Versiones resueltas en el lockfile:

| Tecnología | Versión |
| -- | -- |
| [Angular](https://angular.dev/) | 22.2.1 |
| [Angular CLI y herramientas de compilación](https://angular.dev/tools/cli) | 22.1.8 |
| [Angular Material y CDK](https://material.angular.dev/) | 22.1.7 |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 |
| [RxJS](https://rxjs.dev/) | 7.8.2 |
| [Single-spa](https://single-spa.js.org/) | 6.0.3 |
| [single-spa-angular](https://single-spa.js.org/docs/ecosystem-angular/) | 9.2.0 |
| [SweetAlert2](https://sweetalert2.github.io/) | 11.26.25 |
| [@sweetalert2/ngx-sweetalert2](https://github.com/sweetalert2/ngx-sweetalert2) | 15.0.0 |
| [tslib](https://github.com/microsoft/tslib) | 2.8.1 |
| [Zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) | 0.15.1 |

La compilación y el servidor local utilizan `@angular-builders/custom-webpack`. Vite forma parte de las dependencias transitivas de las herramientas de Angular.

### Variables de Entorno

La configuración se define en los archivos TypeScript de [src/environments](src/environments): `environment.ts` para ejecución local, `environment.development.ts` para pruebas y `environment.production.ts` para producción. Los reemplazos de compilación están definidos en [angular.json](angular.json).

| Variable | Descripción |
| -- | -- |
| `production` | Indica si la configuración corresponde a producción. |
| `apiUrl` | URL local del microcliente; definida en `environment.ts` como `http://localhost:4202/`. |
| `SISTEMA_INFORMACION_ID` | Identificador del sistema de información para consultar usuarios y roles. |
| `ROLES_CONSULTA` | Roles autorizados para consultar usuarios. |
| `ROLES_CONSULTA_EDICION` | Roles autorizados para editar usuarios. |
| `AUTENTICACION_MID` | URL base del servicio de autenticación. |
| `HISTORICO_USUARIOS_MID` | URL base del servicio de usuarios y roles. |
| `TERCEROS_SERVICE` | URL base del servicio de terceros. |
| `AUTENTICACION` | URL base de autenticación utilizada por la configuración del cliente. |

### Ejecución del Proyecto

Este proyecto es parte de una infraestructura de microfrontend implementada con la librería Single-SPA. Para ejecutarlo correctamente, es necesario levantar dos aplicaciones independientes: el **Root** y el **Core**.

#### Root

El Root contiene la lógica de Sísifo

##### Pasos para la Ejecución del Root

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

#### Core

El Core contiene componentes generales que construyen el layout y administran aspectos como la autenticación.

##### Pasos para la Ejecución del Core

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

#### usuario_rol_mf

Microcliente de gestión de usuarios

##### Pasos para la Ejecución de usuario_rol_mf

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

#### Compilación

| Comando | Configuración | Uso en Drone |
| -- | -- | -- |
| `pnpm run build` | local (predeterminada) | `feature/*` y `develop` |
| `pnpm run build:test` | development | `release/*` |
| `pnpm run build:prod` | production | `master` |

Los archivos generados se guardan en `dist/`. Drone publica los artefactos de `release/*` y `master` en los destinos S3 configurados en [.drone.yml](.drone.yml).

### Ejecución Pruebas

```bash
pnpm test
```

Las pruebas usan [Jest](https://jestjs.io/) y la configuración de [jest.config.ts](jest.config.ts). Actualmente, su ejecución requiere resolver la dependencia faltante `jest-environment-jsdom`, utilizada por el entorno `jsdom` configurado.

## Estado CI

El pipeline de [Drone](.drone.yml) ejecuta el análisis Sonar y las compilaciones según la rama. Los tres pasos de Node utilizan `node:24.22.1-alpine`.

| Develop | Release | Master |
| -- | -- | -- |
| [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/develop)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/release/0.0.1)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/master)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) |

## Licencia

This file is part of usuario_rol_mf.

usuario_rol_mf is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

usuario_rol_mf is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with usuario_rol_mf. If not, see [GNU Licenses](https://www.gnu.org/licenses/).
