import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeVariant = 'match' | 'new' | 'neutral'

type BadgeProps = {
  variant?: BadgeVariant
  children: ReactNode
}

/**
 * Selo curto, só de leitura. O significado nunca depende só da cor:
 * o texto do selo diz o que ele é.
 */
export function Badge({ variant = 'neutral', children }: BadgeProps) {
  const classes = [styles.root]
  if (variant === 'match') classes.push(styles.match)
  if (variant === 'new') classes.push(styles.new)

  return <span className={classes.join(' ')}>{children}</span>
}
