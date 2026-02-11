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
      <form onSubmit={handleSubmit} className="flex gap-1">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Enter address or zip code"
            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
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
        </div>
        <button
          type="submit"
          disabled={isGeocoding || !query.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-orange text-white hover:bg-brand-orange-dark disabled:bg-gray-300"
          aria-label="Search location"
        >
          {isGeocoding ? (
            <span className="text-sm">...</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
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
