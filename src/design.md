# SnackBuddy Design System

## Overview

SnackBuddy is a kid-friendly allergy checker app with a playful, modern design built on a dual-theme system (Boy/Girl modes). The design emphasizes clarity, accessibility, and charm through cute character mascots and soft, rounded aesthetics.

## Color Palette

### Boy Theme (Minecraft)

- **Primary**: Pastel Blue `#A8D5FF` - Main CTAs, cards, navigation
- **Accent**: Warm Orange `#FF8C42` - Secondary actions, highlights
- **Background**: Light Off-white `#F8F6F4` - Page backgrounds
- **Text**: Dark Grey `#2c2c2c` - Primary text (use `text-theme-text`)
- **Border**: Light Grey `#e0ddd9` - Subtle dividers

### Girl Theme (Kitty)

- **Primary**: Hot Pink `#ff69b4` - Main CTAs, cards, navigation
- **Accent**: Warm Coral `#FFB366` - Secondary actions, highlights
- **Background**: Light Off-white `#F8F6F4` - Page backgrounds
- **Text**: Dark Grey `#2c2c2c` - Primary text (use `text-theme-text`)
- **Border**: Light Grey `#e0ddd9` - Subtle dividers

### Universal Colors

- **Safe/Positive**: Green `#79d461` - Safe food indicators, mascots
- **Unsafe/Alert**: Red `#d81b00` - Allergen warnings, errors
- **White**: `#ffffff` - Only use on dark backgrounds

## Typography

### Font Stack

- **Display**: Fredoka (playful, rounded, headings & CTAs)
- **Body**: Nunito (readable, friendly, content)
- **Utility**: Andika (data/codes)

### Weights

- Display text: Black (900) or Bold (700)
- Body text: Bold (700) or Regular (400)

## Component Design

### Buttons - Primary CTA

```
rounded-3xl | bg-theme-primary | text-theme-text | shadow-lg
py-5 px-6 | font-display font-black text-lg
hover:bg-theme-primary/90 | active:scale-95
```

Used for: Scan, Browse, Add, Save

### Buttons - Secondary

```
rounded-3xl | bg-theme-accent | text-white | shadow-lg
py-4 px-6 | font-display font-black
```

Used for: Email, Copy, supporting actions

### Buttons - Icon

```
rounded-full | bg-theme-primary | text-white | shadow-lg
p-2.5 | hover:bg-theme-primary/90
```

Used for: Reset, Adult mode, close

### Cards

```
rounded-3xl | shadow-lg | p-6 | solid background
NO borders | NO gradients
hover:shadow-xl | active:scale-95
```

Used for: Category cards, safe foods, collections

### Inputs

```
rounded-xl | shadow-card | p-3-4
border-0 | bg-theme-text
```

Used for: Form fields

## Shadows

- **Large**: `shadow-lg` (0 8px 16px rgba(0,0,0,0.1))
- **Medium**: `shadow-[0_8px_16px_rgba(0,0,0,0.1)]`
- **Small**: `shadow-[0_4px_12px_rgba(0,0,0,0.08)]`
- **Subtle**: `shadow-card` (0 2px 8px rgba(0,0,0,0.06))

**NEVER use voxel shadows**: shadow-[4px_4px_0px_...]

## Border Radius

- Large CTAs: `rounded-3xl` (1.5rem)
- Icon buttons: `rounded-full`
- Cards: `rounded-3xl` primary, `rounded-2xl` secondary
- Inputs: `rounded-xl` (1rem)

## Layout Patterns

### Home Screen

```
[Header: Theme selector | Reset, Adult buttons]
[Large Buddy Astronaut + heading]
[Primary CTAs: Scan, Browse]
[Category cards grid: 2x2]
```

### Modals

```
[Icon/Character header]
[Content area]
[Action buttons]
```

### Text Contrast Rules

- **Light backgrounds** (`bg-theme-primary`, `bg-theme-accent`): Use `text-theme-text` (dark grey)
- **Dark backgrounds** (`bg-theme-text`, `bg-redstone-red`): Use `text-white`
- **Text on white**: Never use white text on light backgrounds

## Character Design (react-kawaii)

### Astronaut (Buddy)

- Always green `#79d461` (boy) or pink `#ff69b4` (girl)
- Main mascot, appears on every screen
- Size: 80px hero, 60px compact

### Supporting Characters

- **Planet**: Happy green safe, sad red unsafe
- **Backpack**: Green/Pink based on theme
- **Folder**: Pink/Blue based on theme
- **File**: Green/Pink based on theme
- **Browser**: Pink/Cyan based on theme

## Scanner UI

```
Simple cartoonish viewport with:
- Soft rounded borders (border-2)
- Soft shadows (shadow-lg)
- Playful border frame (accent color, 50% opacity)
- Thin animated scanning line
- Simple text labels ("Scan here!")
```

## Mini-Games (Premium)

Two premium-gated games built from the child's own scan history, launched from
the `Gamepad2` button in the home top bar. Non-premium taps open the standard
`PremiumGate`. Each game is a full-screen view (`fixed inset-0 z-50` overlay,
`bg-theme-bg` gradient, `SnackScout size="sm"` header) following all the rules
below — white cards, soft shadows, dark text, `bg-theme-accent` CTAs.

### Shared language

- **Mascot feedback**: kawaii `Planet` whose mood tracks performance — `happy`
  → `blissful` (2+ streak) → `excited` (4+) → `lovestruck` (6+); `shocked`/`sad`
  on mistakes, `ko` when out of hearts.
- **Lives**: 3 hearts (`HeartsBar`), pop-out on loss, shake on the rest.
- **Score**: +10 × streak multiplier (×2 at 3, ×3 at 6). Correct answers fire an
  `EmojiBurst` (⭐✨🎉) + floating `+points` — no confetti library.
- **Teaching moment**: mistakes always explain WHY using `getAllergenDisplay()`
  allergen chips (emoji + label), never the raw `emoji:label` string.
- **Empty state**: fewer than 4 unique history snacks → friendly "Scan more
  snacks to play!" with a sad Planet.
- **Stats**: high score / best streak / games played persisted per game per
  profile in IndexedDB (`gameStats:<gameId>:<profileId>`).

### Snack Sort (swipe)

Card stack; swipe right = Good/safe, left = Bad/unsafe, or tap the big round
✓ / ✗ buttons. Cards are white `rounded-3xl shadow-lg`, rotate while dragging
with green/red corner stamps; wrong answers pause with a teaching overlay.

### Snack Attack (whack-a-snack)

3×3 grid of white `rounded-2xl shadow-lg` holes; snacks pop up and you tap only
the safe ones before they hide. 45-second round with a `bg-theme-accent`
countdown bar; difficulty ramps (faster spawns, shorter lifetimes, up to 3 at
once). Wrong taps cost a heart and show a non-blocking red toast (too fast for a
modal).

## Dos ✅

- Use soft rounded corners everywhere
- Apply `shadow-lg` to all cards/buttons
- Use solid colors (NO gradients: `bg-gradient-to-br`)
- Dark text on light backgrounds always (text-theme-text on theme-primary)
- Keep UI playful with mascots
- Center important content (mobile-first)
- Verify text contrast on all backgrounds

## Don'ts ❌

- Voxel shadows (4px 4px 0px style)
- Card borders (border-4)
- Gradients (bg-gradient-to-br)
- White text on light backgrounds
- Overcomplicated layouts
- Mixing themes on one screen

## Implementation

Use theme engine CSS variables for all colors:

- `bg-theme-primary`, `text-theme-text`, `bg-theme-accent`
- Components automatically adapt to boy/girl themes
- Test both themes during development

When adding features: use theme variables, soft shadows, no borders, verify text contrast.
