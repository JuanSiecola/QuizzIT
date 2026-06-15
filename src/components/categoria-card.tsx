import { colors, fontSizes, radius, spacing } from '@/constants/theme';
import { Categoria } from '@/types/database';
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
} from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

type Props = {
  categoria: Categoria;
  onPress: () => void;
};

export function CategoriaCard({ categoria, onPress }: Props) {
  const Icono = ICONOS[categoria.icono ?? ''] ?? HelpCircle;
  const color = categoria.color ?? colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconoWrap, { backgroundColor: color + '22' }]}>
        <Icono size={22} color={color} />
      </View>
      <Text style={styles.nombre} numberOfLines={2}>
        {categoria.nombre}
      </Text>
      <Text style={styles.preguntas}>
        {categoria.cantidad_preguntas ?? 0} preguntas
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: { opacity: 0.7 },
  iconoWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  nombre: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  preguntas: {
    color: colors.textMuted,
    fontSize: fontSizes.label,
  },
});
