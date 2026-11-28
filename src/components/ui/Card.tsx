import type { ReactNode } from 'react'
import styles from './Card.module.css'

/** Superfície de cartão: separação por borda, sem sombra. */
export function Card({ children }: { children: ReactNode }) {
  return <article className={styles.root}>{children}</article>
}

export function CardTop({ children }: { children: ReactNode }) {
  return <div className={styles.top}>{children}</div>
}

export function CardName({ children }: { children: ReactNode }) {
  return <h3 className={styles.name}>{children}</h3>
}

/** Bloco numérico à direita do nome; omitir quando não há valor. */
export function CardMatch({ value, label }: { value: string; label: string }) {
  return (
    <p className={styles.match}>
      {value}
      <small>{label}</small>
    </p>
  )
}

export function CardMeta({ children }: { children: ReactNode }) {
  return <div className={styles.meta}>{children}</div>
}

export function CardTags({ children }: { children: ReactNode }) {
  return <div className={styles.tags}>{children}</div>
}
