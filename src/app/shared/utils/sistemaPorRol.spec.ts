import { Parametro } from 'src/app/services/parametros.service';
import { PermisoConsulta, PermisoEdicion, sistemaPorRol } from './sistemaPorRol';

describe('sistemaPorRol', () => {
  const sistemas: Parametro[] = [
    {
      Id: 42,
      Nombre: 'SISIFO',
      Descripcion: '',
      CodigoAbreviacion: 'SISIFO_V2',
      TipoParametroId: { Id: 1 },
    },
    {
      Id: 84,
      Nombre: 'ARGO',
      Descripcion: '',
      CodigoAbreviacion: 'ARGO_V2',
      TipoParametroId: { Id: 1 },
    },
  ];

  it('returns the parameter id matching the system abbreviation for the user role', () => {
    expect(sistemaPorRol(['ADMIN_ARGO'], sistemas)).toBe(84);
  });

  it('returns 0 when no role system matches a parameter', () => {
    expect(sistemaPorRol(['USUARIO_SIN_SISTEMA'], sistemas)).toBe(0);
    expect(sistemaPorRol(['ADMIN_ARGO'], [sistemas[0]])).toBe(0);
  });

  it('checks permissions only against the roles configured for the selected system', () => {
    expect(PermisoEdicion(['ADMIN_ARGO'], 84, sistemas)).toBe(true);
    expect(PermisoConsulta(['JEFE_CONTRATACION'], 84, sistemas)).toBe(true);
    expect(PermisoEdicion(['ADMIN_ARGO'], 42, sistemas)).toBe(false);
    expect(PermisoConsulta(['ADMIN_ARGO'], 84, sistemas)).toBe(false);
  });
});
