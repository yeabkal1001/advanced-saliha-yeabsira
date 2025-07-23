import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  popularSearches: string[];
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'wireless headphones',
    'laptop bag',
    'coffee beans'
  ]);

  const popularSearches = [
    'electronics',
    'clothing',
    'headphones',
    'laptop',
    'coffee',
    'plants',
    'accessories',
    'fitness watch'
  ];

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 10); // Keep only last 10 searches
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  return (
    <SearchContext.Provider value={{
      searchHistory,
      addToSearchHistory,
      clearSearchHistory,
      popularSearches
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};