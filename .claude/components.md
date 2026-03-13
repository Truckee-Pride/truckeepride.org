# Component Guidelines

- One component per file. Filename = component name (PascalCase).
- Default exports for page components and layouts. Named exports for everything else.
- Co-locate a component's types, helpers, and sub-components in the same file if they're only used there.
- Prefer composition over configuration: instead of a component with 10 boolean props, break it into smaller focused components.
- Use `children` props generously for layout components — don't hardcode content in layout shells.

---

## UI Component Catalog

Before writing a bare `<button>`, `<a>`, or inline Tailwind for an interactive element, check this catalog.

### Button (`src/components/Button.tsx`)

Filled, shaped button for all actions. Renders as `<Link>` when `href` is provided. Single style — no variants.

```tsx
// Navigation CTA
<Button href="/events/new">Submit an Event</Button>

// Form submit
<Button type="submit" disabled={isPending}>Save Changes</Button>
```

### TextButton (`src/components/TextButton.tsx`)

Text-only inline `<button>` actions (no background fill). Variants: `primary`, `danger`.

### TextLink (`src/components/TextLink.tsx`)

Text-only inline `<Link>` navigation (no background fill). Variants: `primary`, `danger`.

Both share styles from `src/components/text-button-styles.ts`. Use anywhere you need a styled text action — admin dashboards, forms, detail pages, etc.

### Form Components (`src/components/forms/`)

Before writing a bare `<input>`, `<textarea>`, `<select>`, or `<input type="checkbox">`, use these:

| Component      | Replaces                  | Notes                                                                               |
| -------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `Input`        | `<input>`                 | Wraps in `FormField` — handles label, errors, accessibility                         |
| `Textarea`     | `<textarea>`              | Same pattern as Input                                                               |
| `Select`       | `<select>`                | Accepts `options: { value, label }[]`, includes custom chevron                      |
| `Checkbox`     | `<input type="checkbox">` | Includes inline label; uses `accent-brand`                                          |
| `DateInput`    | `<input type="date">`     | MM/DD/YYYY typed segments + react-day-picker calendar dropdown; stores `YYYY-MM-DD` |
| `TimeCombobox` | custom time `<input>`     | Keyboard-navigable segments + dropdown; stores 24h `HH:MM`                          |
| `EmojiPicker`  | —                         | Button + dropdown picker; returns emoji string                                      |
| `FormError`    | inline error div          | Form-level (non-field) error; returns null if no message                            |
| `FormField`    | —                         | Core wrapper for custom fields; render-prop pattern                                 |

All form components take `name`, `label`, and `errors?: string[]`. `FormField` wires up `htmlFor`/`aria-describedby` automatically — don't do this manually.
