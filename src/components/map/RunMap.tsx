"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { RunResponse } from "@/lib/types/run";

const DEFAULT_CENTER: [number, number] = [39.14, -77.15];
const DEFAULT_ZOOM = 11;

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RunMapProps {
  runs: RunResponse[];
}

export const RunMap = ({ runs }: RunMapProps) => {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {runs.map((run) => (
        <Marker
          key={run.id}
          position={[run.latitude, run.longitude]}
          icon={markerIcon}
        >
          <Popup>
            <div className="min-w-[180px]">
              <Link
                href={`/runs/${run.id}`}
                className="text-base font-semibold text-blue-700 hover:underline"
              >
                {run.name}
              </Link>
              <p className="mt-1 text-sm text-gray-600">
                {run.dayOfWeek}s at {run.startTime}
              </p>
              <p className="text-sm text-gray-600">{run.terrain}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
