export type DificultadEnum = 'facil' | 'intermedio' | 'dificil';

export interface Categoria {
  id: number;                  
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  color: string | null;
  cantidad_preguntas?: number; 
}

export interface Partida {
  id: number;                 
  usuario_id: string;          
  fecha_inicio: string;
  fecha_fin: string | null;
  puntaje: number;
  total_preguntas: number;
  categoria_id: number | null; 
  dificultad: DificultadEnum | null;
}

export interface Opcion {
  id: number;
  pregunta_id: number;
  texto: string;
  es_correcta?: boolean;
}

export interface Pregunta {
  id: number;
  texto: string;
  dificultad: DificultadEnum;
  opciones: Opcion[];
}

export interface PartidaPregunta {
  id: number;
  partida_id: number;
  pregunta_id: number;
  orden: number;
  respondida: boolean;
  correcta: boolean | null;
  id_respuesta_elegida: number | null;
}
