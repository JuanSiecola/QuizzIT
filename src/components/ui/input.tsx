import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native'
import { colors, fontSizes, radius, spacing } from '../../constants/theme'

type Props = TextInputProps & {
  label?: string
  icon?: keyof typeof Ionicons.glyphMap
  secure?: boolean
}

export function Input({ label, icon, secure = false, ...props }: Props) {
  const [hidden, setHidden] = useState(secure)

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.field}>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={colors.textMuted}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          {...props}
        />

        {secure ? (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSizes.label,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 54,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
  },
})