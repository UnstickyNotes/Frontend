# 📝 Unsticky Notes

A fast, offline-first note-taking desktop app built with **Tauri**, **React**, and **SQLite**. Write notes, organize them into collections, and keep them synced — all from a sleek, minimal interface that lives in your system tray.

---

## ✨ Features

### Notes
- Create, edit, and delete notes with a title and body
- View notes in a responsive masonry grid layout
- Open notes in a full detail or edit page
- Search notes by keyword in real time

### Collections
- Organize notes into named, color-coded collections
- "All Notes" view shows every note across all collections
- "Unsorted" catch-all for notes without a collection
- Each collection has a unique accent color applied throughout the UI

### Quick Note (Global Shortcut)
- Press **`Ctrl + Shift + Alt + ;`** anywhere on your desktop — even when the app is in the background — to instantly open a floating Quick Note modal
- Assign the note to any collection before saving
- Works system-wide via Tauri's global shortcut plugin

### Sync
- Notes sync to a remote backend over the network
- A background sync queue (`SyncQueue`) handles offline changes and retries them automatically when connectivity is restored
- Local SQLite database (`UnstickyNotes.db`) keeps all data available offline

### System Tray
- The app minimizes to the system tray instead of closing
- Tray menu provides quick access to the main window
- Single-instance enforced: re-opening the app focuses the existing window

### Auth
- Email/password sign-up and login
- Google OAuth sign-in via deep link callback
- Persistent session management via `AuthContext`

### UI & UX
- Dark and light theme support, system-aware
- Resizable sidebar with elastic resistance
- Responsive masonry grid that adapts columns to available space (1–4 columns via CSS container queries)
- Modal keyboard shortcuts: **`Enter`** to confirm, **`Esc`** to cancel, **`Shift+Enter`** for new line in text areas
- Collection accent colors applied to all related modals (new note, edit note, edit collection, delete confirmation)
- Empty collection state shows a large faded **+** button as an additional way to create a note

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri v2](https://tauri.app) (Rust) |
| Frontend | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Routing | [React Router v8](https://reactrouter.com) |
| Styling | Vanilla CSS (custom design system, no framework) |
| Build tool | [Vite 8](https://vitejs.dev) |
| Local DB | SQLite via `tauri-plugin-sql` |
| HTTP | Axios |
| Linting | [Oxlint](https://oxc.rs) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [pnpm](https://pnpm.io), or [npm](https://www.npmjs.com)
- [Rust](https://rustup.rs) toolchain (for Tauri)

**Note:** If you use npm, replace `pnpm` with `npm` in the commands below. Example: `pnpm install` → `npm install`.

### Install Dependencies

```bash
pnpm install
```

### Run in Development

```bash
pnpm tauri dev
```

### Build for Production

```bash
pnpm tauri build
```

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components (Sidebar, Modals, NoteCard, …)
├── contexts/         # React context providers (Auth, Theme)
├── db/               # Local DB access and SyncQueue
├── pages/            # Route-level page components
├── router/           # App routing configuration
├── services/         # API service layer (NoteService, CollectionService)
├── syncServices/     # Background sync manager
├── types/            # Shared TypeScript types
└── utils/            # Helpers (collection colors, …)

src-tauri/
├── src/lib.rs        # Tauri setup: tray, global shortcuts, single-instance, migrations
└── migrations/       # SQLite migration SQL files
```

---

## ⌨️ Global Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + Alt + ;` | Open Quick Note modal (works system-wide) |
| `Enter` | Confirm / submit any modal |
| `Esc` | Cancel / close any modal |
| `Shift + Enter` | Insert newline in note body fields |

---

## 🎨 Design System

The UI is built on a custom CSS design system (`src/index.css` + `src/App.css`) with:

- CSS custom properties for all colors, shadows, and typography tokens
- Separate light and dark theme variable sets
- Container queries for responsive masonry column counts
- Smooth micro-animations on all interactive elements
