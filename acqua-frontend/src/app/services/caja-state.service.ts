import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class CajaStateService
{
  mostrarCajaEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor()
  {
    //
  }
}
