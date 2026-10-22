/* ==========================================================
   Motor compartido de las escenas 3D (Three.js, estilo caricatura)
   Lo usan fecundacion3d/scene.js y embarazo3d/scene.js. Cada escena pone sus personajes
   y sus pasos; aquí vive todo lo demás: render, cámara por pasos, tocar personajes,
   partículas del ambiente, ciclo de dibujo y limpieza al cerrar.

   const k = createKit(host, opts)      → herramientas (toon, outline, face, pickable…)
   return k.api({ POSE, PLAY, tick, dispose })
     POSE[id]() estado FINAL del paso, sin animar
     PLAY[id]() anima desde el paso anterior y devuelve un timeline de GSAP
     tick(dt, t) se llama en cada cuadro (antes de dibujar)
   ========================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export { THREE };
export const V = (x,y,z) => new THREE.Vector3(x,y,z);
export const INK = '#1C2B4B';

export function createKit(host, { steps, G, reduce, onPick, safeArea, light=['#FFF7E6','#F3C9A0'], dust:dustColor='#FFC978' }){
  /* ---------- motor ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));       // dpr máximo 2
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 120);
  scene.add(new THREE.HemisphereLight(light[0], light[1], 1.25));
  const sun = new THREE.DirectionalLight('#FFFFFF', 1.3); sun.position.set(4,7,9); scene.add(sun);

  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping:true, dampingFactor:.08, enablePan:false, rotateSpeed:.6, zoomSpeed:.6 });

  const ctx = G.context(()=>{});      // agrupa todos los tweens para poder matarlos al cerrar
  const picks = [];                   // objetos que se pueden tocar
  const frameHooks = [];

  /* ---------- materiales y piezas ---------- */
  const grad = new THREE.DataTexture(new Uint8Array([165, 215, 255]), 3, 1, THREE.RedFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const toon = (color, o={}) => new THREE.MeshToonMaterial({ color, gradientMap:grad, ...o });
  const mesh = (geo, mat) => new THREE.Mesh(geo, mat);
  // Contorno caricatura: copia de la malla por dentro, un poco más grande y de un solo color
  function outline(m, color=INK, t=.05, opacity=1){
    const o = mesh(m.geometry, new THREE.MeshBasicMaterial({ color, side:THREE.BackSide, transparent:true, opacity }));
    o.scale.setScalar(1+t); o.raycast = () => {}; o.userData.outline = true; m.add(o); return m;
  }
  // Carita sonriente sobre el frente (+z) de una esfera de radio r
  function face(r){
    const g = new THREE.Group(), ink = new THREE.MeshBasicMaterial({ color:INK }), white = new THREE.MeshBasicMaterial({ color:'#fff' });
    [-1,1].forEach(s=>{
      const eye = mesh(new THREE.SphereGeometry(r*.1,16,12), ink); eye.position.set(s*r*.3, r*.14, r*.93); g.add(eye);
      const shine = mesh(new THREE.SphereGeometry(r*.035,8,6), white); shine.position.set(s*r*.3+r*.03, r*.18, r*1.02); g.add(shine);
      const cheek = mesh(new THREE.SphereGeometry(r*.12,12,8), new THREE.MeshBasicMaterial({ color:'#FF8A8F', transparent:true, opacity:.55 }));
      cheek.scale.set(1,.6,.3); cheek.position.set(s*r*.52, -r*.06, r*.84); g.add(cheek);
    });
    const smile = mesh(new THREE.TorusGeometry(r*.2, r*.035, 8, 20, Math.PI), ink);
    smile.rotation.z = Math.PI; smile.position.set(0, -r*.05, r*.96); g.add(smile);
    return g;
  }
  // Envuelve un objeto para poder tocarlo: root (lo mueve la coreografía) > bounce (rebote) > inner
  function pickable(inner, key){
    const root = new THREE.Group(), bounce = new THREE.Group();
    bounce.add(inner); root.add(bounce); root.userData = { key, bounce, inner }; picks.push(root); return root;
  }
  const fib = (n,R) => Array.from({length:n},(_,i)=>{ const y=1-2*(i+.5)/n, r=Math.sqrt(1-y*y), a=i*2.39996; return V(Math.cos(a)*r*R, y*R, Math.sin(a)*r*R); });
  // Textura de brillo suave (partículas y halo)
  const glowTex = (()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d');
    const g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g; x.fillRect(0,0,64,64); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const isShown = o => { for (let p=o; p; p=p.parent) if (!p.visible) return false; return true; };

  /* ---------- ambiente: partículas flotantes ---------- */
  const N = 260, pp = new Float32Array(N*3);
  for (let i=0;i<N;i++){ pp[i*3]=(Math.random()-.5)*30; pp[i*3+1]=(Math.random()-.5)*18; pp[i*3+2]=-10+Math.random()*16; }
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pp,3));
  const dust = new THREE.Points(pgeo, new THREE.PointsMaterial({ size:.22, map:glowTex, color:dustColor, transparent:true, opacity:.75, depthWrite:false }));
  scene.add(dust);

  /* ---------- tweens del paso: se matan al cambiar de paso ---------- */
  let tl = null; const loose = [];
  const T = (...a) => { const tw = G.to(...a); loose.push(tw); return tw; };            // tweens creados dentro de callbacks
  const TF = (...a) => { const tw = G.fromTo(...a); loose.push(tw); return tw; };
  const stop = () => { tl?.kill(); tl = null; loose.splice(0).forEach(tw=>tw.kill()); };

  /* ---------- cámara: una "toma" por paso ---------- */
  let current = 0, homeAt = null, camTween = null, dragging = false, lastTouch = 0;
  const fit = () => { const sa = safeArea?.() || { top:0, bottom:0 }, h = host.clientHeight || 1, free = Math.max(.35, 1 - (sa.top + sa.bottom)/h);
    const a = camera.aspect; return (a < 1.25 ? Math.min(2.2, 1.35/a) : 1) / Math.sqrt(free); };   // se aleja en vertical y si queda poco espacio libre
  function shotOf(i){
    const s = steps[i].shot, target = V(...s.target), off = V(...s.cam).sub(target).multiplyScalar(fit());
    return { target, pos: target.clone().add(off), off };
  }
  function limits(on, off){
    if (!on){ Object.assign(controls,{ minDistance:0, maxDistance:Infinity, minAzimuthAngle:-Infinity, maxAzimuthAngle:Infinity, minPolarAngle:0, maxPolarAngle:Math.PI }); return; }
    const d = off.length(), sp = new THREE.Spherical().setFromVector3(off);
    Object.assign(controls,{ minDistance:d*.6, maxDistance:d*1.35, minAzimuthAngle:sp.theta-.8, maxAzimuthAngle:sp.theta+.8,
      minPolarAngle:Math.max(.25*Math.PI, sp.phi-.55), maxPolarAngle:Math.min(.7*Math.PI, sp.phi+.45) });
  }
  function home(animate){
    const sh = shotOf(current); homeAt = sh; camTween?.kill(); limits(false);
    if (!animate || reduce){ camera.position.copy(sh.pos); controls.target.copy(sh.target); controls.update(); limits(true, sh.off); return; }
    const from = { p:camera.position.clone(), t:controls.target.clone() }, o = { k:0 };
    camTween = G.to(o,{ k:1, duration:1.6, ease:'power2.inOut',
      onUpdate:()=>{ camera.position.lerpVectors(from.p, sh.pos, o.k); controls.target.lerpVectors(from.t, sh.target, o.k); },
      onComplete:()=>limits(true, sh.off) });
  }
  controls.addEventListener('start',()=>{ dragging=true; camTween?.kill(); limits(true, homeAt.off); });
  controls.addEventListener('end',()=>{ dragging=false; lastTouch=performance.now(); });

  /* ---------- tocar personajes ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null, prefer = null;
  renderer.domElement.addEventListener('pointerdown', e=>{ down = { x:e.clientX, y:e.clientY, t:performance.now() }; });
  renderer.domElement.addEventListener('pointerup', e=>{
    if (!down || Math.hypot(e.clientX-down.x, e.clientY-down.y) > 8 || performance.now()-down.t > 600) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(picks.filter(isShown), true).map(h=>{ let o=h.object; while(o && !o.userData.key) o=o.parent; return o; }).filter(Boolean);
    const hit = (prefer && hits.find(o=>prefer.includes(o.userData.key))) || hits[0];     // lo que se ve a través de capas translúcidas
    if (!hit) return;
    const b = hit.userData.bounce;
    if (!reduce) G.fromTo(b.scale,{x:1.25,y:.8,z:1.25},{x:1,y:1,z:1,duration:.9,ease:'elastic.out(1.2,.35)'});
    onPick?.(hit.userData.key, hit);
  });

  /* ---------- ciclo de dibujo ---------- */
  const clock = new THREE.Clock(); let t = 0, sceneTick = null;
  const wp = new THREE.Vector3();
  function loop(){
    const dt = Math.min(clock.getDelta(), .05); if (!reduce) t += dt;
    sceneTick?.(dt, t);
    const a = dust.geometry.attributes.position.array;
    for (let i=1;i<a.length;i+=3){ a[i] += dt*.18; if (a[i] > 9) a[i] = -9; }
    dust.geometry.attributes.position.needsUpdate = true;
    controls.update();
    // si el niño deja de mover la cámara 3 segundos, vuelve sola a la toma del paso
    if (!dragging && lastTouch && performance.now()-lastTouch > 3000){ lastTouch = 0; home(true); }
    renderer.render(scene, camera);
    frameHooks.forEach(f=>f());
  }
  function resize(){
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w/h;
    // centra la escena en el hueco libre entre la barra superior y el panel de texto
    const sa = safeArea?.() || { top:0, bottom:0 };
    camera.setViewOffset(w, h, 0, (sa.bottom - sa.top)/2, w, h);
    camera.updateProjectionMatrix();
    if (!dragging && homeAt) home(false);
  }
  const ro = new ResizeObserver(resize);
  function project(obj){
    obj.getWorldPosition(wp).project(camera);
    if (wp.z > 1) return null;
    return { x:(wp.x+1)/2*host.clientWidth, y:(1-wp.y)/2*host.clientHeight };
  }

  return {
    THREE, scene, camera, G, reduce, toon, mesh, outline, face, pickable, fib, glowTex, isShown, T, TF, stop,
    // claves que ganan al tocar aunque haya algo translúcido delante (p. ej. ['celula'])
    preferPick: keys => { prefer = keys; },
    // Cierra la escena: arranca el ciclo y devuelve la API que usa modo3d/viewer.js
    api({ POSE, PLAY, tick, dispose }){
      sceneTick = tick;
      ro.observe(host); resize(); home(false);
      renderer.setAnimationLoop(loop);
      return {
        // Muestra el paso i. animate=true reproduce su animación. Devuelve cuánto dura (s).
        show(i, animate){
          current = i; home(animate);
          const id = steps[i].id;
          if (!animate || reduce){ POSE[id](); return 0; }
          let d = 0; ctx.add(()=>{ tl = PLAY[id](); d = tl.duration(); });
          return d;
        },
        home,
        // la mano de la pista apunta a userData.anchor si la pieza lo tiene (p. ej. la pared del útero, no su centro)
        screenOf(key){ const o = picks.find(p=>p.userData.key===key && isShown(p)); return o ? project(o.userData.anchor || o) : null; },
        screenOfObj: o => isShown(o) ? project(o) : null,
        onFrame: f => frameHooks.push(f),
        dispose(){
          renderer.setAnimationLoop(null); ro.disconnect(); ctx.kill(); stop(); camTween?.kill(); controls.dispose();
          dispose?.();
          scene.traverse(o=>{ o.geometry?.dispose(); [].concat(o.material||[]).forEach(m=>{ m.map?.dispose(); m.dispose(); }); });
          grad.dispose(); glowTex.dispose();
          renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
        }
      };
    }
  };
}
