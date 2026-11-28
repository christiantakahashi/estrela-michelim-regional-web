import type { CSSProperties } from 'react'
import type { RestaurantResult } from '../api/types'
import { RestaurantCard } from './RestaurantCard'

type ResultListProps = {
  ordering: 'compatibility' | 'rating'
  results: RestaurantResult[]
}

const styles: Record<string, CSSProperties> = {
  list: {
    display: 'grid',
    gap: 'var(--space-3)',
  },

  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },

  count: {
    margin: 0,
    font: '700 18px/24px var(--font-display)',
  },

  hint: {
    margin: 0,
    color: 'var(--ink-muted)',
    font: '400 13px/18px var(--font-sans)',
  },
}

export function ResultList({ ordering, results }: ResultListProps) {
    return (
    <div style={styles.list}>
      <div style={styles.header}>
        <h2 style={styles.count}>
          {results.length}{' '}
          {results.length === 1 ? 'restaurante encontrado' : 'restaurantes encontrados'}
        </h2>
        <p style={styles.hint}>
          {ordering === 'compatibility'
            ? 'Ordenado por compatibilidade'
            : 'Ordenado por nota'}
        </p>
      </div>
      {results.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}