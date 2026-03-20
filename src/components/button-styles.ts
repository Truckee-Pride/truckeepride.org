/** Shared button Tailwind class constants — imported by Button.tsx and any component that needs button styling */

export const buttonBaseClasses = [
  'inline-block px-6 py-3 font-semibold text-xl cursor-pointer no-underline',
  'shadow-[6px_6px_0_var(--color-brand-shadow)]',
  'translate-x-0 translate-y-0',
  'transition-all duration-150 ease-out',
  'hover:translate-x-1 hover:translate-y-1',
  'hover:shadow-[2px_2px_0_var(--color-brand-shadow)]',
  'active:translate-x-1.5 active:translate-y-1.5',
  'active:shadow-[0px_0px_0_var(--color-brand-shadow)]',
  'disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[6px_6px_0_var(--color-brand-shadow)]',
].join(' ')

export const buttonIntentClasses = {
  primary: 'bg-brand text-inverse hover:bg-brand-hover hover:text-inverse',
  secondary:
    'bg-secondary text-inverse hover:bg-secondary-hover hover:text-inverse',
}
