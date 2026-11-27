import { Button } from './Button'
import styles from './EmptyState.module.css'

type EmptyStateProps = {
  title: string
  description: string
  /** No máximo uma ação, que tira a pessoa do estado. */
  action?: { label: string; onClick: () => void }
}

/** Lista vazia ou erro: um título, uma frase e no máximo uma ação. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{description}</p>
      {action ? (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
