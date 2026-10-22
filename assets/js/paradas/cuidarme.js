/* Parada 5 · Cuidarme: 4 reglas en pestañas con una escena para practicar cada una
   + quiz "¿sorpresa o secreto?" con retroalimentación inmediata */
import { $, $$, css } from '../core/dom.js';
import { G, reduce, boom } from '../core/motion.js';
import { earn } from '../core/stamps.js';

const anim=()=>G&&!reduce;

/* ---------- ilustraciones ---------- */
// Niña de frente (viewBox 0 0 120 150). swim = con traje de baño completo.
function kidSVG(swim){
  const S='fill="var(--skin)" stroke="var(--skin-line)" stroke-width="2"';
  const body = swim
    ? `<path class="suit" d="M45 62 Q60 57 75 62 L74 102 Q60 110 46 102 Z" fill="var(--c5)"/>
       <path d="M49 62 L47 54 M71 62 L73 54" stroke="var(--c5)" stroke-width="4" stroke-linecap="round"/>
       <path class="suitline" d="M45 62 Q60 57 75 62 L74 102 Q60 110 46 102 Z" fill="none" stroke="var(--c1)" stroke-width="3" stroke-dasharray="5 4" opacity="0"/>
       <g class="lock" opacity="0" transform="translate(60 82)"><rect x="-9" y="-4" width="18" height="14" rx="3" fill="var(--c1)"/><path d="M-5 -4v-4a5 5 0 0 1 10 0v4" fill="none" stroke="var(--c1)" stroke-width="3"/><circle cy="3" r="2" fill="#fff"/></g>`
    : `<path d="M44 62 Q60 56 76 62 L80 72 L74 74 L74 96 L46 96 L46 74 L40 72 Z" fill="var(--c2)"/>
       <path d="M46 94 L74 94 L75 108 L62 108 L60 100 L58 108 L45 108 Z" fill="var(--c4)"/>`;
  return `
    <g class="kidfig">
      <circle cx="38" cy="30" r="7" fill="#5B3A29"/><circle cx="82" cy="30" r="7" fill="#5B3A29"/>
      <circle cx="60" cy="36" r="22" fill="#5B3A29"/>
      <path d="M46 64 L36 96 M74 64 L84 96" stroke="var(--skin)" stroke-width="7" stroke-linecap="round"/>
      <circle cx="35" cy="98" r="4.5" ${S}/><circle cx="85" cy="98" r="4.5" ${S}/>
      <path d="M53 104 L52 136 M67 104 L68 136" stroke="var(--skin)" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="50" cy="139" rx="8" ry="4" fill="var(--ink)"/><ellipse cx="70" cy="139" rx="8" ry="4" fill="var(--ink)"/>
      <rect x="56" y="54" width="8" height="8" fill="var(--skin)"/>
      ${body}
      <circle cx="60" cy="40" r="19" ${S}/>
      <path d="M41 38 Q42 18 60 20 Q78 18 79 38 Q70 26 41 38 Z" fill="#5B3A29"/>
      <circle cx="53" cy="42" r="2.2" fill="var(--ink)"/><circle cx="67" cy="42" r="2.2" fill="var(--ink)"/>
      <circle cx="48" cy="47" r="3" fill="var(--c1)" opacity=".35"/><circle cx="72" cy="47" r="3" fill="var(--c1)" opacity=".35"/>
      <path class="mouth" d="M55 49 q5 4 10 0" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round"/>
    </g>`;
}
const papaSVG=(x,y,k=1)=>`<g transform="translate(${x} ${y}) scale(${k})">
  <circle cy="-14" r="10" fill="var(--skin)" stroke="var(--skin-line)" stroke-width="2"/><path d="M-10 -16 Q-9 -27 0 -26 Q9 -27 10 -16 Q4 -22 -10 -16Z" fill="#2E1F18"/>
  <circle cx="-3.5" cy="-13" r="1.5" fill="var(--ink)"/><circle cx="3.5" cy="-13" r="1.5" fill="var(--ink)"/><path d="M-3 -8 q3 2.5 6 0" fill="none" stroke="var(--ink)" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M-15 18 Q-15 -2 0 -2 Q15 -2 15 18 Z" fill="var(--cover)"/></g>`;

/* ---------- escenas ---------- */
const SCENES=[
  // 0 · Elegir cómo saludar
  { html:`
    <svg viewBox="0 0 120 150" class="rp-svg" aria-hidden="true">
      <circle class="shield" cx="60" cy="82" r="62" fill="var(--c5s)" stroke="var(--c5)" stroke-width="4" stroke-dasharray="8 6" opacity="0"/>
      ${kidSVG(false)}
      <g class="say" opacity="0"><rect x="66" y="0" width="52" height="26" rx="13" fill="var(--ink)"/><text class="say-t" x="92" y="18" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="14" fill="var(--page)"></text></g>
    </svg>
    <div class="rp-ctrl">
      <span class="muted">Alguien te quiere saludar. ¿Cómo quieres tú?</span>
      <div class="greet">
        <button type="button" class="chipbtn" data-g="hug">🤗 Abrazo</button>
        <button type="button" class="chipbtn" data-g="five">✋ Chocar las manos</button>
        <button type="button" class="chipbtn" data-g="wave">👋 Saludar de lejos</button>
        <button type="button" class="chipbtn no" data-g="no">🙅 ¡No, gracias!</button>
      </div>
      <p class="rp-fb" aria-live="polite"></p>
    </div>`,
    init(el){
      const SAY={hug:'🤗',five:'✋',wave:'👋',no:'¡NO!'};
      el.querySelector('.greet').addEventListener('click',e=>{
        const b=e.target.closest('[data-g]'); if(!b) return;
        const g=b.dataset.g, no=g==='no';
        el.querySelectorAll('[data-g]').forEach(x=>x.setAttribute('aria-pressed',x===b));
        el.querySelector('.say-t').textContent=SAY[g];
        el.querySelector('.rp-fb').textContent = no ? 'Decir "no" está bien, aunque sea alguien que conoces. Tu cuerpo es tuyo.' : '¡Tú eliges cómo saludar! Y puedes cambiar de idea cuando quieras.';
        if(anim()){
          G.fromTo(el.querySelector('.say'),{opacity:0,scale:.3,transformOrigin:'0% 100%'},{opacity:1,scale:1,duration:.45,ease:'back.out(2.5)'});
          G.to(el.querySelector('.shield'),{opacity:no?1:0,duration:.3});
          if(no) G.fromTo(el.querySelector('.shield'),{scale:.6,transformOrigin:'50% 50%'},{scale:1,duration:.7,ease:'elastic.out(1,.45)'});
          else G.fromTo(el.querySelector('.kidfig'),{y:0},{y:-10,duration:.2,yoyo:true,repeat:1,ease:'power2.out'});
        } else { el.querySelector('.say').setAttribute('opacity',1); el.querySelector('.shield').setAttribute('opacity',no?1:0); }
      });
    } },

  // 1 · Lo que cubre el traje de baño es privado
  { html:`
    <svg viewBox="0 0 120 150" class="rp-svg" aria-hidden="true">${kidSVG(true)}</svg>
    <div class="rp-ctrl">
      <span class="muted">Mira lo que cubre el traje de baño.</span>
      <button type="button" class="btn" data-show aria-pressed="false" style="--sc:var(--c1)">Mostrar la zona privada</button>
      <p class="rp-fb" aria-live="polite"></p>
    </div>`,
    init(el){
      const b=el.querySelector('[data-show]'), line=el.querySelector('.suitline'), lock=el.querySelector('.lock');
      b.onclick=()=>{
        const on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',on);
        b.textContent = on ? 'Ocultar' : 'Mostrar la zona privada';
        el.querySelector('.rp-fb').textContent = on ? 'Esa zona es privada: nadie debe tocarla ni pedir verla. Solo el doctor, con papá presente.' : '';
        if(anim()){
          G.to([line,lock],{opacity:on?1:0,duration:.3});
          if(on){ G.fromTo(lock,{scale:0,transformOrigin:'50% 50%'},{scale:1,duration:.6,ease:'elastic.out(1,.4)'});
            G.fromTo(line,{strokeDashoffset:0},{strokeDashoffset:-36,duration:1.2,repeat:2,ease:'none'}); }
        } else { line.setAttribute('opacity',on?1:0); lock.setAttribute('opacity',on?1:0); }
      };
    } },

  // 2 · Sorpresa (se abre y alegra) vs secreto (se lo cuento a papá)
  { html:`
    <div class="ss">
      <button type="button" class="ss-card" data-ss="gift" aria-label="Abrir la sorpresa">
        <svg viewBox="0 0 100 90" aria-hidden="true">
          <g class="spark" fill="var(--c2)" opacity="0"><path d="M18 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M82 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2z"/><circle cx="50" cy="6" r="3"/></g>
          <rect x="24" y="42" width="52" height="40" rx="4" fill="var(--c2)"/><rect x="46" y="42" width="8" height="40" fill="var(--c1)"/>
          <g class="lid"><rect x="20" y="32" width="60" height="12" rx="3" fill="var(--c2)" stroke="var(--page)" stroke-width="1.5"/><rect x="46" y="32" width="8" height="12" fill="var(--c1)"/>
          <path d="M50 32 q-14 -14 -18 -4 q2 6 18 4 q14 -14 18 -4 q-2 6 -18 4" fill="var(--c1)"/></g>
        </svg>
        <b>Sorpresa</b>
      </button>
      <button type="button" class="ss-card" data-ss="secret" aria-label="Abrir el secreto">
        <svg viewBox="0 0 100 90" aria-hidden="true">
          <g class="cloud"><path d="M18 52 q-10 -16 8 -22 q6 -16 24 -10 q16 -8 24 8 q16 4 8 22 z" fill="var(--c1s)" stroke="var(--c1)" stroke-width="2"/>
          <rect x="40" y="36" width="20" height="16" rx="3" fill="var(--c1)"/><path class="shackle" d="M44 36 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="var(--c1)" stroke-width="3"/></g>
          ${papaSVG(78,72,.9)}
          <g class="toPapa" opacity="0"><rect x="0" y="0" width="30" height="16" rx="8" fill="var(--c5)"/><text x="15" y="12" text-anchor="middle" font-size="10" fill="#fff">💬</text></g>
        </svg>
        <b>Secreto</b>
      </button>
    </div>
    <p class="rp-fb" aria-live="polite">Toca la caja y la nube.</p>`,
    init(el){
      const fb=el.querySelector('.rp-fb');
      el.querySelector('[data-ss="gift"]').onclick=()=>{
        fb.textContent='¡Sorpresa! Se descubre pronto y todos se ponen felices. 🎉';
        if(anim()){ G.timeline().fromTo(el.querySelector('.lid'),{y:0,rotation:0},{y:-18,rotation:-18,svgOrigin:'20 44',duration:.45,ease:'back.out(2)'})
          .fromTo(el.querySelector('.spark'),{opacity:0,scale:.3,transformOrigin:'50% 50%'},{opacity:1,scale:1,duration:.4,ease:'back.out(3)'},'<.1')
          .to(el.querySelector('.lid'),{y:0,rotation:0,duration:.4,delay:1.2}).to(el.querySelector('.spark'),{opacity:0,duration:.3},'<'); }
      };
      el.querySelector('[data-ss="secret"]').onclick=()=>{
        fb.textContent='Un secreto que te hace sentir rara no se guarda: se lo cuentas a papá. 💬';
        if(anim()){ G.timeline().to(el.querySelector('.shackle'),{y:-5,duration:.3,ease:'back.out(3)'})
          .fromTo(el.querySelector('.toPapa'),{x:34,y:30,opacity:1,scale:.5},{x:62,y:34,scale:1,duration:.8,ease:'power2.inOut'})
          .to(el.querySelector('.toPapa'),{opacity:0,duration:.3,delay:.6}).to(el.querySelector('.shackle'),{y:0,duration:.3},'<'); }
      };
    } },

  // 3 · Chat con papá: contar algo nunca te mete en problemas
  { html:`
    <div class="chat" aria-live="polite">
      <div class="msg me" hidden>Papá, tengo que contarte algo…</div>
      <div class="msg dad typing" hidden><i></i><i></i><i></i></div>
      <div class="msg dad" hidden>Gracias por contarme. No estás en problemas.</div>
      <div class="msg dad" hidden>Siempre puedes contarme lo que sea. Te quiero mucho ❤️</div>
    </div>
    <button type="button" class="btn" data-chat style="--sc:var(--c5)">Enviar: "Papá, tengo que contarte algo…"</button>`,
    init(el){
      const [me,typing,a1,a2]=el.querySelectorAll('.msg'), b=el.querySelector('[data-chat]');
      const pop=m=>{ m.hidden=false; if(anim()) G.fromTo(m,{scale:.6,opacity:0,transformOrigin:m.classList.contains('me')?'100% 100%':'0% 100%'},{scale:1,opacity:1,duration:.35,ease:'back.out(2.5)'}); };
      b.onclick=()=>{
        [me,typing,a1,a2].forEach(m=>m.hidden=true); b.disabled=true;
        if(!anim()){ [me,a1,a2].forEach(m=>m.hidden=false); b.disabled=false; b.textContent='Otra vez'; return; }
        G.timeline().add(()=>pop(me)).add(()=>pop(typing),'+=.6')
          .fromTo(typing.querySelectorAll('i'),{y:0},{y:-4,duration:.25,stagger:.12,yoyo:true,repeat:3})
          .add(()=>{ typing.hidden=true; pop(a1); }).add(()=>pop(a2),'+=.9')
          .add(()=>{ b.disabled=false; b.textContent='Otra vez'; });
      };
    } }
];

function initRules(){
  $$('.rp-scene').forEach(s=>{ const sc=SCENES[+s.dataset.scene]; s.innerHTML=sc.html; sc.init(s); });
  const tabs=[...$$('.rtabs [role=tab]')];
  function select(t,focus){
    tabs.forEach(x=>{ const on=x===t; x.setAttribute('aria-selected',on); x.tabIndex=on?0:-1; $('#'+x.getAttribute('aria-controls')).hidden=!on; });
    if(focus) t.focus();
    const p=$('#'+t.getAttribute('aria-controls'));
    if(anim()) G.fromTo(p.children,{y:14,opacity:0},{y:0,opacity:1,duration:.4,stagger:.08,ease:'back.out(1.6)'});
  }
  tabs.forEach((t,i)=>{
    t.onclick=()=>select(t);
    t.onkeydown=e=>{ const d={ArrowRight:1,ArrowLeft:-1}[e.key]; if(d){ e.preventDefault(); select(tabs[(i+d+tabs.length)%tabs.length],true); } };
  });
}

// [caso, respuesta correcta, mensaje de acierto]
const QUIZ=[
  ['Le compramos un regalo a la abuela y no le decimos nada hasta su cumpleaños.','surprise','¡Correcto! Es una sorpresa: se descubre pronto y hace feliz a todos.'],
  ['Alguien te dice que no le cuentes a nadie de un "juego" que te hizo sentir incómoda.','secret','¡Muy bien! Ese secreto no se guarda. Se lo cuentas a papá y no vas a estar en problemas.'],
  ['Tu amiga y tú preparan una fiesta sorpresa para su hermano.','surprise','¡Exacto! Es una sorpresa divertida que se descubre en la fiesta.'],
  ['Alguien te regala algo y te pide que no les digas a tus papás.','secret','¡Bien hecho! Si alguien te pide esconderle algo a papá, se lo cuentas a papá.']
];

export function init(){
  initRules();

  let qi=0; const qOk=new Set();
  function renderQ(){
    $('#qText').textContent=QUIZ[qi][0]; $('#qFb').textContent=''; $('#qFb').className='q-fb'; $('#qNext').hidden=true;
    $('#qProg').textContent=`Caso ${qi+1} de ${QUIZ.length} · aciertos: ${qOk.size}`;
  }
  function answer(c){
    const [,right,msg]=QUIZ[qi], fb=$('#qFb');
    if(c===right){
      fb.textContent=msg; fb.className='q-fb ok'; qOk.add(qi); $('#qNext').hidden=false;
      $('#qNext').textContent=qi===QUIZ.length-1?'Empezar otra vez':'Siguiente caso';
      $('#qProg').textContent=`Caso ${qi+1} de ${QUIZ.length} · aciertos: ${qOk.size}`;
      if(G&&!reduce) G.fromTo('#qCard',{scale:.95},{scale:1,duration:.6,ease:'elastic.out(1,.4)'});
      boom({power:.35,colors:[css('--c5'),css('--c2')]});
      if(qOk.size===QUIZ.length) earn(5);
    } else {
      fb.textContent = right==='secret' ? 'Piénsalo otra vez: si algo te hace sentir rara, no se guarda.' : 'Piénsalo otra vez: ¿se va a descubrir pronto y hará feliz a alguien?';
      fb.className='q-fb warn';
      if(G&&!reduce) G.fromTo('#qCard',{x:0},{keyframes:{x:[-10,10,-7,7,-3,0]},duration:.45});
    }
  }
  $('#qSurprise').onclick=()=>answer('surprise'); $('#qSecret').onclick=()=>answer('secret');
  $('#qNext').onclick=()=>{ qi=(qi+1)%QUIZ.length;
    if(G&&!reduce) G.timeline().to('#qText',{opacity:0,x:-30,duration:.2}).add(renderQ).fromTo('#qText',{opacity:0,x:30},{opacity:1,x:0,duration:.3});
    else renderQ(); };
  renderQ();
}
