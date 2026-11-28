export interface FilterOption {
  id: number;
  name: string;
}

export interface SearchOptionsResponse {
  cities: FilterOption[];
  occasions: FilterOption[];
  vibes: FilterOption[];
  cuisines: FilterOption[];
  amenities: FilterOption[];
}

export interface SearchFilters {
  city_id?: number | null;
  occasions?: number[];
  vibes?: number[];
  cuisines?: number[];
  amenities?: number[];
  price_range?: number | null;
  min_rating?: number | null;
}

export interface RestaurantResult {
  id: number;
  name: string;
  city: string;
  neighborhood: string;
  price_range: number;
  average_rating: number;
  compatibility: number | null;
  matched_tags: string[];
  is_new: boolean;
}

export interface SearchSuggestion {
  remove: string;
  would_return: number;
}

export interface SearchResponse {
  ordering: 'compatibility' | 'rating';
  results: RestaurantResult[];
  suggestion: SearchSuggestion | null;
}

export interface ApiValidationError {
  error: string;
  fields: string[];
}

/** Formata a nota numérica (ex: 4.6 -> "4,6") para o componente Rating. */
export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',');
}