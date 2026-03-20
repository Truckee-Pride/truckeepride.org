---
name: tailwind
description: Tailwind CSS v4 conventions for this project including CSS-first config, cn() usage, className extraction, cva for variants, design tokens, responsive grouping, and class ordering. Loaded when working on styling, classNames, or UI components.
user-invocable: false
---

# Tailwind Conventions

## Tailwind v4 Specifics

- CSS-first config: extend the theme using `@theme` in `globals.css`, not `tailwind.config.ts`.
- All custom element styles in `globals.css` must be inside `@layer base { ... }`. Unlayered CSS always beats layered CSS regardless of specificity — so bare `a { color: blue }` will override `text-white`. Only `:root` variables and `@theme` blocks live outside `@layer base`.
- Use CSS variables for design tokens (colors, fonts, spacing scale) in `globals.css`.
- **Never use `!important`** (or Tailwind's `!` prefix). If a utility isn't winning, the base style is in the wrong cascade layer — fix it there.
- Avoid arbitrary values (`[42px]`). If a single element needs more than ~8 utility classes, extract to a component.

## Class Organization

Always use the `cn()` utility (from `clsx` + `tailwind-merge`) for combining classes.
Never use string concatenation or template literals for classNames.

```tsx
// ✅
className={cn("base-styles", condition && "conditional-styles", className)}

// ❌
className={`base-styles ${condition ? "conditional-styles" : ""}`}
```

## Extracting Complex ClassNames

When a className string exceeds ~3 utilities, extract it to a named const above the component return. Name it descriptively — what the element _is_, not what it looks like.

```tsx
// ✅
const triggerBase = "cursor-pointer text-sm font-medium transition-colors"
const triggerDisabled = "disabled:cursor-default disabled:opacity-50"
const triggerHover = "hover:text-red-700 hover:underline"

<button className={cn(triggerBase, triggerHover, triggerDisabled)} />

// ❌
<button className="cursor-pointer text-sm font-medium transition-colors hover:text-red-700 hover:underline disabled:cursor-default disabled:opacity-50" />
```

## Component Variants with cva

Use `cva` (class-variance-authority) for any component that has multiple visual variants. Never use conditional ternaries inside className strings for variants.

```tsx
// ✅
import { cva, type VariantProps } from 'class-variance-authority'

const buttonStyles = cva(
  'inline-flex items-center rounded-md font-medium transition-colors',
  {
    variants: {
      intent: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'bg-transparent hover:bg-gray-100',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>

export function Button({ intent, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ intent, size }), className)}
      {...props}
    />
  )
}

// ❌
;<button
  className={cn(
    'base styles...',
    intent === 'primary'
      ? 'bg-blue-600 text-white'
      : intent === 'danger'
        ? 'bg-red-600'
        : '',
  )}
/>
```

## Responsive and State Variants

Group related variants on separate lines when there are 3 or more modifier prefixes. Use the extracted const pattern.

```tsx
// ✅
const cardStyles = cn(
  'rounded-lg border p-4',
  'sm:p-6 lg:p-8',
  'hover:shadow-md',
  'dark:border-gray-700 dark:bg-gray-900',
)

// ❌
className =
  'rounded-lg border p-4 sm:p-6 lg:p-8 hover:shadow-md dark:border-gray-700 dark:bg-gray-900'
```

## Component Extraction Threshold

If you find yourself writing the same cluster of utilities more than once, extract a component — don't just extract the string. The right abstraction is usually a component, not a variable.

## Class Ordering

Always follow the Prettier Tailwind plugin sort order. If unsure, group mentally as:
layout → box model → typography → visual → interactive → responsive → dark mode
