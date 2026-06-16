import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { colors, fontSizes, spacing } from '@/constants/theme'
import { signIn } from '@/services/auth'
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

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Completá todos los campos')
      return
    }
    setCargando(true)
    try {
      await signIn(email, password)
      router.replace('/home')
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudo iniciar sesión')
    } finally {
      setCargando(false)
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
        <Logo />

        <View style={styles.form}>
          <Input
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            icon="lock-closed-outline"
            placeholder="Contraseña"
            secure
            value={password}
            onChangeText={setPassword}
          />

          <Button
            label="Iniciar sesión"
            onPress={handleLogin}
            loading={cargando}
            style={styles.btnPrimary}
          />

          <Button
            label="Registrarse"
            variant="outline"
            onPress={() => router.push('/auth/register')}
          />

          <TouchableOpacity
            onPress={() => { /* pantalla de recuperar contraseña */ }}
            style={styles.linkWrapper}
          >
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
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
  form: {
    gap: spacing.md,
  },
  btnPrimary: {
    marginTop: spacing.sm,
  },
  linkWrapper: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontSize: fontSizes.label,
  },
})