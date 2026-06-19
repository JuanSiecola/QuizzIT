import {
  HistorialFiltros,
  type CategoriaFiltro,
  type FiltroFecha,
  type OrdenHistorial,
} from "@/components/historial-filtros";
import { HistorialStats } from "@/components/historial-stats";
import { PartidaCard } from "@/components/partida-card";
import { colors, fontSizes, spacing } from "@/constants/theme";
import { getPartidasByUser, PartidaItemHistorial } from "@/services/partidas";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

function inicioDeRango(filtro: FiltroFecha): Date | null {
  const ahora = new Date();
  switch (filtro) {
    case "7dias": {
      const d = new Date(ahora);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "30dias": {
      const d = new Date(ahora);
      d.setDate(d.getDate() - 30);
      return d;
    }
    case "mes":
      return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    case "todas":
    default:
      return null;
  }
}

export default function HistorialScreen() {
  const [partidas, setPartidas] = useState<PartidaItemHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    number | null
  >(null);
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>("todas");
  const [orden, setOrden] = useState<OrdenHistorial>("recientes");

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

  // categorías presentes en el historial del usuario (para el filtro)
  const categoriasDisponibles = useMemo<CategoriaFiltro[]>(() => {
    const mapa = new Map<number, string>();
    for (const p of partidas) {
      if (p.categoria_id != null && p.categoria?.nombre) {
        mapa.set(p.categoria_id, p.categoria.nombre);
      }
    }
    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [partidas]);

  const partidasFiltradas = useMemo(() => {
    const desde = inicioDeRango(filtroFecha);

    let resultado = partidas.filter((p) => {
      if (
        categoriaSeleccionada !== null &&
        p.categoria_id !== categoriaSeleccionada
      ) {
        return false;
      }
      if (desde && new Date(p.fecha_inicio) < desde) {
        return false;
      }
      return true;
    });

    resultado = [...resultado].sort((a, b) => {
      switch (orden) {
        case "mayor_puntaje":
          return b.puntaje - a.puntaje;
        case "menor_puntaje":
          return a.puntaje - b.puntaje;
        case "antiguas":
          return (
            new Date(a.fecha_inicio).getTime() -
            new Date(b.fecha_inicio).getTime()
          );
        case "recientes":
        default:
          return (
            new Date(b.fecha_inicio).getTime() -
            new Date(a.fecha_inicio).getTime()
          );
      }
    });

    return resultado;
  }, [partidas, categoriaSeleccionada, filtroFecha, orden]);

  // estadística rápida: se calcula sobre las partidas ya filtradas,
  // así el resumen acompaña lo que el usuario está viendo.
  const stats = useMemo(() => {
    if (partidasFiltradas.length === 0) {
      return { promedio: 0, mejorRacha: 0 };
    }
    const sumaPuntajes = partidasFiltradas.reduce(
      (acc, p) => acc + p.puntaje,
      0,
    );
    const promedio = Math.round(sumaPuntajes / partidasFiltradas.length);
    const mejorRacha = Math.max(
      0,
      ...partidasFiltradas.map((p) => p.mejorRachaPartida),
    );
    return { promedio, mejorRacha };
  }, [partidasFiltradas]);

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
        data={partidasFiltradas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          partidas.length > 0 ? (
            <>
              <HistorialStats
                promedio={stats.promedio}
                mejorRacha={stats.mejorRacha}
              />
              <HistorialFiltros
                categorias={categoriasDisponibles}
                categoriaSeleccionada={categoriaSeleccionada}
                onCambiarCategoria={setCategoriaSeleccionada}
                filtroFecha={filtroFecha}
                onCambiarFecha={setFiltroFecha}
                orden={orden}
                onCambiarOrden={setOrden}
              />
            </>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centro}>
            <Text style={styles.textoVacio}>
              {partidas.length === 0
                ? "Todavía no jugaste ninguna partida."
                : "No hay partidas que coincidan con estos filtros."}
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
    paddingTop: spacing.xl,
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
