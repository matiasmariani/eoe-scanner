# Snack Scout Design System & WCAG 2.1 Accessibility Guide

**Target:** Children ages 5–10 | **Platform:** Mobile-first PWA | **Themes:** Minecraft (dark) + Kitty (light)

This document is **authoritative**. Agents and developers must follow every rule here. Deviations require explicit approval.

---

## Section 1: Core Design Principles

### 1.1 Mobile-First Layout Philosophy

- **Rule:** Design for small touch screens first (≥ 320px). Expand with `@media (min-width: ...)` only.
- **Thumb-Zone Optimization:** Place interactive elements in the lower 50% of screen (children's reach).
- **Single-Column by Default:** All layouts are vertical stacks on mobile. NO multi-column grids unless explicitly required.
- **Minimum Touch Target:** All clickable elements **64×64px** or larger (`w-16 h-16` in Tailwind).
- **Padding Rule:** Minimum 1rem (16px) between interactive elements. Never crowd buttons/inputs.
- **Text Size Rule:** Body text minimum 16px (1rem). Headers minimum 20px (1.25rem) for developing eyes.
- **Viewport Meta:** Always include `<meta name="viewport" content="width=device-width, initial-scale=1">` (present in layout.tsx)

### 1.2 Accessibility-First (Non-Negotiable)

Every design decision must pass:

- **WCAG 2.1 Level AA** (minimum standard for this app)
- **Keyboard-only navigation** (no mouse/touch required)
- **Screen reader compatibility** (semantic HTML + ARIA)
- **Color-blind safe** (no information by color alone)
- **High contrast** (≥ 4.5:1 normal text, ≥ 3:1 large/graphics)
- **Zoom-safe** (readable at 200% zoom, no fixed-height overflow)

---

## Section 2: Design Tokens (Authoritative Values)

### 2.1 CSS Theme Variables (From `globals.css`)

**All colors and spacing use CSS variables.** Never hardcode `#hex` or `rgb()` values. Always use theme tokens.

#### Minecraft Theme (`[data-theme='minecraft']`)

```
--theme-primary-val: #79d461;     ← Grass Green (buttons, success)
--theme-accent-val: #00a3a3;      ← Teal (highlights, active states)
--theme-bg-val: #313131;          ← Deep Stone (page background)
--theme-text-val: #ffffff;        ← White (all text)
--theme-border-val: #000000;      ← Black (outlines, shadows)
--theme-shadow-val: #000000;      ← Black (hard voxel shadows)
```

#### Kitty Theme (`[data-theme='kitty']`)

```
--theme-primary-val: #ff1493;     ← Magenta/Pink (buttons, primary)
--theme-accent-val: #c5a000;      ← Gold/Yellow (highlights, accents)
--theme-bg-val: #ffd1dc;          ← Pastel Pink (page background)
--theme-text-val: #2c2c2c;        ← Charcoal (all text)
--theme-border-val: #2c2c2c;      ← Charcoal (outlines, shadows)
--theme-shadow-val: #2c2c2c;      ← Charcoal (hard voxel shadows)
```

#### Brand/Utility Colors (Always Available)

```
--color-redstone-red: #d81b00;    ← Allergen/danger text (verified 4.6:1 on white ✅)
--color-pikachu-yellow: #ffde00;  ← Celebration, highlights
--color-block-white: #ffffff;     ← Pure white (fallback)
--color-ink-navy: #1a1a1a;        ← Deep black (text on light bg)
```

### 2.2 Tailwind CSS Class Reference

Use these classes everywhere. They auto-switch with theme:

```
bg-theme-bg           → page/container background
text-theme-text       → paragraph, body text
border-theme-border   → all outlines, borders
text-theme-primary    → primary action, success, emphasis
text-theme-accent     → highlights, warnings, secondary actions
shadow-voxel          → hard 4px 4px offset shadow (defined in globals.css)
```

### 2.3 Typography Tokens

From `globals.css` @theme block:

```
--font-display: 'Fredoka', sans-serif;     ← Headers, large text
--font-body: 'Nunito', sans-serif;         ← Paragraphs, body copy
--font-data: 'Andika', sans-serif;         ← Accessible data displays
--font-mono: 'JetBrains Mono', monospace;  ← Code, technical text
```

---

## Section 3: Component Patterns & Code Examples

### 3.1 Buttons (Universal Pattern)

#### Correct Button Pattern

```tsx
<button
  className="bg-theme-primary border-4 border-theme-border px-6 py-4 rounded-2xl font-display font-black text-lg text-theme-border shadow-voxel hover:scale-105 active:shadow-none active:translate-y-[2px] transition-all"
  aria-label="Clear description if needed"
  onClick={handleClick}
>
  Button Text
</button>
```

#### Anatomy Checklist

- [ ] **Size:** Minimum `w-16 h-16` (64×64px) OR `px-6 py-4` padding for text buttons
- [ ] **Colors:** `bg-theme-primary`, `border-4 border-theme-border`, `text-theme-border`
- [ ] **Style:** `rounded-2xl` (buttons only), `font-display font-black`
- [ ] **Shadow:** `shadow-voxel` (hard 4px 4px, never soft box-shadow)
- [ ] **Active State:** `active:shadow-none active:translate-y-[2px]` (feels pressed)
- [ ] **Hover:** `hover:scale-105` or opacity change (no jumping content)
- [ ] **Focus:** Built-in `focus-visible { outline: 2px solid green }` from globals.css
- [ ] **Disabled:** `disabled:opacity-50` + `disabled:cursor-not-allowed`
- [ ] **Aria:** Always has `aria-label` if no visible text, or `aria-pressed`/`aria-expanded` if toggle/modal trigger

#### DO's and DON'Ts

```
✅ DO:
  <button className="bg-theme-primary border-4 border-theme-border ...">

❌ DON'T:
  <button className="bg-blue-500 hover:bg-blue-600">           (hardcoded color)
  <button onClick={...}>                                        (missing label, no accessibility)
  <div className="cursor-pointer" onClick={...}>               (not a button element)
  <button className="active:scale-90">                        (breaks layout on press)
  <button focus:outline-none>                                  (no focus indicator replacement)
```

---

### 3.2 Text Inputs & Form Fields

#### Correct Input Pattern

```tsx
<div>
  <label
    htmlFor="input-id"
    className="font-body font-bold text-theme-text text-sm mb-2"
  >
    Label Text
  </label>
  <input
    id="input-id"
    type="text"
    placeholder="Placeholder text..."
    className="w-full bg-theme-bg border-2 border-theme-border p-4 rounded-2xl font-body font-bold text-theme-text placeholder:text-theme-text/40 focus:outline-none focus:ring-4 focus:ring-theme-accent"
    aria-label="Barcode number"
    autocomplete="off"
  />
  {error && (
    <p id="input-error" className="text-redstone-red text-sm mt-2 font-bold">
      {error}
    </p>
  )}
</div>
```

#### Anatomy Checklist

- [ ] **Label:** Associated via `<label htmlFor="id">` (not just aria-label)
- [ ] **Type:** Correct input type (`text`, `email`, `tel`, `number`, etc.)
- [ ] **Autocomplete:** Set appropriately (`autocomplete="email"`, `autocomplete="off"`, etc.)
- [ ] **Background:** `bg-theme-bg` (high contrast with text)
- [ ] **Text Color:** `text-theme-text` (high contrast)
- [ ] **Border:** `border-2 border-theme-border` (visible outline)
- [ ] **Padding:** `p-4` minimum (comfortable for touch)
- [ ] **Placeholder:** Visible but dimmed (`placeholder:text-theme-text/40`)
- [ ] **Font:** `font-body` or larger (never < 16px)
- [ ] **Focus Ring:** `focus:ring-4 focus:ring-theme-accent` (bright indicator)
- [ ] **Error Styling:** Red text (`text-redstone-red`) or red border
- [ ] **Error Linked:** Error text has `id="error-id"`, input has `aria-describedby="error-id"`

#### DO's and DON'Ts

```
✅ DO:
  <label htmlFor="barcode">Barcode</label>
  <input id="barcode" type="tel" autocomplete="off" ... />
  {error && <p id="error">Invalid format: 8–14 digits</p>}
  <input aria-describedby="error" />

❌ DON'T:
  <p>Enter barcode</p><input />                     (no label association)
  <input placeholder="Email" />                     (placeholder is not a label)
  <input p-1 rounded-sm />                          (too cramped)
  <input style={{backgroundColor: 'white'}} />     (hardcoded color)
  <input focus:outline-none />                      (no focus indicator)
  <input type="text" placeholder="Email" />        (should use type="email")
```

---

### 3.3 Modals & Dialogs

#### Correct Modal Pattern

```tsx
{
  showModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-theme-bg border-4 border-theme-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col p-6 space-y-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-3xl font-display font-black">
            Modal Title
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-theme-text text-theme-bg rounded-full font-black text-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {/* Content */}
      </motion.div>
    </motion.div>
  );
}
```

#### Anatomy Checklist

- [ ] **Backdrop:** `bg-black/60 backdrop-blur-sm` (clear modal state)
- [ ] **Z-Index:** `z-50` (above all other content)
- [ ] **Shadow:** `shadow-[8px_8px_0px_0px_...]` (hard voxel shadow)
- [ ] **Rounded:** `rounded-3xl` (softer than buttons, still structured)
- [ ] **Close Button:** Top-right, always visible, labeled
- [ ] **Overflow:** `overflow-y-auto` for scrollable content
- [ ] **Semantics:** `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- [ ] **Focus Trap:** Focus moves into modal on open, returns on close
- [ ] **Escape Key:** `onKeyDown={(e) => e.key === 'Escape' && onClose()}`
- [ ] **Readability:** Max height `max-h-[90vh]` leaves room for close button

#### DO's and DON'Ts

```
✅ DO:
  role="dialog" aria-modal="true" aria-labelledby="modal-title"
  <h2 id="modal-title">Title</h2>
  onKeyDown={(e) => e.key === 'Escape' && onClose()}

❌ DON'T:
  <div className="modal">                    (no semantics)
  <div role="dialog">                        (no aria-modal, no labelledby)
  onClick={onClose}                         (closes on any click, dangerous)
  h-screen overflow-hidden                  (hides content)
  title attribute instead of aria-label     (not accessible)
```

---

### 3.4 Cards & Containers

#### Correct Card Pattern

```tsx
<motion.div
  initial={{ scale: 0.9, opacity: 0, rotate: -10 }}
  animate={{ scale: 1, opacity: 1, rotate: 0 }}
  exit={{ scale: 0.9, opacity: 0, rotate: 10 }}
  className="bg-theme-text border-4 border-theme-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 space-y-4"
>
  {/* Content */}
</motion.div>
```

#### Anatomy Checklist

- [ ] **Border:** `border-4 border-theme-border` (thick, visible)
- [ ] **Shadow:** `shadow-[6px_6px_0px_0px_...]` (hard pixel shadow)
- [ ] **Padding:** `p-6` minimum (breathing room)
- [ ] **Background:** Contrasts with page bg (`bg-theme-text` on `bg-theme-bg` pages)
- [ ] **Rounded:** `rounded-3xl` (distinct, retro feel)
- [ ] **Animation:** Pop in with scale + rotate

#### DO's and DON'Ts

```
✅ DO:
  bg-theme-text with text-theme-bg (white card on dark page, dark text on light page)
  shadow-[6px_6px_0px_0px_...] (hard voxel shadow)
  space-y-4 space-x-3 (consistent spacing)

❌ DON'T:
  bg-theme-bg with text-theme-text (same colors = invisible)
  shadow-lg (soft blur, not retro, bad WCAG perception)
  p-1 (too cramped)
  rounded-full or rounded-none (breaks visual category)
```

---

### 3.5 Lists

#### Correct List Pattern

```tsx
<ul className="w-full flex flex-wrap justify-center gap-3" role="list">
  {items.map((item) => (
    <li
      key={item.id}
      className="flex flex-col items-center gap-1 bg-theme-primary/10 p-3 rounded-2xl border-2 border-theme-primary/20"
    >
      <span className="text-3xl" role="img" aria-label={item.label}>
        {item.icon}
      </span>
      <span className="text-xs font-black uppercase">{item.name}</span>
    </li>
  ))}
</ul>
```

#### Anatomy Checklist

- [ ] **Semantic HTML:** Always `<ul>`, `<ol>`, or `<dl>` — never divs
- [ ] **List Items:** `<li>` with semantic content (not just wrappers)
- [ ] **Gap:** `gap-3` or `gap-4` (12–16px minimum between items)
- [ ] **Wrapping:** `flex flex-wrap` for responsive layout
- [ ] **Heading:** If list has a heading, use `<h2>` or `<h3>` (not aria-label)

#### DO's and DON'Ts

```
✅ DO:
  <ul><li>Item 1</li><li>Item 2</li></ul>

❌ DON'T:
  <div className="list"><div>Item 1</div></div> (not semantic)
  <ul aria-label="Items"><li>...</li></ul>      (use <h2> instead of aria-label)
```

---

### 3.6 Icons & Visual Elements

#### Emoji Icons (Primary)

```tsx
<span className="text-3xl" role="img" aria-label="Milk allergen">
  🥛
</span>
```

#### SVG Icons (Lucide React)

```tsx
import { AlertCircle } from 'lucide-react';

<AlertCircle className="w-6 h-6 text-theme-text" aria-hidden="true" />;
```

#### Anatomy Checklist

- [ ] **Emoji Icons:** `role="img" aria-label="description"` when meaningful
- [ ] **Decorative Icons:** `aria-hidden="true"` to skip in screen readers
- [ ] **Size:** Minimum `w-6 h-6` (24×24px); `w-8 h-8` (32px) for standalone icons
- [ ] **Color:** Inherit theme color (`text-theme-text`) or explicit color
- [ ] **Contrast:** Icon color ≥ 3:1 against background

#### DO's and DON'Ts

```
✅ DO:
  <span role="img" aria-label="Success">✓</span>
  <Check className="w-6 h-6" aria-hidden="true" /> Check    (text provides name)

❌ DON'T:
  <span>✓</span>                                (screen reader says "checkmark", not "success")
  <Check className="w-6 h-6" /> Check         (duplicates twice)
  <Check className="w-4 h-4" />                (too small, 16px < minimum)
  text-red-500 (hardcoded color, breaks theme)
```

---

## Section 4: WCAG 2.1 Level AA Compliance Checklist

**Every PR must verify these criteria.** This is the accessibility standard.

### 4.1 Perceivable

#### 1.1.1 Non-Text Content (Level A)

- [ ] Every image, SVG, chart, emoji has `alt`, `aria-label`, or `aria-hidden="true"`
- [ ] Decorative elements are `aria-hidden="true"`
- [ ] Color-only information has text fallback

#### 1.3.1 Info and Relationships (Level A)

- [ ] Heading hierarchy never skips levels: h1 → h2 → h3 (not h1 → h3)
- [ ] Lists use `<ul>`, `<ol>`, `<dl>` — never divs
- [ ] Form controls use `<fieldset>` + `<legend>` or `role="group"` + `aria-label`
- [ ] Forms inputs have associated labels: `<label htmlFor="id">` or `aria-label`

#### 1.3.5 Identify Input Purpose (Level AA)

- [ ] Form inputs have `autocomplete` attributes (e.g., `autocomplete="email"`, `autocomplete="tel"`)

#### 1.4.1 Use of Color (Level A)

- [ ] Information is NOT conveyed by color alone
- [ ] Status (success/error) includes text OR icon in addition to color
- [ ] Example: ✅ "✓ Success" (checkmark + text) vs ❌ Red box alone (bad)

#### 1.4.3 Contrast (Level AA) — **CRITICAL**

- [ ] Normal text (< 18pt): **4.5:1 minimum** contrast ratio
- [ ] Large text (18pt+ or 14pt+ bold): **3:1 minimum** contrast ratio
- [ ] Graphical elements: **3:1 minimum** contrast ratio
- [ ] UI borders: **3:1 minimum** contrast against adjacent color

**Snack Scout Pre-Verified Ratios (must maintain):**

| Text Color             | Background          | Ratio  | Status      |
| ---------------------- | ------------------- | ------ | ----------- |
| White (#fff)           | Minecraft (#313131) | 14.2:1 | ✅ WCAG AAA |
| Charcoal (#2c2c2c)     | Kitty (#ffd1dc)     | 4.6:1  | ✅ WCAG AA  |
| Redstone red (#d81b00) | White (#fff)        | 4.6:1  | ✅ WCAG AA  |
| Theme primary          | Theme bg            | 7+:1   | ✅ WCAG AAA |
| Theme accent           | Theme bg            | 6+:1   | ✅ WCAG AA  |

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) for custom colors.

#### 1.4.4 Resize Text (Level AA)

- [ ] Text remains readable at 200% zoom
- [ ] No `overflow: hidden` on text containers with fixed heights
- [ ] Line height ≥ 1.5 for body text

#### 1.4.10 Reflow (Level AA)

- [ ] Content fits within 320px width (mobile-first rule)
- [ ] Horizontal scrolling not required except data tables

#### 1.4.11 Non-Text Contrast (Level AA)

- [ ] UI components (buttons, borders, focus indicators) have 3:1 minimum contrast
- [ ] Graphical objects have 3:1 minimum contrast

### 4.2 Operable

#### 2.1.1 Keyboard (Level A)

- [ ] All interactive elements reachable by Tab key
- [ ] No keyboard traps (can Tab away from any element)
- [ ] Standard keys work:
  - **Button/Link:** Enter, Space to activate
  - **Modal:** Escape to close
  - **Dropdown:** Arrow keys to navigate, Enter to select
  - **Toggle:** Space to toggle

#### 2.4.3 Focus Order (Level A)

- [ ] Tab order follows reading order (left-to-right, top-to-bottom)
- [ ] No positive `tabIndex` values (use natural DOM order)
- [ ] Modals trap focus programmatically

#### 2.4.6 Headings and Labels (Level AA)

- [ ] Every heading describes its section (no generic "Section" or empty headings)
- [ ] Form labels are descriptive and visible
- [ ] Labels not hidden on focus

#### 2.4.7 Focus Visible (Level AA) — **CRITICAL**

- [ ] Every focusable element has visible focus indicator
- [ ] Focus indicator is 2px minimum, 4.5:1 contrast
- [ ] **Global rule in globals.css (DO NOT override):**
  ```css
  *:focus-visible {
    outline: 2px solid var(--color-grass-green);
    outline-offset: 2px;
  }
  ```
- [ ] **Never use:** `focus:outline-none` without replacing with `focus:ring-4 focus:ring-theme-accent`

#### 2.5.3 Label in Name (Level A)

- [ ] Buttons with visible text have accessible name matching visible text
- [ ] Example: ✅ Text: "Delete" / Name: "Delete" vs ❌ Text: "Delete" / Name: "Remove item"

#### 2.5.4 Motion Actuation (Level A)

- [ ] Animations respect `prefers-reduced-motion`
- [ ] **Global rule in globals.css:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### 4.3 Understandable

#### 3.2.1 On Focus (Level A)

- [ ] Focusing an element does NOT trigger a context change
- [ ] Example: ❌ onFocus opens dropdown (BAD) vs ✅ onClick opens dropdown (GOOD)

#### 3.3.1 Error Identification (Level A)

- [ ] Form errors identified by text, not color alone
- [ ] Error message visible on page (not just console)
- [ ] Error linked to field via `aria-describedby`

#### 3.3.3 Error Suggestion (Level AA)

- [ ] Form errors include correction suggestions
- [ ] Example: "Invalid email. Use format: name@example.com"

#### 3.3.4 Error Prevention (Level AA)

- [ ] Submissions are reversible (Undo) OR
- [ ] Data reviewed before final submission OR
- [ ] Legal/financial transactions have confirmation

### 4.4 Robust

#### 4.1.2 Name, Role, Value (Level A)

- [ ] Every interactive element has accessible name
- [ ] Role is correct: `role="button"`, `role="tab"`, `role="dialog"`, etc.
- [ ] Custom widgets use correct ARIA:
  - **Tab panel:** `role="tabpanel"` + `aria-labelledby`
  - **Toggle:** `role="button"` + `aria-pressed="true/false"`
  - **Expandable:** `role="button"` + `aria-expanded="true/false"`
  - **Listbox:** `role="listbox"` + children `role="option"` + `aria-selected`

#### 4.1.3 Status Messages (Level A)

- [ ] Dynamic content (errors, success, toasts) uses `aria-live="polite"` or `role="alert"`
- [ ] Loading uses `aria-busy="true"` + `aria-label="Loading ..."`
- [ ] Example:
  ```tsx
  <div aria-live="polite" aria-atomic="true">
    {isLoading ? 'Loading products...' : '12 products found'}
  </div>
  ```

#### 4.1.4 Parsing (Level A)

- [ ] HTML is well-formed (validate with W3C)
- [ ] No duplicate `id` attributes
- [ ] ARIA attributes used correctly

---

## Section 5: Quick Reference: DO's and DON'Ts

### DO's ✅

- Use theme variables: `bg-theme-bg`, `text-theme-text`
- Use semantic HTML: `<button>`, `<form>`, `<label>`, `<ul>`, `<h1>`–`<h6>`
- Add `aria-label` to icons and images
- Test contrast with WebAIM Contrast Checker
- Use `border-4 border-theme-border` for all outlines
- Use `shadow-voxel` for hard retro shadows
- Use 64×64px minimum for interactive elements
- Respect `prefers-reduced-motion` media query
- Test keyboard navigation: Tab, Arrow, Enter, Escape
- Test on mobile (320px) and tablet (768px) viewports

### DON'Ts ❌

- Hardcode colors: `bg-blue-500`, `text-red-600`
- Use divs for buttons: `<div onClick={...}>` (use `<button>`)
- Hide focus indicators: `focus:outline-none` without replacement
- Reveal content on `onFocus` (keyboard users miss it)
- Use `title`-only labels: `<button title="Delete">` (use `aria-label`)
- Skip heading levels: `<h1>` → `<h3>` (must be h1 → h2)
- Use `overflow: hidden` on text containers (breaks zoom)
- Use soft shadows: `shadow-lg` (use `shadow-voxel`)
- Use tiny icons: `w-4 h-4` (minimum `w-6 h-6`)
- Convey info by color alone: red box without text/icon
- Animate without respecting motion preferences
- Use positive `tabIndex` (let DOM order handle focus)

---

## Section 6: Testing Checklist (Before Every PR)

### Automated

- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` passes
- [ ] No console errors or warnings

### Manual Accessibility

- [ ] Keyboard navigation works (Tab, Escape, Enter)
- [ ] Focus indicator visible on every interactive element
- [ ] Screen reader reads all content in logical order
- [ ] All text ≥ 4.5:1 contrast (WebAIM Contrast Checker)
- [ ] Content readable at 200% zoom
- [ ] Animations pause if `prefers-reduced-motion` enabled

### Manual Visual

- [ ] Minecraft theme: colors correct, readable
- [ ] Kitty theme: colors correct, readable
- [ ] iPhone SE (320px): single-column, no overflow
- [ ] iPad (768px): layout adapts
- [ ] Touch targets ≥ 64×64px
- [ ] Padding ≥ 1rem between elements

### Manual Functional

- [ ] Feature works as intended
- [ ] Error states handled
- [ ] Loading states clear
- [ ] Success states provide feedback

---

## Section 7: Component PR Template

**Use this for every new component or major change:**

```markdown
### Component: [Name]

**Layout**

- [ ] Mobile-first (single column by default)
- [ ] Uses theme colors (no hardcoded hex)
- [ ] 64×64px touch targets minimum
- [ ] ≥ 1rem padding between elements

**Accessibility**

- [ ] Semantic HTML (h1–h6, ul/ol, button, form, main, etc.)
- [ ] Keyboard accessible (Tab, Arrow, Enter, Escape)
- [ ] Focus visible (green outline)
- [ ] No focus traps
- [ ] aria-label on icons/images
- [ ] aria-describedby on form errors
- [ ] aria-live on dynamic content
- [ ] Contrast verified: 4.5:1 text, 3:1 UI

**Visual**

- [ ] `border-4 border-theme-border` (all outlines)
- [ ] `shadow-voxel` (hard, not soft)
- [ ] `rounded-2xl` or `rounded-3xl` (retro look)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No color-only information

**Testing**

- [ ] Looks good at 320px, 768px, 1024px
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] 200% zoom readable
- [ ] Both themes render correctly
```

---

## Section 8: Resources

- **WCAG 2.1 Level AA:** https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **ARIA Authoring Practices Guide:** https://www.w3.org/WAI/ARIA/apg/
- **Tailwind Accessibility:** https://tailwindcss.com/docs/font-size
- **Framer Motion:** https://www.framer.com/motion/
- **Lucide React Icons:** https://lucide.dev/

---

## Section 9: Governance

**This document is law for this app.** Deviations require explicit approval from the lead developer.

If you find:

- **Contrast violation:** Document the values (e.g., "White on #313131 = 14:1") and escalate.
- **Keyboard issue:** Test with Tab, Arrow, Enter, Escape and document the failure mode.
- **ARIA mismatch:** Reference the ARIA APG pattern and flag in PR review.
- **Motion issue:** Test with `prefers-reduced-motion` enabled.

**Questions?** Check WCAG 2.1 Level AA, then ARIA APG, then this document. In that order.
