import { DificultadEnum, Partida } from "@/types/database";
import { supabase } from "@/utils/supabase";

// ─── Tipos compuestos para las vistas de Camilo ──────────────────────────────

export interface PartidaItemHistorial extends Partida {
  categoria: {
    nombre: string;
    icono: string | null;
    color: string | null;
  } | null;
  esRecord: boolean; //true si es el puntaje más alto del user en esa categoria+dificultad
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
  esRecord: boolean;
  puntajeRecord: number;
  diferencia: number; //puntaje - record (negativo si no llegó)
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

export async function getRecordByCategoria(
  userId: string,
  categoriaId: number,
  dificultad: DificultadEnum,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("partida")
    .select("puntaje")
    .eq("usuario_id", userId)
    .eq("categoria_id", categoriaId)
    .eq("dificultad", dificultad)
    .not("fecha_fin", "is", null)
    .order("puntaje", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.puntaje ?? null;
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
    .not("fecha_fin", "is", null)
    .order("fecha_inicio", { ascending: false });

  if (error) throw error;

  const partidas = (data ?? []) as Omit<PartidaItemHistorial, "esRecord">[];

  // calcular el record por cada combinacion categoria+dificultad en memoria,
  // sin queries extra — ya tenemos todos los datos del user.
  const recordMap = new Map<string, number>();
  for (const p of partidas) {
    const clave = `${p.categoria_id}-${p.dificultad}`;
    const actual = recordMap.get(clave) ?? 0;
    if (p.puntaje > actual) recordMap.set(clave, p.puntaje);
  }

  return partidas.map((p) => {
    const clave = `${p.categoria_id}-${p.dificultad}`;
    const record = recordMap.get(clave) ?? 0;
    return { ...p, esRecord: p.puntaje === record && record > 0 };
  });
}

// ─── getPartidaDetalle (Camilo — detalle con comparacion de record) ───────────

export async function getPartidaDetalle(
  partidaId: number,
): Promise<PartidaConRespuestas> {
  //traer el detalle de la partida
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

  const partida = data as Omit<
    PartidaConRespuestas,
    "esRecord" | "puntajeRecord" | "diferencia"
  >;

  //traer el record del user en esa categoria+dificultad
  let puntajeRecord = partida.puntaje; // fallback: es su primer puntaje

  if (partida.usuario_id && partida.categoria_id && partida.dificultad) {
    const { data: recordData } = await supabase
      .from("partida")
      .select("puntaje")
      .eq("usuario_id", partida.usuario_id)
      .eq("categoria_id", partida.categoria_id)
      .eq("dificultad", partida.dificultad)
      .not("fecha_fin", "is", null)
      .order("puntaje", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recordData?.puntaje !== undefined) {
      puntajeRecord = recordData.puntaje;
    }
  }

  const esRecord = partida.puntaje >= puntajeRecord;
  const diferencia = partida.puntaje - puntajeRecord;

  return { ...partida, esRecord, puntajeRecord, diferencia };
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
