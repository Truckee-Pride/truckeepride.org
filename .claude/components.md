# Component Guidelines

- One component per file. Filename = component name (PascalCase).
- Default exports for page components and layouts. Named exports for everything else.
- Co-locate a component's types, helpers, and sub-components in the same file if they're only used there.
- Prefer composition over configuration: instead of a component with 10 boolean props, break it into smaller focused components.
- Use `children` props generously for layout components — don't hardcode content in layout shells.
