# Roadmap — Terres Design System v2

> El mapa de qué falta construir y en qué orden. Cada fase termina con su
> specimen en el styleguide y verificación. **La visualización de datos es una
> capa transversal**, no una fase: el chart kit se blinda temprano (Fase 2) y
> cada fase posterior solo elige qué tipo usar y cómo presentarlo en su contexto.

Estado: ✅ listo · ◑ existe pero hay que migrar a v2 · ⛔ falta crear

---

## Capa transversal · Visualización de datos

No vive en una sola fase. Se construye una vez y se aplica en todas.

- **Doctrina de color para datos: ✅** (styleguide v2, secciones 05–06): 1 serie = naranja · 2 series con oposición real = naranja + petróleo · categórico = tonal de un hue · antes de un 2º color, probá un canal que no sea color.
- **Chart kit canónico: ◑→ Fase 2.** Barras, torta/dona, líneas, multi-serie, sparkline, área, heatmap, funnel y **línea de tiempo** (timeline — era un hueco, ahora es de 1ª clase). Migra `preview/data-viz.html` y `preview/color-charts.html` a v2.
- **Aplicación por contexto:** Fase 3 (dashboards, simulador, ficha), Fase 4 (comparativas dueño/partner), Fase 5 (theming editorial de los mismos gráficos para deck/informe — no se reinventan).

---

## Fundamentos — la columna vertebral
- ✅ Tokens, tipografía, espaciado, radios, sombras, doctrina de color (`tokens.json` → `colors_and_type.css`).
- ✅ `styleguide-v2.html` — showcase del sistema.

## Fase 1 · Kit de componentes — ✅ HECHO (v2.1.0)
`kit-componentes.html` — 17 familias con estados, gramática v2:
botones, campos/forms, toggles/switches, segmented, sliders, badges/tags,
chips de estado, cards, tabs, menús/dropdowns, tooltips, toasts, modales,
date picker, file upload, paginación, command palette.

## Fase 2 · Migración + chart kit — EN CURSO
- **Chart kit** (`kit-graficos.html`) — capa transversal de datos, v2 + timeline.
- **Migrar las ~29 preview cards** (pestaña Design System) de gramática v1 a v2:
  las de tokens (color, radii, shadows, spacing, type) heredan solas; re-autorar
  las de componentes (buttons, forms, badges, cards, modal, data-viz, micro-copy,
  empty/loading/error, motion, mobile-responsive…).

## Fase 3 · Producto (app SaaS) — EN CURSO
- ✅ App shell · dashboard · mapa de parcelas · tabla · simulador · ficha de prefactibilidad **migrados a v2** (tokens, mono, chips, sin emoji; bug del petróleo en el chart corregido). Consumen la doctrina de datos de la Fase 2.
- ✅ **`templates/ficha-factibilidad.html`** — ficha de lote / análisis de factibilidad: datos del lote, m² vendibles, **incidencia (rango barrio + posición del lote con factores)**, valor estimado de la tierra y detalle técnico auditable colapsable. Gramática del informe de gestión + patrones del wizard (range bar, factores +%/base, bloque naranja con frase Serif italic). Data-driven vía `<script id="ficha-data">`.
- ⛔ Carga de lote (wizard) · Filtros/búsqueda · Estados vacío/carga/error en contexto.
- ✅ **`flows/wizard-demanda-incidencia.html`** — embudo de entrada del dueño (dirección → demanda → incidencia barrio → incidencia lote → captura). Consume el chart kit. *(El `owner-onboarding` existente cubre prefactibilidad/tasación; éste cubre demanda/incidencia.)*
- *Recursos de uso frecuente a construir: análisis de factibilidad · tasación · informe de gestión · wizards de carga (dirección → cuántos compradores hay → rango de incidencia del barrio → del lote).*

## Fase 4 · Dueño / Partner
- ◑ Factibilidad link (pieza estrella, migrar).
- ⛔ Pedir tasación · Landing dueños · Captura/onboarding ·
  Dashboard de partner · Cartera compartida · Comisiones.

## Fase 5 · Editorial / Marca
- ✅ Informe de gestión.
- ◑ Press note · Emails transaccionales · Deck de inversores.
- ⛔ Landing institucional · **Theming editorial de gráficos** (no el kit — el kit
  ya existe desde Fase 2; acá solo su piel editorial) · Map theming cálido.

---

## Principios de secuencia
1. Cada capa depende de la anterior: componentes → preview cards → producto → público → editorial.
2. La visualización de datos atraviesa todo; se blinda en Fase 2 para que producto (Fase 3) no improvise.
3. Las decisiones de producto en vivo (copy específico, conversión, mapa real MapLibre) se validan en producción con métricas, no en el design system.
