"use client";

import { useState } from "react";
import QuickCaptureModal from "./QuickCaptureModal";

export default function QuickCaptureFAB({ onRefresh }: { onRefresh: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-sky-200/50 hover:scale-110 active:scale-95 transition-all z-40 flex items-center justify-center text-2xl"
        title="Quick Capture (Insight / Action)"
      >
        <span>+</span>
      </button>

      {isOpen && (
        <QuickCaptureModal
          onClose={() => setIsOpen(false)}
          onSaved={() => {
            setIsOpen(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
