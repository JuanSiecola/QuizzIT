import { Button } from "@/components/ui/button";
import {
    colors,
    fontSizes,
    fontWeights,
    radius,
    spacing,
} from "@/constants/theme";
import { finalizarPartida } from "@/services/partidas";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

export default function ResultadoFinalScreen() {
  const router = useRouter();
  const { partidaId, puntaje, correctas, incorrectas } = useLocalSearchParams<{
    partidaId: string;
    puntaje: string;
    correctas: string;
    incorrectas: string;
  }>();

  const [guardando, setGuardando] = useState(true);
  const yaGuardo = useRef(false); // ⚠️ evita doble escritura si la pantalla se remonta

  useEffect(() => {
    if (yaGuardo.current) return;
    yaGuardo.current = true;

    async function cerrarPartida() {
      try {
        await finalizarPartida(Number(partidaId), { puntaje: Number(puntaje) });
      } catch {
        Alert.alert("Error", "No se pudo guardar la partida.");
      } finally {
        setGuardando(false);
      }
    }

    cerrarPartida();
  }, [partidaId, puntaje]);

  if (guardando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.guardandoText}>Guardando resultados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Trofeo + título */}
      <View style={styles.topSection}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.titulo}>Partida finalizada</Text>
        <Text style={styles.subtitulo}>¡Buen trabajo!</Text>
      </View>

      {/* Puntaje */}
      <View style={styles.puntajeContainer}>
        <Text style={styles.puntajeLabel}>Puntaje obtenido</Text>
        <Text style={styles.puntajeValor}>{puntaje} pts</Text>
      </View>

      {/* Correctas / Incorrectas */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Correctas</Text>
          <View style={styles.statBadge}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={[styles.statValor, { color: colors.success }]}>
              {correctas ?? "—"}
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Incorrectas</Text>
          <View style={styles.statBadge}>
            <Text style={styles.crossIcon}>✗</Text>
            <Text style={[styles.statValor, { color: colors.error }]}>
              {incorrectas ?? "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones */}
      <View style={styles.botonesContainer}>
        <Button
          label="Volver al inicio"
          onPress={() => router.replace("/home")}
        />
        <Button
          label="Jugar otra vez"
          variant="outline"
          onPress={() => router.replace("/home/categorias")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  guardandoText: {
    color: colors.textSecondary,
    fontSize: fontSizes.body,
  },
  topSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  trophy: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  puntajeContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  puntajeLabel: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  puntajeValor: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.bold,
    color: colors.success,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  separador: {
    height: 1,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  checkIcon: {
    fontSize: fontSizes.body,
    color: colors.success,
    fontWeight: fontWeights.bold,
  },
  crossIcon: {
    fontSize: fontSizes.body,
    color: colors.error,
    fontWeight: fontWeights.bold,
  },
  statValor: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  botonesContainer: {
    gap: spacing.md,
    marginTop: "auto",
  },
});
