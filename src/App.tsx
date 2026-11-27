import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Badge } from '../src/components/ui/Badge'
import { Button } from '../src/components/ui/Button'
import {
  Card,
  CardMatch,
  CardMeta,
  CardName,
  CardTags,
  CardTop,
} from '../src/components/ui/Card'
import { ChipGroup } from '../src/components/ui/Chip'
import type { ChipOption } from '../src/components/ui/Chip'
import { EmptyState } from '../src/components/ui/EmptyState'
import { Rating } from '../src/components/ui/Rating'
import { Select } from '../src/components/ui/Select'
import type { SelectOption } from '../src/components/ui/Select'

// ============================================================================
// Tipos do contrato JSON (UC-C04 - Estrela Michelin Regional)
// ============================================================================

export type SearchCriteria = {
  city_id: string
  occasions: string[]
  vibes: string[]
  cuisines: string[]
  price_range: string
  min_rating: string
  amenities: string[]
}

export type SearchOptionsResponse = {
  cities: Array<{ id: number; name: string }>
  occasions: Array<{ id: number; name: string }>
  vibes: Array<{ id: number; name: string }>
  cuisines: Array<{ id: number; name: string }>
  amenities: Array<{ id: number; name: string }>
}

export type RestaurantResult = {
  id: number
  name: string
  city: string
  neighborhood: string
  price_range: number
  average_rating: number
  compatibility: number | null
  matched_tags: string[]
  is_new: boolean
}

export type SearchSuggestion = {
  remove: keyof SearchCriteria | string
  would_return: number
}

export type SearchResponse = {
  ordering: 'compatibility' | 'rating'
  results: RestaurantResult[]
  suggestion: SearchSuggestion | null
}

// ============================================================================
// Constantes e helpers
// ============================================================================

const INITIAL_CRITERIA: SearchCriteria = {
  city_id: '',
  occasions: [],
  vibes: [],
  cuisines: [],
  price_range: '',
  min_rating: '',
  amenities: [],
}

// O componente Select já insere <option value="">{placeholder}</option> automaticamente
const PRICE_OPTIONS: SelectOption[] = [
  { value: '1', label: '$ — Econômico' },
  { value: '2', label: '$$ — Moderado' },
  { value: '3', label: '$$$ — Especial' },
  { value: '4', label: '$$$$ — Alta gastronomia' },
]

const RATING_OPTIONS: SelectOption[] = [
  { value: '3', label: '3,0 ou mais' },
  { value: '3.5', label: '3,5 ou mais' },
  { value: '4', label: '4,0 ou mais' },
  { value: '4.5', label: '4,5 ou mais' },
]

const FILTER_LABELS: Record<string, string> = {
  city_id: 'cidade',
  occasions: 'ocasião',
  vibes: 'vibe',
  cuisines: 'culinária',
  price_range: 'preço',
  min_rating: 'avaliação mínima',
  amenities: 'comodidades',
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

function buildSearchQuery(criteria: SearchCriteria): string {
  const params = new URLSearchParams()

  // RN-C01: filtros não preenchidos são ignorados
  if (criteria.city_id) params.set('city_id', criteria.city_id)
  if (criteria.price_range) params.set('price_range', criteria.price_range)
  if (criteria.min_rating) params.set('min_rating', criteria.min_rating)

  criteria.occasions.forEach((id) => params.append('occasions[]', id))
  criteria.vibes.forEach((id) => params.append('vibes[]', id))
  criteria.cuisines.forEach((id) => params.append('cuisines[]', id))
  criteria.amenities.forEach((id) => params.append('amenities[]', id))

  return params.toString()
}

function formatPriceRange(priceRange: number): string {
  const clamped = Math.max(1, Math.min(4, Math.round(priceRange)))
  return '$'.repeat(clamped)
}

function toChipOptions(items: Array<{ id: number; name: string }> = []): ChipOption[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name,
  }))
}

function toSelectOptions(items: Array<{ id: number; name: string }> = []): SelectOption[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name,
  }))
}

// Estilos estruturais da página

const layoutStyles: Record<string, CSSProperties> = {
  page: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: 'var(--space-6) var(--space-4) var(--space-8)',
    display: 'grid',
    gap: 'var(--space-6)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
  },
  header: {
    display: 'grid',
    gap: 'var(--space-2)',
  },
  eyebrow: {
    margin: 0,
    font: '700 11px/16px var(--font-sans)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--accent-text)',
  },
  title: {
    margin: 0,
    font: '700 28px/34px var(--font-display)',
  },
  subtitle: {
    margin: 0,
    color: 'var(--ink-muted)',
    font: '400 15px/22px var(--font-sans)',
  },
  form: {
    display: 'grid',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface)',
  },
  selectRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-3)',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--space-3)',
    paddingTop: 'var(--space-2)',
    borderTop: '1px solid var(--border)',
  },
  resultsHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  resultsCount: {
    margin: 0,
    font: '700 18px/24px var(--font-display)',
  },
  orderingHint: {
    margin: 0,
    color: 'var(--ink-muted)',
    font: '400 13px/18px var(--font-sans)',
  },
  resultsList: {
    display: 'grid',
    gap: 'var(--space-3)',
  },
}

// Componente Principal: SearchPage

export function SearchPage() {
  const [criteria, setCriteria] = useState<SearchCriteria>(INITIAL_CRITERIA)
  const [options, setOptions] = useState<SearchOptionsResponse>({
    cities: [],
    occasions: [],
    vibes: [],
    cuisines: [],
    amenities: [],
  })
  const [optionsLoading, setOptionsLoading] = useState(true)

  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchData, setSearchData] = useState<SearchResponse | null>(null)

  // Carrega opções dos filtros (GET /api/v1/search_options)
  useEffect(() => {
    let active = true

    async function loadOptions() {
      try {
        setOptionsLoading(true)
        const res = await fetch(`${API_BASE_URL}/search_options`)
        if (!res.ok) throw new Error('Falha ao carregar opções de filtro.')
        const data: SearchOptionsResponse = await res.json()
        if (active) setOptions(data)
      } catch {
        // Mantém listas vazias caso a API ainda não esteja em execução
      } finally {
        if (active) setOptionsLoading(false)
      }
    }

    loadOptions()
    return () => {
      active = false
    }
  }, [])

  // Executa a busca na API (GET /api/v1/restaurants/search)
  const executeSearch = useCallback(async (currentCriteria: SearchCriteria) => {
    setHasSearched(true)
    setLoading(true)
    setError(null)

    try {
      const query = buildSearchQuery(currentCriteria)
      const url = query
        ? `${API_BASE_URL}/restaurants/search?${query}`
        : `${API_BASE_URL}/restaurants/search`

      const res = await fetch(url)

      if (res.status === 422) {
        const body = await res.json().catch(() => null)
        const invalidFields = Array.isArray(body?.fields)
          ? body.fields.map((f: string) => FILTER_LABELS[f] ?? f).join(', ')
          : 'critérios informados'
        throw new Error(`Parâmetros inválidos na busca (${invalidFields}).`)
      }

      if (!res.ok) {
        throw new Error('Não foi possível buscar restaurantes no momento. Tente novamente.')
      }

      const data: SearchResponse = await res.json()
      setSearchData(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro inesperado ao carregar os resultados da busca.',
      )
      setSearchData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fluxo 5a: após a primeira busca, alterar qualquer filtro refaz a busca automaticamente
  useEffect(() => {
    if (!hasSearched) return
    executeSearch(criteria)
  }, [criteria, hasSearched, executeSearch])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    executeSearch(criteria)
  }

  const handleClearFilters = () => {
    setCriteria(INITIAL_CRITERIA)
    setHasSearched(false)
    setSearchData(null)
    setError(null)
  }

  // Fluxo 5c: remove o critério sugerido quando não há resultados
  const handleRemoveSuggestedFilter = () => {
    const filterToRemove = searchData?.suggestion?.remove
    if (!filterToRemove || !(filterToRemove in INITIAL_CRITERIA)) return

    const key = filterToRemove as keyof SearchCriteria
    setCriteria((prev) => ({
      ...prev,
      [key]: Array.isArray(INITIAL_CRITERIA[key]) ? [] : '',
    }))
  }

  const hasAnyFilter =
    Boolean(criteria.city_id) ||
    Boolean(criteria.price_range) ||
    Boolean(criteria.min_rating) ||
    criteria.occasions.length > 0 ||
    criteria.vibes.length > 0 ||
    criteria.cuisines.length > 0 ||
    criteria.amenities.length > 0

  const emptySuggestionDescription = searchData?.suggestion
    ? `Nenhum local atendeu a todos os filtros juntos. Remova ${
        FILTER_LABELS[searchData.suggestion.remove] ?? searchData.suggestion.remove
      }: voltam ${searchData.suggestion.would_return} ${
        searchData.suggestion.would_return === 1 ? 'restaurante' : 'restaurantes'
      }.`
    : 'Tente flexibilizar a faixa de preço, a cidade ou remover alguns filtros.'

  return (
    <main style={layoutStyles.page}>
      <header style={layoutStyles.header}>
        <p style={layoutStyles.eyebrow}>Estrela Michelin Regional</p>
        <h1 style={layoutStyles.title}>Buscar restaurantes por contexto</h1>
        <p style={layoutStyles.subtitle}>
          Combine cidade, ocasião, clima e estilo gastronômico para encontrar o lugar certo para o
          seu momento.
        </p>
      </header>

      {/* Formulário de filtros (RN-C01 e Fluxo 5a) */}
      <form style={layoutStyles.form} onSubmit={handleSubmit} aria-label="Filtros de busca">
        <div style={layoutStyles.selectRow}>
          <Select
            label="Cidade"
            placeholder={optionsLoading ? 'Carregando cidades...' : 'Todas as cidades'}
            options={toSelectOptions(options.cities)}
            value={criteria.city_id}
            onChange={(city_id) => setCriteria((prev) => ({ ...prev, city_id }))}
          />

          <Select
            label="Faixa de preço"
            placeholder="Qualquer faixa de preço"
            options={PRICE_OPTIONS}
            value={criteria.price_range}
            onChange={(price_range) => setCriteria((prev) => ({ ...prev, price_range }))}
          />

          <Select
            label="Avaliação mínima"
            placeholder="Qualquer avaliação"
            options={RATING_OPTIONS}
            value={criteria.min_rating}
            onChange={(min_rating) => setCriteria((prev) => ({ ...prev, min_rating }))}
          />
        </div>

        {options.occasions.length > 0 && (
          <ChipGroup
            label="Ocasião"
            options={toChipOptions(options.occasions)}
            value={criteria.occasions}
            onChange={(occasions) => setCriteria((prev) => ({ ...prev, occasions }))}
          />
        )}

        {options.vibes.length > 0 && (
          <ChipGroup
            label="Vibe"
            options={toChipOptions(options.vibes)}
            value={criteria.vibes}
            onChange={(vibes) => setCriteria((prev) => ({ ...prev, vibes }))}
          />
        )}

        {options.cuisines.length > 0 && (
          <ChipGroup
            label="Culinária"
            options={toChipOptions(options.cuisines)}
            value={criteria.cuisines}
            onChange={(cuisines) => setCriteria((prev) => ({ ...prev, cuisines }))}
          />
        )}

        {options.amenities.length > 0 && (
          <ChipGroup
            label="Comodidades"
            options={toChipOptions(options.amenities)}
            value={criteria.amenities}
            onChange={(amenities) => setCriteria((prev) => ({ ...prev, amenities }))}
          />
        )}

        <div style={layoutStyles.actions}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>

          {(hasAnyFilter || hasSearched) && (
            <Button type="button" variant="secondary" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      </form>

      {/* Área de estados e resultados */}
      <section aria-live="polite" aria-label="Resultados da busca">
        {/* Estado inicial */}
        {!hasSearched && !loading && (
          <EmptyState
            title="O que você está planejando?"
            description="Selecione os critérios desejados acima ou clique diretamente em Buscar para explorar todos os restaurantes elegíveis."
          />
        )}

        {/* Estado de carregamento */}
        {loading && (
          <div role="status">
            <EmptyState
              title="Buscando restaurantes..."
              description="Calculando a compatibilidade com os critérios selecionados."
            />
          </div>
        )}

        {/* Estado de erro */}
        {!loading && error && (
          <div role="alert">
            <EmptyState
              title="Não foi possível concluir a busca"
              description={error}
              action={{
                label: 'Tentar novamente',
                onClick: () => executeSearch(criteria),
              }}
            />
          </div>
        )}

        {/* Estado vazio com sugestão de remoção de critério (Fluxo 5c) */}
        {!loading && !error && hasSearched && searchData && searchData.results.length === 0 && (
          <EmptyState
            title="Nenhum restaurante encontrado"
            description={emptySuggestionDescription}
            action={
              searchData.suggestion
                ? {
                    label: 'Remover critério',
                    onClick: handleRemoveSuggestedFilter,
                  }
                : undefined
            }
          />
        )}

        {/* Lista de resultados */}
        {!loading && !error && searchData && searchData.results.length > 0 && (
          <div style={layoutStyles.resultsList}>
            <div style={layoutStyles.resultsHeader}>
              <h2 style={layoutStyles.resultsCount}>
                {searchData.results.length}{' '}
                {searchData.results.length === 1
                  ? 'restaurante encontrado'
                  : 'restaurantes encontrados'}
              </h2>
              <p style={layoutStyles.orderingHint}>
                {searchData.ordering === 'compatibility'
                  ? 'Ordenado por compatibilidade'
                  : 'Ordenado por nota'}
              </p>
            </div>

            {searchData.results.map((restaurant) => (
              <Card key={restaurant.id}>
                <CardTop>
                  <CardName>
                    <a href={`/restaurants/${restaurant.id}`}>{restaurant.name}</a>
                  </CardName>

                  {/* RN-C02 / Fluxo 1a: omite % quando compatibility for null */}
                  {restaurant.compatibility !== null && (
                    <CardMatch value={`${restaurant.compatibility}%`} label="compatível" />
                  )}
                </CardTop>

                <CardMeta>
                  <span>
                    {restaurant.neighborhood} • {restaurant.city}
                  </span>
                  <span>{formatPriceRange(restaurant.price_range)}</span>
                  <Rating value={restaurant.average_rating} />
                  {/* RF23: selo Novidade para aprovados há menos de 30 dias */}
                  {restaurant.is_new && <Badge variant="new">Novidade</Badge>}
                </CardMeta>

                {restaurant.matched_tags.length > 0 && (
                  <CardTags>
                    {restaurant.matched_tags.map((tag) => (
                      <Badge key={tag} variant="match">
                        {tag}
                      </Badge>
                    ))}
                  </CardTags>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default SearchPage