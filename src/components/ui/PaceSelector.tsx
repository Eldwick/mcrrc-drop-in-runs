"use client";

import { PACE_RANGE_LABELS } from "@/lib/types/run";
import type { PaceRange } from "@/lib/types/run";

const paceRangeKeys: PaceRange[] = ["sub_8", "8_to_9", "9_to_10", "10_plus"];

interface PaceSelectorProps {
  selectedPace: PaceRange | null;
  onSelectPace: (pace: PaceRange) => void;
}

export const PaceSelector = ({ selectedPace, onSelectPace }: PaceSelectorProps) => {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        Your pace (min/mile)
      </label>
      <div className="grid grid-cols-4 gap-1">
        {paceRangeKeys.map((pace) => (
          <button
            key={pace}
            type="button"
            onClick={() => onSelectPace(pace)}
            className={`rounded-md px-2 py-2 text-xs font-medium transition-colors ${
              selectedPace === pace
                ? "bg-brand-purple text-white"
                : "bg-brand-gray text-gray-600 hover:bg-gray-200"
            }`}
          >
            {PACE_RANGE_LABELS[pace]}
          </button>
        ))}
      </div>
    </div>
  );
};
