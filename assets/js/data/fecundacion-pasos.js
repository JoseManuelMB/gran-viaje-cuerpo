/* ==========================================================
   PARADA 2 · Datos de los pasos de la fecundación
   Única fuente de los textos: los usan el libro (2D) y el modo 3D.

   Cada paso:
     id    → nombre interno; el modo 3D busca su animación en ACTS[id] (fecundacion3d/scene.js)
     text  → lo que se lee en el libro, en el panel 3D y en la narración
     shot  → la "toma" de cámara del modo 3D
       cam    [x,y,z] posición de la cámara
       target [x,y,z] punto al que mira
       focus  clave de CELLS a la que apunta la pista
       hint   texto de la pista ("¡Toca…!")
   ========================================================== */
export const STEPS = [
  { id:'conocer',
    text:'Estas son las dos células: el óvulo, grandote, y los espermatozoides, chiquitos y con colita.',
    shot:{ cam:[-2.5,2.2,17], target:[-3,0,0], focus:'ovulo', hint:'¡Toca el óvulo!' } },
  { id:'nadar',
    text:'Los espermatozoides nadan moviendo su colita para llegar al óvulo.',
    shot:{ cam:[-7,3.2,14], target:[-3.2,0,0], focus:'esperma', hint:'¡Toca un espermatozoide!' } },
  { id:'entrar',
    text:'¡Solo uno logra entrar! A esto se le llama fecundación.',
    shot:{ cam:[-2.4,1.6,10.5], target:[-1,0.2,0], focus:'capa', hint:'¡Toca la capa protectora!' } },
  { id:'dividir2',
    text:'Ahora es una célula nueva, y se divide en 2…',
    shot:{ cam:[0,1.6,10], target:[0,0,0], focus:'celula', hint:'¡Toca una célula!' } },
  { id:'dividir8',
    text:'…luego en 4, en 8, y sigue y sigue.',
    shot:{ cam:[3.6,3.2,8.6], target:[0,0,0], focus:'celula', hint:'¡Cuenta las células tocándolas!' } },
  { id:'implantar',
    text:'Viaja al útero, se pega a su pared y ahí crece el bebé durante 9 meses.',
    shot:{ cam:[0,1.8,19], target:[0,0.6,0], focus:'utero', hint:'¡Toca el útero!' } }
];

/* Lo que dice cada personaje al tocarlo en el modo 3D (una sola frase) */
export const CELLS = {
  ovulo:  { name:'Óvulo',          fact:'¡Es la célula más grande del cuerpo humano!' },
  esperma:{ name:'Espermatozoide', fact:'Es chiquitito y nada moviendo su colita.' },
  capa:   { name:'Capa protectora',fact:'Cuando uno entra, el óvulo se cierra para que no entre otro.' },
  celula: { name:'Célula',         fact:'Cada vez que se divide, ¡hay el doble de células!' },
  utero:  { name:'Útero',          fact:'Es el lugar donde crece el bebé durante 9 meses.' },
  trompa: { name:'Trompa',         fact:'Es el caminito que lleva hasta el útero.' },
  ovario: { name:'Ovario',         fact:'Aquí se guardan los óvulos.' }
};
