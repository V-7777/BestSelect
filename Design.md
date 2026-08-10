# Design System Specification: Editorial Financial Excellence

## 1. Overview & Creative North Star
### The Creative North Star: "The Architectural Ledger"
This design system moves beyond the cold, utilitarian nature of traditional fintech. It is built on the philosophy of **Architectural Ledgering**—a concept that treats digital space as a premium editorial canvas. We replace generic "app-like" containers with a sophisticated interplay of depth, tonal shifts, and intentional asymmetry.

The system is designed to evoke authority and clarity. By utilizing a high-contrast typography scale and a "No-Line" boundary philosophy, we create an environment that feels expansive yet structured, guiding the user through complex financial data with the ease of a high-end broadsheet magazine.

---

## 2. Color & Surface Philosophy
The palette is rooted in the depth of **Abyssal Blue** and the clarity of **Azure Blue**, balanced by a warm, humanistic secondary palette of Ecru and Peach.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundary definition must be achieved exclusively through:
1.  **Background Color Shifts:** Placing a `surface-container-low` section against a `background` floor.
2.  **Tonal Transitions:** Using the `surface-container` tiers to denote functional changes.
3.  **Negative Space:** Using the Spacing Scale to create "gutters" that imply separation.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
*   **Base:** `surface` (#f5faff) – The primary floor of the application.
*   **Level 1:** `surface-container-low` (#e9f5ff) – Secondary content areas or subtle sidebars.
*   **Level 2:** `surface-container-highest` (#d6e4ef) – Active cards, focused data points, or "interactive sheets."
*   **Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` section to create a soft, natural lift without the need for visual noise.

### The Glass & Gradient Rule
To achieve a signature premium feel:
*   **Glassmorphism:** Use semi-transparent `surface` colors with a 20px-40px backdrop-blur for floating navigation or modals. This allows the financial data to bleed through, maintaining context.
*   **Signature Textures:** Apply a subtle linear gradient (135°) from `primary` (#000000) to `primary_container` (#0d1c2f) for high-impact CTA backgrounds. This prevents the "flat-asset" look.

---

## 3. Typography: The Editorial Voice
We use **Inter** not as a system font, but as a precision tool. The hierarchy is designed for high-speed scanning and authoritative messaging.

| Level | Size | Weight | Role |
| :--- | :--- | :--- | :--- |
| **Display-LG** | 3.5rem | Bold | Hero numbers (Net Worth, Total Assets). |
| **Headline-MD** | 1.75rem | Medium | Section headers. Use `on_primary_fixed` for deep backgrounds. |
| **Title-SM** | 1.0rem | Semi-Bold | Component labels and card titles. |
| **Body-MD** | 0.875rem | Regular | Standard financial data and descriptors. |
| **Label-SM** | 0.6875rem | Medium | Micro-copy, metadata, and tiny annotations. |

**Editorial Intent:** Use `display-md` for key financial figures, paired immediately with a `label-md` in `on_surface_variant` (#44474c) for context. This "High-Low" pairing is the hallmark of the system.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional structural lines.

*   **Ambient Shadows:** For floating elements (Modals/Dropdowns), use an extra-diffused shadow: `box-shadow: 0px 12px 32px rgba(9, 25, 44, 0.06)`. Note the use of **Abyssal Blue** in the shadow tint—never use pure black or grey.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline_variant` (#c5c6cd) at **15% opacity**. It should be felt, not seen.
*   **Tonal Lift:** Elevate a card simply by switching from `surface-container` to `surface-container-lowest`. This creates a "white-paper-on-blue-desk" effect.

---

## 5. Components

### Buttons
*   **Primary:** Background: `primary_container` (#0d1c2f); Text: `on_primary` (#ffffff). Radius: `md` (6px). 
*   **Secondary:** Background: `secondary` (#005cbc); Text: `white`. Use for "Growth" actions.
*   **Tertiary:** No background. Text: `secondary`. Use `title-sm` typography for a clear interactive hint.

### Form Inputs
*   **Style:** No bottom line. Use a `surface-container-lowest` fill with a `sm` radius. 
*   **Focus State:** A 2px `secondary_fixed` (#d7e2ff) "halo" (outer glow) rather than a hard border change.

### Cards & Lists
*   **Forbid Dividers:** Use `8px` or `16px` of vertical white space to separate items.
*   **Data Lists:** Alternate background colors between `surface-container-low` and `surface-container` to create a "Zebra" striping effect for long ledgers.

### Modern Financial Chips
*   Use `tertiary_fixed` (#e9e1db) for neutral categories and `secondary_fixed` (#d7e2ff) for active filters. These "muted" backgrounds keep the focus on the data.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use intentional asymmetry. Place a large headline on the left with a primary CTA floating in a `surface-container-highest` card on the right.
*   **DO** utilize the "Soft Ecru" (#F7EFE9) and "Muted Peach" (#F7EBEB) for background sections that contain educational or "human" content to differentiate from "data" content.
*   **DO** ensure the 'W' icon has breathing room (at least 2x its width) in any header layout.

### Don't:
*   **DON'T** use 100% opaque black for text. Use `on_background` (#101d25) to maintain a premium, ink-like softness.
*   **DON'T** use sharp 0px corners. This system relies on the `4px - 8px` range to feel professional yet approachable.
*   **DON'T** use traditional grid lines. If you feel the need to "box" something in, use a background color shift instead.

---

## 7. Signature Layout Pattern: The "Layered Gutter"
When designing a dashboard, the sidebar should use `primary_container` (#0d1c2f). The main content area should sit on `surface` (#f5faff), and individual data widgets should be "sheets" of `surface-container-lowest` (#ffffff). This creates a three-tier depth hierarchy that guides the eye from navigation to global context to specific data.
