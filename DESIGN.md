# NeXgro — Design Brief

**Purpose**: Fresh, vibrant, mobile-first grocery e-commerce platform inspired by Instamart. Clean shopping experience with green-primary, orange-accent flash deals.

**Tone**: Modern, friendly, accessible—premium yet approachable. Bright and energetic without feeling chaotic.

**Differentiation**: Bold emerald green primary with vibrant orange accents for deal urgency. White card-based layout. Prominent flash deal banners with countdown timers. Responsive mobile-first grid (1 → 2 → 3–4 columns).

## Color Palette

| Role           | OKLCH           | Usage                                     |
| -------------- | --------------- | ----------------------------------------- |
| Primary        | 0.48 0.16 142°  | Buttons, links, product names, nav icons |
| Primary-Light  | 0.62 0.17 142°  | Dark mode primary, hover states          |
| Accent         | 0.58 0.21 33°   | Flash deals, CTAs, urgency                |
| Accent-Dark    | 0.68 0.22 33°   | Dark mode accents, active states          |
| Background     | 0.98 0.01 142°  | Main surface, light mode                  |
| Card           | 1.0 0 0         | Product cards, white backgrounds          |
| Border         | 0.88 0.01 142°  | Card edges, dividers                      |
| Muted          | 0.92 0.02 142°  | Secondary surface, subtle fills           |
| Foreground     | 0.16 0.04 142°  | Body text, primary foreground             |
| Destructive    | 0.55 0.22 25    | Error states, removals                    |

## Typography

| Role      | Font           | Usage                              |
| --------- | -------------- | ---------------------------------- |
| Display   | Space Grotesk  | Hero, section heads, flash deals   |
| Body      | General Sans   | Paragraph, labels, UI text         |
| Mono      | Geist Mono     | Product codes, technical content   |

**Scale**: 14 (sm), 16 (base), 18 (lg), 20 (xl), 24 (2xl), 32 (3xl)

## Structural Zones

| Zone        | Surface           | Border          | Purpose                           |
| ----------- | ----------------- | --------------- | --------------------------------- |
| Header      | Primary @ 0.92    | Border subtle   | Logo, search, cart, account       |
| Hero        | Gradient primary  | None            | Promo banner, urgency messaging   |
| Card        | Card (white)      | Border default  | Products, categories, orders      |
| Flash Deal  | Accent gradient   | None            | Limited-time offers, countdown    |
| Admin Nav   | Sidebar default   | Sidebar border  | Left sidebar, role-protected      |
| Footer      | Muted default     | Border top      | Links, copyright, minimal         |

## Component Patterns

- **Product Card**: Image top (aspect-square), name (body-lg), price (display-sm, primary), rating (stars), add-to-cart button (accent)
- **Flash Deal Banner**: Full-width orange gradient, bold countdown timer, original price crossed out, sale price bold
- **Button Primary**: Green background, white text, rounded-lg, shadow-card on hover
- **Button Accent**: Orange background, white text, bold weight, flash badge styling
- **Cart Drawer**: Slide-in from right, white background, product list, order summary, checkout button (accent)
- **Admin Sidebar**: Compact nav on left, green accent for active, white text on dark, table layouts for content

## Spacing & Rhythm

- **Gap**: 16px (default), 8px (compact), 24px (generous), 32px (section breaks)
- **Padding**: Cards 20px, sections 32px top/bottom, container 16px horizontal (mobile), 24px (tablet+)
- **Responsive**: 1-column mobile (sm), 2-column tablet (md), 3–4 columns desktop (lg+)

## Motion & Animation

| Animation    | Duration | Easing          | Usage                     |
| ------------ | -------- | --------------- | ------------------------- |
| pulse-glow   | 2s       | ease-in-out     | Flash deal countdown      |
| slide-in     | 0.3s     | ease-out        | Cart drawer, modals       |
| transition   | 0.3s     | cubic-bezier    | Hover states, color shift |

## Interactive Details

- Flash deal banners pulse with opacity animation to signal urgency
- Product cards lift slightly on hover (shadow-elevated transition)
- Buttons transition color smoothly on state change
- Cart drawer slides in from right with fade-in content

## Constraints

- Never use raw hex or named colors—OKLCH tokens only
- Maintain AA+ contrast in light & dark modes (verify with accessibility checker)
- Mobile-first: test all breakpoints on device
- Admin dashboard role-protected behind secret URL
- Intro video fullscreen dark overlay with centered logo, skip button top-right

## Signature Detail

**Flash Deal Pulse**: Orange gradient banner with bold countdown timer that fades in/out at 2-second rhythm. Strikethrough original price, large sale price. Communicates time-limited urgency while maintaining visual hierarchy.

---

Generated: Apr 2026 | **Aesthetic**: Modern grocery e-commerce, vibrant & accessible | **Theme**: Light primary, dark-mode support | **Status**: Active
