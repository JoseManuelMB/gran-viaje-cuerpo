/* Punto de entrada: carga las páginas, arranca cada parada y abre el libro */
import { loadContent } from './core/content.js';
import { paintStamps } from './core/stamps.js';
import { initBook } from './core/book.js';
import * as inicio from './paradas/inicio.js';
import * as pubertad from './paradas/pubertad.js';
import * as fecundacion from './paradas/fecundacion.js';
import * as embarazo from './paradas/embarazo.js';
import * as decidir from './paradas/decidir.js';
import * as cuidarme from './paradas/cuidarme.js';
import * as enFamilia from './paradas/en-familia.js';
import * as final from './paradas/final.js';

const PARADAS = [inicio, pubertad, fecundacion, embarazo, decidir, cuidarme, enFamilia, final];

try {
  await loadContent();
  paintStamps();
  PARADAS.forEach(p => p.init());
  initBook();
} catch (err) {
  console.error(err);
  // Abrir index.html con doble clic (file://) bloquea fetch y módulos: hace falta un servidor
  document.getElementById('book').innerHTML =
    '<p class="load-error">No se pudo abrir el libro. Si lo abriste con doble clic, sírvelo con un servidor local (ver README).</p>';
}
