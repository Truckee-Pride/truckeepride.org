/** Shared button Tailwind class constants — imported by Button.tsx and any component that needs button styling */

const buttonRest = 'translate-x-0 translate-y-0'
const buttonPressed =
  'hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[5px] active:translate-y-[5px]'

export const buttonBaseClasses = [
  'inline-block px-6 py-3 font-semibold text-xl cursor-pointer no-underline',
  'shadow-[6px_6px_0_var(--color-brand-shadow)]',
  'transition-all duration-150 ease-out',
  buttonRest,
  buttonPressed,
  'hover:shadow-[2px_2px_0_var(--color-brand-shadow)]',
  'active:shadow-[1px_1px_0_var(--color-brand-shadow)]',
  'disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[6px_6px_0_var(--color-brand-shadow)]',
].join(' ')

export const buttonIntentClasses = {
  primary: 'bg-brand text-inverse hover:bg-brand-hover hover:text-inverse',
  secondary:
    'bg-secondary text-inverse hover:bg-secondary-hover hover:text-inverse',
}
