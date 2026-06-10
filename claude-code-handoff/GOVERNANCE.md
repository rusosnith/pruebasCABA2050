# Gobernanza — Terres Design System

> Cómo se decide, se versiona, se deprecia y se mide la adopción del sistema.
> Complementa [CONTRIBUTING.md](./CONTRIBUTING.md) (cómo sumar) y [CHANGELOG.md](./CHANGELOG.md) (qué cambió).

---

## 1. Ownership

El sistema necesita **una persona responsable** (o una dupla), no solo un canal. Sin dueño, las excepciones se acumulan sin que nadie las firme (lo que pasó con el verde fuera de paleta y los gradientes, ver auditoría 2026-06).

| Rol | Responsable | Qué decide |
|---|---|---|
| **Owner del sistema** | _(asignar — completar el nombre)_ | Aprueba PRs al sistema, corta versiones, firma excepciones de marca (ej. cream-on-orange), resuelve "¿esto va o no va?". |
| **Backup** | _(asignar)_ | Cubre al owner; segunda firma en cambios MAJOR. |

**Regla:** todo cambio MAJOR (token canónico, eliminación de componente, rebrand) requiere la firma del owner **antes** de tocar código. Los PATCH no.

---

## 2. Ciclo de deprecación

Nada se borra de golpe. Todo lo que sale del sistema pasa por tres estados:

```
  vigente  ──▶  deprecated  ──▶  removido
              (marcado, sigue        (en la próxima
               funcionando)           MAJOR)
```

1. **`deprecated`** — se marca con un comentario `/* deprecated YYYY-MM-DD: usá <reemplazo> */` (en `tokens.json`, en el docstring del componente, o en `CHANGELOG.md`). **Sigue funcionando** — no se rompe nada.
2. **Aviso** — se anuncia en el CHANGELOG y se da **≥ 2 semanas** (igual que un MAJOR).
3. **Removido** — recién entonces se elimina, en una versión **MAJOR**.

**Candidatos actuales a entrar al ciclo:** `templates/_archive/ficha-factibilidad-v1.html` (ya archivada), y cualquier token que el guardrail siga reportando sin uso tras una review.

**Antes de remover un token:** confirmar **cero uso** con `grep var(--ese-token)` en todo el repo (regla de la auditoría). Si no se puede confirmar, no se remueve.

---

## 3. Métrica de adopción

El sistema sirve si **se usa**. Tres señales, todas medibles sin herramientas externas:

| Señal | Cómo se mide | Meta |
|---|---|---|
| **Limpieza** | `node check-system.mjs` → 0 errores (hex fuera de paleta + emoji) | 0, siempre |
| **Paridad** | `node build.mjs --check` → exit 0 | en sync, siempre |
| **Cobertura de tokens** | superficies que importan `colors_and_type.css` / redefinen color a mano | tender a 100% importando; las excepciones (email) documentadas |

Correr las tres en CI (ver §4) convierte la adopción en algo que se vigila solo, no que se audita a mano cada tanto.

---

## 4. CI — el sistema se defiende solo

Agregar al pipeline del repo (y, si se puede, como pre-commit hook):

```bash
node build.mjs --check     # falla si colors_and_type.css quedó fuera de sync con tokens.json
node check-system.mjs      # falla ante hex fuera de paleta o emoji en el kit
# node check-system.mjs --strict   # además exige que cada gradiente esté marcado /* sys-ok */
```

Cualquiera de los dos que falle, frena el merge. Así, los hallazgos de la auditoría 2026-06 (verde fuera de paleta, gradientes decorativos, emoji, drift de tokens) **no pueden volver a entrar** sin que alguien los marque explícitamente como intencionales (`/* sys-ok */`).

---

## 5. Publicado vs. experimental

El [ROADMAP.md](./ROADMAP.md) ya usa marcadores por fase — se adoptan como estados de publicación:

- **✅ estable** — publicado, consumir con confianza.
- **◑ en migración** — existe pero se está re-autorando a v2; puede cambiar.
- **⛔ no construido** — planeado, todavía no existe.

Un componente no se considera "publicado" hasta que: tiene preview card en `preview/`, docstring `qué es / cuándo usar / cuándo NO`, pasa `check-system.mjs`, y cubre sus 6 estados canónicos (criterios de CONTRIBUTING).
