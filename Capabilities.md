# Matrix Editor — Capabilities

Full feature reference for the Matrix AI-powered React component editor.

---

## Navigation & Layout

- **Top nav bar** — ☰ sidebar toggle · 💬 Chat · 🧩 Canvas mode · ? Help
- **Drawers** — Sidebar and Chat slide in from the left; close with backdrop click or `Esc`
- **Split pane** — Draggable divider between Code and Preview (20–80% range)
- **Canvas mode** — replaces the split pane with the visual canvas

---

## AI Chat (💬)

- Describe a component → AI generates it instantly
- Attach a screenshot or image to edit visually
- **Inline AI toolbar** — select code in the editor, describe a change, review an Accept/Reject diff
- Prompt history navigation with `↑` / `↓`
- **Retry** — regenerate the last response
- **Style Variants** (⚗) — generate 3 style alternatives at once

---

## Code Editor (</>)

- Full **Monaco editor** (TSX / JSX / TS / JS) with syntax highlighting and word wrap
- **Undo / Redo** with full history (`Cmd+Z` / `Cmd+Shift+Z`)
- **Prettier formatting** (`Cmd+P`)
- **Diff mode** — compare previous vs. current code side by side (`Cmd+D`)
- **File tabs** — keep multiple components open simultaneously
- **Component tabs** — focus on one exported function within a file
- **Draft autosave** — unsaved work is restored automatically on next load
- **Version History panel** — browse and restore any previously saved version
- **Paste modal** — load a component by pasting raw React code

---

## Live Preview (▶)

- Real-time render via in-browser Babel transpile
- **Responsive viewports**: 📱 Mobile (375px) · ⊞ Tablet (768px) · ⊡ Desktop (full)
- **Zoom**: 75% · 100% · 125% · 150%
- **⧉ Split** — mobile + desktop side by side
- **◑ Themes** — dark / light comparison side by side
- **🔎 Inspect** — click any element to see its computed styles

---

## Sidebar Panels (☰)

| Tab | Panel | What it does |
|-----|-------|-------------|
| ⚡ | **Templates** | 30+ prebuilt components: dashboards, forms, tables, modals, cards, nav bars, charts, sidebars |
| 🎨 | **Style** | Tailwind style-system presets |
| 🎛 | **Tokens** | Inject CSS variables (`--color-primary`, `--font-family`, etc.); Dark/Light presets; Google Fonts live switching; AI palette generator |
| ✨ | **Animation** | Fade In, Slide Up, Bounce and more; duration/easing controls; one-click inject into code |
| 📷 | **Snapshots** | Named component snapshots — save named versions and restore them later |
| 🔌 | **Connector** | Filesystem bridge — link a local project path and push code directly to it |
| 📦 | **Library** | Save and reuse components across sessions; items appear in the Canvas palette |
| 🤖 | **Model** | AI backend selector + live server status |

---

## Model Panel (🤖)

- **Backend selector**: Auto (llama.cpp → Swarm → Claude) · llama.cpp · Swarm · Claude
- **Server status** — live Online / Offline / Not Configured indicators with refresh
- Unavailable backends are disabled automatically

---

## Canvas (🧩)

- Drag saved Library components onto a **Puck visual canvas**
- Arrange and resize blocks freely
- **Export to Code** — emits a `ComposedPage` React component

---

## Export & Share

| Action | How |
|--------|-----|
| Copy | Copies current code to clipboard |
| Save | Saves component to Library (`Cmd+S`) |
| 🔗 Share | Generates a shareable URL; copies embed `<iframe>` snippet after sharing |
| Download `.tsx/.jsx/.ts/.js` | Downloads the current file |
| Download ZIP | Exports component + dependencies as an archive |
| Export to filesystem | Pushes code to a linked local project (requires Connector) |
| Inject into file | Inserts code into an existing file at a specified path |
| GitHub Gist ↗ | Publishes code as a public GitHub Gist |
| Generate Tests 🧪 | AI-generated test file for the component |
| Generate Docs 📄 | JSDoc comments + README output |
| Storybook Stories 📖 | Exports a Storybook story file |
| Upload image asset | Attaches an image to the editor for use in prompts |

---

## AI Tools

- **🔍 Review** — streams a full AI code review of the current component
- **⚙ Refactor** — menu of common refactoring transformations
- **Inline editing** — select any code, type an instruction in the toolbar, review the diff before applying

---

## Screenshots

- Capture the live preview as a PNG
- **Edit with AI** — describe visual changes; AI modifies the component accordingly
- Saved automatically to the **Snapshots** sidebar panel

---

## Keyboard Shortcuts

| Keys | Action |
|------|--------|
| `Cmd/Ctrl+S` | Save to Library |
| `Cmd/Ctrl+P` | Format with Prettier |
| `Cmd/Ctrl+D` | Toggle diff view |
| `Cmd/Ctrl+Z` | Undo |
| `Cmd/Ctrl+Shift+Z` | Redo |
| `Cmd/Ctrl+\` | Toggle sidebar |
| `Cmd/Ctrl+K` | Open sidebar (Templates) |
| `Cmd/Ctrl+J` | Toggle chat |
| `Enter` | Send chat prompt |
| `Cmd/Ctrl+Enter` | Send chat prompt (multiline mode) |
| `Shift+Enter` | New line in prompt |
| `↑ / ↓` | Cycle prompt history |
| `?` | Open this help |
| `Esc` | Close drawers / modals |
