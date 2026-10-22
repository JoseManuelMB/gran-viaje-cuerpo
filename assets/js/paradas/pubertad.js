/* Parada 1 · La pubertad: figuras que crecen + tarjetas de cambios (niñas / niños) */
import { $ } from '../core/dom.js';
import { G, reduce } from '../core/motion.js';
import { ENTER } from '../core/enter.js';
import { earn } from '../core/stamps.js';

const IC={
  ruler:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><rect x="16" y="4" width="16" height="40" rx="3"/><path d="M16 12h7M16 20h5M16 28h7M16 36h5"/><path d="M38 10v28M34 14l4-4 4 4M34 34l4 4 4-4"/></svg>',
  sprout:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 44V22"/><path d="M24 26c-10 0-14-6-14-14 8 0 14 4 14 14z"/><path d="M24 22c0-8 5-12 14-12 0 8-5 12-14 12z"/></svg>',
  wave:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M8 34c4-8 6-8 8 0s4 8 8 0 6-8 8 0 4 8 8 0"/><path d="M8 20c4-8 6-8 8 0s4 8 8 0 6-8 8 0 4 8 8 0"/></svg>',
  calendar:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><rect x="6" y="9" width="36" height="33" rx="5"/><path d="M6 18h36M15 5v8M33 5v8"/><circle cx="24" cy="30" r="5" fill="currentColor"/></svg>',
  drop:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 5s-13 15-13 25a13 13 0 0 0 26 0C37 20 24 5 24 5z"/></svg>',
  heart:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 41S9 32 5 23C2 16 6 8 13.5 8c4.5 0 7.5 2.5 10.5 6 3-3.5 6-6 10.5-6C42 8 46 16 43 23c-4 9-19 18-19 18z"/></svg>',
  sound:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 18v12h8l10 8V10l-10 8z"/><path d="M33 17c3 4 3 10 0 14M38 12c6 7 6 17 0 24"/></svg>'
};

// [título, ícono, explicación]
const CARDS={
  girls:[
    ['El estirón','ruler','Creces más rápido que nunca. Tus brazos y piernas se alargan y tus caderas se hacen un poco más anchas.'],
    ['Los pechos','sprout','Empiezan a crecer, primero como un botoncito. A veces duelen un poquito. Es normal y cada una tiene su ritmo.'],
    ['Vello nuevo','wave','Sale vello en las axilas y en el pubis, la zona íntima. Le pasa a todas las personas.'],
    ['La menstruación','calendar','Una vez al mes, el útero suelta un poquito de sangre por la vagina durante unos días. No es una herida: es señal de que el cuerpo está sano. Se usan toallas femeninas.'],
    ['Sudor y granitos','drop','La piel hace más grasa y el sudor huele más fuerte. Bañarte diario y usar desodorante ayuda mucho.'],
    ['Las emociones','heart','Unos mensajeros químicos llamados hormonas pueden hacerte sentir feliz y de pronto triste o enojada. Platicarlo ayuda.']
  ],
  boys:[
    ['El estirón','ruler','Crecen mucho y de golpe. Sus hombros se hacen más anchos y sus músculos más fuertes.'],
    ['La voz cambia','sound','Su voz se vuelve más grave. Mientras cambia, a veces se les "quiebra" al hablar.'],
    ['Vello nuevo','wave','Les sale vello en las axilas, el pubis y las piernas, y después en la cara: bigote y barba.'],
    ['Sus genitales crecen','sprout','El pene y los testículos crecen. Los testículos empiezan a fabricar espermatozoides.'],
    ['Sudor y granitos','drop','A ellos también les sale más grasa en la piel y el sudor huele más. El baño diario ayuda.'],
    ['Las emociones','heart','Las hormonas también les cambian el humor. Le pasa a todos, niñas y niños.']
  ]
};

/* ---------- Tabla de estaturas ----------
   Escala real: 100 px = 1 m. El suelo está en y=222. */
const FLOOR=222, PX_M=100;
const KIDS=[
  {name:'niña',        m:1.30, x:118, r:16, leg:.44, sw:12, hw:11, shirt:'--c1', bottom:'dress', hair:'#5B3A29', style:'pony',
   say:'Niña · ≈ 1.30 m. Su cuerpo todavía no empieza a cambiar.'},
  {name:'adolescente', m:1.55, x:210, r:15, leg:.47, sw:14, hw:13, shirt:'--c2', bottom:'skirt', hair:'#2E1F18', style:'long',
   say:'Adolescente · ≈ 1.55 m. ¡Está en plena pubertad! Da el estirón y su cuerpo cambia poco a poco.'},
  {name:'adulta',      m:1.63, x:302, r:15, leg:.48, sw:15, hw:16, shirt:'--c3', bottom:'pants', hair:'#8A4B2A', style:'bob',
   say:'Adulta · ≈ 1.63 m. Ya terminó de crecer: su cuerpo es de adulta.'}
];

function person(k){
  const {x,r}=k, H=k.m*PX_M, top=FLOOR-H, cy=top+r, neck=cy+r, hip=FLOOR-H*k.leg, sw=k.sw, hw=k.hw;
  const skin='fill="var(--skin)" stroke="var(--skin-line)" stroke-width="2"';
  const shirt=`var(${k.shirt})`, hair=k.hair;
  // pelo de atrás según el peinado
  const back = k.style==='pony' ? `<circle cx="${x+r+3}" cy="${cy-5}" r="7" fill="${hair}"/><circle cx="${x+r-1}" cy="${cy-5}" r="2.5" fill="var(--c4)"/>`
             : k.style==='long' ? `<rect x="${x-r-3}" y="${cy-r+2}" width="${2*r+6}" height="${2*r+16}" rx="${r}" fill="${hair}"/>`
             : `<rect x="${x-r-2}" y="${cy-r+2}" width="${2*r+4}" height="${2*r+4}" rx="${r-2}" fill="${hair}"/>`;
  // parte de abajo: vestido, falda o pantalón
  const legs = k.bottom==='pants'
    ? `<path d="M${x-hw+1} ${hip} L${x-7} ${FLOOR-4} M${x+hw-1} ${hip} L${x+7} ${FLOOR-4}" stroke="var(--cover)" stroke-width="10" stroke-linecap="round"/>`
    : `<path d="M${x-5} ${hip} L${x-6} ${FLOOR-4} M${x+5} ${hip} L${x+6} ${FLOOR-4}" stroke="var(--skin)" stroke-width="7" stroke-linecap="round"/>`;
  const skirt = k.bottom==='dress' ? `<path d="M${x-hw} ${hip-12} L${x-hw-8} ${hip+12} Q${x} ${hip+18} ${x+hw+8} ${hip+12} L${x+hw} ${hip-12} Z" fill="${shirt}"/>`
              : k.bottom==='skirt' ? `<path d="M${x-hw} ${hip-2} L${x-hw-6} ${hip+16} Q${x} ${hip+21} ${x+hw+6} ${hip+16} L${x+hw} ${hip-2} Z" fill="var(--c4)"/>` : '';
  return `
  <g class="kid" data-k="${k.name}" tabindex="0" role="button" aria-label="${k.say}">
    <ellipse cx="${x}" cy="${FLOOR+1}" rx="${hw+12}" ry="4" fill="var(--ink)" opacity=".12"/>
    <g class="grow">
      ${back}
      ${legs}
      <ellipse cx="${x-7}" cy="${FLOOR-2}" rx="7" ry="3.5" fill="var(--ink)"/><ellipse cx="${x+7}" cy="${FLOOR-2}" rx="7" ry="3.5" fill="var(--ink)"/>
      <path d="M${x-sw} ${neck+8} L${x-sw-5} ${hip+2} M${x+sw} ${neck+8} L${x+sw+5} ${hip+2}" stroke="var(--skin)" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${x-sw-5}" cy="${hip+3}" r="3.6" ${skin}/><circle cx="${x+sw+5}" cy="${hip+3}" r="3.6" ${skin}/>
      ${skirt}
      <path d="M${x-sw} ${neck+5} Q${x} ${neck-1} ${x+sw} ${neck+5} L${x+hw} ${hip+2} Q${x} ${hip+6} ${x-hw} ${hip+2} Z" fill="${shirt}"/>
      <path d="M${x-sw} ${neck+5} l-5 14 M${x+sw} ${neck+5} l5 14" stroke="${shirt}" stroke-width="8" stroke-linecap="round"/>
      <rect x="${x-3.5}" y="${neck-3}" width="7" height="8" fill="var(--skin)"/>
      <circle cx="${x}" cy="${cy}" r="${r}" ${skin}/>
      <path d="M${x-r} ${cy-1} Q${x-r} ${cy-r-5} ${x} ${cy-r-2} Q${x+r} ${cy-r-5} ${x+r} ${cy-1} Q${x+4} ${cy-r+7} ${x-r} ${cy-1} Z" fill="${hair}"/>
      <circle cx="${x-5}" cy="${cy+2}" r="1.9" fill="var(--ink)"/><circle cx="${x+5}" cy="${cy+2}" r="1.9" fill="var(--ink)"/>
      <circle cx="${x-9}" cy="${cy+6}" r="2.6" fill="var(--c1)" opacity=".35"/><circle cx="${x+9}" cy="${cy+6}" r="2.6" fill="var(--c1)" opacity=".35"/>
      <path d="M${x-4} ${cy+7} q4 3.5 8 0" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <g class="mark">
      <line class="mline" x1="40" y1="${top}" x2="${x-r-4}" y2="${top}" stroke="var(--c1)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <g class="mtag"><rect x="${x-25}" y="${top-24}" width="50" height="18" rx="9" fill="var(--ink)"/>
      <text x="${x}" y="${top-11}" text-anchor="middle" font-family="Atkinson Hyperlegible, sans-serif" font-weight="700" font-size="11" fill="var(--page)">${k.m.toFixed(2)} m</text></g>
    </g>
    <text x="${x}" y="${FLOOR+20}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="700" font-size="14" fill="var(--ink)">${k.name}</text>
  </g>`;
}

function chartSVG(){
  // regla de 0 a 1.8 m con marcas cada 10 cm
  const ticks=Array.from({length:19},(_,i)=>{ const y=FLOOR-i*10, big=i%5===0;
    return `<line x1="${big?26:31}" y1="${y}" x2="40" y2="${y}" stroke="var(--c2)" stroke-width="${big?2:1.2}"/>`+
      (big&&i? `<text x="22" y="${y+4}" text-anchor="end" font-family="Atkinson Hyperlegible, sans-serif" font-size="10" fill="var(--muted)">${i===10?'1 m':(i/10)+' m'}</text>`:'');
  }).join('');
  return `<svg viewBox="0 0 360 250" aria-label="Tabla de estaturas: niña, adolescente y adulta">
    <rect x="44" y="34" width="312" height="${FLOOR-34}" rx="10" fill="var(--c1s)" opacity=".5"/>
    <rect x="26" y="${FLOOR-182}" width="16" height="184" rx="3" fill="var(--c2s)" stroke="var(--c2)" stroke-width="1.5"/>
    ${ticks}
    <line x1="20" y1="${FLOOR+1}" x2="356" y2="${FLOOR+1}" stroke="var(--line)" stroke-width="3" stroke-linecap="round"/>
    ${KIDS.map(person).join('')}
  </svg>`;
}

function initGrowChart(){
  const art=$('#growArt'); art.innerHTML=chartSVG();
  const kids=[...art.querySelectorAll('.kid')];
  const pick=g=>{
    const k=KIDS.find(k=>k.name===g.dataset.k);
    kids.forEach(o=>o.classList.toggle('dim', o!==g));
    $('#growSay').textContent=k.say;
    if(G&&!reduce) G.fromTo(g.querySelector('.grow'),{y:0},{y:-12,duration:.22,yoyo:true,repeat:1,ease:'power2.out'});
  };
  kids.forEach(g=>{
    g.addEventListener('click',()=>pick(g));
    g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); pick(g); } });
  });
  // Entrada: crecen una tras otra y después aparece su estatura
  ENTER.p1a=p=>{
    if(!G||reduce) return;
    const tl=G.timeline({delay:.4});
    tl.fromTo(p.querySelectorAll('.grow'),{scaleY:.3,opacity:.2,transformOrigin:'50% 100%'},{scaleY:1,opacity:1,duration:1.1,stagger:.35,ease:'elastic.out(1,.5)'})
      .fromTo(p.querySelectorAll('.mline'),{scaleX:0,transformOrigin:'0% 50%'},{scaleX:1,duration:.5,stagger:.15,ease:'power2.out'},'-=.6')
      .fromTo(p.querySelectorAll('.mtag'),{scale:0,transformOrigin:'50% 100%'},{scale:1,duration:.45,stagger:.15,ease:'back.out(2.5)'},'-=.5');
  };
}

export function init(){
  initGrowChart();

  const seen=new Set(); let group='girls';
  function renderTiles(){
    const box=$('#tiles');
    box.innerHTML=CARDS[group].map(([t,ic],i)=>`<button type="button" class="tile${seen.has(group+i)?' seen':''}" data-i="${i}" aria-pressed="false">${IC[ic]}<span>${t}</span></button>`).join('');
    if (G&&!reduce) G.fromTo(box.children,{scale:.6,opacity:0},{scale:1,opacity:1,duration:.5,stagger:.05,ease:'back.out(2.2)'});
  }
  $('#tiles').addEventListener('click',e=>{
    const b=e.target.closest('.tile'); if(!b) return;
    const [t,,body]=CARDS[group][+b.dataset.i];
    $('#tiles').querySelectorAll('.tile').forEach(x=>x.setAttribute('aria-pressed', x===b));
    b.classList.add('seen'); seen.add(group+b.dataset.i);
    $('#infoT').textContent=t; $('#infoB').textContent=body;
    if (G&&!reduce){
      G.fromTo(b.querySelector('svg'),{rotation:-20,scale:.6},{rotation:0,scale:1,duration:.6,ease:'elastic.out(1,.4)'});
      G.fromTo('#info',{scale:.92,opacity:.4},{scale:1,opacity:1,duration:.45,ease:'back.out(2)'});
    }
    if (seen.size>=3) earn(1);
  });
  function setGroup(g){ group=g; $('#tgGirls').setAttribute('aria-pressed',g==='girls'); $('#tgBoys').setAttribute('aria-pressed',g==='boys'); renderTiles(); }
  $('#tgGirls').onclick=()=>setGroup('girls'); $('#tgBoys').onclick=()=>setGroup('boys');
  setGroup('girls');
}
