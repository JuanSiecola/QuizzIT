import { colors, fontSizes, radius, spacing } from "@/constants/theme";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PerfilData = {
  nombre: string;
  email: string;
  nivel: number;
  puntaje_total: number;
  partidas_jugadas: number;
};

// ─── StatRow ──────────────────────────────────────────────────────────────────
function StatRow({
  icono,
  label,
  valor,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
}) {
  return (
    <View style={statStyles.row}>
      <View style={statStyles.izquierda}>
        <Ionicons name={icono} size={20} color={colors.primary} />
        <Text style={statStyles.label}>{label}</Text>
      </View>
      <Text style={statStyles.valor}>{valor}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  izquierda: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  valor: {
    fontSize: fontSizes.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});


export default function PerfilScreen() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/auth/login");
          return;
        }

        // Datos del usuario — email viene directo de la tabla usuario
        const { data, error } = await supabase
          .from("usuario")
          .select("nombre, email, nivel, puntaje_total")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // Contar partidas jugadas desde la tabla partida
        const { count } = await supabase
          .from("partida")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id);

        if (activo) {
          setPerfil({
            nombre: data.nombre,
            email: data.email,
            nivel: data.nivel ?? 1,
            puntaje_total: data.puntaje_total ?? 0,
            partidas_jugadas: count ?? 0,
          });
        }
      } catch {
        Alert.alert("Error", "No se pudo cargar el perfil.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarPerfil();
    return () => {
      activo = false;
    };
  }, [router]);

  async function handleCerrarSesion() {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/auth/login");
        },
      },
    ]);
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const iniciales = perfil?.nombre
    ? perfil.nombre
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Título */}
      <Text style={styles.titulo}>Perfil</Text>

      {/* Avatar + nombre + email */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{iniciales}</Text>
        </View>
        <Text style={styles.nombre}>{perfil?.nombre ?? "—"}</Text>
        <Text style={styles.email}>{perfil?.email ?? "—"}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <StatRow
          icono="bar-chart-outline"
          label="Nivel"
          valor={String(perfil?.nivel ?? 1)}
        />
        <View style={styles.separador} />
        <StatRow
          icono="game-controller-outline"
          label="Partidas jugadas"
          valor={String(perfil?.partidas_jugadas ?? 0)}
        />
        <View style={styles.separador} />
        <StatRow
          icono="star-outline"
          label="Puntaje total"
          valor={`${(perfil?.puntaje_total ?? 0).toLocaleString("es-UY")} pts`}
        />
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity
        style={styles.btnCerrarSesion}
        onPress={handleCerrarSesion}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.btnTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  titulo: {
    fontSize: fontSizes.heading,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSizes.heading,
    fontWeight: "700",
    color: "#fff",
  },
  nombre: {
    fontSize: fontSizes.heading,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  separador: {
    height: 1,
    backgroundColor: colors.border,
  },
  btnCerrarSesion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.md,
    height: 54,
  },
  btnTexto: {
    color: colors.error,
    fontSize: fontSizes.body,
    fontWeight: "600",
  },
});
