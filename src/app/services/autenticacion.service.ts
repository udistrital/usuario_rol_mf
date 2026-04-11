import { inject, Injectable } from '@angular/core';
import { RequestManager } from '../core/managers/requestManager';

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  
  private requestManager = inject(RequestManager);
  
  constructor() {
    this.requestManager.setPath('AUTENTICACION');
  }

  getEmail(endpoint: any, email: string): any {
    this.requestManager.setPath('AUTENTICACION');
    const payload = { user: email };
    return this.requestManager.post(endpoint, payload);
  }

  getDocumento(endpoint: any, documento: string): any {
    this.requestManager.setPath('AUTENTICACION');
    const payload = { numero: documento };
    return this.requestManager.post(endpoint, payload);
  }

  getPeriodos(endpoint: any): any {
    this.requestManager.setPath('AUTENTICACION');
    return this.requestManager.get(endpoint);
  }

  PostRol(endpoint: any, rol: string, user: string): any {
    this.requestManager.setPath('AUTENTICACION');
    const payload = { rol: rol, user: user };
    return this.requestManager.post(endpoint, payload);
  }
}
