import { colors, radius } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  duracionMs: number;
  // cambia cada vez que arranca una pregunta nueva, fuerza el reinicio del timer
  resetKey: number | string;
  pausado?: boolean;
  onTerminar: () => void;
};

const COLOR_NORMAL = colors.success;
const COLOR_PENALIZACION = "#F5C518"; // mismo amarillo que el badge de récord
const COLOR_URGENTE = colors.error;

const INTERVALO_TICK_MS = 100;

function colorPorProgreso(progreso: number): string {
  if (progreso <= 0.25) return COLOR_URGENTE;
  if (progreso <= 0.5) return COLOR_PENALIZACION;
  return COLOR_NORMAL;
}

export function TimerBar({
  duracionMs,
  resetKey,
  pausado = false,
  onTerminar,
}: Props) {
  // progreso: 1 = tiempo completo restante, 0 = se acabó
  const [progreso, setProgreso] = useState(1);
  const inicioRef = useRef(Date.now());
  const restanteAlPausarRef = useRef(duracionMs);
  const terminadoRef = useRef(false);

  // reinicia el timer cada vez que cambia la pregunta (resetKey) o su duración
  useEffect(() => {
    setProgreso(1);
    inicioRef.current = Date.now();
    restanteAlPausarRef.current = duracionMs;
    terminadoRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, duracionMs]);

  useEffect(() => {
    if (pausado || terminadoRef.current) return;

    inicioRef.current = Date.now();
    const duracionRestante = restanteAlPausarRef.current;

    const intervalo = setInterval(() => {
      const transcurrido = Date.now() - inicioRef.current;
      const restante = Math.max(0, duracionRestante - transcurrido);
      const nuevoProgreso =
        duracionRestante > 0 ? restante / duracionRestante : 0;

      setProgreso(nuevoProgreso);

      if (restante <= 0 && !terminadoRef.current) {
        terminadoRef.current = true;
        clearInterval(intervalo);
        onTerminar();
      }
    }, INTERVALO_TICK_MS);

    return () => {
      clearInterval(intervalo);
      // al pausar (o desmontar), guardamos cuánto tiempo quedaba para retomar si se reanuda
      const transcurrido = Date.now() - inicioRef.current;
      restanteAlPausarRef.current = Math.max(
        0,
        duracionRestante - transcurrido,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pausado, resetKey]);

  const segundosRestantes = Math.max(
    0,
    Math.ceil((progreso * duracionMs) / 1000),
  );
  const color = colorPorProgreso(progreso);
  const porcentaje = Math.max(0, Math.min(1, progreso)) * 100;

  return (
    <View style={styles.contenedor}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${porcentaje}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.tiempoTexto, { color }]}>{segundosRestantes}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  tiempoTexto: {
    minWidth: 30,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
