"use client";

import { useState } from "react";
import SourceProgressList from "./SourceProgressList";
import AddSourceForm from "@/components/sources/AddSourceForm";

/**
 * Coordinates the two interactive panels on the dashboard:
 * - SourceProgressList reads from localStorage
 * - AddSourceForm writes to localStorage
 *
 * refreshKey increments on each save, causing SourceProgressList to re-read.
 */
export default function LearningHub() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SourceProgressList refreshKey={refreshKey} />
      <AddSourceForm onSaved={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
