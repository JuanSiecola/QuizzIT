import { colors } from '@/constants/theme'
import { supabase } from '@/utils/supabase'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

// Este archivo decide a dónde va el usuario al abrir la app:
// - Si hay sesión activa → pantalla principal (tabs)
// - Si no hay sesión → login
export default function Index() {
  const [sesion, setSesion] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(!!session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(!!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Mientras verifica la sesión muestra un spinner
  if (sesion === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return sesion
    ? <Redirect href="/home" />
    : <Redirect href="/auth/login" />
}