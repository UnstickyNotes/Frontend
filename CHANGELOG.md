# Changelog

All notable changes to Unsticky Notes are listed here.
Changes are grouped after the **UI Rework** milestone (commit `2f85a13`).

---

## [Unreleased] — Post UI Rework

### UI / Design

- **Full UI rebuild** — complete redesign with a new dark/light design system, replacing the previous interface
- **Sidebar** — collapsible sidebar with resizable width, elastic resistance at min-width, and smooth open/close transitions
- **Masonry grid** — responsive note grid using CSS column layout with container queries (1–4 columns based on available width, not viewport)
- **Collection accent colors** — every modal related to a collection (new note, edit note, edit collection, delete confirm) now applies that collection's accent color to the modal header bar and action buttons; Unsorted uses gray
- **Note cards** — compact card design with a 3px color accent bar at the top, collection dot + label in the footer, and edit/delete actions that appear on hover
- **Consistent sidebar toggle icons** — the "show sidebar" and "hide sidebar" icons now use the same chevron style for visual consistency
- **App scaling** — UI scaled up by 50% (`zoom: 1.5`) for better readability at typical desktop viewing distances
- **Empty collection state** — when a collection has no notes, a large faded **`+`** button with an "ADD NOTE" label is displayed below the "No notes here yet" text as an additional entry point for creating a note
- **Removed help button** — the floating `?` help button has been removed from the main view

### UX / Keyboard

- **Enter to submit modals** — pressing `Enter` while focused on any modal field (title or body) submits the modal, equivalent to clicking the primary action button
- **Esc to cancel modals** — pressing `Esc` closes/cancels any open modal (was already partially implemented; now consistent across all modals)
- **Shift+Enter for newline** — in body/textarea fields, `Shift+Enter` inserts a newline instead of submitting
- **Delete note modal fix** — fixed a bug where pressing `Enter` on the delete confirmation modal would simultaneously delete the note and attempt to open it
- **Empty submission guard** — submitting a Quick Note with an empty or whitespace-only body is silently ignored (modal stays open, nothing is saved)

### Features

- **Quick Note modal** — a minimal body-only note creation modal that can be triggered via a global keyboard shortcut (`Ctrl+Shift+Alt+;`) system-wide, even when the app is in the background or minimized to the tray
- **Global shortcut** — registered in `lib.rs` via `tauri-plugin-global-shortcut`; when triggered while app is backgrounded, the Tauri single-instance handler re-focuses the window and emits an `open_modal` event to the frontend
- **Collection selector in Quick Note** — collection chips are shown at the bottom of the Quick Note modal so the user can assign the note to a collection before saving; defaults to Unsorted

### Bug Fixes

- **Sidebar resize speed** — reduced the sensitivity of the sidebar drag resizer; previously the sidebar grew faster than the cursor moved
- **Masonry column count on sidebar resize** — the notes grid now correctly recalculates column count when the sidebar is resized, using container queries on the scroll container rather than viewport-level media queries, so the grid always reflects the actual available width
- **Note card shadows** — removed `box-shadow` from note cards to eliminate rendering artifacts (misplaced shadow lines) caused by CSS column layout clipping box-shadows at column paint boundaries

---

## UI Rework Baseline — `2f85a13`

> *"the whole ui rebuilt new design new look"*

This commit replaced the previous interface with a fully redesigned layout including sidebar navigation, masonry note grid, redesigned modals, and a new CSS design system.

---

## Pre-Rework

### `caa5236` — Global Shortcut + Quick Note modal
Added the Quick Note modal and registered the global keyboard shortcut in Tauri so it can be triggered from anywhere on the system.

### `3f69c49` — Backend connectivity fix
Changed API base URL from `localhost` to `.onrender.com` for production sync.

### `5b4fb95` — Global shortcut implementation
Global shortcut registered and working; pending cross-platform testing on Windows.

### `ad3945f` — Autostart and tray options
Configured autostart-on-login and system tray menu options.

### `212239` — Lock file cleanup
Removed `pnpm-lock.yml` that was causing build errors.
