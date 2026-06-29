\# App Redesign Specification: Pixel-Craft Play (Ages 5-10)

\## 1. Core Objective \& Mobile-First Architecture

\- \*\*Target Users:\*\* Children aged 5 to 10 years old using smartphones or tablets.

\- \*\*Development Rule:\*\* Build \*\*Mobile-First\*\*. All styles must target small touch screens by default. Use media queries (`min-width`) only to expand layouts for desktop later.

\- \*\*UX Priorities:\*\* Low literacy-barrier, thumb-friendly layouts, high visual feedback, and massive gamification elements.

\---

\## 2. Mobile-First Layout Constraints (Built for Small Hands)

\- \*\*Thumb-Zone Optimization:\*\* Place all critical interactive items (buttons, navigation, actions) within easy reach of a child's thumbs (the lower half of the mobile screen).

\- \*\*Single-Column Flow:\*\* Stack all content vertically by default. Strictly no multi-column layouts on mobile viewports.

\- \*\*Oversized Hit Targets:\*\* Every clickable item must have a minimum touch target size of `64px x 64px` to accommodate developing motor skills and reduce accidental taps.

\- \*\*Zero Tight Spacing:\*\* Eliminate crowded tables, small text inputs, and tiny drop-downs. Use generous padding (`padding: 1rem` minimum) between components.

\- \*\*Gestures over Text:\*\* Utilize simple, oversized swipeable cards or massive tap arrows instead of tiny paginations or deep scrolling text.

\---

\## 3. Visual Theme: Blocky \& Pixelated (The "Minecraft" Look)

\### Typography

\- \*\*Primary Headers:\*\* Use a blocky, pixelated, or heavy geometric font.

&#x20; - \*Web/CSS:\* `'Minecraftia'`, `'VT323'`, or `'Press Start 2P'` scaled properly. Fallback to `Impact, sans-serif`.

\- \*\*Body Text:\*\* Clean, high-legibility, rounded sans-serif for younger readers.

&#x20; - \*Web/CSS:\* `'Fredoka One'`, `'Quicksand'`, or `'Nunito'`. Never use thin, low-contrast, or overly compressed fonts.

\- \*\*Sizing:\*\* All mobile text must be 20% larger than standard mobile web apps to assist developing eyes.

\### Color Palette (Earthy \& Vibrant Pixels)

\- \*\*Primary/Backgrounds (Earth Blocks):\*\*

&#x20; - Dirt/Wood Brown: `#4A3B32` / `#866043`

&#x20; - Grass Green: `#4C9E38` / `#5B8731`

\- \*\*Secondary/UI Accents (Ores \& Sky):\*\*

&#x20; - Diamond Blue (Buttons/Highlights): `#4DFFF3` or `#55FFFF`

&#x20; - Redstone Active (Errors/Alerts): `#FF2200`

&#x20; - Deep Stone (Containers): `#313131`

\- \*\*Text:\*\* High contrast white (`#FFFFFF`) on dark containers, dark charcoal (`#1A1A1A`) on light containers.

\### Component Styling (3D Retro Blocks)

\- \*\*Borders:\*\* Heavy, solid borders. No smooth CSS gradients or tiny rounded corners.

&#x20; - \*Style:\* `border: 4px solid #000000;`

\- \*\*Shadows:\*\* Hard, sharp, non-blurry 8-bit shadows instead of soft box-shadows.

&#x20; - \*Example:\* `box-shadow: 6px 6px 0px #000000;`

\- \*\*Tap Buttons (3D Block Effect):\*\* Buttons must look liftable/pressable.

&#x20; - Give them a lighter top border and darker bottom border.

&#x20; - On `:active` or tap, shift the button down (`transform: translate(2px, 2px);`) and shrink the shadow to simulate "pressing a block down".

\---

\## 4. Interaction \& Gamification (Making it Fun)

\### Immediate Tap Feedback

\- \*\*Touch States:\*\* Elements must noticeably scale up (`transform: scale(1.05);`) or glow with a bright "Diamond Blue" pixel border the instant they are tapped.

\- \*\*Success/Completion:\*\* Any completed form, task, or click should trigger a mini visual celebration (e.g., green particle bursts, sliding badge unlocks).

\### Micro-Interactions

\- \*\*Progress Bars:\*\* Format loading/progress lines as a mobile "Health Bar" (Hearts) or an "Experience Bar" (Green segmented bar locked to the bottom or top of the viewport).

\- \*\*Sound Slots:\*\* Provide hooks or CSS class triggers for short retro sound effects (e.g., an 8-bit "pop", "click", or "levelup" sound on tap).

\---

\## 5. Technical Implementation Blueprint (For OpenCode Reference)

When modifying code files, strictly observe these mobile-first rules:

1\. \*\*Tailwind Framework (Mobile-First Utility):\*\* Define mobile layout elements without prefixes first, and use responsive breakpoints \*only\* for larger displays.

&#x20; - \*Example:\* `w-full max-w-sm px-6 border-4 border-black shadow-\[6px\_6px\_0px\_0px\_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-\[2px\_2px\_0px\_0px\_rgba(0,0,0,1)] md:max-w-2xl`

2\. \*\*Component Structure:\*\* Wrap standard mobile inputs or menus into a "Signpost" or "Chest Inventory" block layout that fills the screen width comfortably.

3\. \*\*Animations:\*\* Keep transitions snappy and rhythmic (`transition: all 0.1s steps(4);`) to retain that retro, mechanical gaming feel on touch events.
