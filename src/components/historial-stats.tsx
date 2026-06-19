import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  promedio: number;
  mejorRacha: number;
};

export function HistorialStats({ promedio, mejorRacha }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>
        Promedio: <Text style={styles.valor}>{promedio} pts</Text>
        <Text style={styles.separador}> · </Text>
        Mejor racha: <Text style={styles.valor}>{mejorRacha} correctas</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  texto: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    textAlign: "center",
  },
  valor: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  separador: {
    color: colors.textMuted,
  },
});
