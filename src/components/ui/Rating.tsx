import { formatRating } from '../../api/types'
import styles from './Rating.module.css'

const STAR_PATH =
  'M8 1.2l2.09 4.24 4.68.68-3.39 3.3.8 4.66L8 11.88 3.82 14.08l.8-4.66L1.23 6.12l4.68-.68z'

type RatingProps = {
  /** Nota de 0 a 5. */
  value: number
}

/** Estrelas arredondadas para o inteiro mais próximo, com o número ao lado. */
export function Rating({ value }: RatingProps) {
  const filled = Math.round(value)

  return (
    <span className={styles.root} role="img" aria-label={`Nota ${formatRating(value)} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 16 16" aria-hidden="true" data-empty={star > filled || undefined}>
          <path d={STAR_PATH} />
        </svg>
      ))}
      {formatRating(value)}
    </span>
  )
}
