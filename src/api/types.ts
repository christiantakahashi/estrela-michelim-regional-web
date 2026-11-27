/* Tipos do contrato da API — UC-C04 Buscar restaurantes por contexto. */

export type TagCategory = 'cuisine' | 'occasion' | 'vibe' | 'amenity'

export type CityOption = {
  id: number
  name: string
  state: string
}

export type TagOption = {
  id: number
  name: string
}

/** GET /api/v1/search_options */
export type SearchOptions = {
  cities: CityOption[]
  tags: Record<TagCategory, TagOption[]>
  price_ranges: number[]
  min_ratings: number[]
}

/** Critérios da busca. Todos opcionais (RN-C01). */
export type SearchCriteria = {
  city_id: number | null
  cuisines: number[]
  occasions: number[]
  vibes: number[]
  price_ranges: number[]
  min_rating: number | null
  amenities: number[]
}

/** Chave de um critério, como a API a devolve na sugestão do fluxo 5c. */
export type CriterionKey = keyof SearchCriteria

export type RestaurantResult = {
  id: number
  name: string
  city: string
  neighborhood: string
  price_range: number
  average_rating: number
  /** Nulo quando a busca não tem ocasião nem vibe (fluxo 1a). */
  compatibility: number | null
  matched_tags: string[]
  is_new: boolean
}

export type Ordering = 'compatibility' | 'rating'

/** Fluxo 5c: critério a remover e quantos restaurantes ele devolveria. */
export type SearchSuggestion = {
  remove: CriterionKey
  would_return: number
}

/** GET /api/v1/restaurants/search */
export type SearchResponse = {
  ordering: Ordering
  results: RestaurantResult[]
  suggestion: SearchSuggestion | null
}

/** Corpo da resposta 422. */
export type InvalidParams = {
  error: 'invalid_params'
  fields: string[]
}

export const EMPTY_CRITERIA: SearchCriteria = {
  city_id: null,
  cuisines: [],
  occasions: [],
  vibes: [],
  price_ranges: [],
  min_rating: null,
  amenities: [],
}

/** Rótulos dos critérios, para a mensagem do fluxo 5c. */
export const CRITERION_LABELS: Record<CriterionKey, string> = {
  city_id: 'cidade',
  cuisines: 'culinária',
  occasions: 'ocasião',
  vibes: 'vibe',
  price_ranges: 'preço',
  min_rating: 'nota mínima',
  amenities: 'comodidades',
}

/** Preço em cifrões, de $ a $$$$. */
export function formatPriceRange(range: number): string {
  return '$'.repeat(Math.min(Math.max(range, 1), 4))
}

/** Nota com uma casa decimal e vírgula, como na documentação: 4,6. */
export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',')
}
