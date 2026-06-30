# App Theme Specification: Craft-Play Engines (Ages 5-10)

## 1. Core Objective & Multi-Theme Architecture

- **Target Users:** Children aged 5 to 10 years old using smartphones or tablets.
- **Development Rule:** Build **Mobile-First**. All styles must target small touch screens by default. Use media queries (`min-width`) only to expand layouts for desktop later.
- **Dual-Theme Choice:** The interface provides a distinct user-selectable toggle between two high-contrast gaming styles: the classic earthy **Blocky Pixels (Minecraft Style)** and the cute **Pastel Kitty Blocks (Hello Kitty Style)**.
- **UX Priorities:** Low literacy-barrier, thumb-friendly switcher layout, high visual feedback, and massive gamification elements.

---

## 2. Mobile-First Layout Constraints (Built for Small Hands)

- **Thumb-Zone Optimization:** Place all critical interactive items, including the **Theme Selection Switcher**, within easy reach of a child's thumbs (the lower half of the mobile screen).
- **Single-Column Flow:** Stack all content vertically by default. Strictly no multi-column layouts on mobile viewports.
- **Oversized Hit Targets:** Every clickable item must have a minimum touch target size of `64px x 64px` to accommodate developing motor skills and reduce accidental taps.
- **Zero Tight Spacing:** Eliminate crowded tables, small text inputs, and tiny drop-downs. Use generous padding (`padding: 1rem` minimum) between components.
- **Gestures over Text:** Utilize simple, oversized swipeable cards or massive tap arrows instead of tiny paginations or deep scrolling text.

---

## 3. Visual Themes: The Selection Options

### Theme A: Blocky & Pixelated (The "Minecraft" Look)

#### Typography

- **Primary Headers:** Use a blocky, pixelated, or heavy geometric font.
  - _Web/CSS:_ `'Minecraftia'`, `'VT323'`, or `'Press Start 2P'` scaled properly. Fallback to `Impact, sans-serif`.
- **Body Text:** Clean, high-legibility, rounded sans-serif for younger readers.
  - _Web/CSS:_ `'Fredoka One'`, `'Quicksand'`, or `'Nunito'`. Never use thin, low-contrast, or overly compressed fonts.
- **Sizing:** All mobile text must be 20% larger than standard mobile web apps to assist developing eyes.

#### Color Palette (Earthy & Vibrant Pixels)

- **Primary/Backgrounds (Earth Blocks):**
  - Dirt/Wood Brown: `#4A3B32` / `#866043`
  - Grass Green: `#4C9E38` / `#5B8731`
- **Secondary/UI Accents (Ores & Sky):**
  - Diamond Blue (Buttons/Highlights): `#4DFFF3` or `#55FFFF`
  - Redstone Active (Errors/Alerts): `#FF2200`
  - Deep Stone (Containers): `#313131`
- **Text:** High contrast white (`#FFFFFF`) on dark containers, dark charcoal (`#1A1A1A`) on light containers.

#### Component Styling (3D Retro Blocks)

- **Borders:** Heavy, solid borders. No smooth CSS gradients or tiny rounded corners.
  - _Style:_ `border: 4px solid #000000;`
- **Shadows:** Hard, sharp, non-blurry 8-bit shadows instead of soft box-shadows.
  - _Example:_ `box-shadow: 6px 6px 0px #000000;`
- **Tap Buttons (3D Block Effect):** Buttons must look liftable/pressable.
  - Give them a lighter top border and darker bottom border.
  - On `:active` or tap, shift the button down (`transform: translate(2px, 2px);`) and shrink the shadow to simulate "pressing a block down".

---

### Theme B: Pastel Kitty Blocks (The "Hello Kitty" Look)

#### Typography

- **Primary Headers:** Use a blocky, heavy pixel font with a soft, rounded silhouette.
  - _Web/CSS:_ `'VT323'`, `'Press Start 2P'`, or `'Fredoka One'` scaled properly. Fallback to `Impact, sans-serif`.
- **Body Text:** Clean, high-legibility, ultra-rounded sans-serif for younger readers.
  - _Web/CSS:_ `'Quicksand'` or `'Nunito'`. Never use thin, low-contrast, or overly compressed fonts.
- **Sizing:** All mobile text must be 20% larger than standard mobile web apps to assist developing eyes.

#### Color Palette (Sweet Pastels & Icon Boldness)

- **Primary/Backgrounds (Cute Canvas):**
  - Kitty White: `#FFFFFF`
  - Soft Bubblegum Pink: `#FFD1DC` / `#FFB6C1`
  - Pastel Lavender: `#E6E6FA`
- **Secondary/UI Accents (Bow & Whiskers):**
  - Iconic Bow Red (Buttons/Highlights): `#FF007F` or `#FF1493`
  - Sunshine Yellow (Accents): `#FFD700` or `#FFE4E1`
  - Charcoal Whisker (Text/Borders): `#2C2C2C`
- **Text:** High contrast white (`#FFFFFF`) on bold pink/red containers, deep whisker charcoal (`#2C2C2C`) on light pink/white containers.

#### Component Styling (3D Retro Soft Blocks)

- **Borders:** Heavy, solid dark borders that frame the soft colors cleanly.
  - _Style:_ `border: 4px solid #2C2C2C;`
- **Corners:** Cute, distinct 8-bit rounded pixel corners (simulate using blocky steps or `border-radius: 12px;` to keep it soft yet structured).
- **Shadows:** Hard, sharp, non-blurry 8-bit shadows instead of soft box-shadows.
  - _Example:_ `box-shadow: 6px 6px 0px #2C2C2C;`
- **Tap Buttons (3D Bow-Block Effect):** Buttons must look liftable and highly interactive.
  - Give them a bright pink top border and a darker magenta bottom border.
  - Decorate corners with a stylized CSS pseudo-element shape resembling small cat ears or a bow knot where space permits.
  - On `:active` or tap, shift the button down (`transform: translate(2px, 2px);`) and shrink the shadow to simulate "pressing a soft block down".

---

## 4. Interaction & Gamification (Making it Fun)

### Immediate Tap Feedback

- **Touch States:** Elements must noticeably scale up (`transform: scale(1.05);`) or glow with a bright pixel outline (Diamond Blue in Theme A, Sunshine Yellow in Theme B) the instant they are tapped.
- **Success/Completion:** Any completed form, task, or click should trigger a mini visual celebration (Theme A: green pixel particle bursts; Theme B: pink bow particle bursts and cascading pastel star unlocks).

### Micro-Interactions

- **Progress Bars:** Format loading/progress lines as a contextual tracker. Theme A uses an "Experience Bar" (Green segmented bar) or "Health Bar" (Hearts). Theme B uses a "Heart Tracker" (Row of Red Bows/Hearts) or a "Star Bar" (Segmented pastel yellow bar).
- **Sound Slots:** Provide hooks or CSS class triggers for theme-specific retro sound effects (Theme A: 8-bit "pop" or "levelup"; Theme B: 8-bit cute "mew" or "sparkle pop").

---

## 5. Technical Implementation Blueprint (For OpenCode Reference)

When modifying code files, implement the multi-theme structure using a root data attribute (`data-theme="minecraft"` or `data-theme="kitty"`):

1. **Tailwind Framework Engine Setup:** Use responsive utility configurations combined with theme selectors.
   - _Theme A Target Switcher Example:_ `w-full max-w-sm px-6 data-[theme=minecraft]:bg-stone-700 data-[theme=minecraft]:border-black data-[theme=minecraft]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`
   - _Theme B Target Switcher Example:_ `w-full max-w-sm px-6 data-[theme=kitty]:bg-pink-100 data-[theme=kitty]:border-[#2C2C2C] data-[theme=kitty]:shadow-[6px_6px_0px_0px_rgba(44,44,44,1)] rounded-xl`
2. **Component Structure:** Wrap standard mobile inputs or menus into a context-aware layout. The layout acts as a "Chest Inventory" block under Theme A and morphs into a "Ribbon Box / Kitty Pouch" under Theme B.
3. **Animations:** Keep transitions snappy and rhythmic (`transition: all 0.1s steps(4);`) to retain that retro, mechanical gaming feel on touch events during theme toggles.
