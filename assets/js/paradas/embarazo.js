/* Parada 3 · El embarazo: línea de 9 meses reactiva + bebé que cambia de etapa, crece y se voltea */
import { $, $$ } from '../core/dom.js';
import { G, reduce } from '../core/motion.js';
import { ENTER } from '../core/enter.js';
import { earn } from '../core/stamps.js';
import { STEPS, CELLS } from '../data/embarazo-pasos.js';

// e = emoji, n = fruta, cm = tamaño, f = dato del mes
// st = etapa del dibujo (A embrión, B feto temprano, C feto), s = escala, rot = giro (de cabeza al final)
const MONTHS=[
  {e:'🌱',n:'una semillita',cm:.4, st:'A',s:.13,rot:0,  f:'Es apenas un puntito. Ya se está formando su corazón.'},
  {e:'🍇',n:'una uva',     cm:1.6, st:'A',s:.28,rot:0,  f:'Su corazón ya late, ¡y muy rápido! Le salen bracitos y piernitas.'},
  {e:'🍋',n:'un limón',    cm:6,   st:'B',s:.36,rot:0,  f:'Ya tiene deditos en las manos y en los pies. Hasta uñas chiquitas.'},
  {e:'🥑',n:'un aguacate', cm:12,  st:'B',s:.48,rot:0,  f:'Puede chuparse el dedo y hacer caritas.'},
  {e:'🍌',n:'un plátano',  cm:25,  st:'C',s:.56,rot:0,  f:'Mamá empieza a sentir sus pataditas. ¡Le encanta moverse!'},
  {e:'🌽',n:'un elote',    cm:30,  st:'C',s:.66,rot:0,  f:'Ya oye sonidos de afuera, como la voz de mamá y papá.'},
  {e:'🥥',n:'un coco',     cm:37,  st:'C',s:.77,rot:10, f:'Abre y cierra los ojos, y tiene ratos para dormir y para despertar.'},
  {e:'🍍',n:'una piña',    cm:42,  st:'C',s:.88,rot:150,f:'Sigue creciendo y se acomoda de cabeza, listo para salir.'},
  {e:'🍉',n:'una sandía',  cm:50,  st:'C',s:1,  rot:165,f:'¡Listo para nacer! Pesa unos 3 kilos. Nace por la vagina o con una operación llamada cesárea.'}
];

/* ---------- Dibujos del bebé (coordenadas locales; el ombligo es donde llega el cordón) ----------
   Estilo "calcomanía": cada capa del cuerpo se dibuja con <use> primero gruesa y oscura (solo asoma
   el contorno exterior), encima con el color de piel y al final con la luz y sombra de #gSkin.
   Así las piezas se funden en una sola silueta suave, sin rayas entre ellas. Los detalles (cara, deditos…) van encima. */
const layers=(k,list)=>list.map((shapes,j)=>`<defs><g id="feto${k}${j}">${shapes}</g></defs>
  <use href="#feto${k}${j}" fill="var(--skin-line)" stroke="var(--skin-line)" stroke-width="7" stroke-linejoin="round"/>
  <use href="#feto${k}${j}" fill="var(--skin)"/>
  <use href="#feto${k}${j}" fill="url(#gSkin)"/>`).join('');
const LINE='fill="none" stroke="var(--skin-line)" stroke-linecap="round"';
const SHINE=(x,y,rx,ry,r)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="#fff" opacity=".4"/>`;
const BLUSH=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="var(--c1)" opacity=".25"/>`;
const HEART=(x,y,k)=>`<path class="heart" transform="translate(${x} ${y}) scale(${k})" d="M0 6 C-8 0 -8 -7 -3.5 -7 C-1.5 -7 0 -5.5 0 -4 C0 -5.5 1.5 -7 3.5 -7 C8 -7 8 0 0 6 Z" fill="var(--c1)"/>`;
const STAGES={
  // Embrión: forma de "C" con cabeza grande, ojito oscuro y yemas de bracitos y piernitas
  A:{navel:[0,30], svg:layers('A',[`
    <path d="M-10 -72 C40 -82 72 -42 56 0 C46 30 30 56 6 70 C-10 80 -28 72 -22 60 C-2 50 10 34 12 14 C14 -8 -10 -14 -30 -24 C-52 -38 -42 -68 -10 -72 Z"/>
    <ellipse cx="-4" cy="10" rx="10" ry="6"/>
    <ellipse cx="18" cy="46" rx="11" ry="6" transform="rotate(-30 18 46)"/>`])+`
    <path d="M34 -40 C54 -18 52 20 32 50" ${LINE} stroke-width="6" stroke-dasharray="1 8" opacity=".35"/>
    ${SHINE(-8,-60,16,7,-12)}
    <circle cx="-18" cy="-46" r="7" fill="var(--ink)" opacity=".7"/><circle cx="-20" cy="-48" r="2.2" fill="#fff" opacity=".85"/>
    ${HEART(-8,-12,1.6)}`},
  // Feto temprano: cabeza muy grande, cuerpo delgado, ojos todavía cerrados
  B:{navel:[-10,34], svg:layers('B',[`
    <circle cx="-6" cy="-32" r="44"/>
    <ellipse cx="16" cy="30" rx="28" ry="38" transform="rotate(-14 16 30)"/>
    <ellipse cx="0" cy="62" rx="24" ry="11" transform="rotate(18 0 62)"/>
    <ellipse cx="-18" cy="74" rx="16" ry="8.5" transform="rotate(70 -18 74)"/>
    <ellipse cx="-8" cy="88" rx="11" ry="6"/>`,`
    <ellipse cx="-18" cy="8" rx="17" ry="8" transform="rotate(25 -18 8)"/>
    <circle cx="-33" cy="2" r="7"/>`])+`
    ${SHINE(-22,-58,16,8,-25)}
    <circle cx="-26" cy="-31" r="6" fill="var(--ink)" opacity=".18"/>
    <path d="M-34 -33 q8 6 16 0" ${LINE} stroke-width="3"/>
    <path d="M10 -40 q9 4 2 13" ${LINE} stroke-width="2.5" opacity=".7"/>
    ${BLUSH(-30,-16,7)}
    <path d="M-45 -8 q5 3.5 10 0" fill="none" stroke="var(--c1)" stroke-width="2.5" stroke-linecap="round"/>
    ${HEART(8,22,1.2)}`},
  // Feto: hecho bolita, con la mano junto a la cara, rodillas dobladas, pelito, oreja y cachetes
  C:{navel:[-14,30], svg:layers('C',[`
    <ellipse cx="14" cy="20" rx="40" ry="50" transform="rotate(-15 14 20)"/>
    <ellipse cx="-8" cy="54" rx="34" ry="16" transform="rotate(16 -8 54)"/>
    <ellipse cx="-32" cy="68" rx="22" ry="10.5" transform="rotate(68 -32 68)"/>
    <ellipse cx="-16" cy="90" rx="15" ry="8" transform="rotate(-8 -16 90)"/>
    <circle cx="-12" cy="-40" r="40"/>`,`
    <ellipse cx="-22" cy="2" rx="22" ry="10" transform="rotate(22 -22 2)"/>
    <circle cx="-44" cy="-8" r="10"/>`])+`
    <path d="M52 -6 C60 24 50 58 24 72" ${LINE} stroke-width="9" opacity=".14"/>
    ${SHINE(-26,-62,15,7,-25)}
    <path d="M-22 -79 q5 -11 14 -5 M-8 -81 q8 -9 15 -1 M7 -77 q9 -4 10 5" fill="none" stroke="#7A4B32" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M-38 -40 q7 6 14 0" ${LINE} stroke-width="3"/>
    <path d="M-37 -36 l-2.5 3.5 M-32 -34.5 l-1 4 M-27 -36 l1 3.5" ${LINE} stroke-width="1.6"/>
    <path d="M2 -48 q13 2 11 13 q-2 9 -11 6" ${LINE} stroke-width="2.5" opacity=".75"/>
    ${BLUSH(-26,-24,8)}
    <path d="M-44 -17 q5 4 10 0" fill="none" stroke="var(--c1)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-50 -14 l-4 -3 M-52 -9 l-5 -1 M-51 -3 l-4 2" ${LINE} stroke-width="2"/>
    <g fill="var(--skin-line)" opacity=".55"><circle cx="-28" cy="89" r="2"/><circle cx="-27" cy="84" r="1.8"/><circle cx="-26" cy="94" r="1.8"/></g>
    ${HEART(12,8,1.2)}`}
};

const CX=150, CY=158, PLACENTA=[208,80];

export function init(){
  const baby=$('#baby');
  baby.innerHTML=Object.entries(STAGES).map(([k,v])=>`<g class="stage" data-st="${k}">${v.svg}</g>`).join('');
  const stageEl=k=>baby.querySelector(`[data-st="${k}"]`);

  // Estado dibujado (lo anima GSAP y draw() lo pinta)
  const view={s:MONTHS[0].s, rot:0, st:'A'};
  function draw(){
    baby.setAttribute('transform',`translate(${CX} ${CY}) rotate(${view.rot}) scale(${view.s})`);
    // El cordón sale de la placenta y llega al ombligo, siga donde siga el bebé
    const [nx,ny]=STAGES[view.st].navel, a=view.rot*Math.PI/180;
    const bx=CX+(nx*Math.cos(a)-ny*Math.sin(a))*view.s, by=CY+(nx*Math.sin(a)+ny*Math.cos(a))*view.s;
    const [px,py]=PLACENTA;
    const d=`M${px} ${py} C${px+34} ${py+70} ${bx+60} ${by-40} ${bx} ${by}`;
    $('#cord').setAttribute('d',d); $('#cordStripe').setAttribute('d',d);
  }
  function showStage(k,anim){
    Object.keys(STAGES).forEach(s=>{
      const on=s===k, el=stageEl(s);
      if(G&&anim&&!reduce) G.to(el,{opacity:on?1:0,duration:.35}); else el.style.opacity=on?1:0;
    });
    view.st=k;
  }

  /* ---------- línea de meses ---------- */
  const ctl=$('#months'), tip=$('#mTip');
  $('#mStops').innerHTML=MONTHS.map((d,i)=>`<span data-m="${i+1}"><i>${d.e}</i>${i+1}</span>`).join('');
  const pct=m=>(m-.5)/MONTHS.length;
  function placeTip(m){
    // la etiqueta sigue al mes elegido sin salirse de la línea
    const W=ctl.clientWidth, w=tip.offsetWidth, x=pct(m)*W;
    tip.style.left=Math.max(0,Math.min(W-w,x-w/2))+'px';
    tip.style.setProperty('--arrow',(x-Math.max(0,Math.min(W-w,x-w/2)))+'px');
  }

  let month=0;
  function setMonth(m,anim){
    if(m===month&&anim) return;
    const d=MONTHS[m-1]; month=m;
    ctl.setAttribute('aria-valuenow',m);
    ctl.setAttribute('aria-valuetext',`Mes ${m}: mide como ${d.n}, unos ${d.cm<1?'menos de 1':d.cm} centímetros`);
    $('#monthNum').innerHTML=`${m}<small>${m===1?'mes':'meses'}</small>`;
    $('#fruitEmo').textContent=d.e; $('#fruitName').textContent=d.n;
    $('#cmLbl').textContent=(d.cm<1?'< 1':d.cm)+' cm';
    $('#monthFact').textContent=d.f; $('#beat').hidden=m<2;
    $$('#mStops span').forEach(s=>s.classList.toggle('on',+s.dataset.m<=m));
    $('#mFill').style.width=pct(m)*100+'%'; $('#mThumb').style.left=pct(m)*100+'%';
    placeTip(m);
    if(d.st!==view.st) showStage(d.st,anim);
    if(G&&anim&&!reduce){
      G.to(view,{s:d.s,rot:d.rot,duration:.9,ease:'elastic.out(1,.6)',onUpdate:draw,overwrite:true});
      G.fromTo('#fruitEmo',{scale:0,rotation:-40},{scale:1,rotation:0,duration:.6,ease:'elastic.out(1,.4)'});
      G.fromTo('#monthNum',{y:-14,opacity:0},{y:0,opacity:1,duration:.35,ease:'back.out(2)'});
      G.fromTo(tip,{scale:.85},{scale:1,duration:.35,ease:'back.out(3)'});
    } else { view.s=d.s; view.rot=d.rot; draw(); }
    if(m===9) earn(3);
  }

  // Clic (o dedo) y arrastrar: se toma la línea y el mes sigue al puntero mientras no se suelte
  const fromX=e=>{ const r=ctl.getBoundingClientRect(); return Math.max(1,Math.min(MONTHS.length,Math.floor((e.clientX-r.left)/r.width*MONTHS.length)+1)); };
  let dragging=false;
  ctl.addEventListener('pointerdown',e=>{ if(e.button>0) return; dragging=true; ctl.classList.add('drag'); ctl.setPointerCapture(e.pointerId); setMonth(fromX(e),true); });
  ctl.addEventListener('pointermove',e=>{ if(dragging) setMonth(fromX(e),true); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>ctl.addEventListener(t,()=>{ dragging=false; ctl.classList.remove('drag'); }));
  ctl.addEventListener('keydown',e=>{
    const k={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key];
    if(k){ e.preventDefault(); setMonth(Math.max(1,Math.min(9,month+k)),true); }
    if(e.key==='Home'){ e.preventDefault(); setMonth(1,true); }
    if(e.key==='End'){ e.preventDefault(); setMonth(9,true); }
  });
  addEventListener('resize',()=>placeTip(month));

  // Ambiente: latido, onda que gira y burbujas
  if(G&&!reduce){
    G.to('#beatIc',{scale:1.3,duration:.28,repeat:-1,yoyo:true,ease:'power1.inOut',transformOrigin:'50% 50%'});
    G.to(baby.querySelectorAll('.heart'),{scale:'+=0.35',duration:.28,repeat:-1,yoyo:true,ease:'power1.inOut',transformOrigin:'50% 50%'});
    G.to('#wave',{rotation:360,duration:40,repeat:-1,ease:'none',transformOrigin:'50% 50%'});
    $$('.bub').forEach((b,i)=>G.fromTo(b,{y:30,opacity:0},{y:-110,opacity:.8,duration:5+i,repeat:-1,delay:i*1.2,ease:'none'}));
  }
  showStage('A',false);
  setMonth(1,false);
  // Al llegar a la página la etiqueta ya tiene tamaño real: se recoloca
  ENTER.p3b=()=>{ requestAnimationFrame(()=>placeTip(month)); if(G&&!reduce) G.fromTo(view,{rot:view.rot-12},{rot:MONTHS[month-1].rot,duration:1.4,ease:'elastic.out(1,.3)',onUpdate:draw}); };

  /* ---------- Modo 3D: el código (y Three.js) solo se descarga al pulsar el botón ---------- */
  let viewer=null;
  const stepOf=m=>STEPS.reduce((k,s,i)=>s.mes<=m?i:k,0);     // último paso que ya llegó a ese mes
  $('#womb3d').onclick=async()=>{
    viewer ||= await import('../modo3d/viewer.js');
    viewer.open3D({
      steps:STEPS, cells:CELLS,
      scene:()=>import('../embarazo3d/scene.js'),
      title:'9 meses en la panza', done:'Ya sabes cómo crece un bebé.',
      count:i=>STEPS[i].label, theme:'v3d-panza', color:'--c3',
      start:stepOf(month),
      origin:$('.womb'),
      // La línea de meses sigue al modo 3D. anim=true solo en el respaldo 2D, donde se ve esta misma ilustración.
      goStep:(i,anim)=>setMonth(STEPS[i].mes,anim),
      opener:$('#womb3d')
    });
  };
}
