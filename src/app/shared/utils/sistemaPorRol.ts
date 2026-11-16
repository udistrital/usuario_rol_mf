import { Parametro } from 'src/app/services/parametros.service';

const SISTEMAS_POR_ROL = [
    {
        SISTEMA: 'SISIFO_V2',
        ROLES: {
            CONSULTA: new Set(['ADMIN_SISIFO', 'AUDITOR_EXPERTO', 'JEFE_CONTROL_INTERNO']),
            EDICION: new Set(['ADMIN_SISIFO', 'AUDITOR_EXPERTO']),
        },
    },
    {
        SISTEMA: 'ARGO_V2',
        ROLES: {
            CONSULTA: new Set(['ADMIN_ARGO', 'JEFE_CONTRATACION', 'JEFE_DEPENDENCIA']),
            EDICION: new Set(['ADMIN_ARGO', 'JEFE_CONTRATACION']),
        },
    },
];

const rolesDelSistema = (sistemaId: number, sistemas: Parametro[]) => {
    const codigoAbreviacion = sistemas.find(({ Id }) => Id === sistemaId)?.CodigoAbreviacion;

    return SISTEMAS_POR_ROL.find(({ SISTEMA }) => SISTEMA === codigoAbreviacion)?.ROLES;
};

export const sistemaPorRol = (roles: string[], sistemas: Parametro[]) => {
    const sistema = SISTEMAS_POR_ROL.find(({ SISTEMA, ROLES }) =>
        sistemas.some(({ CodigoAbreviacion }) => CodigoAbreviacion === SISTEMA) &&
        roles.some((rol) => ROLES.CONSULTA.has(rol) || ROLES.EDICION.has(rol))
    )?.SISTEMA;

    return sistemas.find(({ CodigoAbreviacion }) => CodigoAbreviacion === sistema)?.Id ?? 0;
};

export const PermisoEdicion = (roles: string[], sistemaId: number, sistemas: Parametro[]): boolean =>
    roles.some((rol) => rolesDelSistema(sistemaId, sistemas)?.EDICION.has(rol) ?? false);

export const PermisoConsulta = (roles: string[], sistemaId: number, sistemas: Parametro[]): boolean =>
    roles.some((rol) => rolesDelSistema(sistemaId, sistemas)?.CONSULTA.has(rol) ?? false);
