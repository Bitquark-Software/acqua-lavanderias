
export class AdminCode
{
  id?: number;
  codigo?: string;
  motivo?: string;
  usado?: number;
  id_ticket?: number;
  id_user?: number;
  used_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class Link
{
  url?: string;
  label?: string;
  active?: boolean;
}

export class AdminCodeResponseGet
{
  current_page!: number;
  data!: AdminCode[];
  from?: number;
  path?: string;
  links?: Link[];
  perl_page?: number;
  first_page_url?: string;
  last_page?: number;
  prev_page_url ?: string;
  next_page_url ?: string;
  last_page_url?: string;
  to?: number;
  total?: number;
}

export class AdminCodeResponsePostPut
{
  data!: AdminCode;
  mensaje!: string;
}
