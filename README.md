# Tabs Task

React component that implements browser-like tabs with routing, drag-and-drop ordering, pinned state, and overflow handling.

## Features

- Tabs can be reordered with drag and drop.
- Tab order is saved in `localStorage` and restored after page reload.
- Tabs can be pinned from a hover popover.
- Pinned tabs keep their state after reload.
- Pinned tabs are grouped at the beginning of the tab list.
- Drag and drop is limited to the current group, so pinned tabs cannot be dragged after unpinned tabs.
- Each tab has its own URL.
- Clicking a tab navigates to the tab URL with `react-router-dom`.
- Tabs that do not fit into the visible container are moved into a dropdown menu.
- The dropdown updates when the screen/container width changes.
- Active tab is highlighted with a light gray background and blue top border.

## Tech Stack

- React
- Vite
- React Router
- dnd-kit
- SCSS

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Main Files

- `src/components/tabs/Tabs.jsx` - main tabs container, routing, state, persistence, overflow calculation, and drag/drop handlers.
- `src/components/tabs/SortableTab.jsx` - single draggable tab component.
- `src/components/tabs/Tabs.constants.js` - default tab data.
- `src/components/tabs/Tabs.utils.js` - helpers for initial localStorage state and pinned tab grouping.
- `src/components/tabs/Tabs.scss` - tabs, dropdown, active state, pin popover, dividers, and drag styles.
- `src/App.jsx` - route definitions for tab URLs.

## Notes

The component stores tab order and pinned state in `localStorage` under the `tabs` key. If new default tabs are added later, they are merged into the saved list without losing the user's saved order.

Pinned tabs follow browser-like behavior: they stay in a separate group before regular tabs, and reordering is allowed only inside the pinned or regular tab group.

