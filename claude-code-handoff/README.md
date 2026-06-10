# Terres → Claude Code → Cowork · kit de handoff

Cómo llevar **la memoria** (gramática + voz) y **el sistema de diseño** de Terres a Claude Code,
y orquestar **workers de Cowork** para construir todo el árbol de herramientas (superficies,
plantillas, slides) sin que ninguno rompa la gramática.

La idea en una línea: **el sistema viaja como archivos, la disciplina viaja como un gate de código,
y el trabajo viaja como una cola de briefs auto-contenidos.**

---

## Qué hay en este kit

```
claude-code-handoff/
├── README.md          ← esto (setup + integración Cowork)
├── CLAUDE.md          ← la MEMORIA: contrato de agente (voz + gramática + loop build/check)
├── WORKERS.md         ← el BACKLOG: el árbol de herramientas como cola de tareas paralelizables
├── GOVERNANCE.md      ← PROCESO: quién aprueba qué, semver del sistema
├── CONTRIBUTING.md    ← PROCESO: cómo sumar una pieza (incluye el checklist §5)
├── CHANGELOG.md       ← PROCESO: historia de versiones (hoy v2.4.0)
├── ROADMAP.md         ← PROCESO: qué viene
└── design-kernel/     ← la FUENTE DE VERDAD, auto-contenida y runnable
    ├── tokens.json           · único lugar donde se cambian colores/escala
    ├── build.mjs.txt         · regenera los CSS espejo desde tokens.json (Node 18+, cero deps)
    ├── check-system.mjs.txt  · guardrail: falla ante hex fuera de paleta o emoji
    ├── colors_and_type.css    · espejo GENERADO de referencia (para paridad byte-a-byte)
    ├── parcel-map.js          · componente de mapa de parcelas (paleta cálida sancionada)
    ├── fonts/                 · IBM Plex Sans + Serif + Mono self-hosteadas (42 .ttf, las wireadas)
    ├── assets/                · marca: wordmarks, favicon, og-image, íconos propios
    └── reference/             ← la ESPECIFICACIÓN VISUAL (mirá, no importes)
        ├── styleguide.html        · el sistema entero en una página, offline
        └── preview/               · 28 cards — el spec fino de cada componente/patrón
```

> **Renombrá los `.txt` a `.mjs` al dropearlos en el repo** (`mv build.mjs.txt build.mjs`).
> Van con extensión `.txt` solo para que el compilador del design system no los tome como
> componentes. El `colors_and_type.css` incluido es **generado** — viaja como **referencia de
> paridad**: en el repo real lo reproduce `node build.mjs` desde `tokens.json` (verificá con
> `--check`); no lo edites a mano. **`reference/` es solo lectura** — abrí `styleguide.html`
> primero; las cards de `preview/` toman los tokens reales del kernel y renderizan idénticas al
> sistema (28 specs: botones, inputs, badges, cards, modal, color, tipo, spacing,
> sombras, motion, data-viz, marca, a11y, mobile, micro-copy, estados vacío/carga/error).

---

## Las 3 cosas que se mueven a Claude Code

### 1. La memoria → `CLAUDE.md` en la raíz del repo

Claude Code lee `CLAUDE.md` automáticamente al arrancar **cada** sesión y **cada** worker. Es
exactamente el primitivo que necesitás: la voz Rioplatense, los 11 puntos de gramática visual, los
tokens canónicos y el loop de build/check, condensados para que un agente los aplique sin re-leer
los 355 renglones del README.

```bash
# en la raíz del repo de la app:
cp claude-code-handoff/CLAUDE.md ./CLAUDE.md
```

Podés tener `CLAUDE.md` anidados (uno por carpeta: `owner/`, `partner/`…) si un carril necesita
reglas extra — Claude Code los compone del más cercano al más lejano.

### 2. El sistema de diseño → `design-kernel/` runnable + un gate de CI

`tokens.json` es la **fuente única de verdad**. El kernel ya viaja completo y runnable —
`fonts/`, `assets/` de marca y el espejo `colors_and_type.css` de referencia incluidos. En el
repo real:

```bash
cp -r design-kernel/fonts ./fonts       # Plex self-hosteadas (no dependas de CDN)
cp -r design-kernel/assets ./assets     # wordmarks, favicon, íconos de marca
node design-kernel/build.mjs            # tokens.json → globals.css (Tailwind v4) + colors_and_type.css
node design-kernel/build.mjs --check    # exit 1 si los espejos quedaron desincronizados
node design-kernel/check-system.mjs     # exit 1 si hay hex fuera de paleta o emoji en superficies
```

Wirealos como **pre-commit** y en **CI** (EPIC-0.2). Eso convierte la gramática de "buena
intención" en un **contrato verificable** — y es lo que hace seguro dejar que muchos workers
desconocidos toquen el repo en paralelo: el que rompe la paleta, no mergea.

### 3. El trabajo → `WORKERS.md` como cola para Cowork

El `Mapa de Recursos.html` ya es un grafo de dependencias del ecosistema. `WORKERS.md` lo
convierte en briefs auto-contenidos (ID, superficie, archivo de referencia, input, DoD, comando de
verificación, dependencias). Cada worker toma uno sin más contexto que ese brief + `CLAUDE.md`.

---

## Integración con Cowork (orquestación)

1. **Seedeá el repo** con `CLAUDE.md` + `design-kernel/` + `WORKERS.md` y corré **EPIC-0 solo**
   (el kernel bloquea todo lo demás: todos referencian sus tokens).
2. **Fan-out por carriles independientes.** Las 3 audiencias no comparten archivos → 3 workers en
   paralelo sin conflicto. Outputs, slides y foundations son carriles aparte. (Ver grafo al pie de
   `WORKERS.md`.)
3. **Gate único compartido.** La instrucción a cada worker es la misma: *"Leé `CLAUDE.md`. Tomá tu
   tarea de `WORKERS.md`. No mergees con `check-system` en rojo."* No hace falta coordinar más.
4. **Un PR chico por tarea**, con su nota de changelog (semver del sistema: hoy **v2.4.0**).
5. **Orden de leverage:** después del kernel, EPIC-4.1 (mensajería) es el de mayor retorno — hoy
   "Hablá con el dueño/asesor" y "Rechazar" son botones sin destino.

```
seed repo ─→ EPIC-0 (1 worker, kernel) ─→ ┌ EPIC-1 carril Propietario
                                          ├ EPIC-1 carril Comprador     ⟩ N workers en paralelo
                                          ├ EPIC-1 carril Partner        │ (gate compartido:
                                          ├ EPIC-2 plantillas            │  check-system verde)
                                          ├ EPIC-3 slides                │
                                          └ EPIC-4 pendientes (4.1 first) ┘
```

---

## Por qué este shape (y no "pasale el README y que cope")

- **Un README de 355 renglones no es un contrato de agente.** Es referencia humana. El worker
  necesita reglas operativas cortas y un comando que le diga si las cumplió — por eso `CLAUDE.md`
  separado del README, y por eso `check-system.mjs` como juez.
- **Paralelizar sin gate = deriva.** La auditoría de junio encontró "instancias desprendidas"
  (hex sueltos, segundo verde). El gate existe justamente para que escalar a muchos workers no
  re-introduzca eso.
- **`tokens.json` como única perilla** = un cambio de marca se propaga solo; ningún worker
  hardcodea un color y todos heredan el mismo arreglo.

---

## Notas / pendientes del handoff

- **Fuentes:** ya incluidas en `design-kernel/fonts/` (42 .ttf: las Mono/Sans/Serif wireadas;
  las Condensed/SemiCondensed quedaron afuera por no estar en uso). El `colors_and_type.css` las
  busca con `url("fonts/...")` relativo — copiá `fonts/` al mismo nivel que el CSS. No dependas de CDN.
- **`build.mjs` emite Tailwind v4 + vanilla CSS.** Si el repo usa otro motor de tokens (CSS-in-JS,
  Panda…), adaptá el emisor de `build.mjs`, no la forma de `tokens.json`.
- **Paridad F4.3:** el `colors_and_type.css` incluido es el espejo generado actual. Cuando
  re-adjuntes `terres-design-system/globals.css`, verificá paridad byte-a-byte contra lo que
  genera `build.mjs` antes de cortar el cordón con el artefacto fuente.
- Acá no hay Node en runtime: `build.mjs`/`check-system.mjs` se corren en el repo real (o portando
  su lógica). En este proyecto se simulan vía script.
```
