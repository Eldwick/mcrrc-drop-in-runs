"use client";

import type { GeocodeResult } from "@/lib/types/run";

interface LocationSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  geocodeResults: GeocodeResult[];
  isGeocoding: boolean;
  geocodeError: string | null;
  onSelectResult: (result: GeocodeResult) => void;
  onClear: () => void;
  hasLocation: boolean;
}

export const LocationSearch = ({
  query,
  onQueryChange,
  onSearch,
  geocodeResults,
  isGeocoding,
  geocodeError,
  onSelectResult,
  onClear,
  hasLocation,
}: LocationSearchProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Pin icon prefix */}
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-purple">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.274 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Zip code or address"
            className="h-11 w-full rounded-md border border-gray-300 pl-9 pr-8 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
          />
          {hasLocation && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear location"
            >
              ✕
            </button>
          )}
          {isGeocoding && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <span className="text-sm text-gray-400">...</span>
            </div>
          )}
        </div>
      </form>

      {geocodeError && (
        <p className="mt-1 text-xs text-red-600">{geocodeError}</p>
      )}

      {geocodeResults.length > 0 && (
        <ul className="absolute left-0 right-0 z-[1000] mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {geocodeResults.map((result, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelectResult(result)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50"
              >
                {result.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
