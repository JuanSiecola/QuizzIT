import { colors, fontSizes, radius, spacing } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  titulo: string;
  subtitulo: string;
  seleccionada: boolean;
  onPress: () => void;
};

export function DificultadOption({ titulo, subtitulo, seleccionada, onPress }: Props) {
  return (
    <Pressable
      style={[styles.row, seleccionada && styles.rowActiva]}
      onPress={onPress}
    >
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>
      <View style={[styles.radio, seleccionada && styles.radioActivo]}>
        {seleccionada && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowActiva: { borderColor: colors.primary },
  textos: { flex: 1 },
  titulo: { color: colors.textPrimary, fontSize: fontSizes.body, fontWeight: '700' },
  subtitulo: { color: colors.textMuted, fontSize: fontSizes.label, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActivo: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
