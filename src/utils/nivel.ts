// src/utils/nivel.ts
export const K_NIVEL = 150;

export function progresoNivel(nivel: number, puntajeTotal: number) {
  const umbralActual = K_NIVEL * (nivel - 1) ** 2; // puntos al empezar este nivel
  const umbralSiguiente = K_NIVEL * nivel ** 2; // puntos para el siguiente
  const rango = umbralSiguiente - umbralActual;
  const enNivel = Math.max(0, puntajeTotal - umbralActual);

  return {
    umbralSiguiente,
    progreso: rango > 0 ? Math.min(1, enNivel / rango) : 0,
    faltan: Math.max(0, umbralSiguiente - puntajeTotal), // puntos para subir
  };
}
