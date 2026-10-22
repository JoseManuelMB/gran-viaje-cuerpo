/* Carga las páginas del libro desde content/*.html y las deja en el almacén oculto (#store).
   Para agregar una parada: crea el archivo en content/ y añádelo aquí en orden. */
export const SECTIONS = [
  '00-inicio',
  '01-pubertad',
  '02-fecundacion',
  '03-embarazo',
  '04-decidir',
  '05-cuidarme',
  '06-en-familia',
  '07-final'
];

export async function loadContent(){
  // Rutas relativas: funcionan tanto en usuario.github.io/repo/ como en local
  const html = await Promise.all(SECTIONS.map(async name => {
    const r = await fetch(`content/${name}.html`);
    if (!r.ok) throw new Error(`No se pudo cargar content/${name}.html (${r.status})`);
    return r.text();
  }));
  document.getElementById('store').innerHTML = html.join('\n');
}
