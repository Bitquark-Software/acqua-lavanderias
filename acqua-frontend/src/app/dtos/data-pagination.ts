export class Link
{
  url?: string | null;
  label?: string;
  active?: boolean;
}

export class DataPagination<T>
{
  current_page?: number;
  data: T[];
  from?: number;
  path?: string;
  links?: Link[];
  perl_page?: number;
  first_page_url?: string;
  last_page?: number;
  prev_page_url ?: string | null;
  next_page_url ?: string | null;
  last_page_url?: string;
  to?: number;
  total!: number;

  constructor(data: T[])
  {
    this.data = data;
  }
}
