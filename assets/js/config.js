/* ==========================================================
   CONFIGURACIÓN GLOBAL
   Único lugar para ajustar velocidad y animaciones del libro.
   ========================================================== */
export const CONFIG = {
  motion: true,         // false = libro sin animaciones (igual que prefers-reduced-motion)
  speed: 1,             // multiplica la velocidad de TODAS las animaciones GSAP (0.5 = más lento, 2 = más rápido)
  flipDuration: 0.9,    // segundos que tarda una hoja en girar
  enterDuration: 0.55,  // segundos de la entrada de cada bloque [data-in]
  enterStagger: 0.07,   // retraso entre un bloque y el siguiente
  storagePrefix: 'gran-viaje:' // en GitHub Pages todos tus repos comparten origen; el prefijo evita choques
};
