// Extracted from SkillInput.tsx — domain logic lives here, not in UI

const DEFAULT_PLAN = [
  "Baca & pahami konsep dasar",
  "Catat poin-poin penting",
  "Buat rangkuman singkat",
  "Praktikkan dalam proyek nyata",
  "Bagikan kepada orang lain",
];

const PLANS: { keywords: string[]; steps: string[] }[] = [
  {
    keywords: ["code", "program", "develop", "coding", "pemrograman"],
    steps: [
      "Pelajari sintaks dasar",
      "Ikuti tutorial hands-on",
      "Bangun proyek latihan kecil",
      "Review & refactor kode",
      "Kontribusi ke proyek nyata",
    ],
  },
  {
    keywords: ["design", "ui", "ux", "desain", "visual"],
    steps: [
      "Pelajari prinsip desain visual",
      "Analisis desain produk favorit",
      "Buat wireframe / mockup",
      "Uji dengan pengguna nyata",
      "Bangun portofolio desain",
    ],
  },
  {
    keywords: ["bisnis", "business", "marketing", "strategi", "strategy"],
    steps: [
      "Pahami konsep inti dari sumber",
      "Identifikasi studi kasus relevan",
      "Terapkan 1 strategi minggu ini",
      "Ukur hasil & evaluasi",
      "Iterasi berdasarkan feedback",
    ],
  },
  {
    keywords: ["komunikasi", "public", "speaking", "presentasi"],
    steps: [
      "Rekam diri sendiri berbicara",
      "Latih struktur pesan utama",
      "Praktik di depan cermin / teman",
      "Ikuti 1 forum diskusi publik",
      "Minta feedback jujur dari orang lain",
    ],
  },
  {
    keywords: ["menulis", "writing", "tulis", "artikel", "konten"],
    steps: [
      "Tulis draft tanpa sensor",
      "Edit & perbaiki alur cerita",
      "Baca keras untuk cek ritme",
      "Publikasikan di 1 platform",
      "Kumpulkan feedback pembaca",
    ],
  },
  {
    keywords: ["habit", "kebiasaan", "konsistensi", "produktif", "produktivitas"],
    steps: [
      "Identifikasi pemicu & rutinitas",
      "Mulai dengan versi 2 menit",
      "Lacak kebiasaan selama 7 hari",
      "Evaluasi hambatan yang muncul",
      "Tingkatkan intensitas secara bertahap",
    ],
  },
  {
    keywords: ["fokus", "focus", "konsentrasi", "deep work", "manajemen waktu"],
    steps: [
      "Identifikasi jam paling produktif",
      "Blokir 1 sesi fokus deep work/hari",
      "Matikan notifikasi selama sesi",
      "Catat distraksi yang muncul",
      "Evaluasi output setiap akhir minggu",
    ],
  },
  {
    keywords: ["ekonomi", "economics", "behavioral", "bias kognitif", "psikologi", "psychology", "decision", "keputusan"],
    steps: [
      "Pahami konsep dan bias utama dari sumber ini",
      "Identifikasi 1 bias yang sering kamu alami sendiri",
      "Catat 1 keputusan nyata yang terpengaruh bias minggu ini",
      "Rancang sistem pre-commitment untuk keputusan penting",
      "Evaluasi keputusan mingguan dengan framework ini",
    ],
  },
  {
    keywords: ["kepemimpinan", "leadership", "manajemen", "management", "team", "tim"],
    steps: [
      "Identifikasi gaya kepemimpinanmu saat ini",
      "Pelajari 1 framework manajemen dari sumber ini",
      "Terapkan dalam konteks tim atau proyek nyata",
      "Minta feedback jujur dari rekan atau bawahan",
      "Buat rencana pengembangan diri kepemimpinan 90 hari",
    ],
  },
  {
    keywords: ["investasi", "investment", "keuangan", "financial", "finance"],
    steps: [
      "Pahami konsep dasar dan terminologi keuangan",
      "Buat atau review anggaran & aset pribadi saat ini",
      "Identifikasi 1 instrumen investasi yang relevan",
      "Simulasikan skenario investasi kecil dengan data nyata",
      "Evaluasi portofolio dan pelajari dari hasilnya",
    ],
  },
  {
    keywords: ["kreativitas", "creativity", "inovasi", "innovation", "kreatif"],
    steps: [
      "Latih observasi: catat 3 hal menarik tiap hari selama seminggu",
      "Brainstorm 10+ ide tanpa filter untuk 1 masalah nyata",
      "Pilih 1 ide terbaik dan buat prototipe kasar",
      "Uji ide dengan 3 orang berbeda dan catat responnya",
      "Iterasi berdasarkan feedback & dokumentasikan prosesnya",
    ],
  },
];

export function generateActionPlan(skill: string, bookTitle?: string): string[] {
  const s = skill.toLowerCase();
  const b = (bookTitle ?? "").toLowerCase();
  for (const { keywords, steps } of PLANS) {
    if (keywords.some((kw) => s.includes(kw) || b.includes(kw))) return steps;
  }
  return DEFAULT_PLAN;
}
