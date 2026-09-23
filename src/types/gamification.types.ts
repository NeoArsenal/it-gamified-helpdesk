export interface NivelAcademia {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  orden: number;
  xpRecompensa?: number;
  isCompleted?: boolean;
  isUnlocked?: boolean;
}

export interface CursoAcademia {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  orden: number;
  niveles: NivelAcademia[];
}

export interface PreguntaAcademia {
  id: string;
  nivelId: string;
  texto: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion?: string;
}
