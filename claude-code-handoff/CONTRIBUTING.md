# Contribuir al sistema de diseño Terres

Esta guía es para diseñadores, desarrolladores e IAs que sumen al sistema. Si no se respeta, lo que agreguen no se va a usar.

## Principios irrenunciables

Antes de proponer cualquier cosa, asegurate de que respeta los **principios de marca**:

1. **Editorial restraint** — un bloque naranja por pieza editorial, máximo.
2. **Jerarquía por tamaño**, nunca por color.
3. **Voz Rioplatense, "vos", verbos concretos** — sin emoji, sin "Continue", sin "!".
4. **Sin gradients, sin glassmorphism, sin cardocalypse, sin Inter**.
5. **Sin azul**, ni siquiera en mapas.

Si lo que querés agregar viola alguno: o no va, o estás proponiendo cambiar el principio (cosa que es válida pero requiere conversación previa).

---

## Cuándo agregar algo nuevo vs. usar lo existente

| Querés… | Acción |
|---|---|
| Un color hover o disabled | Usá la escala tonal (`--orange-700` etc.) — **no inventes hex**. |
| Un componente que se parece a otro | Reutilizá. Pasá props para variar. |
| Un componente nuevo de verdad | Abrí propuesta (ver abajo). |
| Cambiar un token canónico | MAJOR version. Conversá antes. |
| Agregar una superficie (slide layout, sección de landing) | Va al UI kit correspondiente, no a la raíz. |

---

## Proponer un componente nuevo

Antes de codear, abrí un doc corto con:

1. **Problema** — qué patrón estás resolviendo. Dos o tres screenshots de dónde aparece.
2. **Alternativas existentes** — qué componente del sistema ya cubre el 80% del caso y por qué no alcanza.
3. **API mínima** — qué props recibe, qué estados maneja.
4. **Variantes** — cuántas necesitás. Si son más de 3, sospechá: probablemente sean dos componentes distintos.
5. **Accessibility** — qué roles ARIA, navegación por teclado, focus order.

Criterios de aceptación:

- Funciona en **mobile primero** (≥360px).
- Cubre los 6 estados canónicos relevantes (default, hover, active, focus, disabled, loading + error/empty si aplica).
- Honra `prefers-reduced-motion`.
- Pasa contraste AA salvo excepción documentada.
- Tiene una **preview card** en `preview/` que entra en 700×N px.
- Tiene **docstring** arriba del archivo (`/* Lo que es + cuándo usarlo + cuándo NO */`).

---

## Naming

- **Componentes**: PascalCase, descriptivos (`ParcelMap`, `KpiCard`, `StickyAddressBar`). Evitar genéricos (`Card`, `Box`, `Button` solitarios).
- **Tokens**: kebab-case, prefijo por categoría (`--state-primary-hover`, `--motion-quick`, `--bp-md`).
- **Archivos JSX**: igual al componente principal (`HeroBlock.jsx` contiene `HeroBlock`).
- **Preview cards HTML**: kebab-case temático (`type-scale.html`, `form-patterns.html`).

---

## Copy y voz

Cuando escribas copy en un componente:

- ✅ "Pedí tu factibilidad gratis"
- ❌ "Continue" / "Click here" / "Get started"
- ✅ "No encontramos ese lote. ¿Está fuera de CABA?"
- ❌ "404 - Not found"

Ver el spécimen completo en `preview/micro-copy.html`.

Si tu copy queda en inglés porque "es solo placeholder", se va a quedar así. Escribilo bien desde el día uno.

---

## Color: qué tocar y qué no

- **NO** introducir nuevos colores fuera de las escalas. Si necesitás un nuevo tono, primero extendé la escala correspondiente (`--orange-X`).
- **NO** usar gris (slate, zinc, neutral de Tailwind). El neutro de Terres es warm, leaning brown. Usá la escala `--neutral-*`.
- **NO** crear un segundo verde, rojo, o azul. Solo existen `--success` (olive), `--destructive` (cold red), y nada azul.
- **NO** crear un segundo naranja "más vibrante" o "más apagado". Si necesitás contraste, usá tonal `--orange-400` o `--orange-700`.

---

## Tipografía

- IBM Plex Sans es default. **Plex Serif** SOLO para decks de inversores y citas editoriales grandes. **Plex Mono** para KPIs, IDs, tickets.
- **Inter** SOLO cuando referencies OpenDoor en una comparativa. Nunca más.
- Jerarquía siempre por tamaño. Si el diseño "no se entiende" sin pintar el H1 en naranja, está mal escalado.

---

## Iconografía

- Usá Lucide a 1.5px. Si un ícono no existe, primero buscá un sinónimo. Si nada cubre, abrí propuesta.
- Color: siempre `currentColor`. Jamás hardcodeado.
- Tamaño: 18px inline, 20px en botón ícono, 24px en headers de sección. Nunca > 32px en producto.
- **No emoji como ícono** — ni 🏠 📍 💰. Sí `✓` y `✕` como indicadores semánticos (success / error / dismiss).

---

## Transferencia de craft (Stripe → Terres) — firewall §0

El sistema se inspira en la **disciplina de oficio** de Stripe (espaciado, jerarquía, motion, restraint, prueba por números) — eso no es propiedad de nadie. Los **activos de marca de Stripe NO se transfieren**. Si un diseñador reconocería "esto es Stripe", queda afuera. Si lo que reconoce es "esto está bien hecho", lo tomamos.

| NO se transfiere (queda afuera) | Terres usa en su lugar |
|---|---|
| Blurple `#533afd` / `#635BFF` | `--primary` #E76D00 (naranja institucional) |
| Mesh gradient WebGL | Sin gradientes. Bloque naranja sólido como único momento "committed" |
| `skewY(-12deg)` de secciones | Secciones rectas + divisor naranja de 1px |
| Söhne (fuente con licencia) | IBM Plex Sans / Serif / Mono (self-hosted) |
| Navy `#11273e` | Borgoña `--foreground` #380000 + cream #FFEDD6 |
| Sombra azulada `rgba(0,55,112,…)` | Sombra **warm** borgoña `rgba(56,0,0,…)` (`--shadow-sm/md`, dos capas) |

Lo que SÍ se adoptó como token en v2.4: `--motion-hover/reveal/sheet`, `--ease-out-quart` (firma), `--shadow-sm/md` de dos capas, y el grupo `--map-volume-*` / `--map-parcel-hover/selected` remapeado a la escala naranja. **No redefinas estos tokens inline en una pieza nueva** — referenciá `colors_and_type.css`. Spacing = un solo valor (escala 4px-base, ritmo 8px, subpasos 2/4px). Radios = un solo valor por rol (`--radius-sm` 4px controles / `--radius-lg` 12px cards). El radio de 16px de Stripe se rechaza a favor del 12px Terres.

---

## Checklist §5 — validá toda pieza nueva antes de entregar

Adaptado del checklist de fidelidad del brief, en valores Terres:

- [ ] ¿El acento de acción es `--primary` #E76D00 y se reserva para lo accionable / institucional?
- [ ] ¿Superficies en cream (`--background` / `--editorial-light`) con **un solo** bloque naranja pleno por pieza editorial?
- [ ] ¿Headings por **tamaño** primero, pesos livianos (display 400, h1/h2 500), tracking negativo en displays?
- [ ] ¿Todo **dato** en IBM Plex Mono tabular (m², USD, %, SMP, incidencia)?
- [ ] ¿Cards con **hairline 1px** + sombra warm de dos capas (`--shadow-sm/md`), no sombra negra ni azul?
- [ ] ¿Radios `--radius-sm` controles / `--radius-lg` cards y espaciado sobre la escala `--space-*`?
- [ ] ¿Hero = eyebrow mono + H1 corto + 1 subhead + CTA texto?
- [ ] ¿Hay un demo real (render 3D / tabla / barra), no arte decorativo?
- [ ] ¿El copy persuade con **cifras concretas**, no adjetivos?
- [ ] ¿Cierre "committed" (bloque naranja) + canal directo?
- [ ] ¿Motion solo `transform`/`opacity`, IntersectionObserver (dispara una vez, `disconnect()`), < 500ms, easing `--ease-out-quart`, y `prefers-reduced-motion` desactiva lo espacial?
- [ ] ¿Cero gradientes, cero skew, cero navy, cero Söhne, cero blurple, cero sombra azul? (firewall §0)

Referencia renderizada en tokens reales: `preview/craft-stripe-terres.html`.

---

## Versionado

Ver [CHANGELOG.md](./CHANGELOG.md). Patches son seguros; minors están documentados; majors requieren aviso ≥ 2 semanas.

Si vas a romper algo, abrí PR a `CHANGELOG.md` antes de tocar el código.

---

## Preguntas comunes

> **¿Puedo usar un emoji como decoración en una landing?**
> No.

> **¿Puedo agregar un gradient sutil "muy editorial"?**
> No.

> **¿Y un blur sutil de fondo, tipo glass?**
> No.

> **¿Y un color personalizado para esta campaña?**
> No — usá las escalas. Si la campaña necesita un tono nuevo, lo agregamos a la escala (minor version) y queda para todos.

> **¿Hicimos un componente igual en otro lado y no me di cuenta?**
> Probablemente. Buscá en `ui_kits/` y `preview/` antes de codear.

---

## Contacto

Para propuestas: abrí un doc y dropealo en `#design-system`.
Para arreglar un bug visible: PR directo + nota en `CHANGELOG.md` (patch).
Para discutir un principio: conversación previa, no commit.
