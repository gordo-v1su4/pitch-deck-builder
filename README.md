# Pitch Deck Builder

A cinematic pitch deck builder for filmmakers, creatives, and storytellers. Create stunning visual presentations with automatic color extraction, GSAP animations, and PDF export.

## Features

- **10 Customizable Block Types** — Hero, Logline, Story, World, Character, Tone, Motif, Theme, Stakes, and Closing
- **Multi-Image Support** — Upload up to 4 reference images that automatically distribute across slides
- **Automatic Color Extraction** — Colors are extracted from your images to create cohesive palettes
- **5 Style Presets** — Cinematic, Bold, Minimal, Noir, and Neon
- **Editable Color Swatches** — Fine-tune any color in your palette
- **Drag-and-Drop Reordering** — Arrange blocks in any order
- **Layout Variants** — Toggle between A/B layouts for each block
- **GSAP Scroll Animations** — Smooth scroll-triggered animations in HTML preview
- **PDF/PNG Export** — Export your deck for sharing
- **Auto-Save** — Progress saves automatically to localStorage

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- GSAP + ScrollTrigger
- html2canvas + jsPDF
- ColorThief (color extraction)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/gordo-v1su4/pitch-deck-builder.git
cd pitch-deck-builder

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
bun run build
```

The build output will be in the `dist/` folder as a single HTML file.

## Usage

1. **Upload Images** — Click the image slots to upload up to 4 reference images
2. **Choose a Style** — Select from 5 style presets or customize colors manually
3. **Edit Content** — Click "Edit" to modify block titles and content
4. **Reorder Blocks** — Drag and drop blocks to rearrange
5. **Toggle Visibility** — Show/hide blocks using the eye icon
6. **Switch Layouts** — Click A/B to toggle block layouts
7. **Preview** — Switch between HTML (animated) and PDF (static) preview modes
8. **Export** — Click "Export PDF" or "PNG" to download your deck

## Project Structure

```
src/
├── App.tsx                    # Main application component
├── components/
│   └── BlockComponents.tsx    # 10 block type components
├── utils/
│   ├── cn.ts                  # Tailwind class merge utility
│   └── colorExtractor.ts      # Color extraction from images
├── types.ts                   # TypeScript interfaces
├── index.css                  # Global styles
└── main.tsx                   # Entry point
```

## License

MIT

---

Built with Claude Code
