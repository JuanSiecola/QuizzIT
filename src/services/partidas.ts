import { DificultadEnum, Partida } from "@/types/database";
import { supabase } from "@/utils/supabase";

// ─── Tipos compuestos para las vistas de Camilo ──────────────────────────────

export interface PartidaItemHistorial extends Partida {
  categoria: {
    nombre: string;
    icono: string | null;
    color: string | null;
  } | null;
}

export interface RespuestaDetalle {
  id: number;
  pregunta: { enunciado: string };
  opcion_elegida: { texto: string };
  es_correcta: boolean;
  puntaje_obtenido: number;
}

export interface PartidaConRespuestas extends Partida {
  categoria: {
    nombre: string;
    icono: string | null;
    color: string | null;
  } | null;
  respuestas: RespuestaDetalle[];
}

// ─── crearPartida (Juan) ─────────────────────────────────────────────────────

export async function crearPartida(
  categoriaId: number,
  dificultad: DificultadEnum,
  totalPreguntas = 10,
): Promise<Partida> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay usuario autenticado");

  const { data, error } = await supabase
    .from("partida")
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

export async function getPartidasByUser(
  userId: string,
): Promise<PartidaItemHistorial[]> {
  const { data, error } = await supabase
    .from("partida")
    .select(
      `
      *,
      categoria:categoria_id (
        nombre,
        icono,
        color
      )
    `,
    )
    .eq("usuario_id", userId)
    .order("fecha_inicio", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PartidaItemHistorial[];
}

export async function getPartidaDetalle(
  partidaId: number,
): Promise<PartidaConRespuestas> {
  const { data, error } = await supabase
    .from("partida")
    .select(
      `
      *,
      categoria:categoria_id (
        nombre,
        icono,
        color
      ),
      respuestas:respuesta_usuario (
        id,
        es_correcta,
        puntaje_obtenido,
        pregunta:pregunta_id ( enunciado ),
        opcion_elegida:opcion_elegida_id ( texto )
      )
    `,
    )
    .eq("id", partidaId)
    .single();

  if (error) throw error;
  return data as PartidaConRespuestas;
}

export async function finalizarPartida(
  partidaId: number,
  data: { puntaje: number },
): Promise<void> {
  const { error } = await supabase
    .from("partida")
    .update({
      puntaje: data.puntaje,
      fecha_fin: new Date().toISOString(),
    })
    .eq("id", partidaId);

  if (error) throw error;
}
