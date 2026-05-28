import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { colors, fontSizes, radius, spacing } from '@/constants/theme'
import { supabase } from '@/utils/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function RegisterScreen() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleRegistro() {
    if (!nombre.trim() || !email || !password || !confirmar) {
      Alert.alert('Error', 'Completá todos los campos')
      return
    }
    if (password !== confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    setCargando(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    setCargando(false)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('¡Listo!', 'Cuenta creada correctamente.', [
        { text: 'Iniciar sesión', onPress: () => router.replace('/auth/login') },
      ])
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Ícono superior */}
        <View style={styles.iconWrapper}>
          <Ionicons name="person-add-outline" size={40} color={colors.primary} />
        </View>

        <Text style={styles.titulo}>Crear cuenta</Text>

        <View style={styles.form}>
          <Input
            label="Nombre"
            placeholder="Ingresá tu nombre"
            icon="person-outline"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            placeholder="Ingresá tu email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Contraseña"
            placeholder="Crea tu contraseña"
            icon="lock-closed-outline"
            secure
            value={password}
            onChangeText={setPassword}
          />
          <Input
            label="Confirmar contraseña"
            placeholder="Confirmá tu contraseña"
            icon="lock-closed-outline"
            secure
            value={confirmar}
            onChangeText={setConfirmar}
          />

          <Button
            label="Crear cuenta"
            onPress={handleRegistro}
            loading={cargando}
            style={styles.btnPrimary}
          />

          <TouchableOpacity
            onPress={() => router.replace('/auth/login')}
            style={styles.linkWrapper}
          >
            <Text style={styles.link}>
              ¿Ya tenés cuenta?{' '}
              <Text style={styles.linkBold}>Iniciá sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  iconWrapper: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: fontSizes.heading,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.sm,
  },
  btnPrimary: {
    marginTop: spacing.md,
  },
  linkWrapper: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  link: {
    color: colors.textSecondary,
    fontSize: fontSizes.label,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
})