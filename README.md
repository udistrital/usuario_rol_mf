# Usuario Rol Microcliente

Microcliente para la gestión de los periodos de roles de un usuario, este sistema complementa su funcionalidad con WSO2. Este microcliente es de uso transversal para los sistemas que requieran gestionar los roles de los usuarios.

## Especificaciones Técnicas

### Tecnologías Implementadas y Versiones
<img src="https://angular.io/assets/images/logos/angular/angular.svg" alt="Angular Logo" width="40" height="40">

- [Angular](https://angular.io/docs) 22.1.6
  - Incluye Animations, Common, Compiler, Core, Forms, Platform-Browser, Platform-Browser-Dynamic, Router
- [Angular Material](https://material.angular.io/) 22.1.7
- [RxJS](https://rxjs.dev/guide/overview) ~7.8.2
- [Single-spa](https://single-spa.js.org/) >=4.0.0
  - Incluye single-spa-angular
- [SweetAlert2](https://sweetalert2.github.io/) 15.0.0
- [ts-md5](https://github.com/cotag/ts-md5) 1.3.1
- [tslib](https://github.com/Microsoft/tslib) 2.3.0
- [Zone.js](https://github.com/angular/angular/tree/master/packages/zone.js) ~0.15.1

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

Microcliente de gestion de usuarios

### Pasos para la Ejecución de usuario_mf

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
   pnpm install
   ```

4. Iniciar usuario_mf:

   ```bash
   pnpm start
   ```

Con estos pasos, se tendrán las partes mínimas necesarias para ejecutar el proyecto en un entorno local.

## Ejecución Dockerfile

```bash
# Does not apply
```

## Ejecución docker-compose

```bash
# Does not apply
```

## Ejecución Pruebas

```bash
# Developing
```

## Estado CI

| Develop | Relese | Main |
| -- | -- | -- |
| [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/develop)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/release/0.0.1)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/usuario_rol_mf/status.svg?ref=refs/heads/main)](https://hubci.portaloas.udistrital.edu.co/udistrital/usuario_rol_mf/) |

## Licencia

[This file is part of usuario_rol_mf](LICENSE)

usuario_rol_mf is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (atSara Sampaio your option) any later version.

usuario_rol_mf is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with usuario_rol_mf. If not, see https://www.gnu.org/licenses/.
