/* ==========================================================
   Escena 3D de la fecundación (Three.js, todo procedural: sin modelos .glb)
   Estilo caricatura: MeshToonMaterial + contornos de "casco invertido".
   El motor (render, cámara por pasos, tocar, limpieza) está en modo3d/kit.js.

   createScene(host, opts) → { show(i, animate), home(animate), screenOf(key), screenOfObj(obj), onFrame(fn), dispose() }
   Cada paso de STEPS (data/fecundacion-pasos.js) tiene aquí:
     POSE[id]() → coloca la escena en el estado FINAL del paso, sin animar
     PLAY[id]() → anima desde el paso anterior hasta ese estado (devuelve un timeline de GSAP)
   ========================================================== */
import { createKit, THREE, V } from '../modo3d/kit.js';

// Paleta: la misma de las ilustraciones claras del libro
const C = { cream:'#FFF3D0', yellow:'#FFF0B8', gold:'#F6C35B', orange:'#E59A0C', amber:'#FBD27A',
            purple:'#6C5CE7', lilac:'#B9AFFF', pink:'#E9464F', pinkSoft:'#F7B3B7', ink:'#1C2B4B', cheek:'#FF8A8F' };

export function createScene(host, opts){
  const kit = createKit(host, opts);
  const { scene, G, reduce, toon, mesh, outline, face, pickable, fib, glowTex, isShown, T, TF } = kit;
  kit.preferPick(['celula']);                // las células se ven a través de la capa

  /* ---------- óvulo ---------- */
  const eggInner = new THREE.Group(), breath = new THREE.Group(); eggInner.add(breath);
  const eggMat = toon(C.yellow, { transparent:true, opacity:.62, depthWrite:false });
  const eggBody = mesh(new THREE.SphereGeometry(2,48,32), eggMat);   // sin contorno: al ser translúcido se vería a través
  const zona = mesh(new THREE.SphereGeometry(2.17,48,32), toon(C.gold, { transparent:true, opacity:.14, depthWrite:false }));
  const nucleus = outline(mesh(new THREE.SphereGeometry(.55,32,16), toon(C.gold)), C.orange, .06);
  nucleus.position.set(.6,.55,-.3);
  const nucleolus = mesh(new THREE.SphereGeometry(.2,16,12), toon(C.orange)); nucleolus.position.set(.12,.1,.38); nucleus.add(nucleolus);
  const granules = new THREE.Group(), gmat = toon(C.orange, { transparent:true, opacity:.55 });
  for (let i=0;i<26;i++){ const g=mesh(new THREE.SphereGeometry(.07,8,6), gmat); const v=fib(26,1.55)[i]; g.position.copy(v).multiplyScalar(.6+((i*37)%10)/22); granules.add(g); }
  const eggFace = face(2); eggFace.position.z = .02;
  const corona = new THREE.Group(), cmat = toon(C.cream);
  fib(44,2.55).forEach(p=>{ const s=outline(mesh(new THREE.SphereGeometry(.25,16,12), cmat), C.gold, .1); s.position.copy(p); corona.add(s); });
  breath.add(eggBody, zona, nucleus, granules, eggFace, corona);
  const egg = pickable(eggInner, 'ovulo'); scene.add(egg);

  // Capa protectora (aparece al entrar el espermatozoide) y onda de "¡listo!"
  const shellMat = toon(C.orange, { transparent:true, opacity:.26, depthWrite:false });
  const shell = pickable(mesh(new THREE.SphereGeometry(2.3,48,32), shellMat), 'capa'); scene.add(shell);
  const ripple = mesh(new THREE.TorusGeometry(2.3,.07,8,72), new THREE.MeshBasicMaterial({ color:C.orange, transparent:true, opacity:0 })); scene.add(ripple);

  /* ---------- espermatozoides ---------- */
  const WIN = 1;
  const START = [V(-9,1.8,-.8), V(-9.8,.2,.8), V(-8.8,-1.7,.2), V(-10.2,-.6,-1.5), V(-8.4,2.9,1)];
  const ENDS = START.map((s,i)=>{ const d = i===WIN ? V(-1,.05,.3) : V(-1, s.y*.32, s.z*.35); return d.normalize().multiplyScalar(2.95); });
  const PATHS = START.map((s,i)=>{ const e=ENDS[i], w=i%2?1:-1;
    return new THREE.CatmullRomCurve3([s.clone(), s.clone().lerp(e,.35).add(V(0,w*1.1,.4)), s.clone().lerp(e,.7).add(V(0,-w*.8,-.3)), e.clone()]); });
  const X = V(1,0,0);
  function makeSperm(i){
    const mats = [toon(C.lilac,{transparent:true}), toon(C.purple,{transparent:true})];
    const inner = new THREE.Group();
    const head = outline(mesh(new THREE.SphereGeometry(.32,24,16), mats[0]), C.purple, .09); head.scale.set(1.3,.95,.95);
    const cap = mesh(new THREE.SphereGeometry(.27,20,12), mats[1]); cap.scale.set(.55,.85,.85); cap.position.x=.25;
    const ink = new THREE.MeshBasicMaterial({ color:C.ink, transparent:true });
    const eye = mesh(new THREE.SphereGeometry(.06,12,8), ink); eye.position.set(.1,.1,.28);
    const smile = mesh(new THREE.TorusGeometry(.07,.016,6,14,Math.PI), ink); smile.rotation.z=Math.PI; smile.position.set(.18,-.04,.27);
    const mid = mesh(new THREE.CylinderGeometry(.085,.07,.34,10), mats[1]); mid.rotation.z=Math.PI/2; mid.position.x=-.53;
    const tail = mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(-.68,0,0), V(-3.1,0,0)), 64, .06, 6, false), mats[1]);
    inner.add(head, cap, eye, smile, mid, tail);
    const root = pickable(inner, 'esperma');
    Object.assign(root.userData, { tail, base:Float32Array.from(tail.geometry.attributes.position.array), phase:i*1.7, speed:6, mats:[...mats, ink, head.children[0].material] });
    scene.add(root); return root;
  }
  const sperms = START.map((_,i)=>makeSperm(i));
  const tan = new THREE.Vector3();
  function placeOnPath(s, i, p, back=0){
    const c = PATHS[i]; s.position.copy(c.getPointAt(p)); c.getTangentAt(Math.min(p,.999), tan);
    if (back) s.position.addScaledVector(tan, -back);
    s.quaternion.setFromUnitVectors(X, tan);
  }
  const fade = (s,v) => s.userData.mats.forEach(m=>{ m.opacity=v; });

  /* ---------- células del embrión ---------- */
  const cellMat = toon(C.yellow), nucMat = toon(C.gold);
  function makeCell(){
    const inner = new THREE.Group();
    inner.add(outline(mesh(new THREE.SphereGeometry(1,32,24), cellMat), C.orange, .05));
    const n = mesh(new THREE.SphereGeometry(.3,16,12), nucMat); n.position.set(.35,.42,.2); inner.add(n);
    const hl = mesh(new THREE.SphereGeometry(.22,12,8), new THREE.MeshBasicMaterial({ color:'#fff', transparent:true, opacity:.7 })); hl.scale.set(1,.5,.4); hl.position.set(-.42,.55,.7); inner.add(hl);
    inner.add(face(1));
    const c = pickable(inner, 'celula'); scene.add(c); return c;
  }
  const cells = Array.from({length:8}, makeCell);
  const C2 = [V(-.98,0,0), V(.98,0,0)];
  const C8 = [V(-.62,.62,.62), V(.62,.62,.62), V(-.62,-.62,.62), V(.62,-.62,.62), V(-.62,.62,-.62), V(.62,.62,-.62), V(-.62,-.62,-.62), V(.62,-.62,-.62)];

  /* ---------- útero (esquema sencillo: la parte más difícil de llevar a 3D) ---------- */
  const uterus = new THREE.Group(); scene.add(uterus);
  const profile = [[0,-3.2],[.55,-3.2],[.62,-2.4],[.95,-1.6],[1.9,-.4],[2.6,.8],[2.72,1.7],[2.3,2.45],[1.2,2.8],[0,2.86]].map(([x,y])=>new THREE.Vector2(x,y));
  const utMat = toon(C.pinkSoft, { transparent:true, opacity:.5, depthWrite:false, side:THREE.DoubleSide });
  const utBody = outline(mesh(new THREE.LatheGeometry(profile, 48), utMat), C.pink, .025, .55);
  const lining = mesh(new THREE.LatheGeometry(profile, 48), toon(C.pink, { transparent:true, opacity:.22, depthWrite:false, side:THREE.DoubleSide })); lining.scale.setScalar(.9);
  uterus.add(pickable((()=>{ const g=new THREE.Group(); g.add(utBody, lining); return g; })(), 'utero'));
  const tubeMat = toon(C.pink), ovMat = toon(C.pinkSoft), folMat = toon(C.cream);
  [-1,1].forEach(s=>{
    const curve = new THREE.CatmullRomCurve3([V(s*2.3,2.1,0), V(s*3.6,3.05,0), V(s*5,2.6,0), V(s*5.6,1.45,0)]);
    const tube = outline(mesh(new THREE.TubeGeometry(curve, 48, .3, 12, false), tubeMat), '#B8323A', .06);
    const fimb = new THREE.Group();
    for (let k=0;k<5;k++){ const f=mesh(new THREE.ConeGeometry(.09,.5,8), tubeMat); f.position.set(s*(5.6+Math.cos(k)*.25), 1.1, Math.sin(k*1.4)*.25); f.rotation.z=s*(.3+k*.12); fimb.add(f); }
    uterus.add(pickable((()=>{ const g=new THREE.Group(); g.add(tube, fimb); return g; })(), 'trompa'));
    const ov = new THREE.Group();
    const body = outline(mesh(new THREE.SphereGeometry(.8,24,16), ovMat), C.pink, .06); body.scale.set(1,.7,.7); ov.add(body);
    fib(7,.62).forEach(p=>{ const f=mesh(new THREE.SphereGeometry(.12,10,8), folMat); f.position.set(p.x, p.y*.7, Math.abs(p.z)*.7+.1); ov.add(f); });
    const ovr = pickable(ov, 'ovario'); ovr.position.set(s*5.95,.35,0); uterus.add(ovr);
  });
  // Embrión chiquito que viaja y se pega a la pared, con halo y corazones
  const blastInner = new THREE.Group();
  fib(7,.22).concat([V(0,0,0)]).forEach(p=>{ const b=outline(mesh(new THREE.SphereGeometry(.2,14,10), cellMat), C.orange, .1); b.position.copy(p); blastInner.add(b); });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:C.amber, transparent:true, opacity:.9, depthWrite:false })); halo.scale.setScalar(1.8); blastInner.add(halo);
  const blast = pickable(blastInner, 'celula'); uterus.add(blast);
  const WALL = V(-1,.9,-2.15);
  const BLAST_PATH = new THREE.CatmullRomCurve3([V(-5.6,1.1,.3), V(-5,2.6,0), V(-3.6,3.05,0), V(-2.3,2.1,0), V(-1.4,1.4,-.9), WALL.clone()]);
  const heartShape = new THREE.Shape(); heartShape.moveTo(0,-.5); heartShape.bezierCurveTo(-.9,.1,-.55,.75,0,.35); heartShape.bezierCurveTo(.55,.75,.9,.1,0,-.5);
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth:.15, bevelEnabled:true, bevelSize:.05, bevelThickness:.05, bevelSegments:2 }); heartGeo.center();
  const hearts = [0,1,2].map(()=>{ const h=mesh(heartGeo, toon(C.pink,{transparent:true})); h.scale.setScalar(.5); h.visible=false; uterus.add(h); return h; });

  /* ---------- poses: estado final de cada paso ---------- */
  function base(){
    kit.stop();
    egg.visible=true; egg.scale.setScalar(1); eggBody.scale.setScalar(1); corona.scale.setScalar(1); corona.children.forEach(s=>s.scale.setScalar(1));
    eggMat.color.set(C.yellow);
    shell.visible=false; shell.scale.setScalar(1); shellMat.opacity=.26; ripple.material.opacity=0;
    sperms.forEach((s,i)=>{ s.visible=true; s.scale.setScalar(1); fade(s,1); placeOnPath(s,i,0); s.userData.speed=6; });
    cells.forEach(c=>{ c.visible=false; c.scale.setScalar(1); });
    uterus.visible=false; uterus.scale.setScalar(1); blast.visible=false; halo.material.opacity=.9; hearts.forEach(h=>h.visible=false);
  }
  const showCells = (n, pos, k) => cells.forEach((c,i)=>{ c.visible=i<n; if(i<n){ c.position.copy(pos[i]); c.scale.setScalar(k); } });
  const POSE = {
    conocer(){ base(); },
    nadar(){ base(); sperms.forEach((s,i)=>placeOnPath(s,i,1)); },
    entrar(){ POSE.nadar(); sperms.forEach((s,i)=>{ if(i===WIN) s.visible=false; else { placeOnPath(s,i,1,1); fade(s,.3); } });
      eggMat.color.set(C.amber); shell.visible=true; },
    dividir2(){ base(); egg.visible=false; sperms.forEach(s=>s.visible=false); shell.visible=true; showCells(2, C2, 1); },
    dividir8(){ POSE.dividir2(); showCells(8, C8, .72); },
    implantar(){ base(); egg.visible=false; sperms.forEach(s=>s.visible=false); uterus.visible=true; blast.visible=true; blast.position.copy(WALL); }
  };

  /* ---------- animaciones: del paso anterior al actual ---------- */
  const PLAY = {
    // Se presentan: el óvulo rebota y los espermatozoides aparecen nadando en su lugar
    conocer(){ POSE.conocer(); return G.timeline()
      .fromTo(egg.scale,{x:.7,y:.7,z:.7},{x:1,y:1,z:1,duration:1.2,ease:'elastic.out(1,.45)'})
      .fromTo(sperms.map(s=>s.scale),{x:0,y:0,z:0},{x:1,y:1,z:1,duration:.6,stagger:.12,ease:'back.out(2.4)'},.3); },
    // Nadan hacia el óvulo moviendo la colita más rápido
    nadar(){ POSE.conocer(); const t=G.timeline();
      sperms.forEach((s,i)=>{ const o={p:0}; s.userData.speed=15;
        t.to(o,{p:1,duration:3+i*.25,ease:'power1.inOut',onUpdate:()=>placeOnPath(s,i,o.p),onComplete:()=>{ s.userData.speed=6; }},0); });
      return t; },
    // Uno entra: el óvulo se pone dorado y forma su capa protectora; los demás se quedan afuera
    entrar(){ POSE.nadar(); const w=sperms[WIN], into=ENDS[WIN].clone().multiplyScalar(.4), col={v:0}, a=new THREE.Color(C.yellow), b=new THREE.Color(C.amber);
      return G.timeline()
        .to(w.position,{x:into.x,y:into.y,z:into.z,duration:1.3,ease:'power2.in'})
        .to(w.scale,{x:0,y:0,z:0,duration:.5,ease:'power2.in'},'-=.5')
        .add(()=>{ shell.visible=true; })
        .fromTo(shell.scale,{x:.85,y:.85,z:.85},{x:1,y:1,z:1,duration:1,ease:'elastic.out(1,.5)'})
        .fromTo(ripple.scale,{x:1,y:1,z:1},{x:1.6,y:1.6,z:1.6,duration:1.1,ease:'power2.out'},'<')
        .fromTo(ripple.material,{opacity:1},{opacity:0,duration:1.1},'<')
        .to(col,{v:1,duration:1,onUpdate:()=>eggMat.color.copy(a).lerp(b,col.v)},'<')
        .to(egg.scale,{x:1.05,y:1.05,z:1.05,duration:.18,yoyo:true,repeat:3},'<')
        .add(()=>sperms.forEach((s,i)=>{ if(i===WIN) return; const o={p:0,v:1};
          T(o,{p:1,v:.3,duration:1.2,onUpdate:()=>{ placeOnPath(s,i,1,o.p); fade(s,o.v); }}); }),'<'); },
    // Se vuelve una célula nueva y se divide en 2
    dividir2(){ POSE.entrar(); const z=cells[0], n=cells[1];
      return G.timeline()
        .to(sperms.filter(s=>s.visible).map(s=>s.scale),{x:0,y:0,z:0,duration:.4})
        .to(corona.children.map(s=>s.scale),{x:0,y:0,z:0,duration:.5,stagger:{each:.01,from:'random'}},0)
        .to(corona.scale,{x:1.5,y:1.5,z:1.5,duration:.8},0)
        .to(eggBody.scale,{x:.75,y:.75,z:.75,duration:.7,ease:'power2.inOut'},.2)
        .add(()=>{ egg.visible=false; z.visible=true; z.position.set(0,0,0); })
        .fromTo(z.scale,{x:1.4,y:1.4,z:1.4},{x:1.55,y:1.55,z:1.55,duration:.5,yoyo:true,repeat:1})
        .add(()=>{ n.visible=true; n.position.set(0,0,0); })
        .to(z.position,{x:C2[0].x,duration:1.1,ease:'elastic.out(1,.55)'})
        .to(n.position,{x:C2[1].x,duration:1.1,ease:'elastic.out(1,.55)'},'<')
        .fromTo([z.scale,n.scale],{x:1.4,y:1.4,z:1.4},{x:1,y:1,z:1,duration:1.1,ease:'elastic.out(1,.55)'},'<'); },
    // De 2 a 4 a 8: cada célula sale de su "mamá"
    dividir8(){ POSE.dividir2(); const t=G.timeline();
      cells.forEach((c,i)=>{ const from=C2[i%2], at=i<2?0:(i<4?.9:1.7);
        if(i>=2) t.add(()=>{ c.visible=true; c.position.copy(from); c.scale.setScalar(.3); }, at);
        t.to(c.position,{x:C8[i].x,y:C8[i].y,z:C8[i].z,duration:1,ease:'elastic.out(1,.6)'},at)
         .to(c.scale,{x:.72,y:.72,z:.72,duration:1,ease:'elastic.out(1,.6)'},at); });
      return t; },
    // Viaja por la trompa hasta el útero y se pega a la pared: halo y corazones
    implantar(){ POSE.dividir8(); const o={p:0};
      return G.timeline()
        .to([...cells.map(c=>c.scale), shell.scale],{x:0,y:0,z:0,duration:.6,stagger:.03,ease:'back.in(1.6)'})
        .add(()=>{ cells.forEach(c=>c.visible=false); shell.visible=false; uterus.visible=true; blast.visible=true; blast.position.copy(BLAST_PATH.getPointAt(0)); })
        .fromTo(uterus.scale,{x:.6,y:.6,z:.6},{x:1,y:1,z:1,duration:1,ease:'elastic.out(1,.6)'})
        .to(o,{p:1,duration:3.2,ease:'power1.inOut',onUpdate:()=>blast.position.copy(BLAST_PATH.getPointAt(o.p))},'-=.3')
        .fromTo(blast.scale,{x:1,y:1,z:1},{x:1.35,y:1.35,z:1.35,duration:.3,yoyo:true,repeat:3})
        .add(()=>hearts.forEach((h,i)=>{ h.visible=true; h.position.copy(WALL);
          TF(h.position,{y:WALL.y},{y:WALL.y+2.4,x:WALL.x+(i-1)*.9,duration:2,delay:i*.3,ease:'power1.out'});
          TF(h.scale,{x:.1,y:.1,z:.1},{x:.5,y:.5,z:.5,duration:.5,delay:i*.3,ease:'back.out(3)'});
          T(h.material,{opacity:0,duration:.6,delay:1.5+i*.3,onComplete:()=>{ h.visible=false; h.material.opacity=1; }}); })); }
  };

  /* ---------- cada cuadro ---------- */
  function tick(dt, t){
    breath.scale.setScalar(1 + Math.sin(t*1.3)*.025);          // el óvulo "respira"
    corona.rotation.y += reduce ? 0 : dt*.06;
    sperms.forEach(s=>{
      if (!isShown(s)) return;
      const { tail, base, phase, speed } = s.userData, arr = tail.geometry.attributes.position.array, k = t*speed + phase;
      for (let j=0;j<arr.length;j+=3){
        const u = Math.min(1, Math.max(0, (-.68 - base[j]) / 2.42)), taper = 1 - .65*u;
        arr[j+1] = base[j+1]*taper + Math.sin(u*8 - k)*.34*u;
        arr[j+2] = base[j+2]*taper + Math.cos(u*8 - k)*.06*u;
      }
      tail.geometry.attributes.position.needsUpdate = true;
      s.userData.inner.position.y = Math.sin(t*2 + phase)*.06;
    });
    ripple.lookAt(kit.camera.position);
    if (blast.visible) halo.material.opacity = .65 + Math.sin(t*3)*.25;
  }

  return kit.api({ POSE, PLAY, tick, dispose:()=>heartGeo.dispose() });
}
