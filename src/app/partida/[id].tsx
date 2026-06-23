// src/app/partida/[id].tsx
import { ProgressBar } from "@/components/progress-bar";
import { RespuestaOption } from "@/components/respuesta-option";
import { TimerBar } from "@/components/timer-bar";
import { Button } from "@/components/ui/button";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { getPartidaById } from "@/services/partidas";
import {
  getPreguntasByCategoria,
  prepararPreguntasPartida,
  responderPregunta,
} from "@/services/preguntas";
import { DificultadEnum, Opcion, Pregunta } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LETRAS = ["A", "B", "C", "D"];

// tiempo límite por pregunta, según dificultad
const TIEMPO_MS_POR_DIFICULTAD: Record<DificultadEnum, number> = {
  facil: 10000,
  intermedio: 15000,
  dificil: 20000,
};

// si responde dentro de la primera mitad del tiempo: rápido (puntos completos).
// si responde en la segunda mitad: lento (el servidor reduce a la mitad).
const UMBRAL_PENALIZACION = 0.5;

export default function PartidaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const partidaId = Number(id);

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opcionElegida, setOpcionElegida] = useState<Opcion | null>(null);
  const [opcionCorrectaId, setOpcionCorrectaId] = useState<number | null>(null);
  const [ultimaCorrecta, setUltimaCorrecta] = useState(false);
  const [resultadoVisible, setResultadoVisible] = useState(false);
  const [puntosUltimaRespuesta, setPuntosUltimaRespuesta] = useState(0);
  const [tiempoAgotado, setTiempoAgotado] = useState(false);
  const [penalizadoPorTiempo, setPenalizadoPorTiempo] = useState(false);

  const preguntaActual = preguntas[indice];
  const total = preguntas.length;
  const esUltima = indice === total - 1;

  const tiempoLimiteMs = useMemo(() => {
    if (!preguntaActual) return TIEMPO_MS_POR_DIFICULTAD.facil;
    return (
      TIEMPO_MS_POR_DIFICULTAD[preguntaActual.dificultad] ??
      TIEMPO_MS_POR_DIFICULTAD.facil
    );
  }, [preguntaActual]);

  // marca de tiempo de cuándo arrancó a mostrarse la pregunta actual,
  // usada para calcular si la respuesta llegó a tiempo o tarde
  const inicioPreguntaRef = useRef(Date.now());

  useEffect(() => {
    if (preguntaActual) {
      inicioPreguntaRef.current = Date.now();
    }
  }, [indice, preguntaActual]);

  useEffect(() => {
    if (!partidaId) return;
    let activo = true;

    async function cargarPartida() {
      try {
        const partida = await getPartidaById(partidaId);
        if (!partida.categoria_id || !partida.dificultad) {
          throw new Error("Partida incompleta");
        }

        const data = await getPreguntasByCategoria(
          partida.categoria_id,
          partida.dificultad,
          partida.total_preguntas || 10,
        );
        await prepararPreguntasPartida(partidaId, data);

        if (activo) {
          setPreguntas(data);
          if (data.length === 0) {
            setError(
              "No hay preguntas cargadas para esta categoría y dificultad.",
            );
          }
        }
      } catch {
        if (activo) setError("No se pudo cargar la partida.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarPartida();

    return () => {
      activo = false;
    };
  }, [partidaId]);

  async function elegirOpcion(opcion: Opcion) {
    if (!preguntaActual || opcionElegida || guardando || tiempoAgotado) return;

    // el tiempo lo seguimos midiendo en el cliente (tenemos el timer acá),
    // pero solo para decidir rápido/lento; el puntaje lo calcula el servidor.
    const tiempoTranscurridoMs = Date.now() - inicioPreguntaRef.current;
    const proporcionTranscurrida = Math.min(
      1,
      tiempoTranscurridoMs / tiempoLimiteMs,
    );
    const respondioLento = proporcionTranscurrida >= UMBRAL_PENALIZACION;

    setGuardando(true);

    try {
      // el servidor valida, corrige y puntúa. nunca sabemos la correcta antes.
      const resultado = await responderPregunta({
        partidaId,
        preguntaId: preguntaActual.id,
        opcionElegidaId: opcion.id,
        rapido: !respondioLento,
      });

      setOpcionElegida(opcion);
      setOpcionCorrectaId(resultado.opcionCorrectaId);
      setUltimaCorrecta(resultado.correcta);
      setPuntosUltimaRespuesta(resultado.puntajeObtenido);
      setPenalizadoPorTiempo(resultado.correcta && respondioLento);
      setResultadoVisible(true);

      if (resultado.correcta) {
        setCorrectas((actual) => actual + 1);
        setPuntaje((actual) => actual + resultado.puntajeObtenido);
      }
    } catch {
      Alert.alert("Error", "No se pudo guardar tu respuesta.");
    } finally {
      setGuardando(false);
    }
  }

  async function manejarTiempoAgotado() {
    if (!preguntaActual || opcionElegida || guardando || tiempoAgotado) return;

    setTiempoAgotado(true);
    setGuardando(true);

    try {
      // sin opción elegida: el servidor la marca incorrecta y 0 puntos,
      // pero igual nos devuelve cuál era la correcta para mostrarla.
      const resultado = await responderPregunta({
        partidaId,
        preguntaId: preguntaActual.id,
        opcionElegidaId: null,
        rapido: false,
      });

      setOpcionCorrectaId(resultado.opcionCorrectaId);
      setUltimaCorrecta(false);
      setPuntosUltimaRespuesta(0);
      setPenalizadoPorTiempo(false);
      setResultadoVisible(true);
    } catch {
      Alert.alert("Error", "No se pudo guardar tu respuesta.");
    } finally {
      setGuardando(false);
    }
  }

  function continuar() {
    const puntajeFinal = puntaje;
    const correctasFinal = correctas;
    const incorrectasFinal = total - correctasFinal;

    setResultadoVisible(false);

    if (esUltima) {
      router.replace({
        pathname: "/resultado-final/[partidaId]",
        params: {
          partidaId: String(partidaId),
          puntaje: String(puntajeFinal),
          correctas: String(correctasFinal),
          incorrectas: String(incorrectasFinal),
        },
      });
      return;
    }

    setIndice((actual) => actual + 1);
    setOpcionElegida(null);
    setOpcionCorrectaId(null);
    setUltimaCorrecta(false);
    setPuntosUltimaRespuesta(0);
    setTiempoAgotado(false);
    setPenalizadoPorTiempo(false);
  }

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !preguntaActual) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>
          {error ?? "No se encontró la pregunta."}
        </Text>
        <Button
          label="Volver"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const progresoActual = opcionElegida || tiempoAgotado ? indice + 1 : indice;
  const respuestaBloqueada = !!opcionElegida || tiempoAgotado;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>
          Pregunta {indice + 1} de {total}
        </Text>
        <Text style={styles.puntaje}>{puntaje} pts</Text>
      </View>

      <View style={styles.timerWrap}>
        <TimerBar
          duracionMs={tiempoLimiteMs}
          resetKey={preguntaActual.id}
          pausado={respuestaBloqueada}
          onTerminar={manejarTiempoAgotado}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar value={progresoActual} total={total} />

        <View style={styles.preguntaCard}>
          <Text style={styles.dificultad}>{preguntaActual.dificultad}</Text>
          <Text style={styles.enunciado}>{preguntaActual.texto}</Text>
        </View>

        <View style={styles.opciones}>
          {preguntaActual.opciones.map((opcion, index) => {
            const mostrarResultado = respuestaBloqueada;
            const estado = !mostrarResultado
              ? "idle"
              : opcion.id === opcionCorrectaId
                ? "correcta"
                : opcionElegida && opcion.id === opcionElegida.id
                  ? "incorrecta"
                  : "idle";

            return (
              <RespuestaOption
                key={String(opcion.id)}
                opcion={opcion}
                letra={LETRAS[index] ?? String(index + 1)}
                estado={estado}
                disabled={respuestaBloqueada || guardando}
                onPress={() => elegirOpcion(opcion)}
              />
            );
          })}
        </View>
      </ScrollView>

      <Modal transparent visible={resultadoVisible} animationType="fade">
        <View style={styles.modalFondo}>
          <View style={styles.modalCard}>
            <Ionicons
              name={
                tiempoAgotado
                  ? "time-outline"
                  : ultimaCorrecta
                    ? "checkmark-circle"
                    : "close-circle"
              }
              size={54}
              color={
                tiempoAgotado
                  ? colors.error
                  : ultimaCorrecta
                    ? colors.success
                    : colors.error
              }
            />
            <Text style={styles.modalTitulo}>
              {tiempoAgotado
                ? "¡Se acabó el tiempo!"
                : ultimaCorrecta
                  ? "Correcta"
                  : "Incorrecta"}
            </Text>
            <Text style={styles.modalTexto}>
              {tiempoAgotado
                ? "No respondiste a tiempo, no sumaste puntos."
                : ultimaCorrecta
                  ? `Sumaste ${puntosUltimaRespuesta} puntos.`
                  : "No sumaste puntos esta vez."}
            </Text>
            {penalizadoPorTiempo && (
              <View style={styles.penalizacionBadge}>
                <Ionicons name="flash" size={14} color="#F5C518" />
                <Text style={styles.penalizacionTexto}>
                  Respuesta lenta: puntos reducidos a la mitad
                </Text>
              </View>
            )}
            <Button
              label={esUltima ? "Ver resultado final" : "Siguiente pregunta"}
              onPress={continuar}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  error: {
    color: colors.textMuted,
    fontSize: fontSizes.body,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitulo: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: "700",
  },
  puntaje: {
    color: colors.success,
    fontSize: fontSizes.label,
    fontWeight: "800",
  },
  timerWrap: {
    width: "100%",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  preguntaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  dificultad: {
    alignSelf: "flex-start",
    color: colors.primary,
    fontSize: fontSizes.small,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  enunciado: {
    color: colors.textPrimary,
    fontSize: fontSizes.heading,
    fontWeight: "800",
    lineHeight: 32,
  },
  opciones: {
    gap: spacing.sm,
  },
  modalFondo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  modalTitulo: {
    color: colors.textPrimary,
    fontSize: fontSizes.heading,
    fontWeight: "800",
  },
  modalTexto: {
    color: colors.textSecondary,
    fontSize: fontSizes.body,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  penalizacionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5C51822",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  penalizacionTexto: {
    color: "#F5C518",
    fontSize: 12,
    fontWeight: "700",
  },
});