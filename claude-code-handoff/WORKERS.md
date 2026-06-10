# Terres — backlog de workers (Cowork)

> El **árbol de herramientas** (`Mapa de Recursos.html`) convertido en cola de trabajo.
> Cada tarea es un brief **auto-contenido**: un worker la toma sin más contexto que este
> archivo + `CLAUDE.md`. Pensado para fan-out paralelo en Cowork.

---

## Cómo orquestar (modelo de ejecución)

1. **Contrato compartido.** Cada worker arranca leyendo `CLAUDE.md` (la gramática) + su brief.
   No hay contexto implícito: si no está en el brief, no se asume.
2. **El gate es el código, no la confianza.** Ningún PR mergea sin `node check-system.mjs` en
   verde (y `build.mjs --check` si tocó tokens). Eso hace seguro paralelizar a desconocidos.
3. **Fan-out por carriles independientes.** Las 3 audiencias (Propietario / Comprador / Partner)
   no comparten archivos → 3 workers en paralelo sin conflictos. Outputs, slides y foundations
   son carriles aparte.
4. **Orden por dependencia.** El **kernel de diseño** (EPIC-0) va primero y solo: todo lo demás
   referencia los tokens que produce. Después, todo lo demás es paralelo.
5. **Un PR por tarea**, chico y revisable. El semver del sistema (hoy **v2.4.0**) gobierna qué
   es patch / minor / major (ver `GOVERNANCE.md`).

### Plantilla de brief (copiá para tareas nuevas)

```
ID:          <EPIC-NN>
Superficie:  <nombre> · <ruta destino en el repo real>
Referencia:  <archivo HTML de este proyecto que muestra el look & behavior>
Input:       <datos / endpoints / props que necesita>
Hacé:        <qué construir, en una frase>
DoD:         §7 de CLAUDE.md + <criterios específicos de esta tarea>
Verify:      node check-system.mjs   [+ build.mjs --check si tocó tokens]
Depende de:  <IDs previos o "—">
```

---

## EPIC-0 · Kernel de diseño (bloquea todo — hacelo primero, solo)

| ID | Tarea | Referencia | DoD específico |
|----|-------|-----------|----------------|
| **0.1** | Portar `tokens.json` + `build.mjs` al repo y generar `globals.css` (Tailwind v4) y `colors_and_type.css` reales | `design-kernel/` | `build.mjs --check` verde; un cambio de primitiva se propaga a ambos espejos |
| **0.2** | Wirear `check-system.mjs` + `build.mjs --check` en CI y pre-commit | `design-kernel/check-system.mjs` | PR con hex fuera de paleta o emoji **falla** el pipeline |
| **0.3** | Self-hostear las 3 familias Plex desde `fonts/` (sin CDN) | `fonts/` | `@font-face` resuelto byte-a-byte; cero pedido a unpkg/Google |
| **0.4** | Hook de Claude Code: correr `check-system.mjs` post-edición de `.html/.css/.jsx` | — | El agente ve la violación antes de cerrar el turno |

> Output de EPIC-0: cualquier worker posterior puede escribir `var(--primary)` y confiar en que
> existe y es correcto. **No abras los otros epics hasta que 0.1–0.2 estén en verde.**

---

## EPIC-1 · Ecosistema externo · 3 carriles paralelos

**Carril Propietario** (`owner/`)
| ID | Superficie · destino | Referencia | DoD específico |
|----|---------------------|-----------|----------------|
| 1.1 | Onboarding (wizard 4 pasos) · `/owner/onboarding` | `owner/onboarding.html` | Persiste estado; valida CUIT con error accionable |
| 1.2 | Panel "Mi propiedad" · `/owner/panel` | `owner/panel.html` | KPIs en mono; timeline del mandato; loading + empty |
| 1.3 | Bandeja de ofertas (efectivo vs canje) · aceptación 3 pasos · contraoferta | `owner/panel.html` | Chip "Contraoferta enviada" persiste; flujo boleto→seña→escritura |

**Carril Comprador** (`buyer/`)
| ID | Superficie · destino | Referencia | DoD específico |
|----|---------------------|-----------|----------------|
| 1.4 | Explorá lotes (búsqueda + filtros + drawer) · `/buyer/explorar` | `buyer/explorar.html` | Empty: "No hay lotes que coincidan en este recorte." |
| 1.5 | Wizard de factibilidad (demanda→incidencia→captura) | `flows/wizard-demanda-incidencia.html` | Mapa re-tematizado (sin azul); incidencia en mono |

**Carril Partner** (`partner/`)
| ID | Superficie · destino | Referencia | DoD específico |
|----|---------------------|-----------|----------------|
| 1.6 | Onboarding agencia (wizard 4 pasos) · `/partner/onboarding` | `partner/onboarding.html` | — |
| 1.7 | Dashboard (cartera · comisiones · clientes + drawer de operación) | `partner/dashboard.html` | Tabla mono tabular; drawer con timeline; tags burgundy máx 3-4 |

---

## EPIC-2 · Outputs de negocio (plantillas) · paralelo

| ID | Plantilla · destino | Referencia | DoD específico |
|----|---------------------|-----------|----------------|
| 2.1 | **Factibilidad (link)** — output principal, URL pública imprimible | `templates/factibilidad-link.html` | Imprime limpio (print CSS); sin sombras (editorial) |
| 2.2 | Ficha de factibilidad (m² vendibles, incidencia, valor) | `templates/ficha-factibilidad.html` | Números en mono; bloque institucional naranja |
| 2.3 | Informe de gestión (trimestral: timeline, embudo, brecha) | `templates/informe-gestion.html` | Data-viz warm-led (naranja→petróleo) |
| 2.4 | Email transaccional (560px, inline CSS, email-safe) | `templates/email-transactional.html` | CSS inline (no link externo); sin emoji |
| 2.5 | Comunicado de prensa (Plex Sans, editorial-light) | `templates/press-note.html` | Fondo `--editorial-light`; voz institucional |
| 2.6 | Factura de factibilidad (comprobante del servicio) | `Factura de Factibilidad.html` | Números a la argentina; tabular |

---

## EPIC-3 · Slides · investor deck (Plex Serif) · paralelo

| ID | Tarea | Referencia | DoD específico |
|----|-------|-----------|----------------|
| 3.1 | Sistema de deck (1920×1080, escalado propio) + 5 layouts | `slides/*` | Title / Big number / Channels / Comparison / Quote; Serif display |

---

## EPIC-4 · Pendientes de leverage (lo que falta construir)

> Estos son los que mueven la aguja — vienen del ROADMAP, no del Mapa ya construido.

| ID | Tarea | Spec / referencia | Por qué |
|----|-------|-------------------|---------|
| **4.1** | **Mensajería / contacto** — hilo comprador ↔ propietario ↔ partner | rail "Mensajería" en `Mapa de Recursos.html` | Hoy "Hablá con el dueño/asesor" y "Rechazar" son botones sin destino. **Máximo leverage.** |
| 4.2 | Estados carga/error en las superficies nuevas (skeleton + error) | `preview/empty-loading-error.html` | Cierra la paridad de robustez |
| 4.3 | Partner payout — timeline de acreditación de comisión | `partner/dashboard.html` ("En proceso") | Cierra el loop de plata del partner |
| 4.4 | Gobernanza en CI — nombrar owner + wirear `build --check` / `check-system` | `GOVERNANCE.md` | Hace que el sistema se defienda solo |

---

## EPIC-5 · Foundations & catálogo (referencia viva) · opcional/continuo

El long-tail de `preview/*` (color, tipo, espaciado, motion, componentes, brand) + `index.html`
(catálogo buscable) + `Auditoría Sistema de Diseño.html` (dashboard de 6 dimensiones). En el repo
real esto se vuelve **Storybook / página de styleguide** generada desde los mismos tokens. Un
worker dedicado lo mantiene en sync con el kernel.

---

## Grafo de dependencias (resumen)

```
EPIC-0 (kernel) ──┬─→ EPIC-1  (3 carriles ∥)
   [primero,      ├─→ EPIC-2  (plantillas ∥)
    solo]         ├─→ EPIC-3  (slides)
                  ├─→ EPIC-4  (4.1 mensajería = primero del epic)
                  └─→ EPIC-5  (foundations, continuo)
```

Regla de oro para el orquestador: **un solo worker en EPIC-0; después, fan-out total.**
El `check-system` verde es el contrato que hace seguro no coordinar más que eso.
