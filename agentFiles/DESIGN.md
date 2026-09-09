---
name: Warm Editorial Minimalism
colors:
  surface: '#fbf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fbf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#eae8e2'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c18'
  on-surface-variant: '#434845'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f3f1eb'
  outline: '#747874'
  outline-variant: '#c3c8c3'
  surface-tint: '#57615b'
  primary: '#131b17'
  on-primary: '#ffffff'
  primary-container: '#27302b'
  on-primary-container: '#8e9891'
  inverse-primary: '#bfc9c2'
  secondary: '#536251'
  on-secondary: '#ffffff'
  secondary-container: '#d4e4ce'
  on-secondary-container: '#586755'
  tertiary: '#151b16'
  on-tertiary: '#ffffff'
  tertiary-container: '#29302a'
  on-tertiary-container: '#919890'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe5dd'
  primary-fixed-dim: '#bfc9c2'
  on-primary-fixed: '#151d19'
  on-primary-fixed-variant: '#404943'
  secondary-fixed: '#d7e7d1'
  secondary-fixed-dim: '#bbcbb6'
  on-secondary-fixed: '#111f11'
  on-secondary-fixed-variant: '#3c4b3a'
  tertiary-fixed: '#dde4db'
  tertiary-fixed-dim: '#c1c8c0'
  on-tertiary-fixed: '#171d18'
  on-tertiary-fixed-variant: '#424942'
  background: '#fbf9f3'
  on-background: '#1b1c18'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  sidebar-width: 260px
  card-min-width: 240px
  card-max-width: 300px
  content-gutter: 2rem
---

## Brand & Style

This design system embodies a calm, warm, editorial minimalism crafted for personal note-taking, collections, and mindful digital curation. Designed to evoke serenity, clarity, and tactile intimacy, it strips away visual noise in favor of natural warmth and quiet confidence.

The aesthetic draws on tactile stationery and refined editorial layouts:
- **Warm Canvas:** Replacing stark pure white with gentle linen and warm parchment undertones.
- **Organic Accents:** Soft sage greens and muted slates anchor focus states and navigation without demanding aggressive visual attention.
- **Uncluttered Spatial Rhythm:** Generous whitespace, razor-thin neutral outlines, and subtle rounded corners deliver a clean, modern desk feel.

## Colors

The palette revolves around warm, organic neutrals paired with muted herbals and deep slate inks.

- **Canvas & Backgrounds:** The base background (`#F8F6F0`) delivers a warm cream feeling, while sidebars utilize a muted tinted off-white (`#F0EFEA`) to softly delineate functional panels.
- **Primary Ink:** Text and commanding elements rely on deep botanical slate (`#27302B`), avoiding harsh absolute blacks to preserve soft contrast.
- **Accents & Active States:** Selected navigation items and interactive badges employ soft sage highlights (`#DCE3DA` for fills, `#8A9A86` for subtle icons and active tints).
- **Outlines & Dividers:** Subtle, warm stone rules (`#E5E2D9`) deliver clean separation without breaking the layout's tranquility.
- **Functional Tints:** Muted soft rose (`#FBE8E8` / `#C25454`) provides understated feedback for destructive actions.

## Typography

The typography leverages **Plus Jakarta Sans** across all levels, striking a balance between modern geometry and welcoming warmth.

- **Headlines & Titles:** Set with bold to semi-bold weights and tight negative tracking (`-0.01em` to `-0.02em`) to deliver crisp structure without looking cold or mechanical.
- **Body & Content:** Generous line heights (`1.6x`) ensure high legibility and an unhurried, comfortable reading tempo.
- **Section Headers:** Transformed to uppercase with wide tracking (`0.06em`) at diminutive sizes (`11px`) to establish deliberate grouping without competing with actual content.

## Layout & Spacing

The layout is built on an uncluttered split-view architecture:
- **Navigation Sidebar:** Fixed left panel (`260px` width) housing user profile information, section categories, and creation actions. It maintains a distinct boundary via a delicate `1px` vertical divider (`#E5E2D9`).
- **Main Canvas:** Expansive, fluid workspace with `2rem` outer padding that houses headers, metadata counters, action toolbars, and content views.
- **Card Grid:** Fluid auto-fitting columns with min-width of `240px` and a comfortable `1rem` grid gap, allowing cards to breathe and adapt seamlessly to widescreen or compact views.
- **Responsive Adaptation:** On tablet and mobile viewports (< 768px), the sidebar collapses into a slide-over drawer, and padding reduces to `1rem` on margins with single-column card stacking.

## Elevation & Depth

This system avoids dramatic drop shadows, favoring quiet tonal layering and razor-thin borders:

- **Surface Tiers:** Depth is articulated through color shifts: the base canvas sits at `#F8F6F0`, active selected states at `#E2E8DF`, and elevated cards at pure `#FFFFFF`.
- **Card Elevation:** Cards utilize a virtually imperceptible ambient shadow (`0 1px 3px rgba(39, 48, 43, 0.04)`) coupled with a sharp 1px border (`#EAE7DF`).
- **Empty / Action States:** Dashed borders (`1.5px dashed #D6D2C4`) set against a subtle tinted fill (`#F0EDE4`) create low-contrast affordance for creation cards without competing with active notes.
- **Hover & Interaction:** Hover states produce slight warm tint shifts rather than aggressive vertical lifts, preserving calmness.

## Shapes

The interface embraces a gentle, tailored geometry:
- **Base Elements:** Buttons, cards, and sidebar list items feature subtle `0.375rem` to `0.5rem` (`rounded-md` to `rounded-lg`) corner radii, preserving crisp alignment.
- **Pills:** Category tags, utility toggles (such as theme switchers), and user avatars adopt complete pill shaping (`9999px`) to create clear tactile contrast against square content cards.
- **Cards:** Crisp `0.5rem` corners reinforce the feel of physical index cards and stationery.

## Components

### Buttons & Utility Controls
- **Ghost Action Buttons:** Minimal `32x32px` square buttons with soft `6px` radius, light stone hover backgrounds (`#EFECE3`), and charcoal icons (`#4F5752`).
- **Pill Toggles:** Utility controls like dark/light toggles use a full pill radius (`9999px`), `1px` subtle outline (`#E0DDD4`), `12px` typography, and small accompanying icons.
- **Destructive Triggers:** Soft rose background (`#FBE8E8`) paired with subdued crimson glyphs (`#C25454`) for clear affordance without alarmist weight.

### Navigation Lists & Items
- **Sidebar Navigation:** Full-width clickable items with `8px` horizontal padding and `6px` radius.
- **Active State:** Tinted sage green background (`#E2E8DF`) with darkened slate text (`#1F2923`) and a bold glyph accent.
- **Inactive State:** Transparent background, muted slate text (`#666F69`), shifting to `#EBE8DF` on hover.

### Cards & Placeholders
- **Content Card:** Pure white `#FFFFFF` surface with `1px solid #EAE7DF`, `1rem` internal padding, bold title, and relaxed body summary.
- **Create Card Placeholder:** Light beige wash (`#F0EDE4`), `1.5px` dashed border (`#D6D2C4`), centered sage/olive plus icon, and medium label text.

### Form Inputs & Text Areas
- **Borderless Note Input:** Seamless inline text areas with zero border, inheriting the warm parchment background for uninterrupted editorial focus.
- **Standard Input Fields:** `#FFFFFF` background with `1px solid #DCD8CD`, rounding to `6px`, with focus states indicated by a quiet sage outline (`#8A9A86`).