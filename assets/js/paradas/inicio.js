/* Portada: el título se revela palabra por palabra y las formas flotan */
import { G, reduce } from '../core/motion.js';
import { ENTER } from '../core/enter.js';

export function init(){
  ENTER.cover=p=>{
    if (!G||reduce) return;
    G.fromTo(p.querySelectorAll('#coverTitle span'),{y:60,opacity:0,rotation:-8},{y:0,opacity:1,rotation:0,duration:.8,stagger:.08,delay:.3,ease:'back.out(2)'});
    p.querySelectorAll('.fl').forEach((c,i)=>{ G.killTweensOf(c); G.to(c,{y:'random(-18,18)',x:'random(-12,12)',duration:'random(2.5,4)',repeat:-1,yoyo:true,ease:'sine.inOut',delay:i*.1}); });
  };
}
