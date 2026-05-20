// ─── Topic Taxonomy ───────────────────────────────────────────────────────────
// Daftar topik terstandarisasi dikelompokkan per kategori.
// Digunakan sebagai sumber data untuk TagPicker di AddSourceForm dan OnboardingFlow.

export interface TopicCategory {
  key: string;
  name: string;   // Nama kategori dalam Bahasa Indonesia
  emoji: string;
  topics: string[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    key: "produktivitas",
    name: "Produktivitas",
    emoji: "⚡",
    topics: [
      "Manajemen Waktu",
      "Deep Work",
      "Habit Formation",
      "Fokus",
      "Rutinitas",
      "Sistem Produktif",
      "GTD",
      "Time Blocking",
      "Manajemen Energi",
      "Prokrastinasi",
    ],
  },
  {
    key: "bisnis",
    name: "Bisnis",
    emoji: "💼",
    topics: [
      "Strategi Bisnis",
      "Model Bisnis",
      "Startup",
      "Marketing",
      "Manajemen",
      "Operasional",
      "Negosiasi",
      "Growth Hacking",
      "Sales",
      "B2B",
    ],
  },
  {
    key: "leadership",
    name: "Leadership",
    emoji: "🧭",
    topics: [
      "Kepemimpinan",
      "Manajemen Tim",
      "Coaching",
      "Delegasi",
      "Feedback",
      "Motivasi Tim",
      "Culture Building",
      "Visi",
      "Manajemen Konflik",
      "Pengambilan Keputusan",
    ],
  },
  {
    key: "teknologi",
    name: "Teknologi",
    emoji: "💻",
    topics: [
      "Pemrograman",
      "Arsitektur Sistem",
      "AI & ML",
      "Data Science",
      "Web Development",
      "DevOps",
      "Cloud",
      "Keamanan Siber",
      "Mobile Development",
      "Database",
    ],
  },
  {
    key: "keuangan",
    name: "Keuangan",
    emoji: "💰",
    topics: [
      "Investasi",
      "Perencanaan Keuangan",
      "Saham",
      "Reksa Dana",
      "Properti",
      "Budgeting",
      "Kebebasan Finansial",
      "Kripto",
      "Asuransi",
      "Pajak",
    ],
  },
  {
    key: "psikologi",
    name: "Psikologi",
    emoji: "🧠",
    topics: [
      "Psikologi Perilaku",
      "Bias Kognitif",
      "Mindset",
      "Resiliensi",
      "Stoikisme",
      "Kesadaran Diri",
      "Hubungan Interpersonal",
      "Motivasi",
      "Kebahagiaan",
      "Emosi",
    ],
  },
  {
    key: "komunikasi",
    name: "Komunikasi",
    emoji: "🗣️",
    topics: [
      "Public Speaking",
      "Komunikasi Efektif",
      "Storytelling",
      "Menulis",
      "Persuasi",
      "Presentasi",
      "Empati",
      "Komunikasi Nonverbal",
      "Negosiasi",
      "Bahasa Inggris",
    ],
  },
  {
    key: "kesehatan",
    name: "Kesehatan",
    emoji: "🌿",
    topics: [
      "Nutrisi",
      "Olahraga",
      "Tidur",
      "Manajemen Stres",
      "Meditasi",
      "Mindfulness",
      "Kesehatan Mental",
      "Biohacking",
      "Yoga",
      "Kebugaran",
    ],
  },
];

// Flat list semua topik — digunakan untuk validasi kustom di TagPicker
export const ALL_TOPICS: string[] = TOPIC_CATEGORIES.flatMap((c) => c.topics);
