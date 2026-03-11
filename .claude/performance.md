# Performance

- Images: use `next/image` everywhere. Never use `<img>`.
- Fonts: system sans-serif for now. Brand fonts (`Fraunces`, `Nunito_Sans`, `IBM_Plex_Mono`) loaded via `next/font` in the design system phase.
- Only memoize (`useMemo`/`useCallback`) when you've measured a real performance problem.
- Prefer static generation (`generateStaticParams`) for event detail pages; revalidate on publish/update.
