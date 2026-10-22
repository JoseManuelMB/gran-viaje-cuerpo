/* Parada 2 · La fecundación: animación en 6 pasos controlada por el usuario */
import { $, $$ } from '../core/dom.js';
import { G, reduce } from '../core/motion.js';
import { ENTER } from '../core/enter.js';
import { earn } from '../core/stamps.js';
import { STEPS, CELLS } from '../data/fecundacion-pasos.js';

/* ---------- Ilustraciones (se reutilizan en la intro y en la animación) ---------- */
const TAIL_A='M-13 0 q-9 -8 -18 0 t-18 0 t-16 0', TAIL_B='M-13 0 q-9 8 -18 0 t-18 0 t-16 0';

// Espermatozoide mirando hacia +x: cola, pieza intermedia, cabeza con acrosoma y carita
const spermSVG=()=>`
  <path class="tl" d="${TAIL_A}" fill="none" stroke="var(--c4)" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
  <rect x="-16" y="-2.6" width="9" height="5.2" rx="2.6" fill="var(--c4)"/>
  <ellipse rx="10.5" ry="7.5" fill="var(--c4s)" stroke="var(--c4)" stroke-width="2.2"/>
  <path d="M3 -6.6 A10.5 7.5 0 0 1 3 6.6 A7 5.8 0 0 0 3 -6.6 Z" fill="var(--c4)" opacity=".5"/>
  <ellipse cx="-3" cy="-3.4" rx="3.2" ry="1.4" fill="#fff" opacity=".75"/>
  <circle cx="2" cy="-1.2" r="1.5" fill="var(--ink)"/>
  <path d="M-1 2.6 q2 1.6 4 0" fill="none" stroke="var(--ink)" stroke-width="1" stroke-linecap="round"/>`;

// Óvulo centrado en 0,0: corona de células, zona pelúcida, citoplasma con gránulos y núcleo
function eggSVG(R, gid){
  const corona=Array.from({length:18},(_,i)=>{ const a=i/18*Math.PI*2, d=R*1.24;
    return `<circle cx="${(Math.cos(a)*d).toFixed(1)}" cy="${(Math.sin(a)*d).toFixed(1)}" r="${(R*.12).toFixed(1)}"/>`; }).join('');
  const gran=[[-.45,.2],[-.2,.5],[.15,.55],[.45,.3],[.5,-.05],[-.55,-.15],[-.1,-.55],[.3,-.45],[-.3,.05],[.1,.2]]
    .map(([x,y],i)=>`<circle cx="${x*R}" cy="${y*R}" r="${i%3?1.6:2.4}"/>`).join('');
  return `
  <defs><radialGradient id="${gid}" cx="38%" cy="34%" r="72%">
    <stop offset="0" style="stop-color:var(--page)"/><stop offset=".6" style="stop-color:var(--c2s)"/><stop offset="1" style="stop-color:var(--c2);stop-opacity:.5"/>
  </radialGradient></defs>
  <g class="corona" fill="var(--c2s)" stroke="var(--c2)" stroke-width="1.5" opacity=".9">${corona}</g>
  <circle r="${R*1.09}" fill="none" stroke="var(--c2)" stroke-width="${R*.12}" opacity=".22"/>
  <circle r="${R}" fill="url(#${gid})" stroke="var(--c2)" stroke-width="3"/>
  <g fill="var(--c2)" opacity=".35">${gran}</g>
  <circle cx="${R*.16}" cy="${-R*.1}" r="${R*.27}" fill="var(--c2)" fill-opacity=".3" stroke="var(--c2)" stroke-width="1.5"/>
  <circle cx="${R*.2}" cy="${-R*.14}" r="${R*.09}" fill="var(--c2)" opacity=".75"/>
  <ellipse cx="${-R*.42}" cy="${-R*.46}" rx="${R*.26}" ry="${R*.12}" transform="rotate(-35 ${-R*.42} ${-R*.46})" fill="#fff" opacity=".6"/>`;
}

// Célula del embrión: relleno con degradado, núcleo y brillo
const cellSVG=()=>`
  <circle r="24" fill="url(#gCell)" stroke="var(--c2)" stroke-width="3"/>
  <circle cx="2" cy="2" r="7" fill="var(--c2)" fill-opacity=".3" stroke="var(--c2)" stroke-width="1.2"/>
  <circle cx="3" cy="1" r="2.4" fill="var(--c2)" opacity=".8"/>
  <ellipse cx="-9" cy="-10" rx="6" ry="3" transform="rotate(-35 -9 -10)" fill="#fff" opacity=".6"/>`;

/* ---------- Coreografía ---------- */
const NS='http://www.w3.org/2000/svg';
const START=[[28,70],[18,140],[40,200],[22,250],[60,110]];
const PATHS=[[[80,50],[130,82],[168,96]],[[70,160],[120,120],[170,140]],[[90,210],[130,175],[168,184]],[[80,256],[130,226],[170,210]],[[100,90],[140,124],[172,116]]];
const WIN=1; // el espermatozoide que logra entrar
const C8=[[-26,-20],[0,-32],[26,-20],[-32,8],[32,8],[-14,30],[14,30],[0,0]].map(([x,y])=>[250+x,140+y]);
const C2=[[226,140],[274,140]];
const ang=pts=>{ const a=pts[pts.length-2],b=pts[pts.length-1]; return Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI; };

export function init(){
  // Intro: el espermatozoide nada hacia el óvulo en bucle
  $('#bigEgg').innerHTML=eggSVG(54,'gEggA');
  $('#miniSperm').innerHTML=spermSVG();
  ENTER.p2a=p=>{
    if(!G||reduce) return;
    const s=p.querySelector('#miniSperm'), tail=s.querySelector('.tl');
    G.killTweensOf([s,tail,'#bigEgg .corona']);
    G.fromTo(s,{x:20,y:130,rotation:0},{motionPath:{path:[{x:60,y:70},{x:110,y:120},{x:162,y:90}],curviness:1.4,autoRotate:true},duration:3.2,ease:'power1.inOut',repeat:-1,repeatDelay:.8});
    G.to(tail,{attr:{d:TAIL_B},duration:.18,repeat:-1,yoyo:true,ease:'sine.inOut'});
    G.fromTo('#bigEgg',{scale:.85,transformOrigin:'50% 50%'},{scale:1,duration:1.2,ease:'elastic.out(1,.4)'});
    G.to('#bigEgg .corona',{rotation:360,duration:60,repeat:-1,ease:'none',transformOrigin:'50% 50%'});
  };

  $('#egg').innerHTML=eggSVG(54,'gEggB');
  const sperms=START.map(()=>{ const g=document.createElementNS(NS,'g'); g.innerHTML=spermSVG(); $('#spermGroup').appendChild(g); return g; });
  const cells=C8.map(()=>{ const g=document.createElementNS(NS,'g'); g.innerHTML=cellSVG(); $('#cellsG').appendChild(g); return g; });
  $('#stepDots').innerHTML=STEPS.map(()=>'<span></span>').join('');

  // Coloca la escena en el estado final del paso k (sin animar)
  function setEnd(k){
    if(!G) return;
    G.killTweensOf([...sperms,...cells,'#sceneA','#sceneC','#implant','#egg','#eggRing','#zona']);
    G.set('#sceneA',{opacity:k<3?1:0}); G.set('#egg',{scale:1,transformOrigin:'50% 50%'}); G.set('#eggRing',{opacity:0});
    G.set('#zona',{opacity:k===3||k===4?1:0});
    G.set('#sceneC',{opacity:k===5?1:0}); G.set('#implant',{x:180,y:112,opacity:k===5?1:0,scale:1,transformOrigin:'50% 50%'});
    sperms.forEach((s,i)=>{
      if(k===0) G.set(s,{x:START[i][0],y:START[i][1],rotation:0,opacity:1});
      else { const e=PATHS[i][PATHS[i].length-1]; G.set(s,{x:e[0],y:e[1],rotation:ang([START[i],...PATHS[i]]),opacity:k===1?1:.15});
        if(k>=2&&i===WIN) G.set(s,{x:200,y:140,opacity:0}); }
    });
    cells.forEach((c,i)=>{
      G.set(c,{transformOrigin:'50% 50%'});
      if(k===3&&i<2) G.set(c,{x:C2[i][0],y:C2[i][1],scale:1.4,opacity:1});
      else if(k===4) G.set(c,{x:C8[i][0],y:C8[i][1],scale:1,opacity:1});
      else G.set(c,{x:250,y:140,scale:.3,opacity:0});
    });
  }

  // Anima la transición del paso k-1 al paso k
  function play(k){
    if(!G||reduce){ setEnd(k); return; }
    setEnd(k-1);
    if(k===1){ sperms.forEach((s,i)=>G.to(s,{motionPath:{path:PATHS[i].map(([x,y])=>({x,y})),curviness:1.3,autoRotate:true},duration:2.2+i*.18,ease:'power1.inOut'})); }
    if(k===2){
      const tl=G.timeline();
      tl.to(sperms.filter((_,i)=>i!==WIN),{opacity:.15,duration:.6},0)
        .to(sperms[WIN],{x:200,y:140,rotation:0,duration:.8,ease:'power2.in'},0)
        .to(sperms[WIN],{opacity:0,duration:.3})
        .fromTo('#eggRing',{opacity:1,scale:.9,transformOrigin:'50% 50%'},{opacity:0,scale:1.25,duration:.8,ease:'power2.out'})
        .to('#egg',{scale:1.06,yoyo:true,repeat:3,duration:.18,transformOrigin:'50% 50%'},'<');
    }
    if(k===3){
      const tl=G.timeline();
      tl.to('#sceneA',{opacity:0,duration:.5}).to('#zona',{opacity:1,duration:.5},0);
      cells.slice(0,2).forEach((c,i)=>tl.fromTo(c,{x:250,y:140,scale:2.2,opacity:0},{x:C2[i][0],y:C2[i][1],scale:1.4,opacity:1,duration:1.1,ease:'elastic.out(1,.5)'},.3));
    }
    if(k===4){
      cells.forEach((c,i)=>{ const from=i<2?C2[i]:C2[i%2];
        G.fromTo(c,{x:from[0],y:from[1],scale:i<2?1.4:.4,opacity:i<2?1:0},{x:C8[i][0],y:C8[i][1],scale:1,opacity:1,duration:1,delay:i<2?0:.15+i*.08,ease:'elastic.out(1,.55)'}); });
    }
    if(k===5){
      const tl=G.timeline();
      tl.to(cells,{scale:.2,opacity:0,x:250,y:140,duration:.6,stagger:.03}).to('#zona',{opacity:0,duration:.4},'<')
        .to('#sceneC',{opacity:1,duration:.6})
        .fromTo('#implant',{x:42,y:104,opacity:1},{motionPath:{path:[{x:60,y:80},{x:88,y:64},{x:120,y:80},{x:150,y:98},{x:180,y:112}],curviness:1.2},duration:2.2,ease:'power1.inOut'})
        .to('#implant',{scale:1.4,yoyo:true,repeat:5,duration:.3,ease:'sine.inOut'});
    }
  }

  let step=0;
  function drawStep(anim){
    $('#caption').textContent=STEPS[step].text;
    $('#stepCount').textContent=`Paso ${step+1} de ${STEPS.length}`;
    $('#stepDots').querySelectorAll('span').forEach((d,i)=>d.classList.toggle('on',i<=step));
    $('#prevStep').disabled=step===0;
    $('#nextStep').textContent=step===STEPS.length-1?'Ver otra vez':'Siguiente paso';
    if(anim) play(step); else setEnd(step);
    if(G&&!reduce) G.fromTo('#caption',{opacity:0,y:8},{opacity:1,y:0,duration:.4});
    if(step===STEPS.length-1) earn(2);
  }
  $('#nextStep').onclick=()=>{ if(step===STEPS.length-1){ step=0; drawStep(false); } else { step++; drawStep(true); } };
  $('#prevStep').onclick=()=>{ if(step>0){ step--; drawStep(false); } };
  if(G&&!reduce){
    G.to($$('#spermGroup .tl'),{attr:{d:TAIL_B},duration:.17,repeat:-1,yoyo:true,ease:'sine.inOut'});
    G.to('#egg .corona',{rotation:360,duration:60,repeat:-1,ease:'none',transformOrigin:'50% 50%'});
  }
  drawStep(false);
  ENTER.p2b=()=>setEnd(step);

  /* ---------- Modo 3D: el código (y Three.js) solo se descarga al pulsar el botón ---------- */
  let viewer=null;
  $('#view3d').onclick=async()=>{
    viewer ||= await import('../modo3d/viewer.js');
    viewer.open3D({
      steps:STEPS, cells:CELLS,
      scene:()=>import('../fecundacion3d/scene.js'),
      title:'¿Cómo empieza un bebé?', done:'Ya sabes cómo empieza un bebé.',
      start:step,
      origin:$('#p2scope'),
      // Sincroniza el libro con el modo 3D. anim=true solo en el respaldo 2D, donde se ve esta misma ilustración.
      goStep:(i,anim)=>{ step=i; drawStep(anim); },
      opener:$('#view3d')
    });
  };
}
