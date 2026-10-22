/* Parada 4 · Decidir cuándo: tarjetas que se voltean con un ejemplo animado + calendario */
import { $, $$, css } from '../core/dom.js';
import { G, reduce, boom } from '../core/motion.js';
import { ENTER } from '../core/enter.js';
import { earn } from '../core/stamps.js';

const F='font-family="Atkinson Hyperlegible, sans-serif"';
const svg=(body,label)=>`<svg viewBox="0 0 160 72" role="img" aria-label="${label}">${body}</svg>`;

/* Cada necesidad: título, dato original, ícono del frente, ilustración del reverso
   y play(el) = animación que explica el ejemplo (se ejecuta al voltear). */
const NEEDS=[
  { t:'Muchos pañales', d:'¡más de 2,000 el primer año!',
    ic:'<path d="M8 14h32v6q-3 16-16 16T8 20z" fill="var(--page)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M8 20h32M17 20q7 8 14 0" fill="none" stroke="currentColor" stroke-width="2.5"/>',
    back:()=>svg(Array.from({length:30},(_,i)=>`<path class="dp" transform="translate(${6+(i%10)*15} ${6+Math.floor(i/10)*13})" d="M0 0h12v3q-1.5 7-6 7t-6-7z" fill="var(--page)" stroke="var(--c4)" stroke-width="1.6"/>`).join('')+
      `<text class="num" x="80" y="68" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="16" fill="var(--c4)">0</text>`,'Montones de pañales'),
    play:(el,on)=>{ const n=el.querySelector('.num'), o={v:0};
      if(!on){ n.textContent='2,000'; return; }
      G.fromTo(el.querySelectorAll('.dp'),{scale:0,transformOrigin:'50% 50%'},{scale:1,duration:.3,stagger:.025,ease:'back.out(3)'});
      G.to(o,{v:2000,duration:1.4,ease:'power2.out',onUpdate:()=>n.textContent=Math.round(o.v).toLocaleString('es-MX')}); } },

  { t:'Comer cada 3 horas', d:'también en la madrugada',
    ic:'<rect x="17" y="14" width="14" height="26" rx="6" fill="var(--page)" stroke="currentColor" stroke-width="3"/><path d="M20 14v-4h8v4M24 4v6M17 24h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    back:()=>{ const dots=Array.from({length:8},(_,i)=>{ const a=(i*45-90)*Math.PI/180;
        return `<circle class="feed" cx="${(40+Math.cos(a)*24).toFixed(1)}" cy="${(36+Math.sin(a)*24).toFixed(1)}" r="5" fill="var(--c4)"/>`; }).join('');
      return svg(`<path d="M40 36 L40 4 A32 32 0 0 0 40 68 Z" fill="var(--cover)" opacity=".2"/><circle cx="40" cy="36" r="32" fill="none" stroke="var(--c4)" stroke-width="2.5"/>${dots}
        <line class="hand" x1="40" y1="36" x2="40" y2="14" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="36" r="3" fill="var(--ink)"/>
        <text x="52" y="66" ${F} font-size="9" fill="var(--muted)">☀</text><text x="22" y="66" ${F} font-size="9" fill="var(--muted)">☾</text>
        <text x="82" y="32" font-family="Baloo 2, sans-serif" font-weight="800" font-size="19" fill="var(--c4)">8 veces</text><text x="82" y="48" ${F} font-size="11" fill="var(--muted)">en un día</text>`,'Reloj de un día con 8 comidas'); },
    play:(el,on)=>{ if(!on) return;
      G.fromTo(el.querySelector('.hand'),{rotation:0,svgOrigin:'40 36'},{rotation:360,svgOrigin:'40 36',duration:2,ease:'none'});
      G.fromTo(el.querySelectorAll('.feed'),{scale:0,transformOrigin:'50% 50%'},{scale:1,duration:.3,stagger:.25,ease:'back.out(3)'}); } },

  { t:'Ir al doctor', d:'vacunas y revisiones',
    ic:'<path d="M14 6v12a10 10 0 0 0 20 0V6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M24 28v6a8 8 0 0 0 16 0v-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="27" r="4" fill="var(--page)" stroke="currentColor" stroke-width="3"/>',
    back:()=>{ const M=[1,2,4,6,9,12];
      return svg(`<line x1="10" y1="40" x2="150" y2="40" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/><line class="tline" x1="10" y1="40" x2="150" y2="40" stroke="var(--c4)" stroke-width="4" stroke-linecap="round"/>`+
        M.map((m,i)=>{ const x=10+m/12*140; return `<g class="visit"><circle cx="${x}" cy="40" r="7" fill="var(--page)" stroke="var(--c4)" stroke-width="2.5"/><path d="M${x-3} 40h6M${x} 37v6" stroke="var(--c1)" stroke-width="2" stroke-linecap="round"/>
          <text x="${x}" y="${i%2?70:59}" text-anchor="middle" ${F} font-size="10" fill="var(--muted)">${m}m</text></g>`; }).join('')+
        `<text x="10" y="20" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="var(--c4)">Su primer año</text>`,'Visitas al doctor en el primer año'); },
    play:(el,on)=>{ if(!on) return;
      G.fromTo(el.querySelector('.tline'),{scaleX:0,transformOrigin:'0% 50%'},{scaleX:1,duration:1.2,ease:'power1.inOut'});
      G.fromTo(el.querySelectorAll('.visit'),{scale:0,transformOrigin:'50% 50%'},{scale:1,duration:.35,stagger:.2,ease:'back.out(3)'}); } },

  { t:'Ropa nueva', d:'crece rapidísimo',
    ic:'<path d="M16 8l-8 6 4 6 4-2v20h16V18l4 2 4-6-8-6q-4 5-8 0z" fill="var(--page)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
    back:()=>svg([[.5,'0-3m'],[.65,'3-6m'],[.8,'6-9m'],[1,'9-12m']].map(([k,l],i)=>{ const x=22+i*38;
      return `<g class="onesie"><g transform="translate(${x} ${46-28*k}) scale(${k})"><path d="M-10 0l-9 7 5 7 4-2v18q0 6 10 6t10-6V12l4 2 5-7-9-7q-5 6-10 0z" fill="${['var(--c1s)','var(--c2s)','var(--c3s)','var(--c4s)'][i]}" stroke="var(--c4)" stroke-width="${2/k}" stroke-linejoin="round"/></g>
        <text x="${x}" y="68" text-anchor="middle" ${F} font-size="10" fill="var(--muted)">${l}</text></g>`; }).join(''),'Cuatro tallas de ropa en un año'),
    play:(el,on)=>{ if(on) G.fromTo(el.querySelectorAll('.onesie'),{y:20,opacity:0},{y:0,opacity:1,duration:.45,stagger:.22,ease:'back.out(2)'}); } },

  { t:'Una casa segura', d:'y alguien que lo cuide siempre',
    ic:'<path d="M6 22L24 7l18 15M11 19v19h26V19" fill="var(--page)" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><rect x="20" y="26" width="8" height="12" fill="currentColor"/>',
    back:()=>svg(`<path class="house" d="M8 36L40 10l32 26M16 30v34h48V30" fill="none" stroke="var(--c4)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1"/>
      <g class="sitter"><circle cx="40" cy="38" r="6" fill="var(--skin)" stroke="var(--skin-line)" stroke-width="1.5"/><path d="M31 62q0-15 9-15t9 15z" fill="var(--c5)"/><circle cx="50" cy="56" r="4" fill="var(--skin)" stroke="var(--skin-line)" stroke-width="1.2"/></g>`+
      ['enchufes tapados','reja en escalera','sin cosas chicas'].map((s,i)=>`<g class="safe"><circle cx="82" cy="${16+i*20}" r="7" fill="var(--c5)"/><path d="M79 ${16+i*20}l2 2.5 4-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <text x="92" y="${19+i*20}" ${F} font-size="8.5" font-weight="700" fill="var(--ink)">${s}</text></g>`).join(''),'Casa segura con alguien que lo cuida'),
    play:(el,on)=>{ if(!on) return;
      G.fromTo(el.querySelector('.house'),{strokeDashoffset:1},{strokeDashoffset:0,duration:1,ease:'power1.inOut'});
      G.fromTo(el.querySelector('.sitter'),{scale:0,transformOrigin:'50% 100%'},{scale:1,duration:.5,delay:.8,ease:'back.out(2)'});
      G.fromTo(el.querySelectorAll('.safe'),{x:-10,opacity:0},{x:0,opacity:1,duration:.35,stagger:.25,delay:.6}); } },

  { t:'Paciencia y cariño', d:'durante muchos, muchos años',
    ic:'<path d="M24 40S9 31 6 22C4 15 8 9 14.5 9c4 0 7 2.5 9.5 5.5C26.5 11.5 29.5 9 33.5 9 40 9 44 15 42 22c-3 9-18 18-18 18z" fill="var(--page)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
    back:()=>svg(`<rect x="10" y="34" width="140" height="10" rx="5" fill="var(--page)" stroke="var(--line)" stroke-width="1.5"/><rect class="years" x="10" y="34" width="140" height="10" rx="5" fill="var(--c4)"/>
      <path class="yheart" d="M0 6 C-8 0 -8 -7 -3.5 -7 C-1.5 -7 0 -5.5 0 -4 C0 -5.5 1.5 -7 3.5 -7 C8 -7 8 0 0 6 Z" transform="translate(150 22) scale(1.5)" fill="var(--c1)"/>
      ${[['bebé',22],['niño',70],['adolescente',112],['18',150]].map(([l,x])=>`<text x="${x}" y="62" text-anchor="middle" ${F} font-size="9.5" fill="var(--muted)">${l}</text>`).join('')}
      <text x="10" y="18" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="var(--c4)">18 años y más</text>`,'Línea de 0 a 18 años'),
    play:(el,on)=>{ if(!on) return;
      G.fromTo(el.querySelector('.years'),{scaleX:0,transformOrigin:'0% 50%'},{scaleX:1,duration:1.6,ease:'power1.inOut'});
      G.fromTo(el.querySelector('.yheart'),{x:-140},{x:0,duration:1.6,ease:'power1.inOut'}); } }
];

export function init(){
  const box=$('#needs');
  box.innerHTML=NEEDS.map((n,i)=>`
    <button type="button" class="need" aria-pressed="false" data-i="${i}">
      <span class="need-in">
        <span class="need-f need-front"><svg class="need-ic" viewBox="0 0 48 48" aria-hidden="true">${n.ic}</svg><b>${n.t}</b><small>Toca para ver</small></span>
        <span class="need-f need-back">${n.back()}<small>${n.d}</small></span>
      </span>
    </button>`).join('');

  const seen=new Set();
  box.addEventListener('click',e=>{
    const b=e.target.closest('.need'); if(!b) return;
    const i=+b.dataset.i, open=b.getAttribute('aria-pressed')!=='true';
    b.setAttribute('aria-pressed',open);
    if(open){ seen.add(i); NEEDS[i].play(b.querySelector('.need-back'), !!G&&!reduce); }
    const n=seen.size;
    $('#meterTxt').textContent=`${n} de ${NEEDS.length}`;
    if(G) G.to('#meterFill',{width:(n/NEEDS.length*100)+'%',duration:.5,ease:'back.out(1.5)'}); else $('#meterFill').style.width=(n/NEEDS.length*100)+'%';
    $('#verdict').textContent = n===NEEDS.length ? '¡Es muchísimo trabajo! Por eso los adultos eligen con calma cuándo están listos.' : n>=3 ? '¡Uf, y todavía hay más!' : '';
    if(open&&n===NEEDS.length) boom({power:.8,colors:[css('--c4'),css('--c2')]});
    if(n>=4) earn(4);
  });
  // Entrada: las tarjetas llegan como si se repartieran
  ENTER.p4a=p=>{ if(G&&!reduce) G.fromTo(p.querySelectorAll('.need'),{y:30,rotation:'random(-8,8)',opacity:0},{y:0,rotation:0,opacity:1,duration:.55,stagger:.08,delay:.5,ease:'back.out(1.8)'}); };

  $('#cal').innerHTML=Array.from({length:28},(_,i)=>`<span${i===19?' class="pick"':''}></span>`).join('');
  ENTER.p4b=p=>{ if(!G||reduce) return;
    G.fromTo(p.querySelectorAll('#cal span'),{scale:0},{scale:1,duration:.4,stagger:{each:.02,from:'start'},delay:.4,ease:'back.out(2)'});
    G.fromTo(p.querySelector('#cal .pick'),{scale:1},{scale:1.35,duration:.3,yoyo:true,repeat:3,delay:1.3}); };
}
