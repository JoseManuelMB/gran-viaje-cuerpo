/* ==========================================================
   PARADA 3 · Pasos del modo 3D del embarazo
   Los usa el modo 3D (embarazo3d/scene.js) y, para sincronizar, la línea de meses del libro.

   Cada paso:
     id    → nombre interno; la escena busca su animación en POSE[id] / PLAY[id]
     mes   → mes al que salta la línea de meses del libro al llegar a este paso
     label → etiqueta del panel ("Meses 3 y 4")
     text  → lo que se lee en el panel y en la narración
     shot  → la "toma" de cámara: cam [x,y,z], target [x,y,z], focus (clave de CELLS) y hint
   ========================================================== */
export const STEPS = [
  { id:'mes1', mes:1, label:'Mes 1',
    text:'Mes 1: el bebé es una bolita más chica que una semillita. ¡Ya se está formando su corazón!',
    shot:{ cam:[1.2,.9,6.2], target:[0,-.1,0], focus:'corazon', hint:'¡Toca su corazón!' } },
  { id:'mes2', mes:2, label:'Mes 2',
    text:'Mes 2: su corazón ya late muy rápido, ¡y le salen bracitos y piernitas!',
    shot:{ cam:[-1.6,1,7.2], target:[0,-.1,0], focus:'bebe', hint:'¡Toca al bebé!' } },
  { id:'cordon', mes:4, label:'Meses 3 y 4',
    text:'Meses 3 y 4: ya parece un bebé. La placenta le manda comida y oxígeno por el cordón umbilical.',
    shot:{ cam:[3,1.8,9.5], target:[.5,.5,0], focus:'placenta', hint:'¡Toca la placenta!' } },
  { id:'patadas', mes:6, label:'Meses 5 y 6',
    text:'Meses 5 y 6: da pataditas, a veces tiene hipo, ¡y ya oye la voz de mamá y papá!',
    shot:{ cam:[-3.4,1.2,11.5], target:[-.4,0,0], focus:'utero', hint:'¡Toca la pancita!' } },
  { id:'crecer', mes:7, label:'Mes 7',
    text:'Mes 7: abre los ojos, se chupa el dedo y sigue creciendo dentro de su bolsa de agua.',
    shot:{ cam:[1.6,1,11.5], target:[0,0,0], focus:'bolsa', hint:'¡Toca la bolsa de agua!' } },
  { id:'voltear', mes:9, label:'Meses 8 y 9',
    text:'Meses 8 y 9: se da la vuelta y se acomoda de cabeza. ¡Listo para nacer!',
    shot:{ cam:[0,1,13.5], target:[0,-.2,0], focus:'cordon', hint:'¡Toca el cordón!' } }
];

/* Lo que dice cada parte al tocarla en el modo 3D (una sola frase) */
export const CELLS = {
  bebe:    { name:'Bebé',             fact:'Crece un poquito cada día durante 9 meses.' },
  corazon: { name:'Corazón',          fact:'Late casi el doble de rápido que el tuyo.' },
  placenta:{ name:'Placenta',         fact:'Le pasa al bebé la comida y el oxígeno de la mamá.' },
  cordon:  { name:'Cordón umbilical', fact:'Une al bebé con la placenta. ¡Tu ombligo es donde estaba!' },
  bolsa:   { name:'Bolsa de agua',    fact:'Un líquido calientito que lo protege de los golpes.' },
  utero:   { name:'Útero',            fact:'Se estira muchísimo para que el bebé quepa.' }
};
