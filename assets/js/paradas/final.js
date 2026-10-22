/* Fin del viaje: sellos ganados, celebración y contraportada */
import { $ } from '../core/dom.js';
import { G, reduce, boom, rain } from '../core/motion.js';
import { ENTER } from '../core/enter.js';
import { stamps, paintStamps } from '../core/stamps.js';

export function init(){
  $('#party').onclick=()=>{ boom({power:1.5}); rain(2200); setTimeout(()=>boom({power:.8}),700); };
  ENTER.end=p=>{ paintStamps(); if(G&&!reduce) G.fromTo(p.querySelectorAll('.bigstamps .stamp.on'),{scale:2.2,opacity:0,rotation:-50},{scale:1,opacity:1,rotation:-10,duration:.7,stagger:.18,delay:.6,ease:'back.out(2)'}); if(stamps.length===5) setTimeout(()=>$('#party').click(),1200); };
  ENTER.back=p=>{ if(G&&!reduce) p.querySelectorAll('.fl').forEach(c=>{G.killTweensOf(c);G.to(c,{y:'random(-16,16)',duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'});}); };
}
