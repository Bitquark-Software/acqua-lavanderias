export class Servicio {
  id: number;
  catalogoId: number;
  claveServicio: string;
  nombreServicio: string;
  importe: number;
  cantidadMinima: number;

  constructor(servicio:Required<Servicio>) {
    this.id = servicio.id;
    this.catalogoId = servicio.catalogoId;
    this.claveServicio = servicio.claveServicio;
    this.nombreServicio = servicio.nombreServicio;
    this.importe = servicio.importe;
    this.cantidadMinima = servicio.cantidadMinima;
  }
}
