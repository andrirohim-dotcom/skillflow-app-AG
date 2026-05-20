import { adminClient } from "@/lib/supabase/admin";

async function getAllUsers() {
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, name, email, avatar, is_admin, suspended_at, created_at")
    .order("created_at", { ascending: false });

  const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const authMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.last_sign_in_at])
  );

  const { data: sessions } = await adminClient
    .from("learning_sessions")
    .select("user_id, duration_minutes");
  const { data: skillRows } = await adminClient
    .from("skill_progress")
    .select("user_id");

  const sessionsByUser = new Map<string, { count: number; minutes: number }>();
  (sessions ?? []).forEach((s: { user_id: string; duration_minutes: number }) => {
    const cur = sessionsByUser.get(s.user_id) ?? { count: 0, minutes: 0 };
    sessionsByUser.set(s.user_id, { count: cur.count + 1, minutes: cur.minutes + s.duration_minutes });
  });

  const skillsByUser = new Map<string, number>();
  (skillRows ?? []).forEach((r: { user_id: string }) => {
    skillsByUser.set(r.user_id, (skillsByUser.get(r.user_id) ?? 0) + 1);
  });

  return (profiles ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    email: p.email as string,
    avatar: (p.avatar as string) ?? "🧑",
    isAdmin: (p.is_admin as boolean) ?? false,
    suspendedAt: p.suspended_at as string | null,
    createdAt: p.created_at as string,
    lastSignIn: authMap.get(p.id as string) ?? null,
    totalSessions: sessionsByUser.get(p.id as string)?.count ?? 0,
    totalMinutes: sessionsByUser.get(p.id as string)?.minutes ?? 0,
    skillsTracked: skillsByUser.get(p.id as string) ?? 0,
  }));
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-1">{users.length} user terdaftar</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Daftar</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Last Login</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Sesi</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Menit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Skill</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{user.avatar}</span>
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-1">
                        {user.name}
                        {user.isAdmin && (
                          <span className="text-xs font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">Admin</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    user.suspendedAt
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {user.suspendedAt ? "Suspended" : "Aktif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.lastSignIn
                    ? new Date(user.lastSignIn).toLocaleDateString("id-ID")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{user.totalSessions}</td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{user.totalMinutes}</td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{user.skillsTracked}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/admin/users/${user.id}`}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                  >
                    Detail →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
