import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';
import { isoToName, categoryColor } from '../../utils/formatters';
import { loadAllCountries, searchWeaponSystems } from '../../utils/dataLoader';

// Function to convert ISO code to flag emoji
const isoToFlag = (isoCode) => {
  if (!isoCode || isoCode.length !== 3) return '';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Function to get weapon category color
const getCategoryBgColor = (category) => {
  return categoryColor(category);
};

export default function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [countries, setCountries] = useState({});
  const [weapons, setWeapons] = useState([]);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const { setFocusedCountry, setSelectedWeapon } = useMapStore();

  // Load countries and weapons on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const countryData = await loadAllCountries();
        setCountries(countryData);
        const weaponData = await searchWeaponSystems('');
        setWeapons(weaponData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHighlightedIndex(-1);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const countryResults = [];
    const weaponResults = [];

    // Search countries
    for (const [iso, data] of Object.entries(countries)) {
      const name = data.name || isoToName(iso);
      if (name.toLowerCase().includes(lowerQuery) || iso.toLowerCase().includes(lowerQuery)) {
        countryResults.push({
          type: 'country',
          iso,
          name,
        });
        if (countryResults.length >= 8) break;
      }
    }

    // Search weapons
    weapons.forEach((w) => {
      if (weaponResults.length >= 8) return;
      if (w.name.toLowerCase().includes(lowerQuery)) {
        weaponResults.push({
          type: 'weapon',
          name: w.name,
          category: w.category,
        });
      }
    });

    // Combine results: countries first, then weapons, max 8 total
    const combined = [
      ...countryResults.slice(0, 8),
      ...weaponResults.slice(0, Math.max(0, 8 - countryResults.length)),
    ];

    setResults(combined);
    setHighlightedIndex(-1);
  }, [query, countries, weapons]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isExpanded || results.length === 0) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsExpanded(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectResult(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsExpanded(false);
        setQuery('');
        break;
      default:
        break;
    }
  };

  // Handle result selection
  const handleSelectResult = (result) => {
    if (result.type === 'country') {
      setFocusedCountry(result.iso);
    } else if (result.type === 'weapon') {
      setSelectedWeapon(result.name);
    }
    setIsExpanded(false);
    setQuery('');
    setHighlightedIndex(-1);
  };

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-result-index]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  // Count countries vs weapons
  const countryCount = results.filter((r) => r.type === 'country').length;
  const weaponCount = results.filter((r) => r.type === 'weapon').length;
  const hasCountries = countryCount > 0;
  const hasWeapons = weaponCount > 0;

  return (
    <div
      ref={containerRef}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
    >
      {/* Collapsed State */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-72 h-10 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-250 ease-out"
          style={{
            background: 'rgba(19, 22, 30, 0.85)',
            border: '1px solid #1e2330',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <span className="text-sm text-text-muted">Search countries or weapons...</span>
        </button>
      ) : (
        /* Expanded State */
        <div className="w-full">
          <div
            className="relative w-full rounded-full flex items-center px-4 py-2 transition-all duration-250 ease-out"
            style={{
              width: '520px',
              background: 'rgba(19, 22, 30, 0.85)',
              border: '1px solid #1e2330',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search countries or weapons..."
              className="flex-1 ml-2 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHighlightedIndex(-1);
                }}
                className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {results.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full mt-2 w-full left-1/2 transform -translate-x-1/2 rounded-lg border border-border shadow-lg overflow-hidden"
              style={{
                background: '#13161e',
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              {/* Countries Section */}
              {hasCountries && (
                <>
                  {hasWeapons && (
                    <div className="px-3 py-1.5 text-xs text-text-muted font-medium bg-[#0a0c10] border-b border-border">
                      Countries
                    </div>
                  )}
                  {results
                    .filter((r) => r.type === 'country')
                    .map((result, idx) => (
                      <div
                        key={`${result.iso}-${idx}`}
                        data-result-index={idx}
                        onClick={() => handleSelectResult(result)}
                        className="px-3 py-2.5 h-10 flex items-center gap-3 cursor-pointer transition-colors border-b border-[#0f1319] hover:bg-[#1a2035]"
                      >
                        <span className="text-lg flex-shrink-0">
                          {isoToFlag(result.iso)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text-primary truncate">
                            {result.name}
                          </div>
                        </div>
                        <span className="text-xs text-text-muted flex-shrink-0">
                          {result.iso}
                        </span>
                      </div>
                    ))}
                </>
              )}

              {/* Weapons Section */}
              {hasWeapons && (
                <>
                  {hasCountries && (
                    <div className="px-3 py-1.5 text-xs text-text-muted font-medium bg-[#0a0c10] border-b border-border">
                      Weapon Systems
                    </div>
                  )}
                  {results
                    .filter((r) => r.type === 'weapon')
                    .map((result, idx) => (
                      <div
                        key={`${result.name}-${idx}`}
                        data-result-index={countryCount + idx}
                        onClick={() => handleSelectResult(result)}
                        className="px-3 py-2.5 h-10 flex items-center gap-3 cursor-pointer transition-colors border-b border-[#0f1319] hover:bg-[#1a2035]"
                      >
                        <span className="text-lg flex-shrink-0">🛡</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text-primary truncate">
                            {result.name}
                          </div>
                        </div>
                        <div
                          className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                          style={{
                            backgroundColor: getCategoryBgColor(result.category) + '20',
                            color: getCategoryBgColor(result.category),
                            border: `1px solid ${getCategoryBgColor(result.category)}40`,
                          }}
                        >
                          {result.category}
                        </div>
                      </div>
                    ))}
                </>
              )}

              {/* No Results */}
              {results.length === 0 && query.trim() && (
                <div className="px-3 py-4 text-center text-sm text-text-muted">
                  No matches found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
