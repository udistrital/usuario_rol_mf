import { inject, Injectable } from '@angular/core';
import { RequestManager } from 'src/app/core/managers/requestManager';
import { lastValueFrom } from 'rxjs';
import { environment as env } from 'src/environments/environment';

interface ApiResponse<T> {
  Data: T;
  Success: boolean;
  Status: number;
  Message: string;
}

export interface Parametro {
  Id: number;
  Nombre: string;
  Descripcion: string;
  CodigoAbreviacion: string;
  TipoParametroId: { Id: number };
}

@Injectable({ providedIn: 'root' })
export class ParametrosService {

  private readonly requestManager = inject(RequestManager);

  private parametros: Parametro[] = [];

  constructor() {
    this.requestManager.setPath('PARAMETROS_SERVICE');
  }

  async get(endpoint: string) {
    this.requestManager.setPath('PARAMETROS_SERVICE');
    if (this.parametros.length > 0) {
      return this.parametros.filter((param) => param.TipoParametroId.Id === env.TIPO_PARAMETRO_SISTEMA_ID);
    }
    const params = await lastValueFrom(this.requestManager.get<ApiResponse<Parametro[]>>(endpoint));
    if (params.Success && this.parametros.length === 0) {
      this.parametros = params.Data;
    }
    return this.parametros;
  }

}
