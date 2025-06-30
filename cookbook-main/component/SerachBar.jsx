import { useState, useEffect, useCallback } from 'react';

export default function SearchBar({ placeholder = "Search...", onSearch, suggestions = [], loading = false }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length > 0 && suggestions.length > 0) {
      const filtered = suggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10); // Limit to 10 suggestions
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [query, suggestions]);

  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (searchTerm.trim()) {
            setIsLoading(true);
            onSearch(searchTerm.trim());
            setIsLoading(false);
          }
        }, 300); // 300ms delay
      };
    })(),
    [onSearch]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    debouncedSearch(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      onSearch(query.trim());
      setIsLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto relative search-container">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl focus-within:border-blue-400 focus-within:shadow-blue-500/25 transition-all duration-300 hover:shadow-xl">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-6 py-4 bg-transparent text-white placeholder-white/60 focus:outline-none font-medium text-lg"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(query.length > 0)}
            />
            {(isLoading || loading) && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {(isLoading || loading) ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Professional Search Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-6 py-4 hover:bg-white/10 transition-all duration-200 text-white font-medium border-b border-white/10 last:border-b-0 flex items-center space-x-3 group"
            >
              <svg className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="group-hover:text-blue-300 transition-colors">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading suggestions */}
      {showSuggestions && loading && filteredSuggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50 p-4">
          <div className="flex items-center justify-center space-x-3 text-white">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            <span className="font-medium">Loading suggestions...</span>
          </div>
        </div>
      )}

      {/* Search Tips */}
      {!query && !showSuggestions && !loading && (
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm font-medium">
            Try searching for: <span className="text-blue-300">pizza</span>, <span className="text-blue-300">cake</span>, <span className="text-blue-300">chicken</span>, <span className="text-blue-300">pasta</span>
          </p>
        </div>
      )}

      {/* Dynamic suggestions info */}
      {!query && !showSuggestions && !loading && suggestions.length > 0 && (
        <div className="mt-2 text-center">
          <p className="text-white/40 text-xs">
            Start typing to search recipes...
          </p>
        </div>
      )}

      {/* No suggestions available */}
      {!query && !showSuggestions && !loading && suggestions.length === 0 && (
        <div className="mt-2 text-center">
          <p className="text-white/40 text-xs">
            Search any recipe name - we'll find it for you!
          </p>
        </div>
      )}
    </div>
  );
}
