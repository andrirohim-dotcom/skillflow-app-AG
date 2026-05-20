import { adminClient } from "@/lib/supabase/admin";

async function getStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newThirtyDays },
    { data: recentSessions },
    { data: topSkills },
  ] = await Promise.all([
    adminClient.from("profiles").select("*", { count: "exact", head: true }),
    adminClient.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    adminClient.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    adminClient.from("learning_sessions").select("user_id").gte("date", sevenDaysAgo),
    adminClient.from("skill_progress").select("skill_name"),
  ]);

  const activeUsers = new Set((recentSessions ?? []).map((s: { user_id: string }) => s.user_id)).size;

  const skillCounts: Record<string, number> = {};
  (topSkills ?? []).forEach((r: { skill_name: string }) => {
    skillCounts[r.skill_name] = (skillCounts[r.skill_name] ?? 0) + 1;
  });
  const top5Skills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalUsers: totalUsers ?? 0,
    newToday: newToday ?? 0,
    newThirtyDays: newThirtyDays ?? 0,
    activeUsers,
    top5Skills,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Statistik real-time seluruh pengguna SkillFlow</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total User", value: stats.totalUsers, color: "text-sky-600" },
          { label: "Aktif 7 Hari", value: stats.activeUsers, color: "text-emerald-600" },
          { label: "Baru Hari Ini", value: stats.newToday, color: "text-violet-600" },
          { label: "Baru 30 Hari", value: stats.newThirtyDays, color: "text-orange-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Top 5 Skill Ditrack</h2>
        {stats.top5Skills.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada data skill.</p>
        ) : (
          <div className="space-y-3">
            {stats.top5Skills.map(([skill, count], i) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{skill}</span>
                    <span className="text-gray-400">{count} user</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-sky-400"
                      style={{ width: `${(count / (stats.top5Skills[0]?.[1] ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <a
          href="/admin/users"
          className="text-sm font-semibold text-sky-600 hover:text-sky-800 px-4 py-2 rounded-xl border border-sky-200 hover:border-sky-300 transition-colors"
        >
          Kelola Users →
        </a>
      </div>
    </div>
  );
}
