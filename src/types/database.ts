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