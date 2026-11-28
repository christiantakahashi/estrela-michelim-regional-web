import { useId } from 'react'
import type { ReactNode } from 'react'
import styles from './Chip.module.css'

type ChipProps = {
  selected: boolean
  onToggle: () => void
  children: ReactNode
}

/** Alternância de um valor de filtro de múltipla escolha. */
export function Chip({ selected, onToggle, children }: ChipProps) {
  return (
    <button type="button" className={styles.root} aria-pressed={selected} onClick={onToggle}>
      {children}
    </button>
  )
}

export type ChipOption = { value: string; label: string }

type ChipGroupProps = {
  label: string
  options: ChipOption[]
  /** Lista vazia significa critério não informado (RN-C01). */
  value: string[]
  onChange: (value: string[]) => void
}

/** Grupo de chips com o nome do critério em overline acima. */
export function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  const labelId = useId()

  const toggle = (option: string) => {
    onChange(
      value.includes(option) ? value.filter((item) => item !== option) : [...value, option],
    )
  }

  return (
    <div className={styles.group} role="group" aria-labelledby={labelId}>
      <span className={styles.groupLabel} id={labelId}>
        {label}
      </span>
      <div className={styles.groupOptions}>
        {options.map((option) => (
          <Chip
            key={option.value}
            selected={value.includes(option.value)}
            onToggle={() => toggle(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}
