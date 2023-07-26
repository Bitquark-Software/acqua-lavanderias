export class Ubicacion
{
  id?: number;
  nombre_ubicacion: string;
  calle: string;
  colonia: string;
  codigo_postal: number;
  ciudad: string;
  numero: number;

  constructor(ubicacion: Partial<Ubicacion>)
  {
    this.nombre_ubicacion = ubicacion.nombre_ubicacion ?? '';
    this.calle = ubicacion.calle ?? '';
    this.colonia = ubicacion.colonia ?? '';
    this.codigo_postal = ubicacion.codigo_postal ?? 0;
    this.ciudad = ubicacion.ciudad ?? '';
    this.numero = ubicacion.numero ?? 0;
  }
}
