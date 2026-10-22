/* En familia: mano de confianza (se guarda) + mazo de preguntas para papá */
import { $, store } from '../core/dom.js';
import { G, reduce, boom } from '../core/motion.js';
import { toast } from '../core/stamps.js';
import { ENTER } from '../core/enter.js';

// [etiqueta, color, pregunta]
const ASK=[
  ['Mi cuerpo','--c1','¿Cómo eras tú cuando tenías mi edad?'],
  ['Mi cuerpo','--c1','¿A qué edad te cambió la voz?'],
  ['Mi cuerpo','--c1','¿Tú también te sentías raro con los cambios de tu cuerpo?'],
  ['Mi cuerpo','--c1','¿Qué hago si me llega la menstruación en la escuela?'],
  ['Cuando nací','--c3','¿Cómo fue el día en que yo nací?'],
  ['Cuando nací','--c3','¿Qué sentiste cuando supiste que yo iba a llegar?'],
  ['Cuando nací','--c3','¿Cómo era yo de bebé? ¿Tienes fotos?'],
  ['Decidir','--c4','¿Cómo sabe un adulto que está listo para tener un hijo?'],
  ['Cuidarme','--c5','¿A quién le puedo contar las cosas si tú no estás?'],
  ['Cuidarme','--c5','¿Qué hago si alguien me hace sentir incómoda?'],
  ['Confianza','--c2','¿Te puedo preguntar lo que sea, aunque me dé pena?'],
  ['Confianza','--c2','¿Hay algo que a ti te hubiera gustado saber a mi edad?']
];

/* ---------- Mano de confianza ----------
   Cada dedo: base sobre la palma (bx,by), inclinación en grados, largo y grosor. */
const FINGERS=[
  {n:'Pulgar',  c:'--c1', bx:96,  by:214, a:-58, len:74,  w:36},
  {n:'Índice',  c:'--c2', bx:118, by:150, a:-14, len:96,  w:32},
  {n:'Medio',   c:'--c3', bx:152, by:142, a:-3,  len:110, w:33},
  {n:'Anular',  c:'--c4', bx:186, by:146, a:8,   len:100, w:32},
  {n:'Meñique', c:'--c5', bx:214, by:162, a:20,  len:78,  w:28}
];
const SKIN='var(--skin)', LINE='var(--skin-line)';

function fingerSVG(f,i){
  const {len,w}=f;
  // el texto corre a lo largo del dedo; el pulgar se lee al revés para no quedar de cabeza
  const rot=f.a-90<-120 ? 90 : -90;
  return `<g transform="translate(${f.bx} ${f.by}) rotate(${f.a})">
    <g class="fin" data-i="${i}">
      <rect class="skin" x="${-w/2}" y="${-len}" width="${w}" height="${len+26}" rx="${w/2}" fill="${SKIN}" stroke="${LINE}" stroke-width="2.5"/>
      <rect x="${-w*.3}" y="${-len+5}" width="${w*.6}" height="${w*.55}" rx="${w*.26}" fill="#fff" opacity=".55"/>
      <path d="M${-w*.28} ${-len*.42} q${w*.28} 4 ${w*.56} 0 M${-w*.28} ${-len*.68} q${w*.28} 4 ${w*.56} 0" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
      <text class="fname" transform="translate(0 ${-len*.5}) rotate(${rot})" text-anchor="middle" dominant-baseline="central"
        font-family="Baloo 2, sans-serif" font-weight="800" fill="var(--ink)"></text>
    </g></g>`;
}

function initHand(){
  const hand=store.get('hand',['Papá','','','','']);
  $('#handSvg').innerHTML=`
    <g class="fingers">${FINGERS.map(fingerSVG).join('')}</g>
    <path d="M88 192 Q92 150 122 146 L214 150 Q240 158 236 198 L232 262 Q224 302 164 304 Q106 304 96 266 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.5"/>
    <path d="M112 214 Q150 196 196 204 M118 240 Q160 228 210 236" fill="none" stroke="${LINE}" stroke-width="1.8" stroke-linecap="round" opacity=".45"/>
    <rect x="118" y="298" width="96" height="30" rx="8" fill="var(--c5)"/><rect x="118" y="298" width="96" height="8" rx="4" fill="var(--c5s)" opacity=".6"/>
    <text x="164" y="258" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="var(--ink)">Mi equipo</text>
    <text id="handCount" x="164" y="280" text-anchor="middle" font-family="Atkinson Hyperlegible, sans-serif" font-weight="700" font-size="13" fill="var(--muted)"></text>
    <path id="handHeart" d="M0 6 C-8 0 -8 -7 -3.5 -7 C-1.5 -7 0 -5.5 0 -4 C0 -5.5 1.5 -7 3.5 -7 C8 -7 8 0 0 6 Z" transform="translate(164 222) scale(2)" fill="var(--c1)"/>`;
  $('#handList').innerHTML=FINGERS.map((f,i)=>`
    <label class="hrow" style="--fc:var(${f.c})"><i>${i+1}</i><span>${f.n}</span>
      <input id="hand${i}" type="text" maxlength="14" placeholder="¿Quién?" autocomplete="off"></label>`).join('');

  let celebrated=false;
  function paint(i,pop){
    const f=FINGERS[i], v=$('#hand'+i).value.trim(), g=$(`#handSvg .fin[data-i="${i}"]`), t=g.querySelector('.fname');
    t.textContent=v||String(i+1);
    t.setAttribute('font-size', v ? Math.min(15,(f.len-22)/(v.length*.56)).toFixed(1) : 16);
    t.setAttribute('fill', v ? 'var(--ink)' : 'var(--muted)');
    const sk=g.querySelector('.skin');
    sk.setAttribute('fill', v ? `var(${f.c}s)` : SKIN); sk.setAttribute('stroke', v ? `var(${f.c})` : LINE);
    if(pop&&G&&!reduce) G.fromTo(g,{scale:1.12,transformOrigin:'50% 100%'},{scale:1,duration:.5,ease:'elastic.out(1,.4)'});
  }
  function count(){
    const n=FINGERS.filter((_,i)=>$('#hand'+i).value.trim()).length;
    $('#handCount').textContent=`${n} de 5 personas`;
    if(n===5&&!celebrated){ celebrated=true; boom({power:.7}); toast('¡Tu mano de confianza está completa!');
      if(G&&!reduce) G.fromTo('#handHeart',{scale:2},{scale:3,duration:.3,yoyo:true,repeat:3,svgOrigin:'164 222'}); }
  }
  FINGERS.forEach((_,i)=>{ $('#hand'+i).value=hand[i]||''; paint(i,false); });
  count();
  $('#handList').addEventListener('input',e=>{
    const i=+e.target.id.replace('hand',''), was=$(`#handSvg .fin[data-i="${i}"] .fname`).getAttribute('fill')==='var(--ink)';
    paint(i, !was && !!e.target.value.trim()); count();
    store.set('hand',FINGERS.map((_,k)=>$('#hand'+k).value));
  });
  // Al enfocar un campo, su dedo se levanta un poquito
  $('#handList').addEventListener('focusin',e=>{ const i=+e.target.id.replace('hand','');
    if(G&&!reduce&&!isNaN(i)) G.fromTo(`#handSvg .fin[data-i="${i}"]`,{y:0},{y:-8,duration:.18,yoyo:true,repeat:1,ease:'power2.out'}); });
  ENTER.hand=p=>{ if(G&&!reduce) G.fromTo(p.querySelectorAll('#handSvg .fin'),{scaleY:0,transformOrigin:'50% 100%'},{scaleY:1,duration:.9,stagger:.1,delay:.4,ease:'elastic.out(1,.45)'}); };
}

function initAsk(){
  let ai=0;
  function paintAsk(){
    const [l,c,t]=ASK[ai], card=$('#askCard');
    card.style.setProperty('--qc',`var(${c})`); card.style.setProperty('--qc-s',`var(${c}s)`);
    $('#askLbl').textContent=l; $('#askText').textContent=t; $('#askCount').textContent=`${ai+1} de ${ASK.length}`;
  }
  function nextAsk(i){
    if(G&&!reduce){
      G.timeline().to('#askCard',{x:-160,rotation:-14,opacity:0,duration:.3,ease:'power2.in'})
        .add(()=>{ai=i;paintAsk();})
        .fromTo('#askCard',{x:160,rotation:12,opacity:0},{x:0,rotation:0,opacity:1,duration:.55,ease:'back.out(1.6)'});
    } else { ai=i; paintAsk(); }
  }
  $('#askNext').onclick=()=>nextAsk((ai+1)%ASK.length);
  $('#askShuffle').onclick=()=>{ let r; do{ r=Math.floor(Math.random()*ASK.length);}while(r===ai); nextAsk(r); };
  paintAsk();
}

export function init(){ initHand(); initAsk(); }
