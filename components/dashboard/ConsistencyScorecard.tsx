import type { DayActivity } from "@/lib/utils/analytics";

interface Props {
  weeklyActivity: DayActivity[];
  currentStreak: number;
  longestStreak: number;
  weeklyMinutes: number;
}

function intensityClass(minutes: number): string {
  if (minutes === 0) return "bg-gray-100 border-gray-200";
  if (minutes < 20) return "bg-sky-200 border-sky-300";
  if (minutes < 45) return "bg-sky-400 border-sky-500";
  return "bg-sky-600 border-sky-700";
}

function intensityLabel(minutes: number): string {
  if (minutes === 0) return "Tidak ada aktivitas";
  if (minutes < 20) return `${minutes} menit — ringan`;
  if (minutes < 45) return `${minutes} menit — sedang`;
  return `${minutes} menit — intensif`;
}

export default function ConsistencyScorecard({
  weeklyActivity,
  currentStreak,
  longestStreak,
  weeklyMinutes,
}: Props) {
  const activeDays = weeklyActivity.filter((d) => d.minutes > 0).length;
  const bestDay = weeklyActivity.reduce(
    (best, d) => (d.minutes > best.minutes ? d : best),
    weeklyActivity[0]
  );

  const hasActivity = weeklyMinutes > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Konsistensi Minggu Ini</h2>
          {hasActivity && (
            <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
              {activeDays}/7 hari aktif
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* 7-day activity grid */}
        <div className="flex gap-2 mb-4">
          {weeklyActivity.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                title={intensityLabel(day.minutes)}
                className={`w-full aspect-square rounded-lg border transition-all ${intensityClass(day.minutes)} ${
                  day.isToday ? "ring-2 ring-sky-400 ring-offset-1" : ""
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  day.isToday ? "text-sky-600" : "text-gray-400"
                }`}
              >
                {day.label}
              </span>
              {day.minutes > 0 && (
                <span className="text-xs text-gray-400 leading-none">
                  {day.minutes}m
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-gray-400">Intensitas:</span>
          {[
            { label: "–", cls: "bg-gray-100 border-gray-200" },
            { label: "<20m", cls: "bg-sky-200 border-sky-300" },
            { label: "<45m", cls: "bg-sky-400 border-sky-500" },
            { label: "45m+", cls: "bg-sky-600 border-sky-700" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded border ${l.cls}`} />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        {hasActivity ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Minggu Ini",
                value: `${weeklyMinutes}m`,
                sub: `${Math.round(weeklyMinutes / activeDays)}m rata-rata/hari`,
              },
              {
                label: "Hari Terbaik",
                value: bestDay.label,
                sub: `${bestDay.minutes} menit`,
              },
              {
                label: "Streak Sekarang",
                value: `${currentStreak} hari`,
                sub: `terpanjang: ${longestStreak} hari`,
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-base font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-sky-700">Belum ada sesi minggu ini</p>
            <p className="text-xs text-sky-500 mt-1">
              Catat sesi belajar pertama Anda untuk mulai membangun streak!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
