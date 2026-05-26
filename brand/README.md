# MESO — Brand Kit

Brand system for **@meso/ui**, the streaming LLM conversation UI platform.

> Direction selected: **STREAM** (with BRACE retained as alternate).

## File set

### `stream/` — primary direction

| File | Format | Use |
|------|--------|-----|
| `mark.svg` | SVG | Default mark on light surfaces |
| `mark-dark.svg` | SVG | Mark on dark surfaces |
| `mark-accent.svg` | SVG | With accent (orange) tip |
| `wordmark.svg` / `wordmark-dark.svg` | SVG | "meso" type only |
| `lockup-horizontal.svg` | SVG | Mark + wordmark side by side |
| `lockup-stacked.svg` | SVG | Mark above wordmark |
| `social-card.svg` | 1280×640 SVG | GitHub social preview |
| **`loading.svg` / `loading-dark.svg`** | **Animated SVG** | **Chat waiting indicator** |
| **`banner.svg` / `banner-dark.svg`** | **Animated SVG 1280×320** | **README header (renders on GitHub)** |
| `favicon-16/32/180/512.png` | PNG | Browser / PWA / Apple touch |

### `brace/` — alternate direction (retained)

Same file structure, alternate identity for code-voiced surfaces (npm, docs).

## Motion

| Asset | Cycle | Where to use |
|-------|-------|--------------|
| Loading dots | 1.6s loop | Chat assistant waiting on tokens. Last dot is permanent accent orange. |
| README banner | 2.4s loop | Top of README.md. GitHub renders SMIL natively. |
| Splash | One-shot ~2.5s | App boot, route transition, build-time placeholder. See `Splash.html`. |

## Construction notes

- Every glyph (m, e, s, o) is built from rects — zero font dependency, so favicons stay crisp at 16px.
- STREAM: linear progression of radius (3 → 4.5 → 6 → 7.5 → 9) and opacity (0.22 → 1.0).
- The 5th dot is the only one in accent color — it anchors the eye and signals "completed token."

## Type pairing

- **Display**: Geist — 400 / 500 / 600 / 700
- **Mono**: JetBrains Mono — 400 / 500 / 600

## Color tokens

See `tokens.css`. Public-stable variables guaranteed under SemVer.

## Clearspace · Minimum size

- Reserve X-height on all four sides, where X = 1/4 of the mark's rendered height.
- Minimum 16px. Below, drop to wordmark-only.

## README embed snippet

```md
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/stream/banner-dark.svg" />
  <img src="brand/stream/banner.svg" alt="@meso/ui — streaming LLM UI platform" />
</picture>
```
