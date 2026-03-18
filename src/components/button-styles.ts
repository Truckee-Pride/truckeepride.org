/** Shared button Tailwind class constants — imported by Button.tsx and any component that needs button styling */
export const buttonBaseClasses =
  'inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out cursor-pointer no-underline hover:shadow-xl hover:-translate-y-1 disabled:opacity-50'

export const buttonIntentClasses = {
  primary: 'bg-brand text-inverse hover:bg-brand-hover hover:text-inverse',
  secondary:
    'bg-secondary text-inverse hover:bg-secondary-hover hover:text-inverse',
}
