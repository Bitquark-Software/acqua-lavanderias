export class Sucursal
{
  id!: number;
  nombre!: string;
}

export class SucursalResponse
{
  current_page!: number;
  data!: Sucursal[];
  prev_page_url ?: string;
  next_page_url ?: string;
}
