import { cn } from '@/lib/utils'

type Props = React.ComponentProps<'form'>

export function Form({ className, ...props }: Props) {
  return <form noValidate className={cn(className)} {...props} />
}
