import { colors, fontSizes, radius, spacing } from '@/constants/theme'
import { supabase } from '@/utils/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

type Perfil = {
  nombre: string
  nivel: number
  puntaje_total: number
}

// ─── Componente: fila de acceso rápido ───────────────────────────────────────
function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.menuIconWrapper}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { data } = await supabase
        .from('usuario')
        .select('nombre, nivel, puntaje_total')
        .eq('id', user.id)
        .single()

      setPerfil(data)
      setCargando(false)
    }

    cargarPerfil()
  }, [router])

  if (cargando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={12}>
          <Ionicons name="menu-outline" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={12}>
          <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Saludo ── */}
      <Text style={styles.saludo}>
        ¡Hola, {perfil?.nombre ?? 'Jugador'}! 👋
      </Text>

      {/* ── Card de stats ── */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statEtiqueta}>Nivel actual</Text>
          <View style={styles.nivelCirculo}>
            <Text style={styles.nivelNumero}>{perfil?.nivel ?? 1}</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statEtiqueta}>Puntaje total</Text>
          <Text style={styles.puntaje}>
            {(perfil?.puntaje_total ?? 0).toLocaleString('es-UY')} pts
          </Text>
        </View>
      </View>

      {/* ── Botón jugar ── */}
      <TouchableOpacity
        style={styles.btnJugar}
        activeOpacity={0.85}
        onPress={() => router.push('/home/categorias')}
      >
        <Ionicons name="play" size={22} color="#fff" style={{ marginRight: spacing.sm }} />
        <Text style={styles.btnJugarTexto}>Jugar trivia</Text>
      </TouchableOpacity>

      {/* ── Accesos rápidos ── */}
      <View style={styles.menu}>
        <MenuRow
          icon="grid-outline"
          label="Ver categorías"
          onPress={() => router.push('/home/categorias')}
        />
        <MenuRow
          icon="time-outline"
          label="Historial de partidas"
          onPress={() => router.push('/home/historial')}
        />
        <MenuRow
          icon="person-outline"
          label="Perfil"
          onPress={() => router.push('/home/perfil')}
        />
      </View>
    </ScrollView>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  // Saludo
  saludo: {
    color: colors.textPrimary,
    fontSize: fontSizes.heading,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },

  // Stats card
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statEtiqueta: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    fontWeight: '500',
  },
  nivelCirculo: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nivelNumero: {
    color: '#fff',
    fontSize: fontSizes.heading,
    fontWeight: '700',
  },
  puntaje: {
    color: colors.success,
    fontSize: fontSizes.heading,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  // Botón jugar
  btnJugar: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  btnJugarTexto: {
    color: '#fff',
    fontSize: fontSizes.body,
    fontWeight: '700',
  },

  // Menú
  menu: {
    gap: spacing.sm,
  },
  menuRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: '500',
  },
})
