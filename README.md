# El gran viaje del cuerpo

Libro interactivo para leer con papá. Explica a niñas y niños, con juegos y animaciones,
cómo cambia el cuerpo en la pubertad, cómo empieza un bebé, cómo crece en la panza,
por qué los adultos deciden cuándo tener hijos y cómo cuidar su propio cuerpo.

Son 16 páginas y 5 paradas. En cada parada hay un juego que da un sello, y la fecundación
y el embarazo también se pueden ver en 3D.

## Ejecutar en local

Es un sitio estático: no hay que instalar ni compilar nada. Solo necesita un servidor local,
porque abrir `index.html` con doble clic no funciona (el navegador bloquea los módulos).

Desde la carpeta del proyecto:

```bash
npx http-server -p 8080 -c-1
```

o, con Python:

```bash
python -m http.server 8080
```

Luego abre <http://localhost:8080>.
