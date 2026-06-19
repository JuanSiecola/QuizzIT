import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { Filter } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type FiltroFecha = "todas" | "7dias" | "30dias" | "mes";
export type OrdenHistorial =
  | "recientes"
  | "antiguas"
  | "mayor_puntaje"
  | "menor_puntaje";

export type CategoriaFiltro = {
  id: number;
  nombre: string;
};

type Props = {
  categorias: CategoriaFiltro[];
  categoriaSeleccionada: number | null; // null = todas
  onCambiarCategoria: (categoriaId: number | null) => void;
  filtroFecha: FiltroFecha;
  onCambiarFecha: (filtro: FiltroFecha) => void;
  orden: OrdenHistorial;
  onCambiarOrden: (orden: OrdenHistorial) => void;
};

const OPCIONES_FECHA: { value: FiltroFecha; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "7dias", label: "Últimos 7 días" },
  { value: "30dias", label: "Últimos 30 días" },
  { value: "mes", label: "Este mes" },
];

const OPCIONES_ORDEN: { value: OrdenHistorial; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "antiguas", label: "Más antiguas" },
  { value: "mayor_puntaje", label: "Mayor puntaje" },
  { value: "menor_puntaje", label: "Menor puntaje" },
];

function Chip({
  label,
  activo,
  onPress,
}: {
  label: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        activo && styles.chipActivo,
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function HistorialFiltros({
  categorias,
  categoriaSeleccionada,
  onCambiarCategoria,
  filtroFecha,
  onCambiarFecha,
  orden,
  onCambiarOrden,
}: Props) {
  return (
    <View style={styles.contenedor}>
      {/* Categoría */}
      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <Filter size={13} color={colors.textMuted} />
          <Text style={styles.seccionTitulo}>Categoría</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsFila}
        >
          <Chip
            label="Todas"
            activo={categoriaSeleccionada === null}
            onPress={() => onCambiarCategoria(null)}
          />
          {categorias.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.nombre}
              activo={categoriaSeleccionada === cat.id}
              onPress={() => onCambiarCategoria(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Fecha */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Fecha</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsFila}
        >
          {OPCIONES_FECHA.map((op) => (
            <Chip
              key={op.value}
              label={op.label}
              activo={filtroFecha === op.value}
              onPress={() => onCambiarFecha(op.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Orden / resultado */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Ordenar por</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsFila}
        >
          {OPCIONES_ORDEN.map((op) => (
            <Chip
              key={op.value}
              label={op.label}
              activo={orden === op.value}
              onPress={() => onCambiarOrden(op.value)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  seccion: {
    gap: 6,
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seccionTitulo: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  chipsFila: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "22",
  },
  chipTexto: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    fontWeight: "600",
  },
  chipTextoActivo: {
    color: colors.primary,
  },
});
