/* Toast y sellos (se guardan en localStorage) */
import { $, $$, store } from './dom.js';
import { G, boom } from './motion.js';

export function toast(msg){
  const t=$('#toast'); t.textContent=msg;
  if (G){ G.killTweensOf(t); G.fromTo(t,{opacity:0,y:20},{opacity:1,y:0,duration:.35,ease:'back.out(2)'}); G.to(t,{opacity:0,y:10,delay:2.4,duration:.3}); }
  else { t.style.opacity=1; setTimeout(()=>t.style.opacity=0,2400); }
}

export const stamps = store.get('stamps',[]);

export function paintStamps(){
  $$('[data-stamp]').forEach(s=>s.classList.toggle('on', stamps.includes(+s.dataset.stamp)));
  const miss=[1,2,3,4,5].filter(n=>!stamps.includes(n));
  $('#missing').textContent = miss.length ? `Te falta el sello de la parada ${miss.join(', ')}. ¡Regresa a jugar!` : '¡Tienes todos los sellos!';
}

export function earn(n){
  if (stamps.includes(n)) return;
  stamps.push(n); store.set('stamps',stamps); paintStamps();
  const el=document.querySelector(`.top [data-stamp="${n}"]`);
  if (G) G.fromTo(el,{scale:2.4,rotation:-60},{scale:1,rotation:-10,duration:.7,ease:'elastic.out(1,.45)'});
  boom({power:1});
  toast(stamps.length===5 ? '¡Completaste los 5 sellos!' : `¡Ganaste el sello ${n}!`);
}
