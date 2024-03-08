/* eslint-disable no-unused-vars */
export enum Role
{
    Administrador = 'administrador',
    Encargado = 'encargado',
    Operativo = 'operativo',
    Cajero = 'cajero'
}

export function convertStringToRole(role = ''): Role | null
{
  const lowerCaseRole = role.toLowerCase();
  switch(lowerCaseRole)
  {
  case 'administrador':
    return Role.Administrador;
  case 'encargado':
    return Role.Encargado;
  case 'operativo':
    return Role.Operativo;
  case 'cajero':
    return Role.Cajero;
  default:
    return null;
  }
}