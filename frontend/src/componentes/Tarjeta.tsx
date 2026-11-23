import clsx from 'clsx'
import type { ComponentProps } from 'react'

/** Superficie base: radio 22px como Techvora, borde sutil en vez de sombra pesada. */
export function Tarjeta({ className, ...resto }: ComponentProps<'div'>) {
  return (
    <div
      className={clsx('rounded-tarjeta border border-tinta/10 bg-white p-6 dark:border-white/10 dark:bg-[#15151f]', className)}
      {...resto}
    />
  )
}
