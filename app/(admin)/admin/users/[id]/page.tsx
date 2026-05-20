import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import UserActionButtons from "@/components/admin/UserActionButtons";

async function getUserDetail(id: string) {
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    adminClient.from("profiles").select("*").eq("id", id).single(),
    adminClient.auth.admin.getUserById(id),
  ]);

  if (!profile) return null;

  const [
    { count: totalSessions },
    { data: sessionsData },
    { count: totalSkills },
    { count: totalInsights },
  ] = await Promise.all([
    adminClient.from("learning_sessions").select("*", { count: "exact", head: true }).eq("user_id", id),
    adminClient.from("learning_sessions").select("duration_minutes").eq("user_id", id),
    adminClient.from("skill_progress").select("*", { count: "exact", head: true }).eq("user_id", id),
    adminClient.from("key_insights").select("*", { count: "exact", head: true }).eq("user_id", id),
  ]);

  const totalMinutes = (sessionsData ?? []).reduce(
    (sum: number, s: { duration_minutes: number }) => sum + (s.duration_minutes ?? 0),
    0
  );

  return {
    id: profile.id as string,
    name: profile.name as string,
    email: profile.email as string,
    avatar: (profile.avatar as string) ?? "🧑",
    bio: profile.bio as string | null,
    userRole: profile.user_role as string | null,
    focusAreas: (profile.focus_areas as string[]) ?? [],
    primaryGoal: profile.primary_goal as string | null,
    weeklyGoal: profile.weekly_goal as number | null,
    isAdmin: (profile.is_admin as boolean) ?? false,
    suspendedAt: profile.suspended_at as string | null,
    onboardingCompleted: (profile.onboarding_completed as boolean) ?? false,
    createdAt: profile.created_at as string,
    lastSignIn: authUser?.user?.last_sign_in_at ?? null,
    emailConfirmedAt: authUser?.user?.email_confirmed_at ?? null,
    stats: {
      totalSessions: totalSessions ?? 0,
      totalMinutes,
      totalSkills: totalSkills ?? 0,
      totalInsights: totalInsights ?? 0,
    },
  };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <a href="/admin/users" className="text-sm text-gray-400 hover:text-gray-600">← Semua Users</a>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-4xl">{user.avatar}</span>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            {user.name}
            {user.isAdmin && (
              <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Admin</span>
            )}
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
              user.suspendedAt ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {user.suspendedAt ? "Suspended" : "Aktif"}
            </span>
          </h1>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Profil</h2>
            <dl className="space-y-2 text-sm">
              {[
                { label: "Bio", value: user.bio },
                { label: "Peran", value: user.userRole },
                { label: "Tujuan", value: user.primaryGoal },
                { label: "Target Belajar", value: user.weeklyGoal ? `${user.weeklyGoal} menit/minggu` : null },
                { label: "Onboarding", value: user.onboardingCompleted ? "Selesai" : "Belum" },
                { label: "Email Verified", value: user.emailConfirmedAt ? new Date(user.emailConfirmedAt).toLocaleDateString("id-ID") : "Belum" },
                { label: "Bergabung", value: new Date(user.createdAt).toLocaleDateString("id-ID") },
                { label: "Last Login", value: user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString("id-ID") : "Belum pernah" },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex gap-2">
                  <dt className="w-32 text-gray-400 shrink-0">{label}</dt>
                  <dd className="text-gray-800 font-medium">{value}</dd>
                </div>
              ) : null)}
            </dl>
            {user.focusAreas.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {user.focusAreas.map((f) => (
                  <span key={f} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-lg border border-violet-100">{f}</span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Aktivitas Belajar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Sesi", value: user.stats.totalSessions, color: "text-sky-600" },
                { label: "Total Menit", value: user.stats.totalMinutes, color: "text-violet-600" },
                { label: "Skill Ditrack", value: user.stats.totalSkills, color: "text-emerald-600" },
                { label: "Insights", value: user.stats.totalInsights, color: "text-orange-600" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-gray-900 mb-4">Kelola Akun</h2>
          <UserActionButtons
            userId={user.id}
            isSuspended={!!user.suspendedAt}
            isAdmin={user.isAdmin}
          />
        </div>
      </div>
    </div>
  );
}
