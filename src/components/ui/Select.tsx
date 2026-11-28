import { useId } from 'react'
import styles from './Select.module.css'

export type SelectOption = { value: string; label: string }

type SelectProps = {
  label: string
  /** Primeira opção: representa "critério não informado" (RN-C01). */
  placeholder: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

/** Escolha única com rótulo obrigatório acima, em overline. */
export function Select({ label, placeholder, options, value, onChange }: SelectProps) {
  const id = useId()

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={styles.field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
