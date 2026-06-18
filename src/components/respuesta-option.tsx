import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Opcion } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Estado = "idle" | "correcta" | "incorrecta";

type Props = {
  opcion: Opcion;
  letra: string;
  estado: Estado;
  disabled: boolean;
  onPress: () => void;
};

export function RespuestaOption({
  opcion,
  letra,
  estado,
  disabled,
  onPress,
}: Props) {
  const esCorrecta = estado === "correcta";
  const esIncorrecta = estado === "incorrecta";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        esCorrecta && styles.correcta,
        esIncorrecta && styles.incorrecta,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.letraWrap,
          esCorrecta && styles.letraCorrecta,
          esIncorrecta && styles.letraIncorrecta,
        ]}
      >
        <Text style={styles.letra}>{letra}</Text>
      </View>
      <Text style={styles.texto}>{opcion.texto}</Text>
      {esCorrecta && (
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
      )}
      {esIncorrecta && (
        <Ionicons name="close-circle" size={22} color={colors.error} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  correcta: {
    borderColor: colors.success,
    backgroundColor: colors.success + "18",
  },
  incorrecta: {
    borderColor: colors.error,
    backgroundColor: colors.error + "16",
  },
  pressed: {
    opacity: 0.75,
  },
  letraWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  letraCorrecta: {
    backgroundColor: colors.success,
  },
  letraIncorrecta: {
    backgroundColor: colors.error,
  },
  letra: {
    color: colors.textPrimary,
    fontSize: fontSizes.label,
    fontWeight: "800",
  },
  texto: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: "600",
  },
});
