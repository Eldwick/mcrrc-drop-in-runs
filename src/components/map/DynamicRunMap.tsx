"use client";

import dynamic from "next/dynamic";
import type { RunResponse } from "@/lib/types/run";

const RunMap = dynamic(
  () => import("./RunMap").then((mod) => mod.RunMap),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

const MapPlaceholder = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="text-gray-500">Loading map...</p>
    </div>
  );
};

interface DynamicRunMapProps {
  runs: RunResponse[];
}

export const DynamicRunMap = ({ runs }: DynamicRunMapProps) => {
  return <RunMap runs={runs} />;
};
