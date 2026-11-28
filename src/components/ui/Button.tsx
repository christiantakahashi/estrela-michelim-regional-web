import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: ButtonVariant
  children: ReactNode
}

/**
 * Ações da busca: primário para buscar, secundário para limpar,
 * ghost para ações dentro de mensagens. Um primário por tela.
 */
export function Button({ variant = 'primary', children, type = 'button', ...rest }: ButtonProps) {
  const classes = [styles.root]
  if (variant === 'secondary') classes.push(styles.secondary)
  if (variant === 'ghost') classes.push(styles.ghost)

  return (
    <button type={type} className={classes.join(' ')} {...rest}>
      {children}
    </button>
  )
}
