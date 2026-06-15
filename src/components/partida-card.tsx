import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { PartidaItemHistorial } from "@/services/partidas";
import {
    Boxes,
    Brain,
    Code2,
    Database,
    HelpCircle,
    LucideIcon,
    Monitor,
    Network,
    Server,
    ShieldCheck,
} from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

type Props = {
  partida: PartidaItemHistorial;
  onVerDetalle: () => void;
};

export function PartidaCard({ partida, onVerDetalle }: Props) {
  const cat = partida.categoria;
  const color = cat?.color ?? colors.primary;
  const Icono = ICONOS[cat?.icono ?? ""] ?? HelpCircle;

  return (
    <View style={styles.card}>
      <View style={styles.izquierda}>
        <View style={[styles.iconoWrap, { backgroundColor: color + "22" }]}>
          <Icono size={20} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.nombre}>{cat?.nombre ?? "Categoría"}</Text>
          <Text style={styles.fecha}>
            {formatearFecha(partida.fecha_inicio)}
          </Text>
          <Text style={styles.puntaje}>
            Puntaje:{" "}
            <Text style={styles.puntajeValor}>{partida.puntaje} pts</Text>
          </Text>
          <View style={styles.estadoBadge}>
            <Text style={styles.estadoTexto}>
              {partida.fecha_fin ? "Finalizada" : "En curso"}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.btnDetalle,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onVerDetalle}
      >
        <Text style={styles.btnDetalleTexto}>Ver detalle</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  izquierda: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    flex: 1,
  },
  iconoWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nombre: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: "700",
  },
  fecha: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
  },
  puntaje: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    marginTop: 2,
  },
  puntajeValor: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  estadoBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.success + "22",
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  estadoTexto: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "600",
  },
  btnDetalle: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  btnDetalleTexto: {
    color: "#fff",
    fontSize: fontSizes.small,
    fontWeight: "600",
  },
});
