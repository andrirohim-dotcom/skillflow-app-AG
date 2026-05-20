# SkillFlow — Multi-User Auth & Admin Panel Design

**Date:** 2026-04-27  
**Status:** Approved  
**Scope:** Authentication system (Supabase), user profile storage, super-admin panel

---

## 1. Keputusan Desain

| Keputusan | Pilihan |
|---|---|
| Backend | Supabase Full (Auth + PostgreSQL) |
| Auth method | Email + Password (arsitektur siap OAuth) |
| Admin scope | Super Admin platform — kelola semua user |
| Admin placement | `/admin` di app yang sama, layout terpisah |
| Migrasi data lama | Tidak — mulai fresh, localStorage diabaikan |
| Registrasi | Email + Nama + Password, email verification wajib |

---

## 2. Arsitektur Keseluruhan

```
Browser
  │
  ├── Next.js App
  │     ├── (auth)/login          → form login
  │     ├── (auth)/register       → form registrasi
  │     ├── (auth)/verify-email   → instruksi verifikasi
  │     ├── (dashboard)/dashboard/...  → app belajar (existing, diproteksi auth)
  │     └── (admin)/admin/...     → panel admin (layout terpisah)
  │
  └── Supabase
        ├── Auth      → JWT, session cookie, email verification
        ├── PostgreSQL → profiles, learning data
        └── RLS       → user hanya akses datanya sendiri
```

**Middleware (`middleware.ts`):**
- `/dashboard/*` → wajib login, redirect `/login` kalau belum auth
- `/admin/*` → wajib login + `is_admin = true`, redirect `/dashboard` kalau bukan admin
- `/login`, `/register` → redirect `/dashboard` kalau sudah login

**Supabase Clients:**
- `lib/supabase/client.ts` → browser client (`createBrowserClient`)
- `lib/supabase/server.ts` → server client (`createServerClient`, baca cookies)
- `lib/supabase/admin.ts` → service role client (bypass RLS, hanya di server admin routes)

---

## 3. Skema Database

### `profiles` (extends auth.users)
```sql
CREATE TABLE profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 text NOT NULL,
  name                  text NOT NULL DEFAULT 'User Baru',
  avatar                text DEFAULT '🧑',
  bio                   text,
  user_role             text CHECK (user_role IN ('pelajar','profesional','entrepreneur','developer')),
  focus_areas           text[] DEFAULT '{}',
  primary_goal          text,
  weekly_goal           int,
  gamification_mode     text DEFAULT 'standard',
  onboarding_completed  boolean DEFAULT false,
  is_admin              boolean DEFAULT false,
  suspended_at          timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
```

### `learning_sources`
```sql
CREATE TABLE learning_sources (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            text NOT NULL,
  creator_name     text,
  url              text,
  topic_tags       text[] DEFAULT '{}',
  skill_targets    text[] DEFAULT '{}',
  progress         jsonb NOT NULL,
  status           text DEFAULT 'not_started',
  difficulty_level text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
```

### `learning_sessions`
```sql
CREATE TABLE learning_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_id        uuid REFERENCES learning_sources(id) ON DELETE SET NULL,
  date             date NOT NULL,
  duration_minutes int NOT NULL,
  notes            text,
  created_at       timestamptz DEFAULT now()
);
```

### `skill_progress`
```sql
CREATE TABLE skill_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_id    uuid REFERENCES learning_sources(id) ON DELETE SET NULL,
  skill_name   text NOT NULL,
  category     text,
  level        text DEFAULT 'awareness',
  evidence     text,
  action_items jsonb[] DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
```

### `key_insights`
```sql
CREATE TABLE key_insights (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_id  uuid REFERENCES learning_sources(id) ON DELETE SET NULL,
  type       text,
  quote      text NOT NULL,
  reflection text,
  tags       text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

### Row Level Security
```sql
-- Aktifkan RLS di semua tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_insights ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya akses datanya sendiri
CREATE POLICY "user_own_data" ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "user_own_data" ON learning_sources FOR ALL USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON learning_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON skill_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON key_insights FOR ALL USING (user_id = auth.uid());
```

### Database Trigger (auto-create profile)
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User Baru')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 4. Halaman Auth

### Komponen Baru
- `app/(auth)/layout.tsx` — layout minimal tanpa sidebar (logo + centered card)
- `app/(auth)/login/page.tsx` — LoginForm
- `app/(auth)/register/page.tsx` — RegisterForm
- `app/(auth)/verify-email/page.tsx` — halaman statis instruksi cek inbox
- `components/auth/LoginForm.tsx` — email + password + link ke register
- `components/auth/RegisterForm.tsx` — nama + email + password + konfirmasi

### Flow Register
1. User isi nama, email, password → submit
2. `supabase.auth.signUp()` dipanggil (dengan `name` di `options.data`)
3. Supabase kirim email verifikasi
4. Redirect ke `/verify-email`
5. User klik link → Supabase verifikasi → redirect ke `/dashboard`
6. Trigger database buat baris `profiles` otomatis

### Flow Login
1. User isi email + password → submit
2. `supabase.auth.signInWithPassword()` dipanggil
3. Supabase set session cookie (HttpOnly)
4. Middleware validasi → redirect ke `/dashboard`
5. Kalau `is_admin = true` dan user akses `/admin` → diizinkan

### AuthContext (`lib/contexts/AuthContext.tsx`)
```ts
interface AuthContextValue {
  user: User | null;           // Supabase auth user
  profile: Profile | null;     // data dari tabel profiles
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}
```

Menggantikan `AccountContext`. Expose `useAuth()` hook.

---

## 5. Panel Admin

### Route Structure
```
app/(admin)/
├── layout.tsx              ← sidebar admin (berbeda dari dashboard)
└── admin/
    ├── page.tsx            → /admin — overview platform
    ├── users/
    │   ├── page.tsx        → /admin/users — tabel semua user
    │   └── [id]/page.tsx   → /admin/users/[id] — detail + aksi user
    └── settings/page.tsx   → /admin/settings — kelola akun admin
```

### `/admin` — Overview Platform
Metrics yang ditampilkan:
- Total user terdaftar
- User aktif 7 hari terakhir (punya learning_session dalam 7 hari)
- User baru hari ini / 30 hari terakhir
- Total sesi belajar platform
- Top 5 skill paling banyak ditrack (aggregate dari skill_progress)

Semua query via server component menggunakan **service role client** (bypass RLS).

### `/admin/users` — Tabel User

Kolom tabel:
| Kolom | Source |
|---|---|
| Avatar + Nama | profiles |
| Email | profiles |
| Status | Aktif / Suspended (dari `suspended_at`) |
| Tanggal Daftar | profiles.created_at |
| Last Login | `auth.users.last_sign_in_at` |
| Total Sesi | COUNT(learning_sessions) |
| Menit Belajar | SUM(duration_minutes) |
| Skill Ditrack | COUNT(skill_progress) |
| Aksi | Lihat · Suspend · Hapus |

Filter: Status · Sort: tanggal daftar, last login, total sesi

### `/admin/users/[id]` — Detail User

Tampilan:
- **Profil:** nama, email, avatar, bio, user_role, focus_areas, weekly_goal
- **Statistik:** streak saat ini, total sesi, total menit, insights, action items selesai
- **Aksi akun:**
  - **Suspend** → set `suspended_at = now()`, middleware tolak login
  - **Aktifkan** → set `suspended_at = null`
  - **Jadikan Admin** → set `is_admin = true`
  - **Cabut Admin** → set `is_admin = false`
  - **Hapus Akun** → hapus dari `auth.users` (CASCADE ke semua tabel), konfirmasi modal

### Akses Admin ke Data
- Server Components di `/admin/*` menggunakan `SUPABASE_SERVICE_ROLE_KEY`
- Key ini hanya di environment server (tidak pernah ke client)
- Suspend dihandle middleware: cek `suspended_at` saat validasi session

### Sidebar Admin (komponen baru)
```
┌─────────────────┐
│  SkillFlow Admin│
├─────────────────┤
│ 📊 Overview     │
│ 👥 Users        │
│ ⚙️  Settings    │
├─────────────────┤
│ ← Kembali ke App│
└─────────────────┘
```

---

## 6. Refactoring Kode yang Ada

### Yang Dihapus
- `lib/contexts/AccountContext.tsx` → diganti `AuthContext`
- `lib/accountStorage.ts` → diganti Supabase data layer
- `components/account/AccountSwitcher.tsx` → tidak relevan

### Data Layer Baru (signature mirip yang lama)
```
lib/db/
├── sources.ts      → getSources, saveSource, updateSource, deleteSource
├── sessions.ts     → getSessions, saveSession
├── skillProgress.ts → getSkillProgress, saveSkillProgress, updateSkillProgress
├── insights.ts     → getInsights, saveInsight, deleteInsight
└── profile.ts      → getProfile, updateProfile
```

Setiap fungsi wrap Supabase query, dengan return type yang sama dengan fungsi localStorage lama. Komponen tidak perlu tahu bedanya.

### Yang Tidak Berubah
- Semua komponen UI di `components/dashboard/`, `components/pages/`, `components/source-detail/`
- Semua utils: `analytics.ts`, `recommendations.ts`, `gamification.ts`, `onboarding.ts`
- Semua tipe di `lib/types.ts`, `lib/accountTypes.ts`
- Routing di `app/dashboard/`

---

## 7. Environment Variables yang Dibutuhkan

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # hanya server-side, jangan expose ke client
```

---

## 8. Urutan Implementasi

1. Setup Supabase project + buat tabel + RLS + trigger
2. Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`
3. Buat Supabase client helpers (`lib/supabase/`)
4. Buat middleware auth protection
5. Buat `AuthContext` + `useAuth()` hook
6. Buat halaman auth: login, register, verify-email
7. Buat data layer baru (`lib/db/`)
8. Refactor komponen dashboard (ganti `useAccount` → `useAuth`, ganti storage calls)
9. Buat layout + halaman admin
10. Testing end-to-end: register → login → dashboard → admin panel

---

## 9. Bootstrap Admin Pertama

Admin pertama tidak bisa di-set lewat UI (tidak ada yang bisa meng-adminkan dirinya sendiri). Cara set admin pertama setelah deploy:

1. Daftar akun biasa via `/register`
2. Buka **Supabase Dashboard → Table Editor → profiles**
3. Cari baris dengan email admin, set `is_admin = true`
4. Atau via SQL Editor: `UPDATE profiles SET is_admin = true WHERE email = 'admin@example.com';`

Selanjutnya, admin yang sudah ada bisa jadikan user lain admin via UI `/admin/users/[id]`.

---

## 10. Yang Tidak Termasuk Scope Ini

- OAuth (Google/GitHub) — arsitektur siap, tinggal enable di Supabase dashboard
- Real-time collaboration antar user
- Email notifikasi dari admin ke user
- Workspace/tim fitur (sudah ada draft di `types.multiuser.ts`, scope terpisah)
- Export data user (bisa ditambah di iterasi berikutnya)
