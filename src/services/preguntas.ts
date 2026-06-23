import { DificultadEnum, Pregunta } from "@/types/database";
import { supabase } from "@/utils/supabase";

type PreguntaRelacionRow = {
  pregunta: PreguntaData | PreguntaData[] | null;
};

type PreguntaData = {
  id: number;
  texto: string;
  dificultad: DificultadEnum;
  respuesta: {
    id: number;
    pregunta_id: number;
    texto: string;
  }[];
};

function mezclar<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizarPregunta(pregunta: PreguntaRelacionRow["pregunta"]) {
  return Array.isArray(pregunta) ? pregunta[0] : pregunta;
}

export async function getPreguntasByCategoria(
  categoriaId: number,
  dificultad: DificultadEnum,
  limit = 10,
): Promise<Pregunta[]> {
  const { data, error } = await supabase
    .from("categoria_pregunta")
    .select(
      `
      pregunta:pregunta_id (
        id,
        texto,
        dificultad,
        respuesta (
          id,
          pregunta_id,
          texto
        )
      )
    `,
    )
    .eq("categoria_id", categoriaId)
    .eq("pregunta.dificultad", dificultad);

  if (error) throw error;

  const preguntas = ((data ?? []) as unknown as PreguntaRelacionRow[])
    .map((row) => normalizarPregunta(row.pregunta))
    .filter((pregunta): pregunta is PreguntaData => {
      return !!pregunta && pregunta.dificultad === dificultad;
    })
    .map((pregunta) => ({
      id: pregunta.id,
      texto: pregunta.texto,
      dificultad: pregunta.dificultad,
      opciones: mezclar(pregunta.respuesta ?? []),
    }));

  return mezclar(preguntas).slice(0, limit);
}

export async function prepararPreguntasPartida(
  partidaId: number,
  preguntas: Pregunta[],
): Promise<void> {
  const { data: existentes, error: errorExistentes } = await supabase
    .from("partida_pregunta")
    .select("pregunta_id")
    .eq("partida_id", partidaId);

  if (errorExistentes) throw errorExistentes;

  const existentesIds = new Set(
    (existentes ?? []).map((item) => item.pregunta_id),
  );
  const nuevas = preguntas
    .map((pregunta, index) => ({
      partida_id: partidaId,
      pregunta_id: pregunta.id,
      orden: index + 1,
      respondida: false,
    }))
    .filter((item) => !existentesIds.has(item.pregunta_id));

  if (nuevas.length === 0) return;

  const { error } = await supabase.from("partida_pregunta").insert(nuevas);

  if (error) throw error;
}

export async function responderPregunta(data: {
  partidaId: number;
  preguntaId: number;
  opcionElegidaId: number | null;
  rapido: boolean;
}): Promise<{
  correcta: boolean;
  opcionCorrectaId: number;
  puntajeObtenido: number;
}> {
  const { data: res, error } = await supabase.rpc("responder_pregunta", {
    p_partida_id: data.partidaId,
    p_pregunta_id: data.preguntaId,
    p_opcion_elegida_id: data.opcionElegidaId,
    p_rapido: data.rapido,
  });
  if (error) throw error;

  const fila = Array.isArray(res) ? res[0] : res;
  return {
    correcta: fila.correcta,
    opcionCorrectaId: fila.opcion_correcta_id,
    puntajeObtenido: fila.puntaje_obtenido,
  };
}
