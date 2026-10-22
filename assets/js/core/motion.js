/* Motor de animación: GSAP (cargado con <script defer> en index.html), modo sin movimiento y confeti diferido */
import { CONFIG } from '../config.js';
import { palette } from './dom.js';

export const G = window.gsap || null;
if (G && window.MotionPathPlugin) G.registerPlugin(window.MotionPathPlugin);

// Sin movimiento si: el sistema lo pide, CONFIG.motion = false, o la URL trae ?motion=off
const urlOff = new URLSearchParams(location.search).get('motion') === 'off';
export const reduce = !CONFIG.motion || urlOff || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce) document.documentElement.dataset.motion = 'off';
if (G) G.globalTimeline.timeScale(CONFIG.speed);

// canvas-confetti solo se descarga la primera vez que hay algo que celebrar
const CONFETTI_URL = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.module.mjs';
let confettiP = null;
const withConfetti = fn => {
  if (reduce) return;
  confettiP ||= import(CONFETTI_URL).then(m => m.default).catch(() => null);
  confettiP.then(fire => fire && fn(fire));
};

/* Celebración a pantalla completa: dos cañones desde las esquinas de abajo + estallido central.
   power escala la cantidad (0.3 = pequeño acierto, 1 = sello, 1.5 = gran final). */
export function boom({power=1, colors}={}){
  withConfetti(fire => {
    const base={scalar:1.7, ticks:320, gravity:.85, colors:colors||palette(), zIndex:50, shapes:['square','circle']};
    const n=Math.round(110*power);
    fire({...base, particleCount:n, angle:60,  spread:65, startVelocity:75, origin:{x:0, y:1}});
    fire({...base, particleCount:n, angle:120, spread:65, startVelocity:75, origin:{x:1, y:1}});
    fire({...base, particleCount:Math.round(n*.9), spread:180, startVelocity:42, origin:{x:.5, y:.4}, scalar:2});
  });
}

/* Lluvia de confeti desde todo el borde superior durante `ms` milisegundos */
export function rain(ms=1800){
  withConfetti(fire => {
    const end=performance.now()+ms, colors=palette();
    (function frame(){
      fire({particleCount:6, startVelocity:0, ticks:400, gravity:.7, scalar:1.9, drift:Math.random()-.5,
        origin:{x:Math.random(), y:-.05}, colors, shapes:['square','circle','star'], zIndex:50});
      if (performance.now()<end) requestAnimationFrame(frame);
    })();
  });
}
