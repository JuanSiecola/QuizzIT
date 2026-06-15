import { PartidaCard } from "@/components/partida-card";
import { colors, fontSizes, spacing } from "@/constants/theme";
import { getPartidasByUser, PartidaItemHistorial } from "@/services/partidas";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function HistorialScreen() {
  const [partidas, setPartidas] = useState<PartidaItemHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/auth/login");
          return;
        }

        const data = await getPartidasByUser(user.id);
        if (activo) setPartidas(data);
      } catch {
        if (activo) setError("No se pudo cargar el historial.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <View style={[styles.contenedor, styles.centro]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.contenedor, styles.centro]}>
        <Text style={styles.textoVacio}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Historial</Text>

      <FlatList
        data={partidas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centro}>
            <Text style={styles.textoVacio}>
              Todavía no jugaste ninguna partida.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PartidaCard
            partida={item}
            onVerDetalle={() =>
              router.push({
                pathname: "/home/detalle-partida/[id]",
                params: { id: String(item.id) },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: fontSizes.heading,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  lista: {
    paddingBottom: spacing.xl,
  },
  textoVacio: {
    color: colors.textMuted,
    fontSize: fontSizes.body,
    textAlign: "center",
  },
});
