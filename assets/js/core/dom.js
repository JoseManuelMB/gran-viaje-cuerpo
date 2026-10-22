/* Atajos de DOM y almacenamiento local */
import { CONFIG } from '../config.js';

export const $ = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);

// Lee una variable CSS ya resuelta (respeta modo claro/oscuro)
export const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export const palette = () => ['--c1','--c2','--c3','--c4','--c5'].map(css);

// localStorage tolerante a errores (modo privado, almacenamiento bloqueado…)
export const store = {
  get(k,d){ try{ const v=localStorage.getItem(CONFIG.storagePrefix+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem(CONFIG.storagePrefix+k, JSON.stringify(v)); }catch(e){} }
};
