import { ProgressBar } from "@/components/progress-bar";
import { RespuestaOption } from "@/components/respuesta-option";
import { Button } from "@/components/ui/button";
import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { getPartidaById } from "@/services/partidas";
import {
  getPreguntasByCategoria,
  guardarRespuesta,
  prepararPreguntasPartida,
} from "@/services/preguntas";
import { Opcion, Pregunta } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

const PUNTOS_POR_DIFICULTAD = {
  facil: 10,
  intermedio: 15,
  dificil: 20,
};

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
  const [resultadoVisible, setResultadoVisible] = useState(false);
  const [puntosUltimaRespuesta, setPuntosUltimaRespuesta] = useState(0);

  const preguntaActual = preguntas[indice];
  const total = preguntas.length;
  const esUltima = indice === total - 1;

  const puntosPorPregunta = useMemo(() => {
    if (!preguntaActual) return 10;
    return PUNTOS_POR_DIFICULTAD[preguntaActual.dificultad] ?? 10;
  }, [preguntaActual]);

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
            setError("No hay preguntas cargadas para esta categoría y dificultad.");
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
    if (!preguntaActual || opcionElegida || guardando) return;

    const esCorrecta = opcion.es_correcta;
    const puntosObtenidos = esCorrecta ? puntosPorPregunta : 0;

    setGuardando(true);

    try {
      await guardarRespuesta({
        partidaId,
        preguntaId: preguntaActual.id,
        opcionElegidaId: opcion.id,
        esCorrecta,
        puntajeObtenido: puntosObtenidos,
      });

      setOpcionElegida(opcion);
      setPuntosUltimaRespuesta(puntosObtenidos);
      setResultadoVisible(true);

      if (esCorrecta) {
        setCorrectas((actual) => actual + 1);
        setPuntaje((actual) => actual + puntosObtenidos);
      }
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
    setPuntosUltimaRespuesta(0);
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
        <Text style={styles.error}>{error ?? "No se encontró la pregunta."}</Text>
        <Button label="Volver" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const progresoActual = opcionElegida ? indice + 1 : indice;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Pregunta {indice + 1} de {total}</Text>
        <Text style={styles.puntaje}>{puntaje} pts</Text>
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
            const mostrarResultado = !!opcionElegida;
            const estado = !mostrarResultado
              ? "idle"
              : opcion.es_correcta
                ? "correcta"
                : opcion.id === opcionElegida.id
                  ? "incorrecta"
                  : "idle";

            return (
              <RespuestaOption
                key={String(opcion.id)}
                opcion={opcion}
                letra={LETRAS[index] ?? String(index + 1)}
                estado={estado}
                disabled={!!opcionElegida || guardando}
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
              name={opcionElegida?.es_correcta ? "checkmark-circle" : "close-circle"}
              size={54}
              color={opcionElegida?.es_correcta ? colors.success : colors.error}
            />
            <Text style={styles.modalTitulo}>
              {opcionElegida?.es_correcta ? "Correcta" : "Incorrecta"}
            </Text>
            <Text style={styles.modalTexto}>
              {opcionElegida?.es_correcta
                ? `Sumaste ${puntosUltimaRespuesta} puntos.`
                : "No sumaste puntos esta vez."}
            </Text>
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
});
