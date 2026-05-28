import { colors, fontSizes, radius, spacing } from '@/constants/theme'
import { supabase } from '@/utils/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function PerfilScreen() {
  const router = useRouter()

  async function handleCerrarSesion() {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <View style={styles.container}>

      {/* Acá van la foto, nombre, email y las cards — los agregamos después */}
      <View style={styles.contenido} />

      {/* Botón cerrar sesión */}
      <TouchableOpacity
        style={styles.btnCerrarSesion}
        onPress={handleCerrarSesion}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.btnTexto}>Cerrar sesión</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  contenido: {
    flex: 1,
  },
  btnCerrarSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.md,
    height: 54,
  },
  btnTexto: {
    color: colors.error,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
})