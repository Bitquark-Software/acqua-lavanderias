export class Ubicacion
{
  id?: number;
  nombre: string;
  direccion: string;
  colonia: string;
  codigoPostal: number;
  ciudad: string;
  numero: number;

  constructor(ubicacion: Partial<Ubicacion>)
  {
    this.nombre = ubicacion.nombre ?? '';
    this.direccion = ubicacion.direccion ?? '';
    this.colonia = ubicacion.colonia ?? '';
    this.codigoPostal = ubicacion.codigoPostal ?? 0;
    this.ciudad = ubicacion.ciudad ?? '';
    this.numero = ubicacion.numero ?? 0;
  }
}
