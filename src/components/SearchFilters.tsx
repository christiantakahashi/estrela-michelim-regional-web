// src/components/SearchFilters.tsx
import type {
  FilterOption,
  SearchFilters as FiltersType,
  SearchOptionsResponse,
} from '../api/client';
import {
  Button,
  ChipGroup,
  Select,
  type ChipOption,
  type SelectOption,
} from './ui';
import styles from './SearchFilters.module.css';

interface SearchFiltersProps {
  options: SearchOptionsResponse;
  filters: FiltersType;
  onChange: (updatedFilters: FiltersType) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const PRICE_OPTIONS: SelectOption[] = [
  { value: '1', label: '$ (Econômico)' },
  { value: '2', label: '$$ (Moderado)' },
  { value: '3', label: '$$$ (Sofisticado)' },
  { value: '4', label: '$$$$ (Alto padrão)' },
];

const RATING_OPTIONS: SelectOption[] = [
  { value: '3.5', label: '3,5 ★ ou mais' },
  { value: '4.0', label: '4,0 ★ ou mais' },
  { value: '4.5', label: '4,5 ★ ou mais' },
];

function toOptions(items: FilterOption[]): SelectOption[] & ChipOption[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));
}

export function SearchFilters({
  options,
  filters,
  onChange,
  onSearch,
  isLoading = false,
}: SearchFiltersProps) {
  function handleClearAll() {
    onChange({});
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      {/* 1. Critérios de escolha única (Select) */}
      <div className={styles.selectsRow}>
        <Select
          label="Cidade"
          placeholder="Todas as cidades"
          options={toOptions(options.cities)}
          value={filters.city_id ? String(filters.city_id) : ''}
          onChange={(value) =>
            onChange({
              ...filters,
              city_id: value ? Number(value) : null,
            })
          }
        />

        <Select
          label="Faixa de preço"
          placeholder="Qualquer preço"
          options={PRICE_OPTIONS}
          value={filters.price_range ? String(filters.price_range) : ''}
          onChange={(value) =>
            onChange({
              ...filters,
              price_range: value ? Number(value) : null,
            })
          }
        />

        <Select
          label="Nota mínima"
          placeholder="Qualquer nota"
          options={RATING_OPTIONS}
          value={filters.min_rating ? String(filters.min_rating) : ''}
          onChange={(value) =>
            onChange({
              ...filters,
              min_rating: value ? Number(value) : null,
            })
          }
        />
      </div>

      {/* 2. Critérios de múltipla escolha (ChipGroup) */}
      <div className={styles.chipsSection}>
        <ChipGroup
          label="Ocasião"
          options={toOptions(options.occasions)}
          value={(filters.occasions || []).map(String)}
          onChange={(values) =>
            onChange({ ...filters, occasions: values.map(Number) })
          }
        />

        <ChipGroup
          label="Vibe do lugar"
          options={toOptions(options.vibes)}
          value={(filters.vibes || []).map(String)}
          onChange={(values) =>
            onChange({ ...filters, vibes: values.map(Number) })
          }
        />

        <ChipGroup
          label="Culinária"
          options={toOptions(options.cuisines)}
          value={(filters.cuisines || []).map(String)}
          onChange={(values) =>
            onChange({ ...filters, cuisines: values.map(Number) })
          }
        />

        <ChipGroup
          label="Comodidades"
          options={toOptions(options.amenities)}
          value={(filters.amenities || []).map(String)}
          onChange={(values) =>
            onChange({ ...filters, amenities: values.map(Number) })
          }
        />
      </div>

      {/* 3. Ações do formulário */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={handleClearAll}
          disabled={isLoading}
        >
          Limpar filtros
        </Button>

        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
    </form>
  );
}