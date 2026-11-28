import { useCallback, useEffect, useState } from 'react';
import {
  ApiError,
  getSearchOptions,
  searchRestaurants,
  type SearchFilters as FiltersType,
  type SearchOptionsResponse,
  type SearchResponse,
} from '../api/client';
import { SearchFilters } from '../components/SearchFilters';
import { EmptyState } from '../components/ui';
import styles from './SearchPage.module.css';
import { ResultList } from '../components/ResultList';

export function SearchPage() {
  const [options, setOptions] = useState<SearchOptionsResponse | null>(null);
  const [filters, setFilters] = useState<FiltersType>({});
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setOptionsError(null);

    try {
      const data = await getSearchOptions();
      setOptions(data);
    } catch {
      setOptionsError(
        'Não foi possível carregar as cidades e tags. Verifique se a API está rodando.'
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  async function executeSearch(criteria: FiltersType) {
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchRestaurants(criteria);
      setSearchResult(response);
      setHasSearched(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setSearchError(err.message);
      } else {
        setSearchError('Ocorreu um erro ao buscar restaurantes. Tente novamente.');
      }
    } finally {
      setIsSearching(false);
    }
  }

  // Fluxo 5a: se já existe uma busca ativa, mudar qualquer filtro refaz a pesquisa
  function handleFiltersChange(updatedFilters: FiltersType) {
    setFilters(updatedFilters);

    if (hasSearched) {
      executeSearch(updatedFilters);
    }
  }

  // Fluxo 5c: remove o critério sugerido quando não há resultados e refaz a busca
  /* Será usado ao integrar o ResultList do João Pedro, que chamará essa função quando o usuário clicar no botão de remover sugestão.
  function handleRemoveSuggestedFilter(fieldToRemove: string) {
    const updatedFilters = { ...filters };
    delete updatedFilters[fieldToRemove as keyof FiltersType];
    handleFiltersChange(updatedFilters);
  }
    */


  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Buscar restaurantes por contexto</h1>
        <p className={styles.subtitle}>
          Combine cidade, ocasião, vibe e estilo de culinária para encontrar o lugar certo para o momento.
        </p>
      </header>

      {isLoadingOptions && (
        <p className={styles.statusText}>Carregando opções de filtro...</p>
      )}

      {optionsError && (
        <EmptyState
          title="Erro ao carregar filtros"
          description={optionsError}
          action={{
            label: 'Tentar novamente',
            onClick: loadOptions,
          }}
        />
      )}

      {options && (
        <SearchFilters
          options={options}
          filters={filters}
          onChange={handleFiltersChange}
          onSearch={() => executeSearch(filters)}
          isLoading={isSearching}
        />
      )}

      {searchError && (
        <EmptyState
          title="Não foi possível concluir a busca"
          description={searchError}
          action={{
            label: 'Tentar novamente',
            onClick: () => executeSearch(filters),
          }}
        />
      )}  

      {/* Estado inicial antes da primeira busca */}
      {!hasSearched && !isSearching && !searchError && options && (
        <EmptyState
          title="O que você está planejando?"
          description="Selecione os critérios desejados acima ou clique em Buscar para listar todos os restaurantes disponíveis."
        />
      )}

      {/* Área de integração com os resultados */}
      {hasSearched && searchResult && !searchError && (
        <section className={styles.resultsSection} aria-live="polite">
          {hasSearched && searchResult && !searchError && (
            <section className={styles.resultsSection} aria-live="polite">
              <ResultList
                ordering={searchResult.ordering}
                results={searchResult.results}
              />
            </section>
          )}
          <p className={styles.statusText}>
            Ordenação: <strong>{searchResult.ordering}</strong> —{' '}
            {searchResult.results.length} restaurante(s) encontrado(s).
          </p>
        </section>
      )}
    </main>
  );
  
}