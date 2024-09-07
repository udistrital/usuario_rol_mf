export const environment = {
    production: false,
    SISTEMA_INFORMACION_ID: 1,
    ROLES_CONSULTA: ['JEFE_DEPENDENCIA', 'AUDITOR', 'EJECUTOR', 'ESTUDIANTE'],
    ROLES_CONSULTA_EDICION: ['ADMIN_SISIFO', 'SOPORTE_OAS'],
    AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/',
    TOKEN: {
      AUTORIZATION_URL: "https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize",
      CLIENTE_ID: "e36v1MPQk2jbz9KM4SmKhk8Cyw0a",
      RESPONSE_TYPE: "id_token token",
      SCOPE: "openid email role documento",
      REDIRECT_URL: "http://localhost:4200/",
      SIGN_OUT_URL: "https://autenticacion.portaloas.udistrital.edu.co/oidc/logout",
      SIGN_OUT_REDIRECT_URL: "http://localhost:4200/",
      AUTENTICACION_MID: "https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol",
    },
    HISTORICO_USUARIOS_MID: 'http://localhost:8080/v1/', 
    TERCEROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
    AUTENTICACION: "http://localhost:8082/v1/"
};