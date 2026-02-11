"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useSeekerState } from "@/hooks/useSeekerState";
import { FloatingSearchBar } from "@/components/ui/FloatingSearchBar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DynamicRunMap } from "@/components/map/DynamicRunMap";
import { RunCardList } from "@/components/ui/RunCardList";
import type { RunResponse, GeocodeResult, PaceRange, RankedRun } from "@/lib/types/run";

type SnapState = "collapsed" | "half" | "full";

interface SeekerViewProps {
  runs: RunResponse[];
}

function getSummaryText(
  rankedRuns: RankedRun[] | null,
  runs: RunResponse[]
): string {
  if (rankedRuns === null) return `${runs.length} runs nearby`;
  if (rankedRuns.length === 0) return "No matching runs";
  return `${rankedRuns.length} runs found`;
}

export const SeekerView = ({ runs }: SeekerViewProps) => {
  const { state, dispatch, rankedRuns, geocodeAddress } = useSeekerState(runs);
  const [sheetState, setSheetState] = useState<SnapState>("collapsed");

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
      if (sheetState === "collapsed") {
        setSheetState("half");
      }
      setTimeout(() => {
        const el = document.getElementById(`run-card-${runId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
    },
    [dispatch, sheetState]
  );

  const handleCardSelect = useCallback(
    (runId: number) => {
      dispatch({ type: "SELECT_RUN", runId });
    },
    [dispatch]
  );

  return (
    <>
      {/* Layer 1: Full-screen map */}
      <div className="fixed inset-0 z-0">
        <DynamicRunMap
          runs={runs}
          userLocation={state.userLocation}
          selectedRunId={state.selectedRunId}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Layer 2: Floating search bar */}
      <FloatingSearchBar
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
        locationDisplayName={
          state.userLocation ? state.locationQuery : null
        }
      />

      {/* Layer 3: Bottom sheet with cards */}
      <BottomSheet
        snapState={sheetState}
        onSnapStateChange={setSheetState}
        summary={getSummaryText(rankedRuns, runs)}
      >
        <RunCardList
          runs={runs}
          rankedRuns={rankedRuns}
          selectedRunId={state.selectedRunId}
          onSelectRun={handleCardSelect}
        />
      </BottomSheet>

      {/* Layer 4: Floating "Add a Run" button */}
      <Link
        href="/runs/new"
        className="fixed right-4 top-4 z-20 rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-orange"
      >
        + Add a Run
      </Link>
    </>
  );
};
