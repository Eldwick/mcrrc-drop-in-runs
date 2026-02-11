"use client";

import { useCallback } from "react";
import { useSeekerState } from "@/hooks/useSeekerState";
import { SearchControls } from "@/components/ui/SearchControls";
import { DynamicRunMap } from "@/components/map/DynamicRunMap";
import { RunCardList } from "@/components/ui/RunCardList";
import type { RunResponse, GeocodeResult, PaceRange } from "@/lib/types/run";

interface SeekerViewProps {
  runs: RunResponse[];
}

export const SeekerView = ({ runs }: SeekerViewProps) => {
  const { state, dispatch, rankedRuns, geocodeAddress } = useSeekerState(runs);

  const handleLocationQueryChange = useCallback(
    (query: string) => {
      dispatch({ type: "SET_LOCATION_QUERY", query });
    },
    [dispatch]
  );

  const handleSearch = useCallback(
    (query: string) => {
      geocodeAddress(query);
    },
    [geocodeAddress]
  );

  const handleSelectGeoResult = useCallback(
    (result: GeocodeResult) => {
      dispatch({
        type: "SET_USER_LOCATION",
        location: { lat: result.lat, lng: result.lng },
        displayName: result.displayName,
      });
    },
    [dispatch]
  );

  const handleClearLocation = useCallback(() => {
    dispatch({ type: "CLEAR_LOCATION" });
  }, [dispatch]);

  const handleSelectPace = useCallback(
    (pace: PaceRange) => {
      dispatch({ type: "SET_SELECTED_PACE", pace });
    },
    [dispatch]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      dispatch({
        type: "SET_USER_LOCATION",
        location: { lat, lng },
        displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    },
    [dispatch]
  );

  const handleMarkerClick = useCallback(
    (runId: number) => {
      dispatch({ type: "SELECT_RUN", runId });
      const el = document.getElementById(`run-card-${runId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [dispatch]
  );

  const handleCardSelect = useCallback(
    (runId: number) => {
      dispatch({ type: "SELECT_RUN", runId });
    },
    [dispatch]
  );

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-49px)]">
        <SearchControls
          locationQuery={state.locationQuery}
          onLocationQueryChange={handleLocationQueryChange}
          onSearch={handleSearch}
          geocodeResults={state.geocodeResults}
          isGeocoding={state.isGeocoding}
          geocodeError={state.geocodeError}
          onSelectGeoResult={handleSelectGeoResult}
          onClearLocation={handleClearLocation}
          hasLocation={state.userLocation !== null}
          selectedPace={state.selectedPace}
          onSelectPace={handleSelectPace}
        />
        <div className="flex-1 min-h-0">
          <DynamicRunMap
            runs={runs}
            userLocation={state.userLocation}
            selectedRunId={state.selectedRunId}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>
      <RunCardList
        runs={runs}
        rankedRuns={rankedRuns}
        selectedRunId={state.selectedRunId}
        onSelectRun={handleCardSelect}
      />
    </>
  );
};
