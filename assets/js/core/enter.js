/* Entradas animadas: cada página puede registrar su animación en ENTER[data-key] */
import { CONFIG } from '../config.js';
import { G, reduce } from './motion.js';

export const ENTER = {};

export function enter(p){
  const fn = ENTER[p.dataset.key] || (()=>{});
  if (!G || reduce) { fn(p); return; }
  // Revelación progresiva: los bloques [data-in] aparecen uno tras otro
  G.fromTo(p.querySelectorAll('[data-in]'),{y:22,opacity:0},{y:0,opacity:1,duration:CONFIG.enterDuration,stagger:CONFIG.enterStagger,delay:.25,ease:'back.out(1.6)',overwrite:true});
  fn(p);
}
