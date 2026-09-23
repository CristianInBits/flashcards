# Icono de la aplicación

Prompts para generar el icono y los requisitos técnicos que tiene que cumplir el resultado.

## Prompt principal — tarjetas en abanico

> Icono de aplicación móvil para una app de tarjetas de estudio. Estilo vectorial plano y
> minimalista: formas geométricas simples, colores planos y saturados, sin degradados
> complejos, sin sombras realistas, sin texturas y **sin ningún texto, letra ni número**.
> Composición centrada y simétrica: tres tarjetas de esquinas redondeadas apiladas en abanico,
> ligeramente rotadas una sobre otra y vistas de frente. La tarjeta del fondo en violeta
> intenso, la intermedia en rosa fucsia y la delantera en blanco roto con un borde fino.
> El fondo es un cuadrado de color sólido azul muy oscuro que llega hasta los bordes del
> lienzo, sin transparencia. Márgenes amplios: las tarjetas ocupan solo el 60% central de la
> imagen. Diseño limpio, que siga siendo reconocible reducido a 48 píxeles. Imagen cuadrada.

Versión en inglés, por si el generador responde mejor (suele pasar):

> Mobile app icon for a study flashcards app. Flat minimal vector style: simple geometry,
> saturated flat colors, no complex gradients, no realistic shadows, no textures, and
> absolutely no text, letters or numbers. Centered symmetrical composition: three rounded
> rectangular cards stacked in a fan, slightly rotated over each other, seen face-on. Back
> card deep violet, middle card hot pink, front card off-white with a thin border. Background
> is a solid very dark blue square filling the whole canvas, no transparency. Generous margins:
> the cards occupy only the central 60% of the frame. Clean design, still readable when scaled
> down to 48 pixels. Square image.

Paleta de referencia, por si quieres fijarla en el prompt: violeta `#7C3AED`, fucsia `#EC4899`,
blanco roto `#FAF7FF`, fondo `#12102A`. Es la misma que puede heredar el tema oscuro de la app.

## Variantes por si la principal no convence

**B — carta a medio girar.** Una sola tarjeta de esquinas redondeadas captada a mitad de un
giro sobre su eje vertical, de forma que se ven las dos caras en perspectiva plana: una violeta
y la otra naranja cálido. Fondo sólido oscuro. Transmite mejor la idea de pregunta-respuesta,
pero es más difícil que se lea bien a tamaño pequeño.

**C — esquina levantada.** Una tarjeta blanca centrada con la esquina inferior derecha doblada,
dejando ver debajo una segunda tarjeta de color vivo. Es la opción más sobria y la que mejor
aguanta la reducción a 48 píxeles.

**D — dos mitades.** Un cuadrado de esquinas redondeadas partido en diagonal, la mitad superior
violeta y la inferior naranja, con una separación blanca fina entre ambas. Muy abstracto: no se
entiende qué hace la app, pero es el que mejor funciona como marca.

## Requisitos del resultado

- **Nada de texto.** Los generadores de imágenes escriben mal y un icono con letras deformadas
  no se puede arreglar. El nombre ya aparece debajo del icono en el lanzador del móvil.
- **Fondo sólido, sin transparencia.** iOS no respeta el canal alfa en los iconos de pantalla de
  inicio: una transparencia se convierte en un rectángulo negro.
- **Zona segura.** Android recorta el icono con máscaras de formas distintas según el lanzador.
  Todo lo que importe debe caber dentro del círculo central que ocupa el 80% del ancho; de ahí
  los márgenes amplios del prompt.
- **Prueba a 48 píxeles antes de dar por bueno el diseño.** Es el filtro que suspenden casi todos
  los iconos bonitos.
- Si el resultado convence, merece la pena **redibujarlo como SVG**: escala limpio a cualquier
  tamaño y pesa menos que los PNG.

## Tamaños a exportar

| Fichero | Tamaño | Para qué |
|---|---|---|
| `icon-192.png` | 192×192 | Manifest de la PWA |
| `icon-512.png` | 512×512 | Manifest, pantalla de inicio y splash |
| `icon-maskable-512.png` | 512×512 | Variante con la zona segura respetada, `purpose: "maskable"` |
| `apple-touch-icon.png` | 180×180 | iOS, sin transparencia |
| `favicon.svg` o `favicon-32.png` | 32×32 | Pestaña del navegador |

Todos van en `public/` y se declaran en el manifest que genera `vite-plugin-pwa`.
