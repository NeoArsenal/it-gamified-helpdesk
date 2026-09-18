export type RolUsuario = 'ADMIN' | 'TECNICO' | 'USUARIO';

export interface UserPreferences {
  musicaNivel?: boolean;
  alertasCriticas?: boolean;
  temaOscuro?: boolean;
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  avatar?: string;
  nivel?: number;
  xpTotal?: number;
  rachaDias?: number;
  tituloRPG?: string;
  preferencias?: UserPreferences;
  creadoEn?: string | Date;
}
