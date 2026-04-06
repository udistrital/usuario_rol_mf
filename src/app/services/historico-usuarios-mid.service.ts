import { inject, Injectable } from '@angular/core';
import { RequestManager } from '../core/managers/requestManager';

@Injectable()
export class HistoricoUsuariosMidService {

  private requestManager = inject(RequestManager);

  constructor() {
    this.requestManager.setPath('HISTORICO_USUARIOS_MID');
  }
  get(endpoint: any): any {
    this.requestManager.setPath('HISTORICO_USUARIOS_MID');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any): any {
    this.requestManager.setPath('HISTORICO_USUARIOS_MID');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any): any {
    this.requestManager.setPath('HISTORICO_USUARIOS_MID');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: any, id: any): any {
    this.requestManager.setPath('HISTORICO_USUARIOS_MID');
    return this.requestManager.delete(endpoint, id);
  }
}
