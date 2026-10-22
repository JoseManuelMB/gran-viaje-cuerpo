/* ==========================================================
   Escena 3D del embarazo (Three.js procedural, mismo estilo caricatura que la fecundación)
   Útero con su bolsa de agua, placenta, cordón umbilical y un bebé que pasa de embrión a feto,
   crece, patea, abre los ojos, se chupa el dedo y se voltea de cabeza.
   El motor (render, cámara por pasos, tocar, limpieza) está en modo3d/kit.js.

   Todo el movimiento sale de un solo estado `st` (lo animan los PLAY con GSAP) que apply() pinta.
   Cada paso de STEPS (data/embarazo-pasos.js) tiene aquí su estado final en TARGET[id],
   POSE[id]() (sin animar) y PLAY[id]() (anima desde el paso anterior).
   ========================================================== */
import { createKit, THREE, V } from '../modo3d/kit.js';

const C = { skin:'#F4C3A1', skinLine:'#C98B66', blush:'#FF8A8F', lips:'#D95A63', hair:'#7A4B32', ink:'#1C2B4B',
            pink:'#E9464F', pinkSoft:'#F7B3B7', placenta:'#E9646C', lobe:'#D9444E', aqua:'#C8F2EC',
            lilac:'#A99CFF', purple:'#6C5CE7', gold:'#F6C35B' };

export function createScene(host, opts){
  const kit = createKit(host, { ...opts, light:['#FFF7F2','#F6C3B5'], dust:'#FFB3C1' });
  const { scene, G, toon, mesh, outline, pickable, glowTex, T, TF } = kit;
  kit.preferPick(['corazon','bebe','cordon','placenta']);    // se ven a través de la bolsa y del útero

  const skin = toon(C.skin);
  const part = geo => outline(mesh(geo, skin), C.skinLine, .05);
  const inkMat = new THREE.MeshBasicMaterial({ color:C.ink }), white = new THREE.MeshBasicMaterial({ color:'#fff' });
  const glow = (color, s) => { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color, transparent:true, depthWrite:false })); g.scale.setScalar(s); return g; };
  const heartShape = new THREE.Shape(); heartShape.moveTo(0,-.5); heartShape.bezierCurveTo(-.9,.1,-.55,.75,0,.35); heartShape.bezierCurveTo(.55,.75,.9,.1,0,-.5);
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth:.15, bevelEnabled:true, bevelSize:.05, bevelThickness:.05, bevelSegments:2 }); heartGeo.center();
  // Corazón que late (se puede tocar) con un brillo detrás
  function beatingHeart(s){
    const g = new THREE.Group(), h = outline(mesh(heartGeo, toon(C.pink)), '#9E2530', .08);
    h.scale.setScalar(s); g.add(glow('#FF8A8F', s*3.2), h); g.userData.h = h; g.userData.s = s;
    return pickable(g, 'corazon');
  }

  /* ---------- útero, bolsa de agua y placenta (crecen juntos: grupo womb) ----------
     Vista en corte: del útero y de la bolsa solo se dibuja la pared del fondo (BackSide),
     así nada translúcido queda delante del bebé y se ve nítido desde cualquier ángulo. */
  const womb = new THREE.Group(); scene.add(womb);
  const bulge = new THREE.Group();                       // se abomba con las pataditas
  const wall = (color, opacity) => toon(color, { transparent:true, opacity, depthWrite:false, side:THREE.BackSide });
  const utMesh = outline(mesh(new THREE.SphereGeometry(4.4,48,32), wall(C.pinkSoft, .75)), C.pink, .025, .8);
  utMesh.scale.set(1,1.08,.92); utMesh.renderOrder = 1; bulge.add(utMesh);
  const utero = pickable(bulge, 'utero'); womb.add(utero);
  const sac = mesh(new THREE.SphereGeometry(3.95,48,32), new THREE.MeshBasicMaterial({ color:C.aqua, transparent:true, opacity:.4, depthWrite:false, side:THREE.BackSide }));
  sac.renderOrder = 2; const bolsa = pickable(sac, 'bolsa'); womb.add(bolsa);
  // dónde apunta la mano de la pista: a la pared y a la bolsa, no a su centro (ahí está el bebé)
  [[utero,[-4.2,-1.1,1]],[bolsa,[-2.5,-2.4,1.2]]].forEach(([o,p])=>{ const a = new THREE.Object3D(); a.position.set(...p); womb.add(a); o.userData.anchor = a; });
  // placenta: disco aplanado pegado a la pared, con su cara de "gajitos" mirando al bebé
  const plInner = new THREE.Group();
  const disc = outline(mesh(new THREE.SphereGeometry(1.15,32,20), toon(C.placenta)), '#B8323A', .05); disc.scale.set(1,1,.35); plInner.add(disc);
  for (let i=0;i<7;i++){ const a = i/7*Math.PI*2, r = i ? .62 : 0;
    const l = mesh(new THREE.SphereGeometry(.3,16,12), toon(C.lobe)); l.scale.set(1,1,.45); l.position.set(Math.cos(a)*r, Math.sin(a)*r, .3); plInner.add(l); }
  const plAnchor = new THREE.Object3D(); plAnchor.position.z = .35; plInner.add(plAnchor);
  const placenta = pickable(plInner, 'placenta');
  placenta.position.copy(V(.55,.72,-.45).normalize().multiplyScalar(3.75)); placenta.lookAt(0,0,0); womb.add(placenta);
  // burbujitas que suben dentro de la bolsa
  const bubMat = new THREE.MeshBasicMaterial({ color:'#fff', transparent:true, opacity:.45 });
  const bubbles = Array.from({length:12}, (_,i)=>{ const b = mesh(new THREE.SphereGeometry(.07+(i%3)*.03,10,8), bubMat);
    b.position.set(Math.sin(i*2.4)*2.4, -3+((i*1.37)%6), Math.cos(i*1.7)*1.6); womb.add(b); return b; });

  /* ---------- bebé: embrión y feto dentro de babyRoot (lo voltea) > bob (flota) ---------- */
  const babyRoot = new THREE.Group(), bob = new THREE.Group(); babyRoot.add(bob); scene.add(babyRoot);

  // Embrión: frijolito en forma de "C" hecho de esferas, con ojito, corazón y yemas de bracitos/piernitas
  const emb = new THREE.Group();
  for (let i=0;i<14;i++){ const u = i/13, a = THREE.MathUtils.lerp(2.1,-2.5,u), r = THREE.MathUtils.lerp(.62,.1,Math.pow(u,.8));
    const s = part(new THREE.SphereGeometry(1,24,16)); s.scale.setScalar(r); s.position.set(.15+Math.cos(a)*.75, Math.sin(a)*.82, 0); emb.add(s); }
  const embEye = mesh(new THREE.SphereGeometry(.09,12,8), inkMat); embEye.position.set(-.45,.82,.55); emb.add(embEye);
  const buds = [[.62,.2,.32],[.62,.2,-.32],[.3,-.55,.17],[.3,-.55,-.17]].map(p=>{ const b = part(new THREE.SphereGeometry(.13,14,10)); b.scale.set(1.3,.8,.8); b.position.set(...p); emb.add(b); return b; });
  const embHeart = beatingHeart(.22); embHeart.position.set(.2,.05,.38); emb.add(embHeart);
  const navE = new THREE.Object3D(); navE.position.set(.28,-.3,.3); emb.add(navE);
  const embRoot = pickable(emb, 'bebe'); bob.add(embRoot);

  // Feto: cabezota, cuerpo, brazos y piernas dobladas (cadenas hombro-codo-mano / cadera-rodilla-pie)
  const fet = new THREE.Group();
  const head = part(new THREE.SphereGeometry(.95,40,28)); head.position.set(0,.95,.12); fet.add(head);
  const body = part(new THREE.SphereGeometry(1,32,24)); body.scale.set(.8,.95,.75); body.position.set(0,-.45,0); body.rotation.x = .15; fet.add(body);
  [-1,1].forEach(s=>{ const ear = part(new THREE.SphereGeometry(.2,16,12)); ear.scale.set(.6,1,.5); ear.position.set(s*.93,.92,.1); fet.add(ear); });
  const UP = V(0,1,0), dir = new THREE.Vector3();
  function chain(r, tip){
    const g = new THREE.Group(), segs = [0,1].map(()=>part(new THREE.CylinderGeometry(r, r*.9, 1, 14)));
    const joint = part(new THREE.SphereGeometry(r,16,12)), end = part(tip);
    g.add(...segs, joint, end);
    g.userData.set = (a,b,c) => {
      [[a,b],[b,c]].forEach(([p,q],i)=>{ dir.subVectors(q,p); const L = dir.length();
        segs[i].position.copy(p).addScaledVector(dir,.5); segs[i].scale.set(1,L,1); segs[i].quaternion.setFromUnitVectors(UP, dir.normalize()); });
      joint.position.copy(b); end.position.copy(c);
    };
    fet.add(g); return g;
  }
  const foot = () => { const g = new THREE.SphereGeometry(.22,16,12); g.scale(1,.7,1.45); return g; };
  const arms = [chain(.17, new THREE.SphereGeometry(.21,16,12)), chain(.17, new THREE.SphereGeometry(.21,16,12))];
  const legs = [chain(.22, foot()), chain(.22, foot())];
  // poses [hombro/cadera, codo/rodilla, mano/pie]: brazo derecho del bebé = izquierda de la pantalla
  const P = a => a.map(p=>V(...p));
  const ARM = [P([[-.6,0,.05],[-.78,-.5,.5],[-.38,.12,.82]]), P([[.6,0,.05],[.78,-.5,.5],[.38,.12,.82]])];
  const THUMB = P([[-.6,0,.05],[-.66,-.3,.72],[-.1,.56,1.1]]);
  const LEG = [P([[-.4,-1.05,.2],[-.5,-.55,1],[-.36,-1.25,1.12]]), P([[.4,-1.05,.2],[.5,-.55,1],[.36,-1.25,1.12]])];
  const KICK = P([[.4,-1.05,.2],[.55,-1.4,.85],[.6,-2.15,.55]]);
  const tmp = [V(),V(),V()];
  const pose = (from, to, k) => tmp.map((v,i)=>v.lerpVectors(from[i], to[i], k));
  // cara: ojos cerrados (∪) o abiertos, cachetes, naricita, boca y pelito
  const shut = new THREE.Group(), open = new THREE.Group(), faceG = new THREE.Group();
  [-1,1].forEach(s=>{
    const lid = mesh(new THREE.TorusGeometry(.12,.026,8,16,Math.PI), inkMat); lid.rotation.z = Math.PI; lid.position.set(s*.32,1.04,1.02); shut.add(lid);
    const eye = mesh(new THREE.SphereGeometry(.11,16,12), inkMat); eye.position.set(s*.32,1.0,.99); open.add(eye);
    const sh = mesh(new THREE.SphereGeometry(.04,8,6), white); sh.position.set(s*.32+.04,1.05,1.09); open.add(sh);
    const cheek = mesh(new THREE.SphereGeometry(.15,12,8), new THREE.MeshBasicMaterial({ color:C.blush, transparent:true, opacity:.55 }));
    cheek.scale.set(1,.6,.3); cheek.position.set(s*.52,.78,.92); faceG.add(cheek);
  });
  const nose = part(new THREE.SphereGeometry(.07,12,8)); nose.position.set(0,.84,1.07);
  const mouth = mesh(new THREE.TorusGeometry(.09,.022,8,14,Math.PI), new THREE.MeshBasicMaterial({ color:C.lips })); mouth.rotation.z = Math.PI; mouth.position.set(0,.64,1.04);
  const hairMat = toon(C.hair);
  [[-.2,1.84,.36,.4],[.02,1.9,.26,0],[.22,1.84,.32,-.4]].forEach(([x,y,z,r])=>{ const h = mesh(new THREE.TorusGeometry(.1,.035,8,16,Math.PI*1.4), hairMat); h.position.set(x,y,z); h.rotation.set(-.5,0,r); faceG.add(h); });
  faceG.add(shut, open, nose, mouth); fet.add(faceG);
  const fetHeart = beatingHeart(.28); fetHeart.position.set(0,-.12,.8); fet.add(fetHeart);
  const navF = new THREE.Object3D(); navF.position.set(0,-.62,.74); fet.add(navF);
  const fetRoot = pickable(fet, 'bebe'); bob.add(fetRoot);

  /* ---------- cordón umbilical (se rehace cada cuadro para seguir al bebé) y comidita que viaja ---------- */
  const stripes = (()=>{ const c = document.createElement('canvas'); c.width = 64; c.height = 16; const x = c.getContext('2d');
    x.fillStyle = C.lilac; x.fillRect(0,0,64,16); x.strokeStyle = '#fff'; x.lineWidth = 7; x.globalAlpha = .55;
    for (let i=-16;i<80;i+=32){ x.beginPath(); x.moveTo(i,16); x.lineTo(i+16,0); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12,1); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const cordMesh = mesh(new THREE.BufferGeometry(), toon('#fff', { map:stripes }));
  const cordOut = mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color:C.purple, side:THREE.BackSide })); cordOut.raycast = () => {};
  const cordInner = new THREE.Group(); cordInner.add(cordMesh, cordOut);
  const cord = pickable(cordInner, 'cordon'); scene.add(cord);
  const cordMid = new THREE.Object3D(); scene.add(cordMid); cord.userData.anchor = cordMid;
  const food = Array.from({length:8}, (_,i)=>{ const f = glow(i%2 ? C.gold : '#FFFFFF', .4); scene.add(f); return f; });
  let cordCurve = null;
  const A = V(), B = V(), P1 = V(), P2 = V();

  /* ---------- efectos: ondas de voz, chispazo y corazones ---------- */
  const rings = [0,1,2].map(()=>{ const r = mesh(new THREE.TorusGeometry(1,.09,8,48), new THREE.MeshBasicMaterial({ color:C.purple, transparent:true, opacity:0 })); r.visible = false; scene.add(r); return r; });
  const VOICE = V(-5.4,1.2,.6);
  const spark = glow('#FFF4C2', 1); spark.visible = false; scene.add(spark);
  const love = [0,1,2].map(()=>{ const h = mesh(heartGeo, toon(C.pink, { transparent:true })); h.visible = false; scene.add(h); return h; });

  /* ---------- estado ---------- */
  const S0 = { womb:.45, emb:.42, fet:0, buds:0, eyes:0, thumb:0, kick:0, hic:0, turn:0, cord:0, flow:0 };
  const TARGET = {
    mes1:   { ...S0 },
    mes2:   { ...S0, womb:.55, emb:.62, buds:1 },
    cordon: { ...S0, womb:.7, emb:0, fet:.5, cord:1, flow:1 },
    patadas:{ ...S0, womb:.85, emb:0, fet:.72, cord:1, flow:1 },
    crecer: { ...S0, womb:.95, emb:0, fet:.92, eyes:1, thumb:1, cord:1, flow:1 },
    voltear:{ ...S0, womb:1, emb:0, fet:1.05, eyes:1, turn:1, cord:1, flow:1 }
  };
  const st = { ...S0 };
  const tiny = v => Math.max(v, .001);
  function apply(){
    womb.scale.setScalar(st.womb);
    embRoot.visible = st.emb > .01; embRoot.scale.setScalar(tiny(st.emb));
    fetRoot.visible = st.fet > .01; fetRoot.scale.setScalar(tiny(st.fet));
    buds.forEach(b=>{ b.visible = st.buds > .01; b.scale.set(1.3,.8,.8).multiplyScalar(tiny(st.buds)); });
    open.visible = st.eyes > .5; shut.visible = !open.visible;
    arms[0].userData.set(...pose(ARM[0], THUMB, st.thumb)); arms[1].userData.set(...ARM[1]);
    legs[0].userData.set(...LEG[0]); legs[1].userData.set(...pose(LEG[1], KICK, st.kick));
    babyRoot.rotation.z = st.turn*Math.PI*.92; babyRoot.rotation.y = Math.sin(st.turn*Math.PI)*.7;   // da la marometa
    babyRoot.position.y = -.15 + st.hic*.3 - st.turn*.2;
  }
  function fx(){
    rings.forEach(r=>{ r.visible = false; r.material.opacity = 0; });
    spark.visible = false; love.forEach(h=>h.visible = false); bulge.scale.setScalar(1);
  }

  /* ---------- poses: estado final de cada paso ---------- */
  const POSE = {};
  Object.keys(TARGET).forEach(id=>{ POSE[id] = () => { kit.stop(); fx(); Object.assign(st, TARGET[id]); apply(); }; });

  /* ---------- animaciones: del paso anterior al actual ---------- */
  const go = (o, d=1.6, ease='power2.inOut') => ({ ...o, duration:d, ease, onUpdate:apply });
  function sparkle(){ spark.visible = true; spark.position.set(0,0,.6);
    TF(spark.scale,{x:.2,y:.2,z:.2},{x:4,y:4,z:4,duration:.9,ease:'power2.out'});
    TF(spark.material,{opacity:1},{opacity:0,duration:.9,onComplete:()=>{ spark.visible = false; }}); }
  function voices(){ rings.forEach((r,i)=>{ r.visible = true; r.position.copy(VOICE);
    TF(r.scale,{x:.2,y:.2,z:.2},{x:1.5,y:1.5,z:1.5,duration:1.4,delay:i*.45,repeat:2,ease:'power1.out'});
    TF(r.material,{opacity:.9},{opacity:0,duration:1.4,delay:i*.45,repeat:2,ease:'power1.in',onComplete:()=>{ r.visible = false; }}); }); }
  function hearts(){ love.forEach((h,i)=>{ h.visible = true; h.position.set((i-1)*1.2,1,1.5);
    TF(h.position,{y:1},{y:3.6,duration:2,delay:i*.3,ease:'power1.out'});
    TF(h.scale,{x:.1,y:.1,z:.1},{x:.6,y:.6,z:.6,duration:.5,delay:i*.3,ease:'back.out(3)'});
    T(h.material,{opacity:0,duration:.6,delay:1.5+i*.3,onComplete:()=>{ h.visible = false; h.material.opacity = 1; }}); }); }
  const PLAY = {
    // Aparece la bolita y su corazón empieza a latir
    mes1(){ POSE.mes1(); Object.assign(st,{ emb:0, womb:.36 }); apply();
      return G.timeline().to(st, go({ womb:.45, emb:.42 }, 1.6, 'elastic.out(1,.55)')).add(sparkle, .2); },
    // Crece y le brotan bracitos y piernitas
    mes2(){ POSE.mes1(); return G.timeline()
      .to(st, go({ womb:.55, emb:.62 }, 1.8))
      .to(st, go({ buds:1 }, 1, 'elastic.out(1,.5)'), '-=.4'); },
    // El embrión se vuelve bebé, sale el cordón desde la placenta y empieza a llegar la comida
    cordon(){ POSE.mes2(); return G.timeline()
      .to(st, go({ womb:.7 }, 1.4))
      .add(sparkle, '-=.5')
      .to(st, go({ emb:0 }, .45, 'back.in(1.6)'), '<')
      .to(st, go({ fet:.5 }, 1.2, 'elastic.out(1,.55)'))
      .to(st, go({ cord:1 }, 1.6, 'power1.inOut'))
      .to(st, go({ flow:1 }, .6)); },
    // Pataditas (la pancita se abomba), hipo y la voz de afuera
    patadas(){ POSE.cordon(); const t = G.timeline().to(st, go({ womb:.85, fet:.72 }, 1.5)).add(voices, '-=.3');
      [0,1].forEach(()=>t.to(st, go({ kick:1 }, .22, 'power2.out'))
        .to(bulge.scale,{ x:1.05, y:.97, duration:.2, yoyo:true, repeat:1 }, '<')
        .to(st, go({ kick:0 }, .45, 'power2.in')));
      [0,1].forEach(()=>t.to(st, go({ hic:1 }, .12, 'power2.out')).to(st, go({ hic:0 }, .3, 'bounce.out')));
      return t; },
    // Crece, abre los ojos (parpadea) y se lleva el dedo a la boca
    crecer(){ POSE.patadas(); return G.timeline()
      .to(st, go({ womb:.95, fet:.92 }, 1.5))
      .set(st, { eyes:1, onComplete:apply })
      .set(st, { eyes:0, onComplete:apply }, '+=.6')
      .set(st, { eyes:1, onComplete:apply }, '+=.15')
      .to(st, go({ thumb:1 }, 1.1, 'back.out(1.4)'), '+=.2'); },
    // Suelta el dedo y da la marometa hasta quedar de cabeza
    voltear(){ POSE.crecer(); return G.timeline()
      .to(st, go({ thumb:0, womb:1, fet:1.05 }, 1))
      .to(st, go({ turn:1 }, 3, 'power1.inOut'))
      .add(hearts); }
  };

  /* ---------- cada cuadro ---------- */
  function buildCord(){
    const on = st.cord > .01 && fetRoot.visible; cord.visible = on;
    food.forEach(f=>f.visible = on && st.flow > .01);
    if (!on) return;
    scene.updateMatrixWorld();
    plAnchor.getWorldPosition(A); navF.getWorldPosition(B);
    const s = st.womb;
    P1.copy(A).multiplyScalar(.5).add(tmp[0].set(.6,-1,1.3).multiplyScalar(s));
    P2.copy(B).add(tmp[0].set(1.2,.2,1).multiplyScalar(s));
    cordCurve = new THREE.CatmullRomCurve3([A.clone(), P1.clone(), P2.clone(), B.clone()]);
    const m = 24, grown = new THREE.CatmullRomCurve3(Array.from({length:m+1},(_,i)=>cordCurve.getPoint(i/m*st.cord)));
    const r = .05 + .06*s;
    cordMid.position.copy(grown.getPoint(.5));
    cordMesh.geometry.dispose(); cordMesh.geometry = new THREE.TubeGeometry(grown, 64, r, 10, false);
    cordOut.geometry.dispose(); cordOut.geometry = new THREE.TubeGeometry(grown, 64, r*1.3, 10, false);
  }
  function tick(dt, t){
    bob.position.y = Math.sin(t*.9)*.06; bob.rotation.z = Math.sin(t*.6)*.05;
    const rate = st.emb > .3 && st.buds < .5 ? 5 : 8, k = 1 + .22*Math.max(0, Math.sin(t*rate));
    [embHeart, fetHeart].forEach(h=>{ const { inner } = h.userData; inner.userData.h.scale.setScalar(inner.userData.s*k); });
    bubbles.forEach((b,i)=>{ b.position.y += dt*(.25+(i%3)*.08); if (b.position.y > 3) b.position.y = -3; });
    buildCord();
    if (cordCurve) food.forEach((f,i)=>{ f.position.copy(cordCurve.getPoint(((t*.18 + i/food.length)%1)*st.cord)); f.material.opacity = st.flow; f.scale.setScalar(.35*st.womb); });
    rings.forEach(r=>r.lookAt(kit.camera.position));
  }

  apply();
  return kit.api({ POSE, PLAY, tick, dispose:()=>heartGeo.dispose() });
}
