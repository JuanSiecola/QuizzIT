// src/components/NivelRing.tsx
import { colors } from "@/constants/theme";
import { progresoNivel } from "@/utils/nivel";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  nivel: number;
  puntajeTotal: number;
  size?: number;
  strokeWidth?: number;
};

export function NivelRing({
  nivel,
  puntajeTotal,
  size = 64,
  strokeWidth = 5,
}: Props) {
  const { progreso } = progresoNivel(nivel, puntajeTotal);

  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - progreso); // cuánto del anillo queda "vacío"

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* pista de fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* progreso */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // arranca arriba, no a la derecha
        />
      </Svg>
      <Text style={styles.numero}>{nivel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  numero: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
});
