import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, spacing } from '../constants/theme'

// NOTA: el ícono "brain" es un placeholder.
// Para usar EXACTAMENTE el logo del boceto, exportalo como PNG/SVG,
// ponelo en assets/ y reemplazá el <MaterialCommunityIcons> por:
//   <Image source={require('../../assets/logo.png')} style={{ width: 90, height: 90 }} />

export function Logo() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="brain" size={80} color={colors.accent} />

      <Text style={styles.wordmark}>
        <Text style={styles.info}>Quizz</Text>
        <Text style={styles.trivia}>IT</Text>
      </Text>

      <Text style={styles.tagline}>
        Poné a prueba tus conocimientos de informática
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  wordmark: {
    fontSize: fontSizes.hero,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  info: {
    color: colors.textPrimary,
  },
  trivia: {
    color: colors.primary,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: fontSizes.label,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
})