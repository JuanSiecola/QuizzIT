import { Button } from '@/components/ui/button';
import { DificultadOption } from '@/components/dificultad-option';
import { colors, fontSizes, spacing } from '@/constants/theme';
import { getCategoriaById } from '@/services/categorias';
import { crearPartida } from '@/services/partidas';
import { Categoria, DificultadEnum } from '@/types/database';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

const OPCIONES: { valor: DificultadEnum; titulo: string; subtitulo: string }[] = [
  { valor: 'facil', titulo: 'Fácil', subtitulo: 'Preguntas básicas' },
  { valor: 'intermedio', titulo: 'Media', subtitulo: 'Nivel intermedio' },
  { valor: 'dificil', titulo: 'Difícil', subtitulo: 'Nivel avanzado' },
];

export default function DificultadScreen() {
  const { categoriaId } = useLocalSearchParams<{ categoriaId: string }>();
  const catId = Number(categoriaId);

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [dificultad, setDificultad] = useState<DificultadEnum>('intermedio');
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const data = await getCategoriaById(catId);
        if (activo) setCategoria(data);
      } catch {
        if (activo) Alert.alert('Error', 'No se pudo cargar la categoría.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [catId]);

  async function comenzarPartida() {
    if (creando) return;
    setCreando(true);
    try {
      const partida = await crearPartida(catId, dificultad);
      router.push({
        pathname: '/partida/[id]',
        params: { id: String(partida.id) },
      });
    } catch {
      Alert.alert('Error', 'No se pudo crear la partida. Probá de nuevo.');
    } finally {
      setCreando(false);
    }
  }

  if (cargando) {
    return (
      <View style={[styles.contenedor, styles.centro]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.nombre}>{categoria?.nombre}</Text>
      {!!categoria?.descripcion && (
        <Text style={styles.descripcion}>{categoria.descripcion}</Text>
      )}

      <Text style={styles.label}>Elegí dificultad</Text>
      {OPCIONES.map((op) => (
        <DificultadOption
          key={op.valor}
          titulo={op.titulo}
          subtitulo={op.subtitulo}
          seleccionada={dificultad === op.valor}
          onPress={() => setDificultad(op.valor)}
        />
      ))}

      <View style={styles.botonWrap}>
        <Button
          label="Comenzar partida"
          onPress={comenzarPartida}
          loading={creando}
          disabled={creando}
        />
      </View>
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
  nombre: {
    color: colors.textPrimary,
    fontSize: fontSizes.heading,
    fontWeight: '800',
    textAlign: 'center',
  },
  descripcion: {
    color: colors.textMuted,
    fontSize: fontSizes.label,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  botonWrap: { marginTop: spacing.lg },
});
