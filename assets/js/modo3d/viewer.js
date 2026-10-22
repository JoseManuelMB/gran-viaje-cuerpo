/* ==========================================================
   Modo 3D a pantalla completa (lo usan la parada 2 y la parada 3)
   - Se expande desde la ilustración del libro (y vuelve a ella al cerrar)
   - Mismos pasos que el libro; el estado se sincroniza en ambos sentidos con goStep()
   - Three.js se descarga aquí, al abrir (scene()). Sin WebGL → respaldo 2D con la ilustración del libro

   open3D({ steps, start, origin, goStep, opener,       ← pasos y sincronía con el libro
            scene: () => import('…/scene.js'),          ← escena de esa parada (createScene)
            cells, title, done, count(i), theme, color })← textos, colores y etiqueta del paso
   ========================================================== */
import { G, reduce, boom, rain } from '../core/motion.js';
import { store } from '../core/dom.js';

const ICON = {
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  on:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9c1.5 1.7 1.5 4.3 0 6M19 6c3.3 3.4 3.3 8.6 0 12"/></svg>',
  off:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 10l4 4M21 10l-4 4"/></svg>',
  replay:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg>'
};

const hasWebGL = () => {
  if (new URLSearchParams(location.search).get('webgl') === 'off') return false;   // para probar el respaldo
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch(e){ return false; }
};

let active = null;
export function open3D(opts){ if (!active) active = new Viewer(opts); return active; }

class Viewer {
  constructor({ steps, start, origin, goStep, opener, scene, cells, title, done, count, theme='', color='--c2' }){
    Object.assign(this, { steps, i:start, origin, goStep, opener, loadScene:scene, cells, title, doneText:done, count, theme, color,
      scene:null, flat:false, celebrated:false });
    this.voice = 'speechSynthesis' in window && store.get('voz3d', false);
    this.build();
    this.enter().then(()=>this.load());
  }

  /* ---------- estructura ---------- */
  build(){
    const r = this.root = document.createElement('div');
    r.className = `v3d ${this.theme}`; r.setAttribute('role','dialog'); r.setAttribute('aria-modal','true');
    r.setAttribute('aria-labelledby','v3dTitle'); r.setAttribute('aria-describedby','v3dText');
    r.innerHTML = `
      <div class="v3d-stage" id="v3dStage">
        <div class="v3d-loader" role="status">
          <span class="v3d-swim" aria-hidden="true"><i></i></span>
          <p>Preparando el viaje…</p>
        </div>
        <div class="v3d-layer" aria-hidden="true">
          <div class="v3d-hand" hidden><span>👆</span></div>
          <div class="v3d-tag" hidden><b></b><span></span></div>
        </div>
      </div>
      <header class="v3d-top">
        <h2 id="v3dTitle">${this.title} <span class="v3d-badge">3D</span></h2>
        <div class="v3d-tools">
          ${'speechSynthesis' in window ? `<button type="button" class="v3d-icon" data-act="voice" aria-pressed="false"></button>` : ''}
          <button type="button" class="v3d-icon v3d-close" data-act="close" aria-label="Cerrar el modo 3D y volver al libro">${ICON.close}</button>
        </div>
      </header>
      <p class="v3d-hint" aria-live="polite"></p>
      <section class="v3d-panel" style="--sc:var(${this.color})">
        <div class="v3d-meta"><span class="v3d-count"></span><span class="dots v3d-dots" aria-hidden="true">${this.steps.map(()=>'<span></span>').join('')}</span></div>
        <p class="v3d-text" id="v3dText" aria-live="polite"></p>
        <div class="v3d-btns">
          <button type="button" class="btn ghost" data-act="prev" aria-label="Paso anterior">← Atrás</button>
          <button type="button" class="btn ghost v3d-replay" data-act="replay" aria-label="Repetir la animación de este paso">${ICON.replay}<span>Repetir</span></button>
          <button type="button" class="btn" data-act="next" aria-label="Paso siguiente">Siguiente →</button>
        </div>
      </section>
      <div class="v3d-done" role="status" hidden><span class="v3d-stars" aria-hidden="true">⭐ ⭐ ⭐</span><b>¡Lo lograste!</b><span>${this.doneText}</span></div>`;
    document.body.append(r);
    document.body.dataset.modal = '3d';              // el libro deja de escuchar las flechas
    this.$ = s => r.querySelector(s);
    this.stage = this.$('#v3dStage');
    r.addEventListener('click', e=>{ const b = e.target.closest('[data-act]'); if (b) this.act(b.dataset.act); });
    this.onKey = e => this.key(e); document.addEventListener('keydown', this.onKey, true);
    this.paintVoice();
  }

  // Rectángulo de la tarjeta del libro como clip-path, para expandir/encoger desde ahí
  clipFrom(){
    const o = this.origin?.getBoundingClientRect();
    if (!o || !o.width) return 'inset(0px 0px 0px 0px round 0px)';
    return `inset(${o.top}px ${innerWidth-o.right}px ${innerHeight-o.bottom}px ${o.left}px round 18px)`;
  }
  enter(){
    const parts = [this.$('.v3d-top'), this.$('.v3d-panel'), this.$('.v3d-hint')];
    if (reduce){ this.root.style.clipPath = 'none'; return Promise.resolve(); }
    return new Promise(res => G.timeline({ onComplete:res })
      .fromTo(this.root,{ clipPath:this.clipFrom() },{ clipPath:'inset(0px 0px 0px 0px round 0px)', duration:.65, ease:'power3.inOut' })
      .fromTo(parts,{ y:30, opacity:0 },{ y:0, opacity:1, duration:.45, stagger:.08, ease:'back.out(1.6)' }, '-=.2'));
  }

  /* ---------- carga de la escena (o respaldo 2D) ---------- */
  async load(){
    this.render(false);
    this.$('.v3d-btns [data-act="next"]').focus();
    if (hasWebGL()){
      try {
        const { createScene } = await this.loadScene();
        if (this.closing) return;
        this.scene = createScene(this.stage, { steps:this.steps, G, reduce, onPick:(k,o)=>this.picked(k,o),
          safeArea:()=>({ top:this.$('.v3d-top').offsetHeight + 40, bottom:this.$('.v3d-panel').offsetHeight + 24 }) });
        this.scene.onFrame(()=>this.follow());
        this.stage.classList.add('ready');
        this.show(true);
        return;
      } catch(err){ console.warn('Modo 3D no disponible, uso el respaldo 2D:', err); }
    }
    this.useFlat();
  }
  // Respaldo: la misma ilustración del libro, movida (no copiada) a la pantalla completa
  useFlat(){
    this.flat = true; this.home = { parent:this.origin.parentNode, next:this.origin.nextSibling };
    this.stage.classList.add('ready','flat');
    this.stage.append(this.origin);
    this.$('.v3d-hint').hidden = true;
    this.show(true);
  }

  /* ---------- pasos ---------- */
  render(){
    const n = this.steps.length, last = this.i === n-1;
    this.$('.v3d-count').textContent = this.count ? this.count(this.i) : `Paso ${this.i+1} de ${n}`;
    this.$('.v3d-text').textContent = this.steps[this.i].text;
    this.root.querySelectorAll('.v3d-dots span').forEach((d,k)=>d.classList.toggle('on', k<=this.i));
    this.$('[data-act="prev"]').disabled = this.i === 0;
    const next = this.$('[data-act="next"]');
    next.textContent = last ? 'Ver otra vez ↺' : 'Siguiente →';
    next.setAttribute('aria-label', last ? 'Volver al primer paso' : 'Paso siguiente');
    this.hintKey = this.steps[this.i].shot.focus;
    this.$('.v3d-hint').textContent = this.flat ? '' : `👆 ${this.steps[this.i].shot.hint}`;
    if (!reduce) G.fromTo(this.$('.v3d-text'),{ opacity:0, y:10 },{ opacity:1, y:0, duration:.4 });
  }
  show(animate){
    this.render();
    this.hideTag();
    // El libro queda siempre en el mismo paso. En el respaldo 2D, el libro ES lo que se ve, así que anima.
    this.goStep(this.i, this.flat && animate);
    const d = this.scene ? this.scene.show(this.i, animate) : (reduce ? 0 : 2);
    this.speak(this.steps[this.i].text);
    if (this.i === this.steps.length-1) this.celebrate(d);
  }
  go(i){ this.i = Math.max(0, Math.min(this.steps.length-1, i)); this.show(true); }
  act(a){
    if (a === 'close') return this.close();
    if (a === 'prev') return this.go(this.i-1);
    if (a === 'next') return this.i === this.steps.length-1 ? this.go(0) : this.go(this.i+1);
    if (a === 'replay') return this.show(true);
    if (a === 'voice'){ this.voice = !this.voice; store.set('voz3d', this.voice); this.paintVoice();
      if (this.voice) this.speak(this.steps[this.i].text); else speechSynthesis.cancel(); }
  }

  /* ---------- celebración al terminar ---------- */
  celebrate(delay){
    if (this.celebrated) return; this.celebrated = true;
    setTimeout(()=>{
      if (this.closing) return;
      const d = this.$('.v3d-done'); d.hidden = false;
      boom({ power:1.2 }); rain(1600);
      if (!reduce) G.fromTo(d,{ scale:.4, opacity:0 },{ scale:1, opacity:1, duration:.6, ease:'back.out(2.2)' });
      setTimeout(()=>{ if (!reduce) G.to(d,{ opacity:0, duration:.4, onComplete:()=>{ d.hidden = true; } }); else d.hidden = true; }, 3800);
    }, Math.max(300, delay*1000));
  }

  /* ---------- tocar personajes: etiqueta con nombre y dato curioso ---------- */
  picked(key, obj){
    const c = this.cells[key]; if (!c) return;
    const tag = this.$('.v3d-tag');
    tag.querySelector('b').textContent = c.name; tag.querySelector('span').textContent = c.fact;
    tag.hidden = false; this.tagObj = obj;
    if (!reduce) G.fromTo(tag,{ scale:.5, opacity:0 },{ scale:1, opacity:1, duration:.45, ease:'back.out(2.5)' });
    if (key === this.hintKey) this.hintKey = null;                 // ya encontró lo que había que tocar
    this.$('.v3d-hint').textContent = `${c.name}: ${c.fact}`;      // también lo anuncia a lectores de pantalla
    clearTimeout(this.tagTimer); this.tagTimer = setTimeout(()=>this.hideTag(), 4000);
  }
  hideTag(){ this.tagObj = null; const t = this.$('.v3d-tag'); if (t) t.hidden = true; }
  // Cada cuadro: la mano apunta al personaje del paso y la etiqueta sigue al que se tocó
  follow(){
    const hand = this.$('.v3d-hand'), p = this.hintKey && this.scene.screenOf(this.hintKey);
    hand.hidden = !p; if (p) hand.style.transform = `translate(${p.x}px, ${p.y}px)`;
    const tag = this.$('.v3d-tag'), q = this.tagObj && this.scene.screenOfObj(this.tagObj);
    if (this.tagObj && !q) this.hideTag();
    if (q){ const w = tag.offsetWidth, W = this.stage.clientWidth;
      tag.style.transform = `translate(${Math.max(8, Math.min(W-w-8, q.x-w/2))}px, ${Math.max(70, q.y-tag.offsetHeight-40)}px)`; }
  }

  /* ---------- narración por voz (Web Speech API) ---------- */
  paintVoice(){
    const b = this.$('[data-act="voice"]'); if (!b) return;
    b.setAttribute('aria-pressed', this.voice);
    b.setAttribute('aria-label', this.voice ? 'Silenciar la narración' : 'Escuchar la narración');
    b.innerHTML = this.voice ? ICON.on : ICON.off;
  }
  speak(text){
    if (!this.voice) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text), v = speechSynthesis.getVoices().find(v=>/^es[-_]/i.test(v.lang));
    u.lang = v?.lang || 'es-MX'; if (v) u.voice = v; u.rate = .95; u.pitch = 1.1;
    speechSynthesis.speak(u);
  }

  /* ---------- teclado: ESC cierra, foco atrapado, flechas cambian de paso ---------- */
  key(e){
    if (e.key === 'Escape'){ e.preventDefault(); this.close(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); this.act(e.key === 'ArrowRight' ? 'next' : 'prev'); return; }
    if (e.key !== 'Tab') return;
    const f = [...this.root.querySelectorAll('button:not([disabled])')].filter(b=>b.offsetParent);
    const first = f[0], last = f[f.length-1];
    if (!this.root.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  /* ---------- cerrar: libera todo y regresa a la ilustración del libro ---------- */
  close(){
    if (this.closing) return; this.closing = true;
    document.removeEventListener('keydown', this.onKey, true);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    clearTimeout(this.tagTimer);
    if (this.flat){ this.home.parent.insertBefore(this.origin, this.home.next); this.goStep(this.i, false); }
    const done = () => {
      this.scene?.dispose(); this.scene = null;
      this.root.remove(); delete document.body.dataset.modal;
      this.opener?.focus(); active = null;
    };
    if (reduce) return done();
    G.timeline({ onComplete:done })
      .to(this.root.querySelectorAll('.v3d-top,.v3d-panel,.v3d-hint,.v3d-done'),{ opacity:0, y:20, duration:.25 })
      .to(this.root,{ clipPath:this.clipFrom(), duration:.55, ease:'power3.inOut' }, '-=.05')
      .to(this.root,{ opacity:0, duration:.2 }, '-=.15');
  }
}
