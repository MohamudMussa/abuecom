# Abu Ecom Design System

## Color Strategy: Committed

Dark surface with a single warm-tinted neutral palette. One accent: pure white used sparingly for CTAs and emphasis only.

## Colors (OKLCH)

- **Background primary**: oklch(14% 0.005 60) — near-black with warm brown tint
- **Background surface**: oklch(17% 0.006 60) — slightly lifted dark surface for cards
- **Background light**: oklch(94% 0.008 80) — warm off-white/beige for project cards
- **Text primary**: oklch(97% 0.005 80) — warm white
- **Text muted**: oklch(52% 0.008 60) — mid-gray muted text
- **Text subtle**: oklch(32% 0.005 60) — very muted, for dividers and labels
- **Border**: oklch(22% 0.005 60) — subtle dark border

## Typography

- **Font**: Inter (Google Fonts), weights 400/600/700/800/900
- **Display/Headline**: Inter 900, letter-spacing -0.035em, line-height 1.02–1.06
- **Body**: Inter 400–500, letter-spacing -0.01em, line-height 1.55–1.65
- **Labels/Caps**: Inter 500–600, 12–13px, letter-spacing 0
- **Max body line length**: 62ch

## Spacing Rhythm

Spacing uses a base-8 scale: 8, 16, 24, 32, 40, 48, 64, 80px.
Padding within sections varies intentionally — tighter for dense content, looser for breathing sections.

## Layout

- Mobile-first, max content width 390px on mobile with 22px horizontal padding
- Desktop: 2-column hero (content left, testimonial right), max-width 1200px, 44px padding
- Sections bleed edge-to-edge (no global container wrapping everything)

## Components

### Buttons
- Height: 58px, border-radius: 16px
- Full-width on mobile, min-width 220px on desktop
- Primary: oklch(97% 0.005 80) background, dark text, trailing icon chip (32px circle)
- Outline: transparent background, 1.5px border in oklch(22% 0.005 60), white text

### Testimonial Cards
- Background: surface color
- Quote: Inter 800, 22–28px, tight tracking, full color white
- Author row: 44px avatar circle + name (700) / company (muted)

### Project Cards
- Background: light beige
- Label above image: 13px, 600 weight, muted color
- Image area: aspect-ratio 9/7, centered inline mockup

### Logo Grid
- 2 columns mobile, 4 columns desktop
- Each item: small icon box (20px) + brand name in muted color
- Separated by subtle bottom borders

## Motion

- Transitions: opacity only, 140ms ease-out
- No layout animations
- No bounce or elastic curves
