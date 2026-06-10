# `reference/` — la especificación visual del sistema

Esto es **lo que el kernel no puede expresar en tokens**: cómo se ven y se comportan
los componentes y patrones. Es material de **referencia**, no de runtime — no lo
importás en la app, lo *mirás* antes de construir una pieza para no reinventar
estados, radios, sombras o copy.

## Qué hay

```
reference/
├── styleguide.html     ← EL sistema entero en una sola página, offline (self-contained).
│                          Abrilo primero: color, tipografía, spacing, componentes, data-viz.
└── preview/            ← 28 cards, una por patrón. El spec fino de cada cosa.
    ├── preview.css         · base compartida (importa el kernel: ../../colors_and_type.css)
    ├── buttons.html        · variantes de botón + regla de CTA con verbo concreto
    ├── button-states.html  · hover / focus / disabled
    ├── form-inputs.html · input-states.html · form-patterns.html
    ├── badges-tags.html    · chips de estado (patrón tintado v2)
    ├── cards.html · modal-dialog.html
    ├── color-canonical.html · color-semantic.html · color-charts.html · tonal-scales.html
    ├── type-families.html · type-scale.html · type-wordmark.html
    ├── spacing-scale.html · radii.html · shadows.html · motion.html
    ├── data-viz.html       · gráficos (paleta cálida, sin azul)
    ├── icons-lucide.html   · íconos lucide stroke 1.5
    ├── brand-wordmarks.html · brand-assets-extended.html
    ├── accessibility.html · mobile-responsive.html · micro-copy.html
    ├── empty-loading-error.html · address-autocomplete.html
    └── craft-stripe-terres.html · transferencia de craft (firewall §0, v2.4)
```

## Cómo usarlas

- **Empezá por `styleguide.html`** — es la foto completa y funciona sola (fuentes embebidas).
- Para una pieza puntual, abrí su card: si vas a hacer un botón, mirá `buttons.html` +
  `button-states.html`; si es un formulario, `form-inputs.html` + `input-states.html`.
- Las cards toman los tokens reales del kernel (`../../colors_and_type.css` → `../fonts/`),
  así que **renderizan idénticas al sistema** — si cambian los tokens, cambian las cards.
- Regla de oro: **si tu pieza nueva no se parece a estas cards, está fuera de sistema.**
  El gate (`check-system`) atrapa la paleta; estas cards atrapan todo lo demás.
