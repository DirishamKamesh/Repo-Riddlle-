---
name: RepoRiddle
colors:
  surface: '#0f141b'
  surface-dim: '#0f141b'
  surface-bright: '#353941'
  surface-container-lowest: '#090e15'
  surface-container-low: '#171c23'
  surface-container: '#1b2027'
  surface-container-high: '#252a32'
  surface-container-highest: '#30353d'
  on-surface: '#dee2ed'
  on-surface-variant: '#c3c6d6'
  inverse-surface: '#dee2ed'
  inverse-on-surface: '#2c3138'
  outline: '#8d909f'
  outline-variant: '#434653'
  surface-tint: '#b2c5ff'
  primary: '#b2c5ff'
  on-primary: '#002c72'
  primary-container: '#5b8cff'
  on-primary-container: '#002665'
  inverse-primary: '#1857c8'
  secondary: '#45dfa8'
  on-secondary: '#003826'
  secondary-container: '#04bf8b'
  on-secondary-container: '#004731'
  tertiary: '#f5be58'
  on-tertiary: '#422c00'
  tertiary-container: '#b98828'
  on-tertiary-container: '#392600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001847'
  on-primary-fixed-variant: '#0040a0'
  secondary-fixed: '#68fcc3'
  secondary-fixed-dim: '#45dfa8'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#005139'
  tertiary-fixed: '#ffdea9'
  tertiary-fixed-dim: '#f5be58'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5f4100'
  background: '#0f141b'
  on-background: '#dee2ed'
  surface-variant: '#30353d'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: '0'
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.375rem
    letterSpacing: '0'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: '0'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1rem
  margin-panel: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-density, analytical developer environment tailored for structural codebase exploration, forensic audits, and architectural problem-solving. Rooted in modern IDE ergonomics and high-craft productivity software, the interface rejects decorative excess in favor of crisp spatial rhythm, deliberate semantic color coding, and absolute visual composure.

The tone is quiet, technical, and surgical. By pairing deep slate-black substrates with razor-thin structural borders and laser-focused semantic accents, the platform transforms intricate code topologies, dependency graphs, and multi-file inspection trees into legible, friction-free mental maps. Layouts prioritize screen real estate, low eye fatigue during extended investigative sessions, and instant context recognition across complex data states.

## Colors

The color palette operates as a precise semantic hierarchy designed for dense information parsing without chromatic noise.

### Foundations & Surfaces
- **Canvas Base (`#0B0E12`):** Ground-level viewport backplane. Used exclusively for workspace canvas areas, graph backgrounds, and outer gutter gutters.
- **Surface Primary (`#11161D`):** Primary panel containment, sidebars, terminal docks, and baseline content containers.
- **Surface Elevated (`#171E27`):** Raised surfaces including inspect drawers, floating inspector palettes, active file tabs, and code card panels.
- **Surface Hover / Interactive (`#1D2732`):** Dynamic feedback state for list items, clickable nodes, table rows, and secondary tool toggles.
- **Borders & Dividers (`#2A3441`):** Structural 1px separation lines across panels, headers, and split-panes. Maintains visual separation without distracting from content.

### Typography & Content Tokens
- **Primary Text (`#E8EDF5`):** High-readability cold-white for code tokens, active headings, and focal content.
- **Secondary Text (`#A2ADBD`):** Balanced neutral tone for metadata, descriptions, active labels, and panel headers.
- **Muted Text (`#737F90`):** Receded tint for inactive controls, gutter line numbers, path breadcrumbs, and disabled states.

### Semantic Domain Roles
- **Primary Action / Focus (`#5B8CFF`):** Focus pins, primary commands, entry points, and active investigation cursors.
- **Route / Verified Success (`#39D6A0`):** Passing test assertions, valid architectural paths, live endpoints, and resolution badges.
- **Model / Evidence / Citations (`#F4BD58`):** Code citation markers, model definitions, forensic pinpoints, and highlighted diff lines.
- **Component Tier (`#A78BFA`):** UI components, symbol graph declarations, and React/AST nodes.
- **Configuration & Schemas (`#8190A5`):** Config manifests, package metadata, env maps, and pipeline nodes.
- **Utilities & Helpers (`#9099A6`):** Shared utility modules, internal libraries, and procedural services.
- **Test Artifacts (`#43C9D9`):** Spec suites, mocking harnesses, assertion triggers, and coverage tags.
- **Destructive / Error (`#F07178`):** Runtime anomalies, vulnerability alerts, failing test specs, and terminal exceptions.

## Typography

The typography pairs `Inter` for functional UI interaction with `JetBrains Mono` for codebase diagnostics, line references, and forensic evidence tracking.

- **Systemic Tracking:** UI headings and body copy utilize slightly tightened letter spacing (`-0.01em` to `-0.025em`) to echo high-density desktop productivity tools, keeping layout footprints compact.
- **Code Hierarchies:** Monospace styles are strictly reserved for file paths, git SHAs, line numbers, variable declarations, and syntax-highlighted editor buffers.
- **Numbers & Metrics:** Tabular figures (`font-variant-numeric: tabular-nums`) must be enforced on all numeric telemetry, file counters, memory profiling outputs, and line-count margins.

## Layout & Spacing

Layout architecture follows a strict 8px spatial grid designed around high-density multi-pane IDE environments.

### Spatial Rhythm
- **Docked Multi-Pane Architecture:** The workspace splits into fixed or draggable columns: Navigation/File Tree (`240px–320px`), Main Visualizer/Editor Canvas (`flex-1`), and Forensic Inspection Drawer (`360px–480px`).
- **Inner Canvas Density:** Component internal spacing defaults to `space-sm` (8px) and `space-md` (16px). Compact toolbars use `space-xs` (4px) gaps to preserve vertical viewing angles.

### Adaptability & Breakpoints
- **Desktop (≥ 1280px):** Simultaneous triple-pane view (Explorer + Primary Graph/Code Canvas + Investigation Details Drawer). Gutters are locked to `1rem`.
- **Tablet / Laptop (768px – 1279px):** Dual-pane setup. Investigation Drawer converts to an overlay flyout from the right edge with a backdrop blur; the left navigation collapses into an icon-only quick rail.
- **Mobile (< 768px):** Single-pane layout with bottom-sheet context drawers. Graph views default to full-viewport canvas with touch pan-zoom and floating command chips.

## Elevation & Depth

Visual hierarchy is constructed through tonal layering and hair-thin borders rather than exaggerated drop shadows. The interface maintains a tactile, multi-tier workbench feel:

1. **Level 0 (Canvas Base):** `#0B0E12`. Graph viewport backgrounds, node canvas planes, and background grids. Flat, no borders.
2. **Level 1 (Docked Containers):** `#11161D` with a perimeter `1px solid #2A3441`. Includes sidebars, pinned breadcrumb toolbars, and file trees. No ambient blur.
3. **Level 2 (Active Cards & Editor Tiles):** `#171E27` with `1px solid #2A3441`. Used for active file views, node cards, and pinned code snippets.
4. **Level 3 (Inspection Drawers & Floating Toolbars):** `#171E27` with a subtle elevation shadow (`0 8px 24px -4px rgba(0, 0, 0, 0.45)`) and a `1px solid #2A3441` edge. Provides decisive depth separation when an inspection drawer glides over an active canvas.
5. **Interactive Glows:** Interactive states do not use heavy shadows. Focused nodes or active debug pins produce a subtle, localized 2px ring tint matching the semantic role (e.g., `#5B8CFF` with 25% opacity).

## Shapes

The geometric framework is calculated and restrained:

- **Base Radius (0.5rem / 8px):** Standard for cards, code inspection panels, modal windows, and input surfaces. Ensures structural alignment with the 8px layout grid.
- **Compact Radius (0.25rem / 4px):** Used for syntax token tags, small evidence chips, line number badges, tree collapse toggles, and status markers.
- **Pill Exceptions:** Reserved strictly for ephemeral status tags, live ping indicators, and interactive floating canvas control pods.
- **Border Integration:** All rounded surfaces maintain an unbroken 1px border (`#2A3441`) to prevent boundary bleed against the dark substrate.

## Components

### Buttons & Quick Actions
- **Primary Action:** Solid background (`#5B8CFF`), text `#0B0E12`, font weight 600. Hover shifts to `#4B7CF6`. Border is flush without offset.
- **Secondary Action:** Surface `#171E27`, 1px border `#2A3441`, text `#E8EDF5`. Hover activates `#1D2732` with border shifting to `#5B8CFF`.
- **Ghost / Tool Action:** Transparent background, text `#A2ADBD`. Hover applies `#1D2732` and text `#E8EDF5`. Standard height for tool actions is 28px or 32px.

### Category Badges & Evidence Chips
- Badges combine a low-opacity tinted surface (12% alpha) with an opaque 1px border (30% alpha) and a solid foreground token.
- **Categories:**
  - Route: Text & border `#39D6A0`, background `rgba(57, 214, 160, 0.12)`.
  - Evidence: Text & border `#F4BD58`, background `rgba(244, 189, 88, 0.12)`.
  - Component: Text & border `#A78BFA`, background `rgba(167, 139, 250, 0.12)`.
  - Config: Text & border `#8190A5`, background `rgba(129, 144, 165, 0.12)`.
  - Test: Text & border `#43C9D9`, background `rgba(67, 201, 217, 0.12)`.
  - Error: Text & border `#F07178`, background `rgba(240, 113, 120, 0.12)`.
- Labeling displays in `label-code` (`JetBrains Mono`, 11px, uppercase).

### Code Inspection Drawer & Snippet Panels
- **Container:** Background `#171E27`, left border `1px solid #2A3441`.
- **Gutter & Line Numbers:** Gutter width 44px, text `#737F90`, right border `1px solid rgba(42, 52, 65, 0.4)`.
- **Evidence Pins:** Pinned code lines receive a persistent highlight of `rgba(244, 189, 88, 0.15)` across the line span, paired with a solid 3px left marker in `#F4BD58`.
- **Citations:** Clickable inline citations append a small pill containing the file short-name and line range (e.g., `auth.service.ts:42-56`) linking directly to the editor cursor.

### Interactive Graph Nodes & Bezier Curves
- **Node Cards:** Surface elevated `#171E27`, 1px border `#2A3441`, 8px corner radius. Selected node shifts border to `#5B8CFF` with a 2px outer outline at 20% opacity.
- **Connection Lines (Bezier):** Curvature `cubic-bezier(0.4, 0, 0.2, 1)`. Inactive edges use `#2A3441` at 2px stroke. Active data flow / trace paths use `#5B8CFF` or `#39D6A0` with animated dash arrays for execution flow.

### Form Inputs & Query Fields
- **Search & Code Query Bar:** Background `#11161D`, 1px border `#2A3441`, text `#E8EDF5`, placeholder `#737F90`. Height 36px. Focused state highlights border to `#5B8CFF` without native focus outlines. Includes keyboard shortcut hints (e.g., `⌘K`) in `label-code`.
- **Checkboxes & Radios:** 14px boxes with a 3px radius. Border `#2A3441`. Active state renders `#5B8CFF` fill with a white vector checkmark.

### File Tree Lists
- Tree lines utilize indent guides drawn with 1px dotted lines in `#2A3441`. Hover states activate across full row width in `#1D2732`. Active selected file receives a 2px left border accent in `#5B8CFF`.