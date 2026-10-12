---
name: Technical Forensic Dark
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
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.005em
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-dense: 0.5rem
  margin: 1rem
  margin-compact: 0.75rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an authentic developer workstation aesthetic engineered for deep technical cognition, codebase forensics, and architectural deconstruction. It rejects gamification tropes in favor of an environment that feels like an advanced reverse-engineering suite, an intelligent IDE diagnostic layer, or a high-end kernel debugger.

### Brand Personality
- **Surgical Precision:** Every pixel, edge, and label is placed with functional intent. Nothing is purely decorative.
- **Calm Intelligence:** The interface minimizes visual fatigue during hours of complex mental mapping through deep, desaturated dark surfaces and restrained semantic highlights.
- **Architectural Authority:** The visual tone treats codebases not as puzzles, but as systems of living infrastructure waiting to be inspected, understood, and audited.

### Design Movement & Aesthetic Expression
The visual language operates at the intersection of **Technical Minimalist IDE Architecture** and **Modern Dark-Mode Workstation UI**. Key characteristics include:
- Structured 1px borders defining strict pane modularity (dockable inspector panels, code viewports, dependency graphs).
- Monospaced typography treated as a first-class citizen for all architectural references, tokens, file trees, and AST pathing.
- Syntax-derived semantic accents used strictly for ontological categorization (routes, models, components, configurations) rather than generic decorative splash.
- Silent, near-zero depth transitions that favor tonal elevation tiers over dramatic lighting or heavy atmospheric blurs.

## Colors

The color palette models an authentic syntax-highlighted workstation. It is engineered with deep, slate-tinted blacks to eliminate glare while maintaining razor-sharp contrast ratios compliant with WCAG AAA for technical legibility.

### Surface Architecture
- **App Canvas Base (`#0B0E12`):** Ground-level backdrop for the entire viewport shell, canvas workspaces, and underlying splitters.
- **Primary Surface (`#11161D`):** Default panel background for code editors, explorer trees, file panes, and terminals.
- **Elevated Surface (`#171E27`):** Overlays, active inspector cards, modals, command palettes, and floating contextual hints.
- **Hover / Active Surface (`#1D2732`):** Hover states across list rows, interactive tree nodes, and secondary button states.
- **Divider & Border (`#2A3441`):** Structural borders framing every split-pane, tab header, code container, and table boundary.

### Typography & Readability
- **Primary Text (`#E8EDF5`):** High-clarity white-blue for titles, primary code citations, file contents, and active tab labels.
- **Secondary Text (`#A2ADBD`):** Balanced neutral for metadata, explanations, inspector labels, and code comments.
- **Muted Text (`#737F90`):** Inactive tabs, line numbers, non-actionable file tree levels, and breadcrumb separators.

### Semantic Domain Roles
Colors serve distinct conceptual taxonomies across codebase investigations:
- **Primary Action & Focus (`#5B8CFF`):** System focus rings, primary investigative actions, entry points, and query execution.
- **Route & Verification (`#39D6A0`):** API endpoints, validated architectural hypotheses, passing assertion paths, and success confirmations.
- **Model & Evidence (`#F4BD58`):** Data entities, schema definitions, key architectural evidence clues, and diagnostic warnings.
- **Component & UI Nodes (`#A78BFA`):** Interface modules, view components, frontend lifecycle hooks, and AST node tags.
- **Test Suite (`#43C9D9`):** Test suites, spec fixtures, assertions, and mocked runtime environments.
- **Configuration & Core (`#8190A5`):** Build configs, environment variables, manifest references, and infrastructure definitions.
- **Utility & Primitives (`#9099A6`):** Helper functions, standard library calls, internal utilities, and shared constants.
- **Anomaly & Error (`#F07178`):** Architectural flaws, syntax errors, security vulnerabilities, and broken relationships.

## Typography

The typographic hierarchy distinguishes between natural human commentary and machine-readable codebase entities.

### Font Pairing Rules
- **Inter (UI & Narrative Text):** Used exclusively for platform navigation, system messaging, investigative briefs, architectural analysis essays, and meta-prompts. Inter provides clarity without decorative character, keeping reading fatigue low.
- **JetBrains Mono (Code, Data, & System Labels):** Applied unconditionally to all filenames, file directory trees, line numbers, variable declarations, stack traces, AST paths, hotkeys, status chips, and inspector metrics. JetBrains Mono enforces column alignment and instant code readability.

### Layout & Sizing Guidance
- Headers avoid excessive scale. The maximum desktop headline is constrained to `32px` (`headline-xl`) to preserve dense developer tooling ergonomics.
- Tabular figures (`tnum`) and slashed zeros (`zero`) are enabled globally across all monospaced elements to prevent layout shifting during real-time data streaming and metric updates.
- Code line heights remain firmly tied to standard editor ratios: `20px` line-height for `13px` code (`code-md`) ensures maximum scanning efficiency across large file buffers.

## Layout & Spacing

The layout is structured around an IDE multi-pane workstation layout rather than a linear scrolling document. It emphasizes persistent state, compact vertical rhythm, and strict modular tiling.

### Spacing Rhythm
Built upon an uncompromising **8px base unit**, with half-step increments (**4px**) reserved for internal micro-alignments such as code line badges, tag padding, icon-to-label gaps, and tree-view nesting indents.

### Pane & Splitter Structure
- **Desktop Grid Model:** Operates on a dockable 3-to-4 column viewport split:
  - Navigation / Repository Explorer: `240px` to `280px` fixed/resizable.
  - Active Code Canvas / Architectural Graph: Flexible primary pane (`1fr`).
  - Diagnostic & Evidence Inspector: `360px` to `440px` contextual dock.
- Splitters between panes occupy a strict `1px` boundary with an invisible `7px` hit target for seamless resizing.
- Outer container padding defaults to `space-md` (`1rem`) on desktop work surfaces to maximize readable code real estate.
- Mobile breakpoints reflow multi-pane layouts into stacked tabbed viewports with a persistent bottom diagnostic tray.

## Elevation & Depth

This system intentionally eliminates traditional cast drop shadows in favor of a **Tonal Layering with Crisp Structural Boundaries** approach. Depth is expressed through luminance stepping and precision 1px borders.

### Elevation Hierarchy
- **Level 0 (Base Canvas - `#0B0E12`):** The structural framework, master gutter dividers, empty editor buffers, and window chrome.
- **Level 1 (Working Pane Surfaces - `#11161D`):** Primary interactive surfaces including code editors, directory trees, investigative consoles, and Markdown readouts. Framed with a 1px border of `#2A3441`.
- **Level 2 (Interactive Floating Elements - `#171E27`):** Active inspector panels, pinned evidence cards, breadcrumb bar overlays, and dropdown toolbars. Outlined with 1px `#2A3441`.
- **Level 3 (Command Overlay & Modals - `#171E27` with Ambient Backing):** Command palettes (Ctrl/Cmd+K), quick-open finders, and syntax diff overlays. Elevated using a single restrained ambient drop shadow: `0px 16px 36px rgba(0, 0, 0, 0.65)` bordered with 1px `#5B8CFF` (subdued at 40% alpha) to denote active operational priority.

### Glassmorphism & Blurs
No blurred translucent surfaces or frosted glass effects are permitted within the core code editing and analysis viewports. Subtle backdrop blur (`backdrop-filter: blur(8px)`) is reserved exclusively for modal underlays over the code canvas to obscure underlying lines during focus mode.

## Shapes

The geometric framework balances technical rigor with modern refinement through disciplined corner radii.

### Geometry Specifications
- **Cards, Panels, and Code Viewports:** Utilize `rounded-lg` (`8px` to `12px` / `0.5rem` to `0.75rem`). This softens heavy multi-panel workstation shells without sacrificing structural alignment.
- **Buttons, Input Fields, and Chips:** Set to `8px` (`0.5rem`) for a tactile, unified tool-like feel.
- **Micro Tokens, Inline Code Tags, and Line Highlights:** Standardized at `4px` (`0.25rem`) to maintain precision inside dense tabular code lines.
- **Pill Shapes:** Strictly prohibited for general UI. The only elements permitted full pill radii (`9999px`) are status indicator dots and active runtime badge counters.

## Components

### Buttons & Interactive Triggers
- **Primary Action (Run Query / Confirm Hypothesis):** Solid `#5B8CFF` background with `#0B0E12` high-contrast bold text. On hover, `#78A3FF`. Focus ring: 2px offset border in `#5B8CFF`.
- **Secondary (Inspect / Step Through):** Surface `#171E27`, border 1px `#2A3441`, text `#E8EDF5`. On hover: surface `#1D2732`, border `#5B8CFF` at 50% opacity.
- **Ghost / Tool Action:** Transparent background, text `#A2ADBD`. Hover: surface `#171E27`, text `#E8EDF5`. Height: 32px standard; 26px compact for editor headers.

### Semantic Badges & Chips
- **Domain Indicators:** Background tinted at 12% opacity of the domain color, 1px border at 30% opacity, with 100% opacity text in JetBrains Mono (`label-sm`).
  - *Route:* BG `rgba(57, 214, 160, 0.12)`, Border `rgba(57, 214, 160, 0.3)`, Text `#39D6A0`
  - *Model:* BG `rgba(244, 189, 88, 0.12)`, Border `rgba(244, 189, 88, 0.3)`, Text `#F4BD58`
  - *Component:* BG `rgba(167, 139, 250, 0.12)`, Border `rgba(167, 139, 250, 0.3)`, Text `#A78BFA`
  - *Test:* BG `rgba(67, 201, 217, 0.12)`, Border `rgba(67, 201, 217, 0.3)`, Text `#43C9D9`
  - *Error:* BG `rgba(240, 113, 120, 0.12)`, Border `rgba(240, 113, 120, 0.3)`, Text `#F07178`

### Inputs & Command Palette
- **Inputs:** Background `#0B0E12`, border 1px `#2A3441`, text `#E8EDF5`. Placeholder text `#737F90`. Monospaced text for regex and path filters. Focus state shifts border to `#5B8CFF` without external fuzzy glow.
- **Command Palette:** Centered floating container (`#171E27`), 1px border `#2A3441`, elevated with modal shadow. Features a pinned top search input with keyboard shortcut badges (`label-xs` in `#1D2732` pill).

### Lists & Tree Views (File Explorer / Symbol Outline)
- Rows feature a default height of 28px.
- Indentation steps by 12px per hierarchy level with a faint 1px vertical guide in `#2A3441`.
- Active item uses surface `#1D2732` with a 2px left border accent in `#5B8CFF`.
- Hover state applies `#171E27` smoothly with zero transition delay for instantaneous feedback.

### Checkboxes, Toggles, & Radios
- Square 16px boxes with 4px corner radius.
- Unchecked: 1px border `#2A3441` with `#11161D` background.
- Checked: `#5B8CFF` fill with `#0B0E12` checkmark icon.

### Code Viewer & Architectural Cards
- **Code Viewport:** Surface `#11161D` with line numbers rendered in `#737F90` on the left gutter. Active line highlighted with a subtle `rgba(42, 52, 65, 0.35)` bar.
- **Evidence / Inspector Card:** Surface `#171E27` wrapped in 1px `#2A3441` with a top header strip displaying file origin, line number pill, and an architectural tag. Inner citations render inside nested `#11161D` code blocks.