# Changelog

Todos los cambios notables al sistema de diseño Terres se documentan acá.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), versionado según [SemVer](https://semver.org/lang/es/).

## Política de versionado

| Tipo | Cuándo | Cómo se anuncia |
|---|---|---|
| **MAJOR** (1.x → 2.0) | Cambio de token canónico (`--primary`, `--background`, `--foreground`), eliminación de componente, rebrand. | Aviso ≥ 2 semanas + guía de migración. |
| **MINOR** (1.0 → 1.1) | Nuevo componente, nuevo token, nueva sección de doc, ajuste de scale tonal. | Nota en el changelog + ping en #design. |
| **PATCH** (1.0.0 → 1.0.1) | Bugfix, ajuste copy, fix de accesibilidad, refactor interno. | Solo nota en el changelog. |

Cambios en `--radius`, escalas de espaciado o estados de componente son **MINOR** salvo que rompan layout existente (entonces MAJOR).

---

## [2.4.0] — 2026-06-03

> **Transferencia de craft Stripe → Terres.** MINOR: nuevos tokens de motion, sombra warm de dos capas y grupo de mapa remapeado a la escala naranja. Absorbe la *disciplina de oficio* del brief Stripe→Terres aplicando el **firewall §0** — se toma el craft (ritmo, jerarquía por tamaño, motion restraint, prueba por números), **nunca los activos de marca** (blurple, mesh gradient, skew, navy, Söhne, sombra azul). Sin tocar los 3 hexes canónicos. `colors_and_type.css` regenerado y en sync.

### Added
- **Tokens de motion semánticos** — `--motion-hover` (180ms · micro-interacciones color/sombra), `--motion-reveal` (280ms · entrada de cards al viewport), `--motion-sheet` (300ms · bottom-sheet/modal). Regla dura heredada: nada decorativo supera 500ms.
- **`--ease-out-quart`** (`cubic-bezier(0.25, 1, 0.5, 1)`) — **easing firma** de Terres para reveals y micro-interacciones, junto a los tres easings v2 existentes.
- **Grupo de mapa 3D remapeado a la escala naranja canónica** — `--map-volume-1…4` (cuerpo/piso par → orange-500, piso impar → orange-600, retiro 1 → orange-700, retiro 2 → orange-800), `--map-parcel-line` (contorno objetivo), `--map-parcel-hover`/`--map-parcel-selected` (feature-state), `--map-context-fill`/`--map-context-line` (catastro vecino). Cierra la deuda del asset `map-parcela-tokens`: los 3 naranjas ad-hoc de `MapTerres.tsx` (`#D86200`/`#C25600`/`#A84A00`) quedan **remapeados a pasos canónicos**, cero hexes inventados.
- **`preview/craft-stripe-terres.html`** — referencia renderizada de la craft (hero canónico, grid hairline, banda de números cálida, cierre committed naranja, reveal con IntersectionObserver), 100% sobre tokens, sin redefinir ninguno inline.
- **`CONTRIBUTING.md` · firewall §0 + checklist §5** — la tabla de "qué no se transfiere de Stripe" y el checklist de 12 puntos que toda pieza nueva debe pasar antes de entregar.

### Changed
- **Sombra warm de dos capas.** `--shadow-sm` y `--shadow-md` pasan de una capa a la **anatomía de dos capas** (bottom tenue + top difusa, spread negativo), manteniendo el tinte borgoña `rgba(56,0,0,…)`. Es la técnica Stripe recoloreada — hairline-first sigue primero. `--shadow-xs/lg/xl` sin cambios.
- **Reconciliación spacing/radios a un solo valor.** Resuelto el conflicto entre los documentos entrantes (que redefinían `--radius-sm/lg`, `--shadow-*`, `--motion-*` inline) y la fuente única: **una sola definición por token**. Spacing = escala 4px-base (ritmo estructural 8px, subpasos 2/4px vía `--space-05`/`--space-1`). Radios = `--radius-sm` 4px (controles) / `--radius-lg` 12px (cards), `--radius` 8px default en producto. El radio de 16px de Stripe se **rechaza** a favor del 12px Terres. Sin mutar valores de escala (cero impacto de layout). Documentado en `$meta` de `tokens.json`.
- **`tokens.json` `$meta`** — versión 2.0.0 → 2.4.0 (estaba congelada), descripción de la transferencia de craft.
- **Radio de card unificado a un solo valor — `--radius-lg` (12px).** Las superficies-card de producto que estaban en `--radius-md` (6px) u `--radius` (8px) pasan todas a 12px: KPI cards (producto/owner/partner), tablas, frame del mapa, paneles de chart, timelines, lista de documentos, tiles de zona y tool cards de la ficha, y las cards del kit (`.demo-card`/`.kpi-card`/`.spec-card`/`.panel`/`.dc`). Las cards de buyer ya estaban en 12px. **Quedan sin cambio** (no son cards) los callouts tintados, los bloques anidados dentro de modales/drawers, icon tiles, inputs, badges, nav y controles de mapa. Cierra el residuo "6 vs 12" que dejó la migración v2.2. Controles e inputs siguen en `--radius-sm` (4px).

### Firewall §0 (dejado explícitamente afuera)
- Blurple `#533afd`/`#635BFF`, mesh gradient WebGL, `skewY(-12deg)`, Söhne, navy `#11273e`, sombra azulada `rgba(0,55,112,…)`. Las variantes con sombra azul de Stripe sobreviven solo en `uploads/` (fuera del kit, excluido del guardrail) — no se incorporan.

---

## [2.3.2] — 2026-06-02

> **Hardening de sistema (post-auditoría).** PATCH/MINOR: prevención de regresiones, robustez de tokens y cierre de la gobernanza. Sin cambios de color (verificado: 0 diffs de color computado).

### Added
- **`check-system.mjs`** — guardrail anti-regresión. Falla (exit 1) ante hex fuera de paleta o emoji en el kit; lista gradientes para review (`--strict` también falla ante gradiente sin marcar). Excluye starters, mapa y excepciones sancionadas (email). Silenciar una línea intencional con `/* sys-ok */`.
- **`GOVERNANCE.md`** — ownership (roles + firma de MAJOR), ciclo de deprecación formal (vigente → deprecated → removido en MAJOR), métrica de adopción y receta de CI.
- **Grilla de cobertura de accesibilidad** en `preview/accessibility.html` — 17 familias × foco/target/ARIA/motion, con evidencia real del kit (F3.3).
- **Token `--destructive-hover`** (`#9C1414`) — formaliza el hover del botón destructive que antes era un hex suelto en `kit-componentes.css`.

### Changed
- **F1.2 · Las semánticas ahora referencian la primitiva.** `build.mjs` emite `var(--orange-500)` etc. cuando un token es una referencia `{scales.…}`. Un cambio de primitiva se propaga solo. `tokens.json`: ~35 valores literales convertidos a referencias. **Cero cambio de color** (cada cadena `var()` resuelve al mismo hex que antes).
- **F5.1 · Cobertura de comentarios de token: 100%.** Documentados los 30 tokens envelope que faltaban (estados, mapa, muted/accent, inputs).
- **`colors_and_type.css` regenerado** desde `tokens.json`; en sync.

### Fixed
- **Emoji como ícono eliminados** (README: "No emoji. Anywhere."). `📍` en `HeroBlock.jsx`, `StickyAddressBar.jsx`, `AddressCTA.jsx`, `ReportPreview.jsx` → lucide map-pin; `💬` + flechas en la topbar de `factibilidad-link.html` → lucide download/share/message. Los encontró `check-system.mjs`.
- **Hex fuera de paleta** en `kit-componentes.css` (destructive hover), `styleguide-v2.html` (bordes good/bad) y `slides/ComparisonSlide.html`, `social/stories.css` → mapeados a tokens. Chrome de infraestructura (letterbox de deck, splash de bundler, canvas de stories) marcado `/* sys-ok */`.

---

## [2.3.1] — 2026-06-02

> **Remediación de auditoría (playbook 02ui, 6 dimensiones).** PATCH: fixes de paleta, paridad y accesibilidad sin tocar tokens canonicos ni romper bindings. Ver el dashboard `Auditoría Sistema de Diseño.html`.

### Fixed
- **F2.1 · Segundo verde fuera de paleta eliminado.** El verde brillante `#d8efd8`/`#2c6a2c`/`#5F6F2C` sobrevivía en `HeroBlock.jsx`, `ReportPreview.jsx`, `factibilidad-link.html` y `styleguide-v2.html` (el v2.2.0 solo lo había corregido en `Prefactibilidad.jsx`). Reemplazado por `--success-subtle`/`--success` (oliva, el unico verde del sistema).
- **F2.2 · Gradientes decorativos de relleno → bloque solido.** `HeroBlock` y `LotGrid` (cards hero crema→naranja), `QuoteSlide` (avatar) y `ComparisonSlide` (`.cmp-con`) pasan a `--primary`/`--foreground` solido. Se **conservan** los gradientes funcionales (shimmer de skeleton, grilla de `DenseSection`, fade de mapa de la ficha, rayas-textura semánticas) — no son rellenos decorativos.
- **F3.1 · Excepción de contraste firmada.** El par institucional cream-on-orange (2.78:1) queda documentado en `tokens.json` como excepción de marca firmada: autorizado solo para wordmark/bloque, nunca texto de lectura ni <24px; override a `--foreground` en pliegos públicos/RFP.

### Changed
- **F2.3 / F4.2 · `social/stories.css` deja de redefinir tokens.** Ya no re-declara `--primary`/`--background`/etc. como hex; ahora hace `@import` de `colors_and_type.css` (fuente unica) y solo conserva alias locales (`--cream-light`, `--petrol`) y el subset de fuentes. Elimina el riesgo de drift.
- **F5.2 · Docstrings de componente completados.** `AppShell`, `KpiCard`, `HeroBlock`, `LotGrid`, `DenseSection` y `stories.jsx` suman el docstring `que es + cuando usar + cuando NO` que exige CONTRIBUTING.
- **F5.1 (parcial) · Comentarios de token.** Documentados los 9 tokens de herencia shadcn (`--card`, `--*-foreground`, `--state-row-*`) con nota "mantenido por paridad shadcn".
- **`colors_and_type.css` regenerado** desde `tokens.json` (`node build.mjs`); en sync (`--check` pasa).

### Decidido (sin cambio de codigo)
- **F1.3 · Los 7 "tokens muertos" se CONSERVAN.** `--space-0/05/8`, `--amber-600`, `--leading-normal`, `--tracking-normal`, `--state-focus-ring` resultaron ser miembros documentados de escalas completas (README §4.3, styleguide, CHANGELOG P1.5). Borrarlos fragmentaría escalas que el sistema publicita como granulares — se documentan como completitud de escala en vez de eliminarse.
- **9 tokens shadcn: MANTENER** por paridad con shadcn/Tailwind (decisión de owner).

### Archived
- **F2.4 · `templates/ficha-factibilidad-v1.html` → `templates/_archive/`.** Versión legacy retirada del kit activo; la v2 (`ficha-factibilidad.html`) es la canonica.

### Pendiente (proceso / repo)
- F4.3 `node build.mjs --check` en CI · F6.1 owner nombrado · F6.2 ciclo de deprecación formal · F6.3 métrica de adopción · F5.1 completar los 39 comments de token restantes.

---

## [2.3.0] — 2026-05-30

> **Fase 3 · Ficha de análisis de factibilidad.** Pieza de producto que extiende el bento de prefactibilidad para entregar el análisis completo: incidencia + valor estimado de la tierra.

### Added
- **`templates/ficha-factibilidad.html`** — **análisis de factibilidad** como documento-recorrido editorial (registro `factibilidad-link` con gramática v2: íconos SVG, no emoji), no como dashboard bento. Cuatro movimientos numerados: **(1) Acerca de tu lote** —datos, ubicación/mapa y "en tu zona hay" (emprendimientos publicados · obras en proceso · terrenos en portales)—; **(2) Acerca del análisis** —metros vendibles como único bloque naranja (regla editorial), código urbanístico con building stack, balance de superficies, plusvalía y patrimonio—; **(3) Lo que sigue** —tres ganchos tease+CTA: valor/tasación (bloqueado), compradores activos y tiempo estimado de venta—; **(4) Conocé Terres** —cómo trabajamos (4 pasos) + extras—, cierre en bloque oscuro y sticky CTA. **Capa de movimiento (dentro del sistema):** reveal on scroll escalonado por `IntersectionObserver`, count-up de los números clave en mono tabular, barra de proporción cubiertos/expansiones y building stack que crecen al entrar en vista, y pulso naranja sobre la parcela del mapa — todo gated bajo `body.motion` (degrada sin JS) y con guarda `prefers-reduced-motion`. **Banda de mercado full-bleed** (oscura, burdeos) con stats grandes del entorno (emprendimientos · obras · terrenos) y glow cálido sutil en el hero, principios tomados de referencias de producto de clase mundial pero renderizados 100% en tokens Terres. **Fondo de mapa real** en el bloque naranja de metros vendibles: grilla de tiles OSM de la cuadra del lote, tintada cálida y revelada del lado derecho por un degradé que protege la legibilidad del número, con crédito "© OpenStreetMap" (sin API key; el backend templa z/x/y desde la lat/lng del lote). Tokens only, mono tabular, imprimible a A4. Cierra el ítem `⛔ Ficha de lote ampliada` del roadmap (Fase 3).

---

## [2.2.0] — 2026-05-29

> **Fase 3 (en curso) · Producto migrado a v2.** La app SaaS existente (app shell, dashboard, mapa, tabla, simulador, ficha de prefactibilidad) se re-autora a gramática v2 y pasa a consumir la doctrina de datos de la Fase 2. Sin tocar tokens canónicos.

### Changed
- **`ui_kits/product/` migrado a v2.** Radios a tokens (`--radius-md` en cards de producto, `--radius-lg` en bloques institucionales naranjas, `--radius-sm` en inputs/botones), eyebrows en mono, valores en mono tabular, focus halo de 3px en el simulador.
- **`ParcelMap.jsx`** — eliminados todos los hexes hardcodeados; ahora 100 % sobre tokens `--map-*` (agua cálida, parcelas, roads, stroke).
- **`ParcelTable.jsx`** — header pesado de burgundy reemplazado por header hairline (`--surface-sunken` + labels mono muted); `StatusTag` migrado de rellenos sólidos a **chips tintados v2** con punto de color.
- **`Prefactibilidad.jsx`** — emoji (`↓ ⤴ 💬 ⓘ ●`) reemplazados por íconos SVG (lucide); botón de comentarios pasa de hexes sueltos (`#d8efd8`/`#2c6a2c`) a tokens `--success-subtle`/`--success`; corregido el dato `NaN UVA` → `12,4 UVA`.

### Fixed
- **Bug de doctrina de datos en el dashboard.** El gráfico "Lotes por canal" (categórico) usaba `--chart-2` (petróleo, frío) en la barra "Activa". Remapeado a la rampa cálida (`--chart-1`/`--chart-3`/`--chart-4`), consistente con `data-viz` y la doctrina: el petróleo se reserva para comparaciones de 2 series.

### Added
- **`flows/wizard-demanda-incidencia.html`** — wizard nuevo del embudo de entrada del dueño: **dirección → demanda (cuántos compradores activos hay en tu barrio) → incidencia del barrio (rango USD/m²) → incidencia de tu lote (marker dentro del rango + factores + valor estimado) → captura de contacto**. Mobile-first, gramática v2, consume los patrones del chart kit (barras de demanda con tu barrio resaltado, heat-meter de un solo hue, barras de rango de incidencia). Distinto del `owner-onboarding` existente (ese es el flujo de prefactibilidad/tasación); éste vende el *pull* de mercado y el precio/m² antes de pedir nada.
- **`templates/informe-gestion.html` promovido a template canónico v2.** El reporte trimestral de gestión comercial (timeline del mandato, embudo alcance→consideración→oferta, brecha realizable, lectura de mercado) queda en gramática v2: labels/eyebrows y números en mono tabular, radios en tokens, y la brecha teórico-vs-oferta usa **petróleo + naranja** (comparación legítima de 2 series). Data-driven vía `report-data` JSON + toggle "Ver variables". Registrado en `templates/README.md` (antes no figuraba).

---

## [2.1.0] — 2026-05-29

> **Fase 1 · Kit de componentes.** Se blinda la capa de componentes del sistema: un inventario completo y robusto, en gramática v2 (labels en mono, radios ajustados, hairline-first, datos en tabular-nums, paleta cálida + petróleo para info). Es la base sobre la que se construyen producto, portal del dueño y editorial. No toca tokens canónicos.

### Added
- **`kit-componentes.html`** — kit completo de 17 familias con todos sus estados, enlazado desde `styleguide-v2.html`. Migra a v2 las que ya existían (botones, campos/forms, badges/tags, chips de estado, cards, modales) y suma las que faltaban: **tabs, menús/dropdowns, toasts/notificaciones, tooltips, segmented control, toggles/switches, sliders, date picker, file upload, paginación y command palette**.
- **`kit-componentes.css`** — estilos del kit, 100 % sobre tokens de `colors_and_type.css` (sin hexes sueltos, sin emoji).
- **`kit-componentes.js`** — interacción vanilla: tabs, segmented, sliders, dropdown, toasts en vivo, modal, date picker (Mayo 2026), dropzone y command palette (⌘K / Ctrl+K).
- **Fase 2 (en curso) · `kit-graficos.html`** — **chart kit canónico** como capa transversal de datos: barras (1 serie + horizontal), comparación de 2 series (naranja + petróleo), categórico (stacked tonal + rampa cálida), líneas, área &amp; sparkline, torta/dona + anillo de progreso, funnel, heatmap secuencial y **línea de tiempo** (horizontal de gestión + vertical de historial — nueva en v2). Hereda la doctrina de color de datos. Estilos en `kit-graficos.css`.
- **`ROADMAP.md`** — plan completo de construcción con la visualización de datos marcada como **capa transversal** (se blinda en Fase 2, se aplica en todas).

### Notes
- El kit es la **fuente de verdad de comportamiento y estados**.

### Changed
- **Migración de preview cards a gramática v2 (pestaña Design System).** Re-autoradas las cards de componentes a tokens puros (sin hexes sueltos), radios ajustados, labels en mono, `tabular-nums` en datos, chips de estado tintados, halo de focus de 3px, y reemplazo de todo emoji por íconos SVG: `buttons`, `button-states`, `cards`, `badges-tags`, `form-inputs`, `input-states`, `form-patterns`, `modal-dialog`, `address-autocomplete`, `empty-loading-error`, `micro-copy`, `motion`, `mobile-responsive`, `accessibility`, `data-viz` y `color-charts`. Las cards de tokens (color, radii, shadows, spacing, type, wordmark) heredan los valores canónicos y muestran sus hexes/medidas de forma documental.
- `data-viz` y `color-charts` ahora remiten al chart kit (`kit-graficos.html`) como detalle completo.
- `preview/preview.css` — el `.eyebrow` compartido pasa a monoespaciada (v2).

---

## [2.0.0] — 2026-05-28

> **Rediseño mayor.** Se porta una gramática SaaS (escala tipográfica granular, ritmo de 4px, radios ajustados, elevación hairline-first, datos en monoespaciada) sobre la paleta cálida de Terres. Los 3 hexes canónicos, IBM Plex y el wordmark con punto quedan intactos.

### Added
- **Petrol** (`--petrol-50…900`, ancla `#236B6B`) — primer y único hue frío del sistema, desaturado para convivir con lo cálido. Alimenta `--info`, el chip de estado petróleo y `--chart-2` (contrapunto de 2 series al naranja).
- **Amber** (`--amber-50…700`, `--warning` = `#B07D08`) — estado de advertencia distinto del naranja de marca (que es rojo-anaranjado = acción).
- **Superficies de estado tintadas** — `--info-subtle`, `--success-subtle`, `--warning-subtle`, `--destructive-subtle` para chips y callouts.
- **Tokens de peso** — `--weight-light` (300) … `--weight-bold` (700), aplicados *lighter at scale*.
- **Superficies de producto** — `--surface-raised` (header/rail) y `--surface-sunken` (zebra/well). `--border-strong` para reglas enfatizadas. `--shadow-xl` para modales.
- **Type scale** — sumado `--text-subheading` (20px); ramp de espaciado extendido con `--space-05/10/11/12`; radios `--radius-xs` (2) y `--radius-md` (6).
- **`styleguide-v2.html`** — showcase completo del sistema (color, tipografía, espaciado, componentes, data viz).
- `build.mjs` ahora emite el grupo `weights` desde `tokens.json`.

### Changed
- **Tipografía** — escala más granular y SaaS-tight: body 16→15, caption 12→11. Pesos *lighter at scale*: display 400, h1/h2 500, h3/h4 600 (antes 600/700 en todo).
- **Plex Mono asciende a voz de datos + labels** — eyebrows, table headers y form labels pasan a monoespaciada tabular, además de KPIs/precios/IDs.
- **Radios ajustados** — `--radius` default 12→8px (registro 4/6/8). `--radius-sm` 8→4, `--radius-lg` 20→12.
- **Espaciado más denso** — mid-ramp comprimido (`--space-7` 48→32). Producto empaqueta más; editorial sigue respirando con space-10…12.
- **Elevación hairline-first** — sombras reservadas para elevación real; superficies se separan con borde de 1px.
- **Plex Serif** — ya no es exclusivo de decks de inversores; se permite mezclar un acento serif en vistas sans.
- **Gráficos** — par por defecto naranja/petróleo para comparaciones de 2 series.

### Removed
- **Regla "un solo bloque naranja por pieza"** — levantada. El naranja sigue siendo señal (acción/institucional), pero sin tope rígido; queda a criterio.
- **Regla "nunca mezclar Plex Sans y Serif en la misma vista"** — levantada.

### Migration
- Reemplazo directo (sin v1 en paralelo). Las plantillas y cards de `preview/` heredan los nuevos valores automáticamente vía tokens; revisar layouts que dependían del espaciado holgado de v1 (`--space-7/8/9` ahora más chicos) y del radio de 12px.
- El petróleo es el cambio más reversible: si rompe la identidad, basta repintar `--info`/`--chart-2` a tonos cálidos y quitar la escala petrol.

---

## [1.4.0] — 2026-05-26

### Added
- **P4** · `tokens.json` como **fuente única de verdad** para todos los tokens. `colors_and_type.css` y el `globals.css` del repo Tailwind ahora se derivan de ahí.
- **P4** · `build.mjs` — script Node sin dependencias que regenera `colors_and_type.css` desde `tokens.json`. Marcadores `BUILD:TOKENS:START/END` en el CSS delimitan la zona generada; las semánticas hand-written (h1, p, .wordmark, @font-face) quedan intactas. Modo `--check` para CI.
- **P4** · IBM Plex Sans self-hosted (14 archivos, Thin→Bold + italics) en `fonts/`. Sumado al Serif ya self-hosted, son 28 archivos en total.
- **P4** · 4 iconos custom Terres en `assets/icons/` para casos que Lucide no cubre: `terres-parcel.svg`, `terres-fot.svg`, `terres-empty-lot.svg`, `terres-demolition.svg`. Mismo lenguaje visual (1.5px stroke, currentColor, sin fill).
- **P4** · `preview/icons-lucide.html` rebuild: 5 grupos semánticos (Navegación, Real estate, Custom Terres, Operación, Comunicación) + escala de tamaños 18/20/24/32.

### Changed
- **Lucide confirmado** como icon set canónico (ya no es substituto). Sacada la `⚠️ CDN icon substitution flag` del README.
- **Editorial-light cream** (`#FFF8EC`) ahora se permite en cualquier pieza editorial larga (PDFs, .docx, press notes, dossiers, landings largas) — no sólo PDFs y .docx.
- **Cream-on-orange** institutional pair: aprobado como decisión cerrada. Sacada la nota técnica "fails WCAG AA mathematically" del cuerpo principal.
- README sección 4.4: `--radius` default documentado correctamente como **12px** (estaba como 8px en el README pero el CSS ya era 12px desde v1.1).
- README sección 10 (Open questions): refresh — 7 decisiones lockeadas, 3 pendientes de baja prioridad.

### Removed
- **Dark mode** (estaba como propuesta v1.2 / P2.13). Decisión: no está en scope. Borrado el bloque `:root.dark` de `colors_and_type.css`, borrado `preview/dark-mode.html` y desregistrado del Design System tab.
- **Regla "no exclamation marks in product copy"**: permitido, queda a criterio del autor.
- **Inter font / regla OpenDoor**: borrada entera. Terres usa sólo IBM Plex (Sans / Serif / Mono).

---

## [1.3.0] — 2026-05-26

### Added
- **P3** · CHANGELOG.md y política de versionado.
- **P3** · CONTRIBUTING.md con flujo de propuesta de componente.
- **P3** · Brand assets extendidos: wordmark monocromos (positivo / negativo), favicon, og-image, marca de exclusión, ícono cuadrado.
- **P3** · Template de factibilidad como link compartible (`templates/factibilidad-link.html`).
- **P3** · Templates de press note y email transaccional.

### Changed
- README ahora referencia changelog y contributing en el índice.
- **Factibilidad** rediseñada como página web compartible (link único) en lugar de PDF. Refleja el output real del negocio en `factibilidades.terres.com.ar/?id=…`.

---

## [1.2.0] — 2026-05-26

### Added
- **P2.9** · Motion specs: 5 duraciones (`--motion-instant…lazy`) + 3 easings.
- **P2.10** · Data viz patterns: 6 chart canónicos (bar, donut, sparkline, line con benchmark, heatmap, funnel).
- **P2.11** · Micro-copy library con 30+ pares ✓/✕ por contexto (CTAs, errores, vacíos, confirmaciones, onboarding, emails, roles).
- **P2.12** · Accessibility spec: pares de contraste verificados, focus visible, hit targets 44px, checklist ARIA, reduced-motion.
- **P2.13** · Dark mode (propuesta): bloque `:root.dark` con 14 tokens, brand orange sube a `#FF8A2C` para AA.

---

## [1.1.0] — 2026-05-26

### Added
- **P1.4** · Escalas tonales: `--orange-50…900`, `--burgundy-50…900`, `--neutral-50…900`.
- **P1.5** · State tokens (`--state-primary-hover`, `--state-focus-ring`, `--state-input-error-bg`, etc).
- **P1.6** · Patrones de formulario: wizard multi-step, radio cards, file upload con progress, stepper.
- **P1.7** · Empty / loading / error states (8 estados canónicos).
- **P1.8** · Breakpoints (`--bp-sm…2xl`) + reglas mobile (44px targets, bottom nav, 16px inputs anti-zoom iOS).

### Changed
- `--radius` default subió de 8px a 12px (Airbnb-leaning). `--radius-sm` de 4→8, `--radius-lg` de 12→20.
- Card "Canonical colors" ahora muestra acento naranja en swatches no-naranja.

---

## [1.0.0] — 2026-05-26

### Added
- 3 hexes canónicos (`--primary` `#E76D00`, `--background` `#FFEDD6`, `--foreground` `#380000`).
- Tipografía IBM Plex (Sans / Serif / Mono) con escala de 7 pasos.
- Wordmark SVG en 3 variantes (primary / cream / foreground).
- Iconografía: Lucide a 1.5px stroke.
- Sistema de espaciado (4px base, 9 pasos), radii, shadows, semánticas de color.
- Voice y micro-copy rules (Rioplatense, "vos", verbos concretos, sin emoji).
- UI kit Producto (AppShell, KPI cards, parcel table, parcel map, viability simulator, Prefactibilidad detail).
- UI kit Editorial (Header con tabs, hero form-first, trust strip, press strip con quote, how it works, report preview interactivo, customer logos, dense dark section, vs competitors stack, sticky address bar, lot grid, address CTA, newsletter, footer).
- Slides investor: title, big number, channels, comparison, quote.
- Preview cards en pestaña Design System (colores, type, spacing, componentes, brand).
- SKILL.md y README.md.

### Caveats al lanzamiento
- IBM Plex Mono carga desde Google Fonts CDN (Sans + Serif están self-hosted desde v1.4).
- Sin fotografía. Heroes usan gradient orange como placeholder.
- `globals.css` (Tailwind) y `colors_and_type.css` (vanilla) son dos fuentes de verdad — unificado a `tokens.json` en v1.4.
