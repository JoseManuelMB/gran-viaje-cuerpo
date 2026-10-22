/* ================= MOTOR DEL LIBRO =================
   Una sola hoja apaisada a la vez. Al avanzar, la hoja gira sobre el lomo y cae a la izquierda,
   sobre la página en blanco del libro abierto (ver book.css). Las páginas nunca se copian:
   se MUEVEN entre #store, el hueco y la hoja que gira, así cada juego conserva su estado al ir y volver. */
import { CONFIG } from '../config.js';
import { $, $$ } from './dom.js';
import { G, reduce } from './motion.js';
import { enter } from './enter.js';

export function initBook(){
  const pages=[...$$('#store .page')];
  const storeEl=$('#store'), slot=$('#slot'), leaf=$('#leaf'), leafF=$('#leafF'), book=$('#book');
  let cur=0, busy=false;
  const park=el=>storeEl.appendChild(el);
  const put=(face,el)=>face.insertBefore(el, face.querySelector('.shade'));

  // Flechas, contador, chips de navegación y libro abierto/cerrado (la portada lo cierra)
  function ui(){
    book.classList.toggle('open', cur>0);
    $('#prev').disabled = cur===0; $('#next').disabled = cur>=pages.length-1;
    $('#counter').textContent = `Página ${cur+1} de ${pages.length}`;
    const chip = +pages[cur].dataset.chip;
    $$('.chip').forEach(c=>c.classList.toggle('on', +c.dataset.go===chip));
    const on=$('.chip.on'); if(on) on.scrollIntoView({block:'nearest',inline:'center'});
  }

  // Gira la hoja 180° hacia la página "to"
  function flip(to){
    if (busy) return;
    to=Math.max(0,Math.min(pages.length-1,to));
    if (to===cur) return;
    const P0=pages[cur], P1=pages[to], fwd=to>cur;
    let start, end, done;
    // adelante: la hoja actual se levanta y se va; atrás: la anterior vuelve desde la izquierda
    if (fwd){ put(leafF,P0); slot.appendChild(P1); start=0; end=-180; done=()=>park(P0); }
    else { put(leafF,P1); start=-180; end=0; done=()=>{ park(P0); slot.appendChild(P1); }; }
    cur=to; busy=true;
    book.classList.toggle('open', cur>0);
    enter(P1);
    const finish=()=>{ done(); leaf.hidden=true; if(G) G.set(leaf,{clearProps:'transform'}); busy=false; ui(); };
    leaf.hidden=false;
    if (G && !reduce){
      const shades=leaf.querySelectorAll('.shade');
      G.set(leaf,{rotationY:start});
      G.fromTo(shades,{opacity:0},{opacity:.6,duration:CONFIG.flipDuration/2,yoyo:true,repeat:1,ease:'sine.inOut'});
      G.to(leaf,{rotationY:end,duration:CONFIG.flipDuration,ease:'power2.inOut',onComplete:finish});
    } else finish();
  }

  // ---- entradas: flechas, chips/índice, teclado y deslizar ----
  $('#next').onclick=()=>flip(cur+1);
  $('#prev').onclick=()=>flip(cur-1);
  document.addEventListener('click',e=>{ const g=e.target.closest('[data-go]'); if(g) flip(+g.dataset.go); });
  document.addEventListener('keydown',e=>{
    if (document.body.dataset.modal || e.target.closest?.('input,textarea,[role=slider],[role=tab]')) return;
    if (e.key==='ArrowRight') $('#next').click();
    if (e.key==='ArrowLeft') $('#prev').click();
  });
  let tx=null, ty=null;
  $('#stage').addEventListener('touchstart',e=>{ if(e.target.closest('input,button,summary,[data-noswipe]')){tx=null;return;} tx=e.touches[0].clientX; ty=e.touches[0].clientY; },{passive:true});
  $('#stage').addEventListener('touchend',e=>{
    if (tx===null) return;
    const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty; tx=null;
    if (Math.abs(dx)>60 && Math.abs(dy)<60) (dx<0?$('#next'):$('#prev')).click();
  },{passive:true});

  slot.appendChild(pages[0]);
  enter(pages[0]);
  ui();
}
