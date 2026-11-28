const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export * from '../api/types';

// 1. Tipos do Contrato (Front <-> API Rails)

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
  /** Porcentagem de compatibilidade (0 a 100) ou null quando ordenado por nota (Fluxo 1a) */
  compatibility: number | null;
  matched_tags: string[];
  /** Selo "Novidade" para restaurantes aprovados há menos de 30 dias (RF23) */
  is_new: boolean;
}

export interface SearchSuggestion {
  /** Nome do filtro sugerido para remoção no Fluxo 5c (ex: "amenities") */
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


// 2. Tratamento de Erros da API

export class ApiError extends Error {
  status: number;
  fields?: string[];

  constructor(message: string, status: number, fields?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  // Trata erro 422 (parâmetro inválido, ex: city_id inexistente)
  if (response.status === 422) {
    const errorData = (await response.json()) as ApiValidationError;
    throw new ApiError(
      errorData.error || 'Parâmetros de busca inválidos.',
      422,
      errorData.fields
    );
  }

  throw new ApiError(
    `Erro na comunicação com o servidor (HTTP ${response.status}).`,
    response.status
  );
}


// 3. Montagem da Query String (RN-C01 e formato Rails)

function buildSearchQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();

  // RN-C01: filtros vazios, nulos ou undefined são ignorados
  if (filters.city_id !== undefined && filters.city_id !== null) {
    params.append('city_id', String(filters.city_id));
  }

  if (filters.price_range !== undefined && filters.price_range !== null) {
    params.append('price_range', String(filters.price_range));
  }

  if (filters.min_rating !== undefined && filters.min_rating !== null) {
    params.append('min_rating', String(filters.min_rating));
  }

  // O Rails espera arrays no formato chave[]=valor (ex: occasions[]=8&vibes[]=13)
  const arrayFields: Array<keyof Pick<SearchFilters, 'occasions' | 'vibes' | 'cuisines' | 'amenities'>> = [
    'occasions',
    'vibes',
    'cuisines',
    'amenities',
  ];

  for (const field of arrayFields) {
    const values = filters[field];
    if (values && values.length > 0) {
      for (const id of values) {
        params.append(`${field}[]`, String(id));
      }
    }
  }

  return params.toString();
}


// 4. Funções de Chamada aos Endpoints (UC-C04)
/**
 * Busca cidades e tags disponíveis para preencher os filtros da tela.
 * Endpoint: GET /api/v1/search_options
 */

export async function getSearchOptions(): Promise<SearchOptionsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/search_options`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<SearchOptionsResponse>(response);
}

/**
 * Busca restaurantes conforme os critérios selecionados pelo usuário.
 * Endpoint: GET /api/v1/restaurants/search
 */
export async function searchRestaurants(
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const queryString = buildSearchQueryString(filters);
  const url = queryString
    ? `${API_BASE_URL}/api/v1/restaurants/search?${queryString}`
    : `${API_BASE_URL}/api/v1/restaurants/search`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<SearchResponse>(response);
}