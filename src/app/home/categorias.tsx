import { CategoriaCard } from '@/components/categoria-card';
import { colors, fontSizes, spacing } from '@/constants/theme';
import { getCategorias } from '@/services/categorias';
import { Categoria } from '@/types/database';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const data = await getCategorias();
        if (activo) setCategorias(data);
      } catch {
        if (activo) setError('No se pudieron cargar las categorías.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  function irADificultad(cat: Categoria) {
    router.push({
      pathname: '/home/dificultad/[categoriaId]',
      params: { categoriaId: String(cat.id) },
    });
  }

  if (cargando) {
    return (
      <View style={[styles.contenedor, styles.centro]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.contenedor, styles.centro]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Categorías</Text>
      <Text style={styles.subtitulo}>Elegí una categoría para jugar</Text>

      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}
        renderItem={({ item }) => (
          <CategoriaCard categoria={item} onPress={() => irADificultad(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  centro: { alignItems: 'center', justifyContent: 'center' },
  titulo: { color: colors.textPrimary, fontSize: fontSizes.heading, fontWeight: '800' },
  subtitulo: {
    color: colors.textMuted,
    fontSize: fontSizes.label,
    marginBottom: spacing.md,
  },
  error: { color: colors.textMuted, fontSize: fontSizes.body, textAlign: 'center' },
});
