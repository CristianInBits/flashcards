# Mazos de ejemplo

Cuatro mazos listos para importar en Carti. Sirven para tener contenido de verdad con el que
probar el estudio y las estadísticas, y además cada fichero usa **un formato distinto de los que
entiende el importador**, así que valen como plantilla para tus propios apuntes.

| Fichero | Formato | Cartas |
| --- | --- | --- |
| [Capitales de Europa.md](Capitales%20de%20Europa.md) | una línea por carta (`::`) | 45 |
| [Capitales de América.md](Capitales%20de%20Am%C3%A9rica.md) | una línea por carta (`::`) | 35 |
| [Capitales de Asia.csv](Capitales%20de%20Asia.csv) | CSV con punto y coma | 47 |
| [Ciencia básica.md](Ciencia%20b%C3%A1sica.md) | encabezados de Markdown | 26 |

El de ciencia lleva negritas, listas y fórmulas entre `$…$` para ver cómo quedan las respuestas
con formato. Los de capitales son texto pelado: lo que sale si exportas una hoja de cálculo o
tienes los apuntes en Obsidian.

## Desde el ordenador

**Importar** → *Subir un fichero* → elegir el fichero. El nombre del mazo se rellena solo con el
del fichero, y no hace falta crear el mazo antes.

## Desde el móvil

Los ficheros están en el repositorio, así que se pueden abrir en crudo, copiar y pegar en el
recuadro *«O pega aquí tus apuntes»*:

- https://raw.githubusercontent.com/CristianInBits/flashcards/main/ejemplos/Capitales%20de%20Europa.md
- https://raw.githubusercontent.com/CristianInBits/flashcards/main/ejemplos/Capitales%20de%20Am%C3%A9rica.md
- https://raw.githubusercontent.com/CristianInBits/flashcards/main/ejemplos/Capitales%20de%20Asia.csv
- https://raw.githubusercontent.com/CristianInBits/flashcards/main/ejemplos/Ciencia%20b%C3%A1sica.md

Pegando el texto hay que escribir el nombre del mazo a mano, porque no hay fichero del que
sacarlo.

## Los tres formatos

Una línea por carta, la pregunta y la respuesta separadas por `::`:

```
Francia :: París
Alemania :: Berlín
```

CSV, primera columna la pregunta y segunda la respuesta. Admite coma, punto y coma o tabulador,
y se salta la fila de encabezados si la hay:

```
Pregunta;Respuesta
Francia;París
```

Encabezados de Markdown: cada `#` es una pregunta y lo que va debajo, la respuesta. Es el único
formato en el que la respuesta puede ocupar varias líneas y llevar formato:

```markdown
## ¿Cuál es la capital de Francia?

**París.** Lo es desde el siglo X.
```

Un detalle de este último: el texto que haya **antes del primer encabezado** se ignora, y un
encabezado sin nada debajo se descarta. Por eso estos ficheros no llevan título.

## Sobre el contenido

Las capitales con truco llevan la aclaración en la respuesta —Bolivia, Países Bajos, Malasia,
Sri Lanka— porque de poco sirve memorizar un dato que luego resulta que tiene matices.
