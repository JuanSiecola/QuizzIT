import { Partida, DificultadEnum } from '@/types/database';
import { supabase } from '@/utils/supabase';

export async function crearPartida(
  categoriaId: number,
  dificultad: DificultadEnum,
  totalPreguntas = 10
): Promise<Partida> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No hay usuario autenticado');

  const { data, error } = await supabase
    .from('partida')
    .insert({
      usuario_id: user.id,
      categoria_id: categoriaId,
      dificultad,
      puntaje: 0,
      total_preguntas: totalPreguntas,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Partida;
}
