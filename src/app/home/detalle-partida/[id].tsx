import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import {
  getPartidaDetalle,
  PartidaConRespuestas,
  RespuestaDetalle,
} from "@/services/partidas";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Boxes,
  Brain,
  Code2,
  Database,
  HelpCircle,
  LucideIcon,
  Medal,
  Monitor,
  Network,
  Server,
  ShieldCheck,
  Trophy,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ICONOS: Record<string, LucideIcon> = {
  brain: Brain,
  code: Code2,
  server: Server,
  layers: Boxes,
  network: Network,
  database: Database,
  shield: ShieldCheck,
  monitor: Monitor,
};

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio} - ${h}:${m}`;
}

function BloqueRecord({
  esRecord,
  puntaje,
  puntajeRecord,
  diferencia,
}: {
  esRecord: boolean;
  puntaje: number;
  puntajeRecord: number;
  diferencia: number;
}) {
  // caso: primera partida en esta categoria+dificultad (puntajeRecord === puntaje)
  const esPrimera = puntaje === puntajeRecord && diferencia === 0;

  if (esPrimera) {
    return (
      <View
        style={[estilosRecord.bloque, { borderColor: colors.primary + "55" }]}
      >
        <Medal size={20} color={colors.primary} strokeWidth={2} />
        <View style={estilosRecord.textos}>
          <Text style={estilosRecord.titulo}>Primera partida aquí</Text>
          <Text style={estilosRecord.subtitulo}>
            Este es tu puntaje inicial en esta categoría y dificultad.
          </Text>
        </View>
      </View>
    );
  }

  if (esRecord) {
    return (
      <View style={[estilosRecord.bloque, { borderColor: "#F5C51855" }]}>
        <Trophy size={20} color="#F5C518" strokeWidth={2} />
        <View style={estilosRecord.textos}>
          <Text style={[estilosRecord.titulo, { color: "#F5C518" }]}>
            Nuevo récord personal
          </Text>
          <Text style={estilosRecord.subtitulo}>
            Superaste tu mejor marca por{" "}
            <Text style={{ color: colors.success, fontWeight: "700" }}>
              +{Math.abs(diferencia)} pts
            </Text>
          </Text>
        </View>
      </View>
    );
  }

  // No llegó al record
  return (
    <View style={[estilosRecord.bloque, { borderColor: colors.border }]}>
      <Trophy size={20} color={colors.textMuted} strokeWidth={2} />
      <View style={estilosRecord.textos}>
        <Text style={estilosRecord.titulo}>Tu récord: {puntajeRecord} pts</Text>
        <Text style={estilosRecord.subtitulo}>
          Te faltaron{" "}
          <Text style={{ color: colors.error, fontWeight: "700" }}>
            {Math.abs(diferencia)} pts
          </Text>{" "}
          para superarlo.
        </Text>
      </View>
    </View>
  );
}

const estilosRecord = StyleSheet.create({
  bloque: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: fontSizes.label,
    fontWeight: "700",
  },
  subtitulo: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    lineHeight: 18,
  },
});

function FilaRespuesta({
  respuesta,
  numero,
}: {
  respuesta: RespuestaDetalle;
  numero: number;
}) {
  const esCorrecta = respuesta.es_correcta;
  return (
    <View style={estilosRespuesta.fila}>
      <Text style={estilosRespuesta.numero}>Pregunta {numero}</Text>
      <Text style={estilosRespuesta.enunciado}>
        {respuesta.pregunta?.enunciado ?? "—"}
      </Text>
      <View style={estilosRespuesta.resultadoFila}>
        <Text style={estilosRespuesta.etiqueta}>Tu respuesta: </Text>
        <Text
          style={[
            estilosRespuesta.respuestaTexto,
            { color: esCorrecta ? colors.success : colors.error },
          ]}
        >
          {respuesta.opcion_elegida?.texto ?? "—"}
        </Text>
      </View>
      <View style={estilosRespuesta.resultadoFila}>
        <Text style={estilosRespuesta.etiqueta}>Resultado: </Text>
        <Text
          style={[
            estilosRespuesta.badge,
            { color: esCorrecta ? colors.success : colors.error },
          ]}
        >
          {esCorrecta ? "Correcta" : "Incorrecta"}
        </Text>
      </View>
    </View>
  );
}

const estilosRespuesta = StyleSheet.create({
  fila: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  numero: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
    fontWeight: "600",
    marginBottom: 2,
  },
  enunciado: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultadoFila: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  etiqueta: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
  },
  respuestaTexto: {
    fontSize: fontSizes.small,
    fontWeight: "600",
  },
  badge: {
    fontSize: fontSizes.small,
    fontWeight: "700",
  },
});

export default function DetallePartidaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [partida, setPartida] = useState<PartidaConRespuestas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;

    (async () => {
      try {
        const data = await getPartidaDetalle(Number(id));
        if (activo) setPartida(data);
      } catch {
        if (activo) setError("No se pudo cargar el detalle de la partida.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.pantallaCentro}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !partida) {
    return (
      <View style={styles.pantallaCentro}>
        <Text style={styles.textoError}>
          {error ?? "Partida no encontrada."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.btnVolver}
        >
          <Text style={styles.btnVolverTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cat = partida.categoria;
  const color = cat?.color ?? colors.primary;
  const Icono = ICONOS[cat?.icono ?? ""] ?? HelpCircle;
  const respuestas = partida.respuestas ?? [];
  const correctas = respuestas.filter((r) => r.es_correcta).length;
  const incorrectas = respuestas.length - correctas;

  return (
    <View style={styles.contenedor}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Detalle de partida</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Card resumen ── */}
        <View style={styles.resumenCard}>
          <View style={styles.resumenCabecera}>
            <View style={[styles.iconoWrap, { backgroundColor: color + "22" }]}>
              <Icono size={22} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoriaNombre}>
                {cat?.nombre ?? "Categoría"}
              </Text>
              <Text style={styles.fecha}>
                {formatearFecha(partida.fecha_inicio)}
              </Text>
            </View>
          </View>

          <View style={styles.puntajeRow}>
            <Ionicons name="trophy" size={22} color="#F5C518" />
            <Text style={styles.puntajeValor}>{partida.puntaje} pts</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.statTexto}>Correctas</Text>
              <Text style={[styles.statNumero, { color: colors.success }]}>
                {correctas}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="close-circle" size={20} color={colors.error} />
              <Text style={styles.statTexto}>Incorrectas</Text>
              <Text style={[styles.statNumero, { color: colors.error }]}>
                {incorrectas}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Bloque de comparación con el record ── */}
        <BloqueRecord
          esRecord={partida.esRecord}
          puntaje={partida.puntaje}
          puntajeRecord={partida.puntajeRecord}
          diferencia={partida.diferencia}
        />

        {/* ── Lista de respuestas ── */}
        <Text style={styles.seccionTitulo}>Respuestas</Text>

        {respuestas.length === 0 ? (
          <Text style={styles.textoVacio}>
            No hay respuestas registradas para esta partida.
          </Text>
        ) : (
          <View style={styles.respuestasList}>
            {respuestas.map((r, i) => (
              <FilaRespuesta key={String(r.id)} respuesta={r} numero={i + 1} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pantallaCentro: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  textoError: {
    color: colors.textMuted,
    fontSize: fontSizes.body,
    textAlign: "center",
  },
  btnVolver: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  btnVolverTexto: {
    color: "#fff",
    fontWeight: "600",
    fontSize: fontSizes.body,
  },

  // Header
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

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Resumen card
  resumenCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  resumenCabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconoWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoriaNombre: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: "700",
  },
  fecha: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
    marginTop: 2,
  },
  puntajeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  puntajeValor: {
    color: "#F5C518",
    fontSize: fontSizes.heading,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statTexto: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    flex: 1,
  },
  statNumero: {
    fontSize: fontSizes.body,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  // Respuestas
  seccionTitulo: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  respuestasList: {
    gap: spacing.sm,
  },
  textoVacio: {
    color: colors.textMuted,
    fontSize: fontSizes.body,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
