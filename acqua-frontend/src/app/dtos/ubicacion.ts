export class Ubicacion {
  id: number;
  nombre: string;
  direccion: string;
  colonia: string;
  codigoPostal: number;

  constructor(ubicacion: Required<Ubicacion>){
    this.id = ubicacion.id;
    this.nombre = ubicacion.nombre;
    this.direccion = ubicacion.direccion;
    this.colonia = ubicacion.colonia;
    this.codigoPostal = ubicacion.codigoPostal;
  }
}
