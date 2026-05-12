import { inject, Injectable } from '@angular/core';
import { RequestManager } from '../core/managers/requestManager';

@Injectable({
  providedIn: 'root',
})
export class TercerosService {

  private readonly requestManager = inject(RequestManager);

  constructor() {
    this.requestManager.setPath('TERCEROS_SERVICE');
  }
  get(endpoint: any): any {
    this.requestManager.setPath('TERCEROS_SERVICE');
    return this.requestManager.get(endpoint);
  }
}
