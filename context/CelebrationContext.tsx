"use client";

/**
 * CelebrationContext — global dopamine loop trigger system
 * Provides triggerCelebration() accessible from anywhere in the app.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CelebrationType =
  | "level_up"
  | "quest_complete"
  | "streak_7"
  | "streak_14"
  | "streak_30"
  | "streak_100"
  | "source_complete"
  | "first_action";

export interface CelebrationData {
  type: CelebrationType;
  emoji: string;
  title: string;
  subtitle: string;
  confettiColors: string[];
  xpReward?: number;
  goldReward?: number;
  extraLabel?: string;
}

export const CELEBRATION_CONFIGS: Record<CelebrationType, Omit<CelebrationData, "type">> = {
  level_up: {
    emoji: "🚀",
    title: "Level Up!",
    subtitle: "Slot skill baru terbuka — terus melaju!",
    confettiColors: ["#7C3AED", "#A78BFA", "#818CF8", "#C4B5FD"],
    xpReward: 0,
    goldReward: 50,
    extraLabel: "Selamat naik level! 🎊",
  },
  quest_complete: {
    emoji: "🏆",
    title: "Quest Selesai!",
    subtitle: "Kamu luar biasa, teruskan momentumnya!",
    confettiColors: ["#F59E0B", "#FCD34D", "#FBBF24", "#FDE68A"],
    xpReward: 50,
    goldReward: 100,
    extraLabel: "Weekly Quest tuntas! ⚔️",
  },
  streak_7: {
    emoji: "🔥",
    title: "7 Hari Streak!",
    subtitle: "Konsistensi adalah kuncinya. Jaga terus!",
    confettiColors: ["#EF4444", "#FCA5A5", "#F87171", "#FEE2E2"],
    xpReward: 30,
    goldReward: 25,
    extraLabel: "Streak 7 hari aktif! 🔥",
  },
  streak_14: {
    emoji: "🔥🔥",
    title: "14 Hari Streak!",
    subtitle: "Kamu sedang on fire! Tidak ada yang bisa menghentikanmu.",
    confettiColors: ["#EF4444", "#F97316", "#FCA5A5", "#FDBA74"],
    xpReward: 70,
    goldReward: 60,
    extraLabel: "2 minggu tanpa henti! 💥",
  },
  streak_30: {
    emoji: "⚡",
    title: "30 Hari Streak!",
    subtitle: "Maestro konsistensi! Sebulan penuh belajar tanpa putus.",
    confettiColors: ["#8B5CF6", "#06B6D4", "#A78BFA", "#22D3EE"],
    xpReward: 150,
    goldReward: 150,
    extraLabel: "Satu bulan solid! ⚡",
  },
  streak_100: {
    emoji: "💎",
    title: "100 Hari Streak!",
    subtitle: "LEGENDARY LEARNER! Kamu telah mencapai puncak konsistensi.",
    confettiColors: ["#F59E0B", "#EF4444", "#8B5CF6", "#10B981", "#06B6D4"],
    xpReward: 500,
    goldReward: 500,
    extraLabel: "100 hari LEGENDARY! 💎",
  },
  source_complete: {
    emoji: "📚",
    title: "Sumber Selesai!",
    subtitle: "Knowledge acquired! Pengetahuan baru telah tersimpan.",
    confettiColors: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"],
    xpReward: 100,
    goldReward: 80,
    extraLabel: "100% completed! 📖",
  },
  first_action: {
    emoji: "✅",
    title: "Aksi Pertama!",
    subtitle: "Momentum dimulai hari ini. Terus gerakkan roda belajarmu!",
    confettiColors: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
    xpReward: 15,
    goldReward: 10,
    extraLabel: "Aksi pertama hari ini! ✨",
  },
};

// ─── Context Shape ────────────────────────────────────────────────────────────

interface CelebrationContextValue {
  isVisible: boolean;
  celebrationData: CelebrationData | null;
  triggerCelebration: (type: CelebrationType, overrides?: Partial<CelebrationData>) => void;
  dismissCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissCelebration = useCallback(() => {
    setIsVisible(false);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    // Slight delay before clearing data so exit animation can play
    setTimeout(() => setCelebrationData(null), 400);
  }, []);

  const triggerCelebration = useCallback(
    (type: CelebrationType, overrides?: Partial<CelebrationData>) => {
      // Clear any pending dismissal
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      const config = CELEBRATION_CONFIGS[type];
      const data: CelebrationData = {
        type,
        ...config,
        ...overrides,
      };

      setCelebrationData(data);
      setIsVisible(true);

      // Auto-dismiss after 3.5s
      dismissTimerRef.current = setTimeout(() => {
        dismissCelebration();
      }, 3500);
    },
    [dismissCelebration]
  );

  return (
    <CelebrationContext.Provider
      value={{ isVisible, celebrationData, triggerCelebration, dismissCelebration }}
    >
      {children}
    </CelebrationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCelebration(): CelebrationContextValue {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error("useCelebration must be used inside <CelebrationProvider>");
  return ctx;
}
